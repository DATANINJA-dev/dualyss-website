---
name: user-journey-validation
description: |
  Provides patterns for user journey validation, route registry definition,
  and navigation graph analysis. Auto-activates when implementing navigation
  flows, designing route structures, or validating page connectivity.

  Type: passive (reference patterns for journey validation)
---

# User Journey Validation Skill

This skill provides frameworks for validating user journeys and page connectivity in web applications. Used by UX agents, navigation designers, and orphan page detection workflows.

## When This Skill Activates

- Implementing navigation flows or route structures
- Designing route registries for frontend frameworks
- Detecting orphan pages or broken navigation paths
- Validating bidirectional navigation (can users return?)
- User mentions "page", "route", "navigation", "journey", "orphan"
- Analyzing page connectivity and reachability

## Core Principles

### 1. Complete Reachability

Every page in the application must be reachable from the root:

```
Root (/)
    └── Dashboard (/dashboard)
            ├── Settings (/settings)  ✓ Reachable
            └── Reports (/reports)    ✓ Reachable

/admin-hidden  ✗ Unreachable (orphan page)
```

### 2. Bidirectional Navigation

Users should always be able to return from any page. Dead-ends create poor UX:

```
Good: /dashboard → /settings → /dashboard (back button, breadcrumb)
Bad:  /dashboard → /onboarding → ??? (no way back)
```

### 3. Progressive Disclosure

Navigation depth should match information architecture. Deep nesting indicates poor structure:

```
Recommended: Max 3-4 levels deep
Warning: 5+ levels indicates restructuring needed
```

### 4. Error Recovery Paths

Broken links and 404s should provide clear recovery:

```
404 Page should include:
- Link to home/dashboard
- Search functionality
- Breadcrumb to last known location
- Contact/help link
```

### 5. Accessibility-First Navigation

All navigation must support keyboard and assistive technologies:

```
Required:
- Skip navigation links
- Keyboard-accessible menus (Tab, Enter, Escape)
- Focus management on route changes
- ARIA labels for navigation elements
```

### 6. SEO Connectivity

Internal linking structure directly impacts search visibility:

```
Orphan pages = Poor SEO
- No internal links pointing to page
- Not in sitemap
- Search engines may not discover
```

## Quick Reference

| Pattern | File | Use Case |
|---------|------|----------|
| Route Registry Schema | `route-registry-patterns.md` | Define route structures with entry/exit points |
| Common Patterns | `common-patterns.md` | Suggest entry/exit points for common page types |
| Orphan Detection | `graph-algorithms.md` | DFS-based reachability analysis |
| Framework Patterns | `framework-detection.md` | React Router, Vue Router, Next.js specifics |
| Code Templates | `code-templates.md` | Framework-specific navigation boilerplate generation |
| Visualization Templates | `visualization-templates.md` | ASCII tree and Mermaid diagram rendering |

## Supporting Files

- `route-registry-patterns.md` - YAML schema for route definitions with entry/exit points
- `common-patterns.md` - Navigation patterns library for auth, dashboard, wizard, CRUD flows
- `graph-algorithms.md` - DFS traversal, orphan detection, cycle detection pseudocode
- `framework-detection.md` - Framework-specific routing patterns (React Router, Vue Router, Next.js)
- `code-templates.md` - Framework-specific Link, breadcrumb, and navigation helper templates
- `visualization-templates.md` - ASCII tree and Mermaid graph templates for journey-validator output

## Integration Points

### Related Skills

| Skill | Integration Point |
|-------|-------------------|
| task-ux | Journey validation enriches UX flow analysis |
| set-up-design | Navigation patterns inform design consistency |
| config-merging-patterns | YAML parsing for route registry format |

### Consuming Agents

- `task-ux.md` - References journey validation during UX analysis
- `set-up-design.md` - Uses navigation patterns for design consistency checks

## Constraints

- **Frontend scope only** - Route registry covers client-side routing, not backend API routes
- **YAML format required** - Route definitions must be human-readable YAML
- **Language-agnostic algorithms** - Graph algorithms use pseudocode, not framework-specific code
- **Max traversal depth** - Graph algorithms should handle up to 1000 routes efficiently
- **Framework detection heuristics** - Detection patterns may need updates as frameworks evolve

## Sources

This skill synthesizes patterns from authoritative navigation and UX resources:

1. **Nielsen Norman Group - Navigation Design**
   - URL: https://www.nngroup.com/articles/navigation-you-are-here/
   - Authority: UX research leaders (Jakob Nielsen)
   - Used for: Core navigation principles, breadcrumb patterns

2. **WCAG 2.1 - Navigation Guidelines**
   - URL: https://www.w3.org/WAI/WCAG21/Understanding/multiple-ways.html
   - Authority: W3C Web Accessibility Initiative
   - Used for: Accessibility requirements, keyboard navigation

3. **Google Search Central - Site Structure**
   - URL: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
   - Authority: Official Google documentation
   - Used for: SEO implications of orphan pages, internal linking

4. **React Router Documentation**
   - URL: https://reactrouter.com/en/main
   - Authority: Official framework documentation
   - Used for: React-specific routing patterns

5. **Vue Router Documentation**
   - URL: https://router.vuejs.org/
   - Authority: Official framework documentation
   - Used for: Vue-specific routing patterns
