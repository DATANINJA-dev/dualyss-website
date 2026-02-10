# ARIA Component Patterns

This document provides accessible implementation patterns for common interactive components. These patterns follow the W3C WAI-ARIA Authoring Practices Guide (APG) and ensure keyboard accessibility and screen reader compatibility.

**Source**: [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

---

## General ARIA Principles

### The First Rule of ARIA

> **No ARIA is better than bad ARIA.**

Before using ARIA:
1. Use semantic HTML elements first (`<button>`, `<nav>`, `<dialog>`)
2. Only add ARIA when HTML semantics are insufficient
3. Test with actual screen readers

### ARIA Attribute Categories

| Category | Examples | Purpose |
|----------|----------|---------|
| Roles | `role="dialog"`, `role="tab"` | Define what an element is |
| States | `aria-expanded`, `aria-selected` | Dynamic conditions |
| Properties | `aria-label`, `aria-describedby` | Static characteristics |
| Live Regions | `aria-live`, `aria-atomic` | Announce dynamic changes |

---

## 1. Modal Dialog

A modal dialog is a window overlaid on the primary content that traps focus until dismissed.

### Required ARIA

| Attribute | Element | Value | Purpose |
|-----------|---------|-------|---------|
| `role="dialog"` | Container | - | Identifies as dialog |
| `aria-modal="true"` | Container | `true` | Indicates modal behavior |
| `aria-labelledby` | Container | ID of title | Provides accessible name |
| `aria-describedby` | Container | ID of description | Optional description |

### Keyboard Behavior

| Key | Action |
|-----|--------|
| `Tab` | Move focus to next focusable element within dialog |
| `Shift+Tab` | Move focus to previous focusable element |
| `Escape` | Close dialog and return focus to trigger |

### Focus Management

1. **On open**: Move focus to first focusable element (or dialog itself)
2. **While open**: Trap focus within dialog (Tab cycles through dialog only)
3. **On close**: Return focus to element that triggered the dialog

### Implementation Pattern

```html
<!-- Trigger button -->
<button id="open-dialog" aria-haspopup="dialog">
  Open Settings
</button>

<!-- Modal dialog -->
<div role="dialog"
     aria-modal="true"
     aria-labelledby="dialog-title"
     aria-describedby="dialog-desc"
     tabindex="-1">

  <h2 id="dialog-title">Settings</h2>
  <p id="dialog-desc">Configure your preferences below.</p>

  <form>
    <!-- Form fields -->
  </form>

  <div class="dialog-actions">
    <button type="button">Cancel</button>
    <button type="submit">Save</button>
  </div>

  <!-- Close button -->
  <button type="button"
          aria-label="Close dialog"
          class="close-button">
    ×
  </button>
</div>

<!-- Backdrop (for click-outside-to-close) -->
<div class="backdrop" aria-hidden="true"></div>
```

### JavaScript Requirements

```javascript
// Focus trap pseudo-code
function trapFocus(dialog) {
  const focusableElements = dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    if (e.key === 'Escape') {
      closeDialog();
    }
  });
}
```

### Checklist

- [ ] Dialog has `role="dialog"` and `aria-modal="true"`
- [ ] Dialog has accessible name via `aria-labelledby`
- [ ] Focus moves to dialog on open
- [ ] Focus is trapped within dialog
- [ ] Escape key closes dialog
- [ ] Focus returns to trigger on close
- [ ] Background content has `aria-hidden="true"` or `inert`

---

## 2. Tabs

A tabbed interface where selecting a tab displays its associated panel.

### Required ARIA

| Attribute | Element | Value | Purpose |
|-----------|---------|-------|---------|
| `role="tablist"` | Container | - | Groups tabs together |
| `role="tab"` | Each tab | - | Identifies as tab |
| `role="tabpanel"` | Each panel | - | Identifies as panel |
| `aria-selected` | Tab | `true`/`false` | Indicates selected tab |
| `aria-controls` | Tab | Panel ID | Links tab to panel |
| `aria-labelledby` | Panel | Tab ID | Links panel to tab |
| `tabindex` | Tab | `0`/`-1` | Roving tabindex |

### Keyboard Behavior

| Key | Action |
|-----|--------|
| `Tab` | Move focus into/out of tablist |
| `Arrow Left/Right` | Move between tabs (horizontal) |
| `Arrow Up/Down` | Move between tabs (vertical) |
| `Home` | Move to first tab |
| `End` | Move to last tab |
| `Enter/Space` | Activate tab (manual activation) |

### Activation Modes

| Mode | Behavior | Use When |
|------|----------|----------|
| Automatic | Tab activates on focus | Panel content loads fast |
| Manual | Tab activates on Enter/Space | Panel content loads slow |

### Implementation Pattern

```html
<div class="tabs">
  <!-- Tab List -->
  <div role="tablist" aria-label="Account settings">
    <button role="tab"
            id="tab-1"
            aria-selected="true"
            aria-controls="panel-1"
            tabindex="0">
      Profile
    </button>
    <button role="tab"
            id="tab-2"
            aria-selected="false"
            aria-controls="panel-2"
            tabindex="-1">
      Security
    </button>
    <button role="tab"
            id="tab-3"
            aria-selected="false"
            aria-controls="panel-3"
            tabindex="-1">
      Notifications
    </button>
  </div>

  <!-- Tab Panels -->
  <div role="tabpanel"
       id="panel-1"
       aria-labelledby="tab-1"
       tabindex="0">
    <h3>Profile Settings</h3>
    <!-- Panel content -->
  </div>

  <div role="tabpanel"
       id="panel-2"
       aria-labelledby="tab-2"
       tabindex="0"
       hidden>
    <h3>Security Settings</h3>
    <!-- Panel content -->
  </div>

  <div role="tabpanel"
       id="panel-3"
       aria-labelledby="tab-3"
       tabindex="0"
       hidden>
    <h3>Notification Preferences</h3>
    <!-- Panel content -->
  </div>
</div>
```

### Roving Tabindex Pattern

```javascript
// Only selected tab has tabindex="0"
// All other tabs have tabindex="-1"
function selectTab(selectedTab, tabs, panels) {
  tabs.forEach((tab, index) => {
    const isSelected = tab === selectedTab;
    tab.setAttribute('aria-selected', isSelected);
    tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    panels[index].hidden = !isSelected;
  });
  selectedTab.focus();
}
```

### Checklist

- [ ] Tablist has `role="tablist"` with accessible name
- [ ] Each tab has `role="tab"`
- [ ] Each panel has `role="tabpanel"`
- [ ] Tabs linked to panels via `aria-controls`
- [ ] Panels linked to tabs via `aria-labelledby`
- [ ] Only selected tab has `tabindex="0"`
- [ ] Arrow keys navigate between tabs
- [ ] Only active panel is visible

---

## 3. Accordion

An accordion is a vertically stacked set of interactive headings that reveal/hide associated content.

### Required ARIA

| Attribute | Element | Value | Purpose |
|-----------|---------|-------|---------|
| `aria-expanded` | Button | `true`/`false` | Indicates open/closed |
| `aria-controls` | Button | Panel ID | Links button to panel |
| `aria-labelledby` or `aria-label` | Panel | - | Accessible name for panel |

### Keyboard Behavior

| Key | Action |
|-----|--------|
| `Enter/Space` | Toggle section open/closed |
| `Tab` | Move to next focusable element |
| `Arrow Down` | (Optional) Move to next accordion header |
| `Arrow Up` | (Optional) Move to previous accordion header |
| `Home` | (Optional) Move to first accordion header |
| `End` | (Optional) Move to last accordion header |

### Implementation Pattern

```html
<div class="accordion">
  <!-- Accordion Item 1 -->
  <h3>
    <button aria-expanded="true"
            aria-controls="section1-content"
            id="section1-header">
      <span class="accordion-title">Section 1</span>
      <span class="accordion-icon" aria-hidden="true">▼</span>
    </button>
  </h3>
  <div id="section1-content"
       role="region"
       aria-labelledby="section1-header">
    <p>Content for section 1...</p>
  </div>

  <!-- Accordion Item 2 -->
  <h3>
    <button aria-expanded="false"
            aria-controls="section2-content"
            id="section2-header">
      <span class="accordion-title">Section 2</span>
      <span class="accordion-icon" aria-hidden="true">▶</span>
    </button>
  </h3>
  <div id="section2-content"
       role="region"
       aria-labelledby="section2-header"
       hidden>
    <p>Content for section 2...</p>
  </div>

  <!-- Accordion Item 3 -->
  <h3>
    <button aria-expanded="false"
            aria-controls="section3-content"
            id="section3-header">
      <span class="accordion-title">Section 3</span>
      <span class="accordion-icon" aria-hidden="true">▶</span>
    </button>
  </h3>
  <div id="section3-content"
       role="region"
       aria-labelledby="section3-header"
       hidden>
    <p>Content for section 3...</p>
  </div>
</div>
```

### Toggle Logic

```javascript
function toggleAccordion(button) {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  const panel = document.getElementById(
    button.getAttribute('aria-controls')
  );

  button.setAttribute('aria-expanded', !expanded);
  panel.hidden = expanded;
}
```

### Exclusive vs Non-Exclusive

| Mode | Behavior | Use When |
|------|----------|----------|
| Exclusive | Only one section open at a time | Limited space, related content |
| Non-exclusive | Multiple sections can be open | Independent content sections |

### Checklist

- [ ] Header buttons have `aria-expanded`
- [ ] Buttons linked to panels via `aria-controls`
- [ ] Panels have accessible names
- [ ] Hidden panels use `hidden` attribute
- [ ] Enter/Space toggles sections
- [ ] Focus visible on header buttons

---

## 4. Navigation Menu

A navigation menu with optional submenus for hierarchical navigation.

### Required ARIA

| Attribute | Element | Value | Purpose |
|-----------|---------|-------|---------|
| `role="navigation"` or `<nav>` | Container | - | Identifies as navigation |
| `aria-label` | Navigation | Descriptive text | Distinguishes from other navs |
| `aria-expanded` | Parent item | `true`/`false` | Indicates submenu state |
| `aria-haspopup` | Parent item | `true` or `"menu"` | Indicates submenu exists |
| `aria-current` | Active link | `"page"` | Indicates current page |

### Keyboard Behavior (Horizontal Menu Bar)

| Key | Action |
|-----|--------|
| `Tab` | Enter/exit menu |
| `Arrow Left/Right` | Move between top-level items |
| `Arrow Down` | Open submenu, move to first item |
| `Arrow Up` | Move to previous item in submenu |
| `Enter/Space` | Activate item or open submenu |
| `Escape` | Close submenu, return to parent |
| `Home` | Move to first item |
| `End` | Move to last item |

### Implementation Pattern

```html
<nav aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a role="menuitem" href="/" aria-current="page">
        Home
      </a>
    </li>

    <li role="none">
      <button role="menuitem"
              aria-haspopup="true"
              aria-expanded="false"
              aria-controls="products-menu">
        Products
        <span aria-hidden="true">▼</span>
      </button>
      <ul role="menu" id="products-menu" hidden>
        <li role="none">
          <a role="menuitem" href="/products/software">
            Software
          </a>
        </li>
        <li role="none">
          <a role="menuitem" href="/products/hardware">
            Hardware
          </a>
        </li>
        <li role="none">
          <a role="menuitem" href="/products/services">
            Services
          </a>
        </li>
      </ul>
    </li>

    <li role="none">
      <a role="menuitem" href="/about">
        About
      </a>
    </li>

    <li role="none">
      <a role="menuitem" href="/contact">
        Contact
      </a>
    </li>
  </ul>
</nav>
```

### Simpler Navigation (Disclosure Pattern)

For simpler navigation without full menu semantics:

```html
<nav aria-label="Main">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li>
      <button aria-expanded="false" aria-controls="products-sub">
        Products
      </button>
      <ul id="products-sub" hidden>
        <li><a href="/products/a">Product A</a></li>
        <li><a href="/products/b">Product B</a></li>
      </ul>
    </li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

### Checklist

- [ ] Navigation landmark has accessible name
- [ ] Current page indicated with `aria-current="page"`
- [ ] Submenus have `aria-expanded` on trigger
- [ ] Submenus linked via `aria-controls`
- [ ] Keyboard navigation works
- [ ] Escape closes submenus
- [ ] Focus management correct

---

## 5. Alert / Toast

Alerts communicate important messages that require user attention.

### Alert vs Status

| Type | ARIA | Behavior | Use For |
|------|------|----------|---------|
| Alert | `role="alert"` | Immediate announcement, assertive | Errors, warnings |
| Status | `role="status"` | Polite announcement | Success, info |

### Required ARIA

| Attribute | Element | Value | Purpose |
|-----------|---------|-------|---------|
| `role="alert"` | Container | - | Assertive live region |
| `role="status"` | Container | - | Polite live region |
| `aria-live` | Container | `polite`/`assertive` | Alternative to role |
| `aria-atomic` | Container | `true` | Announce entire region |

### Implementation Pattern

```html
<!-- Alert (assertive - interrupts) -->
<div role="alert" aria-atomic="true">
  <strong>Error:</strong> Please fix the highlighted fields.
</div>

<!-- Status (polite - waits for pause) -->
<div role="status" aria-atomic="true">
  Your changes have been saved.
</div>

<!-- Toast notification container -->
<div id="toast-container"
     aria-live="polite"
     aria-atomic="true"
     class="toast-container">
  <!-- Toasts inserted here dynamically -->
</div>
```

### Dynamic Insertion

```javascript
// For live regions, content must be inserted AFTER the region exists
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Auto-dismiss after delay
  setTimeout(() => {
    toast.remove();
  }, 5000);
}
```

### Checklist

- [ ] Alerts use `role="alert"` for errors/warnings
- [ ] Status messages use `role="status"` for info/success
- [ ] Container exists in DOM before content is added
- [ ] `aria-atomic="true"` for complete announcements
- [ ] Auto-dismiss has sufficient duration (5+ seconds)
- [ ] Dismiss button available for persistent alerts

---

## 6. Tooltip

A tooltip displays additional information when hovering or focusing on an element.

### Required ARIA

| Attribute | Element | Value | Purpose |
|-----------|---------|-------|---------|
| `role="tooltip"` | Tooltip | - | Identifies as tooltip |
| `aria-describedby` | Trigger | Tooltip ID | Links trigger to tooltip |

### Keyboard Behavior

| Key | Action |
|-----|--------|
| `Tab` | Focus trigger (shows tooltip) |
| `Escape` | Hide tooltip |

### Implementation Pattern

```html
<!-- Trigger with tooltip -->
<button aria-describedby="tooltip-1">
  <span aria-hidden="true">?</span>
  <span class="sr-only">Help</span>
