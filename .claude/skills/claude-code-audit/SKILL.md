---
name: claude-code-audit
description: |
  Auto-activates when creating or editing Claude Code configuration files in .claude/.
  Provides best practice patterns, scoring rubrics, and component checklists for
  commands, agents, skills, and hooks. Enables self-auditing meta-evaluation.
---

# Claude Code Audit Skill

This skill provides frameworks for evaluating Claude Code configurations against best practices. It activates automatically when working on .claude/ files and supports the `/audit` command.

## When This Skill Activates

- Creating new commands (`.claude/commands/*.md`)
- Editing agents (`.claude/agents/*.md`)
- Modifying skills (`.claude/skills/**/*`)
- Writing hooks (`.claude/hooks/*.md`)
- Running `/audit` command
- Discussing configuration quality or patterns

## Core Audit Principles

1. **Structure first** - Valid frontmatter, clear organization
2. **Best practices** - QA patterns, reflection, parallelization
3. **Minimal permissions** - Only tools actually needed
4. **Completeness** - All sections filled, no placeholders
5. **Integration** - Fits the ecosystem, references work together
6. **Domain depth** - Domain-focused agents should comprehensively cover their domain
7. **Dependency health** - Vertical chains are complete, no broken links, no orphans

## Scoring Dimensions (v0.15.0)

| Dimension | Weight | Focus |
|-----------|--------|-------|
| Structure | 15% | Frontmatter, phases, organization |
| Best Practices | 20% | QA, reflection loops, parallelization |
| Tool Security | 15% | Minimal permissions, restrictions |
| Completeness | 15% | All sections filled |
| Integration | 10% | Ecosystem fit |
| Domain Depth | 10% | Research-based domain coverage (domain-focused agents only) |
| Dependency Health | 15% | Vertical chains, broken links, orphans, circular deps |

## Verdicts

| Score | Verdict | Action |
|-------|---------|--------|
| >= 8.0 | EXCELLENT | No changes needed |
| 7.0-7.9 | GOOD | Minor improvements |
| 5.0-6.9 | NEEDS_IMPROVEMENT | Specific fixes required |
| 3.0-4.9 | POOR | Significant refactoring |
| < 3.0 | CRITICAL | Should not be used |

## Supporting Files

- `best-practices.md` - Pattern catalog for all component types
- `scoring-rubric.md` - Detailed 1-10 scoring criteria (7 dimensions including DependencyHealth)
- `component-checklists.md` - Per-type validation checklists
- `domain-depth-methodology.md` - Dynamic research-based domain evaluation
- `enhancement-patterns.md` - Converting passive to active skills
- `gap-patterns.md` - Gap analysis patterns (including dependency chain patterns)
- `mcp-patterns.md` - MCP recommendations
- `solution-patterns.md` - Gap-to-solution mapping for system-level proposals
- `dependency-patterns.md` - Vertical chain patterns, health metrics, detection algorithms

## Usage with /audit

```bash
/audit              # Audit all .claude/ components
/audit commands     # Audit commands only
/audit agents       # Audit agents only
/audit <file>       # Audit specific file
/audit --diff       # Compare to previous audit
```

## Self-Auditing

This audit system can audit itself. The audit-* components follow the same best practices they check for, enabling meta-meta evaluation.

## Constraints

- Don't over-engineer simple components
- Focus on actionable recommendations
- Respect component purpose when scoring
- Track improvements, not just issues
