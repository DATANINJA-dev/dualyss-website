---
description: Run Lighthouse performance/SEO budget checks with conditional execution
allowed-tools: Bash, Glob, Grep, Read
argument-hint: "[url] [--budget FILE] [--changed] [--verbose] [--json]"
---

# seo-validate-lighthouse

Run Lighthouse performance and SEO audits with configurable budget thresholds. Supports conditional execution to skip audits when no web files have changed.

## When to Use

- Before deploying changes to validate performance budgets
- In pre-commit hooks (with `--changed` flag for fast execution)
- To audit pages against Lighthouse performance/SEO/accessibility scores
- During development to catch performance regressions early

## Parameters

$ARGUMENTS = URL to audit and optional flags

**URL** (default: `http://localhost:3000`):
- HTTP/HTTPS URL to audit
- Local file paths supported via file:// protocol

**Flags**:
- `--budget FILE`: Path to custom budget.json file
- `--changed`: Only run if HTML/CSS/JS files changed (for pre-commit)
- `--verbose`: Show detailed output with timing
- `--json`: Output results as JSON
- `--screenshot`: Capture page screenshot (requires Playwright MCP)

## Instructions

### Phase 0: Input Validation

1. **Parse arguments**:
   - Extract URL from `$ARGUMENTS` (default: `http://localhost:3000`)
   - Check for `--budget` flag and extract file path
   - Check for `--changed` flag
   - Check for `--verbose` flag
   - Check for `--json` flag

2. **Store flags for later phases**:
   ```
   url = extracted URL or "http://localhost:3000"
   budget_file = extracted budget path or null
   conditional_mode = "--changed" in arguments
   verbose_mode = "--verbose" in arguments
   json_output = "--json" in arguments
   screenshot_mode = "--screenshot" in arguments
   ```

3. **Check Lighthouse CLI availability**:

   Use Bash to verify lighthouse is installed:
   ```bash
   npx lighthouse --version 2>/dev/null || echo "NOT_FOUND"
   ```

   If NOT_FOUND:
   ```
   [ERROR] E101: Lighthouse CLI not found

   Install with:
     npm install -g lighthouse

   Or run via npx (slower):
     npx lighthouse --version

   Exit 2
   ```

### Phase 1: Conditional Check (if --changed)

4. **Skip if no web files changed** (only if `--changed` flag set):

   Use Bash to check staged files:
   ```bash
   git diff --cached --name-only 2>/dev/null | grep -E '\.(html|css|js|jsx|tsx|vue|svelte)$' || echo "NO_WEB_FILES"
   ```

   If NO_WEB_FILES:
   ```
   ## Lighthouse Audit

   [SKIP] No web files changed (--changed flag active)

   Checked patterns: *.html, *.css, *.js, *.jsx, *.tsx, *.vue, *.svelte

   Exit 0
   ```

   If web files found:
   ```
   Conditional check: [N] web files changed, running Lighthouse...
   ```

5. **If not conditional mode**, proceed directly to Phase 2.

### Phase 2: Lighthouse Execution

6. **Load budget configuration**:

   If `budget_file` provided:
   - Use Read tool to load the file
   - Parse JSON content
   - Extract category budgets and metric thresholds

   Default budgets (if no file provided):
   ```json
   {
     "categories": {
       "performance": 80,
       "seo": 90,
       "accessibility": 85,
       "best-practices": 80
     },
     "metrics": {
       "first-contentful-paint": 1800,
       "largest-contentful-paint": 2500,
       "cumulative-layout-shift": 0.1,
       "total-blocking-time": 200
     }
   }
   ```

7. **Execute Lighthouse audit**:

   Use Bash to run Lighthouse (30s timeout):
   ```bash
   npx lighthouse [url] --output json --chrome-flags="--headless --no-sandbox" --quiet 2>/dev/null
   ```

   If timeout or error:
   ```
   [ERROR] E200: Lighthouse execution failed

   Possible causes:
   - URL not accessible
   - Chrome/Chromium not installed
   - Network timeout

   Exit 2
   ```

### Phase 2.5: Visual Capture (if --screenshot)

