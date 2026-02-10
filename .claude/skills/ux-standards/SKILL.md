---
name: ux-standards
description: |
  Provides WCAG 2.2 accessibility standards, Nielsen's usability heuristics,
  edge case patterns, and ARIA component guidance. Auto-activates for UX,
  accessibility, WCAG, and a11y keywords.
---

# UX Standards Skill

This skill provides comprehensive patterns for ensuring user experience quality and accessibility compliance. It covers WCAG 2.2 Level AA criteria (DOJ April 2026 compliance), Nielsen's 10 usability heuristics, common UI edge cases, and ARIA patterns for accessible components.

## When This Skill Activates

- Tasks involving user experience analysis or improvement
- Accessibility audits or WCAG compliance checks
- UI component design or implementation
- User flow analysis or optimization
- Form design or validation patterns
- Error handling UX patterns

### Activation Keywords

| Keyword Pattern | Confidence |
|-----------------|------------|
| UX, user experience, usability | High |
| accessibility, a11y, WCAG, ADA | High |
| ARIA, screen reader, keyboard navigation | High |
| form validation, error handling, edge case | Medium |
| component design, UI pattern | Medium |
| user flow, user journey | Medium |

### Activation File Patterns

| Pattern | Trigger |
|---------|---------|
| `components/**/*.{ts,tsx,js,jsx,vue,svelte}` | UI component files |
| `pages/**/*`, `views/**/*` | Page/view files |
| `ui/**/*`, `design-system/**/*` | Design system files |

## Core Principles

### The UX Quality Triangle

User experience quality rests on three pillars:

1. **Accessibility**: Can ALL users interact with the interface?
2. **Usability**: Can users achieve their goals efficiently?
3. **Robustness**: Does the interface handle all states gracefully?

### Quick Reference

**WCAG 2.2 Level AA** - 50+ criteria across:
- **Perceivable**: Content visible/audible to all users
- **Operable**: All functions work via keyboard and assistive tech
- **Understandable**: Content is predictable and readable
- **Robust**: Compatible with current and future tools

**Nielsen's 10 Heuristics** - Core usability principles:
1. Visibility of system status
2. Match system to real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition over recall
7. Flexibility and efficiency
8. Aesthetic minimalist design
9. Help users recognize errors
10. Help and documentation

**Edge Case Categories**:
- Empty states (first use, no results, deleted all)
- Loading states (initial, lazy, submission)
- Error states (network, validation, permission)
- Boundary conditions (long text, special chars, limits)

## Supporting Files

| File | Purpose |
|------|---------|
| [wcag-2-2-checklist.md](./wcag-2-2-checklist.md) | WCAG 2.2 Level AA criteria with DOJ 2026 compliance notes |
| [nielsen-heuristics.md](./nielsen-heuristics.md) | 10 usability heuristics with practical examples |
| [edge-cases.md](./edge-cases.md) | UI state handling patterns (empty, loading, error, boundary) |
| [aria-patterns.md](./aria-patterns.md) | Accessible component patterns (modal, tabs, accordion, menu) |

## Usage

This skill is automatically activated when UX-related tasks are detected. Reference the supporting files for:

- **WCAG Compliance**: Use `wcag-2-2-checklist.md` for accessibility audits
- **Usability Review**: Use `nielsen-heuristics.md` for heuristic evaluation
- **State Design**: Use `edge-cases.md` for comprehensive state coverage
- **Component Patterns**: Use `aria-patterns.md` for accessible implementations

## Quick Checklist

### Minimum Viable Accessibility (WCAG 2.2 AA)

- [ ] All images have descriptive alt text
- [ ] Color is not the only way to convey information
- [ ] Text contrast ratio meets 4.5:1 (normal) or 3:1 (large)
- [ ] All functionality accessible via keyboard
- [ ] Focus indicator visible on all interactive elements
- [ ] Form inputs have associated labels
- [ ] Error messages identify the field and suggest fixes
- [ ] Page has descriptive `<title>` and `lang` attribute
- [ ] Heading hierarchy is logical (h1 -> h2 -> h3)
- [ ] Touch targets are at least 24x24px

### Quick Usability Audit

