# Case-by-Case Patterns

Interactive component classification patterns for determining whether existing `.claude/` components should be absorbed into simon_tools or kept as project-specific. This is the core EPIC-022 innovation that replaces automatic merge behavior.

## Overview

When `/framework analyze` detects an existing `.claude/` directory, each component is evaluated individually with a recommendation. The user decides: **Absorb**, **Keep Local**, or **Skip** (defer decision).

```
For each component in existing .claude/:
    │
    ├── Analyze component characteristics
    │
    ├── Score genericity (0-100)
    │
    ├── Generate recommendation
    │   ├── Score >= 70: Recommend ABSORB
    │   ├── Score 30-69: Recommend REVIEW
    │   └── Score < 30: Recommend KEEP
    │
    └── Present to user for decision
```

## Classification Signals

Components are analyzed using these signals to determine genericity:

### Signal Categories

| Signal | Generic (Absorb) | Project-Specific (Keep) | Weight |
|--------|------------------|-------------------------|--------|
| **Content** | Utility helpers, common patterns | AWS refs, local paths, custom APIs | 30 |
| **Naming** | Generic names (commit, review) | Project prefixes (myapp-deploy) | 20 |
| **Dependencies** | Standard tools (Glob, Grep, Read) | Project MCPs, external services | 25 |
| **Scope** | Reusable across projects | Single project context | 15 |
| **Similarity** | Similar to existing simon_tools | No match in framework | 10 |

### Content Analysis

**Generic Indicators** (+points):
- Uses standard Claude Code tools
- References common patterns (TDD, git, testing)
- Contains reusable workflows
- Language-agnostic or multi-language

**Project-Specific Indicators** (-points):
- Contains hardcoded paths (`/home/user/project/`)
- References specific services (AWS, GCP, specific APIs)
- Uses project-specific environment variables
- Contains company/project names

**Example Scoring**:
```
Component: custom-commit.md

Content Analysis:
+ Uses Bash for git operations (+10)
+ Standard commit workflow (+10)
- References 'mycompany-' prefix (-5)
+ No hardcoded paths (+5)

Content Score: 20/30
```

### Naming Analysis

**Generic Naming Patterns** (+points):
- Single descriptive word: `commit`, `review`, `test`
- Action-based: `validate-`, `generate-`, `run-`
- Domain-based: `seo-`, `auth-`, `api-`

**Project-Specific Naming Patterns** (-points):
- Project prefixes: `myapp-`, `acme-`, `internal-`
- Environment hints: `-prod`, `-staging`, `-local`
- Team-specific: `-team-a`, `-johndoe`

**Example Scoring**:
```
Component: acme-deploy.md

Naming Analysis:
- Project prefix 'acme-' (-15)
- Environment hint 'deploy' (neutral)

Naming Score: 5/20
```

### Dependency Analysis

**Generic Dependencies** (+points):
- Built-in tools: Glob, Grep, Read, Write, Edit, Bash
- Standard MCPs: Serena, GitHub
- Common patterns: Task, TodoWrite

**Project-Specific Dependencies** (-points):
- Custom MCPs: `mcp__acme__*`, `mcp__internal__*`
- External APIs: Specific SaaS integrations
- Project databases: Custom data sources

**Example Scoring**:
```
Component: data-sync.md

Dependency Analysis:
+ Uses Bash (+5)
- Uses mcp__acme__database (-15)
- Calls internal API (-5)

Dependency Score: 5/25
```

### Scope Analysis

**Broad Scope** (+points):
- Works on any project type
- No project-specific assumptions
- Configurable inputs

**Narrow Scope** (-points):
- Assumes specific project structure
- Hardcoded to specific stack
- Single-use functionality

### Similarity Analysis

**High Similarity** (+points):
- Similar to existing simon_tools component
- Could replace/enhance existing component
- Follows simon_tools patterns

**Low Similarity** (-points):
- Unique functionality not in framework
- Different approach to existing patterns
- Specialized domain not covered

## Recommendation Engine

### Score Calculation

```
total_score = (
    content_score    +  # 0-30
    naming_score     +  # 0-20
    dependency_score +  # 0-25
    scope_score      +  # 0-15
    similarity_score    # 0-10
)                       # Total: 0-100
```

### Recommendation Thresholds

| Score | Recommendation | Confidence | Action |
|-------|----------------|------------|--------|
| >= 70 | ABSORB | High | Create task to add to simon_tools |
| 50-69 | REVIEW | Medium | Present both options with analysis |
| 30-49 | REVIEW | Low | Present both options with analysis |
| < 30 | KEEP | High | Mark as project-specific |

### Confidence Levels

```
confidence = min(
    (score / 100) if score >= 50 else ((100 - score) / 100),
    1.0
)

# Examples:
# Score 85 → confidence 0.85 (ABSORB)
# Score 15 → confidence 0.85 (KEEP)
# Score 50 → confidence 0.50 (REVIEW)
```

## Interactive Decision Flow

### Presentation Format

```
┌─────────────────────────────────────────────────────────────────┐
│  Component Classification: [filename]                           │
└─────────────────────────────────────────────────────────────────┘

## Analysis Summary

**File**: .claude/commands/custom-helper.md
**Type**: Command
**Lines**: 45

### Signals Detected

| Signal | Finding | Score |
|--------|---------|-------|
| Content | Generic utility patterns | 25/30 |
| Naming | Descriptive, no prefix | 18/20 |
| Dependencies | Standard tools only | 22/25 |
| Scope | Works on any project | 12/15 |
| Similarity | Similar to 'utility.md' | 6/10 |

**Total Score**: 83/100

### Recommendation: ABSORB (Confidence: 83%)

This component appears generic and useful for other projects.
Similar to existing `utility.md` in simon_tools.

────────────────────────────────────────────────────────────────

Options:
[A] Absorb → Creates TASK to add to simon_tools hub
[K] Keep local → Marks as project-specific (won't sync)
[S] Skip → Defer decision for later
[D] Details → Show full component content
```

