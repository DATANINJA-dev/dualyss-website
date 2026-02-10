# Content Audit Methodology

A content audit is a systematic review of all content on a site to evaluate quality, identify gaps, and prioritize improvements. This document provides a methodology for conducting SEO-focused content audits.

## Audit Types

| Type | Scope | Frequency | Purpose |
|------|-------|-----------|---------|
| **Full Audit** | All content | Annually | Comprehensive health check |
| **Partial Audit** | Section/category | Quarterly | Focused improvement |
| **Competitive Audit** | Competitor comparison | Semi-annually | Gap analysis |
| **Post-Update Audit** | Recently changed | After major updates | Quality assurance |

## Audit Process

### Phase 1: Inventory (Data Collection)

Gather all content URLs and metadata.

**Data Sources**:
| Source | Data Gathered |
|--------|--------------|
| Sitemap.xml | All indexed URLs |
| Google Analytics | Traffic, engagement metrics |
| Google Search Console | Impressions, clicks, rankings |
| Screaming Frog / Sitebulb | Technical SEO data |
| CMS Export | Published dates, authors, categories |

**Essential Metrics per URL**:
```
- URL
- Title
- Word count
- Published date
- Last modified date
- Page views (last 12 months)
- Bounce rate
- Average time on page
- Organic sessions
- Top ranking keywords
- Backlinks (external + internal)
```

### Phase 2: Categorization

Organize content for analysis.

**Content Categories**:
| Category | Examples |
|----------|----------|
| Product/Service | Product pages, pricing, features |
| Educational | How-to guides, tutorials, FAQs |
| Blog/News | Articles, announcements, updates |
| Support | Documentation, help articles |
| Landing | Campaign pages, lead gen pages |
| Legal/Policy | Privacy policy, terms, disclaimers |

**Content Status Labels**:
| Label | Definition | Action |
|-------|------------|--------|
| **Keep** | High-performing, up-to-date | Monitor only |
| **Update** | Good foundation, needs refresh | Schedule update |
| **Consolidate** | Similar to other content | Merge with related |
| **Remove** | Low-value, outdated, thin | Delete or noindex |
| **Create** | Gap identified | Add to content plan |

### Phase 3: Evaluation

Score each piece of content.

**Evaluation Dimensions**:

| Dimension | Weight | Evaluation Criteria |
|-----------|--------|-------------------|
| Performance | 25% | Traffic, engagement, conversions |
| Accuracy | 20% | Facts current, links working |
| Comprehensiveness | 20% | Topic fully covered |
| E-E-A-T | 20% | Author credentials, trust signals |
| SEO Health | 15% | Technical SEO, keyword optimization |

### Phase 4: Action Planning

Prioritize and schedule improvements.

**Priority Matrix**:
```
                    HIGH IMPACT
                         │
         ┌───────────────┼───────────────┐
         │   QUICK WINS  │  STRATEGIC    │
         │   (Do First)  │  (Plan & Do)  │
         │               │               │
LOW ─────┼───────────────┼───────────────┼───── HIGH
EFFORT   │               │               │      EFFORT
         │   FILL-INS    │  RECONSIDER   │
         │   (Do Later)  │  (Evaluate)   │
         │               │               │
         └───────────────┼───────────────┘
                         │
                    LOW IMPACT
```

## Freshness Scoring

Content freshness affects SEO performance, especially for topics where recency matters.

### Freshness Formula

```
Freshness Score = Base_Score × Decay_Factor × Topic_Modifier

Where:
- Base_Score = 100 (at publication)
- Decay_Factor = varies by content type (see below)
- Topic_Modifier = 0.5 to 1.5 based on topic volatility
```

### Decay Factors by Content Type

| Content Type | Half-Life | Annual Decay | Examples |
|--------------|-----------|--------------|----------|
| News/Current Events | 1 week | 99% | Breaking news, announcements |
| Trending Topics | 1 month | 95% | Product launches, seasonal |
| How-To Guides | 6 months | 75% | Tutorials, instructions |
| Evergreen Reference | 12 months | 50% | Definitions, fundamentals |
| Historical/Archive | Never | 0% | Historical records, case studies |

### Topic Volatility Modifiers

| Topic | Volatility | Modifier | Reasoning |
|-------|------------|----------|-----------|
| Technology/Software | High | 1.5 | Rapid changes |
| Finance/Taxes | High | 1.3 | Regulatory changes |
| Health/Medical | Medium | 1.2 | Evolving research |
| Travel/Local | Medium | 1.1 | Seasonal, conditions change |
| History/Science | Low | 0.8 | Fundamentals stable |
| Philosophy/Art | Very Low | 0.5 | Timeless topics |

### Freshness Thresholds

| Score | Status | Action |
|-------|--------|--------|
| 80-100 | Fresh | No action needed |
| 60-79 | Aging | Review within 3 months |
| 40-59 | Stale | Update priority |
| 0-39 | Outdated | Immediate update or remove |

### Update Triggers

Content should be reviewed when:

| Trigger | Priority | Example |
|---------|----------|---------|
| Industry change | High | New regulations, major product update |
| Competitor update | Medium | Competitor publishes newer content |
| Traffic decline | Medium | 20%+ drop in organic traffic |
| User feedback | Medium | Comments indicating outdated info |
| Scheduled review | Low | Quarterly/annual review cycle |
| Broken links | Low | Outbound links returning 404 |

