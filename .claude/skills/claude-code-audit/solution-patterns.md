# Solution Patterns for Domain Gaps

How to map domain depth gaps to system-level component proposals.

## Gap-to-Solution Mapping

### Solution Decision Tree

```
Domain Coverage < 40% (SUPERFICIAL)
    → Propose NEW dedicated skill with parallel analyzer agents
    → Rationale: Domain needs comprehensive multi-agent treatment

Domain Coverage 40-60% (PARTIAL)
    → Propose NEW agents to fill major category gaps
    → Rationale: Targeted agents for uncovered categories

Domain Coverage 60-80% (GOOD)
    → Propose enhancements to existing agents
    → Rationale: Expand existing coverage, not new components

Domain Coverage > 80% (COMPREHENSIVE)
    → Minor refinements only
    → Rationale: Existing components adequate
```

---

## Pattern 1: Parallel Analyzer Skill

**When to Use**:
- Domain coverage < 40%
- Domain has 3+ independent analysis dimensions
- Categories require different expertise/tools
- Parallel execution would improve performance

**Solution Structure**:
```
.claude/skills/[domain]/
├── SKILL.md              # Knowledge + activation triggers
├── workflows/
│   ├── full-analysis.md  # Orchestrates all agents
│   └── quick-check.md    # Runs critical agents only
└── agents/
    ├── [cat-1]-analyzer.md   # haiku - fast analysis
    ├── [cat-2]-analyzer.md   # haiku - fast analysis
    ├── [cat-3]-analyzer.md   # sonnet if complex
    └── [domain]-qa.md        # sonnet - synthesis/scoring
```

**Example**: Security domain with < 40% coverage
```
.claude/skills/security-auditing/
├── SKILL.md
├── workflows/
│   └── full-audit.md
└── agents/
    ├── auth-analyzer.md      # haiku - authentication checks
    ├── injection-analyzer.md # sonnet - SQL/XSS patterns
    ├── secrets-analyzer.md   # haiku - credential scanning
    └── security-qa.md        # sonnet - synthesis
```

**Effort**: High (300-500 lines total)
**Impact**: +3.0 to +5.0 on domain depth score

---

## Pattern 2: Specialist Agent

**When to Use**:
- Single category has < 20% coverage
- Overall domain coverage 40-80%
- Category has 5+ missing items
- Category is independent from existing agents

**Solution Structure**:
- Single agent file in `.claude/agents/`
- Named: `[context]-[category].md` (e.g., `set-up-keyword-analyzer.md`)

**Template**:
```markdown
---
name: [Context] [Category] Analyzer
description: |
  Analyzes [category] aspects of [domain]. Complements existing
  [related-agent] by covering [specific gaps]. Part of [command/workflow].
model: haiku  # or sonnet if complex judgment needed
tools: [minimal required]
---

# [Name]

## Purpose
[What this agent analyzes and why it's needed]

## Inputs Required
- [What it receives from parent]

## Analysis Steps
1. [Category-specific analysis]
2. [Evaluation criteria]
3. [Scoring/assessment]

## Output Format
[Structured output that integrates with parent]

## Constraints
- [Scope limitations]
- [Integration requirements]
```

**Effort**: Low-Medium (50-150 lines)
**Impact**: +0.5 to +1.5 on domain depth score per agent

---

## Pattern 3: QA Gate Agent

**When to Use**:
- Domain has analyzer agents but no verification
- Outputs need quality scoring before use
- Multiple analyzers need synthesis
- Reflection loop would improve quality

**Solution Structure**:
- QA agent in `.claude/agents/`
- Named: `[domain]-qa.md` or `[context]-qa.md`

**Template**:
```markdown
---
name: [Domain] QA
description: |
  Quality synthesis for [domain] analysis outputs. Scores quality,
  identifies gaps, and triggers reflection loop if score < threshold.
model: sonnet  # Always sonnet - judgment required
tools: Read, Task  # Task for reflection delegation
---

# [Name]

## Purpose
Synthesize outputs from [domain] analyzers into quality-scored report.

## Inputs Required
- Outputs from: [list of analyzer agents]
- Scoring rubric reference

## Analysis Steps
1. **Collect outputs** from all analyzers
2. **Score dimensions**:
   - Completeness: X/10
   - Consistency: X/10
   - Actionability: X/10
3. **Identify gaps** across analyzer outputs
4. **Calculate composite score**
5. **Trigger reflection** if score < 7.0

## Output Format
[QA report with scores and recommendations]

## Constraints
- Threshold for pass: 7.0
- Max reflection iterations: 2
- Must provide actionable improvements
```

