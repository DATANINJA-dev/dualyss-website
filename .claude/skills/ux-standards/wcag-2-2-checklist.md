# WCAG 2.2 Level AA Checklist

This checklist covers WCAG 2.2 Level A and AA success criteria for web accessibility compliance. The DOJ April 2024 final rule mandates WCAG 2.1 Level AA compliance by April 2026 for state and local government websites. This document includes WCAG 2.2 criteria for future-proofing.

**Compliance Deadlines (DOJ Rule)**:
- Public entities ≥50,000 population: **April 24, 2026**
- Public entities <50,000 population: **April 26, 2027**

---

## 1. Perceivable

Content must be presentable to users in ways they can perceive.

### 1.1 Text Alternatives

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 1.1.1 | Non-text Content | A | All non-text content has text alternatives (alt text for images, labels for controls, descriptions for media) | Check all `<img>`, `<svg>`, `<canvas>`, `<video>`, `<audio>` elements |

### 1.2 Time-based Media

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 1.2.1 | Audio-only and Video-only | A | Prerecorded audio has transcript; prerecorded video has audio description or transcript | Review all media files |
| 1.2.2 | Captions (Prerecorded) | A | All prerecorded audio content in video has captions | Check video players for CC |
| 1.2.3 | Audio Description or Media Alternative | A | Video content has audio description or text alternative | Check for descriptive tracks |
| 1.2.4 | Captions (Live) | AA | Live audio content has real-time captions | Test live streaming features |
| 1.2.5 | Audio Description | AA | Prerecorded video has audio description | Check for AD tracks |

### 1.3 Adaptable

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 1.3.1 | Info and Relationships | A | Structure and relationships are programmatically determinable (semantic HTML) | Validate heading hierarchy, lists, tables, forms |
| 1.3.2 | Meaningful Sequence | A | Reading order is logical and programmatically determinable | Tab through page, check DOM order |
| 1.3.3 | Sensory Characteristics | A | Instructions don't rely solely on shape, size, visual location, orientation, or sound | Review all instructional text |
| 1.3.4 | Orientation | AA | Content doesn't restrict to single display orientation unless essential | Test landscape and portrait |
| 1.3.5 | Identify Input Purpose | AA | Input fields collecting user info have programmatically determinable purpose | Check `autocomplete` attributes |

### 1.4 Distinguishable

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 1.4.1 | Use of Color | A | Color is not the only visual means of conveying info | Review charts, forms, links, status indicators |
| 1.4.2 | Audio Control | A | Auto-playing audio >3s can be paused/stopped or volume controlled | Check for autoplay media |
| 1.4.3 | Contrast (Minimum) | AA | Text contrast ratio is at least 4.5:1 (normal) or 3:1 (large/bold) | Use contrast checker tool |
| 1.4.4 | Resize Text | AA | Text can be resized to 200% without loss of content/functionality | Test with browser zoom |
| 1.4.5 | Images of Text | AA | Use actual text instead of images of text (except logos) | Check for text in images |
| 1.4.10 | Reflow | AA | Content reflows at 320px width without horizontal scrolling | Test at 320px viewport |
| 1.4.11 | Non-text Contrast | AA | UI components and graphics have 3:1 contrast against adjacent colors | Check buttons, icons, charts |
| 1.4.12 | Text Spacing | AA | No loss of content when user adjusts text spacing (line height 1.5×, paragraph spacing 2×, letter spacing 0.12×, word spacing 0.16×) | Apply custom CSS |
| 1.4.13 | Content on Hover or Focus | AA | Additional content on hover/focus is dismissible, hoverable, and persistent | Test tooltips, dropdowns, popovers |

---

## 2. Operable

User interface components must be operable by all users.

### 2.1 Keyboard Accessible

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 2.1.1 | Keyboard | A | All functionality is available via keyboard | Tab through entire interface |
| 2.1.2 | No Keyboard Trap | A | Keyboard focus can always be moved away from any component | Test modal dialogs, custom widgets |
| 2.1.4 | Character Key Shortcuts | A | Single-character key shortcuts can be turned off, remapped, or only active on focus | Check for keyboard shortcuts |

### 2.2 Enough Time

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 2.2.1 | Timing Adjustable | A | Time limits can be turned off, adjusted, or extended (20+ seconds warning) | Check session timeouts, forms |
| 2.2.2 | Pause, Stop, Hide | A | Moving, blinking, scrolling, or auto-updating content can be paused/stopped/hidden | Test carousels, animations, live feeds |

