# URL Structures for Multi-Language Sites

This document provides a comprehensive decision framework for choosing between the three main URL structure approaches for international websites: ccTLDs, subdirectories, and subdomains.

## The Three Approaches

### 1. Country Code Top-Level Domains (ccTLDs)

**Pattern**: `https://example.es`, `https://example.de`, `https://example.fr`

```
example.com     → English (default)
example.es      → Spanish (Spain)
example.de      → German (Germany)
example.co.uk   → English (UK)
example.com.br  → Portuguese (Brazil)
```

### 2. Subdirectories (gTLD with Path)

**Pattern**: `https://example.com/es/`, `https://example.com/de/`

```
example.com/        → English (default)
example.com/es/     → Spanish
example.com/de/     → German
example.com/fr/     → French
example.com/pt-br/  → Portuguese (Brazil)
```

### 3. Subdomains (gTLD with Subdomain)

**Pattern**: `https://es.example.com`, `https://de.example.com`

```
www.example.com   → English (default)
es.example.com    → Spanish
de.example.com    → German
fr.example.com    → French
```

## Decision Matrix

| Factor | ccTLD | Subdirectory | Subdomain |
|--------|-------|--------------|-----------|
| **Geo-targeting signal** | Strongest | Medium | Weak |
| **Local trust** | 1.5x higher | Standard | Standard |
| **Domain authority** | Separate per domain | Consolidated | Semi-separate |
| **Setup complexity** | High | Low | Medium |
| **Maintenance cost** | High (multiple domains) | Low | Medium |
| **Hosting flexibility** | High | Low | High |
| **Link equity** | Split | Consolidated | Partially split |
| **Google ranking data** | Best in top 3 | Good overall | Average |

## Detailed Comparison

### SEO Authority & Link Equity

**ccTLD**:
- Each domain builds authority independently
- Backlinks benefit only that specific domain
- Starting from zero DA for each new market
- Requires separate link building per market

**Subdirectory** (Recommended by Google):
- All links benefit the root domain
- New language versions inherit domain authority
- Fastest path to ranking in new markets
- Single domain to build and protect

**Subdomain**:
- Google treats as semi-autonomous
- Some authority inheritance (debated)
- More separation than subdirectories
- Less authority than ccTLDs for local trust

### Geo-Targeting Strength

Research data from SEO studies (2025-2026):

| Structure | Top 3 Rankings (Local) | Click-Through Rate |
|-----------|------------------------|-------------------|
| ccTLD | 47% | +12% vs gTLD |
| Subdirectory | 38% | Baseline |
| Subdomain | 31% | -5% vs subdirectory |

**Key insight**: ccTLDs dominate local top 3 rankings because users trust local domains more, leading to higher CTR, which reinforces rankings.

### Cost Analysis

| Item | ccTLD | Subdirectory | Subdomain |
|------|-------|--------------|-----------|
| Domain registration | $10-100/year × N countries | $15/year total | $15/year total |
| SSL certificates | N certificates | 1 certificate | Wildcard certificate |
| Hosting | Potentially N servers | 1 server | 1 server (or N) |
| CDN configuration | N origins | 1 origin | 1-N origins |
| SEO tools | N subscriptions | 1 subscription | 1 subscription |
| **Annual cost (5 markets)** | $500-2000+ | $100-200 | $150-300 |

### Technical Complexity

**ccTLD Requirements**:
- Multiple domain registrations
- Separate DNS management
- Multiple SSL certificates
- Cross-domain tracking setup
- Separate Google Search Console properties

**Subdirectory Requirements**:
- Single domain
- URL routing/rewriting
- Language detection middleware
- Single Google Search Console property

**Subdomain Requirements**:
- Wildcard DNS or individual records
- Wildcard SSL or individual certs
- Subdomain routing at load balancer
- Separate Search Console properties (optional)

## When to Use Each Approach

### Use ccTLDs When

- **Local trust is critical** (e-commerce, financial services)
- **Brand recognition varies by market** (different brands per region)
- **Legal requirements** mandate local domain (some countries)
- **Budget allows** separate domain investment
- **Markets are mature** and worth dedicated investment
- **Competitors use ccTLDs** (matching user expectations)

**Best for**: Enterprise brands, established local presence, regulated industries

### Use Subdirectories When (Google's Recommendation)

- **Starting international expansion** (fastest time-to-rank)
- **Limited budget** for international SEO
- **Single brand identity** across all markets
- **Consolidated authority** is priority
- **Content is centrally managed** (same CMS)
- **SEO resources are limited** (one team for all markets)

**Best for**: SaaS, startups, content sites, B2B, most businesses

### Use Subdomains When

- **Technical requirements** need separation (different tech stacks)
- **Regional teams** manage content independently
- **Different hosting needs** per region (latency, compliance)
- **Hybrid approach** desired (some autonomy, some consolidation)
- **Testing new markets** before full commitment

**Best for**: Large enterprises with regional teams, specific hosting requirements

