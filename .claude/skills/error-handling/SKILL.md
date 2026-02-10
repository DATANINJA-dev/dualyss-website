# error-handling

## Type
passive

## Auto-Activation Triggers
- User mentions: "error format", "error codes", "error handling", "error messages"
- When writing or editing commands in `.claude/commands/`
- When implementing error handling in CLI commands
- When debugging command failures
- During audit of command error patterns

## Description
Provides standardized error handling patterns for CLI commands. Defines error code registry, message templates, and exit code conventions. Ensures consistent, actionable error messages across all commands.

Use when:
- Implementing error handling in commands
- Adding new error cases to existing commands
- Reviewing error message quality
- Debugging command failures
- Creating new commands that need error handling

## When to Use This Skill
- **Adding error cases**: What error code should this failure use?
- **Error message writing**: How to format actionable error messages?
- **Exit code decisions**: Should this error return 1 or 2?
- **Verbose mode**: What additional info to show with `-v`?
- **Error tracking**: How to populate `last_error` metadata?

## Supporting Files
- error-codes.md - Complete error code registry (E0XX-E5XX)
- message-templates.md - Standard error message format and patterns

## Error Format Standard

```
[LEVEL] CODE: Short message

Details: Contextual information about what happened

Suggested fix:
  → Primary recovery action
  → Alternative action
```

## Exit Codes
- `0`: Success
- `1`: User error (bad input, missing file, validation failure)
- `2`: System error (agent failure, timeout, infrastructure issue)

## Quick Reference

| Range | Category | Example |
|-------|----------|---------|
| E0XX | Input validation | E001: Task not found |
| E1XX | File system | E100: File not found |
| E2XX | Agent/execution | E200: Agent timeout |
| E3XX | Configuration | E300: MCP not configured |
| E4XX | Reserved | (journey validation, config-merging) |
| E5XX | SEO errors | E500: Missing meta description |
