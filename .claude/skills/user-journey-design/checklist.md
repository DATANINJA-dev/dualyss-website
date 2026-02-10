# Pre-Implementation Checklist

Ask these questions BEFORE writing any code for a new feature or page.

## Quick Checklist (5 Essential Questions)

1. **Who?** - Which role(s) can use this feature?
2. **Where from?** - How does the user get here?
3. **What?** - What can the user do?
4. **What if?** - What can go wrong?
5. **Where to?** - Where does the user go after?

## Detailed Question Framework

### 1. Actor Questions

| Question | Why It Matters |
|----------|----------------|
| Which role(s) can access this? | Role-based access control |
| Do different roles see different things? | Conditional UI rendering |
| What permissions are required? | Authorization checks |
| Is this behind authentication? | Middleware/guards |

**Example answers:**
- "STUDENT and TEACHER only"
- "All authenticated users"
- "SUPERADMIN can create, ADMIN can only view"

### 2. Entry Point Questions

| Question | Why It Matters |
|----------|----------------|
| How does the user navigate here? | Navigation design |
| Is there a direct URL? | Route definition |
| Is it from a button/link? Where? | Component placement |
| Can they deep-link to this page? | SEO, bookmarking |

**Example answers:**
- "From the sidebar menu"
- "From a button in the header"
- "From /dashboard, clicking 'Configuración'"
- "Direct URL: /settings/profile"

### 3. Goal Questions

| Question | Why It Matters |
|----------|----------------|
| What is the user trying to accomplish? | Feature scope |
| Is this a single action or multi-step? | UI complexity |
| What data do they need to provide? | Form design |
| What data do they need to see? | Data fetching |

**Example answers:**
- "Update their name and email"
- "Complete a 3-step onboarding wizard"
- "View their course progress"
- "Create a new company with name and domain"

### 4. Happy Path Questions

| Question | Why It Matters |
|----------|----------------|
| What's the first thing they see? | Initial state |
| What do they click first? | Primary action |
| What happens when they submit? | Form handling |
| What feedback do they get? | UX feedback |

**Format each step as:**
```
User [action] → System [response]
```

### 5. Error State Questions

| Question | Why It Matters |
|----------|----------------|
| What validation is needed? | Client-side validation |
| What server errors are possible? | Error handling |
| What happens if network fails? | Offline/retry |
| What if they're not authorized? | 403 handling |

**Common error types:**
- Form validation (email format, password strength)
- Business rules (email already taken)
- Server errors (500)
- Network errors (offline, timeout)
- Permission errors (403)
- Not found (404)

### 6. Exit Point Questions

| Question | Why It Matters |
|----------|----------------|
| Where do they go on success? | Redirect logic |
| What confirmation do they see? | Success feedback |
| How do they cancel? | Cancel flow |
| Can they go back? | Navigation history |

**Example answers:**
- "Stay on page with success toast"
- "Redirect to /dashboard"
- "Return to previous page"
- "Show success modal with 'Continuar' button"

### 7. Accessibility Questions

| Question | Why It Matters |
|----------|----------------|
| Can this be done with keyboard only? | Keyboard accessibility |
| What does a screen reader announce? | ARIA labels |
| Is the focus managed correctly? | Focus management |
| Are error messages linked to fields? | Form accessibility |

### 8. Edge Case Questions

| Question | Why It Matters |
|----------|----------------|
| What if there's no data? | Empty state |
| What if data is loading? | Loading state |
| What if the text is very long? | Truncation |
| What if they double-click? | Debouncing |

## Question Mode Selection

### Guided Mode (Interactive)
Ask questions one at a time, wait for answers:
- Best for: Complex features, unclear requirements
- Format: Ask → Wait → Clarify → Next

### Batch Mode (Efficient)
Group related questions together:
- Best for: Simple features, experienced users
- Format: Present all questions → Collect all answers

### Research-First Mode
Claude researches before asking:
- Best for: Projects with established patterns
- Format: Research → Present findings → Ask only unknowns

## Integration with Task Discovery

If using `/generate-task`, include journey questions in the discovery phase:

```markdown
## Task Discovery Questions

### Standard Questions
- What is the task type? (feature/bug/refactor)
- What is the acceptance criteria?

### Journey Questions (if UI-related)
- Who is the actor?
- What's the entry point?
- What's the happy path?
- What are the error states?
- What's the exit point?
```

## Anti-Patterns to Avoid

| Anti-Pattern | Better Approach |
|--------------|-----------------|
| "Just make a settings page" | Define what settings are editable |
| "Add a button" | Where? What does it do? Who sees it? |
| "Handle errors" | Which errors? What recovery? |
| "Make it accessible" | Which WCAG criteria? How verified? |
| "Navigate to X" | Via click or URL? From where? |
