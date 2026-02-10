# E-E-A-T Evaluation Framework

Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is the foundation for content quality evaluation. This document provides a systematic scoring rubric for assessing content against E-E-A-T criteria.

## Overview

E-E-A-T was updated in December 2022 to add "Experience" as the first E. It represents Google's quality guidelines for evaluating content credibility, particularly important for YMYL (Your Money Your Life) topics.

### YMYL Topics (Higher E-E-A-T Standards)

| Category | Examples |
|----------|----------|
| Health & Safety | Medical advice, drug information, emergency procedures |
| Financial | Investment advice, tax guidance, banking |
| Legal | Legal advice, citizenship, divorce |
| News & Current Events | Political news, scientific discoveries |
| Shopping | Online transactions, product safety |
| Groups of People | Information about protected classes |

## Scoring Rubric

Each E-E-A-T signal is scored 0-3, for a total of 0-12 points.

### Experience (0-3 points)

**Definition**: First-hand, real-world experience with the topic.

| Score | Criteria | Indicators |
|-------|----------|------------|
| 0 | No experience evident | Generic content, no personal perspective |
| 1 | Minimal experience | Brief mentions of personal use or exposure |
| 2 | Moderate experience | Detailed personal anecdotes, real examples |
| 3 | Extensive experience | Deep first-hand knowledge, case studies, photos/videos |

**Evaluation Questions**:
- Does the author demonstrate actual use/experience with the product/topic?
- Are there personal stories, photos, or unique insights?
- Would a reader believe the author has "been there, done that"?

**Strong Experience Signals**:
- "I've been using X for 5 years..."
- Original photos/videos of the author with the subject
- Detailed process descriptions only possible with hands-on experience
- Acknowledgment of limitations discovered through experience

### Expertise (0-3 points)

**Definition**: Formal knowledge and skill in the subject area.

| Score | Criteria | Indicators |
|-------|----------|------------|
| 0 | No expertise evident | Factual errors, surface-level coverage |
| 1 | Basic expertise | Accurate but shallow, common knowledge only |
| 2 | Solid expertise | Comprehensive coverage, technical accuracy |
| 3 | Expert-level | Deep analysis, unique insights, professional credentials |

**Evaluation Questions**:
- Is the content technically accurate?
- Does it cover the topic comprehensively?
- Are complex concepts explained correctly?
- Does the author have relevant credentials?

**Strong Expertise Signals**:
- Professional credentials displayed (MD, CPA, JD, etc.)
- Technical depth appropriate to the topic
- Coverage of edge cases and nuances
- References to primary sources and research

### Authoritativeness (0-3 points)

**Definition**: Recognition by others as a trusted source.

| Score | Criteria | Indicators |
|-------|----------|------------|
| 0 | No authority | Unknown source, no external validation |
| 1 | Limited authority | Some backlinks, occasional mentions |
| 2 | Established authority | Regular citations, industry recognition |
| 3 | Leading authority | Go-to source, awards, media features |

**Evaluation Questions**:
- Do other reputable sites link to this content?
- Is the author/site cited as a source by others?
- Does the author have a recognized reputation in the field?
- Are there industry awards or certifications?

**Strong Authority Signals**:
- Backlinks from authoritative domains (.edu, .gov, major publications)
- Featured in industry publications or conferences
- Author has verified social profiles with following
- Brand mentions in news articles or Wikipedia

### Trustworthiness (0-3 points)

**Definition**: Reliability, safety, and transparency of the content and site.

| Score | Criteria | Indicators |
|-------|----------|------------|
| 0 | Untrustworthy | Misleading, no contact info, security issues |
| 1 | Basic trust | Contact info present, no major red flags |
| 2 | Good trust | Clear policies, accurate content, secure site |
| 3 | Excellent trust | Transparent practices, corrections policy, verified info |

**Evaluation Questions**:
- Is the content accurate and up-to-date?
- Is there clear contact information and about page?
- Are there privacy policy and terms of service?
- Is the site secure (HTTPS)?
- Are there clear correction/update policies?