### 2.3 Seizures and Physical Reactions

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 2.3.1 | Three Flashes or Below | A | No content flashes more than 3 times per second | Review animations, videos |

### 2.4 Navigable

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 2.4.1 | Bypass Blocks | A | Mechanism to bypass repeated blocks (skip links) | Check for "Skip to main content" link |
| 2.4.2 | Page Titled | A | Pages have descriptive, unique titles | Check `<title>` elements |
| 2.4.3 | Focus Order | A | Focus order is logical and meaningful | Tab through page |
| 2.4.4 | Link Purpose (In Context) | A | Link purpose is determinable from link text (or context) | Review all link text |
| 2.4.5 | Multiple Ways | AA | Multiple ways to locate pages (nav, search, sitemap) | Check navigation options |
| 2.4.6 | Headings and Labels | AA | Headings and labels describe topic or purpose | Review all headings and form labels |
| 2.4.7 | Focus Visible | AA | Keyboard focus indicator is visible | Tab through and check focus styles |
| 2.4.11 | Focus Not Obscured (Minimum) | AA | **[WCAG 2.2]** Focused element is not entirely hidden by other content | Test sticky headers, modals |
| 2.4.12 | Focus Not Obscured (Enhanced) | AAA | **[WCAG 2.2]** Focused element is not partially hidden | Enhanced focus visibility |
| 2.4.13 | Focus Appearance | AAA | **[WCAG 2.2]** Focus indicator has minimum size and contrast | Check focus ring dimensions |

### 2.5 Input Modalities

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 2.5.1 | Pointer Gestures | A | Multipoint or path-based gestures have single-pointer alternatives | Test pinch-zoom, swipe alternatives |
| 2.5.2 | Pointer Cancellation | A | Down-event doesn't trigger action (use up-event), or can be aborted/reversed | Test click/tap behaviors |
| 2.5.3 | Label in Name | A | Visible label text is included in accessible name | Compare visible vs accessible names |
| 2.5.4 | Motion Actuation | A | Motion-triggered functions have UI alternatives and can be disabled | Test shake, tilt features |
| 2.5.7 | Dragging Movements | AA | **[WCAG 2.2]** Single-pointer alternative for drag operations | Test drag-drop with click alternatives |
| 2.5.8 | Target Size (Minimum) | AA | **[WCAG 2.2]** Touch targets are at least 24×24 CSS pixels (with exceptions) | Measure interactive elements |

---

## 3. Understandable

Information and UI operation must be understandable.

### 3.1 Readable

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 3.1.1 | Language of Page | A | Page language is programmatically identified | Check `<html lang="xx">` |
| 3.1.2 | Language of Parts | AA | Language changes within content are identified | Check `lang` on foreign phrases |

### 3.2 Predictable

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 3.2.1 | On Focus | A | Focus doesn't trigger unexpected context changes | Tab through all elements |
| 3.2.2 | On Input | A | Input doesn't trigger unexpected context changes (unless user is warned) | Test all form inputs |
| 3.2.3 | Consistent Navigation | AA | Navigation is consistent across pages | Compare nav on multiple pages |
| 3.2.4 | Consistent Identification | AA | Same functionality has same labels/icons | Check repeated components |
| 3.2.6 | Consistent Help | A | **[WCAG 2.2]** Help mechanisms appear in consistent location across pages | Check help link/chat positions |

### 3.3 Input Assistance

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 3.3.1 | Error Identification | A | Errors are identified and described in text | Submit invalid forms |
| 3.3.2 | Labels or Instructions | A | Form inputs have labels or instructions | Check all form fields |
| 3.3.3 | Error Suggestion | AA | Error messages suggest corrections when possible | Test validation messages |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | Submissions are reversible, verified, or confirmed | Test checkout, profile updates |
| 3.3.7 | Redundant Entry | A | **[WCAG 2.2]** Previously entered info is auto-populated or available for selection | Test multi-step forms |
| 3.3.8 | Accessible Authentication (Minimum) | AA | **[WCAG 2.2]** No cognitive function test required for authentication (memory, transcription, calculation, puzzle) | Test login flows |
| 3.3.9 | Accessible Authentication (Enhanced) | AAA | **[WCAG 2.2]** No object/content recognition required for auth | Enhanced auth testing |

---

## 4. Robust

Content must be robust enough for diverse user agents and assistive technologies.

### 4.1 Compatible

