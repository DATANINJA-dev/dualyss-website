# Pre-Commit Hook Design for SEO Validation

Architecture and patterns for fast (<5 second) SEO validation in pre-commit hooks.

## Performance Budget

Pre-commit hooks must execute in under 5 seconds to maintain developer flow. Structure validation into tiers:

```
┌─────────────────────────────────────────────────────────┐
│                   Pre-Commit Budget: <5s                │
├─────────────────────────────────────────────────────────┤
│  Fast Path (<1s)                                        │
│  ├── robots.txt syntax check                            │
│  ├── sitemap.xml format validation                      │
│  └── Meta tag presence check (local parsing)            │
├─────────────────────────────────────────────────────────┤
│  Medium Path (1-3s)                                     │
│  ├── Hreflang bidirectional validation                  │
│  ├── JSON-LD syntax validation                          │
│  └── Canonical URL consistency                          │
├─────────────────────────────────────────────────────────┤
│  Conditional Path (SKIP locally)                        │
│  ├── Lighthouse audit → CI only                         │
│  ├── External schema validation → CI only               │
│  └── Performance metrics → CI only                      │
└─────────────────────────────────────────────────────────┘
```

## Core Principles

### 1. Staged Files Only

**Never scan the entire repository.** Only validate files that are staged for commit:

```bash
# Get staged files
git diff --cached --name-only --diff-filter=ACMR

# Filter by SEO-relevant extensions
git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(html|tsx|jsx|vue)$'
```

### 2. File Type Filtering

Only check files that can contain SEO content:

| Extension | SEO Content | Pre-commit Check |
|-----------|-------------|------------------|
| `.html` | Meta tags, JSON-LD | Yes |
| `.tsx`, `.jsx` | Head components | Yes |
| `.vue` | Template meta | Yes |
| `robots.txt` | Crawler rules | Yes |
| `sitemap.xml` | URL index | Yes |
| `.js`, `.css` | None | Skip |
| `.md`, `.json` | None (usually) | Skip |

### 3. Early Exit Strategy

Exit as soon as possible on success to minimize wait time:

```bash
#!/bin/bash
set -e

# Early exit if no SEO-relevant files
FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(html|tsx|jsx|vue)$' || true)
if [ -z "$FILES" ]; then
  echo "No SEO-relevant files staged. Skipping."
  exit 0
fi
```

## Configuration Examples

### .pre-commit-config.yaml

```yaml
# .pre-commit-config.yaml
repos:
  # Local SEO validation hooks
  - repo: local
    hooks:
      # Fast: robots.txt validation
      - id: robots-txt-check
        name: Validate robots.txt
        entry: bash -c 'if [ -f robots.txt ]; then grep -q "Disallow: /$" robots.txt && ! grep -q "Allow:" robots.txt && exit 1 || exit 0; fi'
        language: system
        files: ^robots\.txt$
        pass_filenames: false

      # Fast: sitemap.xml syntax
      - id: sitemap-check
        name: Validate sitemap.xml
        entry: xmllint --noout
        language: system
        files: ^sitemap.*\.xml$
        types: [xml]

      # Medium: SEO meta validation
      - id: seo-meta-check
        name: SEO meta validation
        entry: npm run seo:lint:staged
        language: system
        files: \.(html|tsx|jsx|vue)$
        pass_filenames: true
        stages: [commit]

      # Medium: JSON-LD validation
      - id: jsonld-check
        name: JSON-LD validation
        entry: npm run seo:validate-jsonld
        language: system
        files: \.(html|tsx|jsx)$
        pass_filenames: true
```

### Husky Configuration (Alternative)

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "robots.txt": "npm run seo:check-robots",
    "sitemap*.xml": "xmllint --noout",
    "*.{html,tsx,jsx,vue}": [
      "npm run seo:lint:file",
      "npm run seo:validate-meta"
    ]
  }
}
```

## Hook Implementation Patterns

### Pattern 1: Shell Script Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit or .husky/pre-commit

set -e
START_TIME=$(date +%s%N)

# Get staged SEO files
SEO_FILES=$(git diff --cached --name-only --diff-filter=ACMR | \
  grep -E '\.(html|tsx|jsx|vue)$|^robots\.txt$|^sitemap.*\.xml$' || true)

if [ -z "$SEO_FILES" ]; then
  echo "✓ No SEO files to validate"
  exit 0
fi

echo "Validating SEO for staged files..."

# Fast path: robots.txt
if echo "$SEO_FILES" | grep -q "robots.txt"; then
  echo "  Checking robots.txt..."
  if grep -q "Disallow: /$" robots.txt && ! grep -q "Allow:" robots.txt; then
    echo "  ✗ robots.txt blocks all crawlers (E506)"
    exit 1
  fi
  echo "  ✓ robots.txt OK"
fi

# Fast path: sitemap.xml
SITEMAP_FILES=$(echo "$SEO_FILES" | grep "sitemap.*\.xml" || true)
if [ -n "$SITEMAP_FILES" ]; then
  echo "  Checking sitemap.xml..."
  for file in $SITEMAP_FILES; do
    xmllint --noout "$file" || exit 1
  done
  echo "  ✓ sitemap.xml OK"
fi

# Medium path: HTML/JSX meta validation
HTML_FILES=$(echo "$SEO_FILES" | grep -E '\.(html|tsx|jsx|vue)$' || true)
if [ -n "$HTML_FILES" ]; then
  echo "  Validating meta tags..."
  echo "$HTML_FILES" | xargs npm run seo:lint:staged --
fi

# Calculate duration
END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $DURATION -gt 5000 ]; then
  echo "⚠️ Pre-commit took ${DURATION}ms (target: <5000ms)"
else
  echo "✓ SEO validation complete (${DURATION}ms)"
fi
```

