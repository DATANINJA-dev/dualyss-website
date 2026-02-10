# CLI Design Best Practices

## Command Naming Conventions

### General Rules (POSIX Standard)
- **Use kebab-case**: All lowercase with hyphens (`create-user`, not `createUser` or `create_user`)
- **Favor verb-noun pattern**: `git remote add`, `docker image pull`, `kubectl pod delete`
- **Keep concise**: 1-8 characters when possible, prioritize clarity over brevity
- **Use familiar verbs**: Leverage conventions users already know

**Common Verbs**:
- `create`, `add`, `new` - Create new resources
- `delete`, `remove`, `rm` - Delete resources
- `list`, `ls` - Show available items
- `get`, `show` - Display details
- `update`, `edit`, `set` - Modify existing
- `run`, `start`, `exec` - Execute operations

### Subcommand Grouping
Group related operations under logical nouns:
```bash
# Good
user create
user delete
user list

# Avoid
create-user
delete-user
list-users
```

**Benefits**:
- Reduces namespace pollution
- Improves discoverability (`--help` shows related commands)
- Follows patterns from git, docker, kubectl

### Avoid Anti-Patterns
- **Hyphenated names when subgroups exist**: `create-user` vs `user create`
- **Abbreviations**: `cfg` vs `config`, `rm` is OK (universal convention)
- **Mixed patterns**: Don't mix verb-noun with noun-verb in same tool
- **Ambiguous names**: `update` vs `upgrade` (choose one, document difference)

## Option Standards

### Universal Conventions
Always support these:
- `-h`, `--help` - Show help text with examples
- `-v`, `--verbose` - Increase output detail
- `-V`, `--version` - Show version number
- `-q`, `--quiet` - Suppress non-error output
- `-f`, `--force` - Skip confirmation prompts
- `-y`, `--yes` - Auto-confirm all prompts

### Short vs Long Flags
- **Short flags** (`-f`): Common operations, single character
- **Long flags** (`--force`): Clarity, multi-character
- **Both**: Provide aliases for flexibility

### Positional Arguments
- **Maximum 1** positional argument
- **2 is questionable** (confusion risk)
- **3+ is anti-pattern** (use flags instead)

Example:
```bash
# Good
docker run [OPTIONS] IMAGE [COMMAND]

# Avoid
mytool source dest format type  # 4 positional args
```

### The `--` Marker
Use `--` to mark end of arguments (standard convention):
```bash
command --option -- filename-that-looks-like-flag.txt
```

## UX Design Principles

### 1. Self-Documentation
Command names should reveal purpose without documentation:
```bash
# Clear
generate-epics "gym management SaaS"

# Unclear
gep "gym management SaaS"
```

### 2. Progressive Disclosure
- **Simple by default**: Common operations need minimal flags
- **Complexity via flags**: Advanced features accessible but not required
- **Examples in help**: Show real-world usage

```bash
# Simple
deploy

# Advanced
deploy --region us-west-2 --replicas 3 --health-check /api/health
```

### 3. Consistent Patterns
Users should predict behavior based on convention:
- Similar commands follow similar syntax
- Flag naming is consistent (`--config` not `--configuration` in one place, `--cfg` in another)
- Error messages follow same format

### 4. Actionable Error Messages
Don't just say what's wrong - suggest fixes:
```bash
# Poor
Error: Invalid input

# Good
Error: Task 'TASK-999' not found
Suggestion: Run 'list-tasks' to see available tasks, or check for typos
```

### 5. American Spelling
Use American English for global consistency:
- `color` not `colour`
- `organize` not `organise`

## Evaluation Checklist

Use this to audit CLI usability:

### Naming Consistency
- [ ] All commands follow verb-noun pattern consistently
- [ ] No hyphenated names where subgroups would work better
- [ ] Verbs are familiar (create, delete, list, get, update)
- [ ] No abbreviations except universal conventions (rm, ls)

### Option Standards
- [ ] `-h/--help`, `-v/--verbose`, `-V/--version` supported
- [ ] Common operations have short flag aliases
- [ ] Long flags prioritize clarity
- [ ] Maximum 1-2 positional arguments per command

### Discoverability
- [ ] `--help` includes real-world examples
- [ ] Subcommands are logically grouped
- [ ] Error messages suggest corrective actions
- [ ] Autocomplete available (if shell supports)

### Documentation
- [ ] Getting-started guide exists
- [ ] Common workflows documented
- [ ] Migration guides for breaking changes
- [ ] FAQ addresses naming/structure questions

### Usability Testing
- [ ] First-use testing completed (can new users complete tasks without docs?)
- [ ] Cognitive load measured (how many concepts to learn?)
- [ ] Consistency audit done (similar operations = similar syntax?)

## Testing Methods

### First-Use Testing
1. Recruit users unfamiliar with the tool
2. Give realistic tasks without documentation
3. Observe where they get stuck
4. Measure: time to completion, error rate, help lookups

### Cognitive Load Measurement
1. Count concepts users must remember
2. Track flag combinations required for common tasks
3. Measure context switches (CLI → docs → CLI)
4. Goal: minimize cognitive load per task

### Benchmarking
Compare against established CLIs:
- **Git**: Complex but consistent patterns
- **Docker**: Excellent subcommand grouping
- **kubectl**: Clear resource-oriented design
- **npm**: Simple default, complexity via flags

Identify deviations from conventions and justify them.

## Sources

- [Command Line Interface Guidelines](https://clig.dev/)
- [Azure CLI Command Guidelines](https://github.com/Azure/azure-cli/blob/dev/doc/command_guidelines.md)
- [Microsoft .NET CommandLine Design Guidance](https://learn.microsoft.com/en-us/dotnet/standard/commandline/design-guidance)
- [Thoughtworks CLI Design Guidelines](https://www.thoughtworks.com/insights/blog/engineering-effectiveness/elevate-developer-experiences-cli-design-guidelines)
- [Atlassian: 10 Design Principles for Delightful CLIs](https://www.atlassian.com/blog/it-teams/10-design-principles-for-delightful-clis)
- [The Poetics of CLI Command Names](https://smallstep.com/blog/the-poetics-of-cli-command-names/)
