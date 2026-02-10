# Layout Principles

Effective slide layouts guide the audience's eye and reinforce your message through visual hierarchy.

> **Back to**: [SKILL.md](../SKILL.md)

## Core Principles

### 1. Split Layouts

Most slides work best with a text/visual split:

| Layout | Use Case |
|--------|----------|
| **60/40** (text/visual) | Data-driven slides, charts with narrative |
| **50/50** | Comparison slides, before/after |
| **40/60** (visual/text) | Visual-first storytelling, image-heavy |
| **70/30** | Text-heavy with supporting icon/small chart |

```
┌──────────────────────────────────────────────────┐
│ [Action Title]                                   │
├─────────────────────────┬────────────────────────┤
│                         │                        │
│   TEXT CONTENT          │   VISUAL               │
│   (60%)                 │   (40%)                │
│                         │                        │
│   • Key point 1         │   [Chart/Image/        │
│   • Key point 2         │    Diagram]            │
│   • Key point 3         │                        │
│                         │                        │
├─────────────────────────┴────────────────────────┤
│ [Source/Footer]                                  │
└──────────────────────────────────────────────────┘
```

### 2. Margins and Spacing

| Element | Minimum | Recommended |
|---------|---------|-------------|
| **Outer margins** | 0.5 inch | 0.75 inch |
| **Between elements** | 0.25 inch | 0.5 inch |
| **Text to edge** | 0.25 inch | 0.5 inch |
| **Above footer** | 0.25 inch | 0.5 inch |

### 3. Grid Alignment

All elements should snap to an underlying grid:

```
┌─────┬─────┬─────┬─────┬─────┬─────┐
│     │     │     │     │     │     │
├─────┼─────┼─────┼─────┼─────┼─────┤
│     │     │     │     │     │     │
├─────┼─────┼─────┼─────┼─────┼─────┤
│     │     │     │     │     │     │
├─────┼─────┼─────┼─────┼─────┼─────┤
│     │     │     │     │     │     │
└─────┴─────┴─────┴─────┴─────┴─────┘
      6-column grid (common)
```

**Tips**:
- Use PowerPoint's grid (View → Guides)
- Align left edges of text blocks
- Align chart/image edges with text
- Keep consistent gutter width

### 4. White Space

White space is not wasted space - it:
- Improves readability
- Creates visual hierarchy
- Signals importance
- Reduces cognitive load

```
CROWDED (BAD)              BREATHING ROOM (GOOD)
┌──────────────────┐       ┌──────────────────┐
│Title             │       │                  │
│TextTextTextText  │       │ Title            │
│TextTextTextText  │       │                  │
│TextTextTextText  │       │ Text block       │
│[Chart][Chart]    │       │ with space       │
│More text         │       │                  │
└──────────────────┘       │ [Chart]          │
                           │                  │
                           └──────────────────┘
```

## Color Usage

### Color Hierarchy

| Color Role | Use For | Example |
|------------|---------|---------|
| **Primary** | Headers, key data points, emphasis | Corporate blue |
| **Secondary** | Supporting elements, secondary data | Lighter blue |
| **Accent** | Call-to-action, highlights, alerts | Orange/Yellow |
| **Grayscale** | Background, less important items | Gray scale |

### Color Guidelines

1. **Limit palette**: Max 3-4 colors plus grayscale
2. **Consistent meaning**: Same color = same meaning throughout
3. **Accessible contrast**: 4.5:1 ratio for text (WCAG AA)
4. **Brand alignment**: Use official brand colors

### Common Color Schemes

```
Professional/Corporate:
  Primary:   #0066CC (blue)
  Secondary: #4D94FF (light blue)
  Accent:    #FF9933 (orange)
  Neutral:   #666666 (gray)

Modern/Tech:
  Primary:   #6366F1 (indigo)
  Secondary: #818CF8 (light indigo)
  Accent:    #10B981 (emerald)
  Neutral:   #4B5563 (slate)

Consulting/Formal:
  Primary:   #1A365D (navy)
  Secondary: #2B4F81 (medium blue)
  Accent:    #C05621 (rust)
  Neutral:   #4A5568 (charcoal)
```

## Visual Hierarchy

### The F-Pattern

Audiences scan slides in an F-pattern:

```
┌──────────────────────────┐
│ ████████████████████     │ ← Title (read first)
│ ████████████             │ ← First line (high attention)
│ ████████                 │ ← Decreasing attention
│ ████                     │
│ ███████████████          │ ← Visual catches eye
└──────────────────────────┘
```

**Implications**:
- Put most important info at top-left
- Use visuals on right to draw eye
- Front-load key messages

### Z-Pattern (for balanced layouts)

```
┌──────────────────────────┐
│ 1 ───────────────────► 2 │
│                  ╲       │
│                   ╲      │
│                    ╲     │
│ 3 ◄───────────────── 4   │
└──────────────────────────┘
```

## Common Layout Patterns

### Two-Column Comparison
```
┌─────────────────────────────────────┐
│ [Action Title: A is better than B]  │
├─────────────────┬───────────────────┤
│    OPTION A     │    OPTION B       │
│    ✓ Pro 1      │    ✗ Con 1        │
│    ✓ Pro 2      │    ✗ Con 2        │
│    ✓ Pro 3      │    ○ Neutral      │
└─────────────────┴───────────────────┘
```

### Three-Column Process
```
┌─────────────────────────────────────┐
│ [Process Title]                     │
├───────────┬───────────┬─────────────┤
│  PHASE 1  │  PHASE 2  │  PHASE 3    │
│  [Icon]   │  [Icon]   │  [Icon]     │
│  Step 1   │  Step 2   │  Step 3     │
│  Step 2   │  Step 2   │  Step 3     │
└───────────┴───────────┴─────────────┘
```

### Dashboard Grid
```
┌─────────────────────────────────────┐
│ [KPI Dashboard: All metrics green]  │
├───────────┬───────────┬─────────────┤
│  ┌─────┐  │  ┌─────┐  │  ┌─────┐    │
│  │ KPI │  │  │ KPI │  │  │ KPI │    │
│  │  1  │  │  │  2  │  │  │  3  │    │
│  └─────┘  │  └─────┘  │  └─────┘    │
├───────────┼───────────┼─────────────┤
│  ┌─────┐  │  ┌─────┐  │  ┌─────┐    │
│  │ KPI │  │  │ KPI │  │  │ KPI │    │
│  │  4  │  │  │  5  │  │  │  6  │    │
│  └─────┘  │  └─────┘  │  └─────┘    │
└───────────┴───────────┴─────────────┘
```

## Related Files

- [Chart Selection](./chart-selection.md) - Choosing the right visualization
- [Typography](./typography.md) - Font sizing and hierarchy
- [McKinsey Templates](../mckinsey-templates.md) - Ready-to-use layouts
