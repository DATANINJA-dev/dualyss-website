# GitHub Actions SEO Patterns

Workflow templates and patterns for integrating SEO validation into GitHub Actions CI/CD pipelines.

## Workflow Structure

### Basic SEO Validation Workflow

```yaml
# .github/workflows/seo-validation.yml
name: SEO Validation
on:
  pull_request:
    paths:
      - '**/*.html'
      - '**/*.tsx'
      - '**/*.jsx'
      - '**/*.vue'
      - 'public/**'
      - 'robots.txt'
      - 'sitemap.xml'

jobs:
  seo-lint:
    name: SEO Lint
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

      - name: Run SEO validation
        run: npm run seo:validate
        continue-on-error: false

      - name: Upload SEO report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: seo-report
          path: reports/seo-validation.json
          retention-days: 30
```

## Job Patterns

### 1. SEO Lint Job (Fast, Blocking)

Validates SEO fundamentals without external API calls:

```yaml
seo-lint:
  name: SEO Lint
  runs-on: ubuntu-latest
  timeout-minutes: 5
  steps:
    - uses: actions/checkout@v4

    - name: Validate robots.txt
      run: |
        if [ -f robots.txt ]; then
          # Check for common mistakes
          if grep -q "Disallow: /" robots.txt && ! grep -q "Allow:" robots.txt; then
            echo "::error::robots.txt blocks all crawlers"
            exit 1
          fi
        fi

    - name: Validate sitemap.xml
      run: |
        if [ -f sitemap.xml ]; then
          xmllint --noout sitemap.xml || exit 1
        fi

    - name: Check meta tags
      run: npm run seo:lint
```

### 2. Lighthouse Audit Job (Thorough, Conditional)

Runs full Lighthouse audit on staging deployments:

```yaml
lighthouse-audit:
  name: Lighthouse Audit
  runs-on: ubuntu-latest
  needs: [build, deploy-preview]
  if: github.event_name == 'pull_request'
  timeout-minutes: 15
  steps:
    - uses: actions/checkout@v4

    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v11
      with:
        urls: |
          ${{ needs.deploy-preview.outputs.preview_url }}
          ${{ needs.deploy-preview.outputs.preview_url }}/about
          ${{ needs.deploy-preview.outputs.preview_url }}/contact
        budgetPath: ./lighthouse-budget.json
        uploadArtifacts: true
        temporaryPublicStorage: true

    - name: Comment on PR
      if: always()
      uses: actions/github-script@v7
      with:
        script: |
          const fs = require('fs');
          const results = JSON.parse(fs.readFileSync('.lighthouseci/manifest.json'));
          // Generate comment with Lighthouse scores
```

### 3. Structured Data Validation Job

Validates JSON-LD and schema.org markup:

```yaml
structured-data:
  name: Structured Data Validation
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Extract JSON-LD
      run: |
        find . -name "*.html" -exec grep -l "application/ld+json" {} \; | \
        while read file; do
          echo "Validating: $file"
          # Extract and validate JSON-LD blocks
        done

    - name: Validate schema.org types
      run: npm run seo:validate-schema
```

### 4. Hreflang Validation Job

Validates multi-language SEO configuration:

```yaml
hreflang-check:
  name: Hreflang Validation
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Check bidirectional links
      run: |
        npm run seo:validate-hreflang
      env:
        STRICT_MODE: true

    - name: Verify x-default fallback
      run: |
        # Ensure x-default is present on all language variants
        npm run seo:check-xdefault
```

## Conditional Execution Patterns

### Skip on Documentation Changes

```yaml
on:
  pull_request:
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - '.github/*.md'
```

### Skip Lighthouse for Draft PRs

```yaml
lighthouse-audit:
  if: |
    github.event.pull_request.draft == false &&
    contains(github.event.pull_request.labels.*.name, 'needs-lighthouse') != false
```

### Run on Schedule (Regression Testing)

```yaml
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  workflow_dispatch:     # Manual trigger
```

## Matrix Strategy Patterns

### Multi-Page Lighthouse

