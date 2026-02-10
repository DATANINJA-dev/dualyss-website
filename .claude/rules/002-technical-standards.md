# Dualyss Technical Standards

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion (subtle, professional)

### Internationalization
- **Languages**: English (en), French (fr), Spanish (es), German (de), Italian (it), Catalan (ca)
- **Default**: English (en)
- **URL Structure**: Subdirectory pattern (`/en/`, `/fr/`, `/es/`, etc.)
- **i18n Library**: next-intl

### SEO Requirements
- Perfect Lighthouse scores (target: 95+)
- Valid hreflang implementation
- JSON-LD structured data (Organization, WebSite, WebPage)
- Open Graph + Twitter Cards
- Semantic HTML5
- Core Web Vitals optimized

### Accessibility
- WCAG 2.2 Level AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios
- Focus indicators

## Code Standards

### File Naming
- Components: PascalCase (`Header.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: SCREAMING_SNAKE_CASE
- CSS modules: kebab-case (`hero-section.module.css`)

### Component Structure
```
src/
  app/
    [locale]/
      page.tsx
      layout.tsx
      (routes)/
  components/
    ui/           # shadcn components
    layout/       # Header, Footer, Nav
    sections/     # Page sections
    shared/       # Reusable components
  lib/
    i18n/
    utils/
  messages/       # Translation files
    en.json
    fr.json
    es.json
    de.json
    it.json
    ca.json
```

### Performance Budgets
- LCP: < 2.5s
- INP: < 200ms
- CLS: < 0.1
- Total bundle: < 200KB (gzipped)

## Content Guidelines

### Images
- WebP format with fallbacks
- Responsive srcset
- Lazy loading below fold
- Alt text in all languages

### Typography
- System font stack or premium web font
- Clear hierarchy (h1 > h2 > h3)
- Readable line lengths (45-75 chars)
- Adequate line height (1.5+)
