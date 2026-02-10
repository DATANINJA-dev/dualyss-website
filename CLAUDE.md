# Dualyss Website Project

## Project Overview

**Dualyss** is a Catalan Economic Interest Grouping (AIE) specializing in dual-use technologies for defense, cybersecurity, and biosecurity. This project is the corporate website serving institutional, industrial, and public audiences across Europe.

**Slogan**: "Protecting democracy with dual deterrence technologies"

## Quick Reference

| Aspect | Value |
|--------|-------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | next-intl (6 languages) |
| Languages | en, fr, es, de, it, ca |
| Default Language | English (en) |
| Target Scores | Lighthouse 95+, WCAG 2.2 AA |

## Project Structure

```
dualys/
├── .claude/
│   ├── rules/           # Project rules and standards
│   ├── agents/          # Custom agents
│   ├── skills/          # Skills (SEO, i18n, etc.)
│   ├── commands/        # Slash commands
│   └── hooks/           # Pre/post hooks
├── docs/                # Brand documentation
├── src/
│   ├── app/[locale]/    # i18n routing
│   ├── components/      # React components
│   ├── lib/             # Utilities
│   └── messages/        # Translation files
├── public/              # Static assets
└── CLAUDE.md            # This file
```

## Key Rules

Read these before making changes:
- `.claude/rules/001-project-identity.md` - Brand and messaging
- `.claude/rules/002-technical-standards.md` - Code standards
- `.claude/rules/003-seo-checklist.md` - SEO requirements
- `.claude/rules/004-content-structure.md` - Sitemap and content

## Available Commands

### SEO Validation
- `/seo-validate-meta` - Validate meta tags
- `/seo-validate-hreflang` - Validate language alternates
- `/seo-validate-structured` - Validate JSON-LD schemas
- `/seo-validate-orthography` - Check spelling/grammar
- `/seo-validate-lighthouse` - Performance/SEO audit
- `/seo-validate-quality` - E-E-A-T content scoring
- `/seo-validate-geo` - AI search optimization

### Development
- `/validate-journeys` - Check navigation flows
- `/generate-nav` - Generate navigation boilerplate
- `/audit` - Audit Claude Code configuration

## Brand Guidelines

### Colors (to be defined in design system)
- Primary: Professional blue/navy
- Accent: European gold/amber
- Neutral: Clean grays
- Semantic: Standard success/warning/error

### Tone of Voice
- Professional and authoritative
- Strategic, not militaristic
- European perspective
- Innovation-focused
- Emphasize deterrence over combat
- Highlight protection and preparation

### Key Messages
1. **Social**: Deterrence through technological superiority
2. **Industrial**: Enabling capabilities for European autonomy
3. **Public**: Protecting democratic values through preparation

## Languages

| Code | Language | Priority | Notes |
|------|----------|----------|-------|
| en | English | Primary | International/EU |
| ca | Catalan | High | Local identity |
| es | Spanish | High | National |
| fr | French | Medium | EU partner |
| de | German | Medium | Industrial |
| it | Italian | Medium | EU programs |

## SEO Priorities

1. **Multi-language hreflang** - Correct implementation for 6 languages
2. **Structured Data** - Organization, WebSite, WebPage schemas
3. **Core Web Vitals** - LCP < 2.5s, INP < 200ms, CLS < 0.1
4. **E-E-A-T** - Demonstrate expertise and authority
5. **GEO** - Optimize for AI search engines

## Development Workflow

1. Read relevant rules before implementing
2. Run SEO validations before committing
3. Test all 6 languages for any content change
4. Verify accessibility with each UI change
5. Check Lighthouse scores for new pages

## Contact

- **Documentation**: `docs/` folder
- **Logo**: `docs/dualys_logo_300x300.png`
- **Positioning**: `docs/Reflexions_Posicionament_Dualyss_22gen2026.pdf`