```
Visibility:     [ ] User knows what's happening (loading, progress, save)
Real world:     [ ] Language matches user expectations
Control:        [ ] User can undo, cancel, and navigate freely
Consistency:    [ ] Follows platform conventions and internal patterns
Prevention:     [ ] System prevents errors before they happen
Recognition:    [ ] Options visible, no memory required
Efficiency:     [ ] Shortcuts available for power users
Minimalism:     [ ] No unnecessary information or clutter
Error recovery: [ ] Clear error messages with solutions
Help:           [ ] Contextual help available when needed
```

## Accessibility Testing Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| axe DevTools | Automated a11y testing | During development |
| WAVE | Visual accessibility report | Quick checks |
| Lighthouse | Accessibility audit | CI/CD pipeline |
| VoiceOver/NVDA | Screen reader testing | Before release |
| Keyboard only | Tab navigation testing | Each new component |
| Color contrast checker | WCAG contrast verification | Design review |

## Mobile-First Responsive Patterns

### Core Principle

Design for mobile first, then enhance for larger screens. This ensures:
- Core functionality works on all devices
- Performance is optimized for constrained devices
- Progressive enhancement is applied naturally

### Responsive Breakpoints

```css
/* Mobile-first breakpoint system */
/* Base: Mobile (< 640px) - write first */
.component { /* mobile styles */ }

/* Small tablets (640px+) */
@media (min-width: 640px) { }

/* Tablets (768px+) */
@media (min-width: 768px) { }

/* Laptops (1024px+) */
@media (min-width: 1024px) { }

/* Desktops (1280px+) */
@media (min-width: 1280px) { }

/* Large screens (1536px+) */
@media (min-width: 1536px) { }
```

### Touch Target Requirements (WCAG 2.2)

| Element Type | Minimum Size | Recommended | Spacing |
|--------------|--------------|-------------|---------|
| Primary buttons | 44x44px | 48x48px | 8px gap |
| Secondary buttons | 44x44px | 44x44px | 8px gap |
| Icon buttons | 44x44px | 48x48px | 8px gap |
| Links in text | 24x24px | N/A | Adjacent OK |
| Form inputs | 44px height | 48px height | 8px gap |
| Checkboxes/Radio | 24x24px | 44x44px hit area | 8px gap |

**Exception**: Links within sentences can be smaller than 24x24px.

### Mobile Navigation Patterns

```
MOBILE NAVIGATION HIERARCHY:

+-----------------------------+
| [=] App Title      [bell][user] |  <- Fixed header, hamburger menu
+-----------------------------+
|                             |
|     Main Content Area       |  <- Scrollable content
|                             |
+-----------------------------+
| [home] [search] [+] [chat] [gear]  |  <- Bottom nav (5 items max)
+-----------------------------+

Rules:
- Bottom nav for primary actions (thumb-reachable)
- Hamburger for secondary/settings
- Sticky header for context and quick actions
- Max 5 bottom nav items
```

### Responsive Typography

```css
/* Fluid typography using clamp() */
:root {
  /* Minimum, Preferred, Maximum */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
  --text-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 3rem);
}

/* Line length for readability */
.prose { max-width: 65ch; }
```

### Mobile Form Patterns

| Pattern | Implementation |
|---------|----------------|
| Input types | Use `type="email"`, `tel`, `number` for correct keyboard |
| Autocomplete | Add `autocomplete` for faster form filling |
| Label position | Stack labels above inputs on mobile |
| Error display | Show inline below field, not in alerts |
| Input height | Minimum 44px for easy tapping |
| Submit button | Full-width on mobile for easy reach |

---

## WCAG 2.2 New Criteria

### 2.4.11 Focus Not Obscured (Minimum) - Level AA

**Requirement**: When a UI component receives keyboard focus, it is not entirely hidden by author-created content.

**Common violations**:
- Sticky headers covering focused elements
- Cookie banners overlapping page content
- Modal dialogs not managing focus properly

**Fix pattern**:
```css
/* Ensure focused elements scroll into view with padding */
:focus {
  scroll-margin-top: 80px; /* Account for sticky header */
  scroll-margin-bottom: 80px; /* Account for sticky footer */
}
```

### 2.4.12 Focus Not Obscured (Enhanced) - Level AAA

Focus must be **fully visible**, not just partially.

### 2.5.7 Dragging Movements - Level AA

**Requirement**: Any functionality using dragging can be operated with single pointer without dragging.

