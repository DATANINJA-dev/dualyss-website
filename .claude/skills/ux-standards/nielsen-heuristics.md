# Nielsen's 10 Usability Heuristics

Jakob Nielsen's 10 usability heuristics are fundamental principles for interaction design. Originally developed in 1994 and refined in 2020, they remain the most widely used framework for evaluating user interface usability.

**Source**: [Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/)

---

## The 10 Heuristics

### 1. Visibility of System Status

> The design should always keep users informed about what is going on, through appropriate feedback within a reasonable amount of time.

**Principle**: Users should never wonder "what's happening?" or "did that work?"

**Examples**:
| Good | Bad |
|------|-----|
| Progress bar during upload | Spinner with no progress indication |
| "Saved" confirmation after form submit | No feedback after clicking save |
| "3 items in cart" badge | No indication of cart contents |
| Real-time character count in textarea | No indication of length limit |

**Implementation Checklist**:
- [ ] Loading states show progress when duration > 1 second
- [ ] Form submissions show success/error feedback
- [ ] Background operations indicate status
- [ ] Network state changes are communicated
- [ ] Time-sensitive actions show countdown

---

### 2. Match Between System and Real World

> The design should speak the users' language. Use words, phrases, and concepts familiar to the user, rather than internal jargon.

**Principle**: Systems should feel intuitive by using conventions users already know.

**Examples**:
| Good | Bad |
|------|-----|
| "Shopping Cart" | "Item Repository" |
| Trash can icon for delete | "X" for delete (ambiguous) |
| Calendar date picker | Unix timestamp input |
| "Sign In" | "Authenticate Session" |

**Implementation Checklist**:
- [ ] Terminology matches user vocabulary (not developer/business jargon)
- [ ] Metaphors align with real-world concepts
- [ ] Information follows natural/logical order
- [ ] Icons have universally understood meanings
- [ ] Date/time formats match user's locale

---

### 3. User Control and Freedom

> Users often perform actions by mistake. They need a clearly marked "emergency exit" to leave the unwanted action without having to go through an extended process.

**Principle**: Users should feel in control, not trapped.

**Examples**:
| Good | Bad |
|------|-----|
| Undo button after deletion | Immediate permanent delete |
| "Cancel" button on modals | No way to close modal |
| Back button works as expected | Back breaks the app |
| Edit/delete options on submitted content | Can't modify after submit |

**Implementation Checklist**:
- [ ] Destructive actions can be undone or have confirmation
- [ ] Modal dialogs can be closed (Escape key, X button, click outside)
- [ ] Back navigation works throughout the app
- [ ] Multi-step processes allow returning to previous steps
- [ ] "Cancel" is always available alongside "Submit"

---

### 4. Consistency and Standards

> Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform and industry conventions.

**Principle**: Don't reinvent conventions without good reason.

**Examples**:
| Good | Bad |
|------|-----|
| Blue underlined text = link | Random colors for links |
| "Save" in top-right or bottom | "Save" in different positions |
| Standard form field styling | Custom checkboxes that look like buttons |
| Consistent icon meanings | Same icon means different things |

**Implementation Checklist**:
- [ ] Same action has same label everywhere
- [ ] Similar UI elements look and behave the same
- [ ] Follow platform conventions (web, iOS, Android)
- [ ] Error messages have consistent format and location
- [ ] Color meanings are consistent (red = error, green = success)

---

### 5. Error Prevention

> Good error messages are important, but the best designs carefully prevent problems from occurring in the first place.

**Principle**: Design to prevent errors, not just handle them.

**Examples**:
| Good | Bad |
|------|-----|
| Disable "Submit" until form is valid | Allow invalid submissions |
| Confirm before destructive action | Delete immediately on click |
| Inline validation as user types | Validation only on submit |
| Suggest valid inputs (autocomplete) | Free text only |

