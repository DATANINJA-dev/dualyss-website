# Hreflang Implementation Patterns

This document covers the three methods for implementing hreflang tags, the critical requirements for correct implementation, and common mistakes to avoid.

## Implementation Methods

Google supports three methods for declaring hreflang. **Choose ONE method** and use it consistently - mixing methods can cause conflicts.

### Method 1: HTML Link Tags (Recommended for Small Sites)

Place in the `<head>` section of each page:

```html
<head>
  <!-- Self-reference (REQUIRED) -->
  <link rel="alternate" hreflang="en-US" href="https://example.com/page" />

  <!-- All alternate versions -->
  <link rel="alternate" hreflang="es-ES" href="https://example.com/es/page" />
  <link rel="alternate" hreflang="de-DE" href="https://example.com/de/page" />
  <link rel="alternate" hreflang="fr-FR" href="https://example.com/fr/page" />

  <!-- Fallback for unmatched locales -->
  <link rel="alternate" hreflang="x-default" href="https://example.com/page" />
</head>
```

**Pros**:
- Easy to implement and debug
- Visible in page source
- Works without server access

**Cons**:
- Increases HTML page size
- Must be on every page
- Harder to maintain at scale

**Best for**: Sites with < 50 pages per language, CMS-managed content

### Method 2: HTTP Headers (For Non-HTML Files)

Use for PDFs, images, or when HTML modification isn't possible:

```http
HTTP/1.1 200 OK
Link: <https://example.com/page>; rel="alternate"; hreflang="en-US",
      <https://example.com/es/page>; rel="alternate"; hreflang="es-ES",
      <https://example.com/de/page>; rel="alternate"; hreflang="de-DE",
      <https://example.com/page>; rel="alternate"; hreflang="x-default"
```

**Server Configuration Examples**:

**Apache (.htaccess)**:
```apache
<FilesMatch "\.pdf$">
  Header set Link "<https://example.com/doc.pdf>; rel=\"alternate\"; hreflang=\"en\", \
                   <https://example.com/es/doc.pdf>; rel=\"alternate\"; hreflang=\"es\""
</FilesMatch>
```

**Nginx**:
```nginx
location /documents/ {
  add_header Link '<https://example.com/doc.pdf>; rel="alternate"; hreflang="en",
                   <https://example.com/es/doc.pdf>; rel="alternate"; hreflang="es"';
}
```

**Pros**:
- Works for non-HTML content (PDFs, images)
- Doesn't modify page content
- Can be centrally managed

**Cons**:
- Requires server configuration access
- Not visible in page source (harder to debug)
- Some CDNs may strip headers

**Best for**: PDF documents, downloadable files, API responses

### Method 3: XML Sitemap (Recommended for Large Sites)

Add hreflang annotations in your sitemap using the `xhtml:link` element:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <url>
    <loc>https://example.com/page</loc>
    <xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/page" />
    <xhtml:link rel="alternate" hreflang="es-ES" href="https://example.com/es/page" />
    <xhtml:link rel="alternate" hreflang="de-DE" href="https://example.com/de/page" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/page" />
  </url>

  <url>
    <loc>https://example.com/es/page</loc>
    <xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/page" />
    <xhtml:link rel="alternate" hreflang="es-ES" href="https://example.com/es/page" />
    <xhtml:link rel="alternate" hreflang="de-DE" href="https://example.com/de/page" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/page" />
  </url>

  <!-- Each URL entry must include ALL language versions including itself -->

</urlset>
```

**Pros**:
- Centralized management
- Easier to audit and update
- Doesn't affect page load time
- Can be auto-generated

**Cons**:
- Must include EVERY language version for EVERY page
- Large sitemaps can become unwieldy
- Not visible on the page itself

**Best for**: Sites with 50+ pages, e-commerce, programmatically managed content

## Critical Requirements

### 1. Bidirectional Linking (MANDATORY)

Every hreflang relationship MUST be bidirectional:

```
If Page A references Page B:
  ✓ Page A hreflang → Page B
  ✓ Page B hreflang → Page A

