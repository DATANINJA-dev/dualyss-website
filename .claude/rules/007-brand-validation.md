# Brand Color Validation Rule

## Purpose

This rule ensures all visual components use only Dualys brand-approved colors. Automated enforcement prevents brand drift and maintains visual consistency.

## Automated Enforcement

All TSX components are validated by:

| Component | File | Trigger |
|-----------|------|---------|
| Hook | `.claude/hooks/brand-color-validator.js` | PostToolUse on Write/Edit |
| Skill | `.claude/skills/brand-guidelines/SKILL.md` | Auto-activates on color keywords |

## Allowed Color Families

| Family | Tailwind Classes | Usage |
|--------|-----------------|-------|
| `primary-*` | `primary-50` to `primary-950` | Backgrounds, text (40% of design) |
| `accent-*` | `accent-50` to `accent-950` | CTAs, links, highlights (20% of design) |
| `neutral-*` | `neutral-50` to `neutral-950` | Secondary text, borders |
| `success` | `bg-success`, `text-success` | Form success states |
| `destructive` | `bg-destructive`, `text-destructive` | Form errors |
| `warning` | `bg-warning`, `text-warning` | Warning indicators |
| `info` | `bg-info`, `text-info` | Informational elements |

### Using Opacity with Semantic Colors

For lighter semantic color backgrounds:
```tsx
// Correct usage
<div className="bg-success/10 border-success/30 text-success">
<div className="bg-destructive/10 border-destructive/30 text-destructive">
```

## Banned Color Classes

These Tailwind color families are **OFF-BRAND** and will be flagged:

| Banned | Reason | Replace With |
|--------|--------|--------------|
| `purple-*`, `violet-*`, `indigo-*` | Not in brand palette | `accent-*` |
| `pink-*`, `rose-*`, `fuchsia-*` | Not in brand palette | `neutral-*` |
| `cyan-*`, `sky-*`, `teal-*` | Not in brand palette | `accent-*` |
| `lime-*`, `orange-*`, `emerald-*` | Not in brand palette | `neutral-*` or semantic |

### Examples of Violations

```tsx
// OFF-BRAND (will be flagged)
<div className="bg-purple-50 text-purple-600">
<div className="bg-green-50 text-green-600">
<div className="text-pink-500">

// ON-BRAND (correct)
<div className="bg-accent-50 text-accent-600">
<div className="bg-success/10 text-success">
<div className="text-neutral-500">
```

## Hardcoded Hex Colors

Avoid hardcoded hex values. Use Tailwind tokens instead.

**Allowed Hex (if absolutely necessary):**
- `#000000` - Brand black
- `#FFFFFF` - White
- `#4F61E7` - Brand accent blue (Pantone 2132 C)

**Flagged:**
- Any other hardcoded hex value
- Approximate colors like `#4A90D9`

## Fixing Violations

| Violation Type | How to Fix |
|----------------|------------|
| `bg-purple-*` | Use `bg-accent-*` or `bg-neutral-*` |
| `text-green-*` | Use `text-success` or `text-neutral-*` |
| `border-red-*` | Use `border-destructive` or `border-destructive/50` |
| `#XXXXXX` | Replace with Tailwind token |

## Running Validation Manually

```bash
# Validate a specific file
node .claude/hooks/brand-color-validator.js src/components/MyComponent.tsx

# Search for violations in codebase
grep -rn "purple-\|violet-\|indigo-\|pink-\|rose-" src/
```

## Integration with /audit

The `/audit` command includes brand color validation in its checks. Run:

```
/audit
```

To get a comprehensive report including brand compliance.

## Brand Color Reference

```
OFFICIAL DUALYS COLORS:
━━━━━━━━━━━━━━━━━━━━━━━━
Primary:    #000000 (black)     - 40%
White:      #FFFFFF             - 40%
Accent:     #4F61E7 (blue)      - 20%

DISTRIBUTION RULE:
40% Black + 40% White + 20% Blue Accent
```

See `.claude/skills/brand-guidelines/SKILL.md` for complete brand guide.
