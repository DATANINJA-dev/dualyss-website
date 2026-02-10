# UI Edge Cases Checklist

This document covers common UI states that are often overlooked but critical for a polished user experience. Every interface should handle these states gracefully.

---

## 1. Empty States

Empty states occur when there's no data to display. They should guide users rather than leaving them confused.

### Types of Empty States

| Type | When It Occurs | Example |
|------|----------------|---------|
| First-use | New user, no data yet | Empty inbox for new account |
| No results | Search/filter returns nothing | "No results for 'xyz'" |
| User-cleared | User deleted all items | Empty cart after removal |
| Permissions | User lacks access to view content | "No access to this folder" |
| Error-caused | Data couldn't be loaded | "Couldn't load messages" |

### Empty State Best Practices

**Do**:
- Explain why it's empty
- Provide a clear call-to-action
- Use friendly, helpful tone
- Include relevant illustration (optional but helpful)

**Don't**:
- Show a completely blank screen
- Use technical jargon
- Make users feel bad ("You have no friends")
- Leave them stuck with no next step

### Empty State Checklist

- [ ] First-time user sees welcoming empty state
- [ ] "No results" explains what was searched
- [ ] "No results" suggests broadening search or clearing filters
- [ ] User-cleared state allows easy re-adding
- [ ] Permission-denied explains why and how to get access
- [ ] Failed-load state includes retry button

### Example Patterns

```
┌─────────────────────────────────────────┐
│                                         │
│           [Illustration]                │
│                                         │
│      No projects yet                    │
│                                         │
│   Create your first project to get      │
│   started tracking your work.           │
│                                         │
│      [ + Create Project ]               │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│     No results for "xyzabc"             │
│                                         │
│   Try:                                  │
│   • Check your spelling                 │
│   • Use fewer keywords                  │
│   • Clear filters                       │
│                                         │
│      [ Clear all filters ]              │
│                                         │
└─────────────────────────────────────────┘
```

---

## 2. Loading States

Loading states communicate that the system is working. Duration and context determine the appropriate pattern.

### Loading State Types

| Duration | Pattern | Example |
|----------|---------|---------|
| < 100ms | No indicator needed | Instant local operation |
| 100ms - 1s | Subtle indicator | Spinner on button |
| 1s - 10s | Skeleton/progress | Page content loading |
| > 10s | Progress bar with % | File upload |

### Loading State Checklist

- [ ] Initial page load shows skeleton or loading indicator
- [ ] Button actions show inline loading state
- [ ] Long operations show progress (not just spinner)
- [ ] Users can cancel long-running operations
- [ ] Lazy-loaded content shows placeholders
- [ ] Background refreshes don't disrupt user
- [ ] Network requests have timeout handling

### Loading Patterns by Context

| Context | Pattern | User Impact |
|---------|---------|-------------|
| Button click | Disable + spinner | Can't double-click |
| Page load | Skeleton | Layout doesn't jump |
| List item | Individual skeleton | Progressive display |
| Image | Blur-up or placeholder | Immediate feedback |
| Form submit | Full-page or inline | Clear submission state |
| Background sync | Subtle indicator only | Non-blocking |

### Example Patterns

```
Button Loading:
┌──────────────────┐   ┌──────────────────┐
│    [ Submit ]    │ → │   [⟳ Saving...]  │
└──────────────────┘   └──────────────────┘

Skeleton Loading:
┌─────────────────────────────────────────┐
│ ████████████████████                    │
│ ████████████                            │
│ ██████████████████████████████          │
│                                         │
│ ████████████████████                    │
│ ████████████                            │
└─────────────────────────────────────────┘

Progress Bar:
┌─────────────────────────────────────────┐
│  Uploading document.pdf                 │
│  ████████████████░░░░░░░░  64%         │
│  2.3 MB of 3.6 MB • ~5 seconds left    │
│                                         │
│              [ Cancel ]                 │
└─────────────────────────────────────────┘
```

---

## 3. Error States

Error states help users understand what went wrong and how to recover.

### Error Types

| Type | Cause | User Expectation |
|------|-------|------------------|
| Validation | Invalid user input | Immediate inline feedback |
| Network | Connection issue | Retry option |
| Server (5xx) | Backend failure | Apologize, offer retry |
| Auth (401/403) | Session/permission issue | Re-login or explain |
| Not found (404) | Resource doesn't exist | Helpful navigation |
| Rate limit (429) | Too many requests | Wait time estimate |

### Error State Best Practices

**Do**:
- Use plain language, not error codes
- Identify the specific problem
- Suggest how to fix it
- Provide recovery actions
- Keep user data when possible

**Don't**:
- Show stack traces or technical details
- Blame the user
- Leave user with no next step
- Lose user's in-progress work

### Error State Checklist

- [ ] Validation errors appear inline, near the field
- [ ] Errors clearly state what went wrong
- [ ] Errors suggest how to fix the problem
- [ ] Network errors offer retry button
- [ ] Server errors apologize and provide contact option
- [ ] 404 pages help users navigate elsewhere
- [ ] Session timeout preserves user's work
- [ ] Rate limit errors show when to try again

### Error Message Template

```
┌─────────────────────────────────────────┐
│ ⚠️ [What went wrong]                    │
│                                         │
│ [Why it might have happened]            │
│                                         │
│ [How to fix it or what to do next]      │
│                                         │
│ [ Primary Action ]  [ Secondary ]       │
└─────────────────────────────────────────┘

Examples:

"Couldn't save your changes"
We lost connection to the server.
[Try again] or [Save offline]

"Email address is invalid"
Please enter a valid email like name@example.com

"Page not found"
This page might have been moved or deleted.
[Go to homepage] [Search site]
```

