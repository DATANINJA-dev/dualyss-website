# Migration Complexity Scoring

Quantitative 1-10 complexity scoring for migration projects based on codebase characteristics. Complements the risk-assessment-framework by measuring codebase complexity rather than domain risk.

## Overview

**Purpose**: Provide a data-driven complexity score (1-10) that:
- Informs realistic timeline estimation
- Guides strategy selection (Big Bang vs Strangler Fig vs Parallel Run)
- Identifies complexity hotspots requiring extra attention

**Relationship to Risk Assessment**:
- `risk-assessment-framework.md` measures *domain risk* (what could go wrong)
- `complexity-scoring.md` measures *codebase complexity* (how hard is the work)
- Both scores together inform strategy selection and resource planning

**Key Insight**: A migration can be high-risk but low-complexity (simple auth change to a critical system) or low-risk but high-complexity (rewriting a large test suite). Understanding both dimensions is essential.

---

## Complexity Factors

### Factor Weights

| Factor | Weight | Rationale |
|--------|--------|-----------|
| **Risk Score** | 30% | Domain risk from risk-assessment-framework drives most timeline uncertainty |
| **Codebase Size** | 25% | Lines of code directly correlate with migration effort |
| **Dependency Count** | 20% | External dependencies create compatibility testing burden |
| **Coupling Analysis** | 15% | High coupling increases change propagation |
| **Test Coverage** | 10% | Low coverage means more manual verification needed |

### Factor Details

#### 1. Codebase Size (25%)

Lines of code in scope for migration.

| LOC Range | Score | Rationale |
|-----------|-------|-----------|
| < 1,000 | 1 | Trivial - single developer, days |
| 1,000 - 5,000 | 3 | Small - single developer, weeks |
| 5,000 - 20,000 | 5 | Medium - small team, 1-2 months |
| 20,000 - 50,000 | 7 | Large - team effort, 3-6 months |
| 50,000 - 100,000 | 9 | Very large - multi-team, 6-12 months |
| > 100,000 | 10 | Enterprise - program-level, 12+ months |

**Measurement**: Use `cloc` or Serena's file analysis.

#### 2. Dependency Count (20%)

Direct plus significant transitive dependencies.

| Dependency Count | Score | Rationale |
|------------------|-------|-----------|
| < 10 | 2 | Minimal - few compatibility concerns |
| 10 - 30 | 4 | Manageable - standard project |
| 30 - 50 | 6 | Moderate - compatibility testing needed |
| 50 - 100 | 8 | High - significant compatibility risk |
| > 100 | 10 | Extreme - dependency hell likely |

**Measurement**: Parse package.json, pom.xml, requirements.txt, go.mod, Cargo.toml.

#### 3. Risk Score (30%)

Composite score from `risk-assessment-framework.md`.

| Risk Score | Complexity Contribution | Notes |
|------------|------------------------|-------|
| 1-10 | Direct (1-10) | Use composite score directly |

**Reference**: See `risk-assessment-framework.md` for calculation methodology.

#### 4. Coupling Analysis (15%)

Import/export graph density measuring how interconnected the codebase is.

| Coupling Level | Score | Indicator |
|----------------|-------|-----------|
| Very Low | 1-2 | < 10% of modules have cross-imports |
| Low | 3-4 | 10-25% cross-imports, clear boundaries |
| Medium | 5-6 | 25-50% cross-imports, some circular deps |
| High | 7-8 | 50-75% cross-imports, multiple cycles |
| Very High | 9-10 | > 75% cross-imports, monolithic tangle |

**Measurement**: Use Serena to build import graph, calculate density.

```javascript
// Coupling density calculation
function calculateCouplingScore(importGraph) {
  const totalModules = importGraph.nodes.length;
  const totalEdges = importGraph.edges.length;
  const maxPossibleEdges = totalModules * (totalModules - 1);

  if (maxPossibleEdges === 0) return 1;

  const density = totalEdges / maxPossibleEdges;
  const circularDeps = countCircularDependencies(importGraph);
  const circularPenalty = Math.min(circularDeps * 0.5, 3);

  // Map density (0-1) to score (1-10) + circular penalty
  return Math.min(10, Math.round(density * 8) + 1 + circularPenalty);
}
```

#### 5. Test Coverage (10%)

Existing test coverage percentage - *inverse scoring* (lower coverage = higher complexity).

