# Typography Guidelines

Consistent typography creates visual hierarchy, improves readability, and maintains professional appearance across your presentation.

> **Back to**: [SKILL.md](../SKILL.md)

## Type Hierarchy

| Element | Weight | Size | Purpose |
|---------|--------|------|---------|
| **Slide Title** | Bold | 24-28pt | Action title - main takeaway |
| **Section Header** | Semi-bold | 18-22pt | Divides content areas |
| **Body Text** | Regular | 14-16pt | Main content, bullets |
| **Footnotes** | Light/Regular | 10-12pt | Sources, caveats |
| **Data Labels** | Regular | 10-14pt | Chart labels, callouts |

## Font Recommendations

### Safe Corporate Fonts

| Primary | Backup | Style |
|---------|--------|-------|
| **Calibri** | Arial | Modern, clean |
| **Arial** | Helvetica | Universal, safe |
| **Helvetica Neue** | Segoe UI | Premium, modern |
| **Segoe UI** | Arial | Microsoft ecosystem |

### Modern/Premium Options

| Font | Best For |
|------|----------|
| **Inter** | Tech, startups |
| **SF Pro** | Apple ecosystem |
| **Roboto** | Google/Android |
| **Montserrat** | Marketing, bold headers |

**Rule**: Stick to 1-2 fonts maximum per presentation.

## Size Guidelines by Context

### Large Room / Projector

```
Title:     28-32pt  (readable from back)
Headers:   22-24pt
Body:      18-20pt
Footnotes: 12-14pt
```

### Screen Share / Virtual

```
Title:     24-28pt  (smaller screens)
Headers:   18-22pt
Body:      14-16pt
Footnotes: 10-12pt
```

### Print / Handout

```
Title:     22-26pt  (closer reading)
Headers:   16-20pt
Body:      12-14pt
Footnotes: 9-11pt
```

## Visual Hierarchy Examples

### Proper Hierarchy

```
┌────────────────────────────────────────┐
│ Sales Grew 23% in Q3               28pt│
│                                        │
│ KEY DRIVERS                        20pt│
│                                        │
│ • New product launch drove         16pt│
│   15% of growth                        │
│                                        │
│ • International expansion added    16pt│
│   8% to revenue                        │
│                                        │
│ Source: Q3 Financial Report        11pt│
└────────────────────────────────────────┘
```

### Flat Hierarchy (Bad)

```
┌────────────────────────────────────────┐
│ Sales Grew 23% in Q3               16pt│
│ KEY DRIVERS                        16pt│
│ New product launch drove           16pt│
│ 15% of growth                      16pt│
│ International expansion added      16pt│
│ 8% to revenue                      16pt│
│ Source: Q3 Financial Report        16pt│
└────────────────────────────────────────┘
  [All same size - no hierarchy]
```

## Formatting Rules

### Text Alignment

| Content Type | Alignment |
|--------------|-----------|
| Titles | Left (or centered if short) |
| Body text | Left |
| Bullet points | Left |
| Numbers in tables | Right |
| Chart labels | Center |

### Line Spacing

| Context | Line Height |
|---------|-------------|
| Titles | 1.0 (single) |
| Body paragraphs | 1.2-1.5 |
| Bullet lists | 1.1-1.3 |
| Dense data | 1.0 |

### Bullet Points

```
GOOD                          BAD
• First level               • First level
  – Second level              • Second level
    · Third level               • Third level

[Distinct markers]          [Same markers - confusing]
```

**Rules**:
- Max 3 levels of indentation
- Different marker at each level
- Keep bullets to 1-2 lines

## Color in Typography

### Text Color Hierarchy

| Element | Color | Hex Example |
|---------|-------|-------------|
| Titles | Primary brand | #1A365D |
| Body | Near-black | #2D3748 |
| Secondary | Dark gray | #4A5568 |
| Disabled/Muted | Medium gray | #A0AEC0 |
| Links | Brand accent | #3182CE |

### Contrast Requirements

```
WCAG AA Contrast Ratios:
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- Important text: 7:1 recommended

Example:
✓ #2D3748 on #FFFFFF = 10.9:1 (excellent)
✗ #A0AEC0 on #FFFFFF = 2.6:1 (fails AA)
```

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Too many fonts | Unprofessional look | Max 2 fonts |
| All caps body | Hard to read | Use for headers only |
| Centered body text | Looks amateur | Left-align |
| Tiny footnotes | Unreadable | Minimum 10pt |
| Tight spacing | Cramped feel | Add breathing room |
| Inconsistent sizes | No hierarchy | Use defined scale |

## Quick Checklist

Before finalizing typography:

- [ ] Maximum 2 font families used
- [ ] Clear size hierarchy (4+ levels)
- [ ] Title is largest, footnotes smallest
- [ ] Body text is 14pt minimum
- [ ] Sufficient contrast (4.5:1+)
- [ ] Consistent alignment throughout
- [ ] Line spacing allows readability
- [ ] Bullet levels are distinguishable

## Related Files

- [Layout Principles](./layout-principles.md) - Text placement on slides
- [Chart Selection](./chart-selection.md) - Chart text sizing
- [McKinsey Templates](../mckinsey-templates.md) - Pre-styled text blocks
