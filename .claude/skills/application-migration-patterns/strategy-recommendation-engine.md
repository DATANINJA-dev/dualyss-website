# Strategy Recommendation Engine

Rule-based engine that recommends the optimal migration strategy (Big Bang, Strangler Fig, Parallel Run) based on complexity score, risk factors, and codebase characteristics.

## Overview

**Purpose**: Provide automated strategy selection with:
- Data-driven recommendations based on quantitative scores
- Confidence levels to indicate recommendation strength
- Clear rationale explaining the selection logic
- Fallback strategies when primary choice is risky
- Strangler Fig variant selection for moderate migrations

**Inputs Required**:
- `complexity` (1-10): From `complexity-scoring.md`
- `riskScore` (1-10): From `risk-assessment-framework.md`
- `context` (optional): Team size, timeline, budget, codebase characteristics

**Output**: Strategy recommendation with confidence, rationale, prerequisites, and fallback

**Relationship to Other Skills**:
- `complexity-scoring.md` - Provides complexity score input
- `risk-assessment-framework.md` - Provides risk score input
- `migration-strategies.md` - Strategy definitions reference
- `migration-impact-analyzer.md` - Consumer that invokes this engine

---

## Core Decision Matrix

### Strategy Selection Logic

The engine uses a threshold-based decision matrix to select the primary strategy:

```javascript
/**
 * Select migration strategy based on complexity and risk scores
 * @param {number} complexity - Complexity score (1-10) from complexity-scoring.md
 * @param {number} riskScore - Risk score (1-10) from risk-assessment-framework.md
 * @returns {string} Strategy name: 'Big Bang' | 'Strangler Fig' | 'Parallel Run'
 */
function selectStrategy(complexity, riskScore) {
  // Big Bang: Small, low-risk codebases
  // Threshold: complexity <= 3 AND risk <= 4
  if (complexity <= 3 && riskScore <= 4) {
    return 'Big Bang';
  }

  // Parallel Run: High complexity OR high risk
  // Threshold: complexity >= 8 OR risk >= 8
  if (complexity >= 8 || riskScore >= 8) {
    return 'Parallel Run';
  }

  // Strangler Fig: Default for moderate cases
  // Covers: complexity 4-7 AND risk 1-7 (when not Big Bang eligible)
  return 'Strangler Fig';
}
```

### Decision Matrix Table

| Complexity | Risk | Strategy | Rationale |
|------------|------|----------|-----------|
| 1-3 | 1-4 | Big Bang | Small codebase with low risk allows full rewrite |
| 1-3 | 5-7 | Strangler Fig | Low complexity but elevated risk needs incremental approach |
| 1-3 | 8-10 | Parallel Run | Risk too high even for small codebase |
| 4-7 | 1-7 | Strangler Fig | Moderate complexity benefits from incremental migration |
| 4-7 | 8-10 | Parallel Run | High risk requires dual system validation |
| 8-10 | any | Parallel Run | High complexity mandates extended validation |

### Threshold Rationale

**Big Bang (complexity <= 3 AND risk <= 4)**:
- Small codebases (< 5K LOC typically) can be fully rewritten
- Low risk means business impact is manageable during cutover
- Single deployment window is realistic (days to weeks)

**Parallel Run (complexity >= 8 OR risk >= 8)**:
- Either factor being extreme requires maximum safety
- Dual systems allow real-world validation before cutover
- Extended timeline (6-12 months) accommodates complexity
- Higher infrastructure cost justified by risk mitigation

**Strangler Fig (default)**:
- Balanced approach for moderate scenarios
- Incremental progress reduces both complexity and risk
- Maintains production stability while migrating
- Flexible timeline (1-6 months typically)

---

## Strangler Fig Variant Selection

When Strangler Fig is selected, the engine determines the optimal variant based on codebase characteristics.

### Variant Selection Logic

