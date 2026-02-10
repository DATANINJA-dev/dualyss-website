# Merge Algorithm Implementation

Executable three-way merge algorithm for JSON/YAML configuration files. Implements the patterns from `three-way-merge.md` with full pseudocode and edge case handling.

## Quick Reference

| Function | Purpose | Returns |
|----------|---------|---------|
| `diffFromBase(base, current)` | Calculate changes between versions | `Change[]` |
| `threeWayMerge(base, local, remote)` | Main merge algorithm | `MergeResult` |
| `applyChange(target, change)` | Apply single change | `void` |
| `hasCircularRef(obj)` | Detect circular references | `boolean` |
| `deepEqual(a, b)` | Deep equality check | `boolean` |

## Data Types

### Change Type

```typescript
type ChangeType = 'ADDED' | 'MODIFIED' | 'DELETED' | 'UNCHANGED';

interface Change {
  type: ChangeType;
  key: string;
  path: string;              // Full JSON path (e.g., "$.config.timeout")
  baseValue: any | null;     // null if ADDED
  newValue: any | null;      // null if DELETED
}
```

### Conflict Type

```typescript
type ConflictType =
  | 'modify_modify'    // Both sides modified same key differently
  | 'add_add'          // Both sides added same key with different values
  | 'delete_modify'    // Local deleted, remote modified
  | 'modify_delete'    // Local modified, remote deleted
  | 'type_mismatch';   // Same key has different types

type Severity = 'HIGH' | 'MEDIUM';

interface Conflict {
  key: string;
  path: string;
  base: any | null;
  local: any | null;
  remote: any | null;
  localType: ChangeType;
  remoteType: ChangeType;
  conflictType: ConflictType;
  severity: Severity;
}
```

### Merge Result

```typescript
interface AutoMerged {
  key: string;
  path: string;
  source: 'local' | 'remote' | 'both_identical';
  type: ChangeType;
  value: any;
}

interface MergeResult {
  merged: any;                // The merged result object
  conflicts: Conflict[];      // Conflicts requiring resolution
  autoMerged: AutoMerged[];   // Successfully auto-merged changes
  hasConflicts: boolean;      // Quick check for conflicts
  stats: {
    totalChanges: number;
    autoResolved: number;
    conflicts: number;
  };
}
```

## Core Functions

### 1. deepEqual(a, b)

Deep equality comparison for JSON values.

```
function deepEqual(a, b):
  // Handle primitives and null
  if a === b:
    return true

  if a === null OR b === null:
    return false

  if typeof(a) !== typeof(b):
    return false

  // Handle arrays
  if isArray(a):
    if NOT isArray(b):
      return false
    if a.length !== b.length:
      return false
    for i from 0 to a.length - 1:
      if NOT deepEqual(a[i], b[i]):
        return false
    return true

  // Handle objects
  if typeof(a) === 'object':
    keysA = Object.keys(a)
    keysB = Object.keys(b)

    if keysA.length !== keysB.length:
      return false

    for key in keysA:
      if key NOT in b:
        return false
      if NOT deepEqual(a[key], b[key]):
        return false

    return true

  // Primitives that didn't match ===
  return false
```

### 2. hasCircularRef(obj, seen)

Detect circular references before merge to prevent infinite loops.

```
function hasCircularRef(obj, seen = new Set()):
  // Non-objects can't have circular refs
  if obj === null OR typeof(obj) !== 'object':
    return false

  // Check if we've seen this object reference before
  if seen.has(obj):
    return true

  // Add current object to seen set
  seen.add(obj)

  // Check all values recursively
  if isArray(obj):
    for item in obj:
      if hasCircularRef(item, seen):
        return true
  else:
    for value in Object.values(obj):
      if hasCircularRef(value, seen):
        return true

  // Remove from seen (backtrack for other paths)
  seen.delete(obj)
  return false
```

### 3. deepCopy(obj)

Create a deep copy of an object (for result initialization).

```
function deepCopy(obj):
  if obj === null OR typeof(obj) !== 'object':
    return obj

  if isArray(obj):
    return obj.map(item => deepCopy(item))

  result = {}
  for key in Object.keys(obj):
    result[key] = deepCopy(obj[key])

  return result
```

### 4. diffFromBase(base, current, path)

Calculate what changed between base and current version.

