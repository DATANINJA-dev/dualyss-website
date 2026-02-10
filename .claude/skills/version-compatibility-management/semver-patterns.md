# Semantic Versioning Patterns

> Parsing, comparison, and increment patterns following SemVer 2.0.0

## Version Structure

A semantic version consists of:

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

Examples:
  1.0.0                    # Release version
  1.0.0-alpha              # Pre-release
  1.0.0-alpha.1            # Pre-release with numeric identifier
  1.0.0-beta.2+build.123   # Pre-release with build metadata
  2.0.0+20260109           # Release with build metadata
```

## Version Parsing Regex

> **See also**: [compatibility-matrix.md](./compatibility-matrix.md#version-constraint-syntax) for constraint evaluation using these parsed versions.

### Full SemVer 2.0.0 Pattern

```typescript
/**
 * Official SemVer 2.0.0 regex pattern
 * Source: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
 */
const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * Capture groups:
 * [1] = MAJOR
 * [2] = MINOR
 * [3] = PATCH
 * [4] = PRERELEASE (optional)
 * [5] = BUILD (optional)
 */
```

### Simplified Pattern (Core Only)

For quick validation when pre-release/build not needed:

```typescript
const SEMVER_SIMPLE = /^(\d+)\.(\d+)\.(\d+)$/;
```

### Version Parser

```typescript
interface SemVer {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string[];
  build?: string[];
  raw: string;
}

function parseVersion(version: string): SemVer | null {
  const match = version.match(SEMVER_REGEX);
  if (!match) return null;

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] ? match[4].split('.') : undefined,
    build: match[5] ? match[5].split('.') : undefined,
    raw: version,
  };
}

// Examples
parseVersion('1.2.3');
// { major: 1, minor: 2, patch: 3, raw: '1.2.3' }

parseVersion('1.0.0-alpha.1+build.123');
// { major: 1, minor: 0, patch: 0, prerelease: ['alpha', '1'], build: ['build', '123'], raw: '1.0.0-alpha.1+build.123' }

parseVersion('not-a-version');
// null
```

## Version Comparison

> **See also**: [compatibility-matrix.md](./compatibility-matrix.md#constraint-evaluation) for the `satisfies()` function that uses `compareVersions()` internally.

### Comparison Algorithm

Per SemVer spec, compare in order:
1. MAJOR (numeric)
2. MINOR (numeric)
3. PATCH (numeric)
4. PRERELEASE (if present, lower precedence than release)
5. BUILD metadata is ignored

```typescript
type CompareResult = -1 | 0 | 1;

function compareVersions(a: string, b: string): CompareResult {
  const vA = parseVersion(a);
  const vB = parseVersion(b);

  if (!vA || !vB) {
    throw new Error('Invalid version format');
  }

  // Compare major.minor.patch numerically
  if (vA.major !== vB.major) return vA.major > vB.major ? 1 : -1;
  if (vA.minor !== vB.minor) return vA.minor > vB.minor ? 1 : -1;
  if (vA.patch !== vB.patch) return vA.patch > vB.patch ? 1 : -1;

  // Pre-release vs release: pre-release is LOWER
  if (vA.prerelease && !vB.prerelease) return -1;
  if (!vA.prerelease && vB.prerelease) return 1;

  // Both have pre-release: compare identifiers
  if (vA.prerelease && vB.prerelease) {
    return comparePrereleases(vA.prerelease, vB.prerelease);
  }

  // Equal (build metadata ignored)
  return 0;
}

// Usage
compareVersions('1.10.0', '1.9.0');   // 1 (1.10.0 is greater)
compareVersions('1.0.0', '1.0.0');    // 0 (equal)
compareVersions('1.0.0-alpha', '1.0.0'); // -1 (pre-release is lower)
```

### Pre-release Comparison

Pre-release identifiers are compared left-to-right:
- Numeric identifiers: compared as integers
- Alphanumeric identifiers: compared lexically (ASCII)
- Numeric < Alphanumeric
- Shorter array < longer array (if all preceding are equal)

```typescript
function comparePrereleases(a: string[], b: string[]): CompareResult {
  const maxLen = Math.max(a.length, b.length);

  for (let i = 0; i < maxLen; i++) {
    // Missing identifier means shorter array → lower precedence
    if (i >= a.length) return -1;
    if (i >= b.length) return 1;

    const aId = a[i];
    const bId = b[i];
    const aNum = parseInt(aId, 10);
    const bNum = parseInt(bId, 10);
    const aIsNum = !isNaN(aNum) && aId === String(aNum);
    const bIsNum = !isNaN(bNum) && bId === String(bNum);

    // Numeric < alphanumeric
    if (aIsNum && !bIsNum) return -1;
    if (!aIsNum && bIsNum) return 1;

    // Both numeric: compare as numbers
    if (aIsNum && bIsNum) {
      if (aNum !== bNum) return aNum > bNum ? 1 : -1;
      continue;
    }

    // Both alphanumeric: compare lexically
    if (aId !== bId) return aId > bId ? 1 : -1;
  }

  return 0;
}

