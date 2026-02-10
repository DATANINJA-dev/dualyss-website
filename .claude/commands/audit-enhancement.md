---
description: Enhancement opportunities analysis with implementation roadmap. Focuses on improving existing components.
allowed-tools: Read, Glob, Grep, Task, WebSearch, WebFetch
argument-hint: "[target: all|commands|agents|skills|hooks|filename]"
---

# /audit:enhancement

Analyzes enhancement opportunities for existing Claude Code components with implementation roadmap.

## Parameters

- `$ARGUMENTS` - Target scope (same as /audit):
  - Empty or `all` - Analyze all components
  - `commands` - Only commands
  - `agents` - Only agents
  - `skills` - Only skills
  - `hooks` - Only hooks
  - `[filename]` - Specific file

## Instructions

### Phase 0: Input Validation

[Extended thinking: Analyze $ARGUMENTS to determine intent.
If filename without extension, user likely means .md file.
If empty, default to analyzing all components.
Consider what enhancements would be most valuable for the target scope.]

1. Parse `$ARGUMENTS` to determine target scope

2. **Categorize input**:
   - If empty → target = `all`
   - If known keyword (`all`, `commands`, `agents`, `skills`, `hooks`) → target = keyword
   - Otherwise → treat as filename

3. **If filename target**:
   - Search for file in order:
     1. Exact path if absolute/relative path provided
     2. `.claude/commands/[filename]`
     3. `.claude/agents/[filename]`
     4. `.claude/skills/[filename]/SKILL.md`
     5. `.claude/hooks/[filename]`
   - **If found**: Set target to resolved path, determine component type
   - **If NOT found**: ERROR - "File '[filename]' not found in .claude/. Searched: commands/, agents/, skills/, hooks/"

**Phase 0 Complete** - Target: [scope] | Components in scope: [N]

### Phase 1: Discovery & Baseline

1. **Scan .claude/ directory** for components
2. **Run quick analysis** to establish baseline scores:
   - Launch analyzers for target components
   - Collect dimension scores

3. **Present baseline summary**:
   ```
   ## Baseline Analysis
   | Component | Current Score | Category |
   |-----------|---------------|----------|
   | [name] | X.X | [command/agent/skill/hook] |

   Components below 8.0: [N]
   Potential enhancement areas: [summary]
   ```

### Phase 1.5: Human Checkpoint

Before expensive web research, present options:

```
Baseline analysis complete. [N] components scored.

Options:
[P]roceed - Run web research for best practices (recommended)
[S]kip research - Use baseline only (faster, less comprehensive)
[C]ancel - Exit enhancement analysis
```

- If **Proceed**: Continue to Phase 2
- If **Skip research**: Jump to Phase 3 with baseline only
- If **Cancel**: Exit with "Enhancement analysis cancelled"

### Phase 2: Web Research

Run research **IN PARALLEL**:

1. **Best practices**:
   - WebSearch: "Claude Code best practices [current year]"
   - WebSearch: "Claude Code [component type] patterns"

2. **Community patterns**:
   - Look for innovative approaches
   - Novel tool combinations

**Phase 2 Complete** - Sources consulted: [N] | Patterns found: [N]

### Phase 3: Enhancement Analysis

Run **audit-enhancement-analyzer.md** (sonnet) with:
- Component inventory from Phase 1
- Baseline scores
- Reference to `enhancement-patterns.md`
- Research findings from Phase 2

Analyze for each component:
- Pattern adoption gaps
- Best practice violations
- Optimization opportunities
- Tool permission improvements
- Integration enhancements

**Phase 3 Complete** - Opportunities found: [N] | Categories: [list]

### Phase 3.5: QA Verification

Run **audit-qa.md** (sonnet) to score enhancement recommendations:

**Input**:
- Enhancement opportunities from Phase 3
- Baseline scores from Phase 1
- Research findings from Phase 2

**QA Scoring Dimensions**:
| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Relevance | 30% | Do enhancements address real gaps? |
| Feasibility | 25% | Are implementation hints actionable? |
| Impact Accuracy | 20% | Are impact scores realistic? |
| Completeness | 15% | All enhancement categories covered? |
| Alignment | 10% | Fit with enhancement-patterns.md? |

**QA Threshold**: >= 8.0 overall score

If score >= 8.0 → Proceed to Phase 4
If score < 8.0 → Trigger Phase 3.6 (Reflection)

### Phase 3.6: Reflection Loop (if QA score < 8.0)

**Max 2 iterations**

Present options:
```
Enhancement recommendations need refinement (score: [X.X]/10)

Options:
[R]efine - Re-run analyzer with QA feedback
[P]roceed - Continue with current recommendations
[C]ancel - Exit without generating report
```

**If Refine** (and iterations < 2):
1. Pass QA feedback to audit-enhancement-analyzer
2. Re-run analysis for weak dimensions
3. Merge with existing recommendations
4. Re-run QA (Phase 3.5)
5. If still < 8.0 and iterations = 2: Force proceed with warning

