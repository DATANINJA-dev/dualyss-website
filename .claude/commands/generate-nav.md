---
description: Generate navigation boilerplate from route-registry.yaml
allowed_tools:
  - Read
  - Write
  - Glob
  - Grep
  - AskUserQuestion
arguments:
  - name: output
    description: "Output mode: preview (dry-run) or write (create files)"
    required: false
    default: "preview"
---

# generate-nav

Generate framework-appropriate navigation code boilerplate from route-registry.yaml definitions.

## Parameter

$ARGUMENTS.output = Output mode (preview | write)

## Input Validation

1. **Check for route-registry.yaml**
   - Search for `route-registry.yaml` or `route-registry.yml` in project
   - If not found: Suggest creating one with `/journey-validate` or provide template

2. **Validate output mode**
   - Must be: `preview` or `write`
   - Default: `preview` (dry-run, no file writes)

## Instructions

### Phase 1: Detect Framework

1. **Read package.json** (or equivalent):
   ```
   Check dependencies for:
   - react-router-dom → React Router
   - next → Next.js
   - vue-router → Vue Router
   - @sveltejs/kit → SvelteKit
   ```

2. **If no framework detected**, use AskUserQuestion:
   ```
   No routing framework detected in package.json.

   Which framework are you using?
   [1] React Router
   [2] Next.js
   [3] Vue Router
   [4] SvelteKit
   [5] Other (manual templates)
   ```

3. **Store detected framework** for template selection.

### Phase 2: Parse Route Registry

4. **Read route-registry.yaml**:
   - Extract all route definitions
   - Build route hierarchy (parent/child relationships)
   - Extract entry_points and exit_points per route

5. **Validate structure**:
   ```yaml
   # Expected structure:
   routes:
     - path: /dashboard
       label: Dashboard
       entry_points: [/home, /sidebar]
       exit_points: [/settings, /profile]
       children:
         - path: /dashboard/stats
           label: Statistics
   ```

6. **Build navigation graph**:
   - Create adjacency list from entry/exit points
   - Calculate breadcrumb chains for nested routes
   - Identify root routes (no entry_points or entry from /)

### Phase 3: Generate Templates

7. **Load code templates** from:
   - `.claude/skills/user-journey-validation/code-templates.md`

8. **For each route with exit_points**, generate:

   **a. Link Components**:
   ```
   For each exit_point in route.exit_points:
     Generate Link component using framework template
     Substitute: {{path}}, {{label}}, {{current_path}}
   ```

   **b. Breadcrumb Data**:
   ```
   For routes with depth > 1:
     Calculate ancestor chain
     Generate breadcrumb items array
   ```

   **c. Navigation Helpers** (if multiple routes):
   ```
   Generate useNavigation hook or equivalent
   Include: goTo, goBack, isActive, currentPath
   ```

### Phase 4: Output Generation

9. **If output mode = preview**:
   ```
   ## Navigation Boilerplate Preview

   ### Framework: [detected framework]
   ### Routes Processed: [count]

   ---

   ### Link Components

   #### From: /dashboard
   ```[framework]
   [generated link code for each exit_point]
   ```

   #### From: /settings
   ```[framework]
   [generated link code]
   ```

   ---

   ### Breadcrumbs

   #### Route: /dashboard/stats
   ```[framework]
   [breadcrumb component with items]
   ```

   ---

   ### Navigation Helper

   ```[framework]
   [useNavigation hook or equivalent]
   ```

   ---

   Write to files? [Y/n]
   ```

10. **If output mode = write** (or user confirms):

    **a. Ask for output location**:
    ```
    Where should navigation components be created?

    [1] src/components/navigation/ (Recommended)
    [2] src/navigation/
    [3] components/navigation/
    [4] Custom path...
    ```

    **b. Create files**:
    | File | Contents |
    |------|----------|
    | `NavLinks.tsx` | All Link components organized by source route |
    | `Breadcrumbs.tsx` | Reusable breadcrumb component |
    | `useNavigation.ts` | Navigation helper hook |
    | `navigation-data.ts` | Generated route data from registry |

    **c. Report creation**:
    ```
    ## Files Created

    | File | Lines | Purpose |
    |------|-------|---------|
    | src/components/navigation/NavLinks.tsx | [N] | Link components |
    | src/components/navigation/Breadcrumbs.tsx | [N] | Breadcrumb component |
    | src/components/navigation/useNavigation.ts | [N] | Navigation helper |
    | src/components/navigation/navigation-data.ts | [N] | Route data |

    Total: [N] files, [N] lines of code
    ```

### Phase 5: TypeScript Support (Optional)

11. **Check for TypeScript**:
    - Look for `tsconfig.json` in project root
    - If found: Generate `.tsx` and `.ts` files with types
    - If not: Generate `.jsx` and `.js` files

12. **Generate types** (if TypeScript):
    ```typescript
    // navigation-types.ts
    export interface RouteDefinition { ... }
    export interface BreadcrumbItem { ... }
    export interface NavigationContext { ... }
    ```

## Output Formats

### Preview Mode (Default)

Shows generated code without writing files:
- Full code preview with syntax highlighting
- Route-by-route breakdown
- Option to proceed with file creation

### Write Mode

Creates files in specified directory:
- Framework-appropriate file extensions
- Organized component structure
- Import statements included

## Error Handling

| Situation | Error |
|-----------|-------|
| No route-registry.yaml | [ERROR] E001: No route-registry.yaml found. Create one first. |
| Invalid YAML | [ERROR] E002: Invalid YAML in route-registry.yaml. Check syntax. |
| Unknown framework | [WARNING] Unknown framework. Using generic templates. |
| No exit_points | [INFO] Route [path] has no exit_points. No links generated. |
| Empty routes | [ERROR] E003: No routes defined in route-registry.yaml. |

## Examples

### Basic Usage (Preview)

```
/generate-nav
```

Shows preview of navigation code without creating files.

### Write Mode

```
/generate-nav write
```

Creates navigation component files in specified directory.

## CRITICAL RULES

- **ALWAYS** detect framework before generating code
- **ALWAYS** preview by default (safe dry-run)
- **NEVER** overwrite existing files without confirmation
- **ALWAYS** use templates from code-templates.md
- **PREFER** TypeScript when tsconfig.json exists
- **GENERATE** only for routes with exit_points defined
