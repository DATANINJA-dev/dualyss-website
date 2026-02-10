---
name: develop-workflow
description: |
  Guides the development execution workflow for tasks with implementation plans.
  Auto-activates during /develop-task execution, when implementing features,
  or when user mentions "develop", "implement", "build", or "code" a task.
  Enforces TDD and provides step-by-step execution patterns.
---

# Development Workflow Skill

## When This Skill Activates

- Executing `/develop-task` command
- User mentions "develop", "implement", "build" a specific task
- Implementing features from an implementation plan
- Following TDD during active development
- Resuming interrupted development

## Core Principles

1. **TDD is mandatory** - Every feature gets tests first
2. **Atomic steps** - One logical change per step
3. **Checkpoint early** - User confirms before significant actions
4. **Resume-friendly** - Progress saved for interruption recovery
5. **Minimal implementation** - Write only what tests require
6. **Type-adaptive** - Adjust verifications based on task type

## TDD Quick Reference

```
RED Phase:
1. Write test that describes expected behavior
2. Run test - MUST FAIL
3. If test passes, it's not testing new functionality

GREEN Phase:
1. Write MINIMAL code to pass test
2. Don't add extra features
3. Run test - MUST PASS

REFACTOR Phase:
1. Clean up code (naming, duplication, patterns)
2. Run tests after each change
3. If tests fail, revert last change
```

## Step Execution Pattern

For each implementation step:

```
1. UNDERSTAND    - Read step requirements from plan
       |
       v
2. CHECKPOINT    - User confirms scope [Y/n/skip/details]
       |
       v
3. DETECT TYPE   - Analyze step for task type (backend/frontend/UX/SEO)
       |
       v
4. FIND SKILLS   - Search for relevant validation skills
       |
       v
5. RED           - Write failing tests
       |
       v
6. VERIFY RED    - Tests MUST fail
       |
       v
7. GREEN         - Write minimal implementation
       |
       v
8. VERIFY GREEN  - Tests MUST pass
       |
       v
9. REFACTOR      - Clean up code
       |
       v
10. VERIFY       - Tests still pass
       |
       v
11. EXTRA CHECKS - Run type-specific validations (if skills found)
       |
       v
12. CHECKPOINT   - Review changes before commit [Y/n/review]
       |
       v
13. COMMIT       - Atomic commit for step (via commit-validator)
       |
       v
14. PROGRESS     - Update tracking, suggest /clear if context large
```

## Checkpoint Decision Matrix

| Situation | Checkpoint Type | Skippable |
|-----------|-----------------|-----------|
| Before development starts | CRITICAL | No |
| Before each step | CRITICAL | No |
| After RED phase | STANDARD | Yes (--quick) |
| After GREEN phase | STANDARD | Yes (--quick) |
| Before commit | CRITICAL | No |
| Context getting large | ADVISORY | Yes |
| Before marking done | CRITICAL | No |
| Resuming interrupted work | CRITICAL | No |

## Task Type Detection

Analyze Implementation Plan sections to detect task type:

| Section Populated | Detected Type | Extra Validations |
|-------------------|---------------|-------------------|
| Technical Scope dominant | Backend | API contracts, DB migrations |
| Design Alignment dominant | Frontend | Visual regression, responsive |
| UX Considerations present | UX | Accessibility, usability |
| SEO Impact present | SEO | Lighthouse, structured data |
| Multiple sections | Mixed | Combined validations |

## Skill Search Pattern

When task type detected, search for relevant skills:

```
Type: UX
Search: .claude/skills/*accessibility*, .claude/skills/*usability*

Type: SEO
Search: .claude/skills/*seo*, .claude/skills/*lighthouse*

Type: Frontend
Search: .claude/skills/*visual*, .claude/skills/*component*

Type: Backend
Search: Use standard TDD (always available)
```

## Research Fallback

If no relevant skill found:

1. Use `research-methodology` skill for web research
2. Search: "best practices [type] validation checklist"
3. Synthesize minimal checklist
4. Present to user with option to create permanent skill

## Progress Tracking Format

```yaml
development_progress:
  status: in_progress|paused|complete
  current_step: N
  total_steps: M
  started: timestamp
  last_checkpoint: timestamp
  completed_steps:
    - step: 1
      title: "Step title"
      completed: timestamp
      commit: hash
      tests_added: N
      files_changed: N
  skipped_steps: []
  session_notes: "Optional context"
```

## Error Recovery

| Error | Recovery |
|-------|----------|
| Tests won't run | Detect framework, suggest fix |
| Tests fail in GREEN | [F]ix / [D]ebug / [R]evert / [A]sk |
| Build fails | Show errors, suggest fixes |
| User cancels | Save progress, enable resume |
| Scope creep detected | Warn, ask to proceed or refocus |

## Integration Points

| Component | Integration |
|-----------|-------------|
| `/set-up` | Reads Implementation Plan |
| `tdd-workflow` skill | Uses Red-Green-Refactor principles |
| `commit-validator` hook | Validates each step commit |
| `context-management` skill | Suggests /clear between steps |
| `/update-task` | Called at completion |
| `research-methodology` skill | Fallback for missing validations |

## Constraints

- Never skip the RED phase (no test-after-code)
- Never commit if tests fail
- Always save progress for resume capability
- Prefer skills over research when available
- Suggest creating permanent skills when research successful
- Keep steps atomic and focused
- Prefer asking over assuming

## Supporting Files

- See `step-patterns.md` for detailed execution patterns by task type