Without bidirectional links, Google ignores the hreflang declaration.
```

**Validation Pattern**:
```
For each page P in all_pages:
  For each hreflang link L in P.hreflang_links:
    target = L.href
    ASSERT target.hreflang_links contains P.url
```

### 2. Self-Referencing (MANDATORY)

Every page MUST include a hreflang tag pointing to itself:

```html
<!-- On https://example.com/es/page -->
<link rel="alternate" hreflang="es-ES" href="https://example.com/es/page" />
<!-- ↑ Self-reference to the current page -->
```

### 3. Absolute URLs with Protocol

Always use full absolute URLs including the protocol:

```html
<!-- ✓ Correct -->
<link rel="alternate" hreflang="es" href="https://example.com/es/page" />

<!-- ✗ Incorrect - relative URL -->
<link rel="alternate" hreflang="es" href="/es/page" />

<!-- ✗ Incorrect - protocol-relative -->
<link rel="alternate" hreflang="es" href="//example.com/es/page" />
```

### 4. Canonical URL Alignment

Hreflang tags should only point to canonical URLs:

```html
<!-- If this page has a canonical -->
<link rel="canonical" href="https://example.com/es/page" />

<!-- Hreflang must match the canonical -->
<link rel="alternate" hreflang="es" href="https://example.com/es/page" />

<!-- ✗ Never point hreflang to non-canonical versions -->
```

## Language and Region Codes

### Language Codes (ISO 639-1)

Use lowercase two-letter codes:

| Language | Code | Example |
|----------|------|---------|
| English | `en` | `hreflang="en"` |
| Spanish | `es` | `hreflang="es"` |
| German | `de` | `hreflang="de"` |
| French | `fr` | `hreflang="fr"` |
| Japanese | `ja` | `hreflang="ja"` |
| Chinese (Simplified) | `zh` | `hreflang="zh"` |
| Portuguese | `pt` | `hreflang="pt"` |
| Russian | `ru` | `hreflang="ru"` |
| Arabic | `ar` | `hreflang="ar"` |
| Korean | `ko` | `hreflang="ko"` |

### Region Codes (ISO 3166-1 Alpha 2)

Add uppercase region code with hyphen when targeting specific regions:

| Target | Code | Example |
|--------|------|---------|
| US English | `en-US` | `hreflang="en-US"` |
| UK English | `en-GB` | `hreflang="en-GB"` |
| Spanish (Spain) | `es-ES` | `hreflang="es-ES"` |
| Spanish (Mexico) | `es-MX` | `hreflang="es-MX"` |
| Portuguese (Brazil) | `pt-BR` | `hreflang="pt-BR"` |
| Portuguese (Portugal) | `pt-PT` | `hreflang="pt-PT"` |
| Chinese (Simplified) | `zh-Hans` | `hreflang="zh-Hans"` |
| Chinese (Traditional) | `zh-Hant` | `hreflang="zh-Hant"` |

**When to Use Region Codes**:
- Same language, different regions (en-US vs en-GB)
- Different pricing/currency
- Regional legal requirements
- Cultural content differences

**When Language-Only is Sufficient**:
- Single regional variant per language
- No regional content differences
- Simplified implementation

## The x-default Attribute

`x-default` specifies the fallback page for users whose language/region doesn't match any hreflang:

```html
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

### x-default Use Cases

| Strategy | x-default Points To | When to Use |
|----------|---------------------|-------------|
| Primary language | Main language version | English-first sites |
| Language selector | Dedicated language picker page | Equal regional importance |
| Geo-redirect script | Smart redirect page | Automatic locale detection |

### x-default Best Practices

1. **Always include x-default** in your hreflang set
2. **Point to accessible content** (not a redirect loop)
3. **Include x-default in bidirectional links** (all pages reference the x-default)
4. **Use for unmatched locales** (not as a replacement for specific tags)

## Common Mistakes and Fixes

### Mistake 1: Missing Self-Referencing

**Problem**: Page doesn't include hreflang pointing to itself.

```html
<!-- ✗ Missing self-reference on https://example.com/es/page -->
<link rel="alternate" hreflang="en" href="https://example.com/page" />
<!-- Where is es-ES? -->
```

