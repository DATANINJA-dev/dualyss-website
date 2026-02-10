# Lighthouse CI Integration Patterns

Configuration and assertion patterns for integrating Lighthouse CI into SEO validation pipelines.

## Overview

Lighthouse CI provides automated performance and SEO auditing with budget enforcement and trend tracking.

```
┌─────────────────────────────────────────────────────────────┐
│                   Lighthouse CI Pipeline                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Collect ──► Assert ──► Upload ──► Compare ──► Report       │
│     │          │          │          │           │          │
│   Run LH    Check      Store      Trend       PR/Slack      │
│   audits    budgets    results    analysis    comments      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Configuration Files

### lighthouserc.json (Recommended)

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/about",
        "http://localhost:3000/products",
        "http://localhost:3000/contact"
      ],
      "startServerCommand": "npm run start",
      "startServerReadyPattern": "ready on",
      "startServerReadyTimeout": 30000,
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "throttling": {
          "cpuSlowdownMultiplier": 1
        }
      }
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:performance": ["warn", { "minScore": 0.8 }],
        "categories:best-practices": ["warn", { "minScore": 0.8 }],

        "meta-description": "error",
        "document-title": "error",
        "html-has-lang": "error",
        "canonical": "error",
        "robots-txt": "error",
        "hreflang": "error",

        "is-crawlable": "error",
        "http-status-code": "error",
        "link-text": "warn",
        "crawlable-anchors": "warn"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### Budget Configuration (lighthouse-budget.json)

```json
[
  {
    "path": "/*",
    "resourceSizes": [
      { "resourceType": "document", "budget": 50 },
      { "resourceType": "script", "budget": 300 },
      { "resourceType": "stylesheet", "budget": 100 },
      { "resourceType": "image", "budget": 500 },
      { "resourceType": "font", "budget": 100 },
      { "resourceType": "total", "budget": 1000 }
    ],
    "resourceCounts": [
      { "resourceType": "script", "budget": 10 },
      { "resourceType": "stylesheet", "budget": 5 },
      { "resourceType": "font", "budget": 4 }
    ],
    "timings": [
      { "metric": "first-contentful-paint", "budget": 2000 },
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "cumulative-layout-shift", "budget": 0.1 },
      { "metric": "total-blocking-time", "budget": 300 },
      { "metric": "interactive", "budget": 3500 }
    ]
  },
  {
    "path": "/products/*",
    "timings": [
      { "metric": "largest-contentful-paint", "budget": 3000 },
      { "metric": "interactive", "budget": 4000 }
    ]
  }
]
```

## Budget Presets (TASK-153)

Pre-configured budget files are available in `.claude/skills/seo-validation/budgets/`:

### Available Presets

| Preset | File | Target Use Case |
|--------|------|-----------------|
| **Default** | `budgets/default.json` | Standard projects, balanced thresholds |
| **Strict** | `budgets/strict.json` | Competitive SEO, position 1 targeting |

### Preset Comparison

| Metric | Default | Strict | Notes |
|--------|---------|--------|-------|
| LCP | 2500ms | 1500ms | Default: Google "good"; Strict: top rankings |
| CLS | 100 (0.1) | 50 (0.05) | Default: acceptable; Strict: minimal shift |
| INP | 200ms | 100ms | Default: responsive; Strict: instant |
| Total Size | 1000KB | 500KB | Default: feature-rich; Strict: lean |
| Script Count | 15 | 10 | Default: SPAs; Strict: minimal JS |
| Third-Party | 10 | 5 | Default: analytics+; Strict: essential |

### When to Use Each Preset

**Default Preset**:
- New projects without performance baseline
- Feature-rich applications (e-commerce, dashboards)
- Projects with many third-party integrations
- Teams starting performance optimization

**Strict Preset**:
- SEO-critical landing pages
- High-competition keywords targeting position 1
- Mobile-first projects
- Performance-focused teams

### Using Presets in lighthouserc.json

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/"],
      "startServerCommand": "npm run start"
    },
    "assert": {
      "budgetPath": "./.claude/skills/seo-validation/budgets/default.json"
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### Using Presets with CLI

```bash
# Use default budget
lhci autorun --assert.budgetPath=./.claude/skills/seo-validation/budgets/default.json

# Use strict budget for competitive pages
lhci autorun --assert.budgetPath=./.claude/skills/seo-validation/budgets/strict.json
```

### Custom Budget Creation

For project-specific needs, copy a preset and modify:

```bash
# Copy default as starting point
cp .claude/skills/seo-validation/budgets/default.json ./lighthouse-budget.json

