# Component Selection Flow

Multi-phase interactive prompt flow for user-level component integration during framework installation.

## Overview

This flow guides users through selecting which user-level components to integrate into their project. It uses the AskUserQuestion tool for interactive prompts.

## Flow Diagram

```
Start
  │
  ├── Phase 1: Integration Choice
  │   ├── "Select components" → Phase 2
  │   ├── "Include all reusable" → Phase 3 (auto-filter)
  │   └── "Skip user-level" → Exit (no integration)
  │
  ├── Phase 2: Component Multi-Select
  │   └── User selects specific components → Phase 3
  │
  ├── Phase 3: Permission Model Selection
  │   └── Choose copy vs symlink for skills → Phase 4
  │
  └── Phase 4: Preview Confirmation
      ├── "Yes, integrate" → Execute integration
      ├── "Modify" → Return to Phase 2
      └── "Cancel" → Exit (no integration)
```

---

## Phase 1: Integration Choice

**Purpose**: Ask user how they want to handle user-level components.

**Trigger**: User-level ~/.claude directory detected with components.

**Prompt**:

```yaml
# AskUserQuestion parameters
question: "User-level Claude configuration found at [path] with [N] components. Include in this project?"
header: "User Config"
multiSelect: false
options:
  - label: "Select components (Recommended)"
    description: "Choose which skills, agents, commands to include"
  - label: "Include all reusable"
    description: "Auto-include [N] components classified as reusable"
  - label: "Skip user-level"
    description: "Use only framework components, ignore user-level config"
```

**Dynamic Values**:
- `[path]`: User home path (e.g., `C:\Users\user\.claude` or `~/.claude`)
- `[N]`: Total component count from context analyzer
- `[N] reusable`: Count of reusable-classified components

**Response Handling**:

| Response | Next Action |
|----------|-------------|
| "Select components" | Proceed to Phase 2 |
| "Include all reusable" | Auto-select all reusable, skip to Phase 3 |
| "Skip user-level" | Exit flow, no integration |
| (User types custom) | Parse intent, default to Select |

---

## Phase 2: Component Multi-Select

**Purpose**: Let user select specific components to integrate.

**Trigger**: User chose "Select components" in Phase 1.

**Pre-Display**: Show component inventory table using `display_component_inventory()` from user-integration-ui.md

**Prompt**:

```yaml
# AskUserQuestion parameters
question: "Select user-level components to integrate:"
header: "Components"
multiSelect: true
options:
  # Dynamically generated based on context analyzer output
  # Reusable components first, then personal, then overlap (if includable)

  # Example options:
  - label: "team-conventions (skill) [Recommended]"
    description: "Reusable - Team coding patterns and conventions"
  - label: "company-template (command) [Recommended]"
    description: "Reusable - Company-wide project templates"
  - label: "company-api (MCP) [Recommended]"
    description: "Reusable - Company API integration"
  - label: "personal-shortcuts (skill)"
    description: "Personal - Your personal productivity shortcuts"
  - label: "my-commit (command)"
    description: "Personal - Your custom commit workflow"
```

**Option Generation Rules**:

1. **Ordering**:
   - Reusable components first
   - Personal components second
   - Framework overlap components last (with warning)

2. **Labels**:
   - Format: `{name} ({type}) [{badge}]`
   - Badge for reusable: `[Recommended]`
   - No badge for personal
   - Badge for overlap: `[Conflict]`

3. **Descriptions**:
   - Format: `{classification} - {reason}`
   - Max length: 60 characters

4. **Exclusions**:
   - Framework overlap components shown with warning but selectable
   - User can choose to override conflicts

**Response Handling**:

| Response | Next Action |
|----------|-------------|
| Components selected | Proceed to Phase 3 with selections |
| No selection + confirm | Exit flow (implicit skip) |
| (User types custom) | Parse as component names, validate |

---

## Phase 3: Permission Model Selection

**Purpose**: Choose how skills should be integrated (copy vs symlink).

**Trigger**: At least one skill selected in Phase 2.

**Skip Condition**: If no skills selected, skip directly to Phase 4.

**Prompt**:

```yaml
# AskUserQuestion parameters
question: "How should user-level skills be integrated?"
header: "Skill Method"
multiSelect: false
options:
  - label: "Copy (Recommended)"
    description: "Independent copy - can customize per project, no external dependencies"
  - label: "Symlink"
    description: "Shared link - updates from user-level auto-apply, requires consistent paths"
```