```javascript
/**
 * Select Strangler Fig variant based on codebase characteristics
 * @param {Object} characteristics - Codebase analysis results
 * @returns {Object} Variant recommendation with rationale
 */
function selectVariant(characteristics) {
  const {
    moduleBoundaries = 0.5,    // 0-1: clarity of module boundaries
    couplingDensity = 0.5,     // 0-1: how interconnected the codebase is
    userFacingPriority = false // boolean: is user experience the priority
  } = characteristics;

  // Component-First: Clear boundaries, low coupling
  if (moduleBoundaries > 0.7 && couplingDensity < 0.4) {
    return {
      variant: 'Component-First',
      rationale: 'Clear module boundaries enable independent component migration',
      indicators: [
        'Distinct services or modules identified',
        'Low coupling between components',
        'Independent deployability possible'
      ]
    };
  }

  // Layer-First: High coupling suggests horizontal slices
  if (couplingDensity > 0.6) {
    return {
      variant: 'Layer-First',
      rationale: 'High coupling makes vertical slices risky; migrate by layer',
      indicators: [
        'Tightly coupled architecture detected',
        'Shared data access patterns',
        'Cross-cutting concerns dominate'
      ]
    };
  }

  // Feature-First: User experience priority
  if (userFacingPriority) {
    return {
      variant: 'Feature-First',
      rationale: 'User-facing priority guides migration by user journey',
      indicators: [
        'Customer experience is primary driver',
        'Feature-level A/B testing needed',
        'Gradual user rollout preferred'
      ]
    };
  }

  // Default to Component-First
  return {
    variant: 'Component-First',
    rationale: 'Default approach when characteristics are balanced',
    indicators: [
      'No strong indicator for other variants',
      'Module-based migration is generally safest'
    ]
  };
}
```

### Variant Comparison

| Variant | When to Use | Key Characteristic | Migration Unit |
|---------|-------------|-------------------|----------------|
| **Component-First** | Clear module boundaries | Migrate by feature/service | Individual microservices or modules |
| **Layer-First** | Horizontal architecture | Migrate by technical layer | UI → API → Database sequentially |
| **Feature-First** | User-facing priority | Migrate by user journey | End-to-end user flows |

### Variant Details

#### Component-First
- **Best for**: Microservices, modular monoliths, plugin architectures
- **Approach**: Migrate one component/service at a time
- **Dependencies**: Requires clear API contracts between components
- **Risk**: Lower - isolated failures don't cascade

#### Layer-First
- **Best for**: Layered monoliths, tightly coupled systems
- **Approach**: Migrate entire layer before moving to next
- **Order**: Usually UI → API/Business Logic → Data Access → Database
- **Risk**: Medium - layer dependencies must be managed carefully

#### Feature-First
- **Best for**: User-centric products, A/B testing scenarios
- **Approach**: Migrate complete user journeys end-to-end
- **Dependencies**: Requires traffic splitting capability
- **Risk**: Variable - depends on feature complexity

---

## Confidence Calculation

Confidence score (50%-98%) indicates how strongly the engine recommends the selected strategy.

### Confidence Algorithm

