# Adoption Phases

The task-based adoption workflow consists of 4 phases that transform framework installation from a direct operation into a reviewable, step-by-step process.

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  ENTRY POINT: /framework analyze <path>                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: ANALYZE                                               │
│                                                                 │
│  • Detect project type and stack                                │
│  • Calculate readiness score                                    │
│  • Classify existing components (if any)                        │
│  • Generate analysis report                                     │
│                                                                 │
│  Output: Analysis JSON + Component decisions                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: TASK GENERATION                                       │
│                                                                 │
│  • Create TASK-XXX with adoption plan                           │
│  • Include component decisions from Phase 1                     │
│  • Define acceptance criteria                                   │
│  • Link to EPIC (if specified)                                  │
│                                                                 │
│  Output: TASK-XXX.md in backlog/tasks/                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: REFINE                                                │
│                                                                 │
│  Command: /refine TASK-XXX                                      │
│                                                                 │
│  • Generate implementation plan                                 │
│  • Create DIFF previews for each file                          │
│  • Define step-by-step execution order                         │
│  • Identify rollback points                                    │
│                                                                 │
│  Output: Implementation plan appended to TASK-XXX.md           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: DEVELOP                                               │
│                                                                 │
│  Command: /develop-task TASK-XXX                                │
│                                                                 │
│  • Execute each step with user approval                        │
│  • Show DIFF before applying changes                           │
│  • Create atomic commits per step                              │
│  • Validate after each step                                    │
│                                                                 │
│  Output: Framework installed, TASK marked done                 │
└─────────────────────────────────────────────────────────────────┘
```

## State Machine

```
                    ┌──────────────┐
                    │   START      │
                    └──────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │      ANALYZING         │
              │                        │
              │  • Scanning project    │
              │  • Checking readiness  │
              │  • Classifying         │
              └────────────┬───────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
      ┌──────────┐  ┌──────────┐  ┌──────────────┐
      │ BLOCKED  │  │ READY    │  │ READY_WITH   │
      │          │  │          │  │ _WARNINGS    │
      └────┬─────┘  └────┬─────┘  └──────┬───────┘
           │             │               │
           │             └───────┬───────┘
           │                     │
           ▼                     ▼
    ┌────────────┐      ┌────────────────┐
    │  ABORT     │      │ TASK_CREATED   │
    │            │      │                │
    │ Show       │      │ TASK-XXX ready │
    │ blockers   │      │ for /refine    │
    └────────────┘      └───────┬────────┘
                                │
                                ▼
                       ┌────────────────┐
                       │   REFINED      │
                       │                │
                       │ Plan generated │
                       │ DIFFs ready    │
                       └───────┬────────┘
                               │
                               ▼
                      ┌────────────────┐
                      │  DEVELOPING    │
                      │                │
                      │ Executing      │
                      │ steps 1..N     │
                      └───────┬────────┘
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
        ┌──────────┐  ┌──────────────┐  ┌─────────┐
        │ FAILED   │  │  COMPLETE    │  │ PAUSED  │
        │          │  │              │  │         │
        │ Rollback │  │ Framework    │  │ Save    │
        │ available│  │ installed    │  │ progress│
        └──────────┘  └──────────────┘  └─────────┘
```

## Phase Details

### Phase 1: Analyze

**Trigger**: `/framework analyze <path>`

**Prerequisites**:
- Target path exists and is accessible
- Git repository (recommended, not required)

**Actions**:
1. Detect project type using [framework-scaffolding-patterns](../framework-scaffolding-patterns/SKILL.md)
2. Run prerequisite checks from [prerequisite-checklist.md](prerequisite-checklist.md)
3. If `.claude/` exists, classify components using [case-by-case-patterns.md](case-by-case-patterns.md)
4. Calculate readiness score (0-100)
5. Generate analysis output

**Output Format**:
```yaml
analysis:
  path: "../target-project"
  readiness_score: 85
  verdict: READY_WITH_WARNINGS
  project_type: "node-typescript"

  blockers: []
  warnings:
    - "Uncommitted changes detected"

  component_decisions:
    - file: "custom-command.md"
      decision: "absorb"
      confidence: 0.78
