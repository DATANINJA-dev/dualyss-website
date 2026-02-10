# Chart Selection Guide

Choose the right visualization to make your data tell a clear story. The wrong chart can obscure insights or mislead audiences.

> **Back to**: [SKILL.md](../SKILL.md)

## Quick Reference Matrix

| Data Type | Best Chart | Alternatives |
|-----------|------------|--------------|
| **Comparison** (items) | Bar chart | Dot plot, Table |
| **Trend over time** | Line chart | Area chart, Bar chart |
| **Part of whole** | Stacked bar | Pie (max 5), Treemap |
| **Correlation** | Scatter plot | Bubble chart |
| **Distribution** | Histogram | Box plot, Violin |
| **Ranking** | Horizontal bar | Lollipop chart |
| **Flow/Process** | Sankey diagram | Flow chart |
| **Geographic** | Map | Choropleth |

## Detailed Selection Guide

### Comparison Charts

**Use when**: Comparing values across categories

| Situation | Chart | Example |
|-----------|-------|---------|
| Few categories (<8) | Vertical bar | Sales by region |
| Many categories (8+) | Horizontal bar | Sales by product (20 products) |
| Two variables | Grouped bar | Sales vs. Target by region |
| Emphasize differences | Diverging bar | Above/below benchmark |

```
BAR CHART                    GROUPED BAR
┌────────────────────┐       ┌────────────────────┐
│ A ████████████     │       │ A ████████ ██████  │
│ B █████████        │       │ B ██████ █████     │
│ C ██████████████   │       │ C ████████████ ████│
│ D ███████          │       │   [Sales] [Target] │
└────────────────────┘       └────────────────────┘
```

### Time Series Charts

**Use when**: Showing change over time

| Situation | Chart | Example |
|-----------|-------|---------|
| Single trend | Line chart | Revenue over 12 months |
| Multiple trends | Multi-line | Revenue by region over time |
| Cumulative totals | Stacked area | Total users by segment |
| Discrete periods | Bar chart | Quarterly results |

```
LINE CHART                   AREA CHART
     ╱╲                           ┌──────────┐
    ╱  ╲    ╱╲                   █████████████
   ╱    ╲  ╱  ╲                  ███████████
  ╱      ╲╱    ╲                 █████████
 ╱               ╲               ████████
───────────────────             ─────────────
```

### Part-to-Whole Charts

**Use when**: Showing composition or proportion

| Situation | Chart | Example |
|-----------|-------|---------|
| Simple composition (2-5 parts) | Pie/Donut | Market share |
| Many segments | Stacked bar | Revenue mix by quarter |
| Hierarchical | Treemap | Budget breakdown |
| Part vs total | Waterfall | Revenue to profit bridge |

**Pie Chart Rules**:
- Maximum 5 slices (combine smaller into "Other")
- Start at 12 o'clock, clockwise
- Largest slice first
- Label directly (no legend if possible)
- Avoid 3D effects

```
PIE (GOOD)                   PIE (BAD)
     ╭───────╮                    ╭───────╮
   ╱ A  45% ╲                  ╱ 1 │ 2 │ 3 ╲
  │ ───────── │                │  4│ 5 │ 6  │
  │ B   30%   │                │  7│ 8 │ 9  │
   ╲ C  25%  ╱                  ╲ 10│11│12 ╱
     ╰───────╯                    ╰───────╯
 [Clear, 3 slices]           [Too many slices]
```

### Correlation Charts

**Use when**: Showing relationship between variables

| Situation | Chart | Example |
|-----------|-------|---------|
| Two variables | Scatter plot | Price vs. Sales |
| Three variables | Bubble chart | Price vs. Sales, sized by profit |
| Correlation strength | Correlation matrix | Multi-variable relationships |

```
SCATTER PLOT                 BUBBLE CHART
  │       •  •                │       ●  •
  │    •  •                   │    ○  ●
  │  •   •                    │  ○   •
  │ •  •                      │ ○  •
  └────────────               └────────────
```

### Distribution Charts

**Use when**: Showing spread or frequency of data

| Situation | Chart | Example |
|-----------|-------|---------|
| Single distribution | Histogram | Customer age distribution |
| Compare distributions | Box plot | Salary by department |
| Detailed distribution | Violin plot | Test scores by class |

## Chart Best Practices

### Do's

- **Label directly** on data points when possible
- **Start Y-axis at zero** for bar charts
- **Use consistent colors** across related charts
- **Include data source** in footer
- **Title the chart** with the insight, not just the data

### Don'ts

| Avoid | Why | Instead |
|-------|-----|---------|
| 3D effects | Distorts perception | Use 2D |
| Dual Y-axes | Confuses comparison | Separate charts |
| Pie for comparison | Hard to compare slices | Use bar chart |
| Truncated axes | Exaggerates differences | Start at zero |
| Too many colors | Visual noise | Max 6-8 colors |

## Formatting Guidelines

### Data Labels

```
GOOD: Direct labels           BAD: Legend required
┌────────────────────┐       ┌────────────────────┐
│ A █████████ 45%    │       │ A ████████████     │
│ B ████████ 38%     │       │ B ██████████       │
│ C ████████ 17%     │       │ C ████████         │
└────────────────────┘       │ [A=45, B=38, C=17] │
                             └────────────────────┘
```

### Gridlines

- Use light gray (#E0E0E0) for gridlines
- Remove unnecessary gridlines
- Horizontal gridlines usually more useful than vertical

### Annotations

```
┌──────────────────────────────────────┐
│        /\                            │
│       /  \    ← "Launch event        │
│      /    \      drove 50% spike"    │
│ ____/      \________                 │
└──────────────────────────────────────┘
```

## Related Files

- [Layout Principles](./layout-principles.md) - Positioning charts on slides
- [Typography](./typography.md) - Chart text sizing
- [McKinsey Templates](../mckinsey-templates.md) - Chart slide layouts
