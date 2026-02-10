# Scaffolding Templates

Patterns for generating framework directory structure in target projects. Templates define what files and directories to create based on installation level and project context.

## Overview

Scaffolding creates the framework structure in target projects. The process is:

1. Load target context (from context detection)
2. Select installation level (minimal, standard, full)
3. Generate directory structure from templates
4. Apply stack-specific customizations
5. Validate generated structure

## Base Directory Structure

### Full Framework Layout

```
project/
├── .claude/
│   ├── commands/              # Slash commands
│   │   ├── generate-epics.md
│   │   ├── generate-task.md
│   │   ├── refine.md
│   │   ├── develop-task.md
│   │   ├── list-epics.md
│   │   ├── list-tasks.md
│   │   ├── suggest-task.md
│   │   ├── update-task.md
│   │   ├── help.md
│   │   ├── audit.md
│   │   ├── sync-remote.md
│   │   ├── sync-add.md
│   │   ├── sync-pull.md
│   │   ├── sync-push.md
│   │   ├── sync-status.md
│   │   └── sync-watermark.md
│   ├── agents/                # Subagent definitions
│   │   ├── epic-semantic-matcher.md
│   │   ├── task-research.md
│   │   ├── task-code-impact.md
│   │   ├── task-test-planning.md
│   │   ├── task-security.md
│   │   ├── task-ux.md
│   │   ├── develop-context-analyzer.md
│   │   ├── develop-step-verifier.md
│   │   └── develop-test-verifier.md
│   ├── skills/                # Passive knowledge skills
│   │   ├── task-discovery/
│   │   ├── epic-discovery/
│   │   ├── tdd-workflow/
│   │   ├── error-handling/
│   │   └── git-sync-patterns/
│   ├── hooks/                 # Event-triggered validations
│   │   ├── commit-validator.md
│   │   └── working-docs-location.md
│   └── settings.local.json    # Local settings (git-ignored)
├── backlog/
│   ├── epics/                 # Epic markdown files
│   ├── tasks/                 # Task markdown files
│   ├── templates/             # Task templates
│   ├── working/               # Temporary working docs
│   ├── epics.json             # Epic index
│   └── tasks.json             # Task index
├── CLAUDE.md                  # Project instructions
├── .mcp.base.json             # Framework MCPs (tracked)
└── .mcp.local.json            # Project MCPs (git-ignored)
```

## Installation Levels

### Level 1: Minimal

Essential files only for basic framework functionality:

```
project/
├── CLAUDE.md                  # Project instructions
├── backlog/
│   ├── epics.json             # Empty: { "epics": [] }
│   └── tasks.json             # Empty: { "tasks": [] }
└── .mcp.base.json             # Framework MCPs only
```

**Use when**:
- Quick trial of framework
- Very small projects
- Users who want incremental adoption

### Level 2: Standard (Recommended)

Core commands and essential agents:

```
project/
├── .claude/
│   ├── commands/
│   │   ├── generate-task.md
│   │   ├── refine.md
│   │   ├── develop-task.md
│   │   ├── list-tasks.md
│   │   ├── suggest-task.md
│   │   ├── update-task.md
│   │   └── help.md
│   ├── agents/
│   │   ├── task-research.md
│   │   ├── task-code-impact.md
│   │   └── develop-step-verifier.md
│   ├── skills/
│   │   ├── task-discovery/
│   │   ├── tdd-workflow/
│   │   └── error-handling/
│   └── hooks/
│       └── commit-validator.md
├── backlog/
│   ├── epics/
│   ├── tasks/
│   ├── templates/
│   ├── working/
│   ├── epics.json
│   └── tasks.json
├── CLAUDE.md
├── .mcp.base.json
└── .mcp.local.json
```

**Use when**:
- Most projects
- Task-focused workflow
- Don't need epic management

### Level 3: Full

Complete framework with all components:

```
[Full structure as shown in Base Directory Structure]
```

**Use when**:
- Product development with epics
- Need audit capabilities
- Want sync functionality
- Large team projects

