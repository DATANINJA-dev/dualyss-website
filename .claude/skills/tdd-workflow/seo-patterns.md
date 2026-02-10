# SEO Test Patterns

Reference patterns for test-driven development with SEO validation tools.

## When to Use These Patterns

- Building SEO validation commands or tools
- Testing structured data (JSON-LD) generation
- Validating meta tag output
- Testing sitemap/robots.txt generation
- Building SEO audit pipelines

## Mocking vs Real Implementations

The tdd-workflow skill generally advises **avoiding mocks**. For SEO testing, this guidance needs nuance:

### When Mocking is Acceptable

External services with rate limits, costs, or network dependencies:

| Service | Why Mock | Mock Strategy |
|---------|----------|---------------|
| Lighthouse API | Rate limited, slow (30s+) | Fixture JSON responses |
| PageSpeed Insights | API key required, quota limits | Cached response fixtures |
| Schema.org Validator | External dependency | Local validation library |
| Search Console API | Auth required, quota limits | Fixture data |
| Third-party crawlers | Network dependent | HTML fixture serving |

### When to Use Real Implementations

Local operations that don't have external dependencies:

| Operation | Why Real | Approach |
|-----------|----------|----------|
| HTML parsing | Fast, deterministic | Use actual parser (cheerio, BeautifulSoup) |
| JSON-LD generation | Pure function | Test actual output |
| Meta tag extraction | Pure function | Parse real HTML strings |
| URL validation | Pure function | Test actual validation logic |
| Sitemap generation | Pure function | Generate and validate XML |
| Internal link analysis | Pure function | Build actual graph |

### Decision Framework

```
Is the operation network-dependent?
├── YES → Consider mocking
│   ├── Is it rate-limited? → Mock with fixtures
│   ├── Is it slow (>5s)? → Mock for unit tests, real for integration
│   └── Does it require auth? → Mock unless testing auth flow
└── NO → Use real implementation
    ├── Is it a pure function? → Always real
    └── Does it touch local files? → Real with test fixtures
```

---

## 1. Mocking External Services

### Lighthouse API

**Fixture-based mocking** for Lighthouse performance audits:

```typescript
// fixtures/lighthouse-response.json
{
  "lighthouseVersion": "11.0.0",
  "fetchTime": "2026-01-13T10:00:00.000Z",
  "finalUrl": "https://example.com",
  "categories": {
    "performance": { "score": 0.95 },
    "accessibility": { "score": 0.92 },
    "best-practices": { "score": 1.0 },
    "seo": { "score": 0.89 }
  },
  "audits": {
    "meta-description": {
      "id": "meta-description",
      "score": 1,
      "title": "Document has a meta description"
    },
    "document-title": {
      "id": "document-title",
      "score": 1,
      "title": "Document has a <title> element"
    }
  }
}
```

**Test pattern**:

```typescript
// seo-validator.test.ts
import lighthouseFixture from './fixtures/lighthouse-response.json';

// Mock the Lighthouse runner
jest.mock('lighthouse', () => ({
  default: jest.fn().mockResolvedValue(lighthouseFixture)
}));

describe('SEO Validator', () => {
  it('should pass when SEO score meets threshold', async () => {
    const result = await validateSEO('https://example.com', { threshold: 0.8 });
    expect(result.passed).toBe(true);
    expect(result.score).toBe(0.89);
  });

  it('should fail when SEO score below threshold', async () => {
    const result = await validateSEO('https://example.com', { threshold: 0.95 });
    expect(result.passed).toBe(false);
    expect(result.errors).toContain('SEO score 0.89 below threshold 0.95');
  });
});
```

### Schema.org Validator

**Local validation** preferred over external API:

