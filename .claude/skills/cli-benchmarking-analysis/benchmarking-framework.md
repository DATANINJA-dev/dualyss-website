# CLI Benchmarking Framework

## Overview

Systematic methodology for comparing CLI tools to identify patterns, evaluate conventions, and document competitive positioning.

## Phase 1: Define Scope

### 1.1 Select Comparison Targets

Choose tools based on relevance:

| Category | Example Tools | Selection Criteria |
|----------|--------------|-------------------|
| Industry Leaders | git, docker, kubectl | Set conventions, massive adoption |
| Domain Peers | Jira CLI, Linear CLI | Same problem space |
| Modern Exemplars | gh, Vercel CLI | Recent UX innovations |
| Legacy Reference | curl, wget | Established patterns |

**Target count**: 5-7 tools for comprehensive analysis

### 1.2 Define Comparison Dimensions

Standard dimensions to evaluate:

1. **Naming Conventions**
   - Pattern: verb-noun / noun-verb / topic:command
   - Case: lowercase / kebab-case / camelCase
   - Length: abbreviation policy
   - Consistency: exceptions and outliers

2. **Subcommand Structure**
   - Depth: max nesting levels
   - Discoverability: how to find commands
   - Grouping: logical organization
   - Aliases: shortcut support

3. **Flag Handling**
   - Short flags: single-letter availability
   - Long flags: naming conventions
   - Mutual exclusivity: --no-* patterns
   - Defaults: flag day policies

4. **Help System**
   - Entry points: -h, --help, help subcommand
   - Content: examples, descriptions, usage
   - Hierarchy: command-specific vs global
   - Format: colors, sections, truncation

5. **Error Messages**
   - Clarity: human-readable explanations
   - Actionability: suggested fixes
   - Exit codes: standard compliance
   - Verbosity: debug mode support

6. **Output Patterns**
   - Default format: human-first
   - Machine format: --json, --output
   - Streaming: progress indicators
   - Verbosity levels: -v, -vv, -q

## Phase 2: Data Collection

### 2.1 Primary Sources

| Source | Quality | Use For |
|--------|---------|---------|
| Official documentation | 10/10 | Canonical patterns |
| Man pages | 9/10 | Flag standards |
| --help output | 9/10 | Real behavior |
| Source code | 10/10 | Implementation details |

### 2.2 Collection Methods

**Documentation Review**:
```bash
# Capture help output
tool --help > tool-help.txt
tool subcommand --help > tool-subcommand-help.txt
```

**Pattern Extraction**:
```bash
# List all commands
tool help | grep "Available Commands"

# Count subcommand depth
tool help subcommand | wc -l
```

**Behavior Testing**:
```bash
# Test flag order independence
tool --flag1 --flag2 arg
tool arg --flag1 --flag2
tool --flag2 arg --flag1

# Test help accessibility
tool -h
tool --help
tool help
```

### 2.3 Data Recording

Use the pattern matrix template (see pattern-matrices.md) to record:
- One row per tool
- One column per dimension
- Evidence/source for each cell

## Phase 3: Pattern Analysis

### 3.1 Identify Consensus Patterns

For each dimension:
1. Count tools using each pattern
2. Identify majority convention (>50%)
3. Note outliers and their rationale

**Example analysis**:
```
Dimension: Command naming
- verb-noun: 3 tools (git, kubectl, curl) = 50%
- noun-verb: 2 tools (docker, gh) = 33%
- topic:command: 1 tool (heroku) = 17%

Consensus: verb-noun (weak) - no clear winner
```

### 3.2 Weight by Authority

Not all tools are equal:
- **High authority**: git, kubectl (massive adoption)
- **Medium authority**: docker, gh (significant adoption)
- **Domain authority**: Jira CLI (same problem space)

Weighted consensus may differ from raw counts.

### 3.3 Identify Innovations

Look for patterns that:
- Solve known CLI pain points
- Improve discoverability
- Reduce cognitive load
- Enable new workflows

## Phase 4: Gap Analysis

### 4.1 Map Current State

For the target tool (e.g., simon_tools):
1. Document current patterns for each dimension
2. Identify explicit design decisions
3. Note implicit/inherited patterns

### 4.2 Identify Deviations

Compare target to consensus:

| Dimension | Consensus | Target | Deviation |
|-----------|-----------|--------|-----------|
| Naming | verb-noun | mixed | Yes |
| Flags | -h/--help | --help only | Partial |
| Output | JSON support | No JSON | Yes |

### 4.3 Classify Deviations

For each deviation:

**Intentional Deviation**:
- Clear rationale documented
- Trade-off analysis available
- Conscious decision

**Unintentional Deviation**:
- No documented rationale
- Possibly oversight
- Candidate for alignment

**Innovation**:
- Deviation improves UX
- Solves known problem
- Potential best practice

## Phase 5: Recommendations

### 5.1 Prioritization Framework

Score each potential change:

| Factor | Weight | Description |
|--------|--------|-------------|
| User Impact | 40% | Frequency × friction reduction |
| Alignment | 30% | Moves toward consensus |
| Effort | 20% | Implementation complexity |
| Risk | 10% | Breaking change potential |

### 5.2 Recommendation Categories

**P0 - Critical Alignment**:
- Violates strong consensus
- High user friction
- Low effort to fix

**P1 - Recommended Alignment**:
- Moderate deviation
- Measurable improvement
- Medium effort

**P2 - Optional Enhancement**:
- Minor deviation
- Nice-to-have
- Consider for future

**P3 - Maintain Deviation**:
- Intentional innovation
- Justified trade-off
- Document and preserve

### 5.3 Output Format

```markdown
## Recommendation: [Title]

**Priority**: P0/P1/P2/P3
**Dimension**: [naming/flags/help/etc.]
**Current**: [What we do now]
**Target**: [What we should do]
**Rationale**: [Why this change]
**Effort**: Low/Medium/High
**Risk**: [Breaking change assessment]
**Dependencies**: [Other changes required]
```

## Deliverables Checklist

- [ ] Tool selection documented with rationale
- [ ] Pattern matrix completed for all dimensions
- [ ] Consensus patterns identified
- [ ] Gap analysis completed
- [ ] Deviations classified
- [ ] Prioritized recommendations
- [ ] Executive summary for stakeholders
