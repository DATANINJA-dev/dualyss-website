# Framework Detection Patterns

This document provides patterns for detecting and extracting routes from popular frontend routing frameworks.

## Framework Detection Heuristics

### Detection Strategy

```
function detectFramework(projectRoot):
    // Check package.json dependencies
    packageJson = readFile(projectRoot + "/package.json")

    if "react-router" in packageJson.dependencies:
        return "react-router"

    if "react-router-dom" in packageJson.dependencies:
        return "react-router"

    if "vue-router" in packageJson.dependencies:
        return "vue-router"

    if "next" in packageJson.dependencies:
        return "next-js"

    if "@sveltejs/kit" in packageJson.dependencies:
        return "sveltekit"

    // Check for framework-specific files
    if exists(projectRoot + "/next.config.js"):
        return "next-js"

    if exists(projectRoot + "/svelte.config.js"):
        return "sveltekit"

    if exists(projectRoot + "/nuxt.config.ts"):
        return "nuxt"

    return "unknown"
```

### Detection Confidence Scores

| Signal | Confidence |
|--------|------------|
| Exact package match | 95% |
| Config file exists | 90% |
| Directory structure matches | 80% |
| File patterns match | 70% |

## React Router (v6+)

### File Patterns

```
Common locations:
- src/router.tsx
- src/routes.tsx
- src/App.tsx (inline routes)
- src/routes/index.tsx
```

### Route Definition Patterns

**Pattern 1: createBrowserRouter (v6.4+)**

```tsx
// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);
```

**Pattern 2: Route Components (v6)**

```tsx
// src/App.tsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users/:id" element={<UserProfile />} />
  </Route>
</Routes>
```

**Pattern 3: Route Objects Array**

```tsx
// src/routes.ts
export const routes = [
  { path: "/", element: <Home /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/settings/*", element: <Settings /> },
];
```

### Route Extraction

```
function extractReactRouterRoutes(sourceCode):
    routes = []

    // Pattern: createBrowserRouter([...])
    match = regex.find(sourceCode, /createBrowserRouter\(\[([\s\S]*?)\]\)/)
    if match:
        routeObjects = parseJSArray(match[1])
        routes.extend(convertToRegistry(routeObjects))

    // Pattern: <Route path="..." element={...} />
    matches = regex.findAll(sourceCode, /<Route\s+path="([^"]+)"/)
    for match in matches:
        routes.append({ path: match[1] })

    // Pattern: { path: "...", element: ... }
    matches = regex.findAll(sourceCode, /\{\s*path:\s*["']([^"']+)["']/)
    for match in matches:
        routes.append({ path: match[1] })

    return routes
```

## Vue Router (v4+)

### File Patterns

```
Common locations:
- src/router/index.ts
- src/router.ts
- src/routes.ts
```

### Route Definition Patterns