**Common violations**:
- Drag-only sliders
- Drag-to-reorder lists without alternatives
- Drag-and-drop file upload only

**Fix pattern**:
```tsx
// Provide button alternatives for drag actions
<SortableList>
  {items.map((item, index) => (
    <SortableItem key={item.id}>
      {item.content}
      {/* Alternative to dragging */}
      <button onClick={() => moveUp(index)} aria-label="Move up">up</button>
      <button onClick={() => moveDown(index)} aria-label="Move down">down</button>
    </SortableItem>
  ))}
</SortableList>
```

### 2.5.8 Target Size (Minimum) - Level AA

**Requirement**: Touch/click targets are at least 24x24 CSS pixels, except:
- Inline links within sentences
- User-agent controlled elements
- Essential targets where size is legally required

**Validation**:
```javascript
// Automated check for target sizes
function validateTargetSize(element) {
  const rect = element.getBoundingClientRect();
  const minSize = 24;
  return rect.width >= minSize && rect.height >= minSize;
}
```

### 3.2.6 Consistent Help - Level A

**Requirement**: Help mechanisms appear in the same relative order across pages.

**Implementation**:
- Help link in footer (same position every page)
- Chat widget in consistent corner
- Contact info in predictable location

### 3.3.7 Redundant Entry - Level A

**Requirement**: Don't ask users to re-enter information they already provided in the same session.

**Common violations**:
- Re-entering email on confirmation page
- Re-entering shipping address for billing
- Re-entering name after creating account

**Fix pattern**:
```tsx
// Auto-populate from previous step
<BillingForm
  defaultValues={{
    name: shippingInfo.name,
    address: sameAsShipping ? shippingInfo.address : undefined,
  }}
/>
<Checkbox
  label="Same as shipping address"
  checked={sameAsShipping}
  onChange={setSameAsShipping}
/>
```

### 3.3.8 Accessible Authentication (Minimum) - Level AA

**Requirement**: Don't rely on cognitive function tests (puzzles, memory tests) for authentication.

**Allowed methods**:
- Password managers (autocomplete supported)
- Copy-paste allowed in password fields
- OAuth/SSO authentication
- Biometric authentication
- Email/SMS magic links

**Violations**:
- CAPTCHA without audio/image alternative
- "Type these letters" tests
- "Remember your pattern" authentication

---

## Automated Testing Integration

### axe-core Setup (Recommended)

```typescript
// playwright.config.ts - E2E accessibility testing
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage has no violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
```

```typescript
// Component testing with jest-axe
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button is accessible', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### pa11y Setup

```javascript
// pa11y.config.js
module.exports = {
  standard: 'WCAG2AA',
  runners: ['axe', 'htmlcs'],
  ignore: [
    'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail' // Ignore specific rule
  ],
  timeout: 30000,
  wait: 1000,
  actions: [
    'wait for element #main to be visible',
  ],
};
```

```bash
# Run pa11y on a URL
npx pa11y https://example.com

# Run on multiple URLs
npx pa11y-ci
```

### CI/CD Integration

```yaml
# .github/workflows/accessibility.yml
name: Accessibility

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Start server
        run: npm run start &

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run accessibility tests
        run: npm run test:a11y

      - name: Upload results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: a11y-report
          path: a11y-report/
```

### Lighthouse Accessibility Audit

```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/login'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'aria-allowed-attr': 'error',
        'aria-hidden-focus': 'error',
        'aria-required-attr': 'error',
        'aria-valid-attr': 'error',
        'button-name': 'error',
        'color-contrast': 'error',
        'duplicate-id': 'error',
        'form-field-multiple-labels': 'error',
        'frame-title': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
      },
    },
  },
};
```

---

## Keyboard Navigation Patterns

### Focus Management

```typescript
// Focus trap for modals
import { useEffect, useRef } from 'react';

