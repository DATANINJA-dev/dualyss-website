# Merge Strategies by File Type

File-type specific merging strategies for bidirectional sync. Different file formats require different merge approaches to preserve structure and prevent corruption.

## JSON Files (.json)

### Strategy: RFC 7396 Deep Merge

JSON files use recursive key-by-key merging following RFC 7396 JSON Merge Patch semantics.

**Algorithm**:
```
For each key in both objects:
  If key exists only in LOCAL → keep local value
  If key exists only in REMOTE → accept remote value
  If key exists in both:
    If values are objects → recurse
    If values are arrays → REPLACE (not merge element-wise)
    If values differ → CONFLICT (if both changed from base)
    If values match → keep either (same)
```

**Important**: Arrays are replaced atomically, NOT merged element-wise.

```json
// BASE
{ "items": [1, 2, 3] }

// LOCAL
{ "items": [1, 2, 3, 4] }  // Added 4

// REMOTE
{ "items": [1, 2, 3, 5] }  // Added 5

// Result: CONFLICT (not [1,2,3,4,5])
// Arrays replaced wholesale, user must choose
```

### Example: .mcp.json Merge

```json
// BASE (.mcp.base.json)
{
  "mcpServers": {
    "serena": { "command": "serena", "args": [] },
    "github": { "command": "gh-mcp" }
  }
}

// LOCAL (.mcp.local.json)
{
  "mcpServers": {
    "custom-api": { "command": "my-api" }
  }
}

// MERGED (.mcp.json)
{
  "mcpServers": {
    "serena": { "command": "serena", "args": [] },
    "github": { "command": "gh-mcp" },
    "custom-api": { "command": "my-api" }
  }
}
```

### Removing Keys

Use explicit `null` to remove a key:

```json
// To remove "github" from merged result
// LOCAL:
{
  "mcpServers": {
    "github": null
  }
}
// Result: github server removed from merge
```

Reference: `config-merging-patterns/mcp-merge.md`

---

## YAML Files (.yaml, .yml)

### Strategy: Key-by-Key Merge

YAML files use similar key-by-key merging with awareness of YAML-specific features.

**Considerations**:
- Preserve comments where possible
- Maintain key ordering (when meaningful)
- Handle anchors and aliases carefully

**Algorithm**:
```
Parse YAML → Object representation
Apply JSON merge algorithm
Serialize back to YAML
```

### Example: route-registry.yaml Merge

```yaml
# BASE
routes:
  home:
    path: /
    component: Home

# LOCAL (added dashboard)
routes:
  home:
    path: /
    component: Home
  dashboard:
    path: /dashboard
    component: Dashboard

# REMOTE (added settings)
routes:
  home:
    path: /
    component: Home
  settings:
    path: /settings
    component: Settings

# MERGED (both additions)
routes:
  home:
    path: /
    component: Home
  dashboard:        # From LOCAL
    path: /dashboard
    component: Dashboard
  settings:         # From REMOTE
    path: /settings
    component: Settings
```

### YAML Comments

Comments are **not preserved** through merge. Consider:
- Keeping comments in separate documentation
- Using `# PRESERVED` marker for critical comments
- Accepting comment loss as trade-off for structural merge

---

## Markdown Files (.md)

### Strategy: Section-Aware Merge with LOCAL Markers

Markdown files require special handling due to:
- Prose content (not structured data)
- LOCAL section markers
- Frontmatter (YAML header)

**Three-Layer Approach**:

1. **Frontmatter** (YAML) → Key-by-key merge
2. **Framework sections** → Accept hub updates
3. **LOCAL sections** → Never touch

### LOCAL Markers

```markdown
## Framework Content

This section syncs with hub.

<!-- LOCAL_START -->
## My Custom Notes

This content is NEVER modified by sync.
Put project-specific documentation here.
<!-- LOCAL_END -->

## More Framework Content

This also syncs.
```

**Rules**:
- Content between `<!-- LOCAL_START -->` and `<!-- LOCAL_END -->` is preserved
- LOCAL sections maintain their position in the document
- Nested LOCAL markers are not supported (Error E401)

### Frontmatter Handling

```yaml
---
# Framework fields (synced)
id: EPIC-001
version: "0.31.0"

# Local fields (preserved)
local_notes: "My project context"
---
```

Field classification:
- Framework fields: `id`, `version`, `type`, `status`, `created`
- Local fields: Custom fields, `local_*` prefix, `customized_files`

Reference: `config-merging-patterns/section-parsing.md`

### Example: CLAUDE.md Merge

