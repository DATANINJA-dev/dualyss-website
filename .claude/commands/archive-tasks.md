---
description: Archive completed tasks to reduce tasks.json size
allowed-tools: Read, Write, Glob
argument-hint: [--older-than=Nd] [--keep=N] [--dry-run]
---

# archive-tasks

Archive completed tasks in batch to maintain tasks.json at manageable size.

<!-- Tool Path Constraints:
- Write: Limited to backlog/tasks.json, backlog/tasks-archive.json
- Read: Limited to backlog/tasks.json, backlog/tasks-archive.json
- All paths must be within the backlog/ directory
-->

## Usage

- `/archive-tasks` - Archive all done tasks
- `/archive-tasks --older-than=30d` - Archive tasks completed > 30 days ago
- `/archive-tasks --keep=10` - Keep 10 most recent done tasks, archive rest
- `/archive-tasks --dry-run` - Preview without making changes

## Instructions

### Step 1: Parse Arguments

Parse $ARGUMENTS for flags:

1. **Check for `--dry-run`**
   - If present: Set `dry_run = true`
   - Preview mode - no file writes

2. **Check for `--older-than=Nd`**
   - Parse format: `--older-than=(\d+)d`
   - Extract number of days (e.g., `30d` = 30 days)
   - If invalid format: Show error E011
   - Set `older_than_days = N`

3. **Check for `--keep=N`**
   - Parse format: `--keep=(\d+)`
   - Extract count (e.g., `--keep=10` = keep 10 most recent)
   - If invalid format: Show error E011
   - Set `keep_count = N`

4. **Validate mutual exclusivity**
   - If BOTH `--older-than` AND `--keep` provided:
     ```
     [ERROR] E011: Cannot use --older-than and --keep together.
     Use one retention policy at a time.
     ```
   - Exit with error

### Step 2: Read Current State

1. **Read tasks.json**
   - Read `backlog/tasks.json`
   - Parse JSON
   - Extract `tasks` array
   - Record `before_size` = file size
   - Record `before_active_count` = total tasks count

2. **Read tasks-archive.json** (if exists)
   - If `backlog/tasks-archive.json` exists:
     - Read and parse JSON
     - Record `before_archived_count` = archived tasks count
   - If not exists:
     - Set `before_archived_count = 0`
     - Will create with schema on write

3. **Filter done tasks**
   - Find all tasks where `status === "done"`
   - If no done tasks found:
     ```
     ## Nothing to Archive

     No completed tasks found in tasks.json.
     All [N] tasks are still active.
     ```
   - Exit gracefully

### Step 3: Apply Retention Policy

1. **Default (no flags)**: Archive ALL done tasks
   ```javascript
   toArchive = doneTasks;
   ```

2. **If `--older-than=Nd`**:
   - Calculate cutoff date = today - N days
   - Filter done tasks where `completed` < cutoff
   ```javascript
   const cutoff = new Date();
   cutoff.setDate(cutoff.getDate() - older_than_days);
   toArchive = doneTasks.filter(t => {
     if (!t.completed) return false; // Skip if no completed date
     return new Date(t.completed) < cutoff;
   });
   ```

3. **If `--keep=N`**:
   - Sort done tasks by `completed` date descending (most recent first)
   - Keep first N, archive the rest
   ```javascript
   const sorted = doneTasks
     .filter(t => t.completed) // Must have completed date
     .sort((a, b) => new Date(b.completed) - new Date(a.completed));
   const toKeep = sorted.slice(0, keep_count);
   toArchive = sorted.slice(keep_count);
   ```

4. **Handle missing `completed` dates**:
   - If a done task has no `completed` field:
     - Include in archive (legacy cleanup)
     - Use `archived_at` as the record date

### Step 4: Preview or Execute

**If `--dry-run`**:

Display preview without making changes:

```markdown
## Archive Preview (Dry Run)

### Tasks to Archive: [N]

| ID | Title | Completed |
|----|-------|-----------|
| TASK-001 | [title] | 2026-01-01 |
| TASK-002 | [title] | 2026-01-03 |
...

### Projected Impact

| Metric | Before | After |
|--------|--------|-------|
| tasks.json tasks | [N] | [N - archived] |
| tasks-archive.json tasks | [N] | [N + archived] |

No changes made. Remove --dry-run to execute.
```

Exit after preview.

**If NOT dry-run**:

Proceed to Step 5.

### Step 5: Write Archive File (FIRST)

**CRITICAL**: Write archive file FIRST for data safety.

1. **Prepare archive entries**
   - For each task in `toArchive`:
     - Add `archived_at: [today's date YYYY-MM-DD]`

2. **Read or create tasks-archive.json**
   - If exists: Read current archive
   - If not exists: Create with schema:
     ```json
     {
       "$schema": "http://json-schema.org/draft-07/schema#",
       "description": "Archived completed tasks from simon_tools backlog",
       "version": "1.0.0",
       "tasks": []
     }
     ```

3. **Append to archive**
   - Add all `toArchive` tasks to `tasks` array
   - Write to `backlog/tasks-archive.json`

### Step 6: Update tasks.json (SECOND)

1. **Remove archived tasks**
   - Filter out tasks that were archived
   - Keep all non-archived tasks

2. **Write updated tasks.json**
   - Preserve schema fields ($schema, description, version)
   - Write updated `tasks` array
   - Write to `backlog/tasks.json`

3. **Record after metrics**
   - `after_active_count` = remaining tasks
   - `after_archived_count` = total in archive

### Step 7: Display Summary

```markdown
## Archive Summary

| Metric | Before | After |
|--------|--------|-------|
| tasks.json tasks | [before_active] | [after_active] |
| tasks-archive.json tasks | [before_archived] | [after_archived] |

Archived [N] tasks to tasks-archive.json

### Archived Tasks

| ID | Title | Completed | Archived |
|----|-------|-----------|----------|
| TASK-001 | [title] | 2026-01-01 | 2026-01-13 |
...
```

## Error Handling

| Situation | Error | Exit |
|-----------|-------|------|
| Invalid --older-than format | [ERROR] E011: Invalid duration format '[value]'. Use format: --older-than=Nd (e.g., 30d) | 1 |
| Invalid --keep format | [ERROR] E011: Invalid keep format '[value]'. Use format: --keep=N (e.g., 10) | 1 |
| Both flags used | [ERROR] E011: Cannot use --older-than and --keep together. | 1 |
| tasks.json not found | [ERROR] E001: backlog/tasks.json not found. | 1 |
| JSON parse error | [ERROR] E104: Could not parse [file]. Check file for syntax errors. | 2 |
| File write failed | [ERROR] E106: Could not write to [file]. Check permissions. | 2 |

**Error Format Reference**: See `.claude/skills/error-handling/error-codes.md`

## CRITICAL RULES

- **ALWAYS** write tasks-archive.json FIRST (data safety)
- **ALWAYS** write tasks.json SECOND (remove only after archive succeeds)
- **NEVER** archive non-done tasks
- **NEVER** modify individual task .md files (only JSON indexes)
- **ALWAYS** show preview with --dry-run before bulk operations
- **ALWAYS** add `archived_at` timestamp to archived tasks