```

**Transitions**:
- Score >= 70, no blockers → TASK_CREATED
- Score >= 70, blockers → BLOCKED
- Score < 70 → BLOCKED (with improvement suggestions)

### Phase 2: Task Generation

**Trigger**: Automatic after successful Phase 1

**Actions**:
1. Generate unique TASK-XXX ID
2. Create task file with:
   - Analysis results embedded
   - Component decisions recorded
   - Acceptance criteria derived from analysis
3. Update tasks.json
4. Link to epic (if specified)

**Task Structure**:
```markdown
---
id: TASK-XXX
type: infra
status: backlog
epic_id: EPIC-YYY (if specified)
---

# Adopt simon_tools Framework

## Context
Analysis performed on [date] for [path]
Readiness: [score]% - [verdict]

## Component Decisions
[From Phase 1 classification]

## Acceptance Criteria
- [ ] Framework structure installed
- [ ] CLAUDE.md merged
- [ ] MCP configuration updated
- [ ] Post-installation validation passes
```

### Phase 3: Refine

**Trigger**: User runs `/refine TASK-XXX`

**Actions**:
1. Load task and analysis context
2. Run analysis agents (code-impact, test-planning, etc.)
3. Generate implementation plan with:
   - Ordered steps
   - DIFF previews for each file change
   - Rollback instructions
4. Append plan to task file

**Implementation Plan Structure**:
```markdown
## Implementation Plan

### Step 1: Backup Current State
Files: .claude-backup/
Action: Create timestamped backup

### Step 2: Install Core Structure
Files: .claude/commands/, .claude/agents/
DIFF Preview:
  + .claude/commands/help.md
  + .claude/commands/list-tasks.md
  ...

### Step 3: Merge CLAUDE.md
DIFF Preview:
  [Three-way merge preview]
```

### Phase 4: Develop

**Trigger**: User runs `/develop-task TASK-XXX`

**Actions per Step**:
1. Present step scope and DIFF preview
2. Wait for user approval
3. Execute changes
4. Validate step success
5. Create atomic commit
6. Update progress

**Step Approval Flow**:
```
## Step 2: Install Core Structure

### DIFF Preview
+ .claude/commands/help.md (new file, 45 lines)
+ .claude/commands/list-tasks.md (new file, 67 lines)
...

### What This Step Does
- Creates commands directory
- Installs 12 core command files
- Total: +534 lines

Proceed? [Y]es / [N]o / [D]etails / [S]kip
```

## Error Recovery

### During Phase 1 (Analyze)
| Error | Recovery |
|-------|----------|
| Path not found | Show error, suggest correct path |
| Permission denied | Show error, suggest sudo/admin |
| Git dirty (warning) | Continue with warning, offer --force |

### During Phase 4 (Develop)
| Error | Recovery |
|-------|----------|
| Step validation fails | Offer: Retry, Skip, Rollback |
| Merge conflict | Show conflict, offer manual resolution |
| Hook rejection | Show hook error, suggest fix |

**Rollback Command**:
```
/framework rollback TASK-XXX --to step-N
```

Restores from `.claude-backup/` to the state before step N+1.

## Example Session

```
User: /framework analyze ../berlin_workshop

Claude: ## Framework Analysis: berlin_workshop

**Readiness**: 85% - READY_WITH_WARNINGS

### Project Detection
- Type: Node.js TypeScript
- Existing .claude/: Yes (3 commands, 1 agent)

### Prerequisite Checks
✓ Path accessible
✓ Git repository
⚠ Uncommitted changes (2 files)
✓ Write permission
✓ Version compatible

### Component Classification
| Component | Recommendation | Confidence |
|-----------|----------------|------------|
| custom-deploy.md | Keep local | 92% |
| utility-helper.md | Absorb | 78% |
| project-agent.md | Keep local | 85% |

Proceed with task creation? [Y/n]

User: Y

Claude: Created TASK-042: Adopt simon_tools Framework

Next steps:
1. Review: `cat backlog/tasks/TASK-042.md`
2. Refine: `/refine TASK-042`
3. Develop: `/develop-task TASK-042`
```

## Phase Transitions Summary

| From | To | Trigger |
|------|----|---------|
| START | ANALYZING | `/framework analyze` |
| ANALYZING | BLOCKED | Blockers found |
| ANALYZING | TASK_CREATED | No blockers, user confirms |
| TASK_CREATED | REFINED | `/refine TASK-XXX` |
| REFINED | DEVELOPING | `/develop-task TASK-XXX` |
| DEVELOPING | COMPLETE | All steps pass |
| DEVELOPING | FAILED | Step fails, user aborts |
| DEVELOPING | PAUSED | User pauses, progress saved |
| PAUSED | DEVELOPING | `/develop-task TASK-XXX --resume` |