## Accuracy Verification

Ensuring content accuracy is critical for E-E-A-T and user trust.

### Accuracy Checklist

| Check | Method | Frequency |
|-------|--------|-----------|
| Factual claims | Cross-reference with primary sources | Annual |
| Statistics | Verify source, check for updates | Annual |
| External links | Automated link checker | Monthly |
| Internal links | Automated link checker | Monthly |
| Product/pricing info | Sync with database | Real-time |
| Legal/compliance | Legal team review | Annual |
| Screenshots/images | Visual verification | Quarterly |

### Verification Template

```markdown
## Accuracy Verification: [Page Title]

**URL**: [url]
**Last Verified**: [date]
**Verified By**: [name]

### Factual Claims

| Claim | Source | Verified | Notes |
|-------|--------|----------|-------|
| [claim 1] | [source] | [ ] | |
| [claim 2] | [source] | [ ] | |

### Statistics

| Stat | Original Source | Current Value | Update Needed |
|------|-----------------|---------------|---------------|
| [stat 1] | [source, date] | [value] | [ ] |

### Links

- Total external links: [N]
- Broken links: [N]
- Outdated links: [N]

### Overall Accuracy: [Pass/Fail]
```

## Comprehensiveness Evaluation

Does the content fully address the topic and user intent?

### Comprehensiveness Criteria

| Criterion | Weight | Evaluation |
|-----------|--------|------------|
| Topic coverage | 30% | All key aspects addressed |
| Question answering | 25% | Common questions answered |
| Depth vs competitors | 20% | As thorough as top-ranking content |
| Supporting media | 15% | Images, videos, diagrams where helpful |
| Actionable takeaways | 10% | Clear next steps for reader |

### Gap Analysis Method

1. **Identify top 5 ranking pages** for target keyword
2. **Extract H2/H3 headings** from each
3. **Create topic matrix** showing coverage
4. **Identify gaps** in your content
5. **Prioritize additions** by search intent

### Example Topic Matrix

| Subtopic | Your Page | Competitor 1 | Competitor 2 | Competitor 3 |
|----------|-----------|--------------|--------------|--------------|
| Introduction | ✓ | ✓ | ✓ | ✓ |
| Feature comparison | ✓ | ✓ | ✓ | ✗ |
| Pricing breakdown | ✗ | ✓ | ✓ | ✓ |
| User reviews | ✗ | ✗ | ✓ | ✓ |
| FAQ section | ✓ | ✓ | ✗ | ✓ |

**Gap identified**: Pricing breakdown, User reviews

## Audit Deliverables

### Content Audit Spreadsheet

**Columns**:
```
URL | Title | Type | Category | Word Count | Published | Modified |
Organic Traffic | Bounce Rate | Time on Page | Top Keyword | Position |
E-E-A-T Score | Readability Score | Keyword Score | Freshness Score |
Overall Score | Status | Priority | Action | Notes
```

### Executive Summary Template

```markdown
# Content Audit Summary

**Audit Date**: [date]
**Scope**: [full site / section]
**Total Pages Audited**: [N]

## Key Findings

### Content Health Distribution

| Status | Count | Percentage |
|--------|-------|------------|
| Keep | [N] | [%] |
| Update | [N] | [%] |
| Consolidate | [N] | [%] |
| Remove | [N] | [%] |

### Top Opportunities

1. [Opportunity 1 - expected impact]
2. [Opportunity 2 - expected impact]
3. [Opportunity 3 - expected impact]

### Immediate Actions Required

1. [Action 1 - deadline]
2. [Action 2 - deadline]
3. [Action 3 - deadline]

### Resource Requirements

- Content updates: [N] pages, [X] hours estimated
- New content: [N] pieces, [X] hours estimated
- Technical fixes: [N] issues, [X] hours estimated

## Recommendations

[Prioritized list of recommendations]
```

## Audit Frequency Recommendations

| Content Volume | Full Audit | Partial Audit | Performance Review |
|----------------|------------|---------------|-------------------|
| < 100 pages | Annually | Quarterly | Monthly |
| 100-500 pages | Annually | Quarterly | Monthly |
| 500-1000 pages | Annually | Monthly | Weekly |
| 1000+ pages | Semi-annually | Monthly | Weekly |

## Tools for Content Audits

| Tool | Use Case | Price |
|------|----------|-------|
| Screaming Frog | URL crawling, technical data | Free (up to 500 URLs) |
| Google Analytics | Traffic, engagement metrics | Free |
| Google Search Console | Search performance | Free |
| Ahrefs/SEMrush | Backlinks, keyword rankings | Paid |
| ContentKing | Real-time monitoring | Paid |
| Clearscope | Content optimization | Paid |

## References

- [SEMrush - How to Conduct a Content Audit (2026)](https://www.semrush.com/blog/content-audit/)
- [Moz - The Complete Guide to Content Auditing (2025)](https://moz.com/blog/content-audit-guide)
- [Google Search Central - Helpful Content Guidelines](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Content Marketing Institute - Content Audit Template (2026)](https://contentmarketinginstitute.com/articles/content-audit-template/)
