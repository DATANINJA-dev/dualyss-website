# Source Evaluation Rubric

How to assess the quality and reliability of research sources.

## Quality Dimensions

### Authority (Weight: 40%)

How credible is the source?

| Score | Criteria | Examples |
|-------|----------|----------|
| 9-10 | Official documentation, standards bodies | MDN, W3C, OWASP, RFC specs |
| 7-8 | Industry leaders, recognized experts | Google developers, Martin Fowler, official tech blogs |
| 5-6 | Professional blogs, established publications | Smashing Magazine, CSS-Tricks, InfoQ |
| 3-4 | Community resources, forums | Stack Overflow, Reddit (verified answers) |
| 1-2 | Unknown authorship, user-generated | Random blogs, unverified Medium posts |

### Recency (Weight: 30%)

How current is the information?

| Score | Criteria |
|-------|----------|
| 9-10 | Current year or last 6 months |
| 7-8 | 1-2 years old |
| 5-6 | 2-3 years old |
| 3-4 | 3-5 years old |
| 1-2 | 5+ years old |

**Recency Modifiers by Domain Type:**

| Domain Type | Recency Importance | Adjustment |
|-------------|-------------------|------------|
| AI/ML | Critical | -2 if > 1 year old |
| JS Frameworks | High | -1 if > 2 years old |
| Cloud/DevOps | High | -1 if > 2 years old |
| Security | High | -1 if > 2 years old |
| Database fundamentals | Low | No penalty for older sources |
| Design principles | Low | No penalty for older sources |
| Algorithms | Low | No penalty for older sources |

### Depth (Weight: 30%)

How comprehensive is the coverage?

| Score | Criteria |
|-------|----------|
| 9-10 | Comprehensive coverage, multiple sections, actionable details |
| 7-8 | Good coverage, most aspects addressed |
| 5-6 | Moderate coverage, basics + some depth |
| 3-4 | Surface level, basics only |
| 1-2 | Superficial, minimal content |

**Depth Indicators:**

Positive signals:
- Multiple sections/chapters
- Code examples or demonstrations
- Pros/cons discussions
- Edge cases covered
- References to other sources

Negative signals:
- Single paragraph summaries
- No examples
- Vague recommendations
- Missing important aspects

## Source Quality Score Calculation

```
Quality = (Authority × 0.4) + (Recency × 0.3) + (Depth × 0.3)
```

### Quality Thresholds

| Score | Classification | Use in Research |
|-------|---------------|-----------------|
| >= 7.0 | **Primary** | Use as main reference |
| 5.0-6.9 | **Supporting** | Use to corroborate primary sources |
| 3.0-4.9 | **Supplementary** | Use only if no better alternatives |
| < 3.0 | **Avoid** | Do not include in research |

## Evaluation Checklist

For each source consulted:

```markdown
### Source: [URL/Title]

**Authority Assessment**:
- Author/Organization: [name]
- Credentials: [verified/unknown]
- Score: [1-10]

**Recency Assessment**:
- Publication date: [date]
- Domain type: [fast-moving/stable]
- Score: [1-10]

**Depth Assessment**:
- Coverage breadth: [comprehensive/moderate/surface]
- Actionable details: [yes/no]
- Score: [1-10]

**Composite Score**: [X.X]
**Classification**: [Primary/Supporting/Supplementary/Avoid]
```

## Handling Low-Quality Sources

When only low-quality sources are available:

1. **Note the limitation** explicitly in output
2. **Increase number of sources** (5+ instead of 3)
3. **Look for consensus** across multiple weak sources
4. **Reduce confidence** in final assessment
5. **Flag for manual review** if critical

## Red Flags to Watch For

Automatic score penalties:

| Red Flag | Penalty |
|----------|---------|
| No author attribution | -2 Authority |
| No publication date | -2 Recency |
| AI-generated content (obvious) | -3 All dimensions |
| Promotional/sales content | -2 Authority |
| Factual errors found | -3 Authority |
| Contradicts established standards | Requires verification |