**Pattern 1: createRouter**

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    children: [
      { path: 'profile', component: Profile },
      { path: 'security', component: Security },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

**Pattern 2: Lazy Loading**

```typescript
const routes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
]
```

### Route Extraction

```
function extractVueRouterRoutes(sourceCode):
    routes = []

    // Pattern: routes array
    match = regex.find(sourceCode, /const routes\s*=\s*\[([\s\S]*?)\]/)
    if match:
        routeObjects = parseJSArray(match[1])
        routes.extend(convertToRegistry(routeObjects))

    // Pattern: { path: '...', name: '...' }
    matches = regex.findAll(sourceCode, /\{\s*path:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"]/)
    for match in matches:
        routes.append({ path: match[1], name: match[2] })

    return routes
```

## Next.js (App Router - v13+)

### File Patterns

```
App Router structure (file-based):
app/
├── page.tsx           → /
├── layout.tsx         → Layout wrapper
├── dashboard/
│   ├── page.tsx       → /dashboard
│   └── settings/
│       └── page.tsx   → /dashboard/settings
├── users/
│   └── [id]/
│       └── page.tsx   → /users/:id
└── (auth)/
    ├── login/
    │   └── page.tsx   → /login
    └── signup/
        └── page.tsx   → /signup
```

### Route Detection

```
function extractNextJsRoutes(appDir):
    routes = []

    function scanDirectory(dir, basePath = ""):
        for entry in listDirectory(dir):
            if entry.isDirectory():
                // Handle route groups (parentheses)
                if entry.name.startsWith("("):
                    // Route group - doesn't add to path
                    scanDirectory(entry.path, basePath)

                // Handle dynamic segments [param]
                else if entry.name.startsWith("["):
                    param = entry.name.slice(1, -1)
                    newPath = basePath + "/:" + param
                    scanDirectory(entry.path, newPath)

                // Handle catch-all [...param]
                else if entry.name.startsWith("[..."):
                    param = entry.name.slice(4, -1)
                    newPath = basePath + "/*"
                    scanDirectory(entry.path, newPath)

                else:
                    newPath = basePath + "/" + entry.name
                    scanDirectory(entry.path, newPath)

            else if entry.name == "page.tsx" or entry.name == "page.js":
                path = basePath or "/"
                routes.append({
                    path: path,
                    file: entry.path
                })

    scanDirectory(appDir)
    return routes
```

### Special Files

| File | Purpose |
|------|---------|
| `page.tsx` | Route component |
| `layout.tsx` | Shared layout |
| `loading.tsx` | Loading UI |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 page |

## SvelteKit (Optional)

### File Patterns

```
SvelteKit structure (file-based):
src/routes/
├── +page.svelte       → /
├── +layout.svelte     → Layout wrapper
├── dashboard/
│   └── +page.svelte   → /dashboard
├── users/
│   └── [id]/
│       └── +page.svelte → /users/:id
└── (auth)/
    └── login/
        └── +page.svelte → /login
```

### Route Detection

```
function extractSvelteKitRoutes(routesDir):
    routes = []

    function scanDirectory(dir, basePath = ""):
        for entry in listDirectory(dir):
            if entry.isDirectory():
                if entry.name.startsWith("("):
                    scanDirectory(entry.path, basePath)
                else if entry.name.startsWith("["):
                    param = entry.name.slice(1, -1)
                    newPath = basePath + "/:" + param
                    scanDirectory(entry.path, newPath)
                else:
                    newPath = basePath + "/" + entry.name
                    scanDirectory(entry.path, newPath)

            else if entry.name == "+page.svelte":
                path = basePath or "/"
                routes.append({ path: path, file: entry.path })

    scanDirectory(routesDir)
    return routes
```

## Converting to Route Registry

### Universal Conversion

```
function convertToRegistry(frameworkRoutes, framework):
    registry = {
        version: "1.0",
        root: "/",
        framework: framework,
        routes: []
    }

    for route in frameworkRoutes:
        registryRoute = {
            path: normalizePath(route.path),
            component: route.component or route.element or route.file,
            title: route.name or inferTitle(route.path),
            entry_points: [],  // To be inferred or manually defined
            exit_points: [],   // To be inferred or manually defined
            metadata: {}
        }

        // Copy framework-specific metadata
        if route.meta:
            registryRoute.metadata = route.meta

        // Handle children
        if route.children:
            registryRoute.children = convertToRegistry(route.children, framework).routes

        registry.routes.append(registryRoute)

    return registry
```

### Path Normalization

```
function normalizePath(path):
    // Ensure leading slash
    if not path.startsWith("/"):
        path = "/" + path

    // Convert framework-specific patterns to standard
    // React: :param → :param (no change)
    // Vue: :param → :param (no change)
    // Next: [param] → :param
    path = path.replace(/\[([^\]]+)\]/g, ":$1")

    // Remove trailing slash (except root)
    if path != "/" and path.endsWith("/"):
        path = path.slice(0, -1)

    return path
```

## Inferring Navigation Links

### Link Component Detection

```
function inferNavigationLinks(sourceFiles):
    links = []

    for file in sourceFiles:
        content = readFile(file)

        // React Router: <Link to="/path">
        matches = regex.findAll(content, /<Link\s+to=["']([^"']+)["']/)
        for match in matches:
            links.append({
                from: inferRouteFromFile(file),
                to: match[1]
            })

        // Vue Router: <router-link to="/path">
        matches = regex.findAll(content, /<router-link\s+to=["']([^"']+)["']/)
        for match in matches:
            links.append({
                from: inferRouteFromFile(file),
                to: match[1]
            })

        // Next.js: <Link href="/path">
        matches = regex.findAll(content, /<Link\s+href=["']([^"']+)["']/)
        for match in matches:
            links.append({
                from: inferRouteFromFile(file),
                to: match[1]
            })

        // Programmatic: navigate('/path'), router.push('/path')
        matches = regex.findAll(content, /(?:navigate|router\.push)\(['"]([^'"]+)['"]\)/)
        for match in matches:
            links.append({
                from: inferRouteFromFile(file),
                to: match[1]
            })

    return links
```

### Building Entry/Exit Points

```
function buildNavigationGraph(routes, links):
    for route in routes:
        route.entry_points = []
        route.exit_points = []

    for link in links:
        fromRoute = findRoute(routes, link.from)
        toRoute = findRoute(routes, link.to)

        if fromRoute and toRoute:
            fromRoute.exit_points.append(link.to)
            toRoute.entry_points.append(link.from)

    // Deduplicate
    for route in routes:
        route.entry_points = unique(route.entry_points)
        route.exit_points = unique(route.exit_points)

    return routes
```

## Framework Version Compatibility

| Framework | Minimum Version | Pattern Support |
|-----------|-----------------|-----------------|
| React Router | v6.0+ | createBrowserRouter, Route components |
| Vue Router | v4.0+ | createRouter, Composition API |
| Next.js | v13.0+ | App Router (file-based) |
| SvelteKit | v1.0+ | +page.svelte (file-based) |

**Note**: Older versions (React Router v5, Vue Router v3, Next.js Pages Router) have different patterns not covered here. These patterns reflect 2026 best practices.
