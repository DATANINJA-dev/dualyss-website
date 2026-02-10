---
name: version-compatibility-management
description: |
  Provides semantic versioning patterns for framework version management.
  Auto-activates when checking compatibility, validating versions, or
  detecting breaking changes.

  Type: active (provides validation patterns for Core Sync Engine)
---

# Version Compatibility Management Skill

This skill provides foundational patterns for semantic versioning, compatibility validation, and breaking change detection. Used by sync commands, version checkers, and upgrade workflows.

## When This Skill Activates

- Implementing version checking or validation
- Detecting breaking changes between versions
- Managing compatibility matrices
- Parsing or comparing semantic versions
- User mentions "version", "semver", "compatibility", "breaking change"
- Working on EPIC-009 Core Sync Engine tasks
- Extracting version metadata from CLAUDE.md

## Core Principles

### 1. Semantic Versioning 2.0.0

Follow the official SemVer specification precisely:

```
MAJOR.MINOR.PATCH[-prerelease][+build]

MAJOR: Incompatible API changes (breaking)
MINOR: Backwards-compatible new functionality
PATCH: Backwards-compatible bug fixes
```

### 2. Conservative Compatibility

When in doubt, assume incompatibility. Better to warn about a safe update than allow a breaking one:

```
Rule: If compatibility cannot be determined → block
Exception: User explicit override
```

### 3. Version Comparison is Numeric, Not Lexicographic

Correct ordering requires numeric comparison of each segment:

```
Correct:  1.10.0 > 1.9.0 > 1.2.0
Wrong:    1.9.0 > 1.10.0 (string sort)
```

### 4. Pre-release Has Lower Precedence

Pre-release versions always sort BEFORE their release counterpart:

```
1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-beta < 1.0.0-rc.1 < 1.0.0
```

### 5. Build Metadata Does Not Affect Precedence

Build metadata is ignored for version comparison:

```
1.0.0+build.123 == 1.0.0+build.456 (for comparison)
```

## Quick Reference

| Operation | Pattern | Example |
|-----------|---------|---------|
| Parse version | `MAJOR.MINOR.PATCH` regex | `0.28.0` |
| Compare versions | Numeric per segment | `1.10.0 > 1.9.0` |
| Check constraint | Evaluate range expression | `^1.2.3` → `>=1.2.3 <2.0.0` |
| Detect breaking | MAJOR bump or explicit flag | `0.x` → `1.x` |
| Extract metadata | HTML comment regex | `<!-- simon_tools_meta\nversion: 0.28.0` |

## Real-World Examples

These case studies demonstrate version compatibility patterns using actual breaking changes from popular packages. Each shows the constraint changes, migration steps, and common pitfalls users encountered.

### Example 1: React 16 → 17 (Event System Rewrite)

**What changed**: React 17 changed event delegation from `document` to the root DOM container. While marketed as having "no new features," this was a fundamental architectural change affecting event handling, useEffect cleanup timing, and JSX transform.

**Version transition**: `16.14.0` → `17.0.0`

**Constraint before**:
```json
{
  "dependencies": {
    "react": "^16.8.0",
    "react-dom": "^16.8.0"
  }
}
```

**Constraint after**:
```json
{
  "dependencies": {
    "react": "^17.0.0",
    "react-dom": "^17.0.0"
  }
}
```

**Migration steps**:
1. Update packages: `npm install react@17.0.0 react-dom@17.0.0`
2. Replace `enzyme-adapter-react-16` with `@wojtekmaj/enzyme-adapter-react-17`
3. Upgrade Jest to 26.5.0+ (for focusin/focusout event changes)
4. Update Storybook to 6.1+ if using
5. Test event handlers, especially `onFocus`/`onBlur`

**Common pitfalls**:
- Focus/blur tests failing (React switched to native focusin/focusout)
- Peer dependency warnings from libraries still declaring `^16.0.0`
- useEffect cleanup now runs asynchronously (can break cleanup logic)