```javascript
/**
 * Calculate confidence score for a strategy recommendation
 * @param {string} strategy - Selected strategy
 * @param {Object} factors - Context factors that modify confidence
 * @param {number} complexity - Complexity score (1-10)
 * @param {number} riskScore - Risk score (1-10)
 * @returns {number} Confidence score (0.50 - 0.98)
 */
function calculateConfidence(strategy, factors, complexity, riskScore) {
  // Base confidence per strategy
  const baseConfidence = {
    'Big Bang': 0.80,
    'Strangler Fig': 0.85,
    'Parallel Run': 0.80
  };

  let confidence = baseConfidence[strategy] || 0.75;

  // Positive modifiers (when factors are favorable)
  if (factors.clearBoundaries) confidence += 0.10;
  if (factors.testCoverage > 70) confidence += 0.10;
  if (factors.teamExperience) confidence += 0.05;
  if (factors.lowDependencies) confidence += 0.05;

  // Negative modifiers (when factors are unfavorable)
  if (factors.unclearRequirements) confidence -= 0.15;
  if (factors.tightTimeline) confidence -= 0.10;

  // Threshold proximity penalty
  // When scores are close to decision boundaries, reduce confidence
  const nearThreshold = isNearThreshold(complexity, riskScore);
  if (nearThreshold) confidence -= 0.05;

  // Enforce bounds: minimum 50%, maximum 98%
  return Math.max(0.50, Math.min(0.98, confidence));
}

/**
 * Check if scores are near decision thresholds
 * Thresholds: Big Bang (3,4), Parallel Run (8,8)
 */
function isNearThreshold(complexity, riskScore) {
  // Big Bang boundary: complexity=3,4 or risk=4,5
  const nearBigBang = (complexity === 3 || complexity === 4) ||
                      (riskScore === 4 || riskScore === 5);

  // Parallel Run boundary: complexity=7,8 or risk=7,8
  const nearParallel = (complexity === 7 || complexity === 8) ||
                       (riskScore === 7 || riskScore === 8);

  // In the middle zone, boundaries matter less
  const inMiddle = complexity >= 4 && complexity <= 7 &&
                   riskScore >= 5 && riskScore <= 7;

  return (nearBigBang || nearParallel) && !inMiddle;
}
```

### Confidence Factors

| Factor | Impact | Detection |
|--------|--------|-----------|
| Clear codebase boundaries | +10% | Module count > 5, coupling density < 0.4 |
| High test coverage (>70%) | +10% | From coverage report or analysis |
| Team experience with target | +5% | Context input (manual assessment) |
| Low external dependencies | +5% | Dependency count < 30 |
| Unclear requirements | -15% | Context input (manual flag) |
| Tight timeline | -10% | Context input (timeline < recommended) |
| Near threshold | -5% | Scores at decision boundaries |

### Confidence Interpretation

| Range | Interpretation | Action |
|-------|----------------|--------|
| **90-98%** | High confidence | Proceed with recommended strategy |
| **75-89%** | Good confidence | Recommended strategy with minor caveats |
| **60-74%** | Moderate confidence | Consider alternatives, gather more data |
| **50-59%** | Low confidence | Manual analysis strongly recommended |

### Confidence Examples

**High Confidence (92%)**:
- Strategy: Strangler Fig
- Base: 85%
- Clear boundaries: +10%
- Good coverage: +5%
- Unfavorable: Tight timeline: -8%
- Result: 92%

**Moderate Confidence (65%)**:
- Strategy: Big Bang
- Base: 80%
- Unclear requirements: -15%
- Near threshold (complexity=3, risk=5): +0% (became Strangler Fig)
- Result: 65% (suggests reconsidering)

---

## Rationale Templates

Each strategy has templated rationale that interpolates input values for personalized explanations.

### Rationale Generation