## CLAUDE.md Generation Template

### Template Structure

```markdown
# {project_name}

<!-- simon_tools_meta
version: {framework_version}
created: {date}
last_sync: {date}
project_stack: {detected_stacks}
customized_files: []
-->

{project_description}

## Requirements

**Serena MCP** is required for semantic code understanding. Configuration in `.mcp.json`.

## What

### Structure
```
{generated_structure_tree}
```

### Hierarchy

```
EPIC (with optional embedded PRD)
    └── TASK (actionable unit)
            └── SET-UP (implementation plan)
                    └── DEVELOP (TDD execution)
```

- **Epic**: Planning unit. Contains PRD for product-scale ideas.
- **Task**: Work unit. Linked to epic via `epic_id`.
- **Set-up**: Comprehensive implementation plan before coding.
- **Develop**: TDD-enforced execution of the implementation plan.

## How

### Core Commands

{command_table_based_on_level}

### Workflow

{workflow_diagram}

## Features

{features_based_on_level}

<!-- LOCAL_START -->
## Project-Specific Notes

Add your project-specific documentation here. This section is preserved during sync.

<!-- LOCAL_END -->

## Notes

- Framework v{version} installed on {date}
- Installation level: {level}
- Tech stack: {stack}
```

### Metadata Section

The metadata comment tracks installation state:

```markdown
<!-- simon_tools_meta
version: 0.31.0              # Framework version installed
created: 2026-01-10          # Initial installation date
last_sync: 2026-01-10        # Last sync with hub
sync_watermark: abc123       # Git commit for sync tracking
hub_commit: def456           # Hub commit at last sync
local_commit: ghi789         # Local commit at last sync
project_stack: ["nodejs", "typescript"]
customized_files: ["commands/deploy.md"]
-->
```

### LOCAL Markers

Preserve user content during syncs:

```markdown
<!-- LOCAL_START -->
This content is preserved during framework updates.
Add project-specific notes, conventions, or custom documentation here.
<!-- LOCAL_END -->
```

## .mcp.base.json Generation

### Base Template

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["serena", "--projects-config", ".serena/projects.yaml"],
      "type": "stdio"
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "type": "stdio",
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Stack-Specific Additions

Based on detected tech stack, add relevant MCPs:

| Stack | Additional MCPs |
|-------|-----------------|
| Node.js | `nodejs-mcp` for npm/yarn integration |
| Python | `python-mcp` for pip/poetry |
| TypeScript | Include TypeScript support in serena config |
| Database (detected) | `postgres-mcp`, `mysql-mcp`, etc. |

## Interactive Customization Flow

### Dry Run Mode

Show what would be created without making changes:

```
/sync-add --dry-run

## Scaffolding Preview (Dry Run)

The following structure would be created:

### Directories to Create
✓ .claude/
✓ .claude/commands/
✓ .claude/agents/
✓ .claude/skills/
✓ backlog/
✓ backlog/epics/
✓ backlog/tasks/

### Files to Create
✓ CLAUDE.md (2.5 KB)
✓ .mcp.base.json (0.4 KB)
✓ .mcp.local.json (0.1 KB)
✓ .claude/commands/generate-task.md (3.2 KB)
✓ .claude/commands/refine.md (8.1 KB)
... (15 more files)

### Files to Rename (collisions)
⚠ deploy.md → local-deploy.md

### Total
- 8 directories
- 22 files
- 45.2 KB total

No changes made. Run without --dry-run to apply.
```

### Confirm Mode

Ask before each major operation:

```
/sync-add --confirm

## Step 1: Create Directories

Create .claude/commands/? [Y/n/all] y
Create .claude/agents/? [Y/n/all] y
Create .claude/skills/? [Y/n/all] all
Creating remaining directories...

## Step 2: Create Core Files

Create CLAUDE.md? [Y/n/all] y
Create .mcp.base.json? [Y/n/all] y

## Step 3: Copy Framework Files

Copy 22 files to .claude/? [Y/n/all] all
Copying files...

## Step 4: Handle Collisions

deploy.md exists. Rename to local-deploy.md? [Y/n/skip] y
Renamed: deploy.md → local-deploy.md

## Complete
Framework installed successfully.
```

