# Response Templates

## Agent Findings Presentation

When presenting agent findings to the user:

```markdown
## Agent Analysis Summary

### Research Agent
- **Related files**: [count] files in [areas]
- **Similar tasks**: [TASK-XXX] - [brief description]
- **Key patterns**: [observed patterns]

### Code Impact Agent (if run)
- **Affected files**: [list top 5]
- **Dependencies**: [list key dependencies]
- **Risk areas**: [brief summary]

### Test Planning Agent (if run)
- **Current coverage**: [percentage or description]
- **Gaps identified**: [list gaps]
- **Suggested tests**: [list test types]

### Security Agent (if run)
- **Risk level**: [Low/Medium/High]
- **Key concerns**: [list top concerns]
- **Required mitigations**: [list]

### Other Agents
[Similar format for UX, API, Documentation, Design System agents]

---

Based on these findings, I have some questions:
```

---

## Discovery Question Formats

### Guided Mode (One at a Time)

```markdown
**Question 1 of [N]**: [Question text]

Context: [Why this question matters, based on agent findings]

Examples of good answers:
- [Example 1]
- [Example 2]
```

### Batch Mode (All at Once)

```markdown
## Discovery Questions

Please answer the following to help define this task:

### Scope
1. [Question about scope]
2. [Question about boundaries]

### Requirements
3. [Question about specific needs]
4. [Question about acceptance criteria]

### Technical
5. [Question about technical constraints]
6. [Question about integration]

---

You can answer all at once or ask me to clarify any question.
```

---

## Draft Task Presentation

When showing the draft to the user:

```markdown
## Draft Task: TASK-XXX

Here's the complete task I'll create:

---

[Full markdown content of the task file]

---

### Analysis Summary

| Aspect | Value |
|--------|-------|
| Type | [feature/bug/etc] |
| Complexity | [score]/10 |
| Agents used | [list] |
| Questions asked | [count] |

### Checklist
- [x] All required fields populated
- [x] No placeholder text
- [x] Acceptance criteria are verifiable
- [x] Agent insights incorporated

---

**Does this look correct?** I can:
- **Create** this task as-is
- **Adjust** specific sections
- **Start over** with different scope
```

---

## Complexity Assessment Format

```markdown
## Complexity Analysis

**Score: [X]/10**

| Factor | Assessment | Score |
|--------|------------|-------|
| Files affected | [count] files across [areas] | [1-3] |
| Integration points | [count] external systems | [1-3] |
| Test requirements | [scope of testing] | [1-3] |
| Documentation needs | [scope] | [1-3] |

### Recommendation

[If score >= 7:]
This task is complex. Consider:
- **Decompose**: Split into [N] subtasks
- **Proceed**: Keep as single task (higher risk)
- **Re-scope**: Reduce scope to lower complexity

[If score 4-6:]
Moderate complexity. Standard approach with 2-3 analysis agents recommended.

[If score 1-3:]
Simple task. Proceed directly with minimal agent analysis.
```

---

## Error and Clarification Formats

### When Input Validation Fails

```markdown
**Input Issue**: [description of problem]

The task idea you provided [specific issue].

Please provide:
- [What's needed]
- [Example of good input]

Usage: `/generate-task "description of what you need"`
```

### When Clarification Needed

```markdown
**Quick clarification needed**:

You mentioned "[quote from user]". I want to make sure I understand:

- Did you mean [interpretation A]?
- Or [interpretation B]?

This affects [what it affects in the task].
```

### When Scope Is Too Large

```markdown
**Scope Check**

Based on the analysis, this task affects:
- [N] files
- [N] components
- [N] integration points

Complexity score: [X]/10 (High)

I recommend splitting this into smaller tasks:

1. **TASK-XXX-A**: [First logical chunk]
2. **TASK-XXX-B**: [Second logical chunk]
3. **TASK-XXX-C**: [Third logical chunk]

Would you like to:
- **Decompose** into these subtasks?
- **Proceed** as a single complex task?
- **Re-scope** to reduce the scope?
```

---

## Success Confirmation Format

```markdown
## Task Created Successfully

| Field | Value |
|-------|-------|
| ID | TASK-XXX |
| Type | [type] |
| Title | [title] |
| Complexity | [score]/10 |
| File | backlog/tasks/TASK-XXX.md |

### Analysis Summary
- **Configuration**: [depth] + [style]
- **Agents used**: [list with checkmarks]
- **Discovery questions**: [count]
- **Template**: [template name]

### Next Steps
- **Review**: `cat backlog/tasks/TASK-XXX.md`
- **Start work**: `/update-task TASK-XXX in_progress`
- **See priority**: `/suggest-task` to see recommended work order
```

---

## Dependency Declaration Format

When asking about dependencies:

```markdown
## Dependencies

Does this task depend on other tasks being completed first?

Current tasks in backlog:
- TASK-001: [title] (status)
- TASK-002: [title] (status)
- TASK-003: [title] (status)

Enter task IDs this depends on (comma-separated), or press Enter for none:
```

When confirming dependencies:

```markdown
### Dependencies Set

This task:
- **Depends on**: [TASK-XXX, TASK-YYY]
- **Blocks**: (none yet - will be updated when dependent tasks are created)

Dependency chain:
TASK-XXX (in_progress) → TASK-YYY (backlog) → **TASK-ZZZ** (this task)
```