```
function diffFromBase(base, current, path = "$"):
  changes = []

  // Handle null/undefined base (everything is ADDED)
  if base === null OR base === undefined:
    if current !== null AND current !== undefined:
      if typeof(current) === 'object' AND NOT isArray(current):
        for key in Object.keys(current):
          changes.push({
            type: "ADDED",
            key: key,
            path: path + "." + key,
            baseValue: null,
            newValue: current[key]
          })
      else:
        changes.push({
          type: "ADDED",
          key: path,
          path: path,
          baseValue: null,
          newValue: current
        })
    return changes

  // Handle null/undefined current (everything is DELETED)
  if current === null OR current === undefined:
    if typeof(base) === 'object' AND NOT isArray(base):
      for key in Object.keys(base):
        changes.push({
          type: "DELETED",
          key: key,
          path: path + "." + key,
          baseValue: base[key],
          newValue: null
        })
    else:
      changes.push({
        type: "DELETED",
        key: path,
        path: path,
        baseValue: base,
        newValue: null
      })
    return changes

  // Handle type mismatch (treat as MODIFIED at current path)
  if typeof(base) !== typeof(current) OR isArray(base) !== isArray(current):
    changes.push({
      type: "MODIFIED",
      key: path.split('.').pop(),
      path: path,
      baseValue: base,
      newValue: current
    })
    return changes

  // Handle arrays (RFC 7396: arrays are atomic, not merged)
  if isArray(base):
    if NOT deepEqual(base, current):
      changes.push({
        type: "MODIFIED",
        key: path.split('.').pop(),
        path: path,
        baseValue: base,
        newValue: current
      })
    return changes

  // Handle primitives
  if typeof(base) !== 'object':
    if base !== current:
      changes.push({
        type: "MODIFIED",
        key: path.split('.').pop(),
        path: path,
        baseValue: base,
        newValue: current
      })
    return changes

  // Handle objects - compare key by key
  allKeys = new Set([...Object.keys(base), ...Object.keys(current)])

  for key in allKeys:
    keyPath = path + "." + key
    inBase = key in base
    inCurrent = key in current

    if inBase AND NOT inCurrent:
      // Key deleted
      changes.push({
        type: "DELETED",
        key: key,
        path: keyPath,
        baseValue: base[key],
        newValue: null
      })

    else if NOT inBase AND inCurrent:
      // Key added
      changes.push({
        type: "ADDED",
        key: key,
        path: keyPath,
        baseValue: null,
        newValue: current[key]
      })

    else if inBase AND inCurrent:
      // Key exists in both - check for modifications
      if typeof(base[key]) === 'object' AND typeof(current[key]) === 'object':
        if NOT isArray(base[key]) AND NOT isArray(current[key]):
          // Recurse into nested objects
          nestedChanges = diffFromBase(base[key], current[key], keyPath)
          changes = changes.concat(nestedChanges)
        else if NOT deepEqual(base[key], current[key]):
          // Arrays changed (atomic)
          changes.push({
            type: "MODIFIED",
            key: key,
            path: keyPath,
            baseValue: base[key],
            newValue: current[key]
          })
      else if NOT deepEqual(base[key], current[key]):
        // Primitive changed
        changes.push({
          type: "MODIFIED",
          key: key,
          path: keyPath,
          baseValue: base[key],
          newValue: current[key]
        })

  return changes
```

### 5. applyChange(target, change)

Apply a single change to the target object.

```
function applyChange(target, change):
  // Parse path to get parent and key
  pathParts = change.path.split('.')
  pathParts.shift()  // Remove leading "$"

  if pathParts.length === 0:
    return  // Root-level change, handle differently

  // Navigate to parent
  parent = target
  for i from 0 to pathParts.length - 2:
    part = pathParts[i]
    if part NOT in parent:
      parent[part] = {}
    parent = parent[part]

  finalKey = pathParts[pathParts.length - 1]

  switch change.type:
    case "ADDED":
    case "MODIFIED":
      parent[finalKey] = deepCopy(change.newValue)
      break

    case "DELETED":
      delete parent[finalKey]
      break
```

### 6. classifyConflict(localChange, remoteChange)

Determine conflict type and severity.

```
function classifyConflict(localChange, remoteChange):
  localType = localChange.type
  remoteType = remoteChange.type

  // Check for type mismatch
  if typeof(localChange.newValue) !== typeof(remoteChange.newValue):
    if localChange.newValue !== null AND remoteChange.newValue !== null:
      return { type: "type_mismatch", severity: "HIGH" }

  // Classify based on change types
  if localType === "MODIFIED" AND remoteType === "MODIFIED":
    return { type: "modify_modify", severity: "HIGH" }

  if localType === "ADDED" AND remoteType === "ADDED":
    return { type: "add_add", severity: "MEDIUM" }

  if localType === "DELETED" AND remoteType === "MODIFIED":
    return { type: "delete_modify", severity: "HIGH" }

  if localType === "MODIFIED" AND remoteType === "DELETED":
    return { type: "modify_delete", severity: "HIGH" }

  // Fallback (shouldn't reach here normally)
  return { type: "modify_modify", severity: "HIGH" }
```

