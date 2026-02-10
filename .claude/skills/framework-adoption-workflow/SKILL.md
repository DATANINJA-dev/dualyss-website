# framework-adoption-workflow

<!--
name: framework-adoption-workflow
description: Task-based adoption workflow patterns for installing and configuring simon_tools framework in target projects
type: active
-->

Provides patterns for adopting simon_tools framework through reviewable tasks instead of direct execution. Covers the complete adoption lifecycle: analysis, task generation, implementation planning, and execution with DIFF previews.

## When This Skill Activates

This skill auto-activates when:
- User mentions "adoption", "framework install", or "task-based"
- Working on `/framework analyze`, `/framework absorb` commands
- Planning framework installation in a new or existing project
- Classifying existing components for absorption vs local retention

## Core Principles

The task-based adoption workflow follows these design decisions from EPIC-022:

| # | Principle | Rationale |
|---|-----------|-----------|
| 1 | **Tasks over direct execution** | All framework changes create reviewable TASKs first |
| 2 | **Case-by-case classification** | Existing components evaluated individually with recommendations |
| 3 | **DIFF previews before changes** | User sees exact changes before they happen |
| 4 | **Conditional automation** | Clean states auto-proceed; conflicts create tasks |
| 5 | **Install deprecated** | `/framework install` replaced by `/framework analyze` → TASK workflow |

## Quick Reference

| Phase | Command | Output |
|-------|---------|--------|
| Analyze | `/framework analyze <path>` | Readiness score, component classification |
| Task | (auto-generated) | TASK-XXX with adoption plan |
| Refine | `/refine TASK-XXX` | Implementation plan with DIFF previews |
| Develop | `/develop-task TASK-XXX` | Step-by-step execution with approvals |

## Supporting Files

| File | Purpose |
|------|---------|
| [adoption-phases.md](adoption-phases.md) | 4-phase workflow state machine |
| [prerequisite-checklist.md](prerequisite-checklist.md) | Pre-adoption validation checks |
| [validation-patterns.md](validation-patterns.md) | Post-installation verification |
| [case-by-case-patterns.md](case-by-case-patterns.md) | Component classification logic |

## Cross-References (No Duplication)

This skill references existing patterns instead of duplicating:

| Pattern | Source Skill | Use For |
|---------|--------------|---------|
| Context detection | [framework-scaffolding-patterns](../framework-scaffolding-patterns/SKILL.md) | Project type, stack detection |
| CLAUDE.md merge | [config-merging-patterns](../config-merging-patterns/SKILL.md) | Section-based merge strategy |
| Watermark tracking | [git-sync-patterns](../git-sync-patterns/SKILL.md) | Version sync state |
| Pre-migration checks | [framework-migration-planning](../framework-migration-planning/SKILL.md) | Risk assessment patterns |
| Component analysis | [project-analysis](../project-analysis/SKILL.md) | File classification heuristics |

## Integration Points

### Future Commands (EPIC-022)
- `/framework analyze` → Uses `prerequisite-checklist.md`, `case-by-case-patterns.md`
- `/framework absorb` → Uses `case-by-case-patterns.md`, `adoption-phases.md`

### Future Agents (EPIC-022)
- `framework-adoption-readiness` → Reads `prerequisite-checklist.md`
- `onboarding-plan-generator` → Reads `adoption-phases.md`, `case-by-case-patterns.md`
- `adoption-integration-validator` → Reads `validation-patterns.md`

## Constraints

- **No direct execution**: Patterns describe TASK creation, not direct file manipulation
- **Cross-reference only**: Use existing skill patterns via references, no duplication
- **Platform agnostic**: Patterns work on Windows, macOS, and Linux
- **Serena required**: Semantic code understanding via MCP

## Sources

- EPIC-022: Rediseño del Flujo de Adopción del Framework
- Design decisions confirmed 2026-01-20
- Related tasks: TASK-178, TASK-179, TASK-180, TASK-181
