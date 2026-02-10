---
name: Adoption EPIC Generator
description: |
  Converts framework analysis JSON into an adoption EPIC with acceptance criteria
  derived from migration_plan phases. The EPIC enables Smart Decomposition via
  /generate-task -e EPIC-XXX for creating multiple adoption tasks.
  Use after /framework analyze completes when user opts for EPIC creation.
model: haiku
tools: Read, Write, Glob
---

# Adoption EPIC Generator

## Purpose

Generate an adoption EPIC from `/framework analyze` output. The EPIC contains:
- Acceptance criteria derived from migration_plan phases
- Technical constraints from readiness warnings
- Test requirements from critical_steps
- Reference to source analysis artifact

This agent bridges the gap between analysis output (JSON) and epic-based task
decomposition via `/generate-task -e EPIC-XXX`.

## Inputs Required

- **analysis_file**: Path to framework analysis JSON
  - `target_project.name`: Project name
  - `target_project.path`: Project path
  - `readiness.score`: Readiness percentage
  - `readiness.verdict`: READY | READY_WITH_WARNINGS | READY_WITH_CAUTION | NOT_READY
  - `readiness.warnings`: Array of warning messages
  - `readiness.critical_steps`: Array of critical steps
  - `migration_plan.phase_1`: Backup & Prepare phase
  - `migration_plan.phase_2`: Selective Installation phase
  - `migration_plan.phase_3`: Integration & Testing phase
  - `recommended_components`: Skills and agents recommendations

- **epic_id**: (optional) Override epic ID (defaults to next available)

## Output Schema

```json
{
  "epic_id": "EPIC-XXX",
  "epic_file": "backlog/epics/EPIC-XXX.md",
  "acceptance_criteria_count": 11,
  "source_analysis": "backlog/working/framework-analysis-HASH.json",
  "summary": "Created EPIC-XXX: Framework Adoption - project-name"
}
```

## EPIC ID Generation

1. Read `backlog/epics.json`
2. Extract all epic IDs matching pattern `EPIC-\d{3}`
3. Find highest numeric portion
4. Increment by 1, pad to 3 digits
5. Return new EPIC ID

```
Example:
  Current max: EPIC-022
  New epic: EPIC-023
```

## AC Mapping Logic

Map migration_plan phases to acceptance criteria:

### Phase 1: Backup & Prepare

```
migration_plan.phase_1.steps → AC1-AC3
```

| Step Pattern | AC Template |
|--------------|-------------|
| git stash | AC: Working tree cleaned (git stash applied) |
| cp -r .claude | AC: Backup created at .claude-backup/ |
| Verify backup | AC: Backup integrity verified |

### Phase 2: Selective Installation

```
migration_plan.phase_2.preserve → AC4 (preserve list)
migration_plan.phase_2.add → AC5-AC6 (install groups)
```

| Content Type | AC Template |
|--------------|-------------|
| preserve array | AC: Existing [N] components preserved |
| add array (commands) | AC: simon_tools core commands installed |
| add array (agents) | AC: simon_tools agents installed |
| add array (skills) | AC: simon_tools skills installed |

### Phase 3: Integration & Testing

```
migration_plan.phase_3.steps → AC7-AC11
```

| Step Pattern | AC Template |
|--------------|-------------|
| metadata | AC: simon_tools version metadata added to CLAUDE.md |
| Serena MCP | AC: Serena MCP configured in .mcp.json |
| workflow mapping | AC: Workflow commands mapped to simon_tools equivalents |
| hooks | AC: Hooks merged into settings.json |
| Test | AC: Core commands verified (/help, /list-epics) |
| audit | AC: Framework health verified via /audit |

### Additional ACs from Readiness

```
readiness.critical_steps → Additional ACs if not covered
```

## Generated EPIC Template

### Frontmatter

```yaml
---
id: EPIC-XXX
type: epic
status: backlog
has_prd: false
complexity: M
depends_on: []
created: [current date YYYY-MM-DD]
audience_detected: personal
audience_confidence: 0.95
---
```

