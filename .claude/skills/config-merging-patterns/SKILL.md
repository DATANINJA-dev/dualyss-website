---
name: config-merging-patterns
description: |
  Provides patterns for merging configuration files in framework sync context.
  Auto-activates when handling CLAUDE.md section parsing, .mcp.json merge,
  or three-way conflict resolution.

  Type: passive (reference patterns for merge operations)
---

# Config Merging Patterns Skill

This skill provides foundational patterns for merging configuration files during framework synchronization. It covers CLAUDE.md section detection, .mcp.json deep merge, and three-way conflict resolution algorithms.

## When This Skill Activates

- Implementing CLAUDE.md section detection or parsing
- Handling .mcp.json base+local merge operations
- Detecting or resolving three-way merge conflicts
- User mentions "config merge", "section parsing", "LOCAL markers"
- Working on EPIC-010 Configuration & Installation tasks (TASK-088, TASK-089, TASK-090)
- Implementing sync commands that modify configuration files

## Core Principles

### 1. Preserve Local Customizations

Never lose user's project-specific configuration during sync operations:

```
Rule: LOCAL sections are NEVER overwritten by framework updates
Exception: Only user-initiated explicit overwrite
```

### 2. Clear Section Boundaries

Explicit markers distinguish framework content from local content:

```markdown
## Framework Section     <!-- Synced with hub -->

<!-- LOCAL_START -->
## My Custom Notes       <!-- Never synced -->
<!-- LOCAL_END -->
```

### 3. Deep Merge for JSON

Recursive merge preserves nested structure from both sources:

```json
// Base: { "a": { "x": 1 } }
// Local: { "a": { "y": 2 }, "b": 3 }
// Result: { "a": { "x": 1, "y": 2 }, "b": 3 }
```

### 4. Three-Way Merge with Conflict Detection

Based on common ancestor, auto-merge non-overlapping changes:

```
BASE (common ancestor)
  ├── LOCAL (target project changes)
  └── REMOTE (hub changes)
      ↓
MERGED (auto-merge if no conflicts)
```

### 5. Fail Safely

When conflicts detected, report clearly and block automatic merge:

```
Rule: If conflict detected → report + block
Never: Silently overwrite conflicting changes
```

### 6. Reversible Operations

Always track merge source for debugging and rollback:

```yaml
merge_metadata:
  base_version: "0.29.0"
  local_version: "0.30.0-custom"
  remote_version: "0.30.0"
  merge_timestamp: "2026-01-10T14:30:00Z"
```

## Quick Reference

| Operation | Pattern | When to Use |
|-----------|---------|-------------|
| Parse CLAUDE.md sections | Detect `<!-- LOCAL_START/END -->` markers | Extract sections to preserve |
| Classify metadata fields | Framework vs local field patterns | Determine which fields sync |
| Deep merge JSON | Recursive merge with collision detection | Merge .mcp.json configs |
| Three-way merge | Compare base→local, base→remote diffs | Resolve sync conflicts |
| Detect conflicts | Identify overlapping changes | Report merge impediments |

## Supporting Files

- `section-parsing.md` - CLAUDE.md section detection, markers, regex patterns
- `mcp-merge.md` - JSON deep merge algorithm with collision handling
- `three-way-merge.md` - Conflict resolution algorithm and strategies

## Integration Points

### EPIC-010 Tasks Using This Skill

| Task | Usage |
|------|-------|
| TASK-088 | Implements CLAUDE.md parser using `section-parsing.md` patterns |
| TASK-089 | Implements .mcp.json merge using `mcp-merge.md` patterns |
| TASK-090 | Implements three-way merge using `three-way-merge.md` algorithm |
| TASK-094 | Conflict resolution UI uses conflict markers from this skill |

### Related Skills

- `git-sync-patterns` (EPIC-009) - Uses three-way merge for detecting sync conflicts
- `version-compatibility-management` (TASK-073) - Version metadata preserved during section parsing

## Constraints

- **Markers required** - CLAUDE.md must have `<!-- LOCAL_START/END -->` for local sections
- **JSON validation** - Merged .mcp.json must be valid JSON before output
- **No force overwrite** - Conflicts block merge until explicit user resolution
- **Section order** - Framework sections maintain position, local sections preserve their position
- **Metadata preservation** - `simon_tools_meta` fields separated into framework vs local

## Sources

This skill synthesizes patterns from authoritative configuration management documentation:

1. **RFC 7396 - JSON Merge Patch**
   - URL: https://tools.ietf.org/html/rfc7396
   - Authority: IETF Standards Track
   - Used for: Deep merge semantics for JSON objects

2. **Git Three-Way Merge Documentation**
   - URL: https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging
   - Authority: Official Git documentation
   - Used for: Three-way merge algorithm, conflict detection patterns

3. **CommonMark Specification - HTML Blocks**
   - URL: https://spec.commonmark.org/0.30/#html-blocks
   - Authority: Official markdown specification
   - Used for: HTML comment parsing in markdown files