---

## 4. Boundary Conditions

Boundary conditions test the limits of your interface with extreme or unexpected input.

### Text Boundaries

| Condition | Test | Solution |
|-----------|------|----------|
| Very long text | 100+ character name | Truncate with ellipsis |
| Empty text | "" or whitespace only | Show placeholder, validate |
| Special characters | `<script>`, `'`, `"` | Escape/sanitize, don't break |
| Unicode | Emoji, RTL, diacritics | Proper encoding, font support |
| Very long word | "Supercalifragilisticexpialidocious" | Word-break or scroll |

### Numeric Boundaries

| Condition | Test | Solution |
|-----------|------|----------|
| Zero | 0 items, $0.00 | Handle singular/plural, zero state |
| Large numbers | 1,000,000+ | Format with commas/abbreviations |
| Negative numbers | -5 items | Validate or handle gracefully |
| Decimals | 3.14159... | Round to appropriate precision |
| Very large | 999,999,999,999 | Scientific notation or max cap |

### List Boundaries

| Condition | Test | Solution |
|-----------|------|----------|
| Empty list | 0 items | Show empty state |
| Single item | 1 item | Correct grammar ("1 item") |
| Many items | 1000+ items | Pagination or virtualization |
| Very many | 100,000+ items | Search/filter, lazy loading |

### Display Boundaries

| Condition | Test | Solution |
|-----------|------|----------|
| Narrow viewport | 320px width | Reflow without horizontal scroll |
| Wide viewport | 4K display | Max-width or adaptive layout |
| Zoom | 200%, 400% | Content remains usable |
| Long labels | Localized strings 2x length | Flexible containers |

### Boundary Checklist

- [ ] Long text is truncated gracefully (ellipsis, tooltip for full text)
- [ ] Special characters don't break layout or security
- [ ] Numbers are formatted appropriately (commas, units)
- [ ] Zero is handled with appropriate messaging
- [ ] Large lists are paginated or virtualized
- [ ] Minimum viewport (320px) is supported
- [ ] Zoom to 200% doesn't break layout
- [ ] Content doesn't overflow containers

### Testing Approach

```markdown
## Boundary Testing Checklist

### Text Input: [Field Name]
- [ ] Empty input handled
- [ ] Whitespace-only handled
- [ ] Max length enforced
- [ ] Special characters: <script>, ', ", &, <, >
- [ ] Unicode: emoji 🎉, accents éàü, RTL العربية
- [ ] Very long word without spaces

### Numeric Input: [Field Name]
- [ ] 0 (zero) handled
- [ ] Negative numbers handled (if applicable)
- [ ] Max value handled
- [ ] Decimal precision controlled
- [ ] Invalid input (letters) rejected

### List Display: [Component Name]
- [ ] 0 items (empty state)
- [ ] 1 item (singular grammar)
- [ ] 10 items (normal)
- [ ] 100 items (pagination/scroll)
- [ ] 1000+ items (performance)

### Responsive: [Page Name]
- [ ] 320px width (no horizontal scroll)
- [ ] 768px width (tablet)
- [ ] 1920px width (desktop)
- [ ] 200% zoom (WCAG requirement)
```

---

## State Matrix Template

Use this matrix to track state handling coverage:

```markdown
## State Coverage Matrix: [Feature Name]

| State | Covered? | Notes |
|-------|----------|-------|
| **Empty States** | | |
| First-time user | [ ] | |
| No search results | [ ] | |
| User cleared | [ ] | |
| No permission | [ ] | |
| **Loading States** | | |
| Initial load | [ ] | |
| Button action | [ ] | |
| Background refresh | [ ] | |
| Long operation | [ ] | |
| **Error States** | | |
| Validation error | [ ] | |
| Network error | [ ] | |
| Server error | [ ] | |
| 404 not found | [ ] | |
| Session expired | [ ] | |
| **Boundary Conditions** | | |
| Long text | [ ] | |
| Empty input | [ ] | |
| Large numbers | [ ] | |
| Many items | [ ] | |
| Narrow viewport | [ ] | |
```

---

## Quick Reference

```
┌────────────────────────────────────────────────────────┐
│                   UI STATES CHECKLIST                  │
├────────────────────────────────────────────────────────┤
│ EMPTY STATES                                           │
│   [ ] First-time: Welcome + CTA                        │
│   [ ] No results: Explain + suggestions                │
│   [ ] Cleared: Allow easy re-adding                    │
│   [ ] No access: Explain why + how to get              │
│                                                        │
│ LOADING STATES                                         │
│   [ ] <100ms: No indicator                             │
│   [ ] 100ms-1s: Subtle spinner                         │
│   [ ] 1s-10s: Skeleton/progress                        │
│   [ ] >10s: Progress bar + cancel                      │
│                                                        │
│ ERROR STATES                                           │
│   [ ] Plain language (no codes)                        │
│   [ ] Specific problem identified                      │
│   [ ] Solution suggested                               │
│   [ ] Recovery action provided                         │
│                                                        │
│ BOUNDARY CONDITIONS                                    │
│   [ ] Long text: truncate + tooltip                    │
│   [ ] Special chars: sanitize                          │
│   [ ] Large numbers: format                            │
│   [ ] Many items: paginate/virtualize                  │
│   [ ] 320px width: no horizontal scroll                │
└────────────────────────────────────────────────────────┘
```