### EPIC Body Structure

```markdown
# Framework Adoption - [project_name]

## Description

Adopt simon_tools framework in [project_name] project. This EPIC was generated
from framework analysis and contains acceptance criteria derived from the
migration plan phases.

**Source Analysis**: [analysis_file_path]
**Readiness Score**: [score]% - [verdict]

## User Story

As a **developer**, I want **to adopt simon_tools framework** so that **I can use
standardized development workflows with epics, tasks, and TDD-enforced development**.

## Business Value

- **Workflow Standardization**: Epic → Task → Refine → Develop pattern
- **Code Quality**: TDD-enforced development via /develop-task
- **Discovery**: Comprehensive task analysis via /refine agents
- **Maintainability**: Structured backlog management

## Acceptance Criteria

[If verdict == NOT_READY - ONLY include Phase 0, NO other phases]:
### Phase 0: Blocker Resolution (Prerequisites)

- [ ] AC0.1: [blocker_type] resolved - [blocker_message]
- [ ] AC0.2: [blocker_type] resolved - [blocker_message]
- [ ] AC0.N: Re-run `/framework analyze` and verify READY verdict

[STOP HERE for NOT_READY - Phases 1-3 come in NEW EPIC after re-analysis]

[If verdict == READY or READY_WITH_WARNINGS - include Phases 1-3]:
### Phase 1: Backup & Prepare

- [ ] AC1: [derived from phase_1.steps[0]]
- [ ] AC2: [derived from phase_1.steps[1]]
- [ ] AC3: [derived from phase_1.steps[2]]

### Phase 2: Selective Installation

- [ ] AC4: [preservation criteria]
- [ ] AC5: [installation criteria - commands/agents]
- [ ] AC6: [installation criteria - skills/hooks]

### Phase 3: Integration & Testing

- [ ] AC7: [derived from phase_3.steps[0]]
- [ ] AC8: [derived from phase_3.steps[1]]
- [ ] AC9: [derived from phase_3.steps[2]]
- [ ] AC10: [derived from phase_3.steps[3]]
- [ ] AC11: [derived from phase_3.steps[4]]

## Technical Constraints

[List warnings from readiness.warnings]

- [warning 1]
- [warning 2]

## Recommended Components

Based on detected stack, these simon_tools components will be available:

### Skills
| Skill | Reason | Priority |
|-------|--------|----------|
[from recommended_components.skills]

### Agents
| Agent | Reason | Priority |
|-------|--------|----------|
[from recommended_components.agents]

## Task Decomposition

Use `/generate-task -e EPIC-XXX` to create individual tasks.

[If verdict == NOT_READY]:
**Phase 0 only** - create one task per blocker:
```
/generate-task -e EPIC-XXX "Create .mcp.json for Serena MCP"
/generate-task -e EPIC-XXX "Add framework metadata to CLAUDE.md"
/generate-task -e EPIC-XXX "Create backlog directory structure"
```

After completing all blocker tasks, re-run `/framework analyze` to get a
new EPIC with Phases 1-3.

[If verdict == READY or READY_WITH_WARNINGS]:
Suggested decomposition:
- Task 1: Backup & Prepare (AC1-AC3)
- Task 2: Selective Installation (AC4-AC6)
- Task 3: Integration & Testing (AC7-AC11)

Or use more granular decomposition for complex projects.

## Next Steps

[If verdict == NOT_READY - include this section]:
1. Run `/generate-task -e EPIC-XXX` to create tasks for each blocker
2. Use `/refine TASK-XXX` on each task
3. Use `/develop-task TASK-XXX` to implement
4. After all blockers resolved, re-run `/framework analyze [path]`
5. A new **adoption EPIC** (with Phases 1-3) will be created

## Dependencies

### Analysis Artifacts

| Artifact | Location |
|----------|----------|
| Framework Analysis | [analysis_file_path] |
| Migration Plan | Embedded in analysis |

## Notes

- Generated by `adoption-epic-generator` agent
- Readiness: [score]% - [verdict]
- Use `/generate-task -e EPIC-XXX` for Smart Decomposition

---

**Generated**: [timestamp]
```

