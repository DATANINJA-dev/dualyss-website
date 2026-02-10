# Migration Strategies

Patterns for migrating existing Claude Code setups to framework structure. Four strategies cover different scenarios from fresh installs to upgrades and custom preservation.

## Overview

Migration handles existing `.claude/` directories. The goal is to:

1. Preserve user's custom work
2. Install framework components safely
3. Handle naming collisions gracefully
4. Enable rollback if needed

## Pre-Migration Assessment

Before migration, assess the current state:

```
function assessMigration(context: TargetContext):
  assessment = {
    existing_file_count: context.custom_files.length + context.framework_files.length,
    custom_file_count: context.custom_files.length,
    framework_file_count: context.framework_files.length,
    collision_count: context.collisions.filter(c => c.type == "CRITICAL").length,
    has_mcp_config: context.mcp_servers.source != null,
    current_version: detectFrameworkVersion(context),
    target_version: FRAMEWORK_VERSION
  }

  // Classify existing files
  assessment.file_classification = {
    framework: context.framework_files,
    custom: context.custom_files,
    unknown: context.other_files
  }

  // Detect version if framework present
  if assessment.framework_file_count > 0:
    assessment.version_info = {
      current: assessment.current_version,
      target: FRAMEWORK_VERSION,
      needs_upgrade: assessment.current_version < FRAMEWORK_VERSION
    }

  return assessment
```

### Assessment Report

```
## Pre-Migration Assessment

### Current State
| Metric | Value |
|--------|-------|
| Total files in .claude/ | 12 |
| Framework files | 7 |
| Custom files | 4 |
| Unknown files | 1 |
| Critical collisions | 2 |

### Version Detection
Current framework: v0.28.0
Target framework: v0.31.0
Upgrade needed: Yes (3 minor versions)

### File Classification
Framework (7):
  ✓ commands/commit.md (v0.28.0)
  ✓ commands/review-pr.md (v0.28.0)
  ✓ agents/code-reviewer.md (v0.28.0)
  ... (4 more)

Custom (4):
  • commands/deploy.md
  • commands/my-script.md
  • agents/custom-agent.md
  • skills/company-patterns/

Unknown (1):
  ? notes.txt

### Collision Analysis
CRITICAL (2):
  • deploy.md - custom file conflicts with framework
  • commit.md - custom modifications detected

### Recommended Strategy
Strategy C: Old Version Upgrade
Reason: Framework files detected, 3 versions behind
```

## Four Migration Strategies

### Strategy A: Fresh Install

**Condition**: No existing `.claude/` directory.

**Approach**: Full scaffolding with no migration concerns.

```
Strategy A: Fresh Install

Conditions:
  - context.has_claude_dir == false
  - OR context is empty (only .gitkeep)

Actions:
  1. Create directory structure
  2. Copy all framework files
  3. Generate CLAUDE.md
  4. Create .mcp.base.json
  5. Initialize backlog/

No conflicts possible.
```

**Step-by-Step**:

```
## Fresh Install Workflow

Step 1: Create directories
  mkdir -p .claude/commands
  mkdir -p .claude/agents
  mkdir -p .claude/skills
  mkdir -p .claude/hooks
  mkdir -p backlog/epics
  mkdir -p backlog/tasks
  mkdir -p backlog/templates
  mkdir -p backlog/working

Step 2: Copy framework files
  Copy all files from framework manifest
  Total: ~45 files

Step 3: Generate CLAUDE.md
  Apply template with detected context
  Include project-specific sections

Step 4: Create MCP configuration
  Generate .mcp.base.json with framework MCPs
  Create empty .mcp.local.json

Step 5: Initialize indexes
  Create backlog/epics.json: { "epics": [] }
  Create backlog/tasks.json: { "tasks": [] }

Step 6: Update .gitignore
  Add: .mcp.json, .mcp.local.json, settings.local.json

Done. No migration needed.
```

### Strategy B: Custom Migration

**Condition**: Custom `.claude/` exists without framework files.

**Approach**: Preserve all custom files, merge framework alongside.

```
Strategy B: Custom Migration

Conditions:
  - context.has_claude_dir == true
  - context.framework_files.length == 0
  - context.custom_files.length > 0

Actions:
  1. Backup existing .claude/
  2. Detect collisions
  3. Rename colliding custom files
  4. Copy framework files
  5. Merge MCP configurations
  6. Generate CLAUDE.md with LOCAL sections
```

**Step-by-Step**:

```
## Custom Migration Workflow

Step 1: Create backup
  backup_dir = ".claude-backup-{timestamp}"
  cp -r .claude/ {backup_dir}/
  Record manifest: backup_dir/manifest.json

Step 2: Analyze collisions
  For each framework file:
    If exists in custom:
      Mark as collision
      Plan rename: {name} → local-{name}

Step 3: Rename collisions
  For each collision:
    mv .claude/commands/deploy.md .claude/commands/local-deploy.md
    Update any internal references

Step 4: Copy framework files
  Copy framework files (skip renamed ones)
  Preserve directory structure

Step 5: Merge MCP configuration
  If .mcp.json exists:
    mv .mcp.json .mcp.local.json
  Create .mcp.base.json with framework MCPs
  Use config-merging-patterns skill for deep merge

Step 6: Generate CLAUDE.md
  If CLAUDE.md exists:
    Preserve existing content in LOCAL section
  Generate new CLAUDE.md with framework sections

Step 7: Validate
  Run validation checks
  Report any issues

Done. Custom files preserved.
```

