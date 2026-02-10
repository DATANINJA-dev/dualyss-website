---
name: performance-patterns
description: |
  Provides performance optimization patterns including Core Web Vitals (LCP, INP, CLS),
  database anti-patterns, caching strategies, and monitoring best practices. Auto-activates
  for performance, optimization, scalability, and Core Web Vitals keywords.
---

# Performance Patterns Skill

This skill provides comprehensive patterns for ensuring application performance and scalability. It covers Core Web Vitals 2026 standards (LCP, INP, CLS), common performance anti-patterns, caching strategies, and monitoring approaches.

## When This Skill Activates

- Tasks involving performance optimization or analysis
- Database query optimization or N+1 pattern fixes
- Caching implementation (Redis, CDN, memory)
- Core Web Vitals improvements
- Load testing or performance monitoring setup
- Scalability assessment or horizontal scaling

### Activation Keywords

| Keyword Pattern | Confidence |
|-----------------|------------|
| performance, optimization, scalability | High |
| Core Web Vitals, LCP, INP, CLS | High |
| caching, Redis, CDN, TTL | High |
| N+1 query, database optimization, index | High |
| load testing, performance budget | Medium |
| latency, throughput, response time | Medium |
| bundle size, lazy loading, code splitting | Medium |

### Activation File Patterns

| Pattern | Trigger |
|---------|---------|
| `**/api/**/*.{ts,js,py,go}` | API endpoint files |
| `**/db/**/*`, `**/models/**/*` | Database/model files |
| `**/cache/**/*`, `**/redis/**/*` | Caching implementations |
| `webpack.config.*`, `vite.config.*` | Build configuration |
| `lighthouse*.json`, `*.performance.json` | Performance reports |

## Core Principles

### The Performance Triangle

Application performance rests on three pillars:

1. **Speed**: How fast does the application respond? (LCP, INP)
2. **Stability**: Does the UI remain stable during load? (CLS)
3. **Efficiency**: Are resources used optimally? (caching, queries)

### Core Web Vitals 2026

**Important**: INP (Interaction to Next Paint) replaced FID (First Input Delay) in March 2024.

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |

### Quick Reference

**Database Performance**:
- Avoid N+1 queries - use batch loading
- Add indexes for WHERE clause columns
- Use LIMIT for unbounded queries
- Specify columns instead of SELECT *

**Caching Strategy**:
- Memory cache: 1-5 min TTL (computed values)
- Redis: 5-60 min TTL (API responses, sessions)
- CDN: 24h+ TTL (static assets)
- Always plan cache invalidation

**Frontend Performance**:
- Defer non-critical JavaScript
- Optimize images (WebP, lazy loading)
- Reserve space for dynamic content (prevent CLS)
- Break up long tasks (improve INP)

## Supporting Files

| File | Purpose |
|------|---------|
| [core-web-vitals.md](./core-web-vitals.md) | LCP, INP, CLS thresholds and optimization strategies |
| [anti-patterns.md](./anti-patterns.md) | Common performance anti-patterns (N+1, indexes, etc.) |
| [caching-strategies.md](./caching-strategies.md) | Cache layers, TTL, invalidation patterns |
| [monitoring.md](./monitoring.md) | RUM, Lighthouse, performance budgets, load testing |

## Usage

This skill is automatically activated when performance-related tasks are detected. Reference the supporting files for:

- **Core Web Vitals**: Use `core-web-vitals.md` for frontend performance optimization
- **Backend Performance**: Use `anti-patterns.md` for database and API optimization
- **Caching**: Use `caching-strategies.md` for cache implementation guidance
- **Monitoring**: Use `monitoring.md` for observability and load testing

## Quick Checklist

### Minimum Viable Performance

- [ ] Database queries use indexes for filtered columns
- [ ] No N+1 queries (use batch/eager loading)
- [ ] Unbounded queries have LIMIT clause
- [ ] API responses cached where appropriate
- [ ] Static assets served via CDN
- [ ] Images optimized (WebP, proper sizing, lazy load)
- [ ] JavaScript deferred or async loaded
- [ ] Space reserved for dynamic content (prevent CLS)
- [ ] Long tasks broken up (< 50ms for good INP)
- [ ] Performance budget defined and monitored

### Quick Performance Audit

```
Core Web Vitals:  [ ] LCP < 2.5s  [ ] INP < 200ms  [ ] CLS < 0.1
Database:         [ ] No N+1     [ ] Indexed      [ ] Bounded
Caching:          [ ] Strategy   [ ] TTL defined  [ ] Invalidation plan
Frontend:         [ ] Deferred JS [ ] Optimized images [ ] Stable layout
Monitoring:       [ ] RUM setup  [ ] Budgets      [ ] Alerting
```

## Performance Testing Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| Lighthouse | Core Web Vitals audit | During development, CI/CD |
| WebPageTest | Detailed waterfall analysis | Performance debugging |
| k6 | Load testing | Before release |
| web-vitals (npm) | Real user monitoring | Production |
| Chrome DevTools | Profiling, network analysis | Development |
| Database EXPLAIN | Query analysis | Backend optimization |

## Constraints

- Performance optimization should not compromise security
- Caching requires careful invalidation planning
- Premature optimization is the root of all evil - measure first
- Core Web Vitals are measured on real user devices (75th percentile)
- INP measures ALL interactions, not just first input (unlike deprecated FID)
- Performance budgets should be realistic and actionable

## Research Sources

- [web.dev Core Web Vitals](https://web.dev/articles/vitals)
- [web.dev INP Documentation](https://web.dev/articles/inp)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Web Performance in 2026](https://solidappmaker.com/web-performance-in-2026-best-practices-for-speed-security-core-web-vitals/)
- [2026 Web Performance Standards](https://www.inmotionhosting.com/blog/web-performance-benchmarks/)
