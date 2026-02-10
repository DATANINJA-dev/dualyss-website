# Gate Evaluation Logic

Implementation patterns for evaluating SEO validation results and determining deployment gate outcomes.

## Overview

The gate evaluation module receives validation results from SEO validators (`/seo-validate-*` commands) and:
1. Categorizes checks into passed, warnings, and failures
2. Determines the appropriate exit code (0, 1, or 2)
3. Formats output for CI/CD consumption (JSON, GitHub Actions annotations)
4. Supports strict mode via `--fail-on-warning` flag

## Input Schema

All SEO validators output results in this standardized format:

```json
{
  "validator": "lighthouse|meta|structured|hreflang|quality|orthography",
  "url": "https://example.com/page",
  "status": "pass|warn|fail",
  "timestamp": "2026-01-19T12:00:00Z",
  "checks": [
    {
      "name": "check_identifier",
      "passed": true,
      "severity": "critical|warning|info",
      "error_code": "E5XX",
      "message": "Human-readable description",
      "file": "optional/path/to/file.tsx",
      "line": 123,
      "details": {
        "actual": "current value",
        "expected": "expected value",
        "threshold": "numeric threshold if applicable"
      }
    }
  ],
  "summary": {
    "total": 10,
    "passed": 8,
    "warnings": 1,
    "failures": 1
  }
}
```

### Check Severity Levels

| Severity | Exit Code | Gate Action | Examples |
|----------|-----------|-------------|----------|
| `critical` | 1 | Block deployment | Missing canonical, robots.txt blocks all, Lighthouse < 50 |
| `warning` | 0 | Allow with notification | Missing OG tags, title length, Lighthouse 50-89 |
| `info` | 0 | Log only | Optimization suggestions, minor schema improvements |

## Gate Evaluation Function

```javascript
/**
 * Evaluates SEO validation results and determines deployment gate outcome.
 *
 * @param {Object} results - Aggregated validation results
 * @param {Object} options - Gate configuration options
 * @param {boolean} options.failOnWarning - Treat warnings as blocking failures
 * @param {boolean} options.jsonOutput - Output JSON format for CI/CD
 * @param {boolean} options.githubAnnotations - Format as GitHub Actions annotations
 * @returns {Object} Gate evaluation result with exit code
 */
const evaluateGate = (results, options = {}) => {
  const {
    failOnWarning = false,
    jsonOutput = false,
    githubAnnotations = false
  } = options;

  // Initialize categorization buckets
  const summary = {
    passed: [],
    warnings: [],
    failures: [],
    systemErrors: []
  };

  // Categorize all checks from all validators
  for (const check of results.checks || []) {
    if (check.error_code && check.error_code.startsWith('E55')) {
      // E55X = System/infrastructure errors (exit 2)
      summary.systemErrors.push(check);
    } else if (check.severity === 'critical' && !check.passed) {
      // Critical failure (exit 1)
      summary.failures.push(check);
    } else if (check.severity === 'warning' && !check.passed) {
      // Warning (exit 0, or 1 if --fail-on-warning)
      summary.warnings.push(check);
    } else {
      // Passed or info-level
      summary.passed.push(check);
    }
  }

  // Determine exit code (most severe wins)
  let exitCode = 0;
  let gateStatus = 'pass';
  let errorCode = null;

  if (summary.systemErrors.length > 0) {
    // System errors are highest priority (exit 2)
    exitCode = 2;
    gateStatus = 'error';
    errorCode = summary.systemErrors[0].error_code;
  } else if (summary.failures.length > 0) {
    // Critical failures block deployment (exit 1)
    exitCode = 1;
    gateStatus = 'fail';
    errorCode = summary.failures[0].error_code;
  } else if (failOnWarning && summary.warnings.length > 0) {
    // Warnings promoted to failures in strict mode (exit 1)
    exitCode = 1;
    gateStatus = 'fail';
    errorCode = 'E501'; // Performance warning promoted to error
  }

  // Build result object
  const result = {
    gate: {
      status: gateStatus,
      exitCode: exitCode,
      errorCode: errorCode,
      failOnWarning: failOnWarning
    },
    summary: {
      total: results.checks?.length || 0,
      passed: summary.passed.length,
      warnings: summary.warnings.length,
      failures: summary.failures.length,
      systemErrors: summary.systemErrors.length
    },
    checks: {
      passed: summary.passed,
      warnings: summary.warnings,
      failures: summary.failures,
      systemErrors: summary.systemErrors
    },
    timestamp: new Date().toISOString()
  };

  return result;
};
```

## Exit Code Matrix

| Scenario | Exit Code | Error Code | Gate Status |
|----------|-----------|------------|-------------|
| All checks pass | 0 | - | pass |
| Warnings only | 0 | - | pass |
| Warnings + `--fail-on-warning` | 1 | E501 | fail |
| Critical failure (validation) | 1 | E500-E549 | fail |
| System error (infrastructure) | 2 | E550-E559 | error |

### Error Code Ranges

| Range | Category | Exit Code | Description |
|-------|----------|-----------|-------------|
| E500-E509 | SEO Validation | 1 | Content/markup issues |
| E520-E529 | GEO Citation | 1 | AI platform validation |
| E530-E539 | Orthography | 1 | Spelling/grammar issues |
| E540-E549 | GEO Technical | 1 | AI crawler readiness |
| E550-E559 | External Service | 2 | Infrastructure errors |

## Output Formats

### JSON Output (--json)

For CI/CD pipeline consumption:

