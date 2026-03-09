# Content Placeholders Rule

## Purpose

This rule documents which content on the Dualys website is placeholder (awaiting real data) versus real content derived from official brand documents.

## Real Content (From Official Sources)

The following content is derived from official Dualys brand documents and should NOT be changed without review:

### Key Messages
**Source**: `docs/Reflexions_Posicionament_Dualys_22gen2026.pdf`

- Slogan: "Protecting democracy with dual deterrence technologies"
- Social message: Deterrence through technological superiority
- Industrial message: Enabling capabilities for European autonomy
- Public message: Protecting democratic values through preparation

### Capability Descriptions
**Source**: Official positioning documents

- Defense: Unmanned systems, autonomous platforms
- Cybersecurity: Digital infrastructure protection
- Biosecurity: Bio-sanitary response capabilities
- Dual-Use: Civil + defense technology applications

### Brand Colors and Typography
**Source**: `docs/branding/Guideline Marca Dualys 2026.pdf`

- Primary: #000000 (black)
- Accent: #4F61E7 (blue)
- Typography: TOSH A + Inter

### Company Information
**Source**: Corporate documents

- Company name: Dualys
- Legal form: AIE (Agrupació d'Interès Econòmic)
- Origin: Catalonia, Spain
- Context: European strategic autonomy

## Placeholder Content (Awaiting Real Data)

The following content is placeholder and will be replaced by CMS data:

### Team Members (`/about/team`)
**Status**: PLACEHOLDER
**Data Source**: Contentful CMS (when configured)

Current state:
- Generic role descriptions without specific names
- No photos
- No LinkedIn profiles

When CMS is configured:
- Real team member names
- Professional photos
- Role descriptions
- Contact information

### Partners (`/about/partners`)
**Status**: PLACEHOLDER
**Data Source**: Contentful CMS (when configured)

Current state:
- Partner category structure defined
- No specific company names or logos
- Placeholder descriptions

When CMS is configured:
- Real partner company names
- Official partner logos
- Partnership descriptions
- Website links

### News Articles (`/news`)
**Status**: PLACEHOLDER
**Data Source**: Contentful CMS (when configured)

Current state:
- Empty state or example articles
- Generic content

When CMS is configured:
- Real news articles with dates
- Category assignments
- Featured images
- Author attribution

## Placeholder Handling Guidelines

### Do NOT
- Invent fictional team member names
- Create fake company logos
- Write news articles about events that didn't happen
- Add metrics or statistics without sources

### DO
- Use role-based descriptions ("Chief Technology Officer")
- Use category placeholders ("Industrial Partner")
- Use "Coming Soon" or empty states
- Add clear visual indicators that content is placeholder

## CMS Integration Status

| Content Type | Status | CMS Model | Priority |
|--------------|--------|-----------|----------|
| Team Members | Awaiting CMS | `teamMember` | High |
| Partners | Awaiting CMS | `partner` | High |
| News Articles | Awaiting CMS | `newsArticle` | Medium |
| Case Studies | Not started | `caseStudy` | Low |

## Verification Checklist

Before publishing:

- [ ] All placeholder content is clearly marked in code/design
- [ ] No fictional names, companies, or data are present
- [ ] Empty states are graceful and professional
- [ ] CMS integration is tested with preview tokens
- [ ] Real content review completed by stakeholder

## Code Markers

When implementing placeholder content, use these markers:

```tsx
// TODO: Replace with CMS data
// PLACEHOLDER: Awaiting real team member data
// CMS: teamMember content type
```

These markers help identify placeholder sections during code review and CMS integration.
