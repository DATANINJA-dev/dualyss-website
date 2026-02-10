# Deployment Gates for SEO Validation

Patterns for blocking deployments based on SEO validation results to prevent ranking drops.

## Gate Framework

### Red/Yellow/Green Classification

```
┌─────────────────────────────────────────────────────────────┐
│                    SEO Deployment Gate                      │
├─────────────────────────────────────────────────────────────┤
│  🔴 RED (Critical) - BLOCKS Deployment                      │
│  ├── robots.txt disallows all crawlers                      │
│  ├── Missing canonical on critical pages                    │
│  ├── Lighthouse SEO score < 50                              │
│  ├── sitemap.xml returns 4xx/5xx                            │
│  └── Broken hreflang bidirectional links                    │
├─────────────────────────────────────────────────────────────┤
│  🟡 YELLOW (Warning) - ALLOWS with Notification             │
│  ├── Missing Open Graph tags                                │
│  ├── Title length outside 30-60 chars                       │
│  ├── Meta description outside 120-160 chars                 │
│  ├── Lighthouse SEO score 50-89                             │
│  └── Missing JSON-LD structured data                        │
├─────────────────────────────────────────────────────────────┤
│  🟢 GREEN (Info) - Log Only                                 │
│  ├── Optimization suggestions                               │
│  ├── Minor schema.org improvements                          │
│  └── Alternative image text suggestions                     │
└─────────────────────────────────────────────────────────────┘
```

## Critical Failures (RED)

These issues MUST block deployment:

### 1. Crawler Access Blocked

```yaml
# Gate: robots.txt blocks all crawlers
condition: |
  robots.txt contains "Disallow: /" without corresponding "Allow:"
  OR robots.txt contains "Disallow: *"
severity: CRITICAL
error_code: E506
action: BLOCK
message: "Deployment blocked: robots.txt would block all search crawlers"
```

### 2. Missing Canonical Tags

```yaml
# Gate: Critical pages missing canonical
condition: |
  Homepage OR landing pages OR product pages
  missing <link rel="canonical">
severity: CRITICAL
error_code: E503
action: BLOCK
message: "Deployment blocked: Missing canonical tag on critical page"
```

### 3. Catastrophic Lighthouse Score

```yaml
# Gate: Lighthouse SEO score below minimum
condition: |
  Lighthouse SEO category score < 50
severity: CRITICAL
error_code: E508
action: BLOCK
message: "Deployment blocked: Lighthouse SEO score {score} below minimum (50)"
```

### 4. Sitemap Errors

```yaml
# Gate: Sitemap unavailable or malformed
condition: |
  sitemap.xml returns HTTP 4xx/5xx
  OR sitemap.xml fails XML validation
  OR sitemap.xml contains invalid URLs
severity: CRITICAL
error_code: E507
action: BLOCK
message: "Deployment blocked: Sitemap error - {error_details}"
```

### 5. Broken Hreflang

```yaml
# Gate: Hreflang missing return links
condition: |
  Page A declares hreflang to Page B
  BUT Page B does not declare hreflang back to Page A
severity: CRITICAL
error_code: E502
action: BLOCK
message: "Deployment blocked: Broken hreflang relationship {page_a} <-> {page_b}"
```

## Warning Failures (YELLOW)

These issues allow deployment with notification:

### 1. Missing Social Meta Tags

```yaml
# Gate: Missing Open Graph
condition: |
  Missing og:title, og:description, or og:image
severity: WARNING
error_code: E505
action: ALLOW_WITH_NOTIFICATION
message: "Warning: Missing Open Graph tags - social sharing will be suboptimal"
notification:
  channel: slack
  mention: "@seo-team"
```

### 2. Suboptimal Title Length

```yaml
# Gate: Title length outside recommended range
condition: |
  title.length < 30 OR title.length > 60
severity: WARNING
error_code: E501
action: ALLOW_WITH_NOTIFICATION
message: "Warning: Title length {length} chars (recommended: 30-60)"
```

### 3. Meta Description Issues