| Coverage % | Score | Rationale |
|------------|-------|-----------|
| > 90% | 1 | Excellent - high confidence in changes |
| 70-90% | 3 | Good - moderate safety net |
| 50-70% | 5 | Fair - manual testing needed |
| 30-50% | 7 | Low - significant manual effort |
| < 30% | 9 | Poor - high verification burden |
| 0% | 10 | None - everything needs verification |

**Measurement**: Parse coverage reports (lcov, cobertura, coverage.py).

---

## Scoring Algorithm

### Core Algorithm

```javascript
/**
 * Calculate migration complexity score (1-10)
 * @param {Object} analysis - Collected metrics from codebase analysis
 * @returns {number} Complexity score 1-10 (rounded)
 */
function calculateComplexity(analysis) {
  // 1. Size score (25% weight)
  const sizeScore = mapToScale(analysis.loc, [
    { max: 1000, score: 1 },
    { max: 5000, score: 3 },
    { max: 20000, score: 5 },
    { max: 50000, score: 7 },
    { max: 100000, score: 9 },
    { min: 100000, score: 10 }
  ]);

  // 2. Dependency score (20% weight)
  const depScore = mapToScale(analysis.dependencyCount, [
    { max: 10, score: 2 },
    { max: 30, score: 4 },
    { max: 50, score: 6 },
    { max: 100, score: 8 },
    { min: 100, score: 10 }
  ]);

  // 3. Risk score from risk-assessment-framework (30% weight)
  // Use composite score directly (already 1-10 scale)
  const riskScore = analysis.riskAssessment?.composite ?? 5;

  // 4. Coupling score (15% weight)
  const couplingScore = calculateCouplingScore(analysis.importGraph);

  // 5. Test coverage score - inverse (10% weight)
  // Lower coverage = higher complexity
  const coverageScore = mapCoverageToScore(analysis.testCoveragePercent);

  // Weighted composite
  const complexity = (
    sizeScore * 0.25 +
    depScore * 0.20 +
    riskScore * 0.30 +
    couplingScore * 0.15 +
    coverageScore * 0.10
  );

  return Math.round(complexity);
}

/**
 * Map a numeric value to a score using threshold ranges
 */
function mapToScale(value, thresholds) {
  for (const threshold of thresholds) {
    if (threshold.max !== undefined && value <= threshold.max) {
      return threshold.score;
    }
    if (threshold.min !== undefined && value > threshold.min) {
      return threshold.score;
    }
  }
  return 5; // Default middle score
}

/**
 * Map test coverage percentage to complexity score (inverse)
 */
function mapCoverageToScore(coveragePercent) {
  if (coveragePercent === null || coveragePercent === undefined) {
    return 8; // Unknown coverage = high complexity assumption
  }
  // Inverse: high coverage = low complexity score
  // 100% coverage → score 1, 0% coverage → score 10
  return Math.max(1, Math.min(10, Math.round(10 - (coveragePercent / 10))));
}
```

### Weight Configuration

Weights can be adjusted for different migration types:

| Migration Type | Size | Deps | Risk | Coupling | Coverage |
|----------------|------|------|------|----------|----------|
| **Standard** | 25% | 20% | 30% | 15% | 10% |
| **Greenfield target** | 30% | 25% | 20% | 15% | 10% |
| **API-heavy** | 15% | 35% | 25% | 15% | 10% |
| **Compliance-critical** | 15% | 15% | 45% | 10% | 15% |
| **Monolith decomposition** | 20% | 15% | 25% | 30% | 10% |

---

## Score Interpretation

### Tier Definitions

| Score | Level | Timeline Estimate | Recommended Strategy |
|-------|-------|-------------------|---------------------|
| **1-3** | Simple | 1-4 weeks | Big Bang feasible - single deployment window |
| **4-6** | Moderate | 1-3 months | Strangler Fig recommended - incremental migration |
| **7-8** | Complex | 3-6 months | Phased Strangler Fig - strict phase gates |
| **9-10** | Critical | 6-12 months | Parallel Run required - extended validation |

### Tier Details

#### Simple (1-3): Big Bang Feasible

**Characteristics**:
- Small codebase (< 5K LOC)
- Few dependencies (< 30)
- Low risk score (< 3)
- Good test coverage (> 70%)
- Low coupling (clear module boundaries)

