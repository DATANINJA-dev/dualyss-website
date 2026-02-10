# Keyword Optimization

Keyword optimization ensures content aligns with user search intent while maintaining readability and natural language flow. This document covers density guidelines, placement patterns, semantic keyword strategies, and cannibalization detection.

## Keyword Types

| Type | Definition | Example |
|------|------------|---------|
| **Primary Keyword** | Main topic, highest search intent alignment | "best running shoes" |
| **Secondary Keywords** | Related topics, supporting themes | "cushioned running shoes", "trail running shoes" |
| **LSI Keywords** | Semantically related terms (Latent Semantic Indexing) | "marathon training", "pronation", "arch support" |
| **Long-tail Keywords** | Specific, lower volume, higher intent | "best running shoes for flat feet under $100" |

## Keyword Density

### Recommended Density Ranges

| Keyword Type | Target Density | Warning Threshold | Over-optimization |
|--------------|---------------|-------------------|-------------------|
| Primary | 1-2% | 2.5% | > 3% |
| Secondary (each) | 0.5-1% | 1.5% | > 2% |
| LSI/Semantic | Natural inclusion | N/A | Forced inclusion |

### Density Formula

```
Keyword Density (%) = (Keyword Occurrences / Total Words) × 100
```

**Example**:
- Content: 1,000 words
- Primary keyword appears 15 times
- Density: (15 / 1000) × 100 = 1.5% ✓

### Historical Context

Keyword density was heavily emphasized in early SEO (2000s). Modern search engines use:
- **TF-IDF** (Term Frequency-Inverse Document Frequency)
- **BM25** algorithm variations
- **Neural language models** understanding context

**Takeaway**: Density is still relevant but secondary to semantic relevance and user intent.

## Keyword Placement

Strategic placement matters more than raw density.

### High-Value Positions

| Location | Priority | Guidelines |
|----------|----------|------------|
| **Title Tag** | Critical | Include primary keyword, ideally near the beginning |
| **H1 Heading** | Critical | Primary keyword, exact or close variation |
| **URL Slug** | High | Primary keyword, hyphenated, concise |
| **Meta Description** | High | Primary + secondary, compelling CTA |
| **First 100 Words** | High | Primary keyword in opening paragraph |
| **H2/H3 Headings** | Medium | Mix of primary, secondary, and LSI keywords |
| **Image Alt Text** | Medium | Descriptive, keyword where natural |
| **Last 100 Words** | Low | Natural conclusion, keyword if appropriate |

### Placement Checklist

```markdown
## Keyword Placement Audit: [Page URL]

**Primary Keyword**: [keyword]

- [ ] Title tag contains primary keyword
- [ ] H1 contains primary keyword
- [ ] URL includes primary keyword
- [ ] Meta description includes primary keyword
- [ ] Primary keyword in first 100 words
- [ ] At least 2 H2/H3 headings include keywords
- [ ] At least 1 image alt text includes keyword
- [ ] Internal links use keyword variations as anchor text

**Score**: _/8 positions filled
```

### Title Tag Optimization

| Pattern | Example | Notes |
|---------|---------|-------|
| Keyword first | "Running Shoes: 2026 Buyer's Guide" | Best for SEO |
| Brand + keyword | "Nike Running Shoes - Best Selection" | Good for brand recognition |
| Question format | "What Are the Best Running Shoes?" | Good for featured snippets |
| List format | "10 Best Running Shoes for Beginners" | High CTR pattern |

**Length**: 50-60 characters (Google truncates longer titles)

### Meta Description Optimization

| Element | Guideline |
|---------|-----------|
| Length | 150-160 characters |
| Keywords | Primary + 1-2 secondary |
| CTA | Include action word (Discover, Learn, Shop, Get) |
| Uniqueness | Unique per page |

**Example**:
```
Find the best running shoes for your needs. Compare top brands, read expert reviews, and discover the perfect fit for your running style. Shop now!
```

## LSI Keywords (Semantic SEO)

LSI (Latent Semantic Indexing) keywords are terms semantically related to your primary keyword. They help search engines understand content context.

### Finding LSI Keywords

| Method | Tool/Technique |
|--------|----------------|
| Google "Searches related to" | Bottom of SERP |
| Google Autocomplete | Type partial query |
| People Also Ask | SERP feature |
| Google Keyword Planner | Related keywords section |
| SEMrush/Ahrefs | Related keywords report |
| LSIGraph | lsigraph.com |
| AnswerThePublic | Question variations |

### LSI Example: "Running Shoes"

