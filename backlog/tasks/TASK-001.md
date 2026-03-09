---
id: TASK-001
title: Configure Contentful CMS space and content models
type: infrastructure
status: backlog
priority: P0
created: 2026-03-01
---

# TASK-001: Configure Contentful CMS space and content models

## Description

Set up Contentful CMS space with the required content models for dynamic content management. Create content types for news articles, team members, and partners.

## Acceptance Criteria

- [ ] Create Contentful space for Dualys
- [ ] Create `newsArticle` content type with fields:
  - title (localized, 6 languages)
  - slug (localized)
  - excerpt (rich text, localized)
  - body (rich text, localized)
  - category (enum: announcement, partnership, technology, event)
  - publishDate (date)
  - featuredImage (media)
- [ ] Create `teamMember` content type with fields:
  - name
  - role (localized)
  - bio (localized)
  - photo (media)
  - linkedIn (optional)
  - order (number)
- [ ] Create `partner` content type with fields:
  - name
  - logo (media)
  - category (enum: industrial, academic, research, institutional)
  - website (optional)
  - description (localized)
  - order (number)
- [ ] Enable localization for all 6 languages (en, es, fr, de, it, ca)
- [ ] Generate API keys and update `.env.local`

## Technical Notes

- Content models defined in `src/lib/contentful/types.ts`
- Query functions ready in `src/lib/contentful/queries.ts`
- Environment variables documented in `.env.example`

## Notes

CMS integration code already implemented, awaiting Contentful space configuration.