### Pattern 2: Node.js Hook (Safe Implementation)

```javascript
// scripts/seo-precommit.mjs
import { execFileSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const start = Date.now();

// Get staged files using execFileSync (no shell injection risk)
const stagedOutput = execFileSync('git', [
  'diff', '--cached', '--name-only', '--diff-filter=ACMR'
], { encoding: 'utf-8' });

const stagedFiles = stagedOutput.trim().split('\n').filter(Boolean);

// Filter SEO-relevant files
const seoFiles = stagedFiles.filter(f =>
  /\.(html|tsx|jsx|vue)$/.test(f) ||
  /^robots\.txt$/.test(f) ||
  /^sitemap.*\.xml$/.test(f)
);

if (seoFiles.length === 0) {
  console.log('✓ No SEO files to validate');
  process.exit(0);
}

console.log(`Validating ${seoFiles.length} SEO files...`);

let hasErrors = false;

try {
  // Fast: Check robots.txt
  if (seoFiles.includes('robots.txt') && existsSync('robots.txt')) {
    const content = readFileSync('robots.txt', 'utf-8');
    if (content.includes('Disallow: /') && !content.includes('Allow:')) {
      console.error('✗ robots.txt blocks all crawlers (E506)');
      hasErrors = true;
    } else {
      console.log('✓ robots.txt OK');
    }
  }

  // Fast: Check sitemap (using execFileSync, no shell)
  const sitemaps = seoFiles.filter(f => /sitemap.*\.xml$/.test(f));
  for (const sitemap of sitemaps) {
    try {
      execFileSync('xmllint', ['--noout', sitemap], { stdio: 'pipe' });
      console.log(`✓ ${sitemap} OK`);
    } catch (e) {
      console.error(`✗ ${sitemap} invalid XML`);
      hasErrors = true;
    }
  }

  // Medium: Check HTML/JSX (pass files as arguments, not shell string)
  const htmlFiles = seoFiles.filter(f => /\.(html|tsx|jsx|vue)$/.test(f));
  if (htmlFiles.length > 0) {
    execFileSync('npm', ['run', 'seo:lint:staged', '--', ...htmlFiles], {
      stdio: 'inherit'
    });
  }
} catch (error) {
  hasErrors = true;
}

const duration = Date.now() - start;
console.log(`\nSEO validation ${hasErrors ? 'FAILED' : 'complete'} (${duration}ms)`);

if (duration > 5000) {
  console.warn('⚠️ Pre-commit exceeded 5s budget');
}

process.exit(hasErrors ? 1 : 0);
```

**Security Note**: Use `execFileSync` instead of `exec` to prevent command injection vulnerabilities. Pass arguments as arrays, never as concatenated strings.

## Exit Code Mapping

Pre-commit hooks must return appropriate exit codes:

| Exit Code | Meaning | Pre-commit Behavior |
|-----------|---------|---------------------|
| 0 | Success | Allow commit |
| 1 | SEO validation error | Block commit |
| 2 | System/tool error | Block commit |

### Mapping to E5XX Error Codes

| SEO Error | Exit Code | Error Code |
|-----------|-----------|------------|
| Missing meta description | 1 | E500 |
| Duplicate title | 1 | E501 |
| Invalid hreflang | 1 | E502 |
| Missing canonical | 1 | E503 |
| Invalid JSON-LD | 1 | E504 |
| Missing Open Graph | 1 | E505 |
| robots.txt blocks all | 1 | E506 |
| Missing sitemap ref | 1 | E507 |
| Tool unavailable | 2 | E550+ |

## Performance Optimization

### 1. Parallel Validation

Run independent checks in parallel:

```bash
# Using GNU parallel
echo "$SEO_FILES" | parallel --jobs 4 npm run seo:lint:file {}

# Using xargs
echo "$SEO_FILES" | xargs -P 4 -I {} npm run seo:lint:file {}
```

### 2. Caching

Cache validation results for unchanged files:

```bash
# Check file hash against cache
FILE_HASH=$(sha256sum "$file" | cut -d' ' -f1)
CACHE_FILE=".seo-cache/$FILE_HASH"

if [ -f "$CACHE_FILE" ]; then
  echo "  Using cached result for $file"
  cat "$CACHE_FILE"
else
  npm run seo:lint:file "$file" | tee "$CACHE_FILE"
fi
```

### 3. Skip Patterns

Skip validation in certain contexts:

```yaml
# .pre-commit-config.yaml
- id: seo-validation
  # Skip on merge commits
  stages: [commit]
  # Skip certain paths
  exclude: |
    ^tests/
    ^fixtures/
    ^__mocks__/
```

## Troubleshooting

### Hook Too Slow

If pre-commit exceeds 5 seconds:

1. **Check file count**: Too many staged files?
2. **Review npm scripts**: Are they efficient?
3. **Move to CI**: Heavy checks belong in GitHub Actions
4. **Add caching**: Cache results for unchanged files
5. **Use --no-verify**: Temporarily skip (use sparingly)

### False Positives

If validation fails incorrectly:

1. **Check file type**: Is the file SEO-relevant?
2. **Review patterns**: Are regex patterns correct?
3. **Test locally**: Run validation manually first
4. **Add exceptions**: Use exclude patterns for edge cases

## Related Patterns

- **GitHub Actions**: See `github-actions-patterns.md` for CI validation
- **Deployment gates**: See `deployment-gates.md` for production blocking
- **Test patterns**: See `tdd-workflow/seo-patterns.md` for test code

## Implementation Reference

The patterns in this document are implemented in:

- **Hook**: `.claude/hooks/seo-pre-commit.md` - Claude Code pre-commit hook using these patterns
- **Test Fixtures**: `tests/fixtures/pre-commit/` - Sample HTML files and configuration for testing
