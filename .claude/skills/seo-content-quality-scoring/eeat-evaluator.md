# E-E-A-T Evaluator

Modular E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) evaluation helper for content quality scoring. Implements Google Quality Rater Guidelines signal detection with weighted 30-point scoring.

## Overview

This evaluator detects E-E-A-T signals in HTML content and returns weighted scores per dimension with actionable recommendations.

## Scoring Breakdown (30 points total)

| Dimension | Max Points | Weight Rationale |
|-----------|------------|------------------|
| Experience | 7 | Real-world, hands-on evidence |
| Expertise | 8 | Credentials, technical depth |
| Authoritativeness | 8 | Citations, external validation |
| Trustworthiness | 7 | Trust signals, transparency |

## Signal Detection

### Experience Detection (0-7 points)

Detects first-person experience, case studies, and hands-on evidence.

```
experience_score = 0

# First-person experience language (+2 points)
experience_first_person = [
  /\b(I've|I have|my experience|in my|years of experience)\b/i,
  /\b(I tested|I used|I tried|I found|personally)\b/i
]
For each pattern in experience_first_person:
  If pattern matches content:
    experience_score += 2
    Break

# Case studies / examples (+2 points)
experience_case_study = [
  /\b(case study|real example|hands-on|first-hand)\b/i,
  /\b(we implemented|we built|we tested|in practice)\b/i
]
For each pattern in experience_case_study:
  If pattern matches content:
    experience_score += 2
    Break

# Personal examples with specifics (+2 points)
experience_specifics = [
  /\b(for example|specifically|in this case)\b/i,
  /\b(when I|after I|before I)\b/i
]
For each pattern in experience_specifics:
  If pattern matches content:
    experience_score += 2
    Break

# Visual evidence of work (+1 point)
If content matches /<img[^>]*alt="[^"]*(screenshot|photo|example|demo)/i:
  experience_score += 1

experience_score = min(experience_score, 7)
```

### Expertise Detection (0-8 points)

Detects author credentials, technical depth, and domain knowledge.

```
expertise_score = 0

# Author credentials/qualifications (+2 points)
credential_pattern = /\b(MD|PhD|CPA|JD|MBA|RN|PE|CFA|PMP|CISSP|certified|licensed)\b/i
If credential_pattern matches content:
  expertise_score += 2

# Author bio present (+2 points)
If content matches /<(div|section|span|p)[^>]*class="[^"]*author[^"]*"/i:
  expertise_score += 2
Else if content matches /<(div|section)[^>]*id="[^"]*author[^"]*"/i:
  expertise_score += 2

# Technical depth - code, formulas, data (+2 points)
technical_patterns = [
  /<(pre|code)|```/i,
  /\b(algorithm|implementation|architecture)\b/i,
  /<table[^>]*>.*?(data|results|comparison)/is
]
For each pattern in technical_patterns:
  If pattern matches content:
    expertise_score += 2
    Break

# Industry terminology (+2 points)
# Detect specialized vocabulary density (>5 technical terms)
If content matches /\b(API|SDK|framework|methodology|protocol|infrastructure)\b/gi more than 5 times:
  expertise_score += 2

expertise_score = min(expertise_score, 8)
```

### Authoritativeness Detection (0-8 points)

Detects external citations, references, and authority markers.

```
authority_score = 0

# External citations - 3+ quality sources (+3 points)
external_link_pattern = /<a[^>]*href="https?:\/\/[^"]*"/gi
external_links = content.match(external_link_pattern) || []
external_link_count = external_links.length

If external_link_count >= 3:
  authority_score += 3
Else if external_link_count >= 1:
  authority_score += 1

# Linked references to authoritative sites (+2 points)
authoritative_domains = /\.(gov|edu|org|ac\.uk|ieee|acm|nature|science)\b/i
If any external_link matches authoritative_domains:
  authority_score += 2

# Citation markers in text (+2 points)
citation_patterns = [
  /\[\d+\]/,           # [1], [2] style
  /\(\d{4}\)/,         # (2024) year citations
  /\bet al\.\b/i,      # Academic et al.
  /according to/i      # Attribution phrases
]
For each pattern in citation_patterns:
  If pattern matches content:
    authority_score += 2
    Break

# Schema.org author markup (+1 point)
If content matches /itemtype="[^"]*Person"|"@type":\s*"Person"/i:
  authority_score += 1

authority_score = min(authority_score, 8)
```

### Trustworthiness Detection (0-7 points)

Detects trust signals and transparency indicators.

```
trust_score = 0

# HTTPS enabled (+1 point) - check if analyzing URL
# (This is typically verified at the command level, assume +1 for file analysis)
trust_score += 1

# Privacy policy present (+1 point)
If content matches /href="[^"]*\/(privacy|policy|terms)/i:
  trust_score += 1

# Contact information available (+1 point)
If content matches /href="[^"]*\/(contact|about|team)/i:
  trust_score += 1

# About page with company details (+2 points)
about_signals = [
  /\b(about us|our team|our company|our story)\b/i,
  /\b(founded|established|since \d{4})\b/i
]
For each pattern in about_signals:
  If pattern matches content:
    trust_score += 2
    Break