**Effort**: Medium (100-150 lines)
**Impact**: +0.3 to +0.8 on overall quality

---

## Pattern 4: Validation Hook

**When to Use**:
- Domain outputs need pre-publish validation
- Consistent validation across multiple commands
- Block-at-submit pattern needed
- Lifecycle event validation required

**Solution Structure**:
- Hook file in `.claude/hooks/`
- Named: `[domain]-[event].md` (e.g., `security-pre-write.md`)

**Template**:
```markdown
---
event: PreToolUse  # or PostToolUse, Stop, etc.
matcher: [tool/pattern to match]
---

# [Domain] [Event] Validation

## Trigger Conditions
- Event: [when this fires]
- Matcher: [what it matches]

## Validation Checks
1. [Check 1]
2. [Check 2]

## Actions
- **Pass**: Allow operation to proceed
- **Block**: Return error with reason
- **Warn**: Log warning but allow

## Output Format
[What to return/log]
```

**Effort**: Low (30-60 lines)
**Impact**: Preventive quality gate

---

## Pattern 5: Entry Point Command

**When to Use**:
- Workflow needs dedicated invocation
- Multiple agents require orchestration
- User-facing operation (not internal delegation)
- Sub-domain warrants focused interface

**Solution Structure**:
- Command file in `.claude/commands/`
- Named descriptively: `[action]-[domain].md`

**Template**:
```markdown
---
description: [What command does]
allowed-tools: [required tools]
argument-hint: "[expected arguments]"
---

# /[command-name]

[Brief description]

## Parameters
- `$ARGUMENTS` - [what user provides]

## Instructions

### Phase 1: [Setup/Discovery]
[Initial steps]

### Phase 2: [Analysis]
Run agents in parallel:
- **[agent-1].md** (model) - [purpose]
- **[agent-2].md** (model) - [purpose]

### Phase 3: [Synthesis]
[Combine results]

### Phase 4: [Output]
[Generate report]

## Error Handling
[How to handle failures]

## CRITICAL RULES
- [Must-follow rules]
```

**Effort**: Medium (100-200 lines)
**Impact**: User-facing workflow improvement

---

## Model Selection for Proposals

| Agent Purpose | Model | Rationale |
|---------------|-------|-----------|
| Data gathering | haiku | Fast, cost-effective |
| Pattern matching | haiku | Sufficient for regex/parsing |
| Simple analysis | haiku | 90% capability, 3x savings |
| Complex analysis | sonnet | Nuanced judgment |
| Security review | sonnet | Risk assessment critical |
| QA/scoring | sonnet | Judgment always required |
| Architecture design | sonnet | Complex reasoning |
| Deep reasoning | opus | Only when explicitly needed |

---

## Effort Estimation Guide

| Component Type | Lines | Effort | Time |
|----------------|-------|--------|------|
| Simple agent (haiku) | 50-80 | Low | <1hr |
| Complex agent (sonnet) | 100-150 | Medium | 1-2hr |
| QA agent | 100-150 | Medium | 1-2hr |
| Hook | 30-60 | Low | <30min |
| Command | 100-200 | Medium | 1-3hr |
| Active skill (full) | 300-500 | High | 4-8hr |

---

## Impact Estimation Guide

| Change Type | Impact Range | When |
|-------------|--------------|------|
| New active skill | +3.0 to +5.0 | Coverage < 40% |
| New specialist agent | +0.5 to +1.5 | Category < 20% |
| QA gate addition | +0.3 to +0.8 | No verification exists |
| Validation hook | Preventive | No pre-publish check |
| Entry point command | UX improvement | Complex workflow |

---

## Priority Calculation

```
Priority Score = (Impact × Urgency) / Effort

Where:
- Impact: Estimated domain depth improvement
- Urgency: 3 (critical), 2 (important), 1 (nice-to-have)
- Effort: 1 (low), 2 (medium), 3 (high)

Priority Tiers:
- P0: Score >= 3.0 (Critical, do first)
- P1: Score >= 1.5 (Important, schedule soon)
- P2: Score < 1.5 (Nice-to-have, as time permits)
```

---

## Integration Checklist

Before proposing a new component, verify:

- [ ] No existing component covers this gap
- [ ] Component follows naming conventions
- [ ] Model selection is justified
- [ ] Tools list is minimal
- [ ] Integration points documented
- [ ] Would improve domain depth score
- [ ] Effort is proportional to impact
