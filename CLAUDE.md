# Dualys Website Project

**Slogan**: "Protecting democracy with dual deterrence technologies"

Catalan AIE specializing in dual-use technologies for defense, cybersecurity, and biosecurity. Corporate website serving institutional, industrial, and public audiences across Europe.

## Brand (CRITICAL)

**YOU MUST use these exact colors. Never use navy or gold.**

| Element | Value | Usage |
|---------|-------|-------|
| Primary | `#000000` (black) | 40% - Backgrounds, text |
| Accent | `#4F61E7` (blue) | 20% - CTAs, links, highlights |
| White | `#FFFFFF` | 40% - Contrast, clean |

**Typography**: TOSH A (headings) + Inter (body)

See: `.claude/skills/brand-guidelines/SKILL.md` for complete brand guide.

## Tech Stack

| Aspect | Value |
|--------|-------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | next-intl (6 languages: en, fr, es, de, it, ca) |
| Target | Lighthouse 95+, WCAG 2.2 AA |

## Key Rules

Read before making changes:
- `001-project-identity.md` - Brand and messaging
- `002-technical-standards.md` - Code standards
- `003-seo-checklist.md` - SEO requirements
- `004-content-structure.md` - Sitemap and content
- `005-brand-assets.md` - Logo and asset files
- `007-brand-validation.md` - Color validation rules

Located in `.claude/rules/`

## Brand Validation

**Automated checks prevent brand violations:**

| Component | Purpose |
|-----------|---------|
| `brand-color-validator.js` | Flags off-brand Tailwind colors |
| `brand-guidelines` skill | Reference for approved colors |

**Banned colors** (will be flagged):
- `purple-*`, `violet-*`, `indigo-*`
- `pink-*`, `rose-*`, `fuchsia-*`
- `cyan-*`, `sky-*`, `teal-*`, `lime-*`, `orange-*`

**Use instead**: `primary-*`, `accent-*`, `neutral-*`, or semantic (`success`, `destructive`)

Run `/audit` to check current compliance.

## Commands

### SEO
- `/seo-validate-meta` - Meta tags
- `/seo-validate-hreflang` - Language alternates
- `/seo-validate-structured` - JSON-LD schemas
- `/seo-validate-quality` - E-E-A-T scoring

### Development
- `/validate-journeys` - Navigation flows
- `/audit` - Configuration audit

## Development Workflow

1. Read relevant rules
2. Run SEO validations before commit
3. Test all 6 languages for content changes
4. Verify accessibility with UI changes

## Key Messages

- **Social**: Deterrence through technological superiority
- **Industrial**: Enabling capabilities for European autonomy
- **Public**: Protecting democratic values through preparation

## Tone

Professional, strategic (not militaristic), European perspective, innovation-focused. Emphasize deterrence and protection over combat.

## Resources

- Logo: `docs/dualys_logo_300x300.png`
- Positioning: `docs/Reflexions_Posicionament_Dualys_22gen2026.pdf`
- Brand Guidelines: `docs/branding/Guideline Marca Dualys 2026.pdf`