**Collision Resolution Example**:

```
## Collision Resolution

Found 2 collisions:

1. deploy.md
   Type: CRITICAL (exact name match)
   Your file: 45 lines, last modified 2026-01-05
   Framework file: Standard deployment command

   [R]ename to local-deploy.md (recommended)
   [K]eep yours, skip framework file
   [O]verwrite with framework (lose yours)

   Choice: R
   → Renamed: deploy.md → local-deploy.md

2. commit.md
   Type: WARNING (modified framework file)
   Your modifications: <!-- LOCAL --> sections detected

   [M]erge (preserve LOCAL sections)
   [K]eep yours entirely
   [O]verwrite with framework

   Choice: M
   → Merged: Preserved LOCAL sections in new framework version
```

### Strategy C: Old Version Upgrade

**Condition**: Older framework version installed.

**Approach**: Upgrade framework files in place, preserve customizations.

```
Strategy C: Old Version Upgrade

Conditions:
  - context.has_claude_dir == true
  - context.framework_files.length > 0
  - detectFrameworkVersion() < FRAMEWORK_VERSION

Actions:
  1. Backup current state
  2. Identify files to upgrade
  3. Preserve LOCAL sections in each file
  4. Replace framework files with new versions
  5. Update CLAUDE.md metadata
  6. Validate upgrade
```

**Step-by-Step**:

```
## Version Upgrade Workflow

Step 1: Create backup
  backup_dir = ".claude-backup-{timestamp}"
  cp -r .claude/ {backup_dir}/
  cp CLAUDE.md {backup_dir}/

Step 2: Identify upgrade targets
  For each file in framework manifest:
    If file exists AND is framework file:
      Check for LOCAL sections
      Mark for upgrade

Step 3: Preserve LOCAL content
  For each file with LOCAL sections:
    Extract content between <!-- LOCAL_START --> and <!-- LOCAL_END -->
    Store in temporary structure

Step 4: Replace framework files
  For each framework file:
    If has LOCAL content:
      Copy new framework file
      Re-inject LOCAL content at designated position
    Else:
      Direct replacement

Step 5: Add new framework files
  For each file in manifest not in current:
    Copy new file (no conflict possible)

Step 6: Update CLAUDE.md
  Update version in metadata:
    version: {old} → {new}
    last_sync: {today}
  Preserve LOCAL sections
  Update feature documentation

Step 7: Validate
  Run all validation checks
  Report upgrade summary

Done. Upgraded from v{old} to v{new}.
```

**Upgrade Report Example**:

```
## Upgrade Report: v0.28.0 → v0.31.0

### Files Updated (12)
| File | Action | LOCAL Preserved |
|------|--------|-----------------|
| commands/commit.md | Updated | Yes |
| commands/refine.md | Updated | No |
| commands/develop-task.md | Updated | No |
| agents/develop-step-verifier.md | Updated | No |
| skills/error-handling/SKILL.md | Updated | No |
| CLAUDE.md | Updated | Yes |
... (6 more)

### New Files Added (8)
| File | Description |
|------|-------------|
| commands/sync-status.md | v0.30.0 feature |
| commands/sync-watermark.md | v0.30.0 feature |
| skills/git-sync-patterns/conflict-detection.md | v0.30.0 |
| agents/sync-version-validator.md | v0.31.0 |
... (4 more)

### Files Unchanged (25)
Custom files and unmodified framework files preserved.

### Summary
- Upgraded: 12 files
- Added: 8 files
- Preserved: 25 files
- LOCAL sections: 2 preserved
```

### Strategy D: Minimal Addition

**Condition**: Existing setup, user wants minimal changes.

**Approach**: Add only missing files, don't touch existing.

```
Strategy D: Minimal Addition

Conditions:
  - User explicitly requests minimal
  - OR context has many custom files (>10)
  - AND user prefers preservation

Actions:
  1. Identify missing framework files
  2. Add only missing files
  3. Don't modify existing files
  4. Optionally update CLAUDE.md
```

**Step-by-Step**:

```
## Minimal Addition Workflow

Step 1: Identify missing files
  missing = []
  For each file in framework manifest:
    If not exists in .claude/:
      missing.push(file)

Step 2: Report missing
  Found {N} missing framework files:
  - commands/generate-epics.md
  - commands/audit.md
  - agents/audit-qa.md
  ... etc

Step 3: User selection
  Add all missing files? [Y/n/select]

  If select:
    Present checklist for user to choose

Step 4: Add selected files
  For each selected file:
    Copy from framework
    Preserve directory structure

Step 5: Optional CLAUDE.md update
  Update CLAUDE.md with new features? [Y/n]

  If yes:
    Add documentation for new features
    Don't modify existing content

Done. Added {N} files (4 skipped by user choice)
```

## Strategy Selection Logic