```typescript
// Use schema-dts for TypeScript type checking
// Use ajv for JSON Schema validation

import Ajv from 'ajv';
import { Organization } from 'schema-dts';

const organizationSchema = {
  type: 'object',
  required: ['@context', '@type', 'name'],
  properties: {
    '@context': { const: 'https://schema.org' },
    '@type': { const: 'Organization' },
    'name': { type: 'string', minLength: 1 },
    'url': { type: 'string', format: 'uri' }
  }
};

describe('Schema.org Validation', () => {
  const ajv = new Ajv();
  const validate = ajv.compile(organizationSchema);

  it('should validate correct Organization schema', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Acme Corp',
      'url': 'https://acme.com'
    };
    expect(validate(data)).toBe(true);
  });

  it('should reject schema missing required fields', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Organization'
      // missing 'name'
    };
    expect(validate(data)).toBe(false);
  });
});
```

### Search Console API

**Fixture-based mocking** for Search Console data:

```typescript
// fixtures/search-console-response.json
{
  "rows": [
    {
      "keys": ["https://example.com/page1"],
      "clicks": 150,
      "impressions": 2500,
      "ctr": 0.06,
      "position": 4.2
    }
  ]
}
```

### PageSpeed Insights

Similar pattern to Lighthouse - use fixture responses:

```typescript
// fixtures/pagespeed-response.json
{
  "id": "https://example.com",
  "loadingExperience": {
    "metrics": {
      "LARGEST_CONTENTFUL_PAINT_MS": {
        "percentile": 2500,
        "category": "AVERAGE"
      },
      "CUMULATIVE_LAYOUT_SHIFT_SCORE": {
        "percentile": 10,
        "category": "GOOD"
      }
    }
  }
}
```

---

## 2. Snapshot Testing

### JSON-LD Snapshots

**Use snapshots** to catch unintended changes in structured data output:

```typescript
// json-ld-generator.test.ts
import { generateArticleSchema } from './json-ld-generator';

describe('JSON-LD Generation', () => {
  it('should generate Article schema', () => {
    const article = {
      title: 'Test Article',
      author: 'John Doe',
      datePublished: '2026-01-13',
      description: 'A test article for snapshot testing'
    };

    const schema = generateArticleSchema(article);

    // Snapshot captures exact structure
    expect(schema).toMatchSnapshot();
  });

  it('should generate Organization schema', () => {
    const org = {
      name: 'Acme Corp',
      url: 'https://acme.com',
      logo: 'https://acme.com/logo.png'
    };

    const schema = generateOrganizationSchema(org);
    expect(schema).toMatchSnapshot();
  });
});
```

**Snapshot file** (auto-generated):

```
// __snapshots__/json-ld-generator.test.ts.snap

exports[`JSON-LD Generation should generate Article schema 1`] = `
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Test Article",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "datePublished": "2026-01-13",
  "description": "A test article for snapshot testing"
}
`;
```

### Meta Tag Snapshots

```typescript
// meta-generator.test.ts
describe('Meta Tag Generation', () => {
  it('should generate complete meta tags for page', () => {
    const page = {
      title: 'Product Page',
      description: 'Buy our amazing product',
      image: 'https://example.com/product.jpg',
      url: 'https://example.com/product'
    };

    const metaTags = generateMetaTags(page);
    expect(metaTags).toMatchSnapshot();
  });
});
```

### Robots.txt Snapshots

```typescript
describe('Robots.txt Generation', () => {
  it('should generate robots.txt with sitemap', () => {
    const config = {
      sitemapUrl: 'https://example.com/sitemap.xml',
      disallow: ['/admin', '/api'],
      crawlDelay: 1
    };

    const robotsTxt = generateRobotsTxt(config);
    expect(robotsTxt).toMatchSnapshot();
  });
});
```

### When to Update Snapshots

- **Intentional changes**: Run `jest -u` or `npm test -- -u` to update
- **Review diffs carefully**: Snapshot diffs show exact changes
- **CI enforcement**: Fail CI if snapshots don't match

---

## 3. Fixture Patterns

### HTML Page Fixtures

Create realistic HTML fixtures for testing:

