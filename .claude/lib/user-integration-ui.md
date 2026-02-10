# User Integration UI Library

Reusable UI component functions for displaying user-level component information during framework installation.

## Overview

This library provides functions for:
- Rendering categorized component tables
- Formatting individual component rows
- Displaying summary counts
- Generating integration previews
- Showing progress feedback

## Functions

### display_component_inventory(context)

Displays the complete user-level component inventory with categorized tables.

**Input**: `user_level_context` from TASK-099 context analyzer

**Output Format**:

```
## User-Level Components Found

**Path:** [user_home_path]/.claude

### Recommended (Reusable) [N]
| Component | Type | Files | Recommendation |
|-----------|------|-------|----------------|
| [name] | [type] | [N] | Include - [reason] |

### Personal (Not Recommended) [N]
| Component | Type | Reason |
|-----------|------|--------|
| [name] | [type] | [reason] |

### Framework Overlap (Conflict) [N]
| Component | Type | Conflict With |
|-----------|------|---------------|
| [name] | [type] | framework/[file] |

**Summary:** [total] total, [reusable] recommended, [personal] personal, [overlap] conflicts
```

**Example**:

```
## User-Level Components Found

**Path:** C:\Users\user\.claude

### Recommended (Reusable) [3]
| Component | Type | Files | Recommendation |
|-----------|------|-------|----------------|
| team-conventions | skill | 3 | Include - team patterns |
| company-template | command | 1 | Include - org standard |
| company-api | MCP | - | Include - shared API |

### Personal (Not Recommended) [2]
| Component | Type | Reason |
|-----------|------|--------|
| personal-shortcuts | skill | User-specific tools |
| my-commit | command | Personal commit style |

### Framework Overlap (Conflict) [1]
| Component | Type | Conflict With |
|-----------|------|---------------|
| commit | command | framework/commit.md |

**Summary:** 6 total, 3 recommended, 2 personal, 1 conflict
```

---

### format_component_row(component, category)

Formats a single component row for table display.

**Input**:
- `component`: Component object with name, type, classification, reason
- `category`: "reusable" | "personal" | "overlap"

**Output**: Formatted table row string

**Truncation Rules**:
- Component name: Max 25 characters, ellipsis if longer
- Reason/recommendation: Max 30 characters
- Total row width: Max 80 characters (terminal friendly)

**Example**:
```
| team-conventions | skill | 3 | Include - team patterns |
| personal-work-shortcuts... | skill | User-specific tools |
```

---

### display_summary(context)

Displays a compact summary of component counts.

**Input**: `user_level_context` from TASK-099

**Output Format**:
```
**Summary:** [total] total, [reusable] recommended, [personal] personal, [overlap] conflicts
```

**Conditional Display**:
- If `overlap > 0`: Include conflict count
- If `mcp_count > 0`: Append ", [N] MCP servers"
- If all personal: "No reusable components found"

---

### display_integration_preview(manifest)

Displays a preview of what will be integrated before execution.

**Input**: `integration_manifest` with selected components

**Output Format**:

```
## Integration Preview

**Components to integrate:**
| Component | Type | Method | Destination |
|-----------|------|--------|-------------|
| [name] | [type] | [copy/symlink/merge] | [path] |

**Components skipped:**
- [name] ([reason])

**Proceed with integration?** [Yes / No / Modify]
```

**Example**:

```
## Integration Preview

**Components to integrate:**
| Component | Type | Method | Destination |
|-----------|------|--------|-------------|
| team-conventions | skill | copy | .claude/skills/team-conventions/ |
| company-template | command | symlink | .claude/commands/company-template.md |
| company-api | MCP | merge | .mcp.json |

**Components skipped:**
- personal-shortcuts (personal)
- my-commit (personal)
- commit (framework overlap)

**Proceed with integration?** [Yes / No / Modify]
```

**Validation Rules**:

Before displaying preview, validate:
1. At least one component selected (or show "No components selected")
2. All destination paths are valid
3. No duplicate destinations
4. Symlink sources exist

**Edge Case Outputs**:

No components selected:
```
## Integration Preview

No components selected for integration.
User-level integration will be skipped.

[Proceed / Go back to select]
```

All components skipped:
```
## Integration Preview

All user-level components were excluded:
- personal-shortcuts (personal)
- my-commit (personal)
- commit (framework overlap)

No components will be integrated.

[Proceed / Go back to select]
```

Conflict warning:
```
## Integration Preview

**Components to integrate:**
| Component | Type | Method | Destination |
|-----------|------|--------|-------------|
| team-conventions | skill | copy | .claude/skills/team-conventions/ |

⚠️ **Conflicts detected:**
| Component | Conflicts With | Resolution |
|-----------|----------------|------------|
| commit | framework/commit.md | Will be renamed to commit-user.md |

**Proceed with integration?** [Yes / No / Modify]
```