```json
{
  "gate": {
    "status": "fail",
    "exitCode": 1,
    "errorCode": "E503",
    "failOnWarning": false
  },
  "summary": {
    "total": 5,
    "passed": 3,
    "warnings": 1,
    "failures": 1,
    "systemErrors": 0
  },
  "checks": {
    "passed": [...],
    "warnings": [...],
    "failures": [
      {
        "name": "canonical-tag",
        "passed": false,
        "severity": "critical",
        "error_code": "E503",
        "message": "Missing canonical URL on /products",
        "file": "src/pages/products.tsx"
      }
    ],
    "systemErrors": []
  },
  "timestamp": "2026-01-19T12:00:00Z"
}
```

### GitHub Actions Annotations

For GitHub workflow integration, format failures and warnings as annotations:

```javascript
/**
 * Formats gate result as GitHub Actions annotations.
 *
 * @param {Object} gateResult - Result from evaluateGate()
 * @returns {string[]} Array of annotation strings
 */
const formatGitHubAnnotations = (gateResult) => {
  const annotations = [];

  // Failures as errors (block workflow)
  for (const check of gateResult.checks.failures) {
    const file = check.file ? `file=${check.file}` : '';
    const line = check.line ? `,line=${check.line}` : '';
    annotations.push(
      `::error ${file}${line}::${check.error_code}: ${check.message}`
    );
  }

  // System errors as errors
  for (const check of gateResult.checks.systemErrors) {
    annotations.push(
      `::error ::${check.error_code}: ${check.message}`
    );
  }

  // Warnings as warnings (non-blocking unless --fail-on-warning)
  for (const check of gateResult.checks.warnings) {
    const file = check.file ? `file=${check.file}` : '';
    const line = check.line ? `,line=${check.line}` : '';
    annotations.push(
      `::warning ${file}${line}::${check.error_code}: ${check.message}`
    );
  }

  return annotations;
};
```

**Example GitHub Actions annotations output**:

```bash
::error file=src/pages/products.tsx,line=15::E503: Missing canonical URL
::error file=src/components/Header.tsx::E504: Missing meta description
::warning file=src/pages/about.tsx::E505: Open Graph tags incomplete
```

### Markdown Summary Output

For human-readable reports:

```markdown
## SEO Gate Result: FAIL

**Exit Code**: 1
**Error**: E503 - Missing canonical URL

### Summary
| Category | Count |
|----------|-------|
| Passed | 8 |
| Warnings | 2 |
| Failures | 1 |

### Failures (Blocking)
- [E503] Missing canonical URL on /products
  - File: src/pages/products.tsx

### Warnings (Non-blocking)
- [E505] Open Graph tags incomplete on /about
  - Missing: og:image
```

## --fail-on-warning Flag (Strict Mode)

When `--fail-on-warning` is enabled, warnings are promoted to failures:

### Behavior

```javascript
// Without --fail-on-warning
// 2 warnings → exit 0 (pass)
evaluateGate(results, { failOnWarning: false });
// Result: { exitCode: 0, status: 'pass' }

// With --fail-on-warning
// 2 warnings → exit 1 (fail)
evaluateGate(results, { failOnWarning: true });
// Result: { exitCode: 1, status: 'fail', errorCode: 'E501' }
```

### Use Cases

| Mode | Use Case | Threshold |
|------|----------|-----------|
| Default | Development/staging | Warnings allowed |
| Strict (`--fail-on-warning`) | Production | Zero tolerance |

### CI/CD Configuration

```yaml
# .github/workflows/seo-validation.yml
jobs:
  staging:
    steps:
      - run: seo-validate --json
        # Warnings allowed on staging

  production:
    steps:
      - run: seo-validate --json --fail-on-warning
        # Strict mode for production
```

## Aggregating Multiple Validators

When running multiple validators, aggregate results before evaluation:

```javascript
/**
 * Aggregates results from multiple SEO validators.
 *
 * @param {Object[]} validatorResults - Array of validator outputs
 * @returns {Object} Aggregated results for gate evaluation
 */
const aggregateValidatorResults = (validatorResults) => {
  const aggregated = {
    validators: [],
    checks: [],
    summary: {
      total: 0,
      passed: 0,
      warnings: 0,
      failures: 0
    }
  };

  for (const result of validatorResults) {
    aggregated.validators.push(result.validator);
    aggregated.checks.push(...(result.checks || []));
    aggregated.summary.total += result.summary?.total || 0;
    aggregated.summary.passed += result.summary?.passed || 0;
    aggregated.summary.warnings += result.summary?.warnings || 0;
    aggregated.summary.failures += result.summary?.failures || 0;
  }

  return aggregated;
};

// Usage in deployment gate
const lighthouseResults = await runValidator('lighthouse');
const metaResults = await runValidator('meta');
const structuredResults = await runValidator('structured');

const aggregated = aggregateValidatorResults([
  lighthouseResults,
  metaResults,
  structuredResults
]);

const gateResult = evaluateGate(aggregated, { failOnWarning: true });
process.exit(gateResult.gate.exitCode);
```

## Integration with Deployment Gates

See `deployment-gates.md` for:
- Red/Yellow/Green classification patterns
- GitHub Actions workflow configuration
- Environment protection rules
- Override mechanisms

## Related Patterns

- **Error codes**: See `error-handling/error-codes.md` for E5XX reference
- **Deployment gates**: See `deployment-gates.md` for blocking criteria
- **GitHub Actions**: See `github-actions-patterns.md` for workflow templates
- **Pre-commit**: See `pre-commit-design.md` for local validation
