---
description: Update task status or properties
allowed-tools: Glob, Read, Write, Grep
argument-hint: TASK-XXX [status|property=value]
---

# update-task

Update task status or properties.

<!-- Tool Path Constraints:
- Write: Limited to backlog/tasks/*.md, backlog/tasks.json, backlog/tasks-archive.json
- All paths must be within the backlog/ directory
-->

## Usage

- `/update-task TASK-XXX in_progress` - Start working on a task
- `/update-task TASK-XXX done` - Mark a task as complete
- `/update-task TASK-XXX backlog` - Return a task to backlog
- `/update-task TASK-XXX complexity=5` - Update complexity score
- `/update-task TASK-XXX depends_on=TASK-001,TASK-002` - Set dependencies

## Instructions

### Step 1: Parse Arguments

Parse $ARGUMENTS:
1. First part: Task ID (required) - format TASK-XXX
2. Second part: Update action (required)
   - Status: `backlog`, `in_progress`, `done`
   - Property: `property=value` format

### Step 2: Validate

1. **Validate task exists**
   - Check if `backlog/tasks/[TASK-ID].md` exists
   - If not, show error: "Task [ID] not found in backlog/tasks/"

2. **Validate status transition**
   - backlog → in_progress: OK
   - in_progress → done: OK
   - in_progress → backlog: OK (with confirmation)
   - done → backlog: OK (with confirmation)
   - done → in_progress: OK

3. **Validate dependencies** (when marking done)
   - If task has `depends_on`, check all dependencies are `done`
   - If not, warn: "This task depends on [list] which are not done. Proceed anyway? [y/N]"

### Step 3: Update Task File

1. **Read current file**
   - Read `backlog/tasks/[TASK-ID].md`
   - Parse frontmatter

2. **Update frontmatter**
   - For status: Update `status:` field
   - For property: Update specified property
   - For done status: Add `completed: [DATE]` field

3. **Write updated file**
   - Write back to same location

### Step 4: Update tasks.json (if exists)

1. **Read tasks.json**
   - If `backlog/tasks.json` exists, read it

2. **Update entry**
   - Find task by ID
   - Update matching fields

3. **Write tasks.json**
   - Write back

### Step 4.5: Archive to tasks-archive.json (if status=done)

If the new status is `done`, auto-archive the task entry:

1. **Read tasks-archive.json**
   - If `backlog/tasks-archive.json` exists, read it
   - If not exists, create with schema:
     ```json
     {
       "$schema": "http://json-schema.org/draft-07/schema#",
       "description": "Archived completed tasks from simon_tools backlog",
       "version": "1.0.0",
       "tasks": []
     }
     ```

2. **Move task entry from tasks.json to archive**
   - Find task entry in tasks.json tasks array
   - Add `archived_at: [DATE]` field to the entry
   - Append to tasks-archive.json tasks array
   - Remove from tasks.json tasks array

3. **Write both files**
   - Write updated tasks.json (without the done task)
   - Write updated tasks-archive.json (with the archived task)

4. **Log archive action**
   - Note in confirmation output that task was archived

**Rationale**: Keeps tasks.json small and readable by Claude Code tools by moving completed tasks to a separate archive file.

### Step 5: Show Confirmation

**Status update:**

```markdown
## Task Updated

| Field | Before | After |
|-------|--------|-------|
| Status | [old] | [new] |
[| Completed | - | [date] |]

Task: TASK-XXX - [title]
File: backlog/tasks/TASK-XXX.md

### Next Steps
[If done:] Task archived to tasks-archive.json. Use `/suggest-task` to see what to work on next
[If in_progress:] Task is now your current focus
[If backlog:] Task returned to backlog
```

**Property update:**

```markdown
## Task Updated

| Property | Before | After |
|----------|--------|-------|
| [property] | [old] | [new] |

Task: TASK-XXX - [title]
```

## Status Transitions

```
                   ┌──────────────┐
                   │   backlog    │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
         ┌────────│ in_progress  │────────┐
         │        └──────┬───────┘        │
         │               │                │
         ▼               ▼                │
  ┌──────────────┐ ┌──────────────┐       │
  │   backlog    │ │     done     │───────┘
  └──────────────┘ └──────────────┘
```

## Error Handling

| Situation | Error | Exit |
|-----------|-------|------|
| Task not found | [ERROR] E001: Task [ID] not found. Run `/list-tasks` to see available tasks. | 1 |
| Invalid task ID format | [ERROR] E003: Invalid task ID '[ID]'. Use TASK-XXX format. | 1 |
| Invalid status | [ERROR] E006: Invalid status '[status]'. Valid: backlog, in_progress, done. | 1 |
| Invalid property | [ERROR] E014: Unknown property '[prop]'. Valid: status, complexity, depends_on. | 1 |
| Invalid complexity | [ERROR] E011: Invalid complexity '[value]'. Use 1-10 or S/M/L. | 1 |
| Dependencies incomplete | [WARNING] E203: Task depends on [list] which are not done. Proceed anyway? | 0 |
| Circular dependency | [ERROR] E204: Circular dependency detected: [chain]. Cannot proceed. | 1 |
| File write failed | [ERROR] E106: Could not write to [file]. Check permissions. | 2 |
| JSON parse error | [ERROR] E104: Could not parse tasks.json. Check file for syntax errors. | 2 |

**Error Format Reference**: See `.claude/skills/error-handling/error-codes.md`

## CRITICAL RULES

- **ALWAYS validate task exists** before attempting update
- **ALWAYS confirm** when moving from done back to backlog or in_progress
- **ALWAYS check dependencies** when marking a task done
- **NEVER allow circular dependencies** - detect and reject
- **ALWAYS update both** the task file and tasks.json (if exists)
- **ALWAYS show before/after** for transparency