| Category | LSI Keywords |
|----------|--------------|
| Features | cushioning, arch support, breathable mesh, lightweight |
| Activities | marathon, trail running, jogging, sprinting |
| Brands | Nike, Adidas, Brooks, ASICS |
| Problems | pronation, flat feet, plantar fasciitis, shin splints |
| Comparisons | vs walking shoes, athletic shoes, cross-trainers |

### LSI Integration Guidelines

| Do | Don't |
|----|-------|
| Use naturally in content flow | Force keywords unnaturally |
| Vary throughout the content | Cluster in one section |
| Include in subheadings | Stuff into every paragraph |
| Use in image captions | Sacrifice readability |
| Answer related questions | Use unrelated terms |

## Keyword Cannibalization

Cannibalization occurs when multiple pages target the same keyword, causing them to compete against each other in search results.

### Detection Methods

1. **Site Search Query**:
   ```
   site:yourdomain.com "target keyword"
   ```
   If multiple pages rank, investigate.

2. **Google Search Console**:
   - Go to Performance → Queries
   - Filter by keyword
   - Check "Pages" tab for multiple URLs

3. **Rank Tracking Tools**:
   - Set up tracking for primary keywords
   - Alert if multiple URLs appear for same keyword

### Cannibalization Types

| Type | Description | Solution |
|------|-------------|----------|
| **Exact Match** | Multiple pages target identical keyword | Consolidate or differentiate |
| **Intent Overlap** | Different keywords, same user intent | Create hub page or redirect |
| **Topic Overlap** | Broad topic covered multiple times | Organize into pillar/cluster |

### Resolution Strategies

| Strategy | When to Use |
|----------|-------------|
| **301 Redirect** | One page is clearly superior |
| **Canonical Tag** | Pages serve different purposes but overlap |
| **Content Merge** | Combine into comprehensive single page |
| **Re-optimize** | Differentiate keyword targets |
| **Noindex** | Page needed but shouldn't rank |
| **Internal Linking** | Establish hierarchy, signal primary page |

### Cannibalization Audit Template

```markdown
## Cannibalization Audit: [Keyword]

**Keyword**: [target keyword]
**Search Volume**: [monthly searches]
**Date**: [audit date]

### Competing Pages

| URL | Title | Ranking Position | Traffic |
|-----|-------|------------------|---------|
| [url1] | [title] | [position] | [sessions] |
| [url2] | [title] | [position] | [sessions] |

### Analysis

- **Primary page (should rank)**: [url]
- **Secondary pages**: [urls]
- **Conflict type**: [exact/intent/topic]

### Resolution Plan

- [ ] Action: [merge/redirect/re-optimize/canonical]
- [ ] Timeline: [date]
- [ ] Owner: [person]
```

## Keyword Scoring Formula

**Composite Keyword Score (0-100)**:

```
Score = (Density_Score × 0.3) + (Placement_Score × 0.4) + (LSI_Score × 0.2) + (Cannibalization_Score × 0.1)

Where:
- Density_Score: 100 if 1-2%, decreasing outside range
- Placement_Score: (positions_filled / 8) × 100
- LSI_Score: (relevant_LSI_present / expected_LSI) × 100
- Cannibalization_Score: 100 if no conflicts, 0 if severe cannibalization
```

**Thresholds**:
- **Pass** (Green): >= 70
- **Warn** (Yellow): 50-69
- **Fail** (Red): < 50

## Common Mistakes

| Mistake | Impact | Solution |
|---------|--------|----------|
| Keyword stuffing | Penalty risk, poor UX | Write naturally, optimize for users first |
| Ignoring intent | Low engagement, high bounce | Match content type to search intent |
| Over-optimizing | Unnatural content | Use variations and synonyms |
| Missing from key positions | Reduced relevance signals | Follow placement checklist |
| Cannibalization | Split ranking signals | Regular audits, clear page hierarchy |
| Ignoring long-tail | Missing qualified traffic | Create targeted content for long-tail |

## Best Practices

1. **User intent first**: Match content type to what searchers want
2. **Natural language**: Write for humans, optimize for engines
3. **Semantic depth**: Cover topics comprehensively with related terms
4. **Regular audits**: Check for cannibalization quarterly
5. **Track performance**: Monitor keyword rankings and adjust
6. **Quality over quantity**: Better to rank #1 for fewer keywords than page 2 for many

## References

- [Moz - On-Page SEO Factors (2026)](https://moz.com/learn/seo/on-page-factors)
- [Ahrefs - Keyword Density: Is It Still Relevant? (2025)](https://ahrefs.com/blog/keyword-density/)
- [Search Engine Journal - LSI Keywords Explained (2026)](https://www.searchenginejournal.com/lsi-keywords/)
- [Google Search Central - Keyword Stuffing](https://developers.google.com/search/docs/essentials/spam-policies#keyword-stuffing)