// Examples
// 1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-alpha.beta < 1.0.0-beta < 1.0.0-beta.2 < 1.0.0-beta.11 < 1.0.0-rc.1 < 1.0.0
```

### Pre-release Comparison Integration Example

Complete example demonstrating `compareVersions()` using `comparePrereleases()` internally:

```typescript
// Demonstrate full precedence chain
const versions = [
  '1.0.0-alpha',
  '1.0.0-alpha.1',
  '1.0.0-alpha.beta',
  '1.0.0-beta',
  '1.0.0-beta.2',
  '1.0.0-beta.11',
  '1.0.0-rc.1',
  '1.0.0'
];

// Sort using compareVersions (which calls comparePrereleases internally)
const sorted = [...versions].sort(compareVersions);
console.log('Sorted (lowest to highest):');
sorted.forEach((v, i) => console.log(`  ${i + 1}. ${v}`));

// Output:
//   1. 1.0.0-alpha
//   2. 1.0.0-alpha.1
//   3. 1.0.0-alpha.beta
//   4. 1.0.0-beta
//   5. 1.0.0-beta.2
//   6. 1.0.0-beta.11
//   7. 1.0.0-rc.1
//   8. 1.0.0
```

#### Numeric < Alphanumeric Rule

The SemVer spec states: "Numeric identifiers always have lower precedence than alphanumeric identifiers."

```typescript
// Demonstrating numeric < alphanumeric
compareVersions('1.0.0-1', '1.0.0-alpha');  // -1 (numeric '1' < alphanumeric 'alpha')
compareVersions('1.0.0-2', '1.0.0-alpha');  // -1 (numeric '2' < alphanumeric 'alpha')
compareVersions('1.0.0-10', '1.0.0-a');     // -1 (any numeric < any alphanumeric)

// Why? Per SemVer 2.0.0 spec section 11:
// "identifiers consisting of only digits are compared numerically"
// "identifiers with letters or hyphens are compared lexically in ASCII sort order"
// "Numeric identifiers always have lower precedence than alphanumeric identifiers"

// This means:
//   1.0.0-0 < 1.0.0-1 < 1.0.0-999 < 1.0.0-a < 1.0.0-alpha < 1.0.0-z
```

#### Internal Flow (for reference)

When `compareVersions('1.0.0-alpha.1', '1.0.0-beta')` is called:

```
1. Parse both versions
   a: { major: 1, minor: 0, patch: 0, prerelease: ['alpha', '1'] }
   b: { major: 1, minor: 0, patch: 0, prerelease: ['beta'] }

2. Compare major.minor.patch → equal (1.0.0 = 1.0.0)

3. Both have prerelease → delegate to comparePrereleases()
   comparePrereleases(['alpha', '1'], ['beta'])

4. Compare first identifiers: 'alpha' vs 'beta'
   - Both alphanumeric → lexical comparison
   - 'alpha' < 'beta' (ASCII order)
   - Return -1

5. Result: 1.0.0-alpha.1 < 1.0.0-beta
```

## Version Increment Patterns

### Standard Increments

```typescript
function incrementMajor(v: SemVer): string {
  return `${v.major + 1}.0.0`;
}

function incrementMinor(v: SemVer): string {
  return `${v.major}.${v.minor + 1}.0`;
}

function incrementPatch(v: SemVer): string {
  return `${v.major}.${v.minor}.${v.patch + 1}`;
}

// Usage
const v = parseVersion('1.2.3')!;
incrementMajor(v); // '2.0.0'
incrementMinor(v); // '1.3.0'
incrementPatch(v); // '1.2.4'
```

### Pre-release Increments

```typescript
function incrementPrerelease(v: SemVer, identifier: string = 'alpha'): string {
  // If no prerelease, start with .0
  if (!v.prerelease) {
    return `${v.major}.${v.minor}.${v.patch + 1}-${identifier}.0`;
  }

  // Find and increment last numeric identifier
  const pre = [...v.prerelease];
  for (let i = pre.length - 1; i >= 0; i--) {
    const num = parseInt(pre[i], 10);
    if (!isNaN(num)) {
      pre[i] = String(num + 1);
      return `${v.major}.${v.minor}.${v.patch}-${pre.join('.')}`;
    }
  }

  // No numeric identifier, append .0
  pre.push('0');
  return `${v.major}.${v.minor}.${v.patch}-${pre.join('.')}`;
}