**Source**: [React v17.0 Official Blog](https://legacy.reactjs.org/blog/2020/10/20/react-v17.html)

---

### Example 2: Node.js 16 → 18 LTS (Platform & Security)

**What changed**: Node.js 18 upgraded V8 to 10.1, changed TLS requirements (secure renegotiation mandatory), deprecated the `--loader` flag, and enabled global `fetch` by default. The v8.serialize data format is incompatible with earlier versions.

**Version transition**: `16.20.0` → `18.0.0`

**Constraint before**:
```json
{
  "engines": {
    "node": ">=16.13.0"
  }
}
```

**Constraint after**:
```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Transitional constraint** (for gradual migration):
```json
{
  "engines": {
    "node": "^16.13.0 || >=18.0.0"
  }
}
```

**Migration steps**:
1. Update engines field in package.json
2. Test TLS connections (servers must support RFC 5746)
3. Replace `--loader` with `--import` for custom loaders
4. Update CI/CD pipeline Node.js version
5. Run `npm audit` to check for Node 18 compatibility

**Common pitfalls**:
- TLS failures to legacy servers without secure renegotiation
- `v8.serialize` data incompatible with Node 16 (breaks caching)
- ESM loader syntax changed (affects tsx, ts-node)

**Source**: [Node.js 18 Release Announcement](https://nodejs.org/en/blog/announcements/v18-release-announce)

---

### Example 3: Express 4 → 5 (API Modernization)

**What changed**: Express 5 removed deprecated methods (`app.del()`, `req.param()`), changed route syntax (wildcards require names), made async error handling automatic, and requires Node.js 18+.

**Version transition**: `4.21.0` → `5.0.0`

**Constraint before**:
```json
{
  "dependencies": {
    "express": "^4.18.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
```

**Constraint after**:
```json
{
  "dependencies": {
    "express": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Migration steps**:
1. Upgrade Node.js to 18+
2. Run codemods: `npx @expressjs/codemod upgrade`
3. Replace `app.del()` with `app.delete()`
4. Change `res.send(body, status)` to `res.status(status).send(body)`
5. Update wildcards: `app.get("*", ...)` → `app.get("/*splat", ...)`
6. Remove `req.param()` calls, use `req.params`, `req.body`, or `req.query`

**Common pitfalls**:
- `dotfiles: "ignore"` now default (breaks `.well-known` directory serving)
- Catch-all routes fail without named wildcard
- `req.param()` removal affects legacy code silently

**Source**: [Express.js Migration Guide](https://expressjs.com/en/guide/migrating-5.html)

---

### Pattern Summary

| Aspect | React 16→17 | Node 16→18 | Express 4→5 |
|--------|-------------|------------|-------------|
| Change Type | Internal rewrite | Platform/security | API cleanup |
| Constraint Syntax | `^17.0.0` | `>=18.0.0` | `^5.0.0` |
| Migration Tool | Codemods partial | npm audit | @expressjs/codemod |
| Hidden Breakage | Event timing | TLS/serialize | dotfiles default |
| Deprecation Path | None (drop-in) | Overlapping LTS | Codemod + manual |

## Supporting Files

- `semver-patterns.md` - Version parsing, comparison, and increment patterns
- `compatibility-matrix.md` - Matrix structure, constraint syntax, breaking change detection

## Integration Points

### EPIC-009 Tasks Using This Skill

| Task | Usage |
|------|-------|
| TASK-076 | Version compatibility checker uses all patterns |
| TASK-077 | Sync watermark uses version extraction |

### Related Skills

- `git-sync-patterns` (TASK-072) - Uses version checks before sync operations

## Constraints

- **SemVer 2.0.0 only**: Do not support legacy or non-standard versioning
- **No automatic upgrades across MAJOR**: User must explicitly approve
- **Pre-release versions**: Never consider stable for production
- **Comparison precision**: All three segments (MAJOR.MINOR.PATCH) required
- **Metadata format**: CLAUDE.md uses HTML comment format, not YAML frontmatter

## Sources

This skill synthesizes patterns from authoritative versioning documentation:

1. **Semantic Versioning 2.0.0 Official Specification**
   - URL: https://semver.org/
   - Authority: Canonical specification (Tom Preston-Werner)
   - Used for: Core versioning rules, precedence, grammar

2. **npm About Semantic Versioning**
   - URL: https://docs.npmjs.com/about-semantic-versioning/
   - Authority: npm (largest package ecosystem using semver)
   - Used for: Constraint syntax (^, ~, ranges), practical patterns

3. **W3C Clever Semantic Versioning (2024)**
   - URL: https://www.w3.org/submissions/2024/SUBM-semantic-versioning-20241127/
   - Authority: W3C Member Submission
   - Used for: Extended use cases, enterprise patterns