8. **Check Playwright MCP availability** (if screenshot_mode):

   ```
   If screenshot_mode:
     Try to invoke mcp__plugin_playwright_playwright__browser_navigate

     If available:
       playwright_available = true
     Else:
       playwright_available = false
       Log: "[INFO] Playwright MCP not available. Skipping screenshot capture."
   ```

9. **Capture page screenshot** (if playwright_available):

   ```
   1. Navigate to URL:
      mcp__plugin_playwright_playwright__browser_navigate(url: [url])

   2. Wait for page load:
      mcp__plugin_playwright_playwright__browser_wait_for(time: 2)

   3. Capture full page screenshot:
      mcp__plugin_playwright_playwright__browser_take_screenshot(
        filename: "lighthouse-[url-slug]-[timestamp].png",
        fullPage: true
      )

   4. Store screenshot path for report

   5. Close browser:
      mcp__plugin_playwright_playwright__browser_close()
   ```

   **Screenshot directory**: `backlog/seo-reports/screenshots/`
   Create directory if it doesn't exist.

   **Graceful degradation**: If any Playwright step fails, log warning and continue with Lighthouse results only.

### Phase 3: Parse Results

10. **Parse Lighthouse results**:

   Extract from JSON output:
   - `categories.performance.score` (0-1 scale, multiply by 100)
   - `categories.seo.score`
   - `categories.accessibility.score`
   - `categories['best-practices'].score`
   - `audits['first-contentful-paint'].numericValue`
   - `audits['largest-contentful-paint'].numericValue`
   - `audits['cumulative-layout-shift'].numericValue`
   - `audits['total-blocking-time'].numericValue`

### Phase 3: Budget Validation

9. **Compare category scores against budgets**:

   For each category in [performance, seo, accessibility, best-practices]:
   ```
   score = lighthouse_results.categories[category].score * 100
   budget = budget_config.categories[category]

   If score < budget:
     errors.push({
       code: "E510",
       category: category,
       score: score,
       budget: budget,
       message: "[category] score [score] below budget [budget]"
     })
     status = "FAIL"
   Else:
     status = "PASS"

   Store result: { category, score, budget, status }
   ```

10. **Compare metrics against thresholds**:

    For each metric in budget_config.metrics:
    ```
    value = lighthouse_results.audits[metric].numericValue
    budget = budget_config.metrics[metric]

    # Convert ms to seconds for display
    display_value = value / 1000 (for time metrics)
    display_budget = budget / 1000 (for time metrics)

    If value > budget:
      errors.push({
        code: "E511",
        metric: metric,
        value: display_value,
        budget: display_budget,
        message: "[metric] [value]s exceeds budget [budget]s"
      })
      status = "FAIL"
    Else:
      status = "PASS"

    Store result: { metric, value, budget, status }
    ```

11. **Determine overall status**:
    ```
    If errors.length > 0:
      overall_status = "fail"
    Else:
      overall_status = "pass"
    ```

### Phase 4: Output Generation

12. **If --json flag, output JSON**:

    ```json
    {
      "validator": "lighthouse",
      "url": "[url]",
      "status": "[pass|fail]",
      "conditional": {
        "enabled": [true|false],
        "web_files_changed": [N],
        "executed": true
      },
      "categories": {
        "performance": { "score": [N], "budget": [N], "status": "[pass|fail]" },
        "seo": { "score": [N], "budget": [N], "status": "[pass|fail]" },
        "accessibility": { "score": [N], "budget": [N], "status": "[pass|fail]" },
        "best-practices": { "score": [N], "budget": [N], "status": "[pass|fail]" }
      },
      "metrics": {
        "first-contentful-paint": { "value": [N], "budget": [N], "status": "[pass|fail]" },
        "largest-contentful-paint": { "value": [N], "budget": [N], "status": "[pass|fail]" },
        "cumulative-layout-shift": { "value": [N], "budget": [N], "status": "[pass|fail]" },
        "total-blocking-time": { "value": [N], "budget": [N], "status": "[pass|fail]" }
      },
      "errors": [
        { "code": "E510", "message": "[message]" },
        { "code": "E511", "message": "[message]" }
      ],
      "execution_time_ms": [N],
      "summary": "[N] failed, [N] passed"
    }
    ```