// Examples
incrementPrerelease(parseVersion('1.0.0')!);          // '1.0.1-alpha.0'
incrementPrerelease(parseVersion('1.0.0-alpha.1')!);  // '1.0.0-alpha.2'
incrementPrerelease(parseVersion('1.0.0-beta')!);     // '1.0.0-beta.0'
```

## CLAUDE.md Metadata Extraction

> **See also**: [compatibility-matrix.md](./compatibility-matrix.md#compatibility-validation-workflow) for the full validation workflow using extracted metadata.

Extract version from CLAUDE.md HTML comment format:

```typescript
const CLAUDE_META_REGEX = /<!--\s*simon_tools_meta\s*([\s\S]*?)-->/;
const VERSION_LINE_REGEX = /^version:\s*(\S+)/m;
const LAST_SYNC_REGEX = /^last_sync:\s*(\S+)/m;

interface ClaudeMetadata {
  version: string | null;
  lastSync: string | null;
}

function extractClaudeMetadata(content: string): ClaudeMetadata {
  const metaMatch = content.match(CLAUDE_META_REGEX);
  if (!metaMatch) {
    return { version: null, lastSync: null };
  }

  const metaContent = metaMatch[1];
  const versionMatch = metaContent.match(VERSION_LINE_REGEX);
  const syncMatch = metaContent.match(LAST_SYNC_REGEX);

  return {
    version: versionMatch?.[1] ?? null,
    lastSync: syncMatch?.[1] ?? null,
  };
}

// Example
const claudeMd = `# Project

<!-- simon_tools_meta
version: 0.28.0
last_sync: 2026-01-09
-->

Content here...`;

extractClaudeMetadata(claudeMd);
// { version: '0.28.0', lastSync: '2026-01-09' }
```

### Handling Missing Metadata

Legacy projects may not have the `simon_tools_meta` HTML comment yet. The `extractClaudeMetadata()` function returns `null` values when metadata is missing, but consumers should handle this gracefully.

**Fallback Strategy**:

| Field | If Missing | Rationale |
|-------|-----------|-----------|
| `version` | Assume `0.1.0` | Initial version before metadata tracking |
| `lastSync` | Assume `null` | Never synced with hub |

**Extended Function with Fallback**:

```typescript
const DEFAULT_VERSION = '0.1.0';

interface ClaudeMetadataWithDefaults {
  version: string;
  lastSync: string | null;
  isLegacy: boolean;  // True if metadata was missing
}

function extractClaudeMetadataWithFallback(content: string): ClaudeMetadataWithDefaults {
  const meta = extractClaudeMetadata(content);

  const isLegacy = meta.version === null;

  if (isLegacy) {
    console.warn(
      '[WARNING] No simon_tools_meta found in CLAUDE.md. ' +
      `Assuming initial version ${DEFAULT_VERSION}. ` +
      'Run /sync-pull to update metadata.'
    );
  }

  return {
    version: meta.version ?? DEFAULT_VERSION,
    lastSync: meta.lastSync,
    isLegacy,
  };
}

// Example: Legacy project without metadata
const legacyClaude = `# My Project

Some content without metadata...
`;

extractClaudeMetadataWithFallback(legacyClaude);
// { version: '0.1.0', lastSync: null, isLegacy: true }
// Console: [WARNING] No simon_tools_meta found in CLAUDE.md...
```

**Consumer Warning Pattern**:

When a consumer detects missing metadata, it should:

1. **Log a warning** - Inform the user that defaults are being used
2. **Continue execution** - Don't fail on missing metadata
3. **Suggest remediation** - Point to `/sync-pull` to update

```typescript
function validateProjectVersion(claudeMdContent: string): void {
  const { version, isLegacy } = extractClaudeMetadataWithFallback(claudeMdContent);

  if (isLegacy) {
    // Log but don't fail - graceful degradation
    console.warn(
      `Project appears to be legacy (no version metadata). ` +
      `Using assumed version: ${version}`
    );
  }

  // Continue with version-based logic...
}
```

## Test Examples

| Input | Expected Output | Pattern |
|-------|-----------------|---------|
| `1.0.0` | Valid, {1, 0, 0} | Basic |
| `1.2.3-alpha` | Valid, pre: [alpha] | Pre-release |
| `1.2.3-alpha.1` | Valid, pre: [alpha, 1] | Pre-release numeric |
| `1.2.3+build` | Valid, build: [build] | Build metadata |
| `1.2.3-rc.1+20260109` | Valid, both | Full format |
| `1.2` | Invalid | Missing PATCH |
| `1.2.3.4` | Invalid | Extra segment |
| `v1.2.3` | Invalid | Prefix not allowed |
| `01.2.3` | Invalid | Leading zero |
