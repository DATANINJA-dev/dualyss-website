# hreflang

## Purpose

Validate hreflang attributes for multi-language sites, ensuring reciprocal linking and correct ISO language codes. Prevents SEO penalties from incomplete or invalid hreflang implementation.

## When to Use

- Implementing `/seo-validate-hreflang` command
- Validating multi-language site configurations
- Checking reciprocal link integrity across localized pages
- Auditing x-default implementation
- Pre-commit hooks for internationalized content

## External Dependencies

| Tool | Purpose | Source |
|------|---------|--------|
| jq | JSON/HTML parsing | System package manager |
| xmllint | Sitemap hreflang extraction | libxml2 package |

## Validation Rules

### Language Code Validation

1. **ISO 639-1 Required**: Must use 2-letter language codes
2. **Region Optional**: Region codes use ISO 3166-1 Alpha-2
3. **Valid Combinations**: `en`, `en-US`, `en-GB`, `zh-Hans`, `zh-Hant`

### Common Language Codes

| Code | Language | Regional Variants |
|------|----------|-------------------|
| en | English | en-US, en-GB, en-AU, en-CA |
| es | Spanish | es-ES, es-MX, es-AR |
| de | German | de-DE, de-AT, de-CH |
| fr | French | fr-FR, fr-CA, fr-BE |
| pt | Portuguese | pt-BR, pt-PT |
| zh | Chinese | zh-Hans (Simplified), zh-Hant (Traditional) |
| ja | Japanese | ja-JP |
| ko | Korean | ko-KR |

### Reciprocal Link Rules

1. **Self-Reference Required**: Each page must include hreflang pointing to itself
2. **Bidirectional Links**: If A links to B, B must link back to A
3. **Complete Graph**: All language versions must link to all other versions
4. **x-default**: Recommended for language fallback (usually home language)

### x-default Usage

| Scenario | x-default Target |
|----------|------------------|
| Global audience | Main language version (e.g., en) |
| Geo-redirecting | Language selector page |
| No preference | Most popular language version |

## Validation Algorithm

```
1. Extract all hreflang declarations from page
2. Build directed graph: page → [hreflang targets]
3. For each page in graph:
   a. Check self-reference exists
   b. Check language code is valid ISO 639-1
   c. For each target:
      i.  Verify target page exists (HTTP 200)
      ii. Verify target has reciprocal link back
4. Check x-default presence (warn if missing)
5. Check for orphaned pages (no incoming hreflang)
6. Report validation results
```

### Graph Representation

```
Page A (en) ─────┬──► Page B (es) ──────► Page A (en) ✓
                 │                        Page C (de) ✓
                 │
                 ├──► Page C (de) ──────► Page A (en) ✓
                 │                        Page B (es) ✓
                 │
                 └──► Page A (en) [self] ✓
```

## Extraction Patterns

### HTML Link Elements

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/" />
<link rel="alternate" hreflang="es" href="https://example.com/es/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/" />
```

### Extraction Command

```bash
# Extract hreflang from HTML
grep -oP 'hreflang="[^"]*".*?href="[^"]*"' page.html

# Parse into structured format
grep -oP '<link[^>]*hreflang="([^"]*)"[^>]*href="([^"]*)"' page.html | \
  sed -E 's/.*hreflang="([^"]*)".*href="([^"]*)".*/\1\t\2/'
```

### XML Sitemap

```xml
<url>
  <loc>https://example.com/en/page</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/page"/>
  <xhtml:link rel="alternate" hreflang="es" href="https://example.com/es/page"/>
</url>
```

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| E502 | Invalid hreflang code | Non-ISO language code used |
| E503 | Missing reciprocal hreflang link | Target page doesn't link back |
| E508 | Orphaned page detected | Page has no incoming hreflang links |

## Validation Result

```json
{
  "validator": "hreflang",
  "status": "fail",
  "score": 65,
  "execution_time_ms": 320,
  "errors": [
    {
      "code": "E503",
      "message": "Missing reciprocal hreflang link",
      "location": "about.html",
      "context": "Links to /es/about.html but no return link found",
      "fix": "Add <link rel=\"alternate\" hreflang=\"en\" href=\"/about.html\"> to /es/about.html"
    }
  ],
  "warnings": [
    {
      "code": "W003",
      "message": "Missing x-default",
      "context": "No x-default hreflang found for fallback"
    }
  ],
  "details": {
    "pages_checked": 12,
    "languages": ["en", "es", "de"],
    "reciprocal_issues": 2,
    "orphaned_pages": 0
  },
  "summary": "1 error, 1 warning"
}
```

## Multi-Page Validation

For sites with many pages, validate efficiently:

### Batch Validation Strategy

1. **Sample-Based**: Check representative pages per section
2. **Template-Based**: Verify templates generate correct hreflang
3. **Sitemap-Based**: Extract from XML sitemap for full coverage

### Sitemap Extraction

```bash
# Extract hreflang from XML sitemap
xmllint --xpath "//*[local-name()='link']/@hreflang | //*[local-name()='link']/@href" sitemap.xml
```

## Performance Budget

- **Execution time**: 0.5s maximum for local validation
- **HTTP requests**: Minimize (use HEAD requests for existence checks)
- **Cache**: Cache page existence results within validation run

## Common Mistakes

| Mistake | Issue | Fix |
|---------|-------|-----|
| Using country codes | `hreflang="US"` | Use language: `hreflang="en-US"` |
| Missing self-reference | Page doesn't include itself | Add self-referencing hreflang |
| One-way links | A→B exists, B→A missing | Add reciprocal link |
| HTTP vs HTTPS mismatch | Links use wrong protocol | Use consistent protocol |
| Trailing slash inconsistency | `/page` vs `/page/` | Match exact URLs |

## Best Practices

1. **Consistent URL Format**: Match exact URLs (protocol, trailing slash)
2. **Self-Reference**: Always include self-referencing hreflang
3. **Complete Set**: All pages link to all language versions
4. **x-default**: Include for language selector or primary language
5. **HTTP Status**: Ensure all hreflang targets return 200
6. **Canonical Alignment**: Hreflang should point to canonical URLs

## See Also

- [Google Hreflang Guidelines](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [ISO 3166-1 Country Codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
