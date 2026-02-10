# structured-data

## Purpose

Validate JSON-LD structured data against schema.org specifications. Ensures proper markup for rich search results and AI-powered search compatibility.

## When to Use

- Implementing `/seo-validate-structured` command
- Validating JSON-LD blocks in HTML pages
- Checking schema.org type compliance
- Preparing pages for Google Rich Results

## External Dependencies

| Tool | Purpose | Source |
|------|---------|--------|
| jq | JSON parsing | System package manager |
| Google Rich Results Test | Online validation | https://search.google.com/test/rich-results |
| Schema.org Validator | Type validation | https://validator.schema.org/ |

## Validation Rules

### Syntax Validation

1. **Valid JSON**: JSON-LD must parse without errors
2. **@context Required**: Must include `"@context": "https://schema.org"`
3. **@type Required**: Must specify a valid schema.org type
4. **No Circular References**: JSON structure must be acyclic

### Common Schema Types

| Type | Required Properties | Recommended Properties |
|------|---------------------|------------------------|
| Article | headline, author, datePublished | image, dateModified, publisher |
| Product | name, description | image, offers, brand, review |
| Organization | name, url | logo, contactPoint, sameAs |
| BreadcrumbList | itemListElement | (none) |
| LocalBusiness | name, address | telephone, openingHours, geo |
| FAQPage | mainEntity | (none) |
| HowTo | name, step | totalTime, estimatedCost |
| Recipe | name, recipeIngredient | image, cookTime, nutrition |

### Property Validation

| Property | Validation |
|----------|------------|
| @context | Must be "https://schema.org" or array containing it |
| @type | Must be valid schema.org type |
| url | Must be valid URL format |
| image | Must be valid URL or ImageObject |
| datePublished | Must be ISO 8601 format |
| author | Must be Person or Organization |

## Extraction Patterns

### Extract JSON-LD from HTML

```bash
# Using grep + sed
grep -oP '<script type="application/ld\+json">\K[^<]*' page.html

# Using jq for validation
cat page.html | \
  grep -oP '<script type="application/ld\+json">\K[^<]*' | \
  jq '.'
```

### Node.js Extraction

```javascript
const cheerio = require('cheerio');

function extractJsonLd(html) {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');

  return scripts.map((i, el) => {
    try {
      return JSON.parse($(el).html());
    } catch (e) {
      return { error: e.message };
    }
  }).get();
}
```

## Validation Algorithm

```
1. Extract all <script type="application/ld+json"> blocks
2. For each block:
   a. Parse JSON (fail if invalid syntax)
   b. Check @context is schema.org
   c. Check @type exists and is valid
   d. Validate required properties for type
   e. Validate property value formats
3. Aggregate results
4. Return validation result
```

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| E504 | Invalid schema.org JSON-LD | Syntax error or missing @context |
| E505 | Missing Open Graph tags | Required OG properties absent |
| E552 | Schema validator timeout | External validation too slow |
| E553 | Schema validator error | External service unavailable |

## Validation Result

```json
{
  "validator": "structured-data",
  "status": "fail",
  "score": 70,
  "execution_time_ms": 450,
  "errors": [
    {
      "code": "E504",
      "message": "Invalid schema.org JSON-LD",
      "location": "index.html:45",
      "context": "Missing required property: datePublished",
      "fix": "Add datePublished in ISO 8601 format (e.g., 2026-01-13)"
    }
  ],
  "warnings": [
    {
      "code": "W002",
      "message": "Missing recommended property",
      "context": "Article schema missing 'image' property"
    }
  ],
  "details": {
    "schemas_found": 2,
    "schemas_valid": 1,
    "types": ["Article", "BreadcrumbList"]
  },
  "summary": "1 error, 1 warning"
}
```

## 2026 AI Search Compatibility

Structured data is now **critical** for visibility in AI-powered search (Google AI Overviews, ChatGPT, Perplexity).

### AI-Optimized Schema Patterns

1. **Detailed Descriptions**: More context helps AI understanding
2. **Hierarchical Structure**: Use nested types (Organization > Person > ContactPoint)
3. **Multiple Schema Types**: Combine Article + BreadcrumbList + Organization
4. **FAQ Schema**: Increases chances of AI citation

### Example: AI-Ready Article Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Complete Guide to SEO Validation",
  "description": "Learn how to validate SEO markup including meta tags, hreflang, and structured data for better search visibility.",
  "author": {
    "@type": "Person",
    "name": "John Doe",
    "url": "https://example.com/author/john"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Example Inc",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2026-01-13",
  "dateModified": "2026-01-13",
  "image": "https://example.com/article-image.jpg",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/seo-validation-guide"
  }
}
```

## Performance Budget

- **Execution time**: 0.8s maximum
- **Memory**: Minimal (JSON parsing)
- **External calls**: Avoid for pre-commit (use local validation)

## Best Practices

1. **One Type Per Page**: Focus on primary content type
2. **Validate Locally First**: Don't rely on external APIs for pre-commit
3. **Test with Rich Results**: Use Google's tool before production
4. **Keep Updated**: Schema.org types evolve - check documentation
5. **Avoid Errors**: Invalid schema is worse than no schema

## Common Mistakes

| Mistake | Issue | Fix |
|---------|-------|-----|
| Wrong @context | Uses http instead of https | Use `"https://schema.org"` |
| Invalid type | Typo in @type | Check schema.org documentation |
| Missing required | Omitting required properties | Add all required properties |
| Invalid date | Non-ISO date format | Use YYYY-MM-DD or full ISO 8601 |
| Invalid URL | Relative URLs | Use absolute URLs |

## See Also

- [Schema.org](https://schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
