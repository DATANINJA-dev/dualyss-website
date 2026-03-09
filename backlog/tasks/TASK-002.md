---
id: TASK-002
title: Connect News page to Contentful CMS
type: feature
status: backlog
priority: P0
depends_on:
  - TASK-001
created: 2026-03-01
---

# TASK-002: Connect News page to Contentful CMS

## Description

Update the News page to fetch articles from Contentful CMS instead of showing placeholder content. Implement pagination and category filtering.

## Acceptance Criteria

- [ ] News page fetches articles from Contentful
- [ ] Articles display title, excerpt, date, category, and featured image
- [ ] Pagination works correctly
- [ ] Category filtering works
- [ ] Empty state shows when no articles exist
- [ ] All 6 languages display correctly
- [ ] Loading states are implemented

## Files to Modify

- `src/app/[locale]/news/page.tsx`

## Technical Notes

- Use `getNewsArticles()` from `src/lib/contentful/queries.ts`
- Handle case when Contentful is not configured (show placeholder)
- Use ISR (Incremental Static Regeneration) for performance

## Notes

Query functions already implemented, just need to connect to the page component.
