---
id: TASK-008
title: Run and fix E2E journey tests
type: testing
status: backlog
priority: P1
depends_on:
  - TASK-005
created: 2026-03-01
---

# TASK-008: Run and fix E2E journey tests

## Description

Execute the E2E journey tests created in Phase 6 and fix any failing tests. Ensure all critical user journeys pass.

## Acceptance Criteria

- [ ] All primary conversion journey tests pass
- [ ] All capability deep dive tests pass
- [ ] All institutional inquiry tests pass
- [ ] All mobile quick contact tests pass
- [ ] Navigation tests pass for all 6 locales
- [ ] Accessibility tests pass (WCAG 2.2 AA)
- [ ] Tests run in CI pipeline

## Test Files

- `e2e/journeys/primary-conversion.spec.ts`
- `e2e/journeys/capability-deep-dive.spec.ts`
- `e2e/journeys/institutional-inquiry.spec.ts`
- `e2e/journeys/mobile-quick-contact.spec.ts`
- `e2e/navigation.spec.ts`
- `e2e/accessibility.spec.ts`

## Commands

```bash
npm run test:e2e           # Run all tests
npm run test:e2e:ui        # Interactive UI mode
npm run test:e2e:headed    # Run with browser visible
npm run test:e2e:debug     # Debug mode
```

## Technical Notes

- Tests based on journeys defined in `.claude/journeys/critical-paths.yaml`
- Configuration in `playwright.config.ts`
- Desktop (1280x720) and mobile (375x667) viewports

## Notes

May need to add data-testid attributes to components if selectors fail.