13. **Otherwise, output markdown report**:

    ```
    ## Lighthouse Audit Report

    **URL**: [url]
    **Conditional**: [N web files changed | disabled]

    ### Category Scores
    | Category | Score | Budget | Status |
    |----------|-------|--------|--------|
    | Performance | [N] | [N] | [PASS|FAIL] |
    | SEO | [N] | [N] | [PASS|FAIL] |
    | Accessibility | [N] | [N] | [PASS|FAIL] |
    | Best Practices | [N] | [N] | [PASS|FAIL] |

    ### Metric Details
    | Metric | Value | Budget | Status |
    |--------|-------|--------|--------|
    | FCP | [N]s | [N]s | [PASS|FAIL] |
    | LCP | [N]s | [N]s | [PASS|FAIL] |
    | CLS | [N] | [N] | [PASS|FAIL] |
    | TBT | [N]ms | [N]ms | [PASS|FAIL] |

    ### Errors
    [For each error:]
    [E510] [category] score [N] below budget [N]
    [E511] [metric] [value] exceeds budget [budget]

    ---

    Summary: [N] failed, [N] passed
    ```

14. **If --verbose, add performance info**:
    ```
    Performance: Lighthouse completed in [X.XX]s
    ```

### Phase 5: Exit Code

15. **Determine exit code**:
    ```
    If any fatal errors (E1XX, E2XX):
      Exit 2
    Else if any budget violations (errors.length > 0):
      Exit 1
    Else:
      Exit 0
    ```

## Error Codes

| Code | Description | Exit |
|------|-------------|------|
| E101 | Lighthouse CLI not found | 2 |
| E200 | Lighthouse execution failed/timeout | 2 |
| E510 | Category score below budget | 1 |
| E511 | Metric value exceeds budget | 1 |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All budgets passed (or skipped due to --changed) |
| 1 | One or more budget violations |
| 2 | Fatal error (CLI not found, execution failed, etc.) |

## Budget Defaults

### Category Budgets

| Category | Default | Error Code |
|----------|---------|------------|
| Performance | 80 | E510 |
| SEO | 90 | E510 |
| Accessibility | 85 | E510 |
| Best Practices | 80 | E510 |

### Metric Budgets

| Metric | Default | Unit | Error Code |
|--------|---------|------|------------|
| First Contentful Paint | 1800 | ms | E511 |
| Largest Contentful Paint | 2500 | ms | E511 |
| Cumulative Layout Shift | 0.1 | score | E511 |
| Total Blocking Time | 200 | ms | E511 |

## Custom Budget File

Create a `lighthouse-budget.json` file to customize budgets:

```json
{
  "categories": {
    "performance": 85,
    "seo": 95,
    "accessibility": 90,
    "best-practices": 85
  },
  "metrics": {
    "first-contentful-paint": 1500,
    "largest-contentful-paint": 2000,
    "cumulative-layout-shift": 0.05,
    "total-blocking-time": 150
  }
}
```

## Examples

### Basic audit
```
/seo-validate-lighthouse http://localhost:3000
```

### Pre-commit mode (fast - skips if no web changes)
```
/seo-validate-lighthouse http://localhost:3000 --changed
```

### Custom budget file
```
/seo-validate-lighthouse http://localhost:3000 --budget lighthouse-budget.json
```

### JSON output for CI/CD
```
/seo-validate-lighthouse http://localhost:3000 --json
```

### Verbose output with timing
```
/seo-validate-lighthouse http://localhost:3000 --verbose
```

### Combined flags
```
/seo-validate-lighthouse http://localhost:3000 --changed --budget lighthouse-budget.json --json
```

### With screenshot capture
```
/seo-validate-lighthouse https://example.com --screenshot
```

### Full visual audit
```
/seo-validate-lighthouse https://example.com --screenshot --verbose
```

**Note**: `--screenshot` requires Playwright MCP. If unavailable, the command continues without visual capture.

## Reference Skills

- `seo-validation`: Error codes and validation patterns
- `seo-validation/visual-testing`: Screenshot capture and baseline comparison
- `error-handling`: Standardized error format

## Performance Notes

- **Execution time**: ~3 seconds typical (within 5s pre-commit budget)
- **Conditional mode**: <0.1s when no web files changed (git diff only)
- **CI optimization**: Consider caching Lighthouse results for repeat runs
