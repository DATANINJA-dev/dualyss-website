# Dependency Resolution Patterns

Constraint evaluation and conflict resolution for framework dependencies.

## Dependency Types

### Framework → Project Dependencies

The framework depends on the target project having certain capabilities:

```yaml
# Framework requirements
framework_dependencies:
  required:
    - git: ">=2.0.0"        # Git for sync operations
    - claude_code: ">=1.0"  # Claude Code CLI

  optional:
    - node: ">=18.0.0"      # For JS-based projects
    - python: ">=3.9"       # For Python-based projects
```

### Plugin → Framework Dependencies

Plugins depend on specific framework versions:

```yaml
# Plugin manifest (plugin.json)
dependencies:
  simon_tools: "^0.30.0"    # Requires framework 0.30+

  # Plugin-specific
  required_skills:
    - "tdd-workflow"        # Skill must exist
    - "error-handling"      # Skill must exist
```

### Skill → MCP Dependencies

Skills may require specific MCP servers:

```yaml
# Skill dependencies
skill_dependencies:
  serena:                   # Serena MCP required
    required: true
    reason: "Semantic code analysis"

  github:                   # GitHub MCP optional
    required: false
    reason: "PR integration features"
```

---

## Constraint Syntax

Framework uses npm-style version constraints:

### Caret (^) - Compatible Changes

```
^1.2.3  →  >=1.2.3 <2.0.0   # Major version locked
^0.2.3  →  >=0.2.3 <0.3.0   # Minor version locked (0.x special case)
^0.0.3  →  >=0.0.3 <0.0.4   # Patch version locked (0.0.x special case)
```

### Tilde (~) - Patch Changes Only

```
~1.2.3  →  >=1.2.3 <1.3.0   # Only patch updates
~1.2    →  >=1.2.0 <1.3.0   # Same as above
~1      →  >=1.0.0 <2.0.0   # Minor updates allowed
```

### Range Constraints

```
>=1.0.0           # At least 1.0.0
<2.0.0            # Less than 2.0.0
>=1.0.0 <2.0.0    # Combined range
1.0.0 - 2.0.0     # Hyphen range (inclusive)
```

### X-Ranges (Wildcards)

```
*       →  >=0.0.0          # Any version
1.x     →  >=1.0.0 <2.0.0   # Any 1.x version
1.2.x   →  >=1.2.0 <1.3.0   # Any 1.2.x version
```

Reference: `version-compatibility-management/semver-patterns.md` for implementation

---

## Resolution Algorithm

### Satisfiability Check

```javascript
function satisfies(version, constraint) {
  // Parse constraint into range
  const range = parseConstraint(constraint);

  // Parse version
  const v = parseVersion(version);

  // Check if version falls within range
  return v >= range.min && v < range.max;
}

// Example usage
satisfies("0.31.0", "^0.30.0")  // true
satisfies("1.0.0", "^0.30.0")   // false (major bump)
satisfies("0.29.0", "^0.30.0")  // false (too old)
```

### Conflict Detection

```javascript
function detectConflicts(constraints) {
  const conflicts = [];

  for (let i = 0; i < constraints.length; i++) {
    for (let j = i + 1; j < constraints.length; j++) {
      const rangeA = parseConstraint(constraints[i]);
      const rangeB = parseConstraint(constraints[j]);

      // Check if ranges overlap
      if (!rangesOverlap(rangeA, rangeB)) {
        conflicts.push({
          a: constraints[i],
          b: constraints[j],
          reason: "Non-overlapping version ranges"
        });
      }
    }
  }

  return conflicts;
}
```

### Resolution Strategies

When conflicts are detected:

| Strategy | When to Use | Risk |
|----------|-------------|------|
| **Upgrade All** | All dependents support newer version | Low |
| **Downgrade** | Newer version has issues | Medium |
| **Fork** | Incompatible requirements | High |
| **Override** | Testing/development only | High |

---

## Common Scenarios

### Scenario 1: Multiple Constraints on Same Package

```yaml
# Plugin A requires
simon_tools: "^0.30.0"

# Plugin B requires
simon_tools: "^0.25.0"

# Resolution: Find intersection
# ^0.30.0 → >=0.30.0 <0.31.0
# ^0.25.0 → >=0.25.0 <0.26.0
#
# NO OVERLAP - Conflict!

Resolution options:
1. Update Plugin B to support ^0.30.0
2. Downgrade to 0.25.x (lose Plugin A features)
3. Wait for compatible versions
```

### Scenario 2: Conflicting Requirements

```yaml
# Skill A requires
serena_mcp: "required"

# Skill B requires
serena_mcp: "not installed"  # Can't work with Serena

# Resolution: Mutual exclusion
# Cannot use both skills simultaneously
```

### Scenario 3: Optional Dependencies