## File Operations

### Create EPIC File

1. Generate EPIC content from template
2. Interpolate all variables (project name, ACs, constraints, etc.)
3. Write to `backlog/epics/EPIC-XXX.md`
4. Verify file was created successfully

### Update epics.json

Add entry for new epic:

```json
{
  "id": "EPIC-XXX",
  "title": "Framework Adoption - [project_name]",
  "status": "backlog",
  "has_prd": false,
  "depends_on": [],
  "task_ids": [],
  "created": "[date]",
  "complexity": "M",
  "audience_detected": "personal",
  "audience_confidence": 0.95,
  "source_analysis": "[analysis_file_path]"
}
```

## Edge Cases

### Minimal Migration Plan

If migration_plan has fewer phases:
- Generate ACs only for phases present
- Note missing phases in Technical Constraints

### Empty Recommended Components

```markdown
## Recommended Components

No additional components recommended beyond core simon_tools.
```

### High Warning Count

If readiness.warnings.length > 5:
- Show first 5 in Technical Constraints
- Add note: "[N] additional warnings - see analysis file"

### NOT_READY Verdict

When verdict is NOT_READY, generate a **Phase 0-only** preparation EPIC:
- Status: "backlog" (not "blocked")
- Title: "Framework Adoption Preparation - [project_name]"
- **ONLY include Phase 0** (blocker resolution)
- **DO NOT include Phases 1-3** - those come in a NEW EPIC after re-analysis

**Design Philosophy**: A NOT_READY project needs blockers resolved first. After
blockers are fixed, re-running `/framework analyze` will produce a READY verdict,
which then creates a separate adoption EPIC with Phases 1-3. This prevents
creating oversized EPICs with too many ACs.

Frontmatter changes:
```yaml
---
id: EPIC-XXX
type: epic
status: backlog
has_prd: false
complexity: S  # Smaller - Phase 0 only
is_preparation_epic: true
---
```

Phase 0 structure (the ONLY phase in NOT_READY EPICs):
```markdown
## Acceptance Criteria

### Phase 0: Blocker Resolution (Prerequisites)

[For each blocker]:
- [ ] AC0.1: [blocker_type] resolved - [blocker_message]
- [ ] AC0.2: [blocker_type] resolved - [blocker_message]

- [ ] AC0.N: Re-run `/framework analyze` and verify READY verdict
```

**NO Phases 1-3** - add guidance in "Next Steps" section instead:
```markdown
## Next Steps

1. Run `/generate-task -e EPIC-XXX` to create tasks for each blocker
2. Use `/refine TASK-XXX` on each task
3. Use `/develop-task TASK-XXX` to implement
4. After all blockers resolved, re-run `/framework analyze [path]`
5. A new **adoption EPIC** (with Phases 1-3) will be created for the ready project
```

Task decomposition guidance for NOT_READY:
- Use `/generate-task -e EPIC-XXX` to create individual tasks per blocker
- Each blocker becomes its own appropriately-scoped task
- NO combined "preparation task" - that pattern is deprecated

## Constraints

- **Write permissions**: Only write to `backlog/epics/` and `backlog/epics.json`
- **ID uniqueness**: Ensure no ID collision with existing epics
- **Validation**: Verify generated EPIC file has valid frontmatter
- **Idempotency**: Re-running with same analysis should not duplicate

## Cross-References

- Analysis source: `backlog/working/framework-analysis-*.json`
- Epic template patterns: `backlog/epics/EPIC-022.md`
- Task decomposition: `/generate-task` with `-e EPIC-XXX` flag
- Task generator: `onboarding-plan-generator.md`

## Integration

- **Invoked by**: `/framework analyze` (Phase 9.5)
- **Receives from**: Framework analysis JSON
- **Produces for**: `/generate-task -e EPIC-XXX` (Smart Decomposition)
- **Part of**: TASK-210 - Enable EPIC Generation from Framework Analysis
