# Common Navigation Patterns

This document provides common navigation patterns for suggesting entry/exit points during proactive page connection definition.

## Pattern Categories

### 1. Authentication Flows

```yaml
patterns:
  login_page:
    name: "Login Page"
    triggers: ["login", "signin", "auth"]
    suggested_entry_points:
      - "/"
      - "/signup"
      - "/forgot-password"
    suggested_exit_points:
      - "/dashboard"
      - "/home"
      - "/signup"
      - "/forgot-password"
    orphan_risk: low  # Multiple entry points typical

  signup_page:
    name: "Signup/Registration"
    triggers: ["signup", "register", "create account"]
    suggested_entry_points:
      - "/"
      - "/login"
      - "/pricing"
    suggested_exit_points:
      - "/dashboard"
      - "/onboarding"
      - "/login"
    orphan_risk: low

  forgot_password:
    name: "Forgot Password"
    triggers: ["forgot", "reset password", "recover"]
    suggested_entry_points:
      - "/login"
    suggested_exit_points:
      - "/login"
      - "/reset-password-sent"
    orphan_risk: medium  # Single entry point

  logout:
    name: "Logout"
    triggers: ["logout", "signout"]
    suggested_entry_points:
      - "/dashboard"
      - "/settings"
      - "*"  # Any authenticated page
    suggested_exit_points:
      - "/"
      - "/login"
    orphan_risk: low
```

### 2. Dashboard & Main Pages

```yaml
patterns:
  dashboard:
    name: "Dashboard"
    triggers: ["dashboard", "home", "main"]
    suggested_entry_points:
      - "/login"
      - "/signup"
      - "/"
    suggested_exit_points:
      - "/settings"
      - "/profile"
      - "/reports"
      - "/users"
      - "/logout"
    orphan_risk: low  # Primary destination

  landing:
    name: "Landing Page"
    triggers: ["landing", "home", "index"]
    suggested_entry_points:
      - "*"  # External traffic, root entry
    suggested_exit_points:
      - "/login"
      - "/signup"
      - "/pricing"
      - "/features"
    orphan_risk: low  # Root page
```

### 3. Wizard/Multi-Step Flows

```yaml
patterns:
  wizard_step:
    name: "Wizard Step"
    triggers: ["step", "wizard", "onboarding", "checkout"]
    entry_point_formula: "/wizard/step-{N-1}"  # Previous step
    exit_point_formula: "/wizard/step-{N+1}"   # Next step
    special_cases:
      first_step:
        entry_points: ["/start", "/begin", "/dashboard"]
      last_step:
        exit_points: ["/success", "/confirmation", "/dashboard"]
    orphan_risk: low  # Linear flow

  checkout:
    name: "Checkout Flow"
    triggers: ["checkout", "cart", "payment", "order"]
    suggested_entry_points:
      - "/cart"
      - "/products"
    suggested_exit_points:
      - "/payment"
      - "/confirmation"
      - "/cart"  # Back to cart
    orphan_risk: low
```

### 4. Settings & Profile Pages

```yaml
patterns:
  settings:
    name: "Settings"
    triggers: ["settings", "preferences", "config"]
    suggested_entry_points:
      - "/dashboard"
      - "/profile"
    suggested_exit_points:
      - "/dashboard"
      - "/settings/profile"
      - "/settings/security"
      - "/settings/notifications"
    orphan_risk: low

  profile:
    name: "User Profile"
    triggers: ["profile", "account", "my account"]
    suggested_entry_points:
      - "/dashboard"
      - "/settings"
    suggested_exit_points:
      - "/settings"
      - "/dashboard"
      - "/profile/edit"
    orphan_risk: low
```

### 5. CRUD Patterns

```yaml
patterns:
  list_view:
    name: "List/Index View"
    triggers: ["list", "index", "all", "browse"]
    suggested_entry_points:
      - "/dashboard"
      - "/search"
    suggested_exit_points:
      - "/{resource}/:id"  # Detail view
      - "/{resource}/new"  # Create form
      - "/dashboard"
    orphan_risk: low

  detail_view:
    name: "Detail View"
    triggers: ["detail", "view", "show", ":id"]
    suggested_entry_points:
      - "/{resource}"      # List view
      - "/search"
    suggested_exit_points:
      - "/{resource}/:id/edit"
      - "/{resource}"      # Back to list
      - "/dashboard"
    orphan_risk: medium  # Depends on list accessibility

  create_form:
    name: "Create/New Form"
    triggers: ["new", "create", "add"]
    suggested_entry_points:
      - "/{resource}"  # List view
    suggested_exit_points:
      - "/{resource}/:id"  # After create
      - "/{resource}"      # Cancel/back
    orphan_risk: medium

  edit_form:
    name: "Edit Form"
    triggers: ["edit", "update", "modify"]
    suggested_entry_points:
      - "/{resource}/:id"  # Detail view
    suggested_exit_points:
      - "/{resource}/:id"  # After save
      - "/{resource}"      # Cancel
    orphan_risk: medium
```

### 6. Error & Recovery Pages

```yaml
patterns:
  not_found:
    name: "404 Not Found"
    triggers: ["404", "not found", "error"]
    suggested_entry_points:
      - "*"  # Any invalid URL
    suggested_exit_points:
      - "/"
      - "/dashboard"
      - "/search"
    orphan_risk: low  # Universal fallback

  error_page:
    name: "Error Page"
    triggers: ["error", "500", "oops"]
    suggested_entry_points:
      - "*"  # Any error condition
    suggested_exit_points:
      - "/"
      - "/dashboard"
      - "back"  # Previous page
    orphan_risk: low

  unauthorized:
    name: "Unauthorized"
    triggers: ["unauthorized", "401", "forbidden", "403"]
    suggested_entry_points:
      - "*"  # Protected route attempt
    suggested_exit_points:
      - "/login"
      - "/"
    orphan_risk: low
```

## Orphan Risk Scoring

| Entry Point Count | Risk Level | Display |
|-------------------|------------|---------|
| 0 | HIGH | No entry points - page will be orphaned |
| 1 | MEDIUM | Single entry point - limited discoverability |
| 2-3 | LOW | Multiple entry points - well connected |
| 4+ | MINIMAL | Highly accessible |

## Pattern Matching Algorithm

```
function matchPattern(taskDescription):
    patterns = loadPatterns()
    matched = []

    for pattern in patterns:
        for trigger in pattern.triggers:
            if trigger in taskDescription.lowercase():
                matched.append(pattern)
                break

    if matched.empty():
        return defaultPattern()  # Generic suggestions

    # Return highest-confidence match
    return selectBestMatch(matched, taskDescription)
```

## Usage in Phase 2.7

When `/generate-task` detects a page-related task:

1. **Match patterns** against task description
2. **Suggest entry points** from matched pattern
3. **Suggest exit points** from matched pattern
4. **Calculate orphan risk** based on entry point count
5. **Allow customization** via AskUserQuestion "Other" option