```yaml
# Gate: Meta description outside recommended range
condition: |
  description.length < 120 OR description.length > 160
  OR description is missing
severity: WARNING
error_code: E500
action: ALLOW_WITH_NOTIFICATION
message: "Warning: Meta description {issue}"
```

### 4. Lighthouse Score Below Target

```yaml
# Gate: Lighthouse SEO score acceptable but not optimal
condition: |
  Lighthouse SEO category score >= 50 AND < 90
severity: WARNING
error_code: E508
action: ALLOW_WITH_NOTIFICATION
message: "Warning: Lighthouse SEO score {score} below target (90)"
```

## Gate Configuration

### GitHub Actions Gate

```yaml
# .github/workflows/seo-gate.yml
name: SEO Deployment Gate

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  seo-gate:
    name: SEO Gate Check
    runs-on: ubuntu-latest
    environment: production  # Requires approval for production
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run SEO validation
        id: seo-check
        run: |
          npm run seo:validate -- --output=json > seo-results.json
          echo "score=$(jq '.lighthouse.seo' seo-results.json)" >> $GITHUB_OUTPUT
          echo "critical=$(jq '.critical | length' seo-results.json)" >> $GITHUB_OUTPUT
          echo "warnings=$(jq '.warnings | length' seo-results.json)" >> $GITHUB_OUTPUT

      - name: Evaluate gate
        run: |
          SCORE=${{ steps.seo-check.outputs.score }}
          CRITICAL=${{ steps.seo-check.outputs.critical }}

          if [ "$CRITICAL" -gt 0 ]; then
            echo "::error::SEO Gate BLOCKED: $CRITICAL critical issues found"
            exit 1
          fi

          if [ "$SCORE" -lt 50 ]; then
            echo "::error::SEO Gate BLOCKED: Lighthouse SEO score $SCORE < 50"
            exit 1
          fi

          if [ "$SCORE" -lt 90 ]; then
            echo "::warning::SEO Gate WARNING: Lighthouse SEO score $SCORE < 90"
          fi

          echo "SEO Gate PASSED: Score $SCORE"

      - name: Notify on warnings
        if: steps.seo-check.outputs.warnings > 0
        uses: slackapi/slack-github-action@v1
        with:
          channel-id: 'seo-alerts'
          slack-message: |
            ⚠️ SEO Deployment Warning

            Branch: ${{ github.ref_name }}
            Commit: ${{ github.sha }}
            Warnings: ${{ steps.seo-check.outputs.warnings }}

            View details: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

### Environment Protection Rules

```yaml
# Configure in GitHub repository settings
# Settings > Environments > production

protection_rules:
  - type: required_reviewers
    reviewers:
      - seo-team
    condition: |
      seo.score < 90 OR seo.warnings > 0

  - type: required_status_checks
    checks:
      - seo-gate
      - lighthouse-audit