# No misleading claims detected (+2 points)
# Check for absence of spammy/misleading patterns
misleading_patterns = [
  /\b(guaranteed|100%|miracle|secret)\b/i,
  /\b(act now|limited time|don't miss)\b/i,
  /\b(get rich|make money fast|no risk)\b/i
]
has_misleading = false
For each pattern in misleading_patterns:
  If pattern matches content:
    has_misleading = true
    Break

If NOT has_misleading:
  trust_score += 2

trust_score = min(trust_score, 7)
```

## Score Aggregation

```
eeat_total = experience_score + expertise_score + authority_score + trust_score
# Maximum possible: 7 + 8 + 8 + 7 = 30

eeat_result = {
  experience: experience_score,     // 0-7
  expertise: expertise_score,       // 0-8
  authority: authority_score,       // 0-8
  trust: trust_score,               // 0-7
  total: eeat_total,                // 0-30
  breakdown: {
    experience: {
      score: experience_score,
      max: 7,
      signals_found: [list of matched signals]
    },
    expertise: {
      score: expertise_score,
      max: 8,
      signals_found: [list of matched signals]
    },
    authority: {
      score: authority_score,
      max: 8,
      signals_found: [list of matched signals]
    },
    trust: {
      score: trust_score,
      max: 7,
      signals_found: [list of matched signals]
    }
  },
  recommendations: generateRecommendations(scores)
}
```

## Recommendation Generator

Generates actionable recommendations sorted by point potential:

```
recommendations = []

# Experience recommendations (max 7 points)
If experience_score < 5:
  If experience_score < 2:
    recommendations.push({
      dimension: "experience",
      action: "Add first-person language describing hands-on experience",
      points_potential: 2,
      priority: "HIGH"
    })
  If experience_score < 4:
    recommendations.push({
      dimension: "experience",
      action: "Include case study or real-world example",
      points_potential: 2,
      priority: "MEDIUM"
    })
  If experience_score < 7:
    recommendations.push({
      dimension: "experience",
      action: "Add screenshots or photos demonstrating work",
      points_potential: 1,
      priority: "LOW"
    })

# Expertise recommendations (max 8 points)
If expertise_score < 6:
  If expertise_score < 2:
    recommendations.push({
      dimension: "expertise",
      action: "Add author credentials (MD, PhD, CPA, etc.)",
      points_potential: 2,
      priority: "HIGH"
    })
  If expertise_score < 4:
    recommendations.push({
      dimension: "expertise",
      action: "Include author bio section with qualifications",
      points_potential: 2,
      priority: "HIGH"
    })
  If expertise_score < 6:
    recommendations.push({
      dimension: "expertise",
      action: "Add technical depth: code examples, data, research",
      points_potential: 2,
      priority: "MEDIUM"
    })

# Authority recommendations (max 8 points)
If authority_score < 6:
  If authority_score < 3:
    recommendations.push({
      dimension: "authority",
      action: "Add 3+ external citations from quality sources",
      points_potential: 3,
      priority: "HIGH"
    })
  If authority_score < 5:
    recommendations.push({
      dimension: "authority",
      action: "Link to authoritative sources (.gov, .edu, research)",
      points_potential: 2,
      priority: "MEDIUM"
    })
  If authority_score < 8:
    recommendations.push({
      dimension: "authority",
      action: "Add Schema.org author markup",
      points_potential: 1,
      priority: "LOW"
    })

# Trust recommendations (max 7 points)
If trust_score < 5:
  If trust_score < 3:
    recommendations.push({
      dimension: "trust",
      action: "Add links to contact page and privacy policy",
      points_potential: 2,
      priority: "HIGH"
    })
  If trust_score < 5:
    recommendations.push({
      dimension: "trust",
      action: "Add about section with company/author details",
      points_potential: 2,
      priority: "MEDIUM"
    })
  If trust_score < 7:
    recommendations.push({
      dimension: "trust",
      action: "Remove any potentially misleading claims",
      points_potential: 2,
      priority: "MEDIUM"
    })

# Sort by priority (HIGH > MEDIUM > LOW) then by points potential
recommendations.sort((a, b) => {
  priority_order = { "HIGH": 0, "MEDIUM": 1, "LOW": 2 }
  If priority_order[a.priority] != priority_order[b.priority]:
    return priority_order[a.priority] - priority_order[b.priority]
  return b.points_potential - a.points_potential
})

# Return top 5 recommendations
return recommendations.slice(0, 5)
```

## Output Contract

The evaluator returns:

```javascript
{
  experience: 0-7,        // Weighted score
  expertise: 0-8,         // Weighted score
  authority: 0-8,         // Weighted score
  trust: 0-7,             // Weighted score
  total: 0-30,            // Sum of all dimensions
  breakdown: {
    experience: { score, max: 7, signals_found: [] },
    expertise: { score, max: 8, signals_found: [] },
    authority: { score, max: 8, signals_found: [] },
    trust: { score, max: 7, signals_found: [] }
  },
  recommendations: [
    { dimension, action, points_potential, priority },
    ...
  ]
}
```

## Verbose Output Format

When verbose mode is enabled, display breakdown table:

```
### E-E-A-T Breakdown
| Dimension | Score | Max | Evidence |
|-----------|-------|-----|----------|
| Experience | 5/7 | 7 | First-person language, case study |
| Expertise | 6/8 | 8 | PhD credential, author bio, code examples |
| Authority | 4/8 | 8 | 3 external links, no .gov/.edu sources |
| Trust | 5/7 | 7 | Contact page, privacy policy, no spam |

### E-E-A-T Recommendations
| Priority | Dimension | Action | Potential |
|----------|-----------|--------|-----------|
| HIGH | authority | Link to authoritative sources (.gov, .edu) | +2 |
| MEDIUM | experience | Add screenshots demonstrating work | +1 |
| LOW | authority | Add Schema.org author markup | +1 |
```

## Reference

Based on Google Quality Rater Guidelines:
- Section 3.4: Experience
- Section 4.0: Expertise
- Section 5.0: Authoritativeness
- Section 6.0: Trustworthiness

## Limitations

- **English only**: Signal patterns are English-centric
- **Heuristic detection**: Not Google's actual algorithm
- **Context-blind**: Cannot assess factual accuracy of claims
- **YMYL detection**: Does not auto-adjust for health/finance content (v2 feature)
