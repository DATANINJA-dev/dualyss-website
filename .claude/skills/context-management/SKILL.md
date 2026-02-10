---
name: context-management
description: |
  Guides context window management and session hygiene for Claude Code. Auto-activates
  during long sessions, when context drift is detected, or when user asks about
  /clear, context, or session management. Prevents degraded performance from context bloat.
---

# Context Management Skill

## When This Skill Activates

- Long coding sessions (10+ exchanges)
- User mentions "/clear", "context", "session", "forget"
- Responses seem to ignore earlier instructions (context drift)
- Large file reads or documentation fetches
- Starting unrelated tasks mid-session

## The Problem: Context Drift

In long sessions, Claude gradually deprioritizes earlier instructions. This manifests as:

- Forgetting project conventions from CLAUDE.md
- Repeating previously discussed solutions
- Missing earlier context about decisions made
- Decreased response quality over time

## When to Use /clear

| Situation | Action |
|-----------|--------|
| Starting new unrelated task | `/clear` immediately |
| Completed major feature | `/clear` before next feature |
| Responses ignore earlier instructions | `/clear` and restate key context |
| After large documentation fetch | `/clear` if docs no longer needed |
| Session feels "slow" or "confused" | `/clear` as reset |

### /clear Best Practices

```
# Good: Clear between unrelated tasks
/clear
"Now let's work on the authentication module"

# Good: Clear after completing a feature
/clear
"Feature complete. Moving on to database optimization"

# Bad: Clearing mid-task (loses important context)
# Only clear when you can afford to restate needed context
```

## When to Use Subagents

Delegate to subagents (Task tool) for:

| Task Type | Why Subagent |
|-----------|--------------|
| Research/exploration | Keeps main context clean |
| Documentation fetching | Large docs don't bloat main session |
| Codebase scanning | Exploration context isolated |
| Parallel investigations | Multiple agents, focused contexts |

### Subagent Pattern

```
# Instead of fetching docs directly:
"Read the React documentation for hooks"  # Bloats context

# Delegate to subagent:
[Task tool → Explore agent]
"Research React hooks documentation and summarize key patterns"
# Returns only the summary, not full docs
```

## Context Budgeting

### High-Value Context (Keep)
- Current task requirements
- Recent decisions and rationale
- Active file contents being edited
- User preferences stated this session

### Low-Value Context (Clear)
- Completed task details
- Exploration that led nowhere
- Full documentation dumps
- Old error messages already resolved

## Signs of Context Drift

Watch for these symptoms:

1. **Repeating solutions** - Suggesting what was already rejected
2. **Forgetting conventions** - Ignoring CLAUDE.md patterns
3. **Asking answered questions** - "What framework are you using?"
4. **Decreased quality** - Responses feel less precise
5. **Slow responses** - Context processing overhead

## Recovery Strategies

### Light Recovery
```
"Remember: We're using TypeScript with strict mode,
following the patterns in CLAUDE.md"
```

### Medium Recovery
```
/clear
"Resuming work on [task]. Key context:
- Using TypeScript + React
- Following [specific pattern]
- Current goal: [objective]"
```

### Full Recovery
```
/clear
[Re-read relevant CLAUDE.md sections]
[Re-read current working files]
"Starting fresh on [task]"
```

## Session Hygiene Checklist

- [ ] Clear context between unrelated tasks
- [ ] Use subagents for research-heavy operations
- [ ] Summarize and clear after large explorations
- [ ] Restate key context after /clear
- [ ] Watch for context drift symptoms
- [ ] Keep active context focused on current task

## Quick Tips

1. **Prefer narrow context** - Only load what you need now
2. **Summarize, don't dump** - Ask for summaries, not full docs
3. **Clear proactively** - Before drift, not after
4. **Subagent liberally** - When in doubt, delegate exploration
5. **Restate key points** - After /clear, remind of critical context

## Constraints

- Never continue a degraded session hoping it improves
- Always restate critical context after /clear
- Prefer subagents for any research exceeding 2-3 file reads
- Monitor session quality and clear proactively