</button>

<div role="tooltip" id="tooltip-1" hidden>
  Click here to get more information about this feature.
</div>

<!-- Icon with tooltip -->
<span tabindex="0" aria-describedby="tooltip-2">
  <svg aria-hidden="true"><!-- info icon --></svg>
  <span class="sr-only">Information</span>
</span>

<div role="tooltip" id="tooltip-2" hidden>
  This field is required for verification.
</div>
```

### Show/Hide Logic

```javascript
function setupTooltip(trigger, tooltip) {
  // Show on hover and focus
  trigger.addEventListener('mouseenter', () => tooltip.hidden = false);
  trigger.addEventListener('focus', () => tooltip.hidden = false);

  // Hide on mouse leave and blur
  trigger.addEventListener('mouseleave', () => tooltip.hidden = true);
  trigger.addEventListener('blur', () => tooltip.hidden = true);

  // Hide on Escape
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') tooltip.hidden = true;
  });
}
```

### Tooltip vs Toggletip

| Pattern | Trigger | Content | ARIA |
|---------|---------|---------|------|
| Tooltip | Hover/Focus | Simple text | `role="tooltip"` |
| Toggletip | Click | Rich content, interactive | Disclosure pattern |

### Checklist

- [ ] Tooltip has `role="tooltip"`
- [ ] Trigger linked via `aria-describedby`
- [ ] Shows on hover AND focus
- [ ] Escape key hides tooltip
- [ ] Adequate hover delay (300-500ms)
- [ ] Tooltip doesn't obscure trigger

---

## 7. Loading / Progress

Communicate loading state and progress to assistive technology users.

### Spinner/Indeterminate Loading

```html
<!-- Loading spinner -->
<div role="status" aria-live="polite">
  <span class="spinner" aria-hidden="true"></span>
  <span>Loading...</span>
