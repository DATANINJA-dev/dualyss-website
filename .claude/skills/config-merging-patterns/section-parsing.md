# CLAUDE.md Section Parsing

Patterns for detecting and extracting CLAUDE.md sections while preserving local customizations. Enables partial sync without overwriting project-specific content.

## Section Marker Definitions

### Framework Sections (Always Sync)

Any markdown section without explicit LOCAL markers. These sections are updated during `/sync-pull`:

```markdown
## What                    <!-- Framework section -->
## How                     <!-- Framework section -->
## Features                <!-- Framework section -->
## Notes                   <!-- Framework section -->
```

### Local Sections (Never Sync)

Content between `<!-- LOCAL_START -->` and `<!-- LOCAL_END -->` markers is preserved:

```markdown
<!-- LOCAL_START -->
## Project-Specific Notes
Custom configuration for this project...
Any content here is NEVER overwritten by sync.
<!-- LOCAL_END -->
```

### Metadata Comment (Mixed Sync)

The `simon_tools_meta` block contains both framework and local fields:

```markdown
<!-- simon_tools_meta
version: 0.30.0              ← Framework field (sync)
created: 2026-01-04          ← Framework field (sync)
last_sync: 2026-01-09        ← Framework field (sync)
sync_watermark: abc123       ← Framework field (sync)
hub_commit: def456           ← Framework field (sync)
project_stack: [react, node] ← Local field (preserve)
customized_files: []         ← Local field (preserve)
project_type: personal       ← Local field (preserve)
-->
```

### Project Title (Never Sync)

The first H1 heading is always local (project name):

```markdown
# my_project_name            <!-- Local (never sync) -->
```

## Regex Patterns

### Pattern 1: Local Section Extraction

Extract all content between LOCAL markers:

```regex
<!--\s*LOCAL_START\s*-->([\s\S]*?)<!--\s*LOCAL_END\s*-->
```

**Flags**: Global, Multiline
**Group 1**: Local section content (including whitespace)

**Example Match**:
```markdown
<!-- LOCAL_START -->
## My Notes
Content here
<!-- LOCAL_END -->
```
→ Captures: `\n## My Notes\nContent here\n`

### Pattern 2: Metadata Block Extraction

Extract the entire simon_tools_meta comment:

```regex
<!--\s*simon_tools_meta\s*\n([\s\S]*?)-->
```

**Flags**: Multiline
**Group 1**: YAML content inside the comment

**Example Match**:
```markdown
<!-- simon_tools_meta
version: 0.30.0
project_stack: [react]
-->
```
→ Captures: `version: 0.30.0\nproject_stack: [react]\n`

### Pattern 3: Framework Metadata Fields

Identify which fields should sync with hub:

```regex
^(version|created|last_sync|sync_watermark|hub_commit|local_commit):\s*(.*)$
```

**Flags**: Multiline, Global
**Groups**: Field name, Field value

### Pattern 4: Local Metadata Fields

Identify which fields should be preserved:

```regex
^(project_stack|customized_files|project_type):\s*(.*)$
```

**Flags**: Multiline, Global
**Groups**: Field name, Field value

### Pattern 5: Project Title (First H1)

Extract the project name:

```regex
^#\s+([^\n]+)
```

**Flags**: None (matches first occurrence only)
**Group 1**: Project name

## Metadata Field Classification

### Framework Fields (Sync with Hub)

| Field | Description | Example |
|-------|-------------|---------|
| `version` | Current framework version | `0.30.0` |
| `created` | Initial framework creation date | `2026-01-04` |
| `last_sync` | Last successful sync timestamp | `2026-01-09` |
| `sync_watermark` | Sync state identifier | `abc123def456` |
| `hub_commit` | Hub commit at last sync | `789xyz` |
| `local_commit` | Local commit at last sync | `123abc` |

### Local Fields (Preserve During Sync)

| Field | Description | Example |
|-------|-------------|---------|
| `project_stack` | Project technology stack | `[react, node, postgres]` |
| `customized_files` | Files user has customized | `[commands/commit.md]` |
| `project_type` | Audience classification | `personal`, `team`, `public` |

## Edge Cases & Handling

