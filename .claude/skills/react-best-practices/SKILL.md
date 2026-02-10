---
name: react-best-practices
description: |
  Comprehensive React optimization patterns from Vercel Labs covering performance,
  bundle size, rendering, SSR, and advanced patterns. Auto-activates for React,
  Next.js, Remix, and Gatsby projects.
---

# React Best Practices Skill

This skill provides comprehensive React optimization patterns ported from the Vercel Labs agent-skills repository. It covers 8 major categories with approximately 48 rules for building performant React applications.

## Type

passive

## Auto-Activation Triggers

### Keywords

- "react", "React", "ReactJS"
- "next.js", "Next.js", "nextjs", "NextJS"
- "remix", "Remix"
- "gatsby", "Gatsby"
- "useMemo", "useCallback", "memo"
- "re-render", "rerender", "render optimization"
- "React Server Components", "RSC"
- "Suspense", "lazy loading"
- "bundle size", "code splitting"
- "waterfall", "data fetching"

### File Patterns

- `**/*.jsx`
- `**/*.tsx`
- `**/components/**/*`
- `**/pages/**/*`
- `**/app/**/*`
- `next.config.*`
- `remix.config.*`
- `gatsby-config.*`

### Task Contexts

- Implementing React components
- Optimizing React performance
- Fixing re-render issues
- Reducing bundle size
- Implementing data fetching patterns
- Server-side rendering optimization
- Client-side state management

## Description

Provides React-specific performance and architectural patterns from Vercel Labs. This skill complements existing skills (performance-patterns, security-patterns) with React-specific guidance.

Use when:
- Building or optimizing React components
- Implementing data fetching in React/Next.js
- Fixing performance issues in React apps
- Reducing bundle size in React projects
- Optimizing server-side rendering
- Managing client-side state efficiently

## Supporting Files

| File | Status | Description |
|------|--------|-------------|
| rules/eliminating-waterfalls.md | Active | Data fetching patterns to avoid request waterfalls |
| rules/bundle-size.md | Active | Code splitting, tree shaking, and import optimization |
| rules/server-side-performance.md | Active | SSR, streaming, and server component patterns |
| rules/client-side-data-fetching.md | Active | SWR, React Query, and caching patterns |
| rules/re-render-optimization.md | Active | useMemo, useCallback, memo patterns |
| rules/rendering-performance.md | Active | Virtual DOM optimization techniques |
| rules/javascript-performance.md | Active | Event handlers, debouncing, throttling |
| rules/advanced-patterns.md | Active | Composition, custom hooks, state management |

## Quick Reference

### Rule Categories

| Category | Prefix | Focus | Impact Range |
|----------|--------|-------|--------------|
| Eliminating Waterfalls | async- | Data fetching parallelization | CRITICAL-HIGH |
| Bundle Size | bundle- | Code splitting, imports | HIGH-MEDIUM |
| Server-Side Performance | server- | SSR, streaming, caching | HIGH-MEDIUM |
| Client-Side Data Fetching | client- | SWR, React Query | HIGH-MEDIUM |
| Re-render Optimization | rerender- | Memoization patterns | HIGH-MEDIUM |
| Rendering Performance | rendering- | Virtual DOM optimization | MEDIUM-HIGH |
| JavaScript Performance | js- | Event handlers, timing | MEDIUM |
| Advanced Patterns | advanced- | Architecture, hooks | MEDIUM |

### Impact Levels

| Level | Description | Action Priority |
|-------|-------------|-----------------|
| CRITICAL | Causes severe performance issues | Fix immediately |
| HIGH | Significant performance impact | Fix in current sprint |
| MEDIUM | Moderate impact | Fix when convenient |
| LOW | Minor optimization | Nice to have |

### Quick Checklist

**Before Creating Components**:
- [ ] Plan data fetching to avoid waterfalls
- [ ] Consider which parts need client-side interactivity
- [ ] Identify expensive computations for memoization

**During Development**:
- [ ] Use React.memo() for expensive pure components
- [ ] Apply useMemo/useCallback for expensive operations
- [ ] Implement proper loading states with Suspense
- [ ] Use dynamic imports for code splitting

**Performance Review**:
- [ ] Check for unnecessary re-renders (React DevTools)
- [ ] Analyze bundle size (webpack-bundle-analyzer)
- [ ] Verify no request waterfalls (Network tab)
- [ ] Test Core Web Vitals (Lighthouse)

## Integration Points

This skill is consumed by:
- `task-code-impact.md` agent for React code analysis
- `task-performance.md` agent for performance tasks
- `stack-skill-recommender.md` for React project recommendations
- `/refine` command when analyzing React tasks
- `/develop-task` command during React implementation

## Usage with Commands

### During /refine

When refining a React task, this skill auto-activates and provides:
- Relevant patterns for the specific task
- Performance considerations
- Common pitfalls to avoid

### During /develop-task

Reference specific rules during implementation:
- Check rule files before implementing patterns
- Use code examples as templates
- Verify implementation against "Correct" examples

## Research Sources

- **Primary Source**: [Vercel Labs agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)
- **React Documentation**: [react.dev](https://react.dev)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Patterns.dev**: [patterns.dev/react](https://www.patterns.dev/react)

**Last Synced**: 2026-01-22
**Source Version**: Vercel Labs agent-skills (January 2026)

## Related Skills

| Skill | Relationship |
|-------|--------------|
| performance-patterns | Complements - general performance vs React-specific |
| security-patterns | Complements - includes React XSS prevention |
| ux-standards | Complements - accessibility patterns |
| tdd-workflow | Complements - React testing patterns |
