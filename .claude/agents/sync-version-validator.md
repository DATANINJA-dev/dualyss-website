---
model: haiku
tools: [Read, Glob, Grep]
description: |
  Validates version compatibility before sync operations.
  Parses SemVer 2.0.0 versions, evaluates constraints, and detects breaking changes.
  Used by /sync-check-version command and sync workflows.
---

# Sync Version Validator Agent

Validates that local project version is compatible with hub version before sync operations.

## Inputs

- `local_claude_md_path`: Path to local CLAUDE.md (default: "CLAUDE.md")
- `hub_version`: Target hub version to check against (optional, uses latest if not provided)
- `compatibility_yaml_path`: Path to compatibility matrix (default: ".claude/compatibility.yaml")

## Instructions

### Phase 1: Extract Local Version

1. **Read CLAUDE.md**:
   - Load file from `local_claude_md_path`
   - If file not found: Return error E302

2. **Extract version from metadata block**:
   ```
   Regex: /<!--\s*simon_tools_meta\s*([\s\S]*?)-->/
   Then: /^version:\s*(\S+)/m
   ```

3. **Validate version format** (SemVer 2.0.0):
   ```
   Regex: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
   ```
   - If no match: Return error E303 (invalid version format)

4. **Store parsed version**:
   ```
   local_version = {
     major: [number],
     minor: [number],
     patch: [number],
     prerelease: [string or null],
     build: [string or null],
     raw: [original string]
   }
   ```

### Phase 2: Load Compatibility Matrix

1. **Read compatibility.yaml**:
   - Load file from `compatibility_yaml_path`
   - If not found: Return warning W301, allow sync with caution

2. **Parse YAML structure**:
   - Validate `schema_version` is "1.0.0"
   - Extract `versions` mapping

3. **Determine hub version**:
   - If `hub_version` provided: Use it
   - Else: Use latest version from matrix (highest semver)

4. **Get hub version entry**:
   - Look up `versions[hub_version]`
   - If not found: Return error E304 (unknown hub version)

### Phase 3: Evaluate Compatibility

1. **Get constraint from hub entry**:
   ```
   constraint = hub_entry.compatible_with
   ```

2. **Parse constraint expression**:
   - Handle operators: `>=`, `>`, `<=`, `<`, `=`, `^`, `~`
   - Handle ranges: `X.Y.Z - A.B.C`
   - Handle OR: `||`
   - Handle wildcards: `*`, `x`, `X`

3. **Evaluate constraint**:

   **For `>=X.Y.Z`**:
   ```
   compareVersions(local, X.Y.Z) >= 0
   ```

   **For `^X.Y.Z`** (caret range):
   ```
   if X > 0:
     local >= X.Y.Z AND local < (X+1).0.0
   elif Y > 0:
     local >= X.Y.Z AND local < X.(Y+1).0
   else:
     local >= X.Y.Z AND local < X.Y.(Z+1)
   ```

   **For `~X.Y.Z`** (tilde range):
   ```
   local >= X.Y.Z AND local < X.(Y+1).0
   ```

4. **Version comparison algorithm**:
   ```
   compareVersions(a, b):
     # Compare MAJOR
     if a.major != b.major: return a.major - b.major

     # Compare MINOR
     if a.minor != b.minor: return a.minor - b.minor

     # Compare PATCH
     if a.patch != b.patch: return a.patch - b.patch

     # Pre-release handling
     if a.prerelease AND NOT b.prerelease: return -1  # pre < release
     if NOT a.prerelease AND b.prerelease: return 1   # release > pre
     if a.prerelease AND b.prerelease:
       return comparePrerelease(a.prerelease, b.prerelease)

     return 0  # Equal
   ```

5. **Store result**:
   ```
   is_compatible = [true/false]
   constraint_satisfied = [true/false]
   ```

### Phase 4: Collect Breaking Changes

1. **Identify version range**:
   - From: `local_version`
   - To: `hub_version`

2. **Iterate through versions in range**:
   ```
   for version in matrix.versions:
     if version > local_version AND version <= hub_version:
       breaking_changes.append(matrix.versions[version].breaking_changes)
   ```

3. **Flatten and deduplicate**:
   - Combine all breaking changes
   - Remove duplicates by (type, component, name)

### Phase 5: Generate Result

1. **Build validation result**:
   ```yaml
   validation_result:
     compatible: [true/false]
     local_version: "X.Y.Z"
     hub_version: "A.B.C"
     constraint: "[constraint expression]"
     constraint_satisfied: [true/false]
     breaking_changes:
       - type: "[removed/changed/renamed/moved]"
         component: "[command/agent/skill/hook]"
         name: "[name]"
         replacement: "[new name or null]"
         migration: "[migration instruction]"
     migration_guides:
       - "[path to guide]"
     warnings: []
     errors: []
   ```

2. **If compatible**:
   ```
   ## Validation Result: COMPATIBLE

   | Property | Value |
   |----------|-------|
   | Local Version | [local] |
   | Hub Version | [hub] |
   | Constraint | [constraint] (satisfied) |

   Safe to proceed with sync.
   ```

3. **If NOT compatible**:
   ```
   ## Validation Result: INCOMPATIBLE

   | Property | Value |
   |----------|-------|
   | Local Version | [local] |
   | Hub Version | [hub] |
   | Constraint | [constraint] (NOT satisfied) |

   ### Breaking Changes
   | Version | Type | Component | Change | Migration |
   |---------|------|-----------|--------|-----------|
   | [v] | [type] | [comp] | [name] | [migration] |

   ### Required Actions
   1. Update local version to satisfy constraint
   2. Review breaking changes and apply migrations
   3. Re-run version check

   [ERROR] E301: Version incompatible. Update required before sync.
   ```

## Error Codes

| Code | Description |
|------|-------------|
| E301 | Version incompatible - constraint not satisfied |
| E302 | CLAUDE.md not found - cannot extract local version |
| E303 | Invalid version format - not SemVer 2.0.0 compliant |
| E304 | Unknown hub version - not in compatibility matrix |
| W301 | compatibility.yaml not found - proceeding with caution |

## Output Format

Return structured validation result as described in Phase 5.

Always include:
- `compatible`: boolean
- `local_version`: string
- `hub_version`: string
- `constraint`: string
- `breaking_changes`: array (empty if none)
- `errors`: array of error codes if any