</div>

<!-- Busy state on container -->
<div aria-busy="true" aria-describedby="loading-msg">
  <span id="loading-msg" class="sr-only">Content is loading</span>
  <!-- Content area -->
</div>
```

### Progress Bar

```html
<!-- Determinate progress -->
<div role="progressbar"
     aria-valuenow="64"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="Upload progress">
  <div class="progress-fill" style="width: 64%"></div>
</div>

<!-- With text display -->
<div role="progressbar"
     aria-valuenow="64"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="File upload">
  <span>64%</span>
</div>

<!-- Indeterminate progress -->
<div role="progressbar"
     aria-label="Loading content"
     aria-valuetext="Loading...">
  <!-- No aria-valuenow = indeterminate -->
</div>
```

### Button Loading State

```html
<!-- Before loading -->
<button type="submit">
  Submit
</button>

<!-- During loading -->
<button type="submit"
        disabled
        aria-busy="true">
  <span class="spinner" aria-hidden="true"></span>
  <span>Submitting...</span>
</button>
```

### Checklist

- [ ] Loading state announced via `role="status"` or live region
- [ ] Progress bars use `role="progressbar"`
- [ ] `aria-valuenow`, `aria-valuemin`, `aria-valuemax` set correctly
- [ ] `aria-label` describes what's loading
- [ ] `aria-busy="true"` on containers being updated
- [ ] Button loading states disable interaction

---

## 8. Combobox / Autocomplete

An input with a popup list of options that can be filtered.

### Required ARIA

| Attribute | Element | Value | Purpose |
|-----------|---------|-------|---------|
| `role="combobox"` | Input | - | Identifies pattern |
| `aria-expanded` | Input | `true`/`false` | Popup state |
| `aria-controls` | Input | Listbox ID | Links to popup |
| `aria-autocomplete` | Input | `list`/`both`/`none` | Autocomplete type |
| `aria-activedescendant` | Input | Option ID | Current focused option |
| `role="listbox"` | Popup | - | Identifies as listbox |
| `role="option"` | Each option | - | Identifies as option |
| `aria-selected` | Option | `true`/`false` | Selection state |

### Keyboard Behavior

| Key | Action |
|-----|--------|
| `Arrow Down` | Open popup, move to next option |
| `Arrow Up` | Move to previous option |
| `Enter` | Select focused option |
| `Escape` | Close popup |
| `Tab` | Accept selection, move focus |

### Implementation Pattern

```html
<div class="combobox-container">
  <label id="combo-label">Choose a country</label>

  <input type="text"
         role="combobox"
         aria-labelledby="combo-label"
         aria-expanded="false"
         aria-controls="combo-listbox"
         aria-autocomplete="list"
         aria-activedescendant="">

  <ul role="listbox"
      id="combo-listbox"
      aria-labelledby="combo-label"
      hidden>
    <li role="option" id="opt-1" aria-selected="false">
      Argentina
    </li>
    <li role="option" id="opt-2" aria-selected="false">
      Belgium
    </li>
    <li role="option" id="opt-3" aria-selected="false">
      Canada
    </li>
    <!-- More options -->
  </ul>