```
function selectStrategy(context: TargetContext): string {
  // Strategy A: Fresh
  if (!context.has_claude_dir) {
    return "A";
  }

  // Empty directory is same as fresh
  if (context.existing_commands.length === 0 &&
      context.existing_agents.length === 0 &&
      context.existing_skills.length === 0) {
    return "A";
  }

  // Strategy C: Old Version
  if (context.framework_files.length > 0) {
    currentVersion = detectFrameworkVersion(context);
    if (currentVersion < FRAMEWORK_VERSION) {
      return "C";
    }
  }

  // Strategy B: Custom Migration
  if (context.custom_files.length > 0 && context.framework_files.length === 0) {
    return "B";
  }

  // Strategy D: Minimal (many customs or user preference)
  if (context.custom_files.length > 10) {
    return "D";
  }

  // Default to B for mixed setups
  return "B";
}
```

## File Renaming Strategy

### Collision Handling

When a custom file has the same name as a framework file:

```
Pattern: {name}.md → local-{name}.md

Examples:
  deploy.md → local-deploy.md
  commit.md → local-commit.md
  review-pr.md → local-review-pr.md
```

### Reference Updates

After renaming, update internal references:

```
function updateReferences(projectRoot, oldName, newName):
  // Find all markdown files
  mdFiles = glob(projectRoot + "/.claude/**/*.md")
  mdFiles.push(projectRoot + "/CLAUDE.md")

  for file in mdFiles:
    content = readFile(file)

    // Update command references
    content = content.replace(
      "/" + oldName.replace(".md", ""),
      "/" + newName.replace(".md", "")
    )

    // Update file path references
    content = content.replace(oldName, newName)

    writeFile(file, content)
```

### Rename Report

```
## Renamed Files

| Original | New Name | References Updated |
|----------|----------|-------------------|
| deploy.md | local-deploy.md | 3 files |
| commit.md | local-commit.md | 5 files |

Updated references in:
  - CLAUDE.md (2 references)
  - commands/help.md (1 reference)
  - agents/code-reviewer.md (2 references)
  - agents/task-code-impact.md (1 reference)
  - skills/task-discovery/SKILL.md (2 references)
```

## MCP Configuration Migration

### Move Existing Configuration

```
function migrateMcpConfig(projectRoot):
  mcpJson = projectRoot + "/.mcp.json"
  mcpLocal = projectRoot + "/.mcp.local.json"
  mcpBase = projectRoot + "/.mcp.base.json"

  if exists(mcpJson):
    // Move existing to local
    mv(mcpJson, mcpLocal)
    log("Moved .mcp.json → .mcp.local.json")

  // Create base with framework MCPs
  writeFile(mcpBase, generateBaseMcpConfig())
  log("Created .mcp.base.json with framework MCPs")

  // Generate merged output using config-merging-patterns skill
  merged = deepMerge(
    parseJson(readFile(mcpBase)),
    exists(mcpLocal) ? parseJson(readFile(mcpLocal)) : {}
  )
  writeFile(mcpJson, JSON.stringify(merged, null, 2))
  log("Generated merged .mcp.json")
```

### Deep Merge Using config-merging-patterns

Reference the `config-merging-patterns` skill for merge logic:

```
MCP Configuration Merge:

Base (.mcp.base.json):
  serena, github (framework MCPs)

Local (.mcp.local.json):
  my-database, custom-api (project MCPs)

Merged (.mcp.json):
  serena, github, my-database, custom-api

Collision handling:
  If same server name in both:
    Local wins (with warning)
```

## Backup & Rollback

### Pre-Migration Backup

```
function createBackup(projectRoot):
  timestamp = formatDate(now(), "YYYY-MM-DD-HHmmss")
  backupDir = projectRoot + "/.claude-backup-" + timestamp

  // Create backup directory
  mkdir(backupDir)

  // Copy .claude/ if exists
  if exists(projectRoot + "/.claude"):
    cp_r(projectRoot + "/.claude", backupDir + "/.claude")

  // Copy CLAUDE.md if exists
  if exists(projectRoot + "/CLAUDE.md"):
    cp(projectRoot + "/CLAUDE.md", backupDir + "/CLAUDE.md")

  // Copy MCP configs
  for file in [".mcp.json", ".mcp.local.json", ".mcp.base.json"]:
    if exists(projectRoot + "/" + file):
      cp(projectRoot + "/" + file, backupDir + "/" + file)

  // Create manifest
  manifest = {
    created: now(),
    source_version: detectFrameworkVersion(projectRoot),
    target_version: FRAMEWORK_VERSION,
    files: listFilesRecursive(backupDir)
  }
  writeFile(backupDir + "/manifest.json", JSON.stringify(manifest))

  return backupDir
```

### Rollback Command

```
function rollback(projectRoot, backupDir):
  // Verify backup exists
  if not exists(backupDir):
    error("Backup not found: " + backupDir)
    return false

  // Read manifest
  manifest = parseJson(readFile(backupDir + "/manifest.json"))

  // Remove current framework files
  if exists(projectRoot + "/.claude"):
    rm_rf(projectRoot + "/.claude")

  // Restore from backup
  if exists(backupDir + "/.claude"):
    cp_r(backupDir + "/.claude", projectRoot + "/.claude")

  // Restore CLAUDE.md
  if exists(backupDir + "/CLAUDE.md"):
    cp(backupDir + "/CLAUDE.md", projectRoot + "/CLAUDE.md")

  // Restore MCP configs
  for file in [".mcp.json", ".mcp.local.json", ".mcp.base.json"]:
    if exists(backupDir + "/" + file):
      cp(backupDir + "/" + file, projectRoot + "/" + file)
    else if exists(projectRoot + "/" + file):
      rm(projectRoot + "/" + file)

  log("Rolled back to backup from " + manifest.created)
  return true
```