```
fixtures/
├── pages/
│   ├── valid-seo.html          # All SEO elements present
│   ├── missing-meta.html       # No meta description
│   ├── duplicate-title.html    # Multiple <title> tags
│   ├── invalid-hreflang.html   # Malformed hreflang
│   └── no-canonical.html       # Missing canonical URL
├── schemas/
│   ├── valid-organization.json
│   ├── valid-article.json
│   ├── invalid-missing-type.json
│   └── invalid-wrong-context.json
└── responses/
    ├── lighthouse-pass.json
    ├── lighthouse-fail.json
    └── pagespeed-slow.json
```

**Valid SEO fixture**:

```html
<!-- fixtures/pages/valid-seo.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Valid SEO Page - Example Site</title>
  <meta name="description" content="This is a properly optimized page with all SEO elements.">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="canonical" href="https://example.com/valid-seo">

  <!-- Open Graph -->
  <meta property="og:title" content="Valid SEO Page">
  <meta property="og:description" content="This is a properly optimized page.">
  <meta property="og:image" content="https://example.com/image.jpg">
  <meta property="og:url" content="https://example.com/valid-seo">

  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Valid SEO Page",
    "description": "This is a properly optimized page."
  }
  </script>
</head>
<body>
  <h1>Valid SEO Page</h1>
  <p>Content goes here.</p>
</body>
</html>
```

**Missing meta fixture**:

```html
<!-- fixtures/pages/missing-meta.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Without Meta Description</title>
  <!-- Missing: meta description -->
  <!-- Missing: canonical URL -->
  <!-- Missing: Open Graph tags -->
</head>
<body>
  <h1>Incomplete SEO Page</h1>
</body>
</html>
```

### Structured Data Fixtures

```json
// fixtures/schemas/valid-article.json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Write Great Tests",
  "author": {
    "@type": "Person",
    "name": "Jane Developer"
  },
  "datePublished": "2026-01-13",
  "dateModified": "2026-01-13",
  "publisher": {
    "@type": "Organization",
    "name": "Tech Blog",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "image": "https://example.com/article-image.jpg",
  "description": "Learn the best practices for writing maintainable tests."
}
```

```json
// fixtures/schemas/invalid-missing-type.json
{
  "@context": "https://schema.org",
  // Missing "@type" - should trigger E504
  "name": "Invalid Schema"
}
```

### Configuration Fixtures

```txt
# fixtures/robots-valid.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://example.com/sitemap.xml
```