</div>
```

### Checklist

- [ ] Input has `role="combobox"`
- [ ] `aria-expanded` reflects popup state
- [ ] `aria-controls` links to listbox
- [ ] `aria-activedescendant` tracks focused option
- [ ] Listbox has `role="listbox"`
- [ ] Options have `role="option"`
- [ ] Arrow keys navigate options
- [ ] Escape closes popup

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────┐
│                    ARIA PATTERNS QUICK REF                  │
├────────────────────────────────────────────────────────────┤
│ MODAL DIALOG                                                │
│   role="dialog" + aria-modal="true"                        │
│   aria-labelledby → title                                  │
│   Focus trap + Escape to close                             │
│                                                            │
│ TABS                                                       │
│   tablist > tab[aria-selected] + tabpanel                  │
│   aria-controls + aria-labelledby                          │
│   Arrow keys navigate, roving tabindex                     │
│                                                            │
│ ACCORDION                                                  │
│   button[aria-expanded] + region                           │
│   aria-controls links to content                           │
│   Enter/Space toggles                                      │
│                                                            │
│ MENU                                                       │
│   nav[aria-label] + aria-current="page"                    │
│   aria-expanded + aria-haspopup for submenus               │
│   Arrow keys + Escape                                      │
│                                                            │
│ ALERT/STATUS                                               │
│   role="alert" (assertive) or role="status" (polite)       │
│   aria-atomic="true" for complete announcements            │
│                                                            │
│ TOOLTIP                                                    │
│   role="tooltip" + aria-describedby                        │
│   Show on hover AND focus, Escape hides                    │
│                                                            │
│ LOADING                                                    │
│   role="status" for announcements                          │
│   role="progressbar" + aria-valuenow/min/max               │
│   aria-busy="true" on updating containers                  │
│                                                            │
│ COMBOBOX                                                   │
│   role="combobox" + aria-expanded + aria-controls          │
│   aria-activedescendant tracks focus                       │
│   listbox > option[aria-selected]                          │
└────────────────────────────────────────────────────────────┘
```