| Case | Detection | Behavior | Rationale |
|------|-----------|----------|-----------|
| Missing LOCAL markers | No `LOCAL_START` found | Treat entire doc as framework | Conservative: assume sync-safe |
| Nested LOCAL markers | Multiple `LOCAL_START` without `LOCAL_END` | Error - invalid structure | Prevents accidental overwrites |
| Malformed metadata | YAML parse fails | Preserve as-is, warn user | Don't lose data on parse failure |
| Empty local section | `LOCAL_START` immediately followed by `LOCAL_END` | Preserve markers only | Allow placeholder for future content |
| Duplicate markers | Multiple `LOCAL_START/END` pairs | Process all pairs | Support multiple local sections |
| Unclosed marker | `LOCAL_START` without `LOCAL_END` | Error - invalid structure | Require explicit section boundaries |
| Whitespace in markers | `<!--  LOCAL_START  -->` | Normalize whitespace | Flexible matching |

## Full Example: CLAUDE.md Breakdown

```markdown
# my_awesome_project                    ← [LOCAL] Project name (line 1)

<!-- simon_tools_meta                   ← [MIXED] Metadata block start
version: 0.30.0                        ← [FRAMEWORK] Sync this
created: 2026-01-04                    ← [FRAMEWORK] Sync this
last_sync: 2026-01-09                  ← [FRAMEWORK] Sync this
project_stack: [typescript, react]     ← [LOCAL] Preserve this
customized_files: []                   ← [LOCAL] Preserve this
-->                                    ← Metadata block end

A meta-framework for Claude Code...    ← [FRAMEWORK] Description (sync)

## What                                ← [FRAMEWORK] Section header (sync)

### Structure                          ← [FRAMEWORK] Subsection (sync)
simon_tools/
├── .claude/
...

## How                                 ← [FRAMEWORK] Section header (sync)

### Core Commands                      ← [FRAMEWORK] Subsection (sync)
| Command | Purpose |
...

<!-- LOCAL_START -->                   ← [LOCAL] Marker start
## Project-Specific Setup              ← [LOCAL] Custom section

This project uses custom database...   ← [LOCAL] Custom content

### Local Environment                  ← [LOCAL] Custom subsection
- Run docker-compose up                ← [LOCAL] Custom instructions
<!-- LOCAL_END -->                     ← [LOCAL] Marker end

## Notes                               ← [FRAMEWORK] Section header (sync)

- Framework v0.30.0 - Latest changes   ← [FRAMEWORK] Content (sync)
```

## Section Merge Strategy

When syncing from hub:

1. **Extract local sections** - Save all content between LOCAL markers
2. **Extract local metadata** - Save project_stack, customized_files, etc.
3. **Apply hub CLAUDE.md** - Replace entire framework content
4. **Restore local sections** - Re-insert at original positions (or end if position unclear)
5. **Merge metadata** - Framework fields from hub, local fields preserved
6. **Preserve project title** - Never replace first H1

## Pseudocode: Section Parser

```
function parseClaudeMd(content):
  // 1. Extract project title (first H1)
  titleMatch = content.match(/^#\s+([^\n]+)/)
  projectTitle = titleMatch[1] or 'Untitled'

  // 2. Extract and parse metadata block
  metaMatch = content.match(/<!--\s*simon_tools_meta\s*\n([\s\S]*?)-->/)
  metadata = { framework: {}, local: {} }

  if metaMatch:
    yamlContent = metaMatch[1]
    // Parse YAML and classify fields
    for line in yamlContent.split('\n'):
      [key, value] = line.split(':').map(trim)
      if key in FRAMEWORK_FIELDS:
        metadata.framework[key] = value
      else if key in LOCAL_FIELDS:
        metadata.local[key] = value

  // 3. Extract local sections
  localSections = []
  localRegex = /<!--\s*LOCAL_START\s*-->([\s\S]*?)<!--\s*LOCAL_END\s*-->/g

  for each match in content.matchAll(localRegex):
    localSections.push({
      content: match[1],
      position: lineNumberAt(match.index)
    })

  // 4. Remove local sections to get framework content
  frameworkContent = content
    .replace(localRegex, '')     // Remove local sections
    .replace(/^#\s+[^\n]+\n/, '') // Remove title

  return { projectTitle, metadata, frameworkContent, localSections }
```

## Validation Rules

Before accepting a CLAUDE.md for sync:

| Rule | Check | Error if Failed |
|------|-------|-----------------|
| Valid markers | All `LOCAL_START` have matching `LOCAL_END` | E401: Unclosed LOCAL marker |
| No nesting | No `LOCAL_START` inside another local section | E402: Nested LOCAL markers |
| Valid YAML | Metadata block parses as YAML | E403: Invalid metadata YAML |
| Required fields | `version` field present in metadata | E404: Missing version field |
| Version format | Version matches SemVer pattern | E405: Invalid version format |
