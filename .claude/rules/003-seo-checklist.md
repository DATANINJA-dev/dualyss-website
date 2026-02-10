# Dualyss SEO Checklist

## Pre-Commit Validation

Run before every commit:
- [ ] `/seo-validate-meta` - Meta tags validation
- [ ] `/seo-validate-hreflang` - Language alternates
- [ ] `/seo-validate-structured` - JSON-LD schemas
- [ ] `/seo-validate-orthography` - Spelling/grammar (all 6 languages)

## Page-Level Requirements

### Every Page Must Have
- [ ] Unique `<title>` (50-60 chars) in each language
- [ ] Unique `<meta description>` (150-160 chars) in each language
- [ ] Canonical URL
- [ ] hreflang tags for all 6 languages + x-default
- [ ] Open Graph tags (og:title, og:description, og:image, og:url, og:locale)
- [ ] Twitter Card tags
- [ ] JSON-LD schema (minimum: WebPage)
- [ ] Single H1 tag
- [ ] Logical heading hierarchy

### Homepage Additional
- [ ] Organization schema
- [ ] WebSite schema with SearchAction (if applicable)

### Content Pages
- [ ] Article or WebPage schema
- [ ] Breadcrumb schema
- [ ] Author information where applicable

## Technical SEO

### Robots & Crawling
- [ ] robots.txt with AI crawler rules
- [ ] XML sitemap (all languages)
- [ ] Sitemap index if multiple sitemaps

### Performance
- [ ] Images optimized (WebP, lazy load)
- [ ] Fonts preloaded
- [ ] Critical CSS inlined
- [ ] JavaScript deferred

### Mobile
- [ ] Viewport meta tag
- [ ] Touch targets 48x48px minimum
- [ ] No horizontal scroll
- [ ] Readable without zoom

## Content Quality (E-E-A-T)

### Experience
- [ ] Case studies and real examples
- [ ] Project portfolios
- [ ] Team expertise highlighted

### Expertise
- [ ] Technical depth appropriate to audience
- [ ] Domain-specific terminology
- [ ] Citations and references

### Authoritativeness
- [ ] About page with credentials
- [ ] Partner logos/affiliations
- [ ] Press mentions

### Trustworthiness
- [ ] Contact information visible
- [ ] Privacy policy
- [ ] Legal notices
- [ ] Secure HTTPS

## GEO (Generative Engine Optimization)

- [ ] AI crawler access configured
- [ ] Structured data for AI comprehension
- [ ] Clear, factual content structure
- [ ] FAQ sections where appropriate
