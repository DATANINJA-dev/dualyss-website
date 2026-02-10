# Syntax Reference

Complete syntax reference for Claude Code custom slash commands.

## Contents
- [File Location](#file-location)
- [YAML Frontmatter](#yaml-frontmatter)
- [Frontmatter Fields](#frontmatter-fields)
- [Arguments](#arguments)
- [Inline Bash Execution](#inline-bash-execution)
- [Character Budget](#character-budget)
- [Complete Example](#complete-example)

## File Location

- **Project commands:** `.claude/commands/command-name.md`
- **Personal commands:** `~/.claude/commands/command-name.md`
- **Nested:** `.claude/commands/category/command-name.md` → `/project:category:command-name`

## YAML Frontmatter

Must be at the **very top** of the file, before any content:

```yaml
---
description: Short description shown in /help (REQUIRED)
allowed-tools: Tool1, Tool2, Tool3 (RECOMMENDED)
argument-hint: [arg-name] (if command takes arguments)
model: claude-3-5-haiku-20241022 (optional - override default model)
disable-model-invocation: true (optional - prevent Claude from auto-invoking)
---
```

## Frontmatter Fields

### description (REQUIRED)
- Shown in `/help` output
- Required for Claude to programmatically invoke the command
- Keep concise (< 100 chars)

```yaml
description: Generate a new task through discovery with the user
```

### allowed-tools (RECOMMENDED)
Restrict which tools the command can use.

**Simple list:**
```yaml
allowed-tools: Glob, Read, Write, AskUserQuestion
```

**With Bash restrictions:**
```yaml
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Read
```

**Available tools:**
- `Glob` - Find files by pattern
- `Read` - Read file contents
- `Write` - Create/overwrite files
- `Edit` - Modify existing files
- `Grep` - Search file contents
- `Bash` - Run shell commands (use restrictions!)
- `AskUserQuestion` - Ask user for input
- `Task` - Spawn subagents
- `WebSearch` - Search the web
- `WebFetch` - Fetch web pages
- `TodoWrite` - Manage todo list

### argument-hint
Shows expected input format in help:

```yaml
argument-hint: [message]
argument-hint: [file-path]
argument-hint: [idea]
```

### model
Override the default model for this command:

```yaml
model: claude-3-5-haiku-20241022  # Fast, cheap - for simple tasks
model: claude-sonnet-4-20250514   # Balanced
model: claude-opus-4-20250514     # Most capable
```

### disable-model-invocation
Prevent Claude from automatically invoking this command:

```yaml
disable-model-invocation: true
```

## Arguments

### $ARGUMENTS
Captures all arguments as a single string:

```markdown
Create a task from this idea: $ARGUMENTS
```

**Usage:** `/generate-task "my new feature idea"`

### Positional Arguments
Access individual arguments:

```markdown
File: $1
Action: $2
Options: $3
```

**Usage:** `/process file.txt convert --verbose`

## Inline Bash Execution

Execute bash commands **before** the main command runs. Prefix with `!`:

```markdown
## Context
- Current branch: !`git branch --show-current`
- Status: !`git status --short`
- Recent commits: !`git log --oneline -5`

## Task
Based on the context above, create a commit...
```

**IMPORTANT:** Requires `allowed-tools: Bash(...)` with matching patterns.

## Character Budget

- Default: 15,000 characters for all command metadata
- Override: Set `SLASH_COMMAND_TOOL_CHAR_BUDGET` environment variable

## Complete Example

```markdown
---
description: Create a git commit with a well-formatted message
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*), Read
argument-hint: [message]
model: claude-3-5-haiku-20241022
---

# commit

Create a git commit with proper formatting.

## Context
- Status: !`git status --short`
- Staged diff: !`git diff --cached --stat`

## Instructions

1. Review the staged changes above
2. Create a commit with message: $ARGUMENTS
3. Follow conventional commit format
```