**Approach**:
- Single maintenance window migration
- Complete cutover in one deployment
- Rollback = restore from backup

**Example**: Migrating a small internal tool from Python 2 to Python 3.

#### Moderate (4-6): Strangler Fig Recommended

**Characteristics**:
- Medium codebase (5K-50K LOC)
- Moderate dependencies (30-100)
- Medium risk score (3-5)
- Fair test coverage (50-70%)
- Some coupling concerns

**Approach**:
- Incremental feature migration
- API facade for routing
- Feature flags for gradual rollout

**Example**: Migrating a web application from Express to NestJS.

#### Complex (7-8): Phased Strangler Fig

**Characteristics**:
- Large codebase (50K-100K LOC)
- Many dependencies (50-100+)
- Higher risk score (5-7)
- Low test coverage (30-50%)
- Significant coupling

**Approach**:
- Strict phase gates with sign-off
- Parallel systems during transition
- Automated validation between phases

**Example**: Migrating a monolithic Java application to microservices.

#### Critical (9-10): Parallel Run Required

**Characteristics**:
- Very large codebase (> 100K LOC)
- Extreme dependency count (> 100)
- High risk score (> 7)
- Minimal test coverage (< 30%)
- Tightly coupled architecture

**Approach**:
- Dual systems running simultaneously
- Traffic mirroring for validation
- Extended parallel period (30-90 days)
- Consider decomposition before migration

**Example**: Migrating a core banking system to a new platform.

---

## Metric Collection Examples

### Codebase Size (LOC)

Using `cloc` command-line tool:

```bash
# Count lines of code, excluding tests and vendor
cloc src/ --exclude-dir=test,node_modules,vendor --json

# Example output parsing
{
  "JavaScript": { "code": 15000 },
  "TypeScript": { "code": 25000 },
  "SUM": { "code": 40000 }
}
```

Using Serena MCP:

```
Use mcp__serena__list_dir with recursive=true
Count files by extension
Estimate LOC from file count (average ~100 LOC/file for typical projects)
```

### Dependency Count

From package.json (Node.js):

```javascript
const pkg = JSON.parse(fs.readFileSync('package.json'));
const directDeps = Object.keys(pkg.dependencies || {}).length;
const devDeps = Object.keys(pkg.devDependencies || {}).length;
// Focus on runtime dependencies for migration complexity
const dependencyCount = directDeps;
```

From other package managers:

| Package Manager | File | Parsing |
|-----------------|------|---------|
| npm/yarn | package.json | `dependencies` object keys |
| pip | requirements.txt | Line count (non-comment) |
| Maven | pom.xml | `<dependency>` elements |
| Gradle | build.gradle | `implementation` declarations |
| Go | go.mod | `require` statements |
| Cargo | Cargo.toml | `[dependencies]` entries |

### Import Graph (Coupling)

Using Serena MCP:

```
1. Use mcp__serena__find_symbol to find all modules/classes
2. For each module, use mcp__serena__find_referencing_symbols
3. Build adjacency list: { module: [imported_by] }
4. Calculate density and detect cycles
```

### Test Coverage

From coverage reports:

```bash
# Jest (JavaScript)
npx jest --coverage --coverageReporters=json-summary
# Parses: coverage/coverage-summary.json → "total.lines.pct"

# pytest (Python)
pytest --cov=src --cov-report=json
# Parses: coverage.json → "totals.percent_covered"

# Go
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
# Parse final line: "total: XX.X% of statements"
```

### Risk Score

Reference `risk-assessment-framework.md`:

```
composite_risk = (
  data_loss_score × 0.30 +
  auth_score × 0.25 +
  integration_score × 0.20 +
  business_logic_score × 0.15 +
  performance_score × 0.10
)
```

The migration-impact-analyzer agent calculates this automatically.

---

## Integration with migration-impact-analyzer

### Invocation Pattern

The `migration-impact-analyzer.md` agent should invoke complexity scoring after completing risk assessment:

```markdown
### Phase 6: COMPLEXITY - Calculate Codebase Complexity

After Phase 5 (OUTPUT), calculate complexity score:

1. **Collect metrics** from earlier phases:
   - LOC estimate from Phase 2 (ANALYZE)
   - Dependency count from Phase 2 (ANALYZE)
   - Risk composite from Phase 4 (RECOMMEND)
   - Coupling estimate from Serena analysis
   - Test coverage if available

2. **Apply scoring algorithm**:
   - Use `complexity-scoring.md` algorithm
   - Apply standard weights (or type-specific if migration type detected)

3. **Add to output**:
   ```markdown
   ### Complexity Assessment

   **Complexity Score**: X/10 ([Simple/Moderate/Complex/Critical])

   **Factor Breakdown**:
   | Factor | Value | Score | Weight | Contribution |
   |--------|-------|-------|--------|--------------|
   | Codebase Size | X LOC | X | 25% | X.XX |
   | Dependencies | X | X | 20% | X.XX |
   | Risk Score | X.X/10 | X.X | 30% | X.XX |
   | Coupling | [Level] | X | 15% | X.XX |
   | Test Coverage | X% | X | 10% | X.XX |
   | **Total** | | | | **X.XX → X** |

   **Timeline Estimate**: [based on tier]
   **Recommended Strategy**: [based on tier]
   ```
```

### Input/Output Contract

**Inputs Required**:
```typescript
interface ComplexityInput {
  loc: number;                    // Lines of code
  dependencyCount: number;        // Direct dependencies
  riskAssessment?: {
    composite: number;            // 1-10 from risk-assessment-framework
  };
  importGraph?: {
    nodes: string[];              // Module names
    edges: [string, string][];    // [from, to] tuples
  };
  testCoveragePercent?: number;   // 0-100, null if unknown
}
```

**Output**:
```typescript
interface ComplexityResult {
  score: number;                  // 1-10 rounded
  level: 'Simple' | 'Moderate' | 'Complex' | 'Critical';
  timeline: string;               // e.g., "3-6 months"
  strategy: string;               // e.g., "Phased Strangler Fig"
  factorBreakdown: {
    factor: string;
    rawValue: string | number;
    score: number;
    weight: string;
    contribution: number;
  }[];
  riskFactors: string[];          // Notable concerns
}
```

### Error Handling

When metrics are unavailable:

| Missing Metric | Default | Notes |
|----------------|---------|-------|
| LOC | 5 (Medium) | Conservative middle estimate |
| Dependencies | 4 (Manageable) | Assume standard project |
| Risk Score | 5 (Medium) | Triggers manual risk assessment |
| Coupling | 5 (Medium) | Recommend Serena analysis |
| Coverage | 8 (Low) | Pessimistic - assume needs verification |

---

## Output Format

### Standard Complexity Report

```markdown
### Migration Complexity Score: 7/10 (Complex)

**Factor Breakdown**:
| Factor | Raw Value | Score | Weight | Contribution |
|--------|-----------|-------|--------|--------------|
| Codebase Size | 45,000 LOC | 7 | 25% | 1.75 |
| Dependencies | 67 packages | 6 | 20% | 1.20 |
| Risk Score | 6.5/10 | 6.5 | 30% | 1.95 |
| Coupling | Medium | 5 | 15% | 0.75 |
| Test Coverage | 42% | 6 | 10% | 0.60 |
| **Total** | | | | **7.25 → 7** |

**Timeline Estimate**: 3-6 months
**Recommended Strategy**: Phased Strangler Fig

**Complexity Drivers**:
- Large codebase (45K LOC) requires systematic migration
- Moderate risk score (6.5) indicates careful validation needed
- Low test coverage (42%) increases verification burden

**Recommendations**:
1. Increase test coverage before migration (target 70%+)
2. Identify and document coupling hotspots
3. Plan 3-4 migration phases with clear boundaries
```

### Compact Format (for inline use)

```markdown
**Complexity**: 7/10 (Complex) | Timeline: 3-6 months | Strategy: Phased Strangler Fig
```

---

## Sources

- [2025 Developer Productivity Report](https://www.jetbrains.com/resources/industry-reports/) - LOC/productivity correlations
- [State of JS/TS 2025](https://stateofjs.com) - Dependency ecosystem statistics
- [Google SRE - Measuring Code Health](https://sre.google/sre-book/measuring-service-risk/) - Risk quantification
- [Coupling Metrics Research](https://ieeexplore.ieee.org/document/6603081) - Academic coupling measurement
- [Test Coverage and Defect Density](https://www.sciencedirect.com/science/article/pii/S0164121215000989) - Coverage impact studies
