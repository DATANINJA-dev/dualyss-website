# Dualys Brand Guidelines Skill

## Skill Metadata
```yaml
name: brand-guidelines
description: Official Dualys brand colors, typography, and voice guidelines
type: passive
auto_triggers:
  keywords:
    - "color"
    - "colors"
    - "colour"
    - "font"
    - "typography"
    - "branding"
    - "brand"
    - "design"
    - "style"
    - "visual"
    - "logo"
    - "palette"
    - "theme"
```

## Brand Colors (CRITICAL)

**NEVER use navy or gold. The official colors are:**

| Color | Hex | HSL | Usage |
|-------|-----|-----|-------|
| **Black** | `#000000` | `0 0% 0%` | 40% - Primary, backgrounds, text |
| **White** | `#FFFFFF` | `0 0% 100%` | 40% - Backgrounds, contrast |
| **Blue** | `#4F61E7` | `232 77% 61%` | 20% - Accent, CTAs, links |

### Color Distribution
- **40% Black** (#000000) - Dominant, authoritative
- **40% White** (#FFFFFF) - Clean, professional
- **20% Blue** (#4F61E7) - The "y" in Dualys logo, accent color

### Tailwind Implementation
```typescript
// tailwind.config.ts
colors: {
  primary: {
    500: '#000000', // Brand black
    // Grayscale for variations
  },
  accent: {
    500: '#4F61E7', // Pantone 2132 C
    // Blue scale for variations
  }
}
```

### CSS Variables
```css
:root {
  --primary: 0 0% 0%;          /* Black */
  --accent: 232 77% 61%;       /* Blue #4F61E7 */
  --ring: 232 77% 61%;         /* Blue for focus states */
}
```

## Typography

### Display Font (Headings)
- **TOSH A** from Adobe Fonts (requires subscription)
- **Outfit** from Google Fonts (free alternative, currently in use)
- Use for: H1, H2, H3, H4, hero titles
- Weight: Bold (700)
- Tracking: Tight

### Body Font
- **Inter** from Google Fonts
- Use for: Body text, paragraphs, descriptions
- Weight: Regular (400), Medium (500), Semibold (600)
- Line height: 1.5+

### Font Comparison
| Aspect | TOSH A (Adobe) | Outfit (Google) |
|--------|----------------|-----------------|
| Style | Geometric sans | Geometric sans |
| Weights | 6 (Thin-Black) | 9 (100-900) |
| Cost | Adobe subscription | Free |
| Status | Deferred | Currently active |

### Tailwind Configuration
```typescript
fontFamily: {
  display: ['var(--font-outfit)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
  sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
}
```

### Adobe Fonts Setup (Future)
1. Create kit at fonts.adobe.com with TOSH A
2. Add embed code to layout.tsx:
   ```html
   <link rel="stylesheet" href="https://use.typekit.net/YOUR_KIT_ID.css" />
   ```
3. Update `--font-display` CSS variable to use 'tosh-a'

## Tone of Voice

### Core Attributes
- **Analytical**: Data-driven, evidence-based
- **Rigorous**: Thorough, precise
- **Accessible**: Clear without oversimplification

### Writing Guidelines
1. **Professional** - Never casual or informal
2. **Strategic** - Focus on deterrence, not combat
3. **European** - Emphasize EU autonomy and values
4. **Innovation-focused** - Technology as enabler
5. **Protection-oriented** - Defense of democracy

### Avoid
- Military jargon
- Aggressive terminology
- Nationalistic framing
- Technical complexity without context

### Adapt by Audience
| Audience | Tone Adjustment |
|----------|-----------------|
| Institutional | Formal, compliance-focused |
| Industrial | Technical, capability-focused |
| Public | Accessible, values-focused |
| Academic | Research-oriented, collaborative |

## Logo Usage

### Primary Logo
- File: `public/logo.png`
- White text on dark background
- Blue "y" accent

### Clear Space
- Minimum margin: 20% of logo height

### Minimum Sizes
- Digital: 120px width
- Print: 25mm width

### Forbidden
- Do not distort proportions
- Do not change colors
- Do not add effects
- Do not place on busy backgrounds

## Component Patterns

### Buttons
- Primary (default): Black background, white text
- Accent: Blue (#4F61E7) background
- Outline: Black border, blue on hover

### Links
- Default: Neutral color
- Hover: Accent blue (#4F61E7)
- Active: Accent blue (#4F61E7)

### Icons
- Background: Light blue (accent-50)
- Icon color: Accent blue (accent-500)

### Cards
- Border: Neutral gray
- Hover border: Accent blue (accent-300)
- Shadow: Subtle elevation on hover (`hover:shadow-xl`)
- Transform: Lift effect (`hover:-translate-y-1`)

## Motion & Animation

### Brand Animation Principles
- **Confident**: Decisive, purposeful motion (not floaty or hesitant)
- **Smooth**: Use exponential easing for natural feel
- **Subtle**: Enhance UX without distraction
- **Consistent**: Same timing across the site

### Easing Curve
```typescript
// Brand easing: fast start, smooth deceleration
ease: [0.16, 1, 0.3, 1] // cubic-bezier

// Tailwind utility
transitionTimingFunction: {
  'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
}
```

### Animation Timings
| Animation | Duration | Delay Pattern |
|-----------|----------|---------------|
| Fade in | 0.4s | - |
| Slide up | 0.5s | - |
| Stagger items | 0.4s | +0.08s per item |
| Button press | 0.2s | - |

### Keyframes
```typescript
// tailwind.config.ts
keyframes: {
  slideUp: {
    '0%': { opacity: '0', transform: 'translateY(16px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  scaleIn: {
    '0%': { opacity: '0', transform: 'scale(0.96)' },
    '100%': { opacity: '1', transform: 'scale(1)' },
  },
}
```

### Hover States
- Buttons: `active:scale-[0.98]` for click feedback
- Cards: `hover:-translate-y-1` for lift effect
- Accent buttons: `hover:shadow-lg hover:shadow-accent-500/25`

## Accent Dot

### Brand Signature Element
The blue accent dot is a brand signature, derived from the blue "y" in the Dualys logo.

### Component
```tsx
import { AccentDot } from '@/components/brand/AccentDot';

// Usage
<span>Dual-Use Technologies<AccentDot /></span>
```

### Sizes
| Size | Dimensions | Use Case |
|------|------------|----------|
| sm | 4px (h-1 w-1) | Inline with small text |
| md | 6px (h-1.5 w-1.5) | Default, taglines |
| lg | 8px (h-2 w-2) | Large headings |

### Placement Rules
- After taglines and slogans
- After section headers (optional)
- Not after every heading (use sparingly)
- Accessible: `aria-hidden="true"` (decorative)

## Background Treatments

### Hero Sections
- Base: Pure black (`bg-primary-500`)
- Pattern: Subtle SVG at 5% opacity
- Accent gradient: `to-accent-500/10` (10% opacity)

### Why Gradients Are Acceptable
Defense industry research shows subtle gradient accents are standard practice (MBDA, Anduril, Thales). The 5-10% opacity blue gradient:
- Adds depth without creating "navy"
- Matches high-end defense contractor aesthetics
- Maintains brand color integrity

### Example
```tsx
<section className="bg-primary-500">
  {/* SVG pattern at opacity-5 */}
  <div className="absolute inset-0 opacity-5">...</div>
  {/* Accent gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-accent-500/10" />
</section>
```

## Semantic Colors

For UI feedback (not brand colors):

| Purpose | Color | Tailwind |
|---------|-------|----------|
| Success | Green (#22c55e) | `text-success`, `bg-success/10` |
| Warning | Amber (#f59e0b) | `text-warning`, `bg-warning/10` |
| Error | Red (#ef4444) | `text-destructive`, `bg-destructive/10` |
| Info | Blue (#3b82f6) | `text-info`, `bg-info/10` |

## Banned Colors (NEVER USE)

These Tailwind colors are **OFF-BRAND** and will be flagged by the `brand-color-validator.js` hook:

| Banned Family | Replace With |
|---------------|--------------|
| `purple-*`, `violet-*`, `indigo-*` | `accent-*` |
| `pink-*`, `rose-*`, `fuchsia-*` | `neutral-*` |
| `cyan-*`, `sky-*`, `teal-*` | `accent-*` |
| `lime-*`, `orange-*`, `emerald-*` | `neutral-*` |
| `blue-*`, `green-*`, `red-*`, `amber-*` | Use brand tokens instead |

### Why These Are Banned

1. **Brand consistency**: Dualys has a strict 40/40/20 color distribution
2. **Visual identity**: Only black, white, and Pantone 2132 C blue are approved
3. **Automated enforcement**: The hook prevents accidental brand violations

### Exceptions

The only exceptions are **semantic colors** for form feedback:
- Success states (green via `success` token)
- Error states (red via `destructive` token)
- Warning states (amber via `warning` token)

## Quick Reference

```
BRAND COLORS:
  Primary:  #000000 (black)
  Accent:   #4F61E7 (blue)
  White:    #FFFFFF

TYPOGRAPHY:
  Headings: TOSH A (Adobe) / Inter fallback
  Body:     Inter (Google)

DISTRIBUTION:
  40% Black + 40% White + 20% Blue
```