```yaml
# Skill has optional dependency
dependencies:
  github_mcp:
    required: false
    features_when_present:
      - "PR integration"
      - "Issue tracking"

# Resolution: Graceful degradation
# Skill works without GitHub MCP
# Extra features enabled when present
```

### Scenario 4: Transitive Dependencies

```yaml
# Plugin A → Skill B → MCP C
# Plugin A doesn't directly need MCP C
# But Skill B does

# Resolution: Satisfy entire chain
# Installing Plugin A must also ensure MCP C available
```

---

## Dependency Resolution Workflow

### Pre-Installation Check

```bash
# Before installing plugin/skill
/dependency-check plugin-name

Output:
Checking dependencies for: plugin-name

Direct dependencies:
  ✓ simon_tools ^0.30.0 (installed: 0.31.0)
  ✓ tdd-workflow skill (present)

Transitive dependencies:
  ✓ serena MCP (configured)
  ⚠ github MCP (optional, not configured)

Conflicts: None
Status: INSTALLABLE
```

### Conflict Resolution Flow

```
Conflict detected
    │
    ├─ Can all dependents upgrade?
    │   └─ YES → Upgrade to latest compatible
    │
    ├─ Can we downgrade safely?
    │   └─ YES → Downgrade + document limitation
    │
    ├─ Is override acceptable?
    │   └─ YES (dev only) → Force install with warning
    │
    └─ None work?
        └─ Block installation, report conflict
```

---

## Error Codes

Dependency resolution uses error codes in the E420-E433 range:

| Code | Message | Resolution |
|------|---------|------------|
| E422 | Version incompatibility detected | Check version constraints |
| E426 | Dependency not found | Install missing dependency |
| E427 | Circular dependency detected | Refactor dependency graph |
| E428 | Constraint unsatisfiable | Relax or update constraints |
| E429 | Transitive conflict | Resolve upstream dependency |

### Error Examples

```bash
# E422: Version incompatibility
[ERROR] E422: Version incompatibility detected

Current: simon_tools 0.25.0
Required: simon_tools ^0.30.0 (by plugin-xyz)

Resolution:
  1. Upgrade framework: /sync-pull
  2. Or use older plugin version: plugin-xyz@0.5.0

# E428: Unsatisfiable constraint
[ERROR] E428: Constraint unsatisfiable

Plugin A requires: simon_tools ^0.30.0
Plugin B requires: simon_tools <0.30.0

These constraints cannot be satisfied simultaneously.

Resolution:
  1. Contact Plugin B maintainer for update
  2. Or remove one of the plugins
```

---

## Constraint Evaluation Examples

### Example 1: Simple Caret

```
Constraint: ^0.30.0
Version: 0.31.5

Parse: ^0.30.0 → >=0.30.0 <0.31.0
Check: 0.31.5 >= 0.30.0? YES
Check: 0.31.5 < 0.31.0? NO

Result: NOT SATISFIED (0.31.5 exceeds minor)
```

Wait, let me correct that - for 0.x versions:

```
Constraint: ^0.30.0
Version: 0.31.5

For 0.x versions, caret locks minor:
Parse: ^0.30.0 → >=0.30.0 <0.31.0
Check: 0.31.5 >= 0.30.0? YES
Check: 0.31.5 < 0.31.0? NO

Result: NOT SATISFIED
```

### Example 2: Multiple Constraints

```
Constraint A: ^0.30.0 → >=0.30.0 <0.31.0
Constraint B: >=0.28.0 → >=0.28.0

Intersection: >=0.30.0 <0.31.0
Valid versions: 0.30.0, 0.30.1, 0.30.2, ...
```

### Example 3: Pre-release Handling

```
Constraint: ^0.30.0
Version: 0.30.1-beta.1

Pre-releases only match if explicitly requested:
^0.30.0 does NOT match 0.30.1-beta.1
^0.30.0-0 DOES match 0.30.1-beta.1
```

---

## Quick Reference

### Constraint Cheat Sheet

| Constraint | Matches | Doesn't Match |
|------------|---------|---------------|
| `^0.30.0` | 0.30.x | 0.29.x, 0.31.x |
| `~0.30.0` | 0.30.x | 0.29.x, 0.31.x |
| `>=0.30.0` | 0.30.0+ | 0.29.x |
| `0.30.x` | 0.30.0-0.30.∞ | anything else |
| `*` | anything | nothing |

### Resolution Priority

```
1. Exact version match (highest priority)
2. Latest compatible version
3. Oldest compatible version (most stable)
4. Manual override (lowest priority)
```

## Related Files

| File | Purpose |
|------|---------|
| `version-compatibility-management/semver-patterns.md` | Parsing implementation |
| `version-compatibility-management/compatibility-matrix.md` | Constraint examples |
| `upgrade-paths.md` | Handling version changes |
| `SKILL.md` | Error code reference |
