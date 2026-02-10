# Step Execution Patterns

Detailed patterns for executing development steps based on task type.

## Backend Steps

### TDD Pattern

```
1. Identify API/service changes from step description
2. Write unit tests for new functions/methods
3. Write integration tests for API endpoints
4. Verify tests FAIL
5. Implement minimal code
6. Verify tests PASS
7. Refactor for patterns/naming
8. Verify no regression
```

### Extra Validations

| Check | Tool | Criteria |
|-------|------|----------|
| API contracts | Schema validation | Matches OpenAPI/JSON Schema |
| DB migrations | Migration runner | Reversible, no data loss |
| Error handling | Test coverage | All error paths tested |
| Auth/authz | Security tests | Proper access control |

### Test Types

- Unit tests: Pure functions, business logic
- Integration tests: API endpoints, DB operations
- Contract tests: API schema compliance

---

## Frontend Steps

### TDD Pattern

```
1. Identify components/UI changes from step description
2. Write component tests (render, props, events)
3. Write interaction tests if applicable
4. Verify tests FAIL
5. Implement component/feature
6. Verify tests PASS
7. Check visual appearance
8. Refactor for consistency
```

### Extra Validations

| Check | Tool | Criteria |
|-------|------|----------|
| Visual regression | Storybook/Chromatic | No unintended changes |
| Responsive | Browser resize | Works on mobile/tablet/desktop |
| Cross-browser | Playwright | Chrome, Firefox, Safari |
| Design tokens | Style audit | Uses design system tokens |

### Test Types

- Component tests: Render, props, slots
- Interaction tests: Click, input, submit
- Visual tests: Screenshot comparison
- A11y tests: axe-core checks

---

## UX Steps

### TDD Pattern

```
1. Identify user flows affected from step description
2. Write E2E tests for happy path
3. Write tests for error states
4. Write accessibility tests
5. Verify tests FAIL
6. Implement UX changes
7. Verify tests PASS
8. Manual accessibility check
```

### Extra Validations

| Check | Tool | Criteria |
|-------|------|----------|
| Accessibility | axe-core | No WCAG violations |
| Keyboard nav | Tab order test | All interactive elements reachable |
| Screen reader | Manual/NVDA | Proper announcements |
| Focus management | Focus tests | Logical focus flow |
| Error states | E2E tests | Clear error messaging |

### Test Types

- E2E tests: Full user journeys
- Accessibility tests: WCAG compliance
- Usability tests: Task completion
- Error state tests: Edge cases

---

## SEO Steps

### TDD Pattern

```
1. Identify SEO-impacting changes from step description
2. Write meta tag tests
3. Write structured data tests
4. Write performance tests
5. Verify tests FAIL
6. Implement SEO changes
7. Verify tests PASS
8. Run Lighthouse audit
```

### Extra Validations

| Check | Tool | Criteria |
|-------|------|----------|
| Meta tags | HTML parser | Title, description, OG present |
| Structured data | Schema.org validator | Valid JSON-LD |
| Performance | Lighthouse | Score >= 90 |
| Core Web Vitals | Lighthouse | LCP, FID, CLS pass |
| Canonical URLs | Link audit | Proper canonical tags |

### Test Types

- Meta tests: Tag presence and content
- Schema tests: Valid structured data
- Performance tests: Load time, bundle size
- Crawlability tests: Robots, sitemap

---

## Mixed Steps

When a step spans multiple types, combine patterns:

### Detection

```
Step description analysis:
- Contains "API" or "endpoint" → Backend
- Contains "component" or "UI" → Frontend
- Contains "accessibility" or "flow" → UX
- Contains "meta" or "performance" → SEO
```

### Execution Order

1. Backend tests/implementation first (foundation)
2. Frontend tests/implementation (builds on backend)
3. UX validations (ensures usability)
4. SEO validations (ensures discoverability)

### Combined Checkpoint

```
Step [N] involves multiple concerns:

Backend:
- [ ] API tests written and passing
- [ ] DB changes applied

Frontend:
- [ ] Component tests passing
- [ ] Visual regression checked

UX:
- [ ] Accessibility verified
- [ ] User flow tested

SEO:
- [ ] Meta tags present
- [ ] Performance budget met

Proceed with commit? [Y/n/review]
```

---

## Step Scope Management

### Scope Indicators

| Indicator | Action |
|-----------|--------|
| Step touches > 5 files | Consider splitting |
| Step has > 3 concerns | Warn user, offer to decompose |
| Step takes > 30 min | Save progress frequently |
| Step requires research | Pause, research, then continue |

### Scope Creep Detection

```
Original step: "Add login form validation"

Scope creep signs:
- Adding password strength meter (not in step)
- Implementing forgot password (separate step)
- Refactoring unrelated auth code (defer)

Response:
"I noticed we're expanding beyond the original step scope.

Options:
[F]ocus - Stay on original step only
[E]xpand - Include additions (update plan)
[D]efer - Note for future step
"
```

---

## Commit Message Format

Per-step atomic commits:

```
[TASK-XXX] Step N: [step title]

- [bullet point of changes]
- [bullet point of changes]

Tests: [N] added, [M] modified
Type: [backend|frontend|ux|seo|mixed]

TDD: Red -> Green -> Refactor complete
```

---

## Resume Patterns

### After Interruption

```
1. Read development_progress from task file
2. Identify last completed step
3. Check for uncommitted changes
4. Present resume options:

Resuming TASK-XXX development...

Last completed: Step 2 - "Add user model"
Current step: Step 3 - "Implement login endpoint"
Uncommitted changes: 2 files

Options:
[C]ontinue from Step 3
[R]eview Step 2 changes first
[S]tart Step 3 fresh (stash changes)
```

### Context Restoration

```
1. Load task file
2. Load epic context (if linked)
3. Load implementation plan
4. Show progress summary
5. Reload relevant code context
```

---

## Quality Gates

Before marking step complete:

| Gate | Required | Criteria |
|------|----------|----------|
| Tests pass | Always | All step tests green |
| No lint errors | Always | Clean lint output |
| TDD followed | Always | Tests written first |
| Type validations | If applicable | Extra checks pass |
| Code reviewed | If large step | User approved changes |

Before marking task done:

| Gate | Required | Criteria |
|------|----------|----------|
| All steps complete | Always | No pending steps |
| All tests pass | Always | Full test suite green |
| Acceptance criteria | Always | All criteria verified |
| No skipped steps | Warn | Acknowledge skips |
