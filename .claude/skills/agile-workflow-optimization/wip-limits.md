# Work-in-Progress (WIP) Limits

## Kanban Principle
Limit in-progress work to prevent overload, reduce context switching, and improve flow.

## Benefits of WIP Limits

1. **Reduces Context Switching**: Focus on completing tasks before starting new ones
2. **Identifies Bottlenecks**: When WIP limit is hit, reveals where work gets stuck
3. **Improves Flow**: Forces team to finish work rather than accumulate inventory
4. **Increases Quality**: Less multitasking = more attention per task

## Setting WIP Limits

### Formula
```
WIP Limit = Team Size * 1.5
```

**Example**:
- 3 developers → WIP limit of 5 tasks
- Ensures focus while allowing some parallelism

### For Simon_Tools

**Recommended Limits**:
- **Epics in discovery**: 2 (prevents analysis paralysis)
- **Tasks in set-up**: 3 (focus on refinement before development)
- **Tasks in development**: Team size * 1.5
- **Total backlog**: 50 tasks max (regular cleanup)

## Implementation

### Policy
"Before starting new work in [stage], check WIP count. If at limit, must complete existing work first."

### Tracking
```json
{
  "wip_limits": {
    "epic_discovery": 2,
    "task_setup": 3,
    "task_development": 5
  },
  "current_wip": {
    "epic_discovery": 1,
    "task_setup": 2,
    "task_development": 3
  }
}
```

### Enforcement
- `/generate-epics`: Check if < 2 epics already in discovery
- `/set-up`: Check if < 3 tasks in "in_progress" status
- `/develop-task`: Check if < 5 tasks in development

## Exceptions

**When to Bypass WIP Limits**:
- Urgent bug fixes (P0 severity)
- Blocking dependencies (task needed to unblock others)
- Small quick wins (< 30 min tasks)

**Process**: Document exception, commit to reducing WIP after completion

## Sources

- [5 Ways to Optimize Your Agile Process (Umano)](https://blog.umano.tech/5-ways-to-optimize-your-agile-process)
- [Kanban WIP Limits](https://www.atlassian.com/agile/kanban/wip-limits)