```yaml
lighthouse-matrix:
  strategy:
    matrix:
      page:
        - { name: 'home', path: '/' }
        - { name: 'about', path: '/about' }
        - { name: 'blog', path: '/blog' }
        - { name: 'product', path: '/products/example' }
    fail-fast: false
  steps:
    - name: Audit ${{ matrix.page.name }}
      uses: treosh/lighthouse-ci-action@v11
      with:
        urls: ${{ env.STAGING_URL }}${{ matrix.page.path }}
```

### Multi-Environment Testing

```yaml
seo-validation:
  strategy:
    matrix:
      environment:
        - staging
        - production
      include:
        - environment: staging
          url: https://staging.example.com
          strict: false
        - environment: production
          url: https://example.com
          strict: true
```

## Caching Patterns

### Cache npm Dependencies

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

### Cache Lighthouse Results

```yaml
- name: Cache Lighthouse
  uses: actions/cache@v4
  with:
    path: .lighthouseci
    key: lighthouse-${{ github.sha }}
    restore-keys: |
      lighthouse-
```

### Cache SEO Validation Results

```yaml
- name: Cache SEO Reports
  uses: actions/cache@v4
  with:
    path: reports/seo-*.json
    key: seo-reports-${{ hashFiles('**/*.html', '**/*.tsx') }}
```

## Artifact Patterns

### Upload SEO Report

```yaml
- name: Upload SEO Report
  uses: actions/upload-artifact@v4
  with:
    name: seo-report-${{ github.run_number }}
    path: |
      reports/seo-validation.json
      reports/lighthouse-*.html
    retention-days: 30
```

### Download and Compare Reports

```yaml
- name: Download baseline
  uses: dawidd6/action-download-artifact@v3
  with:
    workflow: seo-validation.yml
    branch: main
    name: seo-report-baseline

- name: Compare with baseline
  run: npm run seo:compare -- baseline.json current.json
```

## PR Comment Patterns

### Lighthouse Score Summary

```yaml
- name: Comment Lighthouse Results
  uses: actions/github-script@v7
  with:
    script: |
      const scores = require('./.lighthouseci/manifest.json');
      const body = `
      ## Lighthouse Results

      | Page | Performance | SEO | Accessibility |
      |------|-------------|-----|---------------|
      ${scores.map(s => `| ${s.url} | ${s.performance} | ${s.seo} | ${s.accessibility} |`).join('\n')}

      ${scores.some(s => s.seo < 90) ? '⚠️ SEO score below 90' : '✅ All SEO scores passing'}
      `;

      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: body
      });
```

## Error Handling Patterns

### Fail with SEO Context

```yaml
- name: SEO Validation
  run: npm run seo:validate
  continue-on-error: false

- name: Report Failure
  if: failure()
  run: |
    echo "::error title=SEO Validation Failed::Check the SEO report artifact for details"
    echo "::error file=robots.txt::E506: Robots.txt may be blocking crawlers"
```

### Exit Code Mapping

| npm script exit | GitHub Action | SEO Meaning |
|----------------|---------------|-------------|
| 0 | success | All checks passed |
| 1 | failure | SEO validation errors (E500-E509) |
| 2 | failure | External service errors (E550-E559) |

## Complete Workflow Example

```yaml
# .github/workflows/seo-ci.yml
name: SEO CI/CD Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  # Fast lint (always runs)
  seo-lint:
    name: SEO Lint
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run seo:lint
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: seo-lint-report
          path: reports/seo-lint.json

  # Thorough audit (PRs only)
  lighthouse:
    name: Lighthouse Audit
    runs-on: ubuntu-latest
    needs: [seo-lint]
    if: github.event_name == 'pull_request'
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: .lighthouserc.json
          uploadArtifacts: true

  # Deployment gate (main branch)
  deploy-gate:
    name: SEO Deploy Gate
    runs-on: ubuntu-latest
    needs: [seo-lint]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run seo:validate -- --strict
        env:
          SEO_GATE_MODE: blocking
```

## Related Patterns

- **Pre-commit hooks**: See `pre-commit-design.md` for local validation
- **Deployment gates**: See `deployment-gates.md` for blocking criteria
- **Lighthouse CI**: See `lighthouse-ci.md` for budget configuration
- **Test patterns**: See `tdd-workflow/seo-patterns.md` for test code