## Implementation Patterns

### Subdirectory Structure Best Practices

```
example.com/                    # Default language (usually English)
example.com/es/                 # Spanish
example.com/de/                 # German
example.com/fr/                 # French
example.com/zh-hans/            # Chinese Simplified
example.com/pt-br/              # Portuguese (Brazil)

# For pages:
example.com/products/widget     # English
example.com/es/products/widget  # Spanish
example.com/de/produkte/widget  # German (localized URL slug)
```

**URL Localization Options**:

| Approach | Example | Pros | Cons |
|----------|---------|------|------|
| Language prefix only | `/es/products/` | Simple, consistent | Less local feel |
| Fully localized | `/es/productos/` | More local, keyword benefit | Complex routing |
| Hybrid | `/es/products/producto-x` | Balance | Moderate complexity |

### ccTLD Structure Best Practices

```
example.com/products/widget     # US English (default)
example.es/productos/widget     # Spanish (Spain)
example.de/produkte/widget      # German
example.co.uk/products/widget   # UK English
```

**Cross-Domain Considerations**:
- Set up cross-domain tracking in analytics
- Consider cookie sharing challenges
- Plan for separate backlink strategies
- Budget for multiple SEO tools

### Subdomain Structure Best Practices

```
www.example.com/products/       # Default
es.example.com/productos/       # Spanish
de.example.com/produkte/        # German
uk.example.com/products/        # UK English
```

## Migration Considerations

### Migrating TO Subdirectories (Most Common)

From ccTLD:
```
example.de/produkt → example.com/de/produkt
301 redirect, update hreflang, submit to Search Console
```

From Subdomain:
```
de.example.com/produkt → example.com/de/produkt
301 redirect, update hreflang, update internal links
```

**Migration Checklist**:
- [ ] Map all old URLs to new URLs
- [ ] Implement 301 redirects (permanent)
- [ ] Update hreflang tags across all versions
- [ ] Update internal links
- [ ] Submit new sitemap to Search Console
- [ ] Monitor traffic and rankings for 3-6 months
- [ ] Update backlinks where possible

### Risks of Migration

| Risk | Impact | Mitigation |
|------|--------|------------|
| Traffic drop | 10-30% temporary | Proper 301s, monitoring |
| Authority loss | Variable | 301s preserve most equity |
| Ranking fluctuation | 2-6 months | Patience, quality content |
| Broken links | High if incomplete | Comprehensive URL mapping |

## Anti-Patterns to Avoid

### URL Parameters (Never Use)

```
# ✗ Never use URL parameters for language
example.com/products?lang=es
example.com/products?locale=de_DE

# Why it's bad:
# - Duplicate content risk
# - Harder to index
# - No clear URL structure
# - User confusion
```

### Inconsistent Patterns

```
# ✗ Mixing approaches
example.com/es/products     # Subdirectory
de.example.com/products     # Subdomain
example.fr/products         # ccTLD

# This causes:
# - SEO confusion
# - Hreflang complexity
# - Maintenance nightmare
```

### IP-Based Redirects

```
# ✗ Never auto-redirect based on IP
User from Spain → Auto-redirect to example.es

# Why it's bad:
# - Blocks Googlebot from seeing all versions
# - Prevents users from accessing preferred language
# - VPN users get wrong content
```

**Alternative**: Show a language suggestion banner, don't redirect.

## Quick Decision Guide

```
START
  │
  ├─ Is local trust critical? (e-commerce, finance, legal)
  │   ├─ Yes → Consider ccTLD
  │   └─ No ↓
  │
  ├─ Do you have budget for multiple domains and SEO efforts?
  │   ├─ Yes, substantial → ccTLD or Subdomain
  │   └─ No, limited → Subdirectory ✓
  │
  ├─ Do regional teams need technical independence?
  │   ├─ Yes → Subdomain
  │   └─ No → Subdirectory ✓
  │
  ├─ Is this your first international expansion?
  │   ├─ Yes → Subdirectory ✓ (Google's recommendation)
  │   └─ No, experienced → Any approach based on needs
  │
  └─ Default recommendation → Subdirectory ✓
```

## Google's Official Guidance

From Google Search Central (2026):

> "We recommend using subdirectories because they are generally easier to manage, especially for smaller sites. They allow you to consolidate your site's authority while still providing clear signals about the language and region targeting of each page."

**Key takeaway**: Unless you have specific reasons for ccTLDs or subdomains, subdirectories are the safest, most efficient choice.

## References

- [Google: Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Search Engine Journal: ccTLD vs Subdomain vs Subdirectory](https://www.searchenginejournal.com/subdomain-subdirectory-cctld-which-one-should-you-use/448277/)
- [Ahrefs: How to Choose the Right URL Structure](https://ahrefs.com/blog/international-seo/)
- [AccuraCast: International SEO Domain Structure Analysis](https://www.accuracast.com/articles/optimisation/international-seo-domain-v-directories/)