### 7. threeWayMerge(base, local, remote)

Main three-way merge algorithm.

```
function threeWayMerge(base, local, remote):
  // Pre-flight checks
  if base === null AND local === null AND remote === null:
    return {
      merged: {},
      conflicts: [],
      autoMerged: [],
      hasConflicts: false,
      stats: { totalChanges: 0, autoResolved: 0, conflicts: 0 }
    }

  // Check for circular references
  if hasCircularRef(base):
    throw Error("E415: Circular reference detected in base")
  if hasCircularRef(local):
    throw Error("E415: Circular reference detected in local")
  if hasCircularRef(remote):
    throw Error("E415: Circular reference detected in remote")

  // Calculate deltas
  localChanges = diffFromBase(base, local)
  remoteChanges = diffFromBase(base, remote)

  // Build lookup maps for quick conflict detection
  localChangeMap = {}
  for change in localChanges:
    localChangeMap[change.path] = change

  remoteChangeMap = {}
  for change in remoteChanges:
    remoteChangeMap[change.path] = change

  // Initialize result from base (or empty if no base)
  result = base !== null ? deepCopy(base) : {}
  conflicts = []
  autoMerged = []

  // Process local changes
  for localChange in localChanges:
    remoteChange = remoteChangeMap[localChange.path]

    if remoteChange === undefined:
      // Only local changed - auto-merge
      applyChange(result, localChange)
      autoMerged.push({
        key: localChange.key,
        path: localChange.path,
        source: "local",
        type: localChange.type,
        value: localChange.newValue
      })

    else if deepEqual(localChange.newValue, remoteChange.newValue):
      // Both made identical change - apply once
      applyChange(result, localChange)
      autoMerged.push({
        key: localChange.key,
        path: localChange.path,
        source: "both_identical",
        type: localChange.type,
        value: localChange.newValue
      })

    else:
      // Conflict: different changes to same path
      classification = classifyConflict(localChange, remoteChange)
      conflicts.push({
        key: localChange.key,
        path: localChange.path,
        base: localChange.baseValue,
        local: localChange.newValue,
        remote: remoteChange.newValue,
        localType: localChange.type,
        remoteType: remoteChange.type,
        conflictType: classification.type,
        severity: classification.severity
      })

  // Process remote-only changes
  for remoteChange in remoteChanges:
    if localChangeMap[remoteChange.path] === undefined:
      // Only remote changed - auto-merge
      applyChange(result, remoteChange)
      autoMerged.push({
        key: remoteChange.key,
        path: remoteChange.path,
        source: "remote",
        type: remoteChange.type,
        value: remoteChange.newValue
      })

  totalChanges = localChanges.length + remoteChanges.length

  return {
    merged: result,
    conflicts: conflicts,
    autoMerged: autoMerged,
    hasConflicts: conflicts.length > 0,
    stats: {
      totalChanges: totalChanges,
      autoResolved: autoMerged.length,
      conflicts: conflicts.length
    }
  }
```

## Usage Examples

### Example 1: No Conflicts (Independent Changes)

```javascript
base = { version: "0.29.0", port: 3000 }
local = { version: "0.29.0", port: 3000, ssl: true }      // Added ssl
remote = { version: "0.30.0", port: 3000 }                // Updated version

result = threeWayMerge(base, local, remote)

// result.merged = { version: "0.30.0", port: 3000, ssl: true }
// result.hasConflicts = false
// result.autoMerged = [
//   { key: "ssl", source: "local", type: "ADDED" },
//   { key: "version", source: "remote", type: "MODIFIED" }
// ]
```

### Example 2: Conflict (Same Key Modified)

```javascript
base = { timeout: 5000 }
local = { timeout: 10000 }    // User increased
remote = { timeout: 3000 }    // Hub decreased

result = threeWayMerge(base, local, remote)

// result.hasConflicts = true
// result.conflicts = [{
//   key: "timeout",
//   path: "$.timeout",
//   base: 5000,
//   local: 10000,
//   remote: 3000,
//   conflictType: "modify_modify",
//   severity: "HIGH"
// }]
```

### Example 3: Identical Changes (No Conflict)

