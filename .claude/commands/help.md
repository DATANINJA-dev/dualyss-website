---
description: Display available commands and usage information
allowed-tools: Glob, Read
argument-hint: [command]
---

# help

Display available commands grouped by purpose, with usage examples.

## Parameter

$ARGUMENTS = (optional) Specific command name for detailed help

## Instructions

### If No Arguments: Show Command Overview

Display the following command reference:

```
## simon_tools v0.43.0

A meta-framework for Claude Code that standardizes development through typed epics, semantic matching, and comprehensive task preparation.

### Create Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/generate-epics` | Create epics with audience detection | `/generate-epics "idea" [--audience personal\|team\|public]` |
| `/generate-task` | Create task linked to epic | `/generate-task "idea" -e EPIC-001` |

### Plan Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/refine` | Implementation plan for task | `/refine TASK-001` |
| `/develop-task` | TDD execution of plan | `/develop-task TASK-001` |

### Manage Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/list-epics` | List epics with progress | `/list-epics [filter]` |
| `/list-tasks` | List tasks with filtering | `/list-tasks epic:EPIC-001` |
| `/suggest-task` | AI-powered task recommendation | `/suggest-task` |
| `/update-task` | Update task status | `/update-task TASK-001 done` |

### Distribution Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/framework init` | Bootstrap in new project | `/framework init [--standard]` |
| `/framework install` | Add to existing project | `/framework install [--backup]` |

### Meta Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `/audit` | Full quality audit | `/audit` |
| `/audit:quick` | Fast critical check | `/audit:quick` |
| `/audit:mcp` | MCP server analysis | `/audit:mcp` |
| `/audit:gaps` | Gap analysis with research | `/audit:gaps` |
| `/audit:enhancement` | Enhancement opportunities | `/audit:enhancement` |

### Quick Start
1. **Create epic**: `/generate-epics "your product idea"`
2. **Create task**: `/generate-task "your task" -e EPIC-001`
3. **Plan task**: `/refine TASK-001`
4. **Build task**: `/develop-task TASK-001`

### Common Flags
| Flag | Short | Commands | Description |
|------|-------|----------|-------------|
| `--epic` | `-e` | generate-task, list-tasks | Specify epic ID |
| `--resume` | `-r` | refine, develop-task, audit | Resume interrupted |
| `--quick` | `-q` | refine, develop-task, audit | Quick/fast mode |
| `--audience` | | generate-epics | Override audience (personal/team/public) |
| `--watch` | | audit | Continuous monitoring |
| `--backup` | | framework install | Force backup creation |
| `--force` | | framework install | Skip confirmations |
| `--verbose` | `-v` | refine, develop-task, generate-* | Show detailed progress |
| `--quiet` | | refine, develop-task, generate-*, audit | Suppress progress output |

### Progress Output Control
Control verbosity of command output:
- Default: Minimal progress indicators (phase names, agent status)
- `--verbose/-v`: Detailed output with timestamps, durations, paths
- `--quiet`: No progress output, only results (for scripting/CI)

Note: `--verbose` and `--quiet` are mutually exclusive. `--quiet` has no short form to avoid conflict with `-q` (quick mode).

### Getting Help
- `/help` - This overview
- `/help [command]` - Detailed help for a command
- See CLAUDE.md for full documentation

### Error Reference
All commands use standardized error codes:
- **E0XX**: Input validation errors (bad ID, missing argument)
- **E1XX**: File system errors (file not found, permission denied)
- **E2XX**: Agent/execution errors (timeout, QA failure)
- **E3XX**: Configuration errors (MCP not configured)

Run with `-v` for verbose output including stack traces.
Full reference: `.claude/skills/error-handling/error-codes.md`
```

### If Command Specified: Show Detailed Help

1. **Parse command name**:
   - Remove leading `/` if present
   - Handle sub-commands like `audit:quick` → look for `audit-quick.md`

2. **Check if command exists**:
   ```
   command_file = ".claude/commands/{command}.md"
   If command contains ":", replace ":" with "-"
   ```

3. **If command file exists**:
   - Read the file
   - Extract and display:
     - Description (from frontmatter)
     - Argument hint (from frontmatter)
     - First section after frontmatter (usage/instructions)

   Format output as:
   ```
   ## /{command}

   {description}

   **Usage**: `/{command} {argument-hint}`

   {first section content}
   ```

4. **If command not found**:
   ```
   [ERROR] E005: Command "/{command}" not found

   Details: No command file found at .claude/commands/{command}.md

   Suggested fix:
     → Run `/help` to see all available commands
     → Check command spelling

   Did you mean?
   - [suggest similar commands based on name]
   ```

## Error Handling

| Situation | Error | Exit |
|-----------|-------|------|
| No argument (overview) | (Success - show command list) | 0 |
| Valid command | (Success - show command help) | 0 |
| Command not found | [ERROR] E005: Command "[name]" not found | 1 |
| Command file unreadable | [ERROR] E107: Could not read command file | 2 |

**Error Format Reference**: See `.claude/skills/error-handling/error-codes.md`

## Examples

### Overview
```
> /help

## simon_tools v0.43.0
[full command list as shown above]
```

### Specific Command
```
> /help generate-task

## /generate-task

Generate a new task through intelligent discovery with specialized analysis agents.

**Usage**: `/generate-task [idea] [-e EPIC-XXX]`

Creates a task in the backlog using 8 specialized subagents to analyze:
- Code impact
- Test requirements
- Security implications
- UX considerations
- API integrations
- Documentation needs
- Design system alignment
```

### Command Not Found
```
> /help genrate-task

Command "/genrate-task" not found.

Run `/help` to see all available commands.

Did you mean?
- /generate-task
- /generate-epics
```
