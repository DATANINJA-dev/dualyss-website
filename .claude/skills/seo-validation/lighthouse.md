# lighthouse

## Purpose

Validate web page performance and SEO scores against defined budgets using Google Lighthouse CLI. Enforces thresholds for Core Web Vitals and SEO audit categories.

## When to Use

- Implementing `/seo-validate-lighthouse` command
- Adding Lighthouse checks to pre-commit hooks
- Validating performance budgets before deployment
- Auditing SEO compliance via CLI

## External Dependencies

| Tool | Version | Install |
|------|---------|---------|
| Lighthouse CLI | >= 11.0 | `npm install -g lighthouse` |
| Chrome/Chromium | >= 100 | Required for headless execution |

### Installation Check

```bash
# Verify installation
lighthouse --version

# If not installed
npm install -g lighthouse
```

## Validation Rules

### Performance Budgets

| Metric | Threshold | Severity |
|--------|-----------|----------|
| Performance Score | >= 90 | ERROR if below |
| SEO Score | >= 90 | ERROR if below |
| First Contentful Paint | < 1.8s | WARN if exceeded |
| Largest Contentful Paint | < 2.5s | ERROR if exceeded |
| Cumulative Layout Shift | < 0.1 | WARN if exceeded |
| Time to Interactive | < 3.8s | WARN if exceeded |

### SEO Audit Categories

Lighthouse SEO audits cover:

1. **Help Search Engines Understand**
   - Meta description present and valid length
   - Valid hreflang attributes
   - Canonical URL specified
   - Descriptive link text

2. **Help Search Engines Crawl**
   - Valid robots.txt
   - HTTP status codes (200, not 4xx/5xx)
   - No blocked resources
   - No plugin content

3. **Mobile Optimization**
   - Font legibility (>= 12px)
   - Tap targets sized (>= 48px)
   - Viewport configured

## Execution Patterns

### CLI Execution

```bash
# Run Lighthouse with JSON output
lighthouse https://example.com \
  --output=json \
  --output-path=./lighthouse-report.json \
  --chrome-flags="--headless" \
  --only-categories=performance,seo

# Parse scores
jq '.categories.performance.score * 100' lighthouse-report.json
jq '.categories.seo.score * 100' lighthouse-report.json
```

### Node API (Programmatic)

```javascript
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    port: chrome.port,
    onlyCategories: ['performance', 'seo']
  };

  const result = await lighthouse(url, options);
  await chrome.kill();

  return {
    performance: result.lhr.categories.performance.score * 100,
    seo: result.lhr.categories.seo.score * 100
  };
}
```

## Conditional Execution

**CRITICAL**: Lighthouse takes 3-4 seconds to run. Only execute when web files changed.

### Pre-Commit Condition

```bash
# Check if HTML/CSS/JS files are staged
changed_files=$(git diff --cached --name-only)

if echo "$changed_files" | grep -qE '\.(html|css|js|jsx|tsx|vue|svelte)$'; then
  echo "Web files changed - running Lighthouse"
  lighthouse $URL --only-categories=seo
else
  echo "No web files changed - skipping Lighthouse"
fi
```

### File Patterns to Watch

| Pattern | Description |
|---------|-------------|
| `*.html` | HTML templates |
| `*.css`, `*.scss`, `*.less` | Stylesheets |
| `*.js`, `*.jsx`, `*.ts`, `*.tsx` | JavaScript/TypeScript |
| `*.vue`, `*.svelte` | Component files |
| `public/**/*` | Public assets |

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| E510 | Lighthouse budget exceeded | Performance or SEO score below threshold |
| E511 | Performance score below threshold | Performance < 90 |
| E550 | Lighthouse API unavailable | Chrome not installed or crashed |
| E551 | Lighthouse timeout | Execution exceeded 30s |

## Validation Result

```json
{
  "validator": "lighthouse",
  "status": "fail",
  "score": 85,
  "execution_time_ms": 3200,
  "errors": [
    {
      "code": "E511",
      "message": "Performance score below threshold",
      "location": "https://example.com",
      "context": "Score: 85 (required: >= 90)",
      "fix": "Optimize LCP, reduce JavaScript bundle size"
    }
  ],
  "warnings": [
    {
      "code": "W001",
      "message": "CLS above recommended",
      "context": "CLS: 0.15 (recommended: < 0.1)"
    }
  ],
  "details": {
    "performance": 85,
    "seo": 92,
    "fcp": 1.5,
    "lcp": 2.8,
    "cls": 0.15,
    "tti": 3.2
  },
  "summary": "1 error, 1 warning"
}
```

## Performance Budget

- **Execution time**: 3.0s maximum (within 5s pre-commit budget)
- **Memory**: ~500MB (Chrome headless)
- **CPU**: High during execution

## Best Practices

1. **Cache Results**: Don't re-run if page hasn't changed
2. **Headless Mode**: Always use `--chrome-flags="--headless"`
3. **Limit Categories**: Only audit `performance,seo` for speed
4. **Skip on CI**: Consider separate CI job for full Lighthouse
5. **Local URLs**: Test against `localhost` for pre-commit

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Chrome not found | Install Chrome or set `CHROME_PATH` |
| Timeout errors | Increase timeout or reduce page complexity |
| Permission denied | Run with appropriate permissions |
| Port conflicts | Use `--port=0` for random port |

## See Also

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/overview/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