### User Response Handling

#### [A] Absorb

```
Decision: ABSORB

Creating absorption task...

## TASK-XXX Created: Absorb custom-helper.md

The component will be added to simon_tools hub.

Steps:
1. Review component for framework standards
2. Adjust naming if needed
3. Add to appropriate directory
4. Update documentation
5. Push via /framework push

Continue to next component? [Y/n]
```

#### [K] Keep Local

```
Decision: KEEP LOCAL

Marking as project-specific...

## Component Marked: Project-Specific

File: .claude/commands/custom-helper.md

This component will:
- NOT be synced to simon_tools
- Remain in project's .claude/ directory
- Be preserved during framework updates

Added to customized_files in CLAUDE.md:
<!-- simon_tools_meta
...
customized_files:
  - ".claude/commands/custom-helper.md"
-->

Continue to next component? [Y/n]
```

#### [S] Skip

```
Decision: SKIP

Deferring decision...

## Decision Deferred

File: .claude/commands/custom-helper.md

This component will be:
- Included in analysis output
- Asked about again during /framework absorb
- Excluded from automatic processing

Continue to next component? [Y/n]
```

## Batch Processing

For projects with many components, offer batch mode:

```
## Component Classification

Found 12 components in .claude/:
- 4 commands
- 3 agents
- 5 skills

### Quick Classification Mode

Review each component individually? [Y]
Or use automatic recommendations? [A]
Or skip classification for now? [S]

[A] Automatic mode applies recommendations:
- 3 marked ABSORB (score >= 70)
- 2 marked KEEP (score < 30)
- 7 marked REVIEW (need manual decision)

Proceed with automatic? [Y/n]
```

### Automatic Mode Output

```
## Automatic Classification Results

### Auto-ABSORB (3 components)
| File | Score | Confidence |
|------|-------|------------|
| helper-utility.md | 85 | 85% |
| test-runner.md | 78 | 78% |
| commit-helper.md | 72 | 72% |

### Auto-KEEP (2 components)
| File | Score | Confidence |
|------|-------|------------|
| acme-deploy.md | 15 | 85% |
| local-config.md | 22 | 78% |

### Needs Review (7 components)
| File | Score | Recommendation |
|------|-------|----------------|
| custom-agent.md | 55 | REVIEW |
| data-sync.md | 48 | REVIEW |
...

Review the 7 components now? [Y/n]
```

## Decision Recording

All decisions are stored in the analysis output for the `onboarding-plan-generator` agent:

### Storage Format

```yaml
component_decisions:
  - file: ".claude/commands/helper-utility.md"
    type: "command"
    decision: "absorb"
    score: 85
    confidence: 0.85
    rationale: "Generic utility, standard tools, no project refs"
    signals:
      content: 25
      naming: 18
      dependencies: 22
      scope: 12
      similarity: 8
    timestamp: "2026-01-20T14:30:00Z"

  - file: ".claude/commands/acme-deploy.md"
    type: "command"
    decision: "keep"
    score: 15
    confidence: 0.85
    rationale: "Project prefix, external service refs, narrow scope"
    signals:
      content: 5
      naming: 2
      dependencies: 3
      scope: 3
      similarity: 2
    timestamp: "2026-01-20T14:31:00Z"

  - file: ".claude/agents/custom-agent.md"
    type: "agent"
    decision: "skip"
    score: 55
    confidence: 0.55
    rationale: "User deferred decision"
    timestamp: "2026-01-20T14:32:00Z"
```

### Integration with Task Generation

The `onboarding-plan-generator` agent uses these decisions to:

1. **Create absorption tasks** for ABSORB decisions
2. **Update customized_files** for KEEP decisions
3. **Track deferred components** for SKIP decisions

```yaml
# Generated task includes:
adoption_plan:
  components_to_absorb:
    - file: "helper-utility.md"
      target: ".claude/commands/"
      task_id: "TASK-043"

  components_to_keep:
    - file: "acme-deploy.md"
      reason: "Project-specific deployment"

  components_deferred:
    - file: "custom-agent.md"
      reason: "User skipped"
```

## Edge Cases

### Empty .claude/ Directory

```
No existing components found in .claude/

Proceeding with fresh installation.
No classification needed.
```

### All Components Score Similarly

```
## Classification Challenge

All 5 components scored between 45-55.
Unable to make confident recommendations.

Options:
[I] Individual review (recommended)
[A] Assume all KEEP (conservative)
[B] Assume all ABSORB (aggressive)
```

### Component References Another

```
## Dependency Detected

Component: main-workflow.md
References: helper-utility.md

If helper-utility.md is absorbed, main-workflow.md
may need updates.

Recommendation: Process together with same decision.

[T] Treat as pair (same decision for both)
[S] Separate decisions
```

## Cross-References

- Phase workflow: [adoption-phases.md](adoption-phases.md)
- Post-install validation: [validation-patterns.md](validation-patterns.md)
- Component analysis: [project-analysis](../project-analysis/SKILL.md)
- Absorption workflow: Future `component-absorption-generator` agent (TASK-204)