### Backup Retention

```
Backup retention policy:
  - Keep backups for 7 days by default
  - Maximum 5 backups per project
  - Oldest removed when limit exceeded

Cleanup command:
  /sync-cleanup --backups
  Lists and optionally removes old backups
```

## Migration Examples

### Example 1: Strategy A - Fresh Install

```
## Migration: Fresh Install

Project: /home/user/new-project
Existing .claude/: No
Strategy: A (Fresh)

Step 1: Creating directories...
  ✓ .claude/commands/
  ✓ .claude/agents/
  ✓ .claude/skills/
  ✓ .claude/hooks/
  ✓ backlog/epics/
  ✓ backlog/tasks/

Step 2: Copying framework files...
  ✓ 16 commands
  ✓ 12 agents
  ✓ 8 skills
  ✓ 3 hooks

Step 3: Generating CLAUDE.md...
  ✓ Created with detected stack: Node.js + TypeScript

Step 4: Creating MCP configuration...
  ✓ .mcp.base.json with serena, github
  ✓ .mcp.local.json (empty)
  ✓ .mcp.json (merged)

Step 5: Initializing backlog...
  ✓ epics.json
  ✓ tasks.json

Step 6: Updating .gitignore...
  ✓ Added: .mcp.json, .mcp.local.json

## Complete
Framework v0.31.0 installed successfully.
Total files: 42
Time: 2.3s
```

### Example 2: Strategy B - Custom Migration

```
## Migration: Custom → Framework

Project: /home/user/existing-project
Existing .claude/: Yes (8 custom files)
Strategy: B (Custom)

Step 1: Creating backup...
  ✓ .claude-backup-2026-01-10-143022/

Step 2: Analyzing collisions...
  Found 2 collisions:
  • commands/deploy.md (CRITICAL)
  • commands/commit.md (WARNING - has LOCAL)

Step 3: Resolving collisions...
  ✓ deploy.md → local-deploy.md
  ✓ commit.md: Preserving LOCAL sections

Step 4: Copying framework files...
  ✓ 14 new commands
  ✓ 12 agents
  ✓ 8 skills
  ✓ 3 hooks

Step 5: Merging MCP configuration...
  ✓ Moved .mcp.json → .mcp.local.json
  ✓ Created .mcp.base.json
  ✓ Merged: 2 framework + 3 custom MCPs

Step 6: Generating CLAUDE.md...
  ✓ Preserved existing content in LOCAL section

## Complete
Framework v0.31.0 installed.
Custom files preserved: 8
Renamed: 1
Time: 3.1s

Rollback available: .claude-backup-2026-01-10-143022/
```

### Example 3: Strategy C - Version Upgrade

```
## Migration: v0.28.0 → v0.31.0

Project: /home/user/my-app
Current version: 0.28.0
Target version: 0.31.0
Strategy: C (Upgrade)

Step 1: Creating backup...
  ✓ .claude-backup-2026-01-10-150000/

Step 2: Identifying upgrade targets...
  Files to upgrade: 15
  Files with LOCAL: 3
  New files to add: 8

Step 3: Preserving LOCAL sections...
  ✓ commands/commit.md (2 sections)
  ✓ CLAUDE.md (1 section)
  ✓ agents/code-reviewer.md (1 section)

Step 4: Upgrading framework files...
  ✓ commands/commit.md
  ✓ commands/refine.md
  ✓ commands/develop-task.md
  ... (12 more)

Step 5: Adding new framework files...
  ✓ commands/sync-status.md (v0.30.0)
  ✓ commands/sync-watermark.md (v0.30.0)
  ✓ agents/sync-version-validator.md (v0.31.0)
  ... (5 more)

Step 6: Updating CLAUDE.md metadata...
  ✓ version: 0.28.0 → 0.31.0
  ✓ last_sync: 2026-01-10

## Complete
Upgraded from v0.28.0 to v0.31.0
Files upgraded: 15
New files: 8
LOCAL sections preserved: 4
Time: 4.2s

New features available:
- /sync-status command (v0.30.0)
- /sync-watermark command (v0.30.0)
- Version compatibility checking (v0.31.0)
```

### Example 4: Strategy D - Minimal Addition

```
## Migration: Minimal Addition

Project: /home/user/large-project
Existing .claude/: Yes (25 files)
Strategy: D (Minimal)

Step 1: Identifying missing files...
  Missing framework files: 12

  Commands (5 missing):
    • generate-epics.md
    • audit.md
    • sync-remote.md
    • sync-pull.md
    • sync-push.md

  Agents (4 missing):
    • audit-qa.md
    • audit-command-analyzer.md
    • audit-agent-analyzer.md
    • audit-skill-analyzer.md

  Skills (3 missing):
    • claude-code-audit/
    • git-sync-patterns/
    • version-compatibility-management/

Step 2: User selection...
  Add all 12 missing files? [Y/n/select] select

  Select files to add:
  [x] generate-epics.md
  [x] audit.md
  [ ] sync-remote.md
  [ ] sync-pull.md
  [ ] sync-push.md
  [x] audit-qa.md
  ... (showing first 6)

  Selected: 8 files

Step 3: Adding selected files...
  ✓ commands/generate-epics.md
  ✓ commands/audit.md
  ✓ agents/audit-qa.md
  ✓ agents/audit-command-analyzer.md
  ✓ agents/audit-agent-analyzer.md
  ✓ agents/audit-skill-analyzer.md
  ✓ skills/claude-code-audit/
  ✓ skills/git-sync-patterns/

Step 4: CLAUDE.md update...
  Update CLAUDE.md with new features? [Y/n] y
  ✓ Added audit documentation
  ✓ Existing content preserved

## Complete
Added 8 files (4 skipped by user choice)
Existing files: Untouched
Time: 1.8s
```

