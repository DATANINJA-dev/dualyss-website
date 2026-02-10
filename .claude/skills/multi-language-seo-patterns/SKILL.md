---
name: multi-language-seo-patterns
description: |
  Provides multi-language SEO patterns for international sites.
  Auto-activates when tasks involve i18n/l10n SEO, hreflang implementation,
  URL structures for localization, regional SEO, or translation QA workflows.
---

# Multi-Language SEO Patterns Skill

This skill provides comprehensive patterns for optimizing international websites for search engines across multiple languages and regions. Proper multi-language SEO prevents duplicate content penalties, ensures correct regional targeting, and improves visibility in local search results.

## When This Skill Activates

- Tasks mentioning hreflang, x-default, or alternate language tags
- Multi-language or multilingual site optimization
- i18n/l10n SEO considerations
- URL structure decisions for international sites (subdomain vs subdirectory vs ccTLD)
- Regional SEO and local search optimization
- Translation QA and orthography validation
- Language/region detection implementation

### Activation Keywords

| Keyword Pattern | Confidence |
|-----------------|------------|
| hreflang, x-default, alternate language | High |
| multi-language, multilingual, international SEO | High |
| i18n SEO, l10n SEO, internationalization | High |
| ccTLD, subdomain locale, subdirectory locale | High |
| regional SEO, local search, Google My Business | Medium |
| translation QA, orthography, spell-check | Medium |
| Accept-Language, navigator.language, locale detection | Medium |

## Core Principles

### The Three Pillars of Multi-Language SEO

1. **Technical Correctness**: Proper hreflang implementation with bidirectional linking
2. **URL Strategy**: Consistent URL structure aligned with business goals
3. **Content Localization**: Beyond translation - cultural and regional adaptation

### Key Success Factors

| Factor | Impact | Implementation |
|--------|--------|----------------|
| Hreflang accuracy | Critical | All 3 methods validated, bidirectional links |
| URL consistency | High | Single pattern across all markets |
| Regional targeting | High | Google Search Console geo-targeting |
| Content quality | High | Native speaker review, not just translation |
| Technical access | Medium | Separate crawl paths per language |

### The Localization vs Translation Distinction

> "Translation converts words; localization converts experiences."

Effective multi-language SEO requires understanding that:
- **Translation**: Direct language conversion (necessary but insufficient)
- **Localization**: Cultural adaptation, local keywords, regional formats
- **Transcreation**: Creative adaptation for emotional/marketing content

## Supporting Files

| File | Purpose |
|------|---------|
| `hreflang-implementation.md` | HTML tags, HTTP headers, XML sitemap patterns |
| `url-structures.md` | Subdomain vs subdirectory vs ccTLD decision matrix |
| `regional-seo.md` | Local search optimization, Google My Business |
| `orthography-validation.md` | Translation QA workflow, spell-check integration |

## Usage

This skill is automatically activated when multi-language SEO tasks are detected. Reference the supporting files for:

- **Technical Setup**: Use hreflang-implementation.md for correct tag implementation
- **Architecture Decisions**: Use url-structures.md for URL strategy selection
- **Local Optimization**: Use regional-seo.md for market-specific tactics
- **Quality Assurance**: Use orthography-validation.md for translation review

## Constraints

- Hreflang is a hint, not a directive - Google may ignore incorrect implementations
- URL structure changes are difficult to reverse - choose carefully
- 2026 SERP fragmentation means regional results vary significantly
- Some search engines (Baidu, Yandex, Naver) have different requirements
- Avoid IP-based redirects - they block Googlebot from crawling alternate versions

## Quick Reference

### Minimum Viable Multi-Language SEO Checklist

- [ ] Hreflang tags implemented (HTML, headers, or sitemap - pick one)
- [ ] Self-referencing hreflang on each page
- [ ] Bidirectional links between all language versions
- [ ] x-default fallback for unmatched locales
- [ ] Consistent URL structure across all markets
- [ ] Google Search Console geo-targeting configured
- [ ] Native speaker content review completed
- [ ] Language codes use ISO 639-1 (e.g., `en`, `es`, `de`)
- [ ] Region codes use ISO 3166-1 Alpha 2 (e.g., `en-US`, `es-MX`)

### Hreflang Quick Template

```html
<!-- Self-referencing + all alternates -->
<link rel="alternate" hreflang="en" href="https://example.com/page" />
<link rel="alternate" hreflang="es" href="https://example.com/es/page" />
<link rel="alternate" hreflang="de" href="https://example.com/de/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

### Common Mistakes Quick Check

| Mistake | Impact | Prevention |
|---------|--------|------------|
| Missing self-referencing | High | Every page must include itself |
| Non-reciprocal links | High | Page A → B requires B → A |
| Invalid language codes | High | Use ISO 639-1, not country names |
| Relative URLs | Medium | Always use absolute URLs with protocol |
| Hreflang on non-canonical | Medium | Only canonical URLs in hreflang |

## Research Sources

- [Google Search Central: Localized Versions Documentation](https://developers.google.com/search/docs/specialty/international/localized-versions) - Official hreflang specification
- [SEMrush: 9 Common Hreflang Errors and How to Fix Them (2026)](https://www.semrush.com/blog/hreflang-errors/) - Comprehensive error prevention
- [Backlinko: Hreflang Tag Complete Implementation Guide (2026)](https://backlinko.com/hreflang-tag) - Implementation best practices
- [Search Engine Journal: Subdomain vs Subdirectory vs ccTLD (2026)](https://www.searchenginejournal.com/subdomain-subdirectory-cctld-which-one-should-you-use/448277/) - URL structure decision guide
- [Optimational: Multilingual SEO Localisation Complete Guide (2026)](https://optimational.com/blog/complete-guide-multilingual-seo/) - 2026 SERP fragmentation analysis
