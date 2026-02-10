---
name: seo-content-quality-scoring
description: |
  Provides patterns for evaluating SEO content quality including E-E-A-T
  framework, readability scoring, and keyword optimization. Auto-activates
  when tasks involve content audits, quality scoring, or SEO copywriting.
---

# SEO Content Quality Scoring Skill

This skill provides comprehensive patterns for evaluating and improving SEO content quality. It covers Google's E-E-A-T framework, readability algorithms, keyword optimization strategies, and content audit methodologies.

## When This Skill Activates

- Tasks involving content quality assessment or scoring
- E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) evaluation
- Readability analysis or improvement
- Keyword optimization and density analysis
- Content audits for SEO compliance
- SEO copywriting guidelines

### Activation Keywords

| Keyword Pattern | Confidence |
|-----------------|------------|
| content quality, quality score, content audit | High |
| E-E-A-T, EEAT, expertise, authoritativeness, trustworthiness | High |
| readability score, Flesch-Kincaid, SMOG, Gunning Fog | High |
| keyword density, keyword optimization, keyword placement | High |
| content freshness, content accuracy, comprehensiveness | Medium |
| SEO copywriting, SEO content, content strategy | Medium |

## Core Principles

### The Quality Triangle

Content quality for SEO rests on three pillars:

1. **Credibility** (E-E-A-T): Who wrote it and why should readers trust it?
2. **Accessibility** (Readability): Can the target audience understand it?
3. **Relevance** (Keywords): Does it match user search intent?

### Quality Scoring Overview

| Dimension | Weight | Evaluation Method |
|-----------|--------|-------------------|
| E-E-A-T Signals | 40% | Rubric-based (0-12 scale) |
| Readability | 30% | Algorithm-based (grade level) |
| Keyword Optimization | 20% | Formula-based (density, placement) |
| Content Freshness | 10% | Date-based (age, update frequency) |

**Total Score**: 0-100, with thresholds:
- **Pass** (Green): >= 70
- **Warn** (Yellow): 50-69
- **Fail** (Red): < 50

### E-E-A-T at a Glance

Google's E-E-A-T framework (updated 2022 to add Experience):

| Signal | What It Measures | Key Indicators |
|--------|-----------------|----------------|
| **E**xperience | First-hand knowledge | Personal anecdotes, case studies, real examples |
| **E**xpertise | Subject matter depth | Credentials, technical accuracy, comprehensive coverage |
| **A**uthoritativeness | Recognition by others | Citations, backlinks, brand mentions, awards |
| **T**rustworthiness | Reliability and safety | Accuracy, transparency, security, editorial standards |

See `eeat-framework.md` for detailed scoring rubric.

## Supporting Files

| File | Purpose |
|------|---------|
| `eeat-framework.md` | Detailed E-E-A-T evaluation rubric with scoring criteria |
| `eeat-evaluator.md` | Modular E-E-A-T signal detection and weighted 30-point scoring (TASK-146) |
| `readability-scoring.md` | Readability algorithms, formulas, and target scores |
| `readability-evaluator.md` | Modular readability scoring with Flesch-Kincaid + Reading Ease (TASK-147) |
| `keyword-optimization.md` | Keyword density, placement patterns, and LSI strategies |
| `content-audit.md` | Content audit methodology and freshness scoring |

## Usage

This skill is automatically activated when content quality tasks are detected. Reference the supporting files for:

- **E-E-A-T Evaluation**: Use `eeat-framework.md` for scoring rubric, `eeat-evaluator.md` for signal detection patterns
- **Readability Analysis**: Use `readability-scoring.md` for algorithms, `readability-evaluator.md` for scoring patterns
- **Keyword Strategy**: Use `keyword-optimization.md` for search visibility optimization
- **Content Audits**: Use `content-audit.md` for comprehensive quality reviews

## Quick Reference

### Minimum Viable Content Quality Checklist

- [ ] Author bio with credentials visible
- [ ] Content updated within last 12 months (date visible)
- [ ] Readability score appropriate for target audience (typically grade 7-9)
- [ ] Primary keyword in title, H1, and first 100 words
- [ ] At least 3 internal links to related content
- [ ] Sources cited for factual claims
- [ ] No broken links or outdated information

### E-E-A-T Quick Audit

```
Experience:  [ ] First-hand examples present
Expertise:   [ ] Author credentials shown
Authority:   [ ] External citations/backlinks
Trust:       [ ] Accurate, transparent, secure
```

### Readability Targets by Audience

| Audience | Flesch-Kincaid Grade | Flesch Reading Ease |
|----------|---------------------|---------------------|
| General public | 7-9 | 60-70 |
| Professional | 10-12 | 50-60 |
| Technical/Academic | 13+ | 30-50 |

### Keyword Density Guidelines

| Keyword Type | Recommended Density |
|--------------|-------------------|
| Primary keyword | 1-2% |
| Secondary keywords | 0.5-1% each |
| LSI/Semantic terms | Natural inclusion |

## Constraints

- Quality scoring is guidance, not absolute truth
- E-E-A-T signals are evaluated by Google's algorithms, not directly measurable
- Readability formulas have limitations (don't account for jargon familiarity)
- Keyword optimization should never compromise readability
- Content quality > keyword stuffing (always)

## Research Sources

- [Google Search Quality Evaluator Guidelines (2024)](https://static.googleusercontent.com/media/guidelines.raterhub.com/en//searchqualityevaluatorguidelines.pdf)
- [Google Search Central - E-E-A-T and Quality Rater Guidelines (2025)](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Yoast - Readability: Why It Matters for SEO (2026)](https://yoast.com/readability-matters-seo/)
- [Moz - On-Page SEO: Keyword Usage Best Practices (2026)](https://moz.com/learn/seo/on-page-factors)
- [SEMrush - Content Audit Guide (2026)](https://www.semrush.com/blog/content-audit/)
