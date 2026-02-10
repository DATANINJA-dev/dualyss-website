# Conflict Resolution UI Patterns

Interactive UI patterns for resolving conflicts during sync operations. Provides consistent UX for presenting conflicts from three-way merge (TASK-090) and guiding users through resolution options.

> **Integration**: Used by `/sync-pull` Phase 3.5 and `/sync-merge-preview --apply`
>
> **Data Source**: `MergeResult.conflicts[]` from `merge-algorithm.md`
>
> **Error Codes**: E416-E418 (see error-handling skill)

## UI Components

### 1. Conflict Context Display

Shows the three versions (BASE, LOCAL, REMOTE) for a single conflict:

```markdown
## Conflict [N]/[Total]: [file_path]

**Type**: [modify_modify | add_add | delete_modify | modify_delete | type_mismatch]
**Severity**: [HIGH | MEDIUM]
**Path**: `[json_path]` (e.g., `config.timeout`)

### Values

| Version | Value |
|---------|-------|
| BASE (common ancestor) | [base_value or "(not present)"] |
| LOCAL (your changes) | [local_value or "(deleted)"] |
| REMOTE (hub) | [remote_value or "(deleted)"] |
```

### 2. Diff View (Side-by-Side)

For text/string values, show unified diff format:

```markdown
### Diff View

```diff
@@ BASE → LOCAL/REMOTE @@
  [unchanged context]
- [local_value]
+ [remote_value]
  [unchanged context]
```
```

For JSON objects, show key-level diff:

```markdown
### Key Differences

| Key | BASE | LOCAL | REMOTE |
|-----|------|-------|--------|
| timeout | 5000 | 10000 | 3000 |
| port | 8080 | 8080 | 9000 |
```

### 3. Resolution Options Menu

Standard options for each conflict:

```markdown
### Resolution Options

| Key | Action | Description |
|-----|--------|-------------|
| [L] | Keep local | Use your version (ignore hub change) |
| [R] | Keep remote | Use hub version (discard your change) |
| [B] | Keep base | Revert to common ancestor (discard both) |
| [M] | Manual | Enter a custom value |
| [S] | Skip | Decide later (leaves conflict unresolved) |
| [A] | Abort | Cancel all resolutions and abort sync |

Choice: _
```

### 4. Manual Value Entry

When user selects [M] Manual:

```markdown
### Manual Resolution: `[path]`

Current values:
- BASE:   [base_value]
- LOCAL:  [local_value]
- REMOTE: [remote_value]

Enter custom value (or "cancel" to go back):
> _

[Validate input type matches expected schema]
```

## Batch Resolution

### Batch Options (Multiple Conflicts)

When `conflicts.length > 1`, offer batch resolution first:

```markdown
## Conflict Resolution

Found [N] conflicts in [file_path]

### Batch Options

| Key | Action | Description |
|-----|--------|-------------|
| [1] | Individual | Resolve each conflict one by one (default) |
| [2] | All local | Keep YOUR version for all [N] conflicts |
| [3] | All remote | Keep HUB version for all [N] conflicts |
| [4] | All base | Revert ALL to common ancestor |
| [5] | Skip all | Defer all decisions (manual edit later) |

Choice: _
```

### Remember Choice Pattern

For similar conflict types, offer to apply same resolution:

```markdown
### Remember Choice?

You chose "[resolution]" for conflict type "[type]".

Apply same resolution to remaining [N] conflicts of this type?
[Y] Yes, apply to all [type] conflicts
[N] No, decide individually
```

## Session State Management

### Resolution Session Structure

```yaml
_resolution_session:
  version: "1.0.0"
  started: "[ISO timestamp]"
  file: "[current_file_path]"

  # Progress tracking
  total_conflicts: N
  resolved: M
  skipped: K

  # Individual resolutions
  choices:
    - path: "config.timeout"
      type: "modify_modify"
      choice: "local"
      value: 10000
      timestamp: "[ISO timestamp]"
    - path: "config.port"
      type: "modify_modify"
      choice: "remote"
      value: 9000
      timestamp: "[ISO timestamp]"

  # Memory for similar conflicts (remember choice)
  remembered_choices:
    modify_modify: "local"      # Apply to all modify_modify
    add_add: null               # Ask individually
    delete_modify: "remote"     # Apply to all delete_modify
```

### Session Recovery

If session interrupted mid-resolution:

```markdown
## Resume Conflict Resolution

Found interrupted session for [file_path]

**Started**: [timestamp]
**Progress**: [resolved]/[total] conflicts resolved

### Resolved So Far
| Path | Type | Choice |
|------|------|--------|
| `timeout` | modify_modify | local |
| `port` | modify_modify | remote |

### Remaining
| Path | Type |
|------|------|
| `feature.enabled` | delete_modify |

[R]esume from where you left off
[S]tart over (discard previous choices)
[A]bort (cancel sync)
```

## Resolution Summary

### Completion Summary

After all conflicts resolved:

```markdown
## Resolution Summary

### Applied Resolutions
| File | Path | Type | Choice | Final Value |
|------|------|------|--------|-------------|
| config.json | `timeout` | modify_modify | local | 10000 |
| config.json | `port` | modify_modify | remote | 9000 |
| config.json | `feature` | delete_modify | remote | { enabled: true } |

### Skipped (Requires Manual Edit)
| File | Path | Type | Reason |
|------|------|------|--------|
| settings.yaml | `legacy.flag` | type_mismatch | Complex structure |

### Statistics
| Metric | Value |
|--------|-------|
| Total conflicts | [N] |
| Resolved (local) | [X] |
| Resolved (remote) | [Y] |
| Resolved (base) | [Z] |
| Resolved (manual) | [W] |
| Skipped | [S] |

### Next Steps

[If all resolved]:
✓ All conflicts resolved
Run: `git add [files] && git commit -m "Resolve sync conflicts"`

[If skipped > 0]:
⚠ [S] conflicts skipped

Manual resolution required:
1. Edit skipped files manually
2. Stage changes: `git add [files]`
3. Complete merge: `git commit -m "Resolve sync conflicts"`
```

## Conflict Type Display

### Type-Specific Presentations

#### modify_modify (Both sides changed)

```markdown
## Conflict: `config.timeout`

**Type**: modify_modify [HIGH]
**Both sides changed this value**

| Version | Value | Change |
|---------|-------|--------|
| BASE | 5000 | (original) |
| LOCAL | 10000 | +5000 (doubled) |
| REMOTE | 3000 | -2000 (reduced) |

Which version should win?
```

#### add_add (Both sides added)

```markdown
## Conflict: `config.newFeature`

**Type**: add_add [MEDIUM]
**Both sides added this key (with different values)**

| Version | Value |
|---------|-------|
| BASE | (not present) |
| LOCAL | "localValue" |
| REMOTE | "remoteValue" |

Which addition should be kept?
```

#### delete_modify (Local deleted, remote modified)

```markdown
## Conflict: `config.deprecatedField`

**Type**: delete_modify [HIGH]
**You deleted this, but hub modified it**

| Version | Value |
|---------|-------|
| BASE | "oldValue" |
| LOCAL | (deleted) |
| REMOTE | "newValue" |

Keep the deletion or accept hub's modification?
```

#### modify_delete (Local modified, remote deleted)

```markdown
## Conflict: `config.removedField`

**Type**: modify_delete [HIGH]
**You modified this, but hub deleted it**

| Version | Value |
|---------|-------|
| BASE | "oldValue" |
| LOCAL | "yourChange" |
| REMOTE | (deleted) |

Keep your modification or accept hub's deletion?
```

#### type_mismatch (Different types)

```markdown
## Conflict: `config.setting`

**Type**: type_mismatch [HIGH]
**Value changed from [base_type] to different types**

| Version | Type | Value |
|---------|------|-------|
| BASE | object | { port: 3000 } |
| LOCAL | object | { port: 8080 } |
| REMOTE | string | "production" |

⚠ Type mismatch requires careful resolution.
Choosing one will completely replace the other.
```

## Error Handling

### Error Codes

| Code | Situation | Display |
|------|-----------|---------|
| E416 | Invalid resolution choice | "Invalid choice '[X]'. Enter L, R, B, M, S, or A." |
| E417 | Resolution application failed | "Failed to apply resolution: [error]. Retry? [Y/n]" |
| E418 | Session state lost | "Session state lost. Restart resolution? [Y/n]" |

### Validation Errors

```markdown
### Invalid Input

[For invalid choice key]:
Invalid choice: "[input]"
Valid options: L, R, B, M, S, A

[For invalid manual value]:
Invalid value for type [expected_type]:
  Expected: [type description]
  Got: [user_input]

Try again? [Y/n]
```

## Integration Examples

### With /sync-pull

```markdown
## Phase 3.5: Conflict Resolution

Git merge detected [N] conflicts in .claude/ files.

Initiating conflict resolution UI...

[Conflict resolution session starts here]

...

## Resolution Complete

Applied [X] resolutions across [Y] files.

Continuing to Phase 4...
```

### With /sync-merge-preview --apply

```markdown
## Applying Merge: [file]

Preview showed [N] conflicts.

Starting interactive resolution...

[Conflict resolution session]

...

✓ Merge applied with [X] resolutions.
```

## AskUserQuestion Integration

### Single Conflict

```javascript
AskUserQuestion({
  questions: [{
    question: "How do you want to resolve this conflict?",
    header: "Conflict",
    options: [
      { label: "[L] Keep local", description: "Use your version (10000)" },
      { label: "[R] Keep remote", description: "Use hub version (3000)" },
      { label: "[B] Keep base", description: "Revert to original (5000)" },
      { label: "[M] Manual", description: "Enter custom value" }
    ],
    multiSelect: false
  }]
})
```

### Batch Resolution

```javascript
AskUserQuestion({
  questions: [{
    question: "Found 5 conflicts. How do you want to resolve them?",
    header: "Batch",
    options: [
      { label: "Individual", description: "Resolve each one by one" },
      { label: "All local", description: "Keep your version for all" },
      { label: "All remote", description: "Keep hub version for all" },
      { label: "Skip all", description: "Defer decisions" }
    ],
    multiSelect: false
  }]
})
```

## File Format Support

### JSON Files

- Deep path display: `config.nested.value`
- Pretty-print values for readability
- Type validation on manual entry

### YAML Files

- Path display: `config.nested.value`
- Preserve comments where possible
- Handle multi-line strings

### Markdown Files

- Line-based diff display
- Show surrounding context
- Cannot do field-level resolution (whole file or sections)

## Performance Considerations

| Operation | Target | Notes |
|-----------|--------|-------|
| Session state read/write | < 50ms | In-memory during session |
| Conflict display render | < 100ms | Minimal formatting |
| Resolution application | < 200ms | Per file |
| Summary generation | < 100ms | After all resolutions |
