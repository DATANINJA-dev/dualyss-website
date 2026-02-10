---
name: cicd-seo-integration
description: |
  Provides CI/CD integration patterns for automated SEO validation in development pipelines.
  Auto-activates when tasks involve GitHub Actions SEO workflows, pre-commit SEO hooks,
  deployment gates for SEO validation, or Lighthouse CI integration.
---

# CI/CD SEO Integration Skill

This skill provides comprehensive patterns for integrating SEO validation into CI/CD pipelines. Research shows automated SEO validation can reduce deployment-related ranking drops by 72%, making shift-left SEO validation essential for modern web development.

## When This Skill Activates

- Tasks involving GitHub Actions for SEO checks
- Pre-commit hook design for SEO validation
- Deployment gate configuration for SEO blocking
- Lighthouse CI integration and performance budgets
- Automated SEO validation pipelines
- CI/CD workflow optimization for SEO

### Activation Keywords

| Keyword Pattern | Confidence |
|-----------------|------------|
| CI/CD SEO, SEO pipeline, SEO workflow | High |
| pre-commit SEO, SEO validation hook | High |
| deployment gate, SEO gate, blocking validation | High |
| Lighthouse CI, performance budget, SEO budget | High |
| GitHub Actions SEO, SEO workflow action | Medium |
| automated SEO, SEO automation, shift-left SEO | Medium |

## Core Principles

### 1. Shift-Left Philosophy

Catch SEO issues before deployment, not in production. Every commit should validate SEO fundamentals:

```
Development → Pre-commit → CI Build → Deploy Gate → Production
      ↓            ↓           ↓           ↓
   [Local]    [Fast <5s]   [Thorough]  [Blocking]
```

### 2. Performance Budget: <5 Second Pre-Commit

Pre-commit hooks must execute in under 5 seconds (industry standard). Structure validation into tiers:

| Tier | Execution Time | Checks |
|------|---------------|--------|
| Fast Path | <1s | Syntax (robots.txt, sitemap.xml format) |
| Medium Path | 1-3s | Hreflang validation, structured data lint |
| Conditional Path | Skip locally | Lighthouse audit (CI only) |

### 3. Staged Files Only

Never scan the entire repository in pre-commit:
- Filter by file type: `.html`, `.tsx`, `.jsx`, `.vue`
- Check only staged files (`git diff --cached`)
- Skip unchanged files even if they have SEO issues

### 4. Blocking vs Warning

| Severity | CI Behavior | Examples |
|----------|-------------|----------|
| **Critical (Red)** | Block deployment | robots.txt disallows all, missing canonical |
| **Warning (Yellow)** | Allow with notification | Missing Open Graph, suboptimal title length |
| **Info (Green)** | Log only | Optimization suggestions |

### 5. Exit Code Alignment

Use standardized error codes from the error-handling skill:

| Exit Code | Meaning | SEO Context |
|-----------|---------|-------------|
| 0 | Success | All SEO checks passed |
| 1 | User error | SEO validation failure (E500-E509) |
| 2 | System error | External service failure (E550-E559) |

## Quick Reference

| Pattern | When to Use | Benefit |
|---------|-------------|---------|
| Pre-commit hooks | Every commit | Immediate feedback, <5s |
| GitHub Actions SEO job | Pull requests | Comprehensive validation |
| Lighthouse CI | Staging deploys | Performance regression detection |
| Deployment gates | Production | Prevent ranking drops |
| Scheduled audits | Daily/weekly | Trend analysis |

## Supporting Files

| File | Purpose |
|------|---------|
| `github-actions-patterns.md` | Workflow templates for SEO validation jobs |
| `pre-commit-design.md` | Hook architecture for <5s execution |
| `deployment-gates.md` | Blocking criteria and gate configuration |
| `lighthouse-ci.md` | Performance budget and assertion patterns |

## Usage

This skill is automatically activated when CI/CD SEO tasks are detected. Reference the supporting files for:

- **Workflow Setup**: Use github-actions-patterns.md for GitHub Actions configuration
- **Local Validation**: Use pre-commit-design.md for hook implementation
- **Production Safety**: Use deployment-gates.md for blocking criteria
- **Performance Monitoring**: Use lighthouse-ci.md for budget configuration

## Integration with Other Skills

| Skill | Integration Point |
|-------|-------------------|
| `tdd-workflow` | SEO test patterns (reference seo-patterns.md) |
| `error-handling` | Exit codes E500-E559 for SEO errors |
| `geo-optimization-patterns` | GEO-specific validation in CI |
| `multi-language-seo-patterns` | Hreflang validation patterns |

## Constraints

- **Performance**: Pre-commit hooks must complete in <5 seconds
- **Scope**: Patterns only - not implementation code
- **Staged files**: Never scan full repository in pre-commit
- **Tool compatibility**: Assumes GitHub Actions, pre-commit framework 3.0+
- **Lighthouse version**: Patterns target Lighthouse CI v0.14+
- **Exit codes**: Must align with error-handling skill E5XX range

## Research Sources

| Source | Authority | Used For |
|--------|-----------|----------|
| [GitHub Actions Documentation](https://docs.github.com/en/actions) | Official (GitHub) | Workflow syntax, job patterns, caching |
| [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci) | Official (Google) | Assertion patterns, budget configuration |
| [Pre-commit Framework](https://pre-commit.com/) | Official | Hook configuration, staged file patterns |
| [web.dev SEO](https://web.dev/learn/seo) | Official (Google) | SEO best practices, Core Web Vitals |
| [Ahrefs CI/CD SEO Guide](https://ahrefs.com/blog/seo-ci-cd/) | Industry (2025) | Shift-left SEO, automation patterns |
