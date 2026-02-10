---
name: user-journey-design
description: |
  Helps design User Journeys BEFORE implementation. Enforces journey mapping
  as a pre-implementation step to prevent UX gaps. Invoke explicitly with
  /ux, /user-journey, or /journey when planning new features or pages.

  Type: active (on-demand invocation, not auto-triggered)
---

# User Journey Design Skill

This skill enforces User Journey documentation BEFORE writing code. It helps design user flows by asking the right questions and producing a journey map that guides implementation.

## When to Use This Skill

**Invoke explicitly** when planning:
- New pages or views
- New user flows (signup, checkout, onboarding)
- Features with multiple steps
- Role-specific functionality
- Any UI that involves navigation

### Invocation Methods

| Method | Description |
|--------|-------------|
| `/ux [feature]` | Quick invocation |
| `/user-journey [feature]` | Full invocation |
| `/journey [feature]` | Alias |
| Ask "help me with the UX for..." | Natural language |

### Activation Keywords (Manual Trigger)

| Keyword Pattern | When to Invoke |
|-----------------|----------------|
| "ux", "user journey", "journey map" | Planning UX flows |
| "design the flow", "map the journey" | Before implementation |
| "what's the user experience for" | Seeking UX guidance |

**Note**: This skill does NOT auto-trigger on "implement" - that would be too aggressive. Invoke it explicitly when you want UX-first design.

## Core Workflow

```
1. User invokes: "/ux profile settings page"
2. Skill asks journey questions (Actor, Entry, Goal, etc.)
3. User answers (or Claude researches codebase)
4. Skill produces Journey Map document
5. Journey Map guides implementation
```

## Questions Framework

### Required Questions (Always Ask)

1. **Actor**: Who is the user? (Role: STUDENT, ADMIN, etc.)
2. **Entry Point**: Where does the journey start? (Page, state, trigger)
3. **Goal**: What does the user want to accomplish?
4. **Happy Path**: Step-by-step journey (clicks, not URLs)
5. **Exit Point**: Where does the journey end?

### Conditional Questions (Ask When Relevant)

| Condition | Question |
|-----------|----------|
| Form-heavy | What validations are needed? |
| Multi-step | What's the progress indicator? |
| Destructive action | What's the confirmation flow? |
| Error-prone | What error states exist? |
| Role-specific | Which roles can access this? |

### Discovery Questions (Research First)

Before asking the user, Claude should:
1. Check existing pages/flows for patterns
2. Read relevant rules files (ux-decisions.md, ui-patterns.md)
3. Look at similar journeys already implemented

## Output Format

The skill produces a **Journey Map** document that can be:
1. Embedded in the conversation (inline)
2. Saved to a file (for complex features)
3. Added to task documentation

### Journey Map Template

See `journey-template.md` for the full template.

## Quick Reference

| Supporting File | Purpose |
|-----------------|---------|
| `journey-template.md` | Reusable journey map template |
| `checklist.md` | Pre-implementation questions checklist |
| `examples/admin-journey.md` | Example: Admin portal navigation |

## Integration Points

### Related Skills

| Skill | Relationship |
|-------|--------------|
| `user-journey-validation` | Validates AFTER implementation (complementary) |
| `ux-standards` | Provides accessibility and usability patterns |
| `task-discovery` | Can incorporate journey questions |

### Related Agents

| Agent | Integration |
|-------|-------------|
| `ui-designer` | Uses journey maps for wireframes |
| `accessibility-specialist` | Validates journey accessibility |

## Constraints

- **Explicitly invoked** - Does not auto-trigger
- **Pre-implementation** - Creates docs, not code
- **Role-aware** - Journeys must specify the actor role
- **Accessibility-first** - Journeys include keyboard navigation
- **Spanish UI** - Journey steps use Spanish UI labels

## Usage Example

**User**: `/ux I want to add a profile settings page`

**Claude**:
```
Let me help you design the user journey for the profile settings page.

**Journey Questions:**

1. **Actor**: Which role(s) can access profile settings?
   - All authenticated users, or specific roles?

2. **Entry Point**: How does the user get to settings?
   - From header menu?
   - From dashboard?
   - Direct URL?

3. **Goal**: What can users do in profile settings?
   - Edit name?
   - Change email?
   - Change password?
   - Upload avatar?

4. **Error States**: What can go wrong?
   - Invalid email format
   - Weak password
   - Email already taken

5. **Exit Point**: Where does the user go after saving?
   - Back to where they came from?
   - Stay on settings with success message?
```

**User**: "All users, from header menu, edit name and email only, back to previous page"

**Claude**: *Produces journey map, then implements*

## Sources

- Playwright Best Practices: Test user-visible behavior
- UX Testing 2025: Combining automation with human testing
- Nielsen Norman Group: User journey mapping patterns