**If Proceed**: Continue to Phase 4 with quality note in report

### Phase 4: Prioritization

[Extended thinking: Consider these trade-offs before scoring:
1. Quick wins vs foundational improvements - Balance immediate gains with long-term health
2. Technical debt risk - Some "simple" enhancements may increase maintenance burden
3. Enhancement dependencies - Which improvements must come first?
4. Cascading impact - Some enhancements improve multiple components
5. Research quality - If web research was limited, increase risk scores for cutting-edge patterns]

Score each enhancement opportunity:
- **Impact** (1-10): How much will this improve quality?
  - 9-10: Addresses critical gap, significant quality jump
  - 7-8: Notable improvement, closes important gap
  - 5-6: Moderate benefit, nice-to-have
  - 1-4: Minor polish, marginal gain
- **Effort** (1-10): How hard to implement?
  - 9-10: Major refactoring, multi-component changes
  - 7-8: Significant work, new agents/workflows
  - 5-6: Moderate additions, pattern adoption
  - 1-4: Small changes, section additions
- **Risk** (1-10): What could go wrong?
  - 9-10: Breaking changes, complex integration
  - 7-8: Significant testing needed
  - 5-6: Moderate risk, isolated impact
  - 1-4: Low risk, additive changes

Calculate priority score: `Impact / (Effort + Risk)`

Higher score = higher priority. Group into:
- **P0 Quick Wins**: Priority >= 1.0 AND Effort <= 4
- **P1 Strategic**: Priority >= 0.5 AND Impact >= 7
- **P2 Nice-to-have**: All others

**Phase 4 Complete** - P0: [N] | P1: [N] | P2: [N] | Avg priority: [X.X]

### Phase 5: Report Generation

Generate report using this template:

```markdown
# Enhancement Analysis Report

**Generated**: [timestamp]
**Target**: [target scope]
**QA Score**: [X.X]/10
**Reflection Iterations**: [N]

## Executive Summary
| Metric | Value |
|--------|-------|
| Components Analyzed | X |
| Enhancement Opportunities | X |
| P0 Quick Wins | X |
| P1 Strategic | X |
| P2 Nice-to-have | X |

## Component Scores
| Component | Current | Potential | Gap | Priority Enhancements |
|-----------|---------|-----------|-----|----------------------|
| [name] | X.X | Y.Y | +Z.Z | [count] |

## P0: Quick Wins (Priority >= 1.0, Effort <= 4)

### [Enhancement Title]
- **Component**: [filename]
- **Category**: Pattern adoption / Tool optimization / Integration
- **Impact**: [X]/10 - [why]
- **Effort**: [X]/10 - [estimate]
- **Risk**: [X]/10 - [concerns]
- **Priority Score**: [calculated]

**Implementation**:
```yaml
# What to add/change
[code snippet or structure]
```

**References**: [enhancement-patterns.md section, web source]

## P1: Strategic Improvements (Priority >= 0.5, Impact >= 7)
[Same format as P0]

## P2: Nice-to-have
[Same format as P0]

## Pattern Adoption
| Pattern | Current | Recommended | Components Missing |
|---------|---------|-------------|-------------------|
| [pattern] | X% | Y% | [list] |

## Implementation Roadmap

### Week 1: Quick Wins
1. [P0 enhancement 1] - [component] - [effort]
2. [P0 enhancement 2] - [component] - [effort]

### Weeks 2-4: Strategic
1. [P1 enhancement 1] - [component] - [effort]

### Month 2+: Long Term
1. [P2 enhancements]

## Generation Metadata
- Analysis duration: [time]
- Web sources consulted: [N]
- Agents run: [list]
- Baseline components: [N]

---
_Run `/audit` for full configuration analysis including gaps_
```

## Error Handling

| Situation | Action |
|-----------|--------|
| No components found in target | Report "No [type] components found in .claude/" and exit |
| Target file not found | List available components, suggest corrections, exit |
| Invalid target type | Show: "Valid targets: all, commands, agents, skills, hooks, or filename" |
| WebSearch/WebFetch fails | Continue with baseline only, flag "Limited research - offline mode" |
| audit-enhancement-analyzer fails | Retry once, if fails report partial results with warning |
| Enhancement opportunities = 0 | Report "No enhancement opportunities - all components score >= 8.0" |
| QA agent fails | Proceed without QA scores, flag in report |
| User cancels at checkpoint | Exit with "Enhancement analysis cancelled" |

## CRITICAL RULES

- **ALWAYS** prioritize by impact/effort ratio
- **ALWAYS** provide implementation hints
- **NEVER** recommend changes that break existing functionality
- Focus on actionable improvements

## Example Usage

```bash
/audit:enhancement              # Analyze all components
/audit:enhancement agents       # Focus on agents only
/audit:enhancement audit.md     # Analyze specific file
```