**Windows-Specific Handling**:

On Windows, detect symlink capability before showing options:

```markdown
## Windows Detection Logic

1. Check OS: process.platform === 'win32'
2. If Windows:
   - Test symlink capability (Developer Mode or admin)
   - If symlink fails: Modify prompt

Modified Windows Prompt:
```yaml
options:
  - label: "Copy (Recommended for Windows)"
    description: "Symlinks require admin rights or Developer Mode, copy is safer"
  - label: "Symlink (Requires permissions)"
    description: "May fail if Developer Mode not enabled - will fall back to copy"
```
```

**Default Selection**:
- Non-Windows: Copy (safer, explicit)
- Windows: Copy (symlink issues common)

**Response Handling**:

| Response | Next Action |
|----------|-------------|
| "Copy" | Set method=copy for all skills, proceed to Phase 4 |
| "Symlink" | Set method=symlink for all skills, proceed to Phase 4 |
| (User types custom) | Parse preference, validate |

**Note**: Commands and agents always use copy. MCP servers use merge.

### Windows Symlink Capability Detection

Before presenting the permission model choice, detect Windows symlink capability:

```markdown
## Windows Symlink Detection Algorithm

1. **Check OS**
   ```bash
   # PowerShell
   [System.Environment]::OSVersion.Platform -eq 'Win32NT'
   ```

2. **If Windows, test symlink capability**
   ```bash
   # Create test symlink in temp directory
   mklink /D "%TEMP%\claude-symlink-test" "%TEMP%"

   # Check result
   if exist "%TEMP%\claude-symlink-test" (
     rmdir "%TEMP%\claude-symlink-test"
     echo "SYMLINK_OK"
   ) else (
     echo "SYMLINK_FAIL"
   )
   ```

3. **Alternative: Check Developer Mode**
   ```powershell
   # Registry check for Developer Mode
   $devMode = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" -Name "AllowDevelopmentWithoutDevLicense" -ErrorAction SilentlyContinue
   if ($devMode.AllowDevelopmentWithoutDevLicense -eq 1) {
     "SYMLINK_OK"
   } else {
     "SYMLINK_NEEDS_ADMIN"
   }
   ```

4. **Set capability flag**
   - `symlink_available: true` - Symlinks work without elevation
   - `symlink_available: false` - Symlinks require admin or not available
```

**Capability-Aware Prompt**:

If `symlink_available: false`:
```yaml
options:
  - label: "Copy (Recommended for Windows)"
    description: "Symlinks require Developer Mode or admin - copy is safer"
  - label: "Symlink (May require admin)"
    description: "Will attempt symlink, falls back to copy if permission denied"
```

If `symlink_available: true`:
```yaml
options:
  - label: "Copy (Recommended)"
    description: "Independent copy - can customize per project"
  - label: "Symlink"
    description: "Shared link - updates from user-level auto-apply"
```

---

## Phase 4: Preview Confirmation

**Purpose**: Show what will happen before execution.

**Trigger**: Always runs after Phase 3 (or Phase 2 if no skills).

**Pre-Display**: Show integration preview using `display_integration_preview()` from user-integration-ui.md

**Prompt**:

```yaml
# AskUserQuestion parameters
question: "Proceed with the integration shown above?"
header: "Confirm"
multiSelect: false
options:
  - label: "Yes, integrate (Recommended)"
    description: "Apply these selections to your project now"
  - label: "Modify selections"
    description: "Go back and change which components to include"
  - label: "Cancel"
    description: "Skip user-level integration entirely"
```

**Response Handling**:

| Response | Next Action |
|----------|-------------|
| "Yes, integrate" | Execute integration, proceed to progress display |
| "Modify selections" | Return to Phase 2 (preserve current selections) |
| "Cancel" | Exit flow, no integration |
| (User types custom) | Parse intent, confirm if ambiguous |

---

## Integration Manifest

After Phase 4 confirmation, generate manifest for TASK-102:

```yaml
# integration_manifest.yaml
version: "1.0"
generated: "[ISO timestamp]"
user_level_path: "[path to ~/.claude]"

selected_components:
  - component: "team-conventions"
    type: "skill"
    source: "~/.claude/skills/team-conventions"
    destination: ".claude/skills/team-conventions"
    method: "copy"

  - component: "company-template"
    type: "command"
    source: "~/.claude/commands/company-template.md"
    destination: ".claude/commands/company-template.md"
    method: "copy"

  - component: "company-api"
    type: "mcp"
    source: "~/.claude/.mcp.json"
    server_name: "company-api"
    destination: ".mcp.json"
    method: "merge"

skipped_components:
  - component: "personal-shortcuts"
    type: "skill"
    reason: "personal"

  - component: "commit"
    type: "command"
    reason: "framework_overlap"
    conflict_with: ".claude/commands/commit.md"

metadata:
  total_selected: 3
  total_skipped: 2
  permission_model: "copy"
  windows_fallback_used: false
```

---

## Windows Symlink Runtime Fallback

When executing integration with symlink method on Windows:

```markdown
## Symlink Execution with Fallback

For each component with method=symlink:

1. **Attempt symlink creation**
   ```bash
   # For directories (skills)
   mklink /D "[destination]" "[source]"

   # For files (commands, agents)
   mklink "[destination]" "[source]"
   ```

2. **If symlink fails** (exit code != 0 or access denied):
   - Log warning: "Symlink creation failed, falling back to copy"
   - Execute copy operation instead:
     ```bash
     # For directories
     xcopy /E /I "[source]" "[destination]"

     # For files
     copy "[source]" "[destination]"
     ```

3. **Update manifest entry**
   ```yaml
   - component: "team-conventions"
     method: "copy_fallback"  # Changed from "symlink"
     fallback_reason: "Permission denied - symlink requires admin"
   ```

4. **Track for summary**
   - Increment `fallback_count`
   - Add to `fallback_components` list for display

## Fallback Warning Display

After integration completes with fallbacks:
```
⚠️ Some symlinks fell back to copy:
- team-conventions (symlink failed, copied instead)
- company-shortcuts (symlink failed, copied instead)

To enable symlinks on Windows:
1. Enable Developer Mode in Settings > Update & Security > For developers
2. Or run as Administrator

Note: Copied components work identically but won't auto-update from user-level.
```
```

---

## Error Handling

### Phase-Specific Errors

| Phase | Error | Handling |
|-------|-------|----------|
| Phase 1 | Context analyzer failed | Show warning, offer manual path entry |
| Phase 2 | Invalid component name | Show error, reprompt |
| Phase 3 | Symlink test failed | Auto-switch to copy with warning |
| Phase 4 | User cancels | Clean exit, no changes |

### Edge Cases

| Case | Handling |
|------|----------|
| Empty user-level config | Skip entire flow silently |
| All components personal | Show "No reusable found" message, still allow selection |
| All components conflict | Show conflict list, allow rename option |
| >10 components | Show type filter option |
| User presses Ctrl+C | Clean exit, no partial state |

---

## State Management

Track flow state for modification loops:

```yaml
flow_state:
  current_phase: 1-4
  selections:
    components: []        # Selected component names
    permission_model: ""  # "copy" | "symlink"
  context:
    total_components: N
    reusable_count: N
    personal_count: N
    overlap_count: N
  history:
    - phase: 1
      choice: "select"
    - phase: 2
      selected: ["team-conventions", "company-template"]
```

When user chooses "Modify" in Phase 4, restore Phase 2 with previous selections pre-checked.

---

## Usage Example

```markdown
<!-- In /sync-add command -->

### Phase 1.5: User-Level Integration

1. **Detect user-level config**
   - Check for ~/.claude directory
   - If not found: Skip to Phase 2 (framework installation)

2. **Run context analyzer**
   - Execute TASK-099 to inventory components
   - Get classification results

3. **Run component selection flow**
   - Call this flow with context
   - Get integration_manifest

4. **Pass to integration executor**
   - Hand manifest to TASK-102
   - Display progress via user-integration-ui.md
```

---

## Integration Points

| Function | Consumes | Produces |
|----------|----------|----------|
| Phase 1 | TASK-099 context output | User routing choice |
| Phase 2 | Component list from context | Selected component list |
| Phase 3 | Selected skills list | Permission model choice |
| Phase 4 | All selections | integration_manifest |
| Execute | integration_manifest | TASK-102 trigger |