# Edit values as needed
# Then reference your custom file
lhci autorun --assert.budgetPath=./lighthouse-budget.json
```

See `seo-validation/SKILL.md` for complete custom budget documentation.

## SEO-Specific Assertions

### Required SEO Audits (Blocking)

```json
{
  "assert": {
    "assertions": {
      "meta-description": "error",
      "document-title": "error",
      "canonical": "error",
      "robots-txt": "error",
      "is-crawlable": "error",
      "http-status-code": "error",
      "html-has-lang": "error"
    }
  }
}
```

| Audit | Assertion | Rationale |
|-------|-----------|-----------|
| `meta-description` | error | Critical for SERP display |
| `document-title` | error | Primary ranking signal |
| `canonical` | error | Prevents duplicate content |
| `robots-txt` | error | Crawler access control |
| `is-crawlable` | error | Page must be indexable |
| `http-status-code` | error | Must return 200 |
| `html-has-lang` | error | Required for i18n |

### Recommended SEO Audits (Warning)

```json
{
  "assert": {
    "assertions": {
      "link-text": "warn",
      "crawlable-anchors": "warn",
      "structured-data-presence": "warn",
      "hreflang": "warn",
      "plugins": "warn",
      "tap-targets": "warn"
    }
  }
}
```

### Score Thresholds

```json
{
  "assert": {
    "assertions": {
      "categories:seo": ["error", { "minScore": 0.9 }],
      "categories:accessibility": ["error", { "minScore": 0.9 }],
      "categories:performance": ["warn", { "minScore": 0.8 }],
      "categories:best-practices": ["warn", { "minScore": 0.8 }]
    }
  }
}
```

| Category | Error Threshold | Warning Threshold | Target |
|----------|----------------|-------------------|--------|
| SEO | < 0.5 (50) | < 0.9 (90) | >= 0.9 |
| Accessibility | < 0.5 (50) | < 0.9 (90) | >= 0.9 |
| Performance | < 0.4 (40) | < 0.8 (80) | >= 0.8 |
| Best Practices | < 0.5 (50) | < 0.8 (80) | >= 0.8 |

## GitHub Actions Integration

### Basic Lighthouse CI Workflow

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lighthouse:
    name: Lighthouse Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: ./lighthouserc.json
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### With PR Comments

```yaml
- name: Run Lighthouse CI
  id: lighthouse
  uses: treosh/lighthouse-ci-action@v11
  with:
    configPath: ./lighthouserc.json
    uploadArtifacts: true
    temporaryPublicStorage: true

- name: Format Lighthouse Score
  id: format
  uses: actions/github-script@v7
  with:
    script: |
      const results = ${{ steps.lighthouse.outputs.manifest }};
      const links = ${{ steps.lighthouse.outputs.links }};

      const formatScore = (score) => {
        if (score >= 0.9) return `🟢 ${Math.round(score * 100)}`;
        if (score >= 0.5) return `🟡 ${Math.round(score * 100)}`;
        return `🔴 ${Math.round(score * 100)}`;
      };

      let comment = '## Lighthouse Results\n\n';
      comment += '| URL | Performance | SEO | Accessibility | Best Practices |\n';
      comment += '|-----|-------------|-----|---------------|----------------|\n';

      for (const [url, link] of Object.entries(links)) {
        const result = results.find(r => r.url === url);
        if (result) {
          comment += `| [${new URL(url).pathname}](${link}) `;
          comment += `| ${formatScore(result.summary.performance)} `;
          comment += `| ${formatScore(result.summary.seo)} `;
          comment += `| ${formatScore(result.summary.accessibility)} `;
          comment += `| ${formatScore(result.summary['best-practices'])} |\n`;
        }
      }

      return comment;

- name: Comment PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: ${{ steps.format.outputs.result }}
      });
```

### Multi-Environment Testing

```yaml
lighthouse:
  strategy:
    matrix:
      environment:
        - name: desktop
          preset: desktop
          formFactor: desktop
        - name: mobile
          preset: perf
          formFactor: mobile
    fail-fast: false

  steps:
    - name: Lighthouse (${{ matrix.environment.name }})
      uses: treosh/lighthouse-ci-action@v11
      with:
        urls: |
          ${{ env.STAGING_URL }}
          ${{ env.STAGING_URL }}/products
        configPath: ./lighthouserc.json
        runs: 3
        uploadArtifacts: true