**Implementation Checklist**:
- [ ] Constrain inputs where possible (dropdowns vs free text)
- [ ] Validate inline as user enters data
- [ ] Disable unavailable options (don't hide them)
- [ ] Require confirmation for irreversible actions
- [ ] Provide smart defaults and autofill

---

### 6. Recognition Rather Than Recall

> Minimize the user's memory load by making elements, actions, and options visible. Users should not have to remember information from one part of the interface to another.

**Principle**: Show, don't expect users to remember.

**Examples**:
| Good | Bad |
|------|-----|
| Recent searches visible | Must remember previous queries |
| Dropdown with options | Must know valid code to type |
| Preview of formatting | Must memorize markdown syntax |
| Autocomplete suggestions | Free text with no hints |

**Implementation Checklist**:
- [ ] Important information is visible or easily accessible
- [ ] Recently used items are shown
- [ ] Context is maintained (breadcrumbs, page titles)
- [ ] Instructions are visible when needed
- [ ] Search/filter options are surfaced, not hidden

---

### 7. Flexibility and Efficiency of Use

> Shortcuts—hidden from novice users—can speed up interaction for experts, so that the design can cater to both inexperienced and experienced users.

**Principle**: Serve both beginners and power users.

**Examples**:
| Good | Bad |
|------|-----|
| Keyboard shortcuts + toolbar buttons | Toolbar only, no shortcuts |
| "Quick actions" for common tasks | Same steps for every task |
| Customizable dashboard | Fixed, unchangeable layout |
| Bulk actions for multiple items | Must act on each item individually |

**Implementation Checklist**:
- [ ] Keyboard shortcuts for common actions
- [ ] Bulk/batch operations available
- [ ] Frequent actions are easily accessible
- [ ] Advanced features don't complicate basic flows
- [ ] Personalization options for power users

---

### 8. Aesthetic and Minimalist Design

> Interfaces should not contain information which is irrelevant or rarely needed. Every extra unit of information competes with relevant units and diminishes their relative visibility.

**Principle**: Less is more. Every element should earn its place.

**Examples**:
| Good | Bad |
|------|-----|
| Clean form with essential fields | Form with 20 optional fields |
| Progressive disclosure | All options visible at once |
| Whitespace for visual breathing room | Cramped, cluttered layout |
| One primary action per screen | Multiple competing CTAs |

**Implementation Checklist**:
- [ ] Content is prioritized, not everything shown at once
- [ ] Visual hierarchy guides attention
- [ ] Decorative elements don't distract from content
- [ ] One clear primary action per screen/context
- [ ] Secondary information is accessible but not prominent

---

### 9. Help Users Recognize, Diagnose, and Recover from Errors

> Error messages should be expressed in plain language (no error codes), precisely indicate the problem, and constructively suggest a solution.

**Principle**: Error messages should help, not frustrate.

**Examples**:
| Good | Bad |
|------|-----|
| "Email format invalid. Example: name@domain.com" | "Error 422" |
| "Password must be at least 8 characters" | "Invalid password" |
| "Connection lost. Retrying..." with retry button | "Network error" |
| Highlight the specific field with error | Red banner with no details |

**Implementation Checklist**:
- [ ] Errors are in plain language (no codes)
- [ ] Errors identify what went wrong specifically
- [ ] Errors suggest how to fix the problem
- [ ] Errors appear near the relevant field/action
- [ ] Recovery actions are clear (retry, edit, contact support)

---

### 10. Help and Documentation

> It's best if the system doesn't need any additional explanation. However, it may be necessary to provide documentation to help users understand how to complete their tasks.

**Principle**: Help should be available but not required.

**Examples**:
| Good | Bad |
|------|-----|
| Contextual tooltips on complex features | 50-page manual as only help |
| Inline examples and hints | No guidance at all |
| Searchable help center | Unorganized FAQ |
| Onboarding tour for new users | Dump users in complex interface |

**Implementation Checklist**:
- [ ] Help is easily searchable
- [ ] Documentation is task-focused, not feature-focused
- [ ] Contextual help appears where/when needed
- [ ] Empty states include guidance
- [ ] Complex features have inline explanations

---

## Heuristic Evaluation Template

Use this template to evaluate an interface against Nielsen's heuristics:

```markdown
## Heuristic Evaluation: [Product/Feature Name]

**Evaluator**: [Name]
**Date**: [Date]
**Interface Version**: [Version]

### Evaluation Summary

| # | Heuristic | Score (0-4) | Issues |
|---|-----------|-------------|--------|
| 1 | Visibility of system status | [0-4] | [N] |
| 2 | Match between system and real world | [0-4] | [N] |
| 3 | User control and freedom | [0-4] | [N] |
| 4 | Consistency and standards | [0-4] | [N] |
| 5 | Error prevention | [0-4] | [N] |
| 6 | Recognition rather than recall | [0-4] | [N] |
| 7 | Flexibility and efficiency | [0-4] | [N] |
| 8 | Aesthetic and minimalist design | [0-4] | [N] |
| 9 | Help users with errors | [0-4] | [N] |
| 10 | Help and documentation | [0-4] | [N] |

**Overall Score**: [Sum/40] ([Percentage]%)

### Severity Rating Scale
- 0 = Not a usability problem
- 1 = Cosmetic problem only
- 2 = Minor usability problem
- 3 = Major usability problem
- 4 = Usability catastrophe

### Issues Found

| ID | Heuristic | Severity | Location | Description | Recommendation |
|----|-----------|----------|----------|-------------|----------------|
| 1 | [#] | [0-4] | [Page/Component] | [Issue description] | [How to fix] |

### Priority Fixes
1. [Most critical issue]
2. [Second priority]
3. [Third priority]
```

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────┐
│           NIELSEN'S 10 USABILITY HEURISTICS            │
├────────────────────────────────────────────────────────┤
│  1. VISIBILITY     - Always show system status         │
│  2. REAL WORLD     - Use language users understand     │
│  3. CONTROL        - Support undo and emergency exits  │
│  4. CONSISTENCY    - Follow conventions and standards  │
│  5. PREVENTION     - Design to prevent errors          │
│  6. RECOGNITION    - Show options, don't require recall│
│  7. FLEXIBILITY    - Support beginners and experts     │
│  8. MINIMALISM     - Remove unnecessary information    │
│  9. ERROR RECOVERY - Help users fix their mistakes     │
│ 10. HELP           - Provide documentation when needed │
└────────────────────────────────────────────────────────┘
```

---

## Resources

- [10 Usability Heuristics for User Interface Design (NN/g)](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [How to Conduct a Heuristic Evaluation (NN/g)](https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/)
- [Severity Ratings for Usability Problems (NN/g)](https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/)
- [Summary Poster (NN/g)](https://www.nngroup.com/articles/ten-usability-heuristics/)