```javascript
/**
 * Generate rationale for strategy recommendation
 * @param {string} strategy - Selected strategy
 * @param {number} complexity - Complexity score
 * @param {number} riskScore - Risk score
 * @param {Object} context - Additional context (LOC, team size, etc.)
 * @returns {Object} Rationale with main text and supporting points
 */
function generateRationale(strategy, complexity, riskScore, context = {}) {
  const templates = {
    'Big Bang': {
      main: `Your migration has low complexity (${complexity}/10) with manageable risk (${riskScore}/10). A full rewrite in a single deployment window is feasible.`,
      supporting: [
        context.loc ? `Codebase size (${context.loc.toLocaleString()} LOC) is within single-effort range` : 'Small codebase allows complete rewrite',
        'Low risk means business impact is contained during cutover',
        'Rollback is straightforward: restore from backup'
      ]
    },
    'Strangler Fig': {
      main: `Your migration has moderate complexity (${complexity}/10) with ${riskScore <= 5 ? 'manageable' : 'elevated'} risk (${riskScore}/10). Strangler Fig allows incremental progress while maintaining production stability.`,
      supporting: [
        'Incremental migration reduces risk at each step',
        'Production remains stable throughout migration',
        context.timeline ? `Timeline (${context.timeline}) accommodates phased approach` : 'Phased approach allows flexible timeline'
      ]
    },
    'Parallel Run': {
      main: `Your migration has ${complexity >= 8 ? 'high complexity' : 'high risk'} (complexity: ${complexity}/10, risk: ${riskScore}/10). Parallel Run with dual-system validation is required for safety.`,
      supporting: [
        'Dual systems allow real-world comparison before cutover',
        'Extended validation period catches edge cases',
        'Higher infrastructure cost is justified by risk mitigation'
      ]
    }
  };

  return templates[strategy] || {
    main: `Strategy selected based on complexity (${complexity}/10) and risk (${riskScore}/10).`,
    supporting: ['Consult migration-strategies.md for details']
  };
}
```

### Rationale Templates by Strategy

#### Big Bang Rationale

**Template**:
```markdown
Your migration has low complexity ({complexity}/10) with manageable risk ({riskScore}/10).
A full rewrite in a single deployment window is feasible.
```

**Supporting Points** (conditional):
- Codebase size ({LOC} LOC) is within single-effort range
- Team has experience with target technology
- Timeline ({timeline}) allows sufficient testing
- Low external dependencies reduce compatibility concerns
- Rollback is straightforward: restore from backup

#### Strangler Fig Rationale

**Template**:
```markdown
Your migration has moderate complexity ({complexity}/10) with {risk_descriptor} risk ({riskScore}/10).
Strangler Fig allows incremental progress while maintaining production stability.
```