**Fix**: Always include the current page in the hreflang set.

```html
<!-- ✓ Correct -->
<link rel="alternate" hreflang="en" href="https://example.com/page" />
<link rel="alternate" hreflang="es" href="https://example.com/es/page" />
```

### Mistake 2: Non-Reciprocal Links

**Problem**: Page A links to Page B, but Page B doesn't link back.

```
Page A (en) → links to → Page B (es)
Page B (es) → does NOT link to → Page A (en) ← MISSING
```

**Fix**: Ensure bidirectional linking in all directions.

### Mistake 3: Invalid Language Codes

**Problem**: Using incorrect or non-standard codes.

```html
<!-- ✗ Incorrect codes -->
<link rel="alternate" hreflang="english" href="..." />
<link rel="alternate" hreflang="ESP" href="..." />
<link rel="alternate" hreflang="en_US" href="..." />
```

**Fix**: Use ISO 639-1 (language) and ISO 3166-1 Alpha 2 (region).

```html
<!-- ✓ Correct codes -->
<link rel="alternate" hreflang="en" href="..." />
<link rel="alternate" hreflang="es" href="..." />
<link rel="alternate" hreflang="en-US" href="..." />
```

### Mistake 4: Hreflang on Non-Canonical URLs

**Problem**: Hreflang points to a URL that redirects or isn't canonical.

```html
<!-- Page has canonical to HTTPS -->
<link rel="canonical" href="https://example.com/page" />

<!-- ✗ Hreflang points to HTTP (non-canonical) -->
<link rel="alternate" hreflang="en" href="http://example.com/page" />
```

**Fix**: Hreflang URLs must match canonical URLs exactly.

### Mistake 5: Broken URLs (404s)

**Problem**: Hreflang points to pages that don't exist.

**Fix**: Audit hreflang links regularly; remove or update broken references.

### Mistake 6: Mixing Implementation Methods

**Problem**: Using HTML tags on some pages and sitemap on others.

**Fix**: Choose ONE method and use consistently across all pages.

### Mistake 7: Using Relative URLs

**Problem**: URLs without protocol and domain.

```html
<!-- ✗ Relative URL -->
<link rel="alternate" hreflang="es" href="/es/page" />
```

**Fix**: Always use absolute URLs with protocol.

```html
<!-- ✓ Absolute URL -->
<link rel="alternate" hreflang="es" href="https://example.com/es/page" />
```

## Validation Checklist

### Before Launch

- [ ] Chosen ONE implementation method (HTML, Headers, or Sitemap)
- [ ] All pages include self-referencing hreflang
- [ ] All hreflang relationships are bidirectional
- [ ] Language codes are valid ISO 639-1
- [ ] Region codes (if used) are valid ISO 3166-1 Alpha 2
- [ ] x-default is included for fallback
- [ ] All URLs are absolute with protocol
- [ ] All hreflang URLs return 200 (not redirects or 404s)
- [ ] Hreflang URLs match canonical URLs

### Tools for Validation

| Tool | Purpose | URL |
|------|---------|-----|
| Screaming Frog | Crawl-based hreflang audit | screaming frog.co.uk |
| Hreflang Testing Tool | Quick single-page check | hreflang.org |
| Ahrefs Site Audit | Large-scale hreflang validation | ahrefs.com |
| Google Search Console | "International Targeting" errors | search.google.com/search-console |

## Implementation Decision Tree

```
Start
  │
  ├─ Is content HTML?
  │   ├─ No → Use HTTP Headers (Method 2)
  │   └─ Yes ↓
  │
  ├─ How many pages per language?
  │   ├─ < 50 → Use HTML Tags (Method 1)
  │   └─ 50+ → Use XML Sitemap (Method 3)
  │
  └─ Can you modify server config?
      ├─ No → Use HTML Tags or Sitemap
      └─ Yes → Any method works
```

## References

- [Google: Tell Google About Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [SEMrush: Hreflang Errors Guide](https://www.semrush.com/blog/hreflang-errors/)
- [Moz: Hreflang Tags for International SEO](https://moz.com/learn/seo/hreflang-tag)