### Force Mode

Skip all confirmations:

```
/sync-add --force

Installing framework (no confirmations)...
✓ Created 8 directories
✓ Created 22 files
✓ Renamed 1 collision
✓ Updated .gitignore

Framework installed successfully.
```

## Generated Structure Examples

### Example 1: Minimal Install

```
Project: my-quick-project
Level: Minimal
Stack: Python (detected)

Generated:
my-quick-project/
├── CLAUDE.md              # 1.2 KB
├── backlog/
│   ├── epics.json         # 22 bytes
│   └── tasks.json         # 22 bytes
└── .mcp.base.json         # 0.4 KB

Total: 3 files, 1.6 KB
```

### Example 2: Standard Install (Node.js)

```
Project: my-app
Level: Standard
Stack: Node.js + TypeScript + React

Generated:
my-app/
├── .claude/
│   ├── commands/          # 7 commands
│   ├── agents/            # 3 agents
│   ├── skills/            # 3 skills
│   └── hooks/             # 1 hook
├── backlog/
│   ├── epics/
│   ├── tasks/
│   ├── templates/
│   │   └── feature.md
│   ├── working/
│   ├── epics.json
│   └── tasks.json
├── CLAUDE.md              # 3.5 KB
├── .mcp.base.json         # 0.5 KB
└── .mcp.local.json        # 0.1 KB

Total: 18 files, 35 KB
```

### Example 3: Full Install with Migration

```
Project: enterprise-app
Level: Full
Stack: Node.js + TypeScript
Migration: Strategy B (Custom files preserved)

Before:
enterprise-app/
├── .claude/
│   ├── commands/
│   │   ├── deploy.md      # Custom
│   │   └── my-script.md   # Custom
│   └── agents/
│       └── custom-agent.md
└── .mcp.json              # Existing MCPs

After:
enterprise-app/
├── .claude/
│   ├── commands/
│   │   ├── local-deploy.md    # Renamed from deploy.md
│   │   ├── my-script.md       # Preserved
│   │   ├── generate-epics.md  # Framework
│   │   ├── generate-task.md   # Framework
│   │   ├── refine.md          # Framework
│   │   └── ... (12 more)
│   ├── agents/
│   │   ├── custom-agent.md    # Preserved
│   │   ├── epic-semantic-matcher.md  # Framework
│   │   └── ... (8 more)
│   ├── skills/                # Framework
│   └── hooks/                 # Framework
├── backlog/                   # Framework
├── CLAUDE.md                  # Generated
├── .mcp.base.json            # Framework MCPs
└── .mcp.local.json           # Moved from .mcp.json

Preserved: 3 custom files
Renamed: 1 file (deploy.md → local-deploy.md)
Created: 45 new files
```

## Template Variables

Variables replaced during generation:

| Variable | Description | Example |
|----------|-------------|---------|
| `{project_name}` | Directory name | "my-project" |
| `{project_description}` | From package.json or user input | "A web application" |
| `{framework_version}` | Current framework version | "0.31.0" |
| `{date}` | ISO date | "2026-01-10" |
| `{detected_stacks}` | Array of stacks | ["nodejs", "typescript"] |
| `{level}` | Installation level | "standard" |
| `{command_table}` | Generated based on level | Markdown table |
| `{structure_tree}` | Generated structure | ASCII tree |

## Validation After Scaffolding

After generation, validate the structure:

