---
id: TASK-005
title: Install npm dependencies (contentful, yaml, playwright)
type: infrastructure
status: backlog
priority: P0
created: 2026-03-01
---

# TASK-005: Install npm dependencies

## Description

Install all new dependencies added to package.json during the recent development phase.

## Acceptance Criteria

- [ ] Run `npm install` to install all dependencies
- [ ] Run `npx playwright install` to install browser binaries
- [ ] Verify `npm run build` completes without errors
- [ ] Verify `npm run test` passes
- [ ] Verify `npm run lint` passes

## Dependencies Added

### Production
- `contentful` - Contentful SDK
- `@contentful/rich-text-react-renderer` - Rich text rendering
- `@contentful/rich-text-types` - Rich text types
- `yaml` - YAML parsing for registries

### Development
- `@playwright/test` - E2E testing

## Technical Notes

Run these commands:
```bash
npm install
npx playwright install chromium
```

## Notes

Quick task - just needs to run npm install.