```markdown
<!-- BASE -->
# Framework v0.29.0
[framework content]

<!-- LOCAL (user added section) -->
# Framework v0.29.0
[framework content]

<!-- LOCAL_START -->
## My Project Notes
Custom documentation for this project.
<!-- LOCAL_END -->

<!-- REMOTE (hub updated version) -->
# Framework v0.30.0
[updated framework content]

<!-- MERGED -->
# Framework v0.30.0           ← Updated from hub
[updated framework content]   ← Updated from hub

<!-- LOCAL_START -->
## My Project Notes           ← Preserved exactly
Custom documentation for this project.
<!-- LOCAL_END -->
```

---

## Special Cases

### .mcp.json (Three-Level Merge)

MCP configuration uses a unique three-level merge:

```
Priority (lowest to highest):
1. .mcp.base.json (framework, tracked)
2. ~/.claude/.mcp.json (user, global)
3. .mcp.local.json (project, git-ignored)

Higher priority wins on collision.
```

**Command**: `/sync-mcp-merge`

**Collision Handling**:
```
If same server name in multiple levels:
  - Higher priority wins
  - Warning logged
  - Lower priority version ignored
```

Reference: `config-merging-patterns/mcp-merge.md`

### CLAUDE.md (Section Parser)

CLAUDE.md has structured sections that require special parsing:

```markdown
<!-- simon_tools_meta
version: 0.30.0
sync_watermark: abc123
-->

# Framework Name

## Framework Section
[Managed by hub]

<!-- LOCAL_START -->
## Project-Specific
[Never synced]
<!-- LOCAL_END -->
```

**Parser Rules**:
1. Extract `simon_tools_meta` comment block
2. Parse version and watermark
3. Identify LOCAL sections
4. Merge non-LOCAL content from hub
5. Preserve LOCAL sections in place

Reference: `config-merging-patterns/section-parsing.md`

### compatibility.yaml (Version Constraints)

Version compatibility file has special merge rules:

```yaml
# Versions should always accept hub updates
versions:
  minimum: "0.25.0"  # Accept hub update
  current: "0.30.0"  # Accept hub update

# Constraints accumulate (union)
constraints:
  - version: "^0.30.0"  # Hub constraint
  - version: ">=0.25.0"  # Local constraint (both kept)
```

---

## Binary Files

### Strategy: No Merge (Choice Required)

Binary files cannot be merged. User must choose:

```
Conflict: .claude/assets/logo.png
Type: Binary file

Options:
  [K] Keep HUB version
  [L] Keep LOCAL version
  [B] Keep BOTH (rename one)

Cannot auto-merge binary files.
```

**Best Practice**: Avoid binary files in sync scope when possible.

---

## Unknown File Types

### Strategy: Conservative (Block)

For unknown file types:

```
Conflict: .claude/custom/mystery.xyz
Type: Unknown format

Cannot determine merge strategy.

Options:
  [K] Keep HUB version
  [L] Keep LOCAL version
  [M] Manual merge (open in editor)

Proceeding with caution.
```

---

## Merge Tool Integration

### Three-Way Merge Command

Use `/sync-merge-preview` to preview merges:

```bash
# Preview merge result
/sync-merge-preview .claude/commands/audit.md

# Show JSON output (programmatic)
/sync-merge-preview .claude/commands/audit.md --json

# Apply merge result
/sync-merge-preview .claude/commands/audit.md --apply
```

### MCP Merge Command

Use `/sync-mcp-merge` for MCP configuration:

```bash
# Merge and regenerate .mcp.json
/sync-mcp-merge

# Preview without applying
/sync-mcp-merge --dry-run

# Show detailed merge info
/sync-mcp-merge --verbose
```

---

## Quick Reference

| File Type | Strategy | Auto-Merge | Tool |
|-----------|----------|------------|------|
| `.json` | RFC 7396 deep merge | Yes (non-overlapping) | `/sync-merge-preview` |
| `.yaml` | Key-by-key | Yes (non-overlapping) | `/sync-merge-preview` |
| `.md` | Section-aware | Partial (LOCAL preserved) | `/sync-merge-preview` |
| `.mcp.json` | Three-level | Yes | `/sync-mcp-merge` |
| `CLAUDE.md` | Section parser | Partial | `/sync-pull` |
| Binary | No merge | No | Manual choice |
| Unknown | Conservative | No | Manual choice |

## Error Codes

| Code | Situation | Resolution |
|------|-----------|------------|
| E401 | Nested LOCAL markers | Remove nested markers |
| E402 | Unclosed LOCAL section | Add closing marker |
| E413 | Corrupt base file | Reset watermark |
| E414 | Type mismatch | Manual resolution |
| E432 | Config merge failed | Check file syntax |
| E433 | CLAUDE.md parse error | Fix section markers |

## Related Files

| File | Purpose |
|------|---------|
| `conflict-resolution.md` | Resolution strategies |
| `config-merging-patterns/mcp-merge.md` | MCP merge details |
| `config-merging-patterns/section-parsing.md` | CLAUDE.md parsing |
| `config-merging-patterns/three-way-merge.md` | Core algorithm |