```xml
<!-- fixtures/sitemap-valid.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-01-13</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2026-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 4. Integration Test Patterns

### Validator Pipeline Tests

Test complete validation workflows:

```typescript
describe('SEO Validation Pipeline', () => {
  it('should run all validators and aggregate results', async () => {
    const html = loadFixture('pages/valid-seo.html');

    const result = await runSEOPipeline(html, {
      validators: ['meta', 'schema', 'opengraph', 'hreflang']
    });

    expect(result.passed).toBe(true);
    expect(result.validators.meta.passed).toBe(true);
    expect(result.validators.schema.passed).toBe(true);
    expect(result.validators.opengraph.passed).toBe(true);
  });

  it('should fail pipeline when critical validator fails', async () => {
    const html = loadFixture('pages/missing-meta.html');

    const result = await runSEOPipeline(html, {
      validators: ['meta', 'schema'],
      criticalValidators: ['meta']
    });

    expect(result.passed).toBe(false);
    expect(result.errors).toContain('E500: Missing meta description');
  });
});
```

### Multi-Page Tests

Test site-wide SEO consistency:

```typescript
describe('Site-wide SEO Validation', () => {
  const pages = [
    'fixtures/pages/home.html',
    'fixtures/pages/about.html',
    'fixtures/pages/product.html'
  ];

  it('should validate all pages have unique titles', async () => {
    const titles = await Promise.all(
      pages.map(p => extractTitle(loadFixture(p)))
    );

    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(titles.length);
  });

  it('should validate all pages have canonical URLs', async () => {
    for (const page of pages) {
      const html = loadFixture(page);
      const canonical = extractCanonical(html);
      expect(canonical).toBeDefined();
      expect(canonical).toMatch(/^https:\/\//);
    }
  });
});
```

### Hreflang Validation Tests

Test multilingual SEO setup:

```typescript
describe('Hreflang Validation', () => {
  it('should validate bidirectional hreflang references', async () => {
    const pages = {
      en: loadFixture('pages/home-en.html'),
      es: loadFixture('pages/home-es.html'),
      fr: loadFixture('pages/home-fr.html')
    };

    const result = validateHreflangBidirectional(pages);

    expect(result.valid).toBe(true);
    expect(result.missingReferences).toHaveLength(0);
  });

  it('should detect missing return links', async () => {
    const pages = {
      en: loadFixture('pages/broken-hreflang-en.html'),
      es: loadFixture('pages/broken-hreflang-es.html')
    };

    const result = validateHreflangBidirectional(pages);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('E502: Invalid hreflang');
  });
});
```

---

## 5. CI/CD Patterns

### Pre-Commit Hooks

Validate SEO on every commit:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: seo-validation
        name: SEO Validation
        entry: npm run test:seo
        language: system
        files: \.(html|tsx|jsx)$
        pass_filenames: false
```

### Lighthouse CI

Configure Lighthouse in CI pipeline:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://staging.example.com/
            https://staging.example.com/about
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

**Budget file**:

```json
// lighthouse-budget.json
[
  {
    "path": "/*",
    "options": {
      "performance": 0.9,
      "accessibility": 0.9,
      "best-practices": 0.9,
      "seo": 0.9
    }
  }
]
```

### Scheduled Regression Tests

Run comprehensive SEO tests on schedule:

```yaml
# .github/workflows/seo-regression.yml
name: SEO Regression Tests
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM
  workflow_dispatch:

jobs:
  seo-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run SEO regression suite
        run: npm run test:seo:regression
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: seo-report
          path: reports/seo-regression.html
```

### Test Commands

```json
// package.json scripts
{
  "scripts": {
    "test:seo": "jest --testPathPattern=seo",
    "test:seo:unit": "jest --testPathPattern=seo --testPathIgnorePatterns=integration",
    "test:seo:integration": "jest --testPathPattern=seo/integration",
    "test:seo:regression": "jest --testPathPattern=seo --coverage --json --outputFile=reports/seo-results.json"
  }
}
```

---

## Error Handling

SEO test failures should use the standardized error codes from the error-handling skill:

| Error Code | Test Failure | Example |
|------------|--------------|---------|
| E500 | Missing meta description | `expect.toThrowError('E500')` |
| E501 | Duplicate title | Assert unique titles across pages |
| E502 | Invalid hreflang | Validate language codes |
| E503 | Missing canonical | Check canonical presence |
| E504 | Invalid JSON-LD | Schema validation failure |
| E550 | Lighthouse unavailable | Mock fallback triggered |

**Reference**: `.claude/skills/error-handling/error-codes.md` for complete E5XX codes.

---

## Quick Reference

| Test Type | When to Use | Mock Strategy |
|-----------|-------------|---------------|
| Unit | JSON-LD generation, meta extraction | No mocks needed |
| Snapshot | Output format verification | N/A |
| Integration | Validator pipelines | Mock external APIs |
| E2E | Full page validation | Real browser, mock APIs |
| Regression | Scheduled checks | Production data, mock APIs |

| Framework | Snapshot Command | Update Command |
|-----------|------------------|----------------|
| Jest | `expect().toMatchSnapshot()` | `jest -u` |
| Vitest | `expect().toMatchSnapshot()` | `vitest -u` |
| pytest | `snapshot.assert_match()` | `pytest --snapshot-update` |