---

## Testing ARIA Implementations

### Browser DevTools

1. **Chrome**: Accessibility tab in Elements panel
2. **Firefox**: Accessibility Inspector
3. **Safari**: Accessibility audit in Web Inspector

### Screen Readers

| OS | Screen Reader | Free? |
|----|---------------|-------|
| Windows | NVDA | Yes |
| Windows | JAWS | No |
| macOS/iOS | VoiceOver | Built-in |
| Android | TalkBack | Built-in |

### Testing Checklist

```markdown
## ARIA Testing: [Component Name]

### Automated
- [ ] No ARIA errors in axe DevTools
- [ ] Valid HTML (roles match element types)

### Keyboard
- [ ] All interactions work without mouse
- [ ] Focus visible on all elements
- [ ] Focus order logical
- [ ] No focus traps (except modals)

### Screen Reader
- [ ] Component announced with correct role
- [ ] State changes announced
- [ ] Labels/descriptions read correctly
- [ ] No duplicate announcements
```

---

## Resources

- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA in HTML Specification](https://www.w3.org/TR/html-aria/)
- [Using ARIA (W3C)](https://www.w3.org/TR/using-aria/)
- [A11Y Style Guide](https://a11y-style-guide.com/style-guide/)
- [Inclusive Components](https://inclusive-components.design/)
