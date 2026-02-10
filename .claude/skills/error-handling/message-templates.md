# Error Message Templates

Reusable patterns for consistent error messaging across all commands.

## Standard Format

```
[LEVEL] CODE: Short message

Details: Contextual information about what happened

Suggested fix:
  → Primary recovery action
  → Alternative action
```

## Message Levels

| Level | Use When | Exit Code |
|-------|----------|-----------|
| `[ERROR]` | Operation failed, cannot proceed | 1 or 2 |
| `[WARNING]` | Operation succeeded but with issues | 0 |
| `[INFO]` | Informational, no action needed | 0 |

## Exit Code Rules

| Code | Meaning | When to Use |
|------|---------|-------------|
| `0` | Success | Operation completed successfully |
| `1` | User error | Bad input, missing file, validation failure |
| `2` | System error | Agent failure, timeout, infrastructure issue |

## Template Patterns

### Pattern 1: Simple Validation Error
```
[ERROR] E001: Task not found

Details: [ID] does not exist in [location]

Suggested fix:
  → Check [ID type] spelling
  → Run `[list command]` to see available [items]
```

### Pattern 2: File System Error
```
[ERROR] E100: File not found

Details: Could not read [file path]

Suggested fix:
  → Verify [file] exists
  → Check file path spelling
```

### Pattern 3: Parse Error with Line Number
```
[ERROR] E104: JSON parse error

Details: Syntax error in [file] at line [N]

Suggested fix:
  → Check [format] syntax at line [N]
  → Use a [format] validator
```

### Pattern 4: Agent/Execution Error
```
[ERROR] E201: Agent '[agent name]' failed

Details: [Failure reason]

Suggested fix:
  → Retry the command
  → Use --quick mode for faster execution
  → [Context-specific recovery]
```

### Pattern 5: Multi-Phase Error
```
[ERROR] E202: [Phase error]

Details: Phase [N] ([Phase Name]) [what happened]

Suggested fix:
  → [Phase-specific recovery]
  → [Alternative approach]
  → Use `[alternative command]` for [benefit]
```

### Pattern 6: Configuration Error
```
[ERROR] E300: [Config issue]

Details: [Config file/setting] [problem description]

Suggested fix:
  → Check [config file] exists
  → Verify [setting] configuration
  → Run `[diagnostic command]` for details
```

### Pattern 7: Dependency Error
```
[ERROR] E203: Dependency incomplete

Details: Task [ID] depends on [dependency list] which are not done

Suggested fix:
  → Complete [dependency] first
  → Run `/list-tasks` to check dependency status
  → Remove dependency if no longer needed
```

### Pattern 8: Warning (Non-Blocking)
```
[WARNING] [Context]: [Issue description]

Details: [What happened and impact]

Note: Proceeding with [partial result/default behavior]
```

### Pattern 9: Info (No Action Required)
```
[INFO] [Context]: [Informational message]

[Optional details if helpful]
```

### Pattern 10: SEO Validation Error
```
[ERROR] E50X: [SEO issue description]

Details: [Element/tag] in [file/URL] [problem description]

Suggested fix:
  → [Primary fix action]
  → Run SEO validation with --fix flag
```

### Pattern 11: SEO External Service Error
```
[ERROR] E55X: [Service] unavailable

Details: [Service name] returned [error/timeout] after [N]s

Suggested fix:
  → Check network connectivity
  → Retry with --retry flag
  → Verify [API key/credentials] configuration
```

## Verbose Mode Extensions

When `-v` or `--verbose` flag is present, add:

### Stack Trace Section
```
Stack trace (verbose):
  at [function]() in [file]:[phase/step]
  at [function]() in [file]:[phase/step]
  [additional context: timing, memory, etc.]
```

### Timing Information
```
Timing (verbose):
  Started: [timestamp]
  Duration: [N]s
  Timeout: [N]ms
```

### Agent Details
```
Agent details (verbose):
  Agent: [name]
  Model: [haiku/sonnet]
  Attempt: [N]/[max]
  Output: [summary or path]
```

## Progress Indicator Patterns

Standard progress output format for multi-step operations.

### Step Progress Format

```
[N/M] Action description...
```

