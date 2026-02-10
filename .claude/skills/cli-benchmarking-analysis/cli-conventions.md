# CLI Conventions Reference

## Overview

Authoritative reference for established CLI conventions. Based on POSIX standards, GNU coding standards, and patterns from industry-leading tools.

## Naming Conventions

### POSIX Standard

From [GNU Coding Standards](https://www.gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html):

- Command names: lowercase, 2-8 characters
- Meaningful and mnemonic
- Avoid abbreviations unless universally known
- No special characters except hyphen

### Common Patterns

| Pattern | Example | Used By | Best For |
|---------|---------|---------|----------|
| verb-noun | `git add file` | git, curl | Action-oriented tools |
| noun-verb | `docker container create` | docker, gh | Resource-oriented tools |
| topic:command | `heroku apps:create` | heroku | Namespaced tools |
| single-word | `npm install` | npm, pip | Simple operations |

### Recommended Verbs

Standard verbs improve predictability:

| Verb | Meaning | Examples |
|------|---------|----------|
| get | Retrieve single item | kubectl get pod |
| list | Retrieve multiple items | gh pr list |
| create | Create new resource | docker create |
| delete | Remove resource | kubectl delete |
| update | Modify existing | npm update |
| describe | Show details | kubectl describe |
| show | Display info | heroku config |
| set | Configure value | git config --set |

### Anti-Patterns

Avoid these naming issues:

- **Ambiguous verbs**: "update" vs "upgrade" (use one)
- **Similar names**: "start" vs "run" (confusing)
- **Abbreviations**: "cfg" for "config" (hard to remember)
- **Mixed case**: "getUser" (breaks convention)
- **Non-standard verbs**: "yeet" for "delete" (unfamiliar)

## Flag Conventions

### Short Flags

From [Conventions for Command Line Options](https://nullprogram.com/blog/2020/08/01/):

- Single letter: `-v`, `-h`, `-f`
- Combine multiple: `-vfn`
- Reserve for common operations only
- Case-sensitive: `-v` ≠ `-V`

### Long Flags

- Use double-dash: `--verbose`
- Full words: descriptive and clear
- Kebab-case: `--dry-run` not `--dryRun`
- All flags should have long form

### Standard Flag Names

| Flag | Long Form | Meaning |
|------|-----------|---------|
| -h | --help | Show help |
| -v | --version | Show version |
| -V | --verbose | Increase verbosity |
| -q | --quiet | Decrease verbosity |
| -f | --force | Skip confirmations |
| -n | --dry-run | Simulate without action |
| -o | --output | Specify output format |
| -i | --interactive | Enable prompts |

### Boolean Flags

For toggleable behavior:
- Default off: `--verbose`
- Explicit off: `--no-verbose`
- Avoid requiring values: `--verbose true` (bad)

### Value Flags

| Style | Example | Notes |
|-------|---------|-------|
| Space separator | `-o json` | POSIX standard |
| Equals separator | `--output=json` | GNU style |
| No separator | `-ojson` | Optional for short |

Recommendation: Support all styles when possible.

## Subcommand Structure

### Hierarchy Depth

| Depth | Example | Recommendation |
|-------|---------|----------------|
| 0 | `git status` | Preferred for simple tools |
| 1 | `docker container list` | Good for resource-oriented |
| 2 | `heroku addons:docs:open` | Maximum recommended |
| 3+ | | Avoid - hard to discover |

### Subcommand Naming

From [Heroku CLI Style Guide](https://devcenter.heroku.com/articles/cli-style-guide):

- Topics are plural nouns: `apps`, `users`, `issues`
- Commands are verbs: `create`, `list`, `delete`
- No redundancy: `apps list` not `apps:list-apps`

### Discovery

Users should find commands via:
1. `tool --help` - top-level overview
2. `tool topic --help` - topic-specific commands
3. `tool help command` - detailed command help
4. Tab completion - interactive discovery

## Help System

### Entry Points

Support multiple access methods:

```bash
tool -h              # Quick help
tool --help          # Full help
tool help            # Subcommand style
tool help subcommand # Specific help
tool subcommand -h   # Works anywhere
```

### Content Structure

From [clig.dev](https://clig.dev/):

1. **Brief description** - one line, what it does
2. **Usage** - syntax pattern
3. **Examples** - common use cases FIRST
4. **Options** - flags and their meanings
5. **Environment** - relevant env vars
6. **See also** - related commands

### Example-First Principle

> "Users tend to use examples over other forms of documentation, so show them first in the help page."

Good:
```
EXAMPLES
  $ tool create myapp
  $ tool create myapp --template react
  $ tool create myapp -f

OPTIONS
  -f, --force  Skip confirmation prompt
  ...
```

Bad:
```
OPTIONS
  -f, --force  Skip confirmation prompt
  ... (50 lines of options)

EXAMPLES
  $ tool create myapp
```

## Error Messages

### Structure

Good error message:
```
Error: Could not find config file 'app.yaml'

The file was expected at: /path/to/app.yaml

To fix this:
  1. Create the file: touch /path/to/app.yaml
  2. Or specify a different path: tool --config /other/path
```

### Guidelines

From clig.dev error handling:

- **Rewrite technical errors** into human language
- **Suggest solutions** when possible
- **Include context** (file paths, values)
- **Show command to retry** when applicable
- **Use stderr** for errors, stdout for output
- **Exit codes** should be meaningful (0=success, 1=error)

### Anti-Patterns

Avoid:
- Stack traces without context
- Cryptic codes: "Error: E_NOENT"
- Missing suggestions: just "Error: invalid"
- stdout errors (breaks piping)

## Output Conventions

### Human-First Default

Default output should be human-readable:
- Formatted tables
- Relative times ("3 days ago")
- Colored output (when TTY)
- Progress indicators

### Machine-Readable Options

Always provide:
- `--json` for structured data
- `--quiet` for script-friendly
- `--no-color` for log files

### Output Streams

| Stream | Use For |
|--------|---------|
| stdout | Primary output, data |
| stderr | Errors, warnings, progress |

This allows: `tool list 2>/dev/null | jq '.items'`

## Interactive Behavior

### Confirmation Prompts

When to prompt:
- Destructive operations (delete, overwrite)
- Expensive operations (long-running)
- Irreversible changes (production deploy)

When not to prompt:
- `--force` or `-f` flag provided
- Non-TTY environment (CI/CD)
- Read-only operations

### Progress Indicators

For long operations:
- Spinner for unknown duration
- Progress bar for known duration
- Status messages for multi-step

## Environment Variables

### Naming

- Uppercase: `TOOL_API_KEY`
- Prefixed with tool name: `GH_TOKEN`, `DOCKER_HOST`
- Underscore separator: `TOOL_CONFIG_PATH`

### Common Variables

| Variable | Purpose |
|----------|---------|
| TOOL_TOKEN | Authentication |
| TOOL_DEBUG | Enable debug mode |
| TOOL_CONFIG | Config file path |
| NO_COLOR | Disable colors |
| CI | Detect CI environment |

## Sources

- [GNU Coding Standards - CLI](https://www.gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html)
- [Command Line Interface Guidelines](https://clig.dev/)
- [POSIX Utility Conventions](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html)
- [Heroku CLI Style Guide](https://devcenter.heroku.com/articles/cli-style-guide)
- [Conventions for Command Line Options](https://nullprogram.com/blog/2020/08/01/)
