# seo-validation

## Type
passive

## Auto-Activation Triggers
- User mentions: "SEO validation", "meta tags", "hreflang", "structured data", "JSON-LD", "Lighthouse SEO"
- When implementing `/seo-validate-*` commands
- During audit of SEO patterns in web projects
- When reviewing page meta tags, Open Graph, or Twitter Cards
- When analyzing multi-language site configuration
- During pre-commit SEO validation

## Description

Provides SEO validation patterns for CLI commands and pre-commit hooks. Covers meta tag validation, hreflang reciprocal linking, structured data (JSON-LD), and Lighthouse performance/SEO budget enforcement.

Use when:
- Implementing SEO validation commands
- Adding SEO checks to pre-commit hooks
- Validating structured data markup
- Checking multi-language hreflang configuration
- Enforcing Lighthouse performance budgets

## Supporting Files

| File | Status | Description |
|------|--------|-------------|
| lighthouse.md | Active | Performance/SEO budget validation patterns |
| budgets/schema.json | Active | JSON schema for budget file validation (TASK-153) |
| budgets/default.json | Active | Standard performance budgets (TASK-153) |
| budgets/strict.json | Active | Strict budgets for competitive SEO (TASK-153) |
| structured-data.md | Active | JSON-LD and schema.org validation |
| hreflang.md | Active | Multi-language reciprocal link validation |
| orthography.md | Active | Content spelling/grammar (TASK-143) |
| languagetool-client.md | Active | Tiered dictionary caching and client (TASK-144) |
| api-clients.md | Active | Unified API client interface for GEO (TASK-138) |
| otterly-client.md | Active | Otterly API integration patterns (TASK-138) |
| profound-client.md | Active | Profound API integration patterns (TASK-138) |
| rate-limiting.md | Active | Rate limiting and backoff patterns (TASK-138) |
| mock-mode.md | Active | Mock client for testing (TASK-138) |
| geo-tracking.md | Deferred | GEO tracking patterns (EPIC-014) |
| ai-crawlers.md | Deferred | AI search crawler optimization (EPIC-014) |
| quality-scoring.md | Active | E-E-A-T, readability, keyword scoring (TASK-145) |

## Validation Result Schema

All validators produce consistent JSON output:

```json
{
  "validator": "hreflang|structured-data|lighthouse|meta",
  "status": "pass|warn|fail",
  "score": 0-100,
  "execution_time_ms": 234,
  "errors": [
    {
      "code": "E502",
      "message": "Invalid hreflang code",
      "location": "index.html:15",
      "context": "hreflang=\"en-US\"",
      "fix": "Use ISO 639-1 codes (e.g., en, es, de)"
    }
  ],
  "warnings": [],
  "summary": "1 error, 0 warnings"
}
```

### Status Values

| Status | Meaning | Exit Code |
|--------|---------|-----------|
| pass | All checks passed | 0 |
| warn | Non-critical issues found | 0 |
| fail | Critical SEO issues detected | 1 |

## Error Codes

SEO validation uses the E5XX error code range. Full reference in `error-handling/error-codes.md`.

### E50X: Content Validation Errors

| Code | Message | Validator |
|------|---------|-----------|
| E500 | Missing meta description | meta |
| E501 | Duplicate title tag | meta |
| E502 | Invalid hreflang | hreflang |
| E503 | Missing canonical URL | meta |
| E504 | Invalid schema.org JSON-LD | structured-data |
| E505 | Missing Open Graph tags | meta |
| E506 | Robots.txt blocks indexing | meta |
| E507 | Missing sitemap reference | meta |
| E508 | Orphaned page detected | hreflang |
| E509 | Broken internal link | meta |

### E53X: Orthography Validation Errors

| Code | Message | Validator |
|------|---------|-----------|
| E530 | Orthography validation failed | orthography |
| E531 | Spelling errors found | orthography |
| E532 | Grammar errors found | orthography |
| E533 | Language not supported | orthography |
| E534 | Content not accessible | orthography |
| E535 | LanguageTool not available | orthography |
| E536 | Hunspell download failed | languagetool-client |
| E537 | Cache corrupted | languagetool-client |

### E42X: Content Quality Validation Errors

| Code | Message | Validator |
|------|---------|-----------|
| E420 | Invalid threshold or parameter value | quality |
| E421 | Score below threshold | quality |
| E422 | Content not accessible | quality |
| E423 | Unable to parse content structure | quality |

### E52X: GEO API Errors

| Code | Message | Validator |
|------|---------|-----------|
| E526 | API authentication failed | geo |
| E527 | API quota exceeded | geo |
| E528 | API service unavailable | geo |
| E529 | No API configured | geo |

### E55X: External Service Errors

| Code | Message | Validator |
|------|---------|-----------|
| E550 | Lighthouse API unavailable | lighthouse |
| E551 | Lighthouse timeout | lighthouse |
| E552 | Schema validator timeout | structured-data |
| E553 | Schema validator error | structured-data |

## External Dependencies

