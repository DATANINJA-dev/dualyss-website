# Application Migration Patterns - Index

Pattern files for application migration strategy selection and execution planning.

## Pattern Files

| File | Status | Description |
|------|--------|-------------|
| `migration-strategies.md` | Complete | Strangler Fig, Big Bang, Parallel Run patterns with decision matrix |
| `tech-stack-mappings.md` | Complete | Common tech stack migration paths (TASK-159) |
| `risk-assessment-framework.md` | Complete | Risk scoring (1-10) across 5 categories with mitigations (TASK-160) |
| `task-decomposition.md` | Complete | Migration task templates and epic structures (TASK-161) |
| `tdd-functional-parity.md` | Complete | TDD patterns for migration validation (TASK-162) |
| `complexity-scoring.md` | Complete | Codebase complexity scoring (1-10) for timeline estimation (TASK-166) |
| `strategy-recommendation-engine.md` | Complete | Rule-based strategy recommendation with confidence scoring (TASK-167) |

## Quick Reference

### Risk Assessment

Use `risk-assessment-framework.md` to score migration risk:
- **Data Loss** (30%): Schema changes, rollback capability
- **Auth Complexity** (25%): OAuth, session, MFA changes
- **Integration Breakage** (20%): API consumers, webhooks
- **Business Logic** (15%): Financial, compliance code
- **Performance** (10%): Latency SLOs, throughput

Score interpretation: 1-3 Low (Big Bang OK), 4-6 Medium (Strangler), 7-8 High (Parallel Run), 9-10 Critical (Decompose).

### Complexity Scoring

Use `complexity-scoring.md` to measure codebase complexity (1-10):
- **Codebase Size** (25%): LOC thresholds (<1K=1, <5K=3, <20K=5, <50K=7, <100K=9, >100K=10)
- **Dependencies** (20%): Package count (<10=2, <30=4, <50=6, <100=8, >100=10)
- **Risk Score** (30%): From risk-assessment-framework.md (direct 1-10)
- **Coupling** (15%): Import graph density + circular dependencies
- **Test Coverage** (10%): Inverse - low coverage = high complexity

Score interpretation: 1-3 Simple (Big Bang, 1-4 weeks), 4-6 Moderate (Strangler, 1-3 months), 7-8 Complex (Phased Strangler, 3-6 months), 9-10 Critical (Parallel Run, 6-12 months).

### Strategy Recommendation

Use `strategy-recommendation-engine.md` to get automated strategy selection:
- **Input**: complexity (1-10) + riskScore (1-10) + optional context
- **Output**: Strategy, confidence (50-98%), rationale, fallback, variant (for Strangler Fig)

Decision thresholds:
- **Big Bang**: complexity <= 3 AND risk <= 4
- **Parallel Run**: complexity >= 8 OR risk >= 8
- **Strangler Fig**: All other cases (default)

Strangler Fig variants: Component-First, Layer-First, Feature-First

### Strategy Selection (Manual)

Use the decision matrix in `migration-strategies.md` to select manually:
- **Strangler Fig**: Large codebases (>100K LOC), low risk tolerance, 6-12 months
- **Big Bang**: Small codebases (<10K LOC), high risk tolerance, 1-3 months
- **Parallel Run**: Mission-critical systems, very low risk, 12-24 months

### Related Skills

- `tdd-workflow` - TDD enforcement during migration
- `research-methodology` - Migration research patterns
- `framework-migration-planning` - Framework deprecation (different scope)

## Activation

This skill auto-activates on keywords: migrate, migration, rewrite, modernize, transform, tech stack, strangler fig, big bang, parallel run, legacy