## Version Compatibility

Before migration, validate version compatibility using the `version-compatibility-management` skill:

```
/sync-check-version 0.31.0

Checking compatibility...

✓ Python 3.11 satisfies >=3.9
✓ Node 18.0.0 satisfies >=16.0.0
✓ Serena MCP 0.2.0 satisfies >=0.1.0

All constraints satisfied. Safe to migrate.
```

If incompatible:

```
✗ Framework 0.24.0 breaks with target 0.31.0
  Reason: TDD workflow not supported in <0.25.0

Migration blocked. Upgrade to at least v0.25.0 first.
```

## Claude Code Implementation Examples

Real `/sync-migrate` command output extracted from TASK-093 implementation. Shows migration patterns for all four strategies with before/after diffs.

### Example 1: Strategy A - Fresh Install (No Migration Needed)

When target has no existing `.claude/`, migration delegates to `/sync-scaffold`:

**Command**:
```bash
/sync-migrate
```

**Output**:
```
## Pre-Migration Assessment

### Current State
| Metric | Value |
|--------|-------|
| Total files in .claude/ | 0 |
| Framework files | 0 |
| Custom files | 0 |
| Critical collisions | 0 |

### Recommended Strategy
Strategy A: Fresh Install
Reason: No existing .claude/ directory

Strategy A detected - delegating to /sync-scaffold...

[/sync-scaffold output follows]
```

**Key Point**: Strategy A is the "happy path" - no migration complexity, just scaffolding.

### Example 2: Strategy B - Custom Migration with Collision Resolution

**Before**:
```
my-project/
├── .claude/
│   ├── commands/
│   │   ├── deploy.md           # Custom deployment
│   │   └── my-script.md        # Custom script
│   └── agents/
│       └── custom-agent.md     # Custom agent
├── .mcp.json                   # Existing MCPs
└── CLAUDE.md                   # User-written docs
```

**Command**:
```bash
/sync-migrate
```

**Output**:
```
## Pre-Migration Assessment

### Current State
| Metric | Value |
|--------|-------|
| Total files in .claude/ | 3 |
| Framework files | 0 |
| Custom files | 3 |
| Critical collisions | 1 |

### File Classification
Custom (3):
  • commands/deploy.md
  • commands/my-script.md
  • agents/custom-agent.md

### Collision Analysis
CRITICAL (1):
  • deploy.md - custom file conflicts with framework command

### Recommended Strategy
Strategy B: Custom Migration
Reason: Custom files detected, no framework files present

## Step 1: Creating Backup

✓ Created backup: .claude-backup-2026-01-11T14-30-00/
✓ Manifest saved: .claude-backup-2026-01-11T14-30-00/manifest.json

## Step 2: Collision Resolution

Found 1 collision requiring resolution:

### deploy.md
Type: CRITICAL (exact name match with framework command)
Your file: 45 lines, custom deployment command
Framework file: commands/deploy.md (standard deployment)

Options:
[R]ename to local-deploy.md (Recommended)
[K]eep yours, skip framework file
[O]verwrite with framework

Choice: R

✓ Renamed: deploy.md → local-deploy.md
✓ Updated 2 references in other files

## Step 3: MCP Configuration Migration

Found existing .mcp.json with 2 servers:
  • my-database (project)
  • custom-api (project)

✓ Moved .mcp.json → .mcp.local.json
✓ Created .mcp.base.json with framework MCPs
✓ Generated merged .mcp.json (2 framework + 2 project servers)

## Step 4: CLAUDE.md Migration

Found existing CLAUDE.md (120 lines)

Preserving content in LOCAL section...
✓ Extracted existing content
✓ Generated new CLAUDE.md with framework sections
✓ Injected preserved content into LOCAL section

## Step 5: Framework File Installation

Installing framework files...
  ✓ 16 commands (1 skipped: deploy.md → local version)
  ✓ 12 agents
  ✓ 8 skills
  ✓ 3 hooks
  ✓ backlog/ structure

## Step 6: Reference Updates

Updating command references in all files...
  ✓ Updated 2 references to renamed files
  ✓ No broken references detected

## Migration Complete

### Summary
| Action | Count |
|--------|-------|
| Custom files preserved | 3 |
| Files renamed | 1 |
| Framework files added | 39 |
| References updated | 2 |

### Rollback
Backup: .claude-backup-2026-01-11T14-30-00/
Command: /sync-rollback 2026-01-11T14-30-00
```