```javascript
base = { version: "0.29.0" }
local = { version: "0.30.0" }
remote = { version: "0.30.0" }

result = threeWayMerge(base, local, remote)

// result.hasConflicts = false
// result.merged = { version: "0.30.0" }
// result.autoMerged = [
//   { key: "version", source: "both_identical", type: "MODIFIED" }
// ]
```

### Example 4: Delete vs Modify (Conflict)

```javascript
base = { feature: { enabled: false } }
local = {}                                    // Deleted feature
remote = { feature: { enabled: true } }       // Enabled feature

result = threeWayMerge(base, local, remote)

// result.hasConflicts = true
// result.conflicts = [{
//   key: "feature",
//   base: { enabled: false },
//   local: null,
//   remote: { enabled: true },
//   conflictType: "delete_modify",
//   severity: "HIGH"
// }]
```

### Example 5: Nested Object Merge

```javascript
base = {
  config: { a: 1, b: 2, c: 3 }
}
local = {
  config: { a: 10, b: 2, c: 3 }    // Changed a
}
remote = {
  config: { a: 1, b: 2, c: 30 }    // Changed c
}

result = threeWayMerge(base, local, remote)

// result.hasConflicts = false
// result.merged = { config: { a: 10, b: 2, c: 30 } }
// result.autoMerged = [
//   { path: "$.config.a", source: "local" },
//   { path: "$.config.c", source: "remote" }
// ]
```

## Error Handling

### Error Codes

| Code | Error | Handling |
|------|-------|----------|
| E412 | Missing BASE version | Fall back to two-way, warn user |
| E413 | Corrupt BASE version | Require watermark reset |
| E414 | Type mismatch | Report as HIGH severity conflict |
| E415 | Circular reference | Abort merge, report location |

### Graceful Degradation

```
function safeThreeWayMerge(base, local, remote):
  try:
    // Validate inputs
    if base === null OR base === undefined:
      return {
        error: "E412",
        message: "Cannot three-way merge: no base version",
        suggestion: "Use /sync-pull (initial sync) or reset watermark"
      }

    // Attempt JSON parse if strings
    if typeof(base) === 'string':
      try:
        base = JSON.parse(base)
      catch:
        return { error: "E413", message: "Base version corrupted" }

    // Execute merge
    return threeWayMerge(base, local, remote)

  catch error:
    if error.message.startsWith("E415"):
      return { error: "E415", message: error.message }
    throw error
```

## Performance Considerations

### Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| diffFromBase | O(n) where n = total keys | O(n) for change list |
| threeWayMerge | O(n + m) where n,m = changes | O(n + m) |
| hasCircularRef | O(n) worst case | O(d) where d = depth |
| deepEqual | O(n) where n = total values | O(d) recursion depth |

### Recommendations

1. **Large files (>100KB)**: Consider streaming or chunked processing
2. **Deeply nested (>20 levels)**: Set recursion depth limit
3. **Many conflicts (>50)**: Paginate conflict display
4. **Performance target**: <1000ms for 500KB configs

### Recursion Depth Limit

```
MAX_DEPTH = 50

function diffFromBase(base, current, path = "$", depth = 0):
  if depth > MAX_DEPTH:
    throw Error("Maximum recursion depth exceeded at " + path)

  // ... rest of function with depth + 1 in recursive calls
```

## Integration Points

### With /sync-merge-preview

```
1. Load watermark from CLAUDE.md
2. Retrieve BASE from git: git show ${watermark}:${file}
3. Load LOCAL from current file
4. Load REMOTE from: git show origin/main:${file}
5. Call threeWayMerge(base, local, remote)
6. Format and display results
```

### With /sync-pull

```
Phase 1.5: Conflict Detection
  - Use threeWayMerge to preview
  - If hasConflicts: Block and show conflicts
  - If no conflicts: Show auto-merge preview, proceed

Phase 4.5: Apply Merge
  - If user approved auto-merge
  - Write merged result to file
```

### With TASK-094 (Conflict Resolution UI)

The `conflicts` array output matches the expected format for TASK-094's UI:

```json
{
  "conflicts": [
    {
      "key": "timeout",
      "path": "$.config.timeout",
      "base": 5000,
      "local": 10000,
      "remote": 3000,
      "conflictType": "modify_modify",
      "severity": "HIGH",
      "resolution": null
    }
  ]
}
```

Resolution options populate the `resolution` field:
- `"local"`: Use local value
- `"remote"`: Use remote value
- `"base"`: Keep base value
- `"manual"`: User-provided value