---

### display_progress(current, total, component_name, status)

Displays progress feedback during integration execution.

**Input**:
- `current`: Current step number (1-based)
- `total`: Total steps
- `component_name`: Name of component being processed
- `status`: "pending" | "in_progress" | "complete" | "failed"

**Output Format**:
```
[N/M] [Action] [type]: [name] [status_icon]
```

**Status Icons**:
- pending: (no icon)
- in_progress: ...
- complete: ✓
- failed: ✗

**Example Progress Sequence**:
```
Integrating user-level components...

[1/3] Copying skill: team-conventions ✓
[2/3] Creating symlink: company-template ✓
[3/3] Merging MCP: company-api ✓

Integration complete!
- 3 components integrated
- 2 components skipped
- 0 conflicts resolved

Manifest saved: .claude/.user-level-integration-manifest.yaml
```

**Error Handling**:

When an operation fails:
```
Integrating user-level components...

[1/3] Copying skill: team-conventions ✓
[2/3] Creating symlink: company-template ✗
      Error: Permission denied (symlink requires admin on Windows)
      Fallback: Copying instead...
[2/3] Copying command: company-template ✓
[3/3] Merging MCP: company-api ✓

Integration complete with warnings!
- 3 components integrated
- 1 fallback to copy (symlink failed)
- 2 components skipped

Manifest saved: .claude/.user-level-integration-manifest.yaml
```

**Verbose Mode** (--verbose flag):

```
Integrating user-level components...

[1/3] Copying skill: team-conventions
      Source: C:\Users\user\.claude\skills\team-conventions\ (3 files)
      Dest:   .claude\skills\team-conventions\
      Size:   4.2 KB
      Time:   0.12s
      ✓ Complete

[2/3] Creating symlink: company-template
      Source: C:\Users\user\.claude\commands\company-template.md
      Dest:   .claude\commands\company-template.md
      ✓ Complete

[3/3] Merging MCP: company-api
      Server: company-api
      Merging into: .mcp.json
      ✓ Complete

Integration complete!
- 3 components integrated (4.8 KB total)
- Duration: 0.45s
```

---

### display_completion_summary(result)

Displays final summary after integration completes.

**Input**: `integration_result` with counts and details

**Output Format**:

```
Integration complete!
- [N] components integrated
- [N] components skipped
- [N] conflicts resolved

Manifest saved: .claude/.user-level-integration-manifest.yaml
```

**Optional sections** (if applicable):
- If symlink fallbacks occurred:
  ```
  Note: [N] symlinks fell back to copy (Windows permissions)
  ```
- If MCP servers merged:
  ```
  MCP servers added to .mcp.json: [names]
  ```

---

## Helper Functions

### get_type_icon(type)

Returns visual indicator for component type.

| Type | Icon |
|------|------|
| skill | [S] |
| command | [C] |
| agent | [A] |
| mcp | [M] |
| hook | [H] |

---

### get_classification_badge(classification)

Returns badge for component classification.

| Classification | Badge |
|----------------|-------|
| reusable | [+] |
| personal | [-] |
| framework_overlap | [!] |

---

### truncate_text(text, max_length)

Truncates text to fit within max_length, adding ellipsis if needed.

**Rules**:
- If `text.length <= max_length`: Return unchanged
- If `text.length > max_length`: Return `text[0:max_length-3] + "..."`

---

## Usage Example

```markdown
<!-- In /sync-add command -->

1. Run user-level context analyzer (TASK-099)
2. Call display_component_inventory(context)
3. Present AskUserQuestion for selection
4. Based on selection:
   - "Select components": Show multi-select prompt
   - "Include all reusable": Filter and collect reusable
   - "Skip": Continue without user-level integration
5. Call display_integration_preview(manifest)
6. On confirmation, execute integration with display_progress()
7. Call display_completion_summary(result)
```

---

## Integration Points

| Function | Called By | Input From |
|----------|-----------|------------|
| display_component_inventory | sync-add Phase 1.5 | TASK-099 output |
| display_integration_preview | component-selection-flow | User selections |
| display_progress | TASK-102 | Integration executor |
| display_completion_summary | TASK-102 | Integration result |

---

## Terminal Width Considerations

All display functions are designed for 80-character terminal width:
- Table columns sized to fit
- Long names truncated with ellipsis
- Multi-line content wrapped appropriately

For wider terminals, content displays naturally. For narrower terminals (<60 chars), tables may wrap but remain readable.