Where:
- `N` = Current step (1-indexed)
- `M` = Total steps
- `Action` = Present participle verb (Validating, Checking, Downloading, etc.)

### Examples

```
[1/5] Validating project structure...
[2/5] Checking version compatibility...
[3/5] Downloading framework updates...
[4/5] Merging configurations...
[5/5] Verifying installation...

✓ Done in 3.2s
```

### Elapsed Time Format

Show elapsed time after completion:

```
✓ Done in X.Xs
```

Or with more detail for longer operations:

```
✓ Completed in 2m 15s
```

### Progress with Substeps

For nested operations:

```
[2/5] Merging configurations...
      ├─ Base config loaded
      ├─ Local config merged
      └─ Output written
```

### Error During Progress

When an error occurs mid-progress:

```
[1/5] Validating project structure... ✓
[2/5] Checking version compatibility... ✓
[3/5] Downloading framework updates... ✗

[ERROR] E431: Network error during sync

Details: Connection timeout after 30s

Suggested fix:
  → Check network connectivity
  → Retry with `/sync-pull`
```

### Distribution Command Progress Patterns

Standard progress for `/sync` commands:

**`/sync-pull`**:
```
[1/4] Checking watermark state...
[2/4] Detecting conflicts...
[3/4] Pulling from hub...
[4/4] Updating watermark...

✓ Done in 5.3s
```

**`/sync-push`**:
```
[1/3] Validating feature branch...
[2/3] Checking conflict state...
[3/3] Pushing to hub...

✓ Done in 2.1s
```

**`/sync-scaffold`**:
```
[1/6] Analyzing target project...
[2/6] Detecting tech stack...
[3/6] Generating structure...
[4/6] Writing CLAUDE.md...
[5/6] Configuring MCP...
[6/6] Validating installation...

✓ Done in 8.4s
```

### Verbose Mode Progress

With `-v` flag, include timestamps:

```
[2026-01-13T14:30:00Z] [1/4] Checking watermark state...
    ├─ Current: abc1234
    ├─ Hub: def5678
    └─ Duration: 0.3s

[2026-01-13T14:30:01Z] [2/4] Detecting conflicts...
    ├─ Files scanned: 42
    ├─ Conflicts: 0
    └─ Duration: 1.2s
```

### Quiet Mode

With `--quiet` flag, suppress progress entirely. Only show:
- Final result (success/failure)
- Error messages (to stderr)

## Composing Error Messages

### Step 1: Choose the right error code
Reference `error-codes.md` for the appropriate code.

### Step 2: Write the short message
- Be specific: "Task not found" not "Error occurred"
- Include the ID/name when relevant: "Task TASK-999 not found"

### Step 3: Add context in Details
- What specifically failed
- Where it failed (file, line, phase)
- What was being attempted

### Step 4: Provide actionable fixes
- Most likely fix first
- Alternative approaches
- Reference help commands

### Step 5: Set correct exit code
- Can user fix it? → Exit 1
- System/infrastructure issue? → Exit 2
- Informational/warning? → Exit 0

## Anti-Patterns to Avoid

| Anti-Pattern | Better Approach |
|--------------|-----------------|
| "Error occurred" | Specific error: "Task not found" |
| "Invalid input" | What's invalid: "Invalid status 'pending'" |
| "Something went wrong" | What went wrong: "Agent timeout after 60s" |
| No suggested fix | Always provide at least one fix |
| Technical jargon | User-friendly language |
| Absolute paths | Relative paths from project root |
| Stack traces by default | Only with -v flag |

## Command-Specific Guidelines

### Read-Only Commands (list-*, help)
- Use [INFO] for "no results found" (not an error)
- Use [ERROR] only for actual failures (can't read file)

### Write Commands (generate-*, update-*)
- Use [ERROR] for validation failures
- Use [WARNING] for non-blocking issues
- Clear `last_error` on success

### Multi-Phase Commands (set-up, develop-task, audit)
- Include phase context in errors
- Offer phase-specific recovery
- Support resume from checkpoint

### Agent-Dependent Commands
- Handle timeouts gracefully
- Distinguish core vs optional agent failures
- Offer --quick fallback