| # | Criterion | Level | Requirement | Testing |
|---|-----------|-------|-------------|---------|
| 4.1.1 | Parsing | A | (Deprecated in WCAG 2.2) HTML is well-formed | Validate HTML |
| 4.1.2 | Name, Role, Value | A | Custom UI components have accessible name, role, and value | Test with screen reader |
| 4.1.3 | Status Messages | AA | Status messages are programmatically determinable without focus | Check toast notifications, form feedback |

---

## Summary Statistics

| Category | Level A | Level AA | Total |
|----------|---------|----------|-------|
| 1. Perceivable | 13 | 8 | 21 |
| 2. Operable | 12 | 7 | 19 |
| 3. Understandable | 6 | 6 | 12 |
| 4. Robust | 2 | 1 | 3 |
| **Total** | **33** | **22** | **55** |

**Note**: Counts include WCAG 2.2 additions. Some criteria overlap between versions.

---

## WCAG 2.2 New Criteria Summary

These criteria were added in WCAG 2.2 (October 2023):

| # | Criterion | Level | Key Point |
|---|-----------|-------|-----------|
| 2.4.11 | Focus Not Obscured (Minimum) | AA | Focused element not entirely hidden |
| 2.4.12 | Focus Not Obscured (Enhanced) | AAA | Focused element not partially hidden |
| 2.4.13 | Focus Appearance | AAA | Focus indicator meets size/contrast minimums |
| 2.5.7 | Dragging Movements | AA | Click alternative for all drag operations |
| 2.5.8 | Target Size (Minimum) | AA | 24×24px minimum touch targets |
| 3.2.6 | Consistent Help | A | Help in same location across pages |
| 3.3.7 | Redundant Entry | A | Don't require re-entering previously given info |
| 3.3.8 | Accessible Authentication (Minimum) | AA | No cognitive tests for login |
| 3.3.9 | Accessible Authentication (Enhanced) | AAA | No object recognition for login |

---

## Testing Methodology

### Automated Testing (~30% coverage)
- **axe DevTools**: Run on each page
- **Lighthouse**: Include in CI/CD
- **WAVE**: Visual report generation
- **HTML Validator**: Catch parsing issues

### Manual Testing (~70% coverage)
- **Keyboard Navigation**: Tab through entire interface
- **Screen Reader**: Test with NVDA (Windows), VoiceOver (Mac/iOS), TalkBack (Android)
- **Zoom**: Test at 200% and 400% zoom
- **Color**: Test with color blindness simulators
- **Cognitive**: Review with plain language guidelines

### Testing Checklist Template

```markdown
## Accessibility Test Report: [Page/Component Name]

**Date**: [Date]
**Tester**: [Name]
**Tools Used**: [List]

### Automated Results
- axe: [N] violations
- Lighthouse A11y: [Score]%

### Manual Testing
- [ ] Keyboard navigation complete
- [ ] Screen reader tested
- [ ] Focus visible on all elements
- [ ] Color contrast verified
- [ ] Text resizable to 200%
- [ ] Touch targets ≥24×24px

### Issues Found
| # | WCAG | Severity | Description | Recommendation |
|---|------|----------|-------------|----------------|
| 1 | [#] | [H/M/L] | [Issue] | [Fix] |

### Pass/Fail: [PASS/FAIL]
```

---

## Common Failures to Avoid

| Failure | WCAG | Fix |
|---------|------|-----|
| Images without alt text | 1.1.1 | Add descriptive alt or `alt=""` for decorative |
| Missing form labels | 3.3.2 | Use `<label for>` or `aria-label` |
| Insufficient color contrast | 1.4.3 | Increase contrast to 4.5:1+ |
| Keyboard traps | 2.1.2 | Ensure Escape closes modals |
| Missing skip link | 2.4.1 | Add "Skip to main content" |
| Non-descriptive links | 2.4.4 | Replace "click here" with specific text |
| Auto-playing media | 1.4.2 | Add pause controls, default muted |
| Hidden focus indicators | 2.4.7 | Ensure visible `:focus` styles |
| Missing page language | 3.1.1 | Add `lang` to `<html>` |
| Inaccessible custom controls | 4.1.2 | Add ARIA roles, states, properties |

---

## Resources

- [WCAG 2.2 Specification](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist)
- [A11Y Project Checklist](https://www.a11yproject.com/checklist/)
- [DOJ Web Accessibility Final Rule](https://www.ada.gov/resources/web-guidance/)