```

## Trend Analysis

### Historical Comparison

```yaml
# lighthouserc.json
{
  "ci": {
    "upload": {
      "target": "lhci",
      "serverBaseUrl": "https://your-lhci-server.com",
      "token": "$LHCI_TOKEN"
    },
    "assert": {
      "assertions": {
        "categories:seo": [
          "error",
          {
            "minScore": 0.9,
            "aggregationMethod": "median-run"
          }
        ]
      }
    }
  }
}
```

### Regression Detection

```json
{
  "assert": {
    "assertions": {
      "categories:seo": [
        "error",
        {
          "minScore": 0,
          "maxNumericValueDelta": -0.05
        }
      ],
      "largest-contentful-paint": [
        "warn",
        {
          "maxNumericValue": 0,
          "maxNumericValueDelta": 500
        }
      ]
    }
  }
}
```

| Assertion | Meaning |
|-----------|---------|
| `maxNumericValueDelta: -0.05` | Block if score drops > 5 points |
| `maxNumericValueDelta: 500` | Warn if LCP increases > 500ms |

## Custom Audits for SEO

### Adding Custom Audits

```javascript
// custom-audits/json-ld-validation.js
module.exports = {
  meta: {
    id: 'json-ld-validation',
    title: 'JSON-LD structured data is valid',
    failureTitle: 'JSON-LD structured data has errors',
    description: 'Validates JSON-LD structured data against schema.org'
  },
  audit(artifacts) {
    const scripts = artifacts.ScriptElements.filter(
      s => s.type === 'application/ld+json'
    );

    if (scripts.length === 0) {
      return {
        score: 0,
        displayValue: 'No JSON-LD found'
      };
    }

    // Validation logic here
    const errors = validateJsonLd(scripts);

    return {
      score: errors.length === 0 ? 1 : 0,
      displayValue: errors.length === 0
        ? `${scripts.length} valid JSON-LD blocks`
        : `${errors.length} validation errors`
    };
  }
};
```

### Lighthouse Configuration for Custom Audits

```json
{
  "ci": {
    "collect": {
      "settings": {
        "plugins": ["./custom-audits/json-ld-validation.js"]
      }
    },
    "assert": {
      "assertions": {
        "json-ld-validation": "error"
      }
    }
  }
}
```

## Presets

### SEO-Focused Preset

```json
{
  "ci": {
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:seo": ["error", { "minScore": 0.9 }],

        "meta-description": "error",
        "document-title": "error",
        "canonical": "error",
        "robots-txt": "error",
        "is-crawlable": "error",
        "http-status-code": "error",
        "html-has-lang": "error",
        "hreflang": "error",

        "link-text": "warn",
        "crawlable-anchors": "warn",
        "tap-targets": "warn",
        "font-size": "warn",

        "categories:performance": "off",
        "categories:accessibility": "off",
        "categories:best-practices": "off"
      }
    }
  }
}
```

### Full SEO + Performance Preset

```json
{
  "ci": {
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:performance": ["warn", { "minScore": 0.8 }],
        "categories:best-practices": ["warn", { "minScore": 0.8 }],

        "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Server timeout | Slow startup | Increase `startServerReadyTimeout` |
| Inconsistent scores | Network variance | Use `numberOfRuns: 5` with `aggregationMethod: "median"` |
| Missing audits | Old Lighthouse version | Update `@lhci/cli` package |
| Chrome errors | Missing dependencies | Install Chromium: `npx playwright install chromium` |

### Debug Mode

```bash
# Run with debug output
LHCI_DEBUG=1 lhci autorun

# Verbose output
lhci autorun --config=./lighthouserc.json --verbose

# Open report in browser
lhci open
```

### Score Variance Mitigation

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 5,
      "settings": {
        "throttlingMethod": "simulate",
        "throttling": {
          "rttMs": 40,
          "throughputKbps": 10240,
          "cpuSlowdownMultiplier": 1
        }
      }
    },
    "assert": {
      "aggregationMethod": "median-run"
    }
  }
}
```

## Exit Codes

| Exit Code | Meaning | SEO Context |
|-----------|---------|-------------|
| 0 | All assertions pass | SEO checks passed |
| 1 | Assertion failures | SEO issues found |
| 2 | System/configuration error | Tool failure |

Map to E5XX codes:
- Exit 1 → E508 (Lighthouse SEO validation failure)
- Exit 2 → E550 (External service error)

## Related Patterns

- **GitHub Actions**: See `github-actions-patterns.md` for CI integration
- **Deployment gates**: See `deployment-gates.md` for blocking criteria
- **Pre-commit hooks**: See `pre-commit-design.md` for local validation
- **Error codes**: See `error-handling/error-codes.md` for E5XX reference