**Strong Trust Signals**:
- HTTPS with valid certificate
- Clear contact information (physical address, phone)
- Published privacy policy and terms
- Visible correction/update history
- Third-party trust seals (BBB, TrustPilot, etc.)

## Composite Score Interpretation

| Total Score | Rating | Interpretation |
|-------------|--------|----------------|
| 10-12 | Excellent | High-quality, trustworthy content |
| 8-9 | Good | Solid quality, minor improvements possible |
| 5-7 | Needs Improvement | Significant gaps in credibility signals |
| 0-4 | Poor | Major quality concerns, not recommended |

### Score Thresholds for YMYL Content

YMYL topics require higher standards:

| Content Type | Minimum Score | Recommendation |
|--------------|---------------|----------------|
| YMYL (health, finance, legal) | 9+ | Expert authorship required |
| News/Current Events | 8+ | Fact-checking essential |
| General informational | 6+ | Standard quality bar |
| Entertainment/Opinion | 4+ | Lower bar, authenticity matters |

## E-E-A-T Improvement Strategies

### Quick Wins (Implement in < 1 day)

1. **Add author bios** with credentials and photo
2. **Display last updated dates** on all content
3. **Add contact page** with real contact information
4. **Implement HTTPS** if not already done
5. **Link to sources** for factual claims

### Medium-Term Improvements (1-4 weeks)

1. **Create About page** detailing company/author background
2. **Add case studies** demonstrating experience
3. **Get testimonials** from clients/customers
4. **Implement schema markup** for author and organization
5. **Build backlinks** through guest posting and PR

### Long-Term Authority Building (1-6 months)

1. **Publish original research** or data
2. **Speak at industry events** or podcasts
3. **Get mentioned in authoritative publications**
4. **Build social proof** (followers, engagement)
5. **Earn industry awards** or certifications

## Schema Markup for E-E-A-T

Implementing structured data helps search engines understand E-E-A-T signals:

### Author Schema (Person)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Dr. Jane Smith",
  "jobTitle": "Chief Medical Officer",
  "alumniOf": "Harvard Medical School",
  "sameAs": [
    "https://twitter.com/drjanesmith",
    "https://linkedin.com/in/drjanesmith"
  ],
  "knowsAbout": ["Internal Medicine", "Preventive Care"]
}
```

### Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Health First Clinic",
  "foundingDate": "2010",
  "award": "Best Healthcare Provider 2025",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-123-4567",
    "contactType": "customer service"
  }
}
```

### Article Schema with Author

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Understanding Heart Health",
  "author": {
    "@type": "Person",
    "name": "Dr. Jane Smith",
    "url": "https://example.com/authors/dr-jane-smith"
  },
  "datePublished": "2026-01-15",
  "dateModified": "2026-01-15"
}
```

## E-E-A-T Audit Template

Use this template for systematic content evaluation:

```markdown
## E-E-A-T Audit: [Content Title]

**URL**: [url]
**Audit Date**: [date]
**Auditor**: [name]

### Experience (Score: _/3)
- [ ] First-hand experience demonstrated
- [ ] Personal examples or case studies
- [ ] Original photos/videos
- **Notes**:

### Expertise (Score: _/3)
- [ ] Author credentials visible
- [ ] Technical accuracy verified
- [ ] Comprehensive coverage
- **Notes**:

### Authoritativeness (Score: _/3)
- [ ] External citations/backlinks
- [ ] Industry recognition
- [ ] Author reputation established
- **Notes**:

### Trustworthiness (Score: _/3)
- [ ] Contact information present
- [ ] Privacy policy published
- [ ] HTTPS enabled
- [ ] Content accurate and current
- **Notes**:

### Total Score: _/12

### Recommendations:
1.
2.
3.
```

## References

- [Google Search Quality Evaluator Guidelines](https://static.googleusercontent.com/media/guidelines.raterhub.com/en//searchqualityevaluatorguidelines.pdf)
- [Google Search Central - Creating Helpful Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Search Engine Journal - E-E-A-T Guide (2026)](https://www.searchenginejournal.com/google-eat/)