```
function validateScaffolding(projectRoot, level):
  errors = []
  warnings = []

  // Check required files exist
  requiredFiles = getRequiredFiles(level)
  for file in requiredFiles:
    if not exists(projectRoot + "/" + file):
      errors.push("Missing required file: " + file)

  // Validate CLAUDE.md
  claudeMd = readFile(projectRoot + "/CLAUDE.md")
  if not claudeMd.contains("<!-- simon_tools_meta"):
    errors.push("CLAUDE.md missing metadata section")

  // Validate .mcp.base.json
  try:
    mcpBase = parseJson(readFile(projectRoot + "/.mcp.base.json"))
    if not mcpBase.mcpServers:
      errors.push(".mcp.base.json missing mcpServers")
  catch:
    errors.push(".mcp.base.json is not valid JSON")

  // Check directory structure
  requiredDirs = getRequiredDirs(level)
  for dir in requiredDirs:
    if not isDirectory(projectRoot + "/" + dir):
      errors.push("Missing required directory: " + dir)

  // Validate JSON indexes
  for jsonFile in ["backlog/epics.json", "backlog/tasks.json"]:
    try:
      parseJson(readFile(projectRoot + "/" + jsonFile))
    catch:
      errors.push(jsonFile + " is not valid JSON")

  // Check .gitignore updates
  gitignore = readFile(projectRoot + "/.gitignore")
  requiredIgnores = [".mcp.json", ".mcp.local.json", "settings.local.json"]
  for ignore in requiredIgnores:
    if not gitignore.contains(ignore):
      warnings.push(".gitignore should include: " + ignore)

  return { errors: errors, warnings: warnings, valid: errors.length == 0 }
```

### Validation Report

```
## Scaffolding Validation

### Structure Check
✓ .claude/ directory exists
✓ .claude/commands/ contains 7 files
✓ .claude/agents/ contains 3 files
✓ backlog/ directory exists
✓ backlog/epics.json is valid JSON
✓ backlog/tasks.json is valid JSON

### File Validation
✓ CLAUDE.md has metadata section
✓ CLAUDE.md has LOCAL markers
✓ .mcp.base.json is valid
✓ .mcp.base.json has serena server

### Git Configuration
✓ .gitignore includes .mcp.json
✓ .gitignore includes .mcp.local.json
⚠ .gitignore missing settings.local.json

### Result
Status: PASS (1 warning)
Warning: Add 'settings.local.json' to .gitignore
```

## Claude Code Implementation Examples

Real `/sync-scaffold` command output extracted from TASK-092 implementation. Shows scaffolding patterns in action across all installation levels.

### Example 1: Dry-Run Preview

Shows scaffolding plan without creating files:

**Command**:
```bash
/sync-scaffold --dry-run
```

**Output**:
```
## Scaffolding Preview (Dry Run)

### Target Project Context

| Property | Value |
|----------|-------|
| Project | my-new-project |
| Has .claude/ | No |
| Strategy | A (Fresh Install) |
| Tech Stack | nodejs |
| Recommended Level | standard |
| Collisions | 0 |

### Directories to Create
✓ .claude/
✓ .claude/commands/
✓ .claude/agents/
✓ .claude/skills/
✓ .claude/hooks/
✓ backlog/
✓ backlog/epics/
✓ backlog/tasks/
✓ backlog/templates/
✓ backlog/working/

### Files to Generate
✓ CLAUDE.md (3.5 KB)
✓ .mcp.base.json (0.5 KB)
✓ .mcp.local.json (0.1 KB)
✓ backlog/epics.json (22 bytes)
✓ backlog/tasks.json (22 bytes)
✓ backlog/templates/feature.md (1.2 KB)
✓ .claude/commands/generate-task.md (3.2 KB)
✓ .claude/commands/refine.md (8.1 KB)
✓ .claude/commands/develop-task.md (12.5 KB)
... (8 more files)

### Summary
┌─────────────────────────────────────────┐
│ Directories: 10                          │
│ Files: 18                                │
│ Total size: ~35 KB                       │
│ Collisions: 0                            │
└─────────────────────────────────────────┘

No changes made. Remove --dry-run to apply.
```

### Example 2: Minimal Level Installation

Quick trial with essential files only:

**Command**:
```bash
/sync-scaffold --level minimal --no-interactive
```