**After**:
```
my-project/
├── .claude/
│   ├── commands/
│   │   ├── local-deploy.md       # Renamed (was: deploy.md)
│   │   ├── my-script.md          # Preserved
│   │   ├── generate-epics.md     # Framework
│   │   ├── generate-task.md      # Framework
│   │   └── ... (13 more)
│   ├── agents/
│   │   ├── custom-agent.md       # Preserved
│   │   ├── task-research.md      # Framework
│   │   └── ... (11 more)
│   ├── skills/                   # Framework
│   └── hooks/                    # Framework
├── backlog/                      # Framework
├── CLAUDE.md                     # Generated (with LOCAL section)
├── .mcp.base.json               # Framework MCPs
├── .mcp.local.json              # Moved from .mcp.json
├── .mcp.json                    # Merged output
└── .claude-backup-2026-01-11T14-30-00/  # Rollback backup
```

**Diff: deploy.md Rename**:
```diff
# File paths changed
- .claude/commands/deploy.md
+ .claude/commands/local-deploy.md

# Reference in CLAUDE.md updated
- | `/deploy` | Deploy to production |
+ | `/local-deploy` | Deploy to production (custom) |

# Reference in custom-agent.md updated
- See /deploy for deployment steps
+ See /local-deploy for deployment steps
```

### Example 3: Strategy C - Version Upgrade with LOCAL Preservation

**Before**:
```
my-app/
├── .claude/
│   ├── commands/
│   │   ├── commit.md             # v0.28.0 with LOCAL section
│   │   ├── refine.md             # v0.28.0
│   │   └── develop-task.md       # v0.28.0
│   ├── agents/
│   │   └── code-reviewer.md      # v0.28.0 with LOCAL
│   └── skills/
│       └── tdd-workflow/         # v0.28.0
└── CLAUDE.md                     # v0.28.0 with LOCAL section
```

**Command**:
```bash
/sync-migrate
```

**Output**:
```
## Pre-Migration Assessment

### Current State
| Metric | Value |
|--------|-------|
| Total files in .claude/ | 5 |
| Framework files | 5 |
| Custom files | 0 |
| Version detected | 0.28.0 |
| Target version | 0.35.0 |

### Version Detection
Current framework: v0.28.0
Target framework: v0.35.0
Upgrade needed: Yes (7 minor versions)

### LOCAL Section Analysis
Files with LOCAL content:
  • commands/commit.md (2 sections, 45 lines)
  • agents/code-reviewer.md (1 section, 12 lines)
  • CLAUDE.md (1 section, 78 lines)

### Recommended Strategy
Strategy C: Old Version Upgrade
Reason: Framework v0.28.0 detected, upgrade to v0.35.0

## Step 1: Creating Backup

✓ Created backup: .claude-backup-2026-01-11T15-00-00/
✓ Backup includes: 5 framework files, 1 CLAUDE.md

## Step 2: Preserving LOCAL Sections

Extracting LOCAL content before upgrade...

commands/commit.md:
  ✓ Section 1 (lines 45-67): Custom pre-commit validation
  ✓ Section 2 (lines 120-142): Team commit message format

agents/code-reviewer.md:
  ✓ Section 1 (lines 89-100): Company coding standards

CLAUDE.md:
  ✓ Section 1 (lines 156-233): Project-specific notes

Total: 4 LOCAL sections preserved (135 lines)

## Step 3: Upgrading Framework Files

Replacing with v0.35.0 versions...

| File | Action | LOCAL Injected |
|------|--------|----------------|
| commands/commit.md | Upgraded | 2 sections ✓ |
| commands/refine.md | Upgraded | - |
| commands/develop-task.md | Upgraded | - |
| agents/code-reviewer.md | Upgraded | 1 section ✓ |
| skills/tdd-workflow/SKILL.md | Upgraded | - |

## Step 4: Adding New Framework Files

v0.29.0 additions:
  ✓ commands/sync-remote.md
  ✓ commands/sync-add.md
  ✓ commands/sync-pull.md
  ✓ commands/sync-push.md
  ✓ skills/git-sync-patterns/

v0.30.0 additions:
  ✓ commands/sync-status.md
  ✓ commands/sync-watermark.md
  ✓ skills/git-sync-patterns/conflict-detection.md

v0.31.0 additions:
  ✓ commands/sync-check-version.md
  ✓ agents/sync-version-validator.md
  ✓ skills/config-merging-patterns/

v0.32.0-0.35.0 additions:
  ✓ commands/sync-parse-claude.md
  ✓ commands/sync-mcp-merge.md
  ✓ commands/sync-analyze.md
  ✓ commands/sync-scaffold.md
  ✓ commands/sync-migrate.md
  ✓ skills/framework-scaffolding-patterns/

## Step 5: CLAUDE.md Update

Updating metadata and preserving LOCAL...
  ✓ version: 0.28.0 → 0.35.0
  ✓ last_sync: 2026-01-11
  ✓ LOCAL section preserved (78 lines)
  ✓ New features documented

## Upgrade Complete

### Summary
| Metric | Value |
|--------|-------|
| Files upgraded | 5 |
| New files added | 18 |
| LOCAL sections preserved | 4 (135 lines) |
| Versions spanned | 7 (0.28→0.35) |

### New Features Available
- Sync commands (v0.29.0): /sync-remote, /sync-add, /sync-pull, /sync-push
- Conflict detection (v0.30.0): /sync-status, /sync-watermark
- Version checking (v0.31.0): /sync-check-version
- Config merging (v0.32.0): /sync-mcp-merge, section parser
- Framework scaffolding (v0.33-0.35): /sync-analyze, /sync-scaffold, /sync-migrate

### Rollback
Backup: .claude-backup-2026-01-11T15-00-00/
Command: /sync-rollback 2026-01-11T15-00-00
```