**Risk Descriptor Logic**:
- riskScore <= 3: "low"
- riskScore <= 5: "manageable"
- riskScore <= 7: "elevated"
- riskScore > 7: (shouldn't reach here - would be Parallel Run)

**Supporting Points**:
- Incremental migration reduces risk at each step
- Production remains stable throughout migration
- Feature flags enable gradual rollout
- TDD ensures functional parity at each phase
- Flexible timeline accommodates discovery

#### Parallel Run Rationale

**Template**:
```markdown
Your migration has {primary_concern} (complexity: {complexity}/10, risk: {riskScore}/10).
Parallel Run with dual-system validation is required for safety.
```

**Primary Concern Logic**:
- If complexity >= 8 AND risk >= 8: "high complexity and high risk"
- If complexity >= 8: "high complexity"
- If risk >= 8: "high risk"

**Supporting Points**:
- Dual systems allow real-world comparison before cutover
- Traffic mirroring catches discrepancies automatically
- Extended validation period (30-90 days) catches edge cases
- Rollback is instant: route traffic back to legacy
- Higher infrastructure cost is justified by risk mitigation

---

## Fallback Detection

Each recommendation includes a fallback strategy for when the primary choice becomes infeasible.

### Fallback Logic

```javascript
/**
 * Determine fallback strategy when primary becomes risky
 * @param {string} primaryStrategy - Currently selected strategy
 * @param {number} complexity - Complexity score
 * @param {number} riskScore - Risk score
 * @param {Object} context - Additional context
 * @returns {Object} Fallback recommendation with trigger conditions
 */
function determineFallback(primaryStrategy, complexity, riskScore, context = {}) {
  const fallbacks = {
    'Big Bang': {
      fallback: 'Strangler Fig',
      triggers: [
        'Timeline extends beyond initial estimate',
        'Unexpected complexity discovered during implementation',
        'Risk assessment changes after detailed analysis'
      ],
      condition: 'If timeline extends beyond 4 weeks or risk increases'
    },

    'Strangler Fig': {
      fallback: complexity >= 6 ? 'Parallel Run (for high-risk components)' : 'Big Bang (for isolated modules)',
      triggers: [
        'Critical components prove too risky for incremental migration',
        'Timeline constraints force acceleration',
        'Integration complexity higher than estimated'
      ],
      condition: complexity >= 6
        ? 'If high-risk components need dual-system validation'
        : 'If isolated modules can be fast-tracked'
    },

    'Parallel Run': {
      fallback: 'Phased Strangler Fig with stricter milestones',
      triggers: [
        'Budget constraints prevent dual-system maintenance',
        'Infrastructure limitations discovered',
        'Extended parallel period not sustainable'
      ],
      condition: 'If parallel operation becomes unsustainable'
    }
  };

  return fallbacks[primaryStrategy] || {
    fallback: 'Strangler Fig',
    triggers: ['Primary strategy becomes infeasible'],
    condition: 'Evaluate alternatives if blocked'
  };
}
```

### Fallback Matrix

| Primary | Fallback | When to Switch |
|---------|----------|----------------|
| **Big Bang** | Strangler Fig | Timeline > 4 weeks, risk increases, unexpected complexity |
| **Strangler Fig (low)** | Big Bang for modules | Isolated modules can be fast-tracked |
| **Strangler Fig (high)** | Parallel Run (partial) | Critical components need dual validation |
| **Parallel Run** | Phased Strangler | Budget/infrastructure constraints |

### Not Recommended Strategies

The engine also explains why other strategies were NOT selected:

```javascript
/**
 * Generate "Not Recommended" explanations
 * @param {string} selectedStrategy - The chosen strategy
 * @param {number} complexity - Complexity score
 * @param {number} riskScore - Risk score
 * @param {Object} context - Additional context (LOC, budget, etc.)
 * @returns {Array} List of not-recommended strategies with reasons
 */
function generateNotRecommended(selectedStrategy, complexity, riskScore, context = {}) {
  const strategies = ['Big Bang', 'Strangler Fig', 'Parallel Run'];
  const notRecommended = [];

  for (const strategy of strategies) {
    if (strategy === selectedStrategy) continue;

    switch (strategy) {
      case 'Big Bang':
        if (complexity > 3 || riskScore > 4) {
          notRecommended.push({
            strategy: 'Big Bang',
            reason: complexity > 3
              ? `Codebase too complex (${complexity}/10) for single rewrite`
              : `Risk too high (${riskScore}/10) for big-bang cutover`
          });
        }
        break;

      case 'Strangler Fig':
        if (complexity >= 8 || riskScore >= 8) {
          notRecommended.push({
            strategy: 'Strangler Fig',
            reason: `${complexity >= 8 ? 'Complexity' : 'Risk'} too high for incremental approach without dual validation`
          });
        }
        break;

      case 'Parallel Run':
        if (complexity <= 5 && riskScore <= 5) {
          notRecommended.push({
            strategy: 'Parallel Run',
            reason: context.budget === 'limited'
              ? 'Budget constraints make dual systems impractical'
              : 'Overhead not justified for moderate complexity/risk'
          });
        }
        break;
    }
  }

  return notRecommended;
}
```

### Fallback Examples

**Big Bang → Strangler Fig**:
```markdown
**Fallback**:
If timeline extends beyond 4 weeks or complexity increases during implementation,
switch to Strangler Fig with phased migration.
```

**Strangler Fig → Partial Parallel Run**:
```markdown
**Fallback**:
For high-risk components (PaymentService, AuthService), consider Parallel Run
validation before cutover. Other components can proceed with standard Strangler Fig.
```

---

## Output Format

The engine produces markdown output following simon_tools patterns.

### Output Structure

```markdown
### Strategy Recommendation

**Primary Strategy**: [Strategy Name] (Confidence: XX%)

**Rationale**:
[2-3 sentence explanation based on input factors]

**Recommended Variant**: [Variant Name] (only for Strangler Fig)
- [Reason 1 based on codebase characteristics]
- [Reason 2]
- [Reason 3]

**Prerequisites**:
- [ ] [Prerequisite 1] → [✓ Detected | Required]
- [ ] [Prerequisite 2] → [✓ Detected | Required]
- [ ] [Prerequisite 3] → [✓ Detected | Required]

**Migration Order** (by risk, ascending):
1. [Component] (risk: X/10) - Start here
2. [Component] (risk: X/10)
3. [Component] (risk: X/10) - Highest risk, migrate last

**Fallback**:
[Alternative strategy if primary becomes infeasible]

**Not Recommended**:
- [Strategy]: [Reason why not suitable]
- [Strategy]: [Reason why not suitable]
```

### Example Outputs

#### Example 1: Strangler Fig Recommendation

**Input**: complexity=6, risk=5, moduleBoundaries=0.8, couplingDensity=0.3

```markdown
### Strategy Recommendation

**Primary Strategy**: Strangler Fig (Confidence: 92%)

**Rationale**:
Your migration has moderate complexity (6/10) with manageable risk (5/10). Strangler Fig allows incremental progress while maintaining production stability.

**Recommended Variant**: Component-First
- Your codebase has clear module boundaries (15 distinct services)
- Low coupling between modules (density: 0.3)
- Independent deployability detected

**Prerequisites**:
- [ ] Identify clear module boundaries → ✓ Detected
- [ ] API facade for routing traffic → Required
- [ ] TDD for each migrated component → Use /develop-task

**Migration Order** (by risk, ascending):
1. UserService (risk: 3/10) - Start here
2. NotificationService (risk: 4/10)
3. PaymentService (risk: 7/10) - Highest risk, migrate last

**Fallback**:
If timeline extends beyond 4 months, consider Parallel Run for remaining high-risk components.

**Not Recommended**:
- Big Bang: Codebase too complex (6/10) for single rewrite
- Parallel Run: Overhead not justified for moderate complexity/risk
```

#### Example 2: Big Bang Recommendation

**Input**: complexity=2, risk=3

```markdown
### Strategy Recommendation

**Primary Strategy**: Big Bang (Confidence: 90%)

**Rationale**:
Your migration has low complexity (2/10) with manageable risk (3/10). A full rewrite in a single deployment window is feasible.

**Prerequisites**:
- [ ] Complete test coverage of source system → Required
- [ ] Clear requirements documentation → Required
- [ ] Team familiarity with target tech → Required

**Estimated Timeline**: 2-4 weeks

**Fallback**:
If timeline extends beyond 4 weeks or unexpected complexity discovered, switch to Strangler Fig with phased migration.

**Not Recommended**:
- Strangler Fig: Overhead not necessary for this scale
- Parallel Run: Overhead not justified for low complexity/risk
```

#### Example 3: Parallel Run Recommendation

**Input**: complexity=9, risk=8

```markdown
### Strategy Recommendation

**Primary Strategy**: Parallel Run (Confidence: 85%)

**Rationale**:
Your migration has high complexity and high risk (complexity: 9/10, risk: 8/10). Parallel Run with dual-system validation is required for safety.

**Prerequisites**:
- [ ] Infrastructure budget for dual systems → Required
- [ ] Traffic splitting capability → Required
- [ ] Extended timeline (6-12 months) → Required
- [ ] Monitoring and comparison tooling → Required

**Validation Period**: 30-90 days recommended

**Fallback**:
If parallel operation becomes unsustainable due to budget or infrastructure constraints, switch to Phased Strangler Fig with stricter milestones and extended validation for high-risk components.

**Not Recommended**:
- Big Bang: Codebase too complex (9/10) for single rewrite
- Strangler Fig: Complexity too high for incremental approach without dual validation
```

### Compact Format

For inline use within other outputs:

```markdown
**Strategy**: Strangler Fig (92%) | Variant: Component-First | Timeline: 3-6 months
```

---

## Input Validation

The engine validates inputs and applies sensible defaults for missing values.

### Validation Logic

```javascript
/**
 * Validate and normalize inputs
 * @param {Object} input - Raw input from caller
 * @returns {Object} Validated input with warnings
 */
function validateInput(input) {
  const warnings = [];
  const validated = { ...input };

  // Complexity validation (required, 1-10)
  if (validated.complexity === undefined || validated.complexity === null) {
    validated.complexity = 5;
    warnings.push('Complexity score not provided, using default (5)');
  } else if (validated.complexity < 1) {
    validated.complexity = 1;
    warnings.push(`Complexity clamped from ${input.complexity} to 1 (minimum)`);
  } else if (validated.complexity > 10) {
    validated.complexity = 10;
    warnings.push(`Complexity clamped from ${input.complexity} to 10 (maximum)`);
  }

  // Risk validation (required, 1-10)
  if (validated.riskScore === undefined || validated.riskScore === null) {
    validated.riskScore = 5;
    warnings.push('Risk score not provided, using default (5)');
  } else if (validated.riskScore < 1) {
    validated.riskScore = 1;
    warnings.push(`Risk clamped from ${input.riskScore} to 1 (minimum)`);
  } else if (validated.riskScore > 10) {
    validated.riskScore = 10;
    warnings.push(`Risk clamped from ${input.riskScore} to 10 (maximum)`);
  }

  // Context validation (optional)
  validated.context = validated.context || {};

  // Module boundaries (0-1)
  if (validated.context.moduleBoundaries !== undefined) {
    validated.context.moduleBoundaries = Math.max(0, Math.min(1, validated.context.moduleBoundaries));
  }

  // Coupling density (0-1)
  if (validated.context.couplingDensity !== undefined) {
    validated.context.couplingDensity = Math.max(0, Math.min(1, validated.context.couplingDensity));
  }

  return { validated, warnings };
}
```

### Default Values

| Input | Default | When Used | Rationale |
|-------|---------|-----------|-----------|
| `complexity` | 5 | Not provided | Middle of range - triggers Strangler Fig |
| `riskScore` | 5 | Not provided | Middle of range - safe default |
| `moduleBoundaries` | 0.5 | Not provided | Neutral - no variant preference |
| `couplingDensity` | 0.5 | Not provided | Neutral - no variant preference |
| `userFacingPriority` | false | Not provided | Component-First default |
| `teamExperience` | false | Not provided | Conservative confidence |
| `testCoverage` | null | Not provided | No confidence boost |

### Edge Case Handling

| Scenario | Input | Behavior |
|----------|-------|----------|
| All inputs missing | {} | Strangler Fig (50% confidence), warn user |
| Invalid complexity | complexity=15 | Clamp to 10, add warning |
| Invalid risk | riskScore=-1 | Clamp to 1, add warning |
| Conflicting signals | complexity=2, risk=9 | Parallel Run (risk dominates), note conflict |
| Extreme values | complexity=10, risk=10 | Parallel Run, note extreme conditions |
| Boundary values | complexity=3, risk=4 | Big Bang (inclusive), note boundary |
| Just above boundary | complexity=4, risk=4 | Strangler Fig, note proximity |

### Warning Output

When warnings are present, they appear at the end of the recommendation:

```markdown
### Strategy Recommendation

...

---

**Warnings**:
- Complexity score not provided, using default (5)
- Risk clamped from 15 to 10 (maximum)
- Scores near decision boundary - confidence reduced
```

### Error States

| Condition | Response |
|-----------|----------|
| Non-numeric complexity | Error: complexity must be a number (1-10) |
| Non-numeric risk | Error: riskScore must be a number (1-10) |
| Both scores missing | Warning + lowest confidence (50%) recommendation |

---