**Before**:
```
my-quick-project/
├── package.json
├── src/
│   └── index.ts
└── README.md
```

**After**:
```
my-quick-project/
├── package.json
├── src/
│   └── index.ts
├── README.md
├── CLAUDE.md                  # NEW: Project instructions
├── backlog/                   # NEW
│   ├── epics.json            # NEW: { "epics": [] }
│   └── tasks.json            # NEW: { "tasks": [] }
└── .mcp.base.json            # NEW: Framework MCPs
```

**Output Summary**:
```
✓ Framework scaffolded successfully

## Installation Summary

| Component | Count |
|-----------|-------|
| Directories | 1 |
| Files | 4 |
| Commands | 0 |
| Agents | 0 |
| Skills | 0 |
| Hooks | 0 |

## Next Steps
1. Review CLAUDE.md for project configuration
2. Create .mcp.json: `/sync-mcp-merge`
3. Run `/help` to see available commands
4. Create your first task: `/generate-task "description"`
```

### Example 3: Standard Level Installation

Recommended for most projects:

**Command**:
```bash
/sync-scaffold --level standard
```

**Interactive Prompt**:
```
## Installation Level

Based on your project, we recommend: standard

Header: "Level"
Options:
- Minimal: CLAUDE.md + backlog indexes only (quick trial)
- Standard: Core commands + essential agents (Recommended)
- Full: Complete framework with all components

[Selected: Standard]

## Scaffolding Plan

### Directories to Create
✓ .claude/
✓ .claude/commands/
✓ .claude/agents/
✓ .claude/skills/
✓ .claude/hooks/
✓ backlog/
✓ backlog/epics/
✓ backlog/tasks/
✓ backlog/templates/
✓ backlog/working/

Proceed? [Y/n]
```

**After**:
```
my-app/
├── .claude/
│   ├── commands/
│   │   ├── generate-task.md
│   │   ├── refine.md
│   │   ├── develop-task.md
│   │   ├── list-tasks.md
│   │   ├── suggest-task.md
│   │   ├── update-task.md
│   │   └── help.md
│   ├── agents/
│   │   ├── task-research.md
│   │   ├── task-code-impact.md
│   │   └── develop-step-verifier.md
│   ├── skills/
│   │   ├── task-discovery/
│   │   ├── tdd-workflow/
│   │   └── error-handling/
│   └── hooks/
│       └── commit-validator.md
├── backlog/
│   ├── epics/
│   ├── tasks/
│   ├── templates/
│   │   ├── feature.md
│   │   ├── bug.md
│   │   └── epic.md
│   ├── working/
│   ├── epics.json
│   └── tasks.json
├── CLAUDE.md
├── .mcp.base.json
└── .mcp.local.json
```

### Example 4: Full Level Installation

Complete framework with all components:

**Command**:
```bash
/sync-scaffold --level full --no-interactive
```

**Output**:
```
✓ Framework scaffolded successfully

## Installation Summary

| Component | Count |
|-----------|-------|
| Directories | 10 |
| Files | 45 |
| Commands | 16 |
| Agents | 9 |
| Skills | 5 |
| Hooks | 2 |

## Files Created
✓ CLAUDE.md
✓ .mcp.base.json
✓ .mcp.local.json
✓ backlog/epics.json
✓ backlog/tasks.json
✓ backlog/templates/feature.md
✓ backlog/templates/bug.md
✓ backlog/templates/epic.md
✓ .claude/commands/generate-epics.md
✓ .claude/commands/generate-task.md
... (35 more files)

## Rollback
To undo this scaffolding:
- Rollback manifest: .backup/scaffold-2026-01-11T10-30-00.json
- Restore command: `/sync-rollback 2026-01-11T10-30-00`
```

### Example 5: Scaffolding with Collisions (--force)

When target has existing framework files:

**Command**:
```bash
/sync-scaffold --force
```