**Diff: LOCAL Section Preservation in commit.md**:
```diff
# Framework content updated from v0.28.0 to v0.35.0
- ## Old Framework Section
- Old content from v0.28.0...
+ ## New Framework Section
+ Updated content for v0.35.0...
+ New validation patterns...

# LOCAL section preserved exactly as-is
  <!-- LOCAL_START -->
  ## Custom Pre-Commit Validation

  Our team requires:
  - JIRA ticket reference in commit message
  - Signed-off-by line
  <!-- LOCAL_END -->

  [... more framework content ...]

  <!-- LOCAL_START -->
  ## Team Commit Message Format

  Format: [TEAM-XXX] type: description
  <!-- LOCAL_END -->
```

### Example 4: Strategy D - Minimal Addition (User Selective)

**Before**:
```
large-project/
├── .claude/
│   ├── commands/           # 15 custom commands
│   ├── agents/             # 8 custom agents
│   └── skills/             # 2 custom skills
└── CLAUDE.md               # Extensive custom documentation
```

**Command**:
```bash
/sync-migrate
```

**Output**:
```
## Pre-Migration Assessment

### Current State
| Metric | Value |
|--------|-------|
| Total files in .claude/ | 25 |
| Framework files | 0 |
| Custom files | 25 |
| Critical collisions | 4 |

### Recommended Strategy
Strategy D: Minimal Addition
Reason: >10 custom files, preservation priority

(Override: Use --strategy B for full migration)

## Step 1: Identifying Missing Framework Files

Analyzing framework manifest vs. existing files...

Missing (32 files):

### Commands (14 missing)
  [ ] generate-epics.md - Epic generation with Serena
  [ ] generate-task.md - Task creation
  [ ] refine.md - Implementation planning
  [ ] develop-task.md - TDD execution
  [ ] list-epics.md - Epic listing
  [ ] list-tasks.md - Task listing
  [ ] suggest-task.md - Task recommendation
  [ ] update-task.md - Status updates
  [ ] help.md - Command documentation
  [ ] audit.md - Meta-audit system
  [ ] sync-remote.md - Git remote setup
  [ ] sync-add.md - Framework installation
  [ ] sync-pull.md - Hub updates
  [ ] sync-push.md - Contribute back

### Agents (12 missing)
  [ ] task-research.md
  [ ] task-code-impact.md
  [ ] task-test-planning.md
  ... (9 more)

### Skills (6 missing)
  [ ] task-discovery/
  [ ] tdd-workflow/
  [ ] error-handling/
  ... (3 more)

## Step 2: User Selection

Add all 32 missing files? [Y/n/select] select

Select files to add:
  [x] generate-task.md - Essential for task workflow
  [x] refine.md - Implementation planning
  [x] develop-task.md - TDD execution
  [x] list-tasks.md - Task listing
  [x] suggest-task.md - Recommendations
  [x] update-task.md - Status updates
  [x] help.md - Documentation
  [ ] generate-epics.md - (you have custom epic system)
  [ ] audit.md - (not needed now)
  ... (showing core commands)

  [x] task-research.md
  [x] task-code-impact.md
  [x] develop-step-verifier.md
  ... (agents selection)

  [x] task-discovery/
  [x] tdd-workflow/
  [x] error-handling/

  Selected: 18 files (14 skipped)

## Step 3: Adding Selected Files

Installing selected framework files...
  ✓ 7 commands
  ✓ 6 agents
  ✓ 3 skills
  ✓ 2 hooks

## Step 4: Backlog Structure

Create backlog/ structure? [Y/n] y
  ✓ backlog/epics/
  ✓ backlog/tasks/
  ✓ backlog/templates/
  ✓ backlog/working/
  ✓ backlog/epics.json
  ✓ backlog/tasks.json

## Step 5: CLAUDE.md Update

Update CLAUDE.md with framework documentation? [Y/n/append] append

Appending framework sections to existing CLAUDE.md...
  ✓ Added "Framework Commands" section
  ✓ Added "Available Agents" section
  ✓ Existing content preserved

## Migration Complete

### Summary
| Action | Count |
|--------|-------|
| Files added | 18 |
| Files skipped | 14 |
| Existing files | Untouched |
| Backlog structure | Created |

### What's Installed
- Core task workflow: /generate-task → /refine → /develop-task
- Task management: /list-tasks, /suggest-task, /update-task
- Documentation: /help
- Supporting agents and skills

### What's NOT Installed (by choice)
- Epic system: /generate-epics, /list-epics
- Audit system: /audit and related agents
- Sync commands: /sync-*

Add more later with: /sync-migrate --strategy D
```

