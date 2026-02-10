# Route Registry Patterns

This document defines the YAML schema for route registries used in user journey validation.

## Route Registry Schema

### Basic Structure

```yaml
# route-registry.yaml
version: "1.0"
root: "/"
routes:
  - path: "/dashboard"
    component: "Dashboard"
    title: "Dashboard"
    entry_points:
      - "/"
      - "/login"
    exit_points:
      - "/settings"
      - "/reports"
    metadata:
      protected: true
      layout: "main"
```

### Schema Definition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | Yes | Registry schema version |
| `root` | string | Yes | Application root path (usually "/") |
| `routes` | array | Yes | List of route definitions |

### Route Object Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | Yes | URL path pattern |
| `component` | string | Yes | Component/page name |
| `title` | string | No | Page title for SEO/display |
| `entry_points` | array | No | Paths that navigate TO this route |
| `exit_points` | array | No | Paths this route navigates TO |
| `children` | array | No | Nested routes (for layouts) |
| `metadata` | object | No | Additional route metadata |

### Metadata Schema

| Field | Type | Description |
|-------|------|-------------|
| `protected` | boolean | Requires authentication |
| `layout` | string | Layout wrapper component |
| `breadcrumb` | string | Custom breadcrumb label |
| `seo` | object | SEO metadata (title, description) |
| `access` | array | Required roles/permissions |

## Entry/Exit Points

Entry and exit points define the navigation graph edges:

```yaml
routes:
  - path: "/dashboard"
    entry_points:     # WHERE users come FROM
      - "/"           # Can arrive from home
      - "/login"      # Can arrive after login
    exit_points:      # WHERE users go TO
      - "/settings"   # Dashboard links to settings
      - "/reports"    # Dashboard links to reports
      - "/logout"     # Dashboard has logout option
```

### Why Entry/Exit Points?

1. **Orphan Detection**: Pages with no entry points are orphans
2. **Dead-End Detection**: Pages with no exit points are dead-ends
3. **Graph Construction**: Entry/exit points build the navigation graph
4. **Validation**: Ensures bidirectional navigation exists

## Dynamic Route Segments

Support for parameterized routes:

```yaml
routes:
  - path: "/users/:id"
    component: "UserProfile"
    title: "User Profile"
    params:
      id:
        type: "string"
        pattern: "^[a-zA-Z0-9]+$"
    entry_points:
      - "/users"
      - "/search"
    exit_points:
      - "/users/:id/edit"
      - "/users"

  - path: "/products/:category/:productId"
    component: "ProductDetail"
    params:
      category:
        type: "string"
        enum: ["electronics", "clothing", "home"]
      productId:
        type: "number"
```

## Nested Routes

For layout-based routing:

```yaml
routes:
  - path: "/dashboard"
    component: "DashboardLayout"
    children:
      - path: ""              # /dashboard (index)
        component: "DashboardHome"
      - path: "analytics"     # /dashboard/analytics
        component: "Analytics"
      - path: "settings"      # /dashboard/settings
        component: "Settings"
```

## Complete Example

```yaml
version: "1.0"
root: "/"

routes:
  # Public routes
  - path: "/"
    component: "Home"
    title: "Welcome"
    exit_points:
      - "/login"
      - "/signup"
      - "/about"
    metadata:
      protected: false
      layout: "public"

  - path: "/login"
    component: "Login"
    title: "Sign In"
    entry_points:
      - "/"
      - "/signup"
    exit_points:
      - "/dashboard"
      - "/signup"
      - "/"
    metadata:
      protected: false
      redirect_if_authenticated: "/dashboard"

  - path: "/signup"
    component: "Signup"
    title: "Create Account"
    entry_points:
      - "/"
      - "/login"
    exit_points:
      - "/dashboard"
      - "/login"
    metadata:
      protected: false

  # Protected routes
  - path: "/dashboard"
    component: "DashboardLayout"
    title: "Dashboard"
    entry_points:
      - "/login"
      - "/signup"
    exit_points:
      - "/settings"
      - "/reports"
      - "/users"
      - "/logout"
    metadata:
      protected: true
      layout: "main"
      breadcrumb: "Home"

  - path: "/settings"
    component: "Settings"
    title: "Settings"
    entry_points:
      - "/dashboard"
    exit_points:
      - "/dashboard"
      - "/settings/profile"
      - "/settings/security"
    metadata:
      protected: true
      layout: "main"
    children:
      - path: "profile"
        component: "ProfileSettings"
        title: "Profile Settings"
      - path: "security"
        component: "SecuritySettings"
        title: "Security Settings"

  - path: "/users/:id"
    component: "UserProfile"
    title: "User Profile"
    params:
      id:
        type: "string"
    entry_points:
      - "/dashboard"
      - "/users"
    exit_points:
      - "/users/:id/edit"
      - "/dashboard"
    metadata:
      protected: true

  # Error routes
  - path: "/404"
    component: "NotFound"
    title: "Page Not Found"
    entry_points:
      - "*"           # Any invalid path
    exit_points:
      - "/"
      - "/dashboard"
    metadata:
      protected: false
      seo:
        noindex: true
```

## Validation Rules

When validating a route registry:

### Required Checks

1. **Root exists**: Registry must have a root path defined
2. **No duplicate paths**: Each path must be unique
3. **Valid path format**: Paths must start with "/" and be valid URL patterns
4. **Component defined**: Every route needs a component
5. **Entry points exist**: Referenced entry points must exist as routes
6. **Exit points exist**: Referenced exit points must exist as routes

### Warning Checks

1. **Orphan detection**: Routes with no entry points (except root)
2. **Dead-end detection**: Routes with no exit points
3. **Deep nesting**: Routes nested more than 4 levels
4. **Missing titles**: Routes without title metadata

## Framework Variations

Different frameworks have slightly different conventions:

### React Router Style

```yaml
routes:
  - path: "/"
    element: "Root"      # Uses "element" instead of "component"
    children:
      - index: true      # Index route flag
        element: "Home"
```

### Vue Router Style

```yaml
routes:
  - path: "/"
    name: "home"         # Named routes
    component: "Home"
    meta:                # Uses "meta" instead of "metadata"
      requiresAuth: false
```

### Next.js App Router Style

```yaml
routes:
  - path: "/"
    page: "page.tsx"     # File-based routing
    layout: "layout.tsx"
    loading: "loading.tsx"
    error: "error.tsx"
```

See `framework-detection.md` for framework-specific detection and conversion patterns.
