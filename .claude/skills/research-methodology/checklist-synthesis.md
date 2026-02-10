# Checklist Synthesis Process

How to transform research findings into structured, actionable checklists.

## Overview

Converting raw research into a useful checklist requires:
1. Extracting items from multiple sources
2. Categorizing into logical groups
3. Deduplicating and merging
4. Weighting by importance
5. Formatting for use

## Step-by-Step Process

### Step 1: Extract Items

From each quality source (score >= 5.0), extract:

| Extract Type | Example |
|--------------|---------|
| Explicit checklist items | "- [ ] Verify meta descriptions" |
| Key points from guides | "Always include canonical URLs" |
| Warnings/must-haves | "Never skip mobile optimization" |
| Categories/sections | "Technical SEO", "On-Page SEO" |
| Quantitative standards | "Title tags should be 50-60 characters" |

**Extraction Template:**

```markdown
### From [Source Name] (Quality: X.X)

**Categories mentioned:**
- [Category 1]
- [Category 2]

**Items extracted:**
1. [Item with source quote/paraphrase]
2. [Item with source quote/paraphrase]
```

### Step 2: Categorize

Group extracted items into 3-5 logical categories:

**Category Selection Rules:**
- Use category names consistent across sources when possible
- Create logical groupings when sources differ
- Aim for 5-10 items per category
- Categories should be mutually exclusive

**Common Category Patterns:**

| Domain | Typical Categories |
|--------|-------------------|
| SEO | Technical, On-Page, Off-Page, Performance |
| Security | Authentication, Authorization, Input Validation, Data Protection |
| UX | Accessibility, User Flows, Responsive, Interaction |
| Testing | Unit, Integration, E2E, Quality |
| API Design | Structure, Error Handling, Documentation, Security |

### Step 3: Deduplicate

Merge similar items from different sources:

**Deduplication Rules:**
- Merge items with same meaning, different wording
- Keep the most specific/actionable wording
- Track source count for each item (indicates importance)
- Note when multiple sources mention same item

**Example:**
```
Source 1: "Ensure title tags are present"
Source 2: "Add unique title tags to all pages"
Source 3: "Title tags should be 50-60 characters"

Merged: "Add unique title tags (50-60 chars) to all pages" (sources: 3/3)
```

### Step 4: Weight Categories

Assign importance percentages to categories:

**Weighting Factors:**
- Source emphasis (how much space dedicated)
- Mention frequency across sources
- Explicit priority indicators in sources
- Impact on domain success

**Total must equal 100%**

**Typical Weight Distribution:**
| Weight | Meaning |
|--------|---------|
| 30-40% | Primary/critical category |
| 20-30% | Important category |
| 10-20% | Supporting category |
| 5-10% | Nice-to-have category |

### Step 5: Format Output

Structure the final checklist:

```markdown
## [Domain] Coverage Checklist (Research-Based)

**Research Metadata:**
- Sources consulted: [N]
- Average source quality: [X.X]/10
- Research date: [YYYY-MM-DD]

---

### [Category 1] ([X]%)

| Item | Sources | Priority |
|------|---------|----------|
| [Actionable item 1] | 3/3 | High |
| [Actionable item 2] | 2/3 | Medium |
| [Actionable item 3] | 1/3 | Low |

### [Category 2] ([Y]%)

| Item | Sources | Priority |
|------|---------|----------|
| [Actionable item 1] | 3/3 | High |
...

---

**Total items:** [N]
**High priority:** [N] | **Medium:** [N] | **Low:** [N]
```

## Checklist Quality Indicators

A well-synthesized checklist has:

| Criterion | Target |
|-----------|--------|
| Total items | 20-35 |
| Categories | 3-5 |
| Items per category | 5-10 |
| High priority items | 5-10 (most important) |
| Source coverage | Each item from 2+ sources ideally |
| Weights sum | 100% |

## Priority Assignment

Based on source coverage and emphasis:

| Sources Mentioning | Typical Priority |
|-------------------|------------------|
| 3+ of 3 | **High** - Essential |
| 2 of 3 | **Medium** - Important |
| 1 of 3 | **Low** - Nice to have |

## Edge Cases

### Too Few Items (< 15)
- Domain may be niche or poorly documented
- Expand search with broader queries
- Accept smaller checklist but note limitation

### Too Many Items (> 40)
- Merge more aggressively
- Prioritize higher-source-count items
- Consider splitting into sub-checklists

### Category Imbalance
- If one category has 20+ items, split it
- If one category has < 3 items, merge with related category

### Conflicting Items
- Note the conflict in output
- Prefer more authoritative/recent source
- Include both if genuinely valid alternatives
