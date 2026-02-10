---
description: Suggest the next task to work on based on dependencies, status, and complexity
allowed-tools: Glob, Read, Grep
---

# suggest-task


Analyze the backlog to recommend the next task to work on.

## Purpose

Help developers prioritize work by analyzing task dependencies, complexity, and status. Shows tasks that are ready to be started (all dependencies completed).

## Instructions

### Step 1: Gather Task Data

1. **Check for tasks.json**
   - Read `backlog/tasks.json` if it exists
   - If not, fall back to scanning individual task files

2. **Scan task files**
   - Use Glob to find all `backlog/tasks/TASK-*.md` files
   - Read the frontmatter of each task file
   - Extract: id, type, status, complexity, depends_on

### Step 2: Filter Available Tasks

1. **Status filter**
   - Only include tasks with `status: backlog`
   - Exclude `in_progress` and `done` tasks

2. **Dependency filter**
   - Check each task's `depends_on` field
   - Task is "ready" if:
     - `depends_on` is empty OR
     - All tasks in `depends_on` have `status: done`

### Step 3: Prioritize

Sort ready tasks by:
1. **Blockers first** - Tasks that block other tasks (appear in others' depends_on)
2. **Complexity ascending** - Lower complexity tasks first (quick wins)
3. **Created date ascending** - Older tasks before newer

### Step 4: Present Recommendations

Show top 3 recommendations:

```markdown
## Next Task Recommendations

### Ready to Start

| Priority | Task | Type | Complexity | Blocks | Why |
|----------|------|------|------------|--------|-----|
| 1 | TASK-XXX | [type] | [N]/10 | [count] | [reason] |
| 2 | TASK-YYY | [type] | [N]/10 | [count] | [reason] |
| 3 | TASK-ZZZ | [type] | [N]/10 | [count] | [reason] |

### Blocked Tasks
- TASK-AAA: Waiting on [TASK-BBB, TASK-CCC]
- TASK-DDD: Waiting on [TASK-XXX]

### In Progress
- TASK-EEE: [title] (started [date])

### Quick Actions
- Start #1: `/update-task TASK-XXX in_progress`
- View task: Read `backlog/tasks/TASK-XXX.md`
- Full list: `/list-tasks`
```

## Error Handling

| Situation | Error | Exit |
|-----------|-------|------|
| No tasks in backlog | [INFO] No tasks in backlog. Run `/generate-task "idea"` to create one. | 0 |
| All tasks blocked | [INFO] All tasks are blocked. Showing dependency analysis... | 0 |
| No tasks.json | [INFO] No index found, scanning files... (then proceed) | 0 |
| Circular dependency | [WARNING] E204: Circular dependency detected: [chain]. Resolve before proceeding. | 0 |
| File read error | [ERROR] E107: Could not read [file]. Check file permissions. | 2 |

**Error Format Reference**: See `.claude/skills/error-handling/error-codes.md`

## CRITICAL RULES

- **NEVER modify any files** - this is a read-only analysis command
- **ALWAYS check dependency status** before recommending a task
- **ALWAYS show what's blocking** tasks that can't be started
- **PREFER tasks that unblock others** over isolated tasks
