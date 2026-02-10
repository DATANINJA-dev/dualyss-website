# application-migration-patterns

Provides application migration patterns for tech stack transformations.
Auto-activates when tasks involve migration planning, tech stack changes,
modernization efforts, or rewrite projects.

## Activation Triggers

Keywords: migrate, migration, rewrite, modernize, transform, tech stack,
strangler fig, big bang, parallel run, legacy, refactor (with tech context)

## Key Patterns

### Migration Strategies
- **Strangler Fig** (incremental, low risk, 6-12 months)
- **Big Bang** (full rewrite, high risk, small codebases only)
- **Parallel Run** (dual system, enterprise, 12-24 months)

See: `migration-strategies.md`

### Risk Assessment Framework
Quantitative risk scoring (1-10) across 5 weighted categories:
- **Data Loss** (30%): Schema changes, rollback capability
- **Auth Complexity** (25%): OAuth, session, MFA migration
- **Integration Breakage** (20%): API consumers, webhooks
- **Business Logic** (15%): Financial, compliance code
- **Performance** (10%): Latency SLOs, throughput

See: `risk-assessment-framework.md`

### Decision Factors
- Codebase size (LOC)
- Team size and expertise
- Risk tolerance (use risk-assessment-framework.md to score)
- Timeline constraints
- Budget availability

### Rollback Considerations
- Per-strategy rollback procedures
- Per-phase rollback (not project-wide)
- Recovery time estimates
- Pre-cutover validation checklists

## Scope Boundary

This skill covers **planning and strategy selection** for migrations.
It does NOT:
- Perform automated code transformation
- Generate migration scripts
- Execute database migrations

## Related Skills
- `tdd-workflow` - TDD enforcement for functional parity
- `research-methodology` - Migration research patterns
- `framework-migration-planning` - Framework deprecation (different scope)

## Supporting Files
- `migration-strategies.md` - Strategy patterns with pros/cons/use cases
- `risk-assessment-framework.md` - Quantitative risk scoring (1-10) with mitigations
- `INDEX.md` - File overview and quick reference