| Tool | Purpose | Install |
|------|---------|---------|
| Lighthouse CLI | Performance/SEO audits | `npm install -g lighthouse` |
| jq | JSON parsing for hreflang | System package manager |
| schema.org validator | JSON-LD validation | Online API or local |
| LanguageTool | Spelling/grammar validation | `java -jar languagetool-server.jar` |

## Performance Budget

Pre-commit hooks must complete within 5 seconds total:

| Validator | Budget | Condition |
|-----------|--------|-----------|
| Meta tags | 0.2s | Always |
| Hreflang | 0.5s | Always |
| Structured data | 0.8s | Always |
| Orthography | 2.0s | Only if content changed |
| Lighthouse | 3.0s | Only if HTML/CSS/JS changed |

## Quick Reference

### Meta Tag Validation
```bash
# Check required meta tags
grep -E '<meta name="description"' index.html
grep -E '<title>' index.html
grep -E '<link rel="canonical"' index.html
```

### Hreflang Validation
```bash
# Extract hreflang links
grep -oP 'hreflang="[^"]*"' index.html | sort -u
```

### Structured Data Validation
```bash
# Extract JSON-LD blocks
grep -oP '<script type="application/ld\+json">.*?</script>' index.html
```

## Integration Points

This skill is consumed by:
- `/seo-validate-meta` command (TASK-128)
- `/seo-validate-hreflang` command (TASK-129)
- `/seo-validate-structured` command (TASK-130)
- `/seo-validate-lighthouse` command (TASK-131)
- `/seo-validate-orthography` command (TASK-143)
- `/seo-validate-quality` command (TASK-145)
- Pre-commit hook integration (TASK-132)
- `set-up-seo.md` agent enhancement (TASK-134)

## Creating Custom Performance Budgets

Performance budgets define thresholds for Core Web Vitals, bundle sizes, and resource counts. Use the presets or create custom configurations.

### Quick Start

1. Copy a preset as starting point:
   ```bash
   cp .claude/skills/seo-validation/budgets/default.json my-budget.json
   ```

2. Modify values in `my-budget.json` to match your requirements

3. Use with Lighthouse CI:
   ```bash
   lhci autorun --assert.budgetPath=./my-budget.json
   ```

### Preset Comparison

| Metric | Default | Strict | Use Case |
|--------|---------|--------|----------|
| LCP | 2500ms | 1500ms | Default: most sites; Strict: competitive SEO |
| CLS | 100 (0.1) | 50 (0.05) | Default: acceptable; Strict: minimal shift |
| INP | 200ms | 100ms | Default: responsive; Strict: instant feel |
| Total Size | 1000KB | 500KB | Default: feature-rich; Strict: lean |
| Scripts | 15 | 10 | Default: SPAs; Strict: minimal JS |
| Third-Party | 10 | 5 | Default: analytics+; Strict: essential only |

### Budget File Structure

```json
{
  "$schema": "./schema.json",
  "budgets": [
    {
      "path": "/*",
      "resourceSizes": [
        { "resourceType": "script", "budget": 300 }
      ],
      "resourceCounts": [
        { "resourceType": "script", "budget": 15 }
      ],
      "timings": [
        { "metric": "largest-contentful-paint", "budget": 2500 }
      ]
    }
  ]
}
```

### Field Reference

**resourceSizes** (in KB):
- `document`: HTML size
- `script`: JavaScript total
- `stylesheet`: CSS total
- `image`: Images total
- `font`: Web fonts
- `total`: All resources combined

**resourceCounts**:
- `script`: Number of JS files
- `stylesheet`: Number of CSS files
- `third-party`: External resources
- `font`: Number of font files

**timings** (in milliseconds):
- `largest-contentful-paint`: Main content visible (LCP)
- `cumulative-layout-shift`: Visual stability (CLS × 1000)
- `interaction-to-next-paint`: Responsiveness (INP)
- `first-contentful-paint`: First render (FCP)
- `time-to-interactive`: Interactive ready (TTI)

### Per-Route Overrides

Create different budgets for different page types:

```json
{
  "budgets": [
    {
      "path": "/*",
      "timings": [{ "metric": "largest-contentful-paint", "budget": 2500 }]
    },
    {
      "path": "/products/*",
      "timings": [{ "metric": "largest-contentful-paint", "budget": 3000 }]
    },
    {
      "path": "/checkout/*",
      "timings": [{ "metric": "largest-contentful-paint", "budget": 2000 }]
    }
  ]
}
```

### Validation

Validate custom budgets against schema:
```bash
# Using Node.js
node -e "JSON.parse(require('fs').readFileSync('my-budget.json'))"

# Using jq
jq '.' my-budget.json
```

### Research Sources

| Metric | Source | Notes |
|--------|--------|-------|
| LCP 2.5s | Google CWV | "Good" threshold |
| LCP 1.5s | Position 1 data | Top ranking correlation |
| CLS 0.1 | Google CWV | "Good" threshold |
| INP 200ms | Google CWV 2026 | New responsive metric |
| 1MB total | HTTP Archive | Median page weight |
