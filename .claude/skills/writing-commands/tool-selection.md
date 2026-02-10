# Tool Selection

Guide for selecting appropriate tools for commands.

## Contents
- [Principle of Least Privilege](#principle-of-least-privilege)
- [Tool Categories](#tool-categories)
- [Bash Security](#bash-security)
- [Common Tool Combinations](#common-tool-combinations)
- [Tool Selection Checklist](#tool-selection-checklist)
- [Security Considerations](#security-considerations)

## Principle of Least Privilege

**Only grant tools that are actually needed.**

**Bad:**
```yaml
allowed-tools: Glob, Read, Write, Edit, Bash, Task, WebSearch, WebFetch
```

**Good:**
```yaml
allowed-tools: Glob, Read, Write  # Only what's needed
```

## Tool Categories

### File Discovery
| Tool | Use When |
|------|----------|
| `Glob` | Finding files by pattern |
| `Grep` | Searching file contents |

### File Operations
| Tool | Use When |
|------|----------|
| `Read` | Reading file contents |
| `Write` | Creating new files or overwriting |
| `Edit` | Modifying existing files |

### User Interaction
| Tool | Use When |
|------|----------|
| `AskUserQuestion` | Need user input/confirmation |
| `TodoWrite` | Tracking progress for complex tasks |

### External
| Tool | Use When |
|------|----------|
| `WebSearch` | Need to research/find information |
| `WebFetch` | Need to fetch specific URLs |
| `Task` | Need to spawn subagents for exploration |

### System
| Tool | Use When |
|------|----------|
| `Bash` | Need shell commands (use restrictions!) |

## Bash Security

**NEVER grant unrestricted Bash access:**

```yaml
# DANGEROUS - don't do this
allowed-tools: Bash
```

**ALWAYS use restrictions:**

```yaml
# Good - specific commands only
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)

# Good - specific tool only
allowed-tools: Bash(npm:*), Bash(pnpm:*)

# Good - read-only commands
allowed-tools: Bash(ls:*), Bash(cat:*), Bash(pwd:*)
```

### Bash Restriction Patterns

| Pattern | Allows |
|---------|--------|
| `Bash(git:*)` | Any git command |
| `Bash(git add:*)` | Only `git add` |
| `Bash(npm run:*)` | Only `npm run` scripts |
| `Bash(ls:*)` | Only `ls` commands |

## Common Tool Combinations

### Read-Only Commands
```yaml
allowed-tools: Glob, Read, Grep
```

### File Management
```yaml
allowed-tools: Glob, Read, Write
```

### Interactive Discovery
```yaml
allowed-tools: Glob, Read, AskUserQuestion
```

### Git Operations
```yaml
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*), Read
```

### Research/Exploration
```yaml
allowed-tools: Glob, Read, Grep, Task, WebSearch, WebFetch
```

### Full Task Management
```yaml
allowed-tools: Glob, Read, Write, AskUserQuestion, TodoWrite
```

## Tool Selection Checklist

Before adding a tool, ask:

1. **Is it necessary?** Can the command work without it?
2. **Is it the right tool?** Is there a more specific option?
3. **Is it restricted enough?** (Especially for Bash)
4. **What's the worst case?** What could go wrong if misused?

## Security Considerations

### High-Risk Tools
- `Bash` - Can execute any command if unrestricted
- `Write` - Can overwrite any file
- `Edit` - Can modify any file

### Mitigations
1. Use tool restrictions where available
2. Add constraints in command instructions
3. Require user confirmation for destructive actions
4. Validate paths before file operations

### Example: Safe File Writing

```markdown
## Critical Rules
- ONLY write to backlog/tasks/ directory
- NEVER overwrite existing files without confirmation
- ALWAYS show file content before writing
```