export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element on open
    firstElement?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return containerRef;
}
```

### Roving Tabindex Pattern

```typescript
// For toolbars, menus, tab lists
function RovingTabindex({ items }: { items: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  function handleKeyDown(e: KeyboardEvent, index: number) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((index + 1) % items.length);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((index - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
    }
  }

  return (
    <div role="toolbar" aria-label="Actions">
      {items.map((item, index) => (
        <button
          key={item}
          tabIndex={index === activeIndex ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={index === activeIndex ? (el) => el?.focus() : undefined}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
```

### Skip Links

```tsx
// Skip to main content link
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded"
    >
      Skip to main content
    </a>
  );
}

// In layout
<body>
  <SkipLink />
  <Header />
  <main id="main-content" tabIndex={-1}>
    {children}
  </main>
</body>
```

### Keyboard Shortcuts

```typescript
// Global keyboard shortcuts with disclosure
function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = [
        e.metaKey && 'cmd',
        e.ctrlKey && 'ctrl',
        e.altKey && 'alt',
        e.shiftKey && 'shift',
        e.key.toLowerCase(),
      ].filter(Boolean).join('+');

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Usage
useKeyboardShortcuts({
  'cmd+k': () => openSearch(),
  'cmd+/': () => showShortcutHelp(),
  'escape': () => closeModal(),
});
```

---

## Screen Reader Testing Guide

### Testing Checklist

| Test | VoiceOver (Mac) | NVDA (Windows) | Expected Result |
|------|-----------------|----------------|-----------------|
| Page title announced | check On page load | check On page load | Descriptive title read |
| Landmarks navigation | VO + U, then arrows | D for landmarks | Can navigate by region |
| Headings navigation | VO + U, Headings | H for next heading | Logical heading hierarchy |
| Links list | VO + U, Links | K for links | Meaningful link text |
| Forms mode | Auto on focus | F for form fields | Labels announced |
| Live regions | Automatic | Automatic | Updates announced |

### Common Screen Reader Commands

**VoiceOver (Mac)**:
- `VO` = Ctrl + Option
- `VO + right/left` = Navigate next/previous item
- `VO + Space` = Activate element
- `VO + U` = Open rotor (elements list)
- `VO + Cmd + H` = Next heading
- `VO + Cmd + J` = Next form control

**NVDA (Windows)**:
- `Insert + down` = Read from current position
- `Tab` = Next form field
- `H` = Next heading
- `D` = Next landmark
- `K` = Next link
- `B` = Next button

### Live Regions

```tsx
// Announce dynamic content changes
<div
  role="status"
  aria-live="polite"      // Wait for user to finish
  aria-atomic="true"      // Announce entire region
>
  {statusMessage}
</div>

<div
  role="alert"
  aria-live="assertive"   // Interrupt immediately
>
  {errorMessage}
</div>

// Loading state announcement
<div aria-live="polite" className="sr-only">
  {isLoading ? 'Loading...' : 'Content loaded'}
</div>
```

### Testing Workflow

1. **VoiceOver Quick Test** (5 min):
   - Press `Cmd + F5` to enable
   - Tab through interactive elements
   - Check form labels are announced
   - Navigate headings with `VO + Cmd + H`
   - Press `Cmd + F5` to disable

2. **NVDA Full Test** (15 min):
   - Open NVDA, navigate to page
   - Press `Insert + down` to read page
   - Navigate landmarks with `D`
   - Navigate headings with `H`
   - Complete a form using Tab
   - Test any dynamic content updates

3. **Mobile Screen Reader** (iOS VoiceOver):
   - Settings -> Accessibility -> VoiceOver
   - Swipe right to navigate
   - Double-tap to activate
   - Use rotor (2-finger twist) for navigation options

---

## Constraints

- Accessibility is a legal requirement in many jurisdictions (ADA, EAA, DDA)
- WCAG conformance is self-declared - always test with real users when possible
- Automated tools catch ~30% of issues - manual testing is essential
- "No ARIA is better than bad ARIA" - use semantic HTML first
- Edge cases should be designed, not discovered in production
- **Mobile-first is not optional** - over 50% of web traffic is mobile
- **Touch targets under 44x44px will fail WCAG 2.2 Level AA**
- **DOJ deadline: April 2026** for state/local government WCAG 2.1 AA compliance

## Research Sources

- [WCAG 2.2 Quick Reference (W3C WAI)](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist)
- [What's New in WCAG 2.2 (W3C WAI)](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [Nielsen's 10 Usability Heuristics (NN/g)](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [ARIA Authoring Practices Guide (W3C WAI)](https://www.w3.org/WAI/ARIA/apg/)
- [A11Y Project Checklist](https://www.a11yproject.com/checklist/)
- [DOJ Web Accessibility Final Rule (2024)](https://www.ada.gov/resources/web-guidance/)