**After**:
```
large-project/
├── .claude/
│   ├── commands/
│   │   ├── [15 custom commands]   # Untouched
│   │   ├── generate-task.md       # NEW
│   │   ├── refine.md              # NEW
│   │   ├── develop-task.md        # NEW
│   │   ├── list-tasks.md          # NEW
│   │   ├── suggest-task.md        # NEW
│   │   ├── update-task.md         # NEW
│   │   └── help.md                # NEW
│   ├── agents/
│   │   ├── [8 custom agents]      # Untouched
│   │   ├── task-research.md       # NEW
│   │   └── ... (5 more new)
│   ├── skills/
│   │   ├── [2 custom skills]      # Untouched
│   │   ├── task-discovery/        # NEW
│   │   ├── tdd-workflow/          # NEW
│   │   └── error-handling/        # NEW
│   └── hooks/
│       ├── commit-validator.md    # NEW
│       └── working-docs-location.md # NEW
├── backlog/                       # NEW structure
├── CLAUDE.md                      # Appended (existing preserved)
└── .mcp.base.json                # NEW
```

### Example 5: Dry-Run Preview

Preview migration plan without making changes:

**Command**:
```bash
/sync-migrate --dry-run
```

**Output**:
```
## Migration Preview (Dry Run)

### Current State
| Metric | Value |
|--------|-------|
| Strategy | B (Custom Migration) |
| Custom files | 5 |
| Collisions | 2 |

### Planned Actions

#### Step 1: Backup
Would create: .claude-backup-2026-01-11T16-00-00/
  - .claude/ (5 files)
  - CLAUDE.md
  - .mcp.json

#### Step 2: Collision Resolution
Would rename:
  - deploy.md → local-deploy.md
  - commit.md → local-commit.md

#### Step 3: MCP Migration
Would move: .mcp.json → .mcp.local.json
Would create: .mcp.base.json

#### Step 4: Framework Installation
Would add:
  - 14 commands
  - 12 agents
  - 8 skills
  - 3 hooks
  - backlog/ structure

#### Step 5: CLAUDE.md
Would preserve existing content in LOCAL section
Would generate new framework documentation

### Summary
┌─────────────────────────────────────────┐
│ Backup created: Yes                      │
│ Files renamed: 2                         │
│ Files added: 42                          │
│ Total changes: 44 files                  │
│ Estimated time: ~5 seconds               │
└─────────────────────────────────────────┘

No changes made. Remove --dry-run to apply.
```

### Key Transformation: Strategy Selection Flow

Shows how `/sync-analyze` context determines migration strategy:

```
┌──────────────────────────────────────────────────────────────────┐
│                      /sync-analyze                                │
│                                                                   │
│  TargetContext = {                                               │
│    has_claude_dir: true/false                                    │
│    framework_files: [...],                                       │
│    custom_files: [...],                                          │
│    collisions: [...],                                            │
│    migration_strategy: "A"|"B"|"C"|"D"                          │
│  }                                                               │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Strategy Selection                             │
│                                                                   │
│  if !has_claude_dir:                                             │
│    Strategy A → /sync-scaffold                                   │
│                                                                   │
│  elif framework_files.length > 0:                                │
│    Strategy C → Version Upgrade (preserve LOCAL)                 │
│                                                                   │
│  elif custom_files.length > 10:                                  │
│    Strategy D → Minimal Addition (user selects)                  │
│                                                                   │
│  else:                                                           │
│    Strategy B → Custom Migration (rename collisions)             │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      /sync-migrate                                │
│                                                                   │
│  1. Backup (always)                                              │
│  2. Strategy-specific migration                                  │
│  3. MCP configuration merge                                      │
│  4. CLAUDE.md generation (preserve LOCAL)                        │
│  5. Validation                                                   │
│  6. Summary + rollback info                                      │
└──────────────────────────────────────────────────────────────────┘
```

### Unified Diff: Before/After Migration (Strategy B)

Complete diff showing transformation:

```diff
# Directory structure changes
  my-project/
  ├── .claude/
  │   ├── commands/
- │   │   ├── deploy.md
+ │   │   ├── local-deploy.md          # Renamed
  │   │   ├── my-script.md              # Preserved
+ │   │   ├── generate-epics.md         # NEW
+ │   │   ├── generate-task.md          # NEW
+ │   │   ├── refine.md                 # NEW
+ │   │   └── ... (13 more framework)
  │   ├── agents/
  │   │   └── custom-agent.md           # Preserved
+ │   │   ├── task-research.md          # NEW
+ │   │   └── ... (11 more framework)
+ │   ├── skills/                       # NEW directory
+ │   │   ├── task-discovery/
+ │   │   ├── tdd-workflow/
+ │   │   └── error-handling/
+ │   └── hooks/                        # NEW directory
+ │       ├── commit-validator.md
+ │       └── working-docs-location.md
+ ├── backlog/                          # NEW structure
+ │   ├── epics/
+ │   ├── tasks/
+ │   ├── templates/
+ │   ├── working/
+ │   ├── epics.json
+ │   └── tasks.json
- ├── .mcp.json                         # Moved to .mcp.local.json
+ ├── .mcp.base.json                    # NEW (framework MCPs)
+ ├── .mcp.local.json                   # Moved from .mcp.json
+ ├── .mcp.json                         # NEW (merged output)
- └── CLAUDE.md                         # Replaced
+ ├── CLAUDE.md                         # NEW (with LOCAL section)
+ └── .claude-backup-TIMESTAMP/         # NEW (rollback)
```