```

## Score Thresholds

### Lighthouse Category Thresholds

| Category | Block (<) | Warn (<) | Pass (>=) |
|----------|-----------|----------|-----------|
| SEO | 50 | 90 | 90 |
| Performance | 40 | 80 | 80 |
| Accessibility | 50 | 90 | 90 |
| Best Practices | 50 | 80 | 80 |

### Custom SEO Metric Thresholds

| Metric | Block | Warn | Pass |
|--------|-------|------|------|
| Missing canonicals | > 0 on critical | > 0 on any | 0 |
| Broken hreflang | > 0 | - | 0 |
| Title issues | - | > 5 pages | <= 5 |
| Meta description | - | > 10 pages | <= 10 |
| Missing alt text | - | > 20% images | <= 20% |

## Exception Handling

### Allow-List Patterns

For legitimate exceptions (staging, internal tools, etc.):

```yaml
# seo-gate-config.yaml
exceptions:
  # Paths that skip SEO validation
  skip_paths:
    - /internal/*
    - /admin/*
    - /staging/*
    - /preview/*

  # Pages allowed to block crawlers
  allowed_noindex:
    - /search
    - /login
    - /account/*

  # Branches that skip gate
  skip_branches:
    - feature/*
    - fix/*
    - docs/*
```

### Override Mechanism

```yaml
# In deployment workflow
- name: Check for override
  id: override
  run: |
    # Check commit message for [seo-skip] or [seo-force]
    if git log -1 --pretty=%B | grep -q "\[seo-skip\]"; then
      echo "skip=true" >> $GITHUB_OUTPUT
      echo "::warning::SEO gate skipped by commit message"
    fi

- name: SEO Gate
  if: steps.override.outputs.skip != 'true'
  run: npm run seo:gate
```

### Emergency Override Process

```
Emergency SEO Gate Override Process:

1. NEVER skip for convenience - only for genuine emergencies
2. Require approval from SEO lead AND engineering lead
3. Document reason in deployment notes
4. Create follow-up ticket to fix issues
5. Set deadline for resolution (max 24 hours)
6. Page on-call if not resolved
```

## Rollback Considerations

### Automatic Rollback Triggers

```yaml
# Post-deployment monitoring
rollback_triggers:
  # Trigger rollback if:
  - condition: organic_traffic_drop > 30%
    window: 1h
    action: alert_and_prepare_rollback

  - condition: indexing_errors_spike > 50%
    window: 30m
    action: alert_and_prepare_rollback

  - condition: lighthouse_seo_score_drop > 20
    window: immediate
    action: alert_only  # May be expected for some changes
```

### Rollback Decision Tree

```
Post-Deployment SEO Issue Detected
          │
          ▼
    Is traffic impact > 20%?
          │
    ┌─────┴─────┐
   Yes          No
    │            │
    ▼            ▼
  Rollback   Is issue fixable
  immediately   in < 1 hour?
                  │
            ┌─────┴─────┐
           Yes          No
            │            │
            ▼            ▼
       Hot fix      Rollback +
       forward      schedule fix
```

## Integration with CI/CD

### Pipeline Position

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Pipeline                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Build ──► Test ──► Lint ──► SEO Gate ──► Deploy ──► Monitor│
│                        │                      │              │
│                        │                      │              │
│                    Pre-deploy              Post-deploy       │
│                    validation              validation        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Exit Code Mapping

| Situation | Exit Code | Gate Result |
|-----------|-----------|-------------|
| All checks pass | 0 | PASS |
| Critical issues found | 1 | BLOCK |
| System/tool errors | 2 | BLOCK (fail-safe) |
| Warnings only | 0 | PASS with notification |
| Warnings + `--fail-on-warning` | 1 | BLOCK (strict mode) |

> **Implementation**: For JavaScript/pseudocode implementing this logic, including JSON schema and GitHub Actions annotations format, see `gate-evaluation.md`.

## Notification Templates

### Blocked Deployment

```markdown
🔴 **SEO Gate BLOCKED Deployment**

**Environment**: production
**Branch**: main
**Commit**: abc123

**Critical Issues** (must fix before deploy):
- E506: robots.txt blocks all crawlers
- E503: Missing canonical on /products

**Action Required**: Fix critical issues and re-run pipeline.

**Commands**:
\`\`\`bash
npm run seo:lint      # View all issues
npm run seo:fix       # Auto-fix where possible
\`\`\`
```

### Passed with Warnings

```markdown
🟡 **SEO Gate PASSED with Warnings**

**Environment**: production
**Branch**: main
**Commit**: abc123
**SEO Score**: 85/100

**Warnings** (non-blocking):
- E500: 3 pages missing meta description
- E505: 2 pages missing Open Graph tags

**Recommendation**: Address warnings in next sprint.

**Ticket created**: SEO-123
```

## Related Patterns

- **Gate evaluation logic**: See `gate-evaluation.md` for implementation patterns, JSON schema, and `--fail-on-warning` mode
- **Pre-commit hooks**: See `pre-commit-design.md` for local validation
- **GitHub Actions**: See `github-actions-patterns.md` for workflow setup
- **Lighthouse CI**: See `lighthouse-ci.md` for performance budgets
- **Error codes**: See `error-handling/error-codes.md` for E5XX reference