**Before (existing partial setup)**:
```
enterprise-app/
├── .claude/
│   └── commands/
│       └── deploy.md          # Custom command
└── .mcp.json                  # Existing MCPs
```

**Output**:
```
## Scaffolding Plan

### Collision Handling
⚠ .claude/commands/deploy.md would be renamed to local-deploy.md
⚠ .mcp.json would be moved to .mcp.local.json

### Summary
┌─────────────────────────────────────────┐
│ Directories: 10                          │
│ Files: 45                                │
│ Total size: ~85 KB                       │
│ Collisions: 2 (will be renamed)          │
└─────────────────────────────────────────┘

Proceed? [Y/n]
```

**After**:
```
enterprise-app/
├── .claude/
│   ├── commands/
│   │   ├── local-deploy.md   # Renamed from deploy.md
│   │   ├── generate-epics.md # Framework
│   │   ├── generate-task.md  # Framework
│   │   └── ... (13 more)
│   ├── agents/               # Framework
│   ├── skills/               # Framework
│   └── hooks/                # Framework
├── backlog/                  # Framework
├── CLAUDE.md                 # Framework
├── .mcp.base.json           # Framework MCPs
├── .mcp.local.json          # Moved from .mcp.json
└── .backup/
    └── scaffold-2026-01-11T10-30-00.json  # Rollback manifest
```

**Backup Manifest**:
```json
{
  "type": "scaffold",
  "timestamp": "2026-01-11T10:30:00Z",
  "level": "full",
  "context": {
    "project_root": "enterprise-app",
    "migration_strategy": "B",
    "recommended_level": "full"
  },
  "directories_created": [".claude/agents", ".claude/skills", "backlog/"],
  "files_created": ["CLAUDE.md", ".mcp.base.json", "..."],
  "files_backed_up": [".mcp.json"],
  "collisions_renamed": [
    {"from": ".claude/commands/deploy.md", "to": ".claude/commands/local-deploy.md"}
  ]
}
```

### Key Transformation: TargetContext → Scaffolded Project

Shows how `/sync-analyze` context flows into `/sync-scaffold`:

```
┌────────────────────┐      ┌──────────────────┐      ┌─────────────────────┐
│   /sync-analyze    │──────│   TargetContext   │──────│   /sync-scaffold    │
│                    │      │                   │      │                     │
│ - Directory scan   │      │ - has_claude_dir  │      │ - Level selection   │
│ - File classify    │      │ - tech_stack      │      │ - Dir creation      │
│ - Tech detection   │      │ - collisions      │      │ - File generation   │
│ - Collision detect │      │ - strategy        │      │ - Validation        │
└────────────────────┘      │ - recommended_    │      └─────────────────────┘
                            │   level           │
                            └──────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Scaffolded Project │
                         │                     │
                         │ - CLAUDE.md         │
                         │ - .claude/*         │
                         │ - backlog/*         │
                         │ - .mcp.base.json    │
                         │ - .backup/manifest  │
                         └─────────────────────┘
```

### CLAUDE.md Generation Example

Generated CLAUDE.md with project metadata:

```markdown
# my-new-project

<!-- simon_tools_meta
version: 0.34.0
created: 2026-01-11
last_sync: 2026-01-11
project_stack: ["nodejs", "typescript"]
customized_files: []
-->

A Node.js application with TypeScript support.

## Requirements

**Serena MCP** is required for semantic code understanding.

## What

### Structure
```
my-new-project/
├── .claude/
│   ├── commands/     # 7 commands
│   ├── agents/       # 3 agents
│   ├── skills/       # 3 skills
│   └── hooks/        # 1 hook
├── backlog/
│   ├── epics/
│   ├── tasks/
│   └── templates/
├── CLAUDE.md
└── .mcp.base.json
```

<!-- LOCAL_START -->
## Project-Specific Notes

Add your project-specific documentation here. This section is preserved during sync.

<!-- LOCAL_END -->

## Notes

- Framework v0.34.0 installed on 2026-01-11
- Installation level: standard
- Tech stack: nodejs, typescript
```
