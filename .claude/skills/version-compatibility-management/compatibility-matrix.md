# Compatibility Matrix Patterns

> Structure, constraint syntax, and breaking change detection for framework version management

## Compatibility Matrix Structure

The compatibility matrix lives at `.claude/compatibility.yaml` and tracks version compatibility:

```yaml
# .claude/compatibility.yaml
# Compatibility matrix for simon_tools framework

schema_version: "1.0.0"

versions:
  "0.28.0":
    released: "2026-01-09"
    breaking_changes: []
    compatible_with: ">=0.25.0"
    deprecated_features: []
    migration_guide: null

  "0.27.0":
    released: "2026-01-09"
    breaking_changes:
      - type: "removed"
        component: "command"
        name: "/set-up"
        replacement: "/refine"
        migration: "Replace /set-up with /refine (same functionality)"
      - type: "removed"
        component: "command"
        name: "/next-task"
        replacement: "/suggest-task"
        migration: "Replace /next-task with /suggest-task (same functionality)"
    compatible_with: ">=0.24.0"
    deprecated_features: []
    migration_guide: "docs/migration-0.27.md"

  "0.26.0":
    released: "2026-01-09"
    breaking_changes: []
    compatible_with: ">=0.24.0"
    deprecated_features:
      - feature: "/set-up command name"
        deprecated_in: "0.26.0"
        removal_version: "0.27.0"
        replacement: "/refine"
    migration_guide: null
```

### Version Entry Schema

```typescript
interface VersionEntry {
  released: string;                    // ISO date (YYYY-MM-DD)
  breaking_changes: BreakingChange[];  // List of breaking changes
  compatible_with: string;             // Version constraint expression
  deprecated_features: Deprecation[];  // Features deprecated in this version
  migration_guide: string | null;      // Path to migration docs
}

interface BreakingChange {
  type: 'removed' | 'changed' | 'renamed' | 'moved';
  component: 'command' | 'agent' | 'skill' | 'hook' | 'api' | 'config';
  name: string;                        // Affected item name
  replacement?: string;                // New name/location if applicable
  migration: string;                   // Brief migration instruction
}

interface Deprecation {
  feature: string;
  deprecated_in: string;               // Version when deprecated
  removal_version: string;             // Planned removal version
  replacement?: string;
}
```

## Version Constraint Syntax

> **See also**: [semver-patterns.md](./semver-patterns.md#version-parsing-regex) for the `parseVersion()` function used to parse versions before constraint evaluation.

Following npm/node-semver conventions for constraint expressions.

### Exact Match

```
1.2.3       Match exactly 1.2.3
=1.2.3      Same as above
```

### Comparison Operators

| Operator | Meaning | Example | Matches |
|----------|---------|---------|---------|
| `>` | Greater than | `>1.2.3` | 1.2.4, 1.3.0, 2.0.0 |
| `>=` | Greater or equal | `>=1.2.3` | 1.2.3, 1.2.4, 2.0.0 |
| `<` | Less than | `<1.2.3` | 1.2.2, 1.1.0, 0.9.0 |
| `<=` | Less or equal | `<=1.2.3` | 1.2.3, 1.2.2, 0.9.0 |
| `=` | Exact (explicit) | `=1.2.3` | 1.2.3 only |

### Range Operators

#### Caret (`^`) - Minor/Patch Updates Allowed

Allows changes that do not modify the left-most non-zero segment:

```
^1.2.3      >=1.2.3 <2.0.0    # Allows minor and patch updates
^0.2.3      >=0.2.3 <0.3.0    # 0.x: only patch updates
^0.0.3      >=0.0.3 <0.0.4    # 0.0.x: exact match
^1.2.x      >=1.2.0 <2.0.0    # Missing segments = 0
^0.0        >=0.0.0 <0.1.0
^0          >=0.0.0 <1.0.0
```

#### Tilde (`~`) - Patch Updates Only

Allows patch-level changes if minor version specified:

```
~1.2.3      >=1.2.3 <1.3.0    # Patch updates only
~1.2        >=1.2.0 <1.3.0    # Same as above
~1          >=1.0.0 <2.0.0    # Minor updates if no minor specified
~0.2.3      >=0.2.3 <0.3.0
```

### Hyphen Ranges

```
1.2.3 - 2.3.4     >=1.2.3 <=2.3.4
1.2 - 2.3.4       >=1.2.0 <=2.3.4
1.2.3 - 2.3       >=1.2.3 <2.4.0
1.2.3 - 2         >=1.2.3 <3.0.0
```

### X-Ranges (Wildcards)

```
*           Any version
1.x         >=1.0.0 <2.0.0
1.2.x       >=1.2.0 <1.3.0
1.2.*       Same as 1.2.x
""          Same as * (any)
```

### Combined Ranges (AND)

Space-separated constraints are AND-ed:

```
>=1.2.3 <2.0.0    # Both conditions must match
>1.0.0 <2.0.0     # Range from 1.0.1 to 1.x.x
```

### Alternative Ranges (OR)

Pipe (`||`) separates alternatives:

```
1.2.x || >=2.0.0    # Either 1.2.x or 2.0.0+
<1.0.0 || >=2.0.0   # Pre-1.0 or 2.0+
```

## Constraint Evaluation

```typescript
interface Constraint {
  operator: '>' | '>=' | '<' | '<=' | '=' | '^' | '~';
  version: string;
}

function expandCaretRange(version: string): { min: string; max: string } {
  const v = parseVersion(version)!;

  // ^1.2.3 → >=1.2.3 <2.0.0
  if (v.major > 0) {
    return {
      min: version,
      max: `${v.major + 1}.0.0`,
    };
  }

  // ^0.2.3 → >=0.2.3 <0.3.0
  if (v.minor > 0) {
    return {
      min: version,
      max: `0.${v.minor + 1}.0`,
    };
  }

  // ^0.0.3 → >=0.0.3 <0.0.4
  return {
    min: version,
    max: `0.0.${v.patch + 1}`,
  };
}

/**
 * Expands tilde range to min/max bounds
 * ~X.Y.Z → >=X.Y.Z <X.(Y+1).0
 * ~X.Y   → >=X.Y.0 <X.(Y+1).0
 * ~X     → >=X.0.0 <(X+1).0.0 (allows minor updates)
 */
function expandTildeRange(version: string): { min: string; max: string } {
  // Handle partial versions (missing segments)
  const parts = version.split('.');
  const major = parseInt(parts[0], 10);
  const minor = parts.length > 1 ? parseInt(parts[1], 10) : null;
  const patch = parts.length > 2 ? parseInt(parts[2], 10) : 0;

  // ~X (major only) → >=X.0.0 <(X+1).0.0
  if (minor === null) {
    return {
      min: `${major}.0.0`,
      max: `${major + 1}.0.0`,
    };
  }

  // ~X.Y or ~X.Y.Z → >=X.Y.Z <X.(Y+1).0
  return {
    min: `${major}.${minor}.${patch}`,
    max: `${major}.${minor + 1}.0`,
  };
}

/**
 * Expands x-range/wildcard to min/max bounds
 * Returns null if not an x-range pattern
 *
 * Patterns:
 * *       → any version (return { min: '0.0.0', max: null })
 * 1.x     → >=1.0.0 <2.0.0
 * 1.2.x   → >=1.2.0 <1.3.0
 * 1.2.*   → same as 1.2.x
 * ""      → same as *
 */
function expandXRange(constraint: string): { min: string; max: string | null } | null {
  const trimmed = constraint.trim();

  // Empty string or * = any version
  if (trimmed === '' || trimmed === '*') {
    return { min: '0.0.0', max: null };
  }

  // Check for x-range patterns
  const xRangeRegex = /^(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?$/;
  const match = trimmed.match(xRangeRegex);

  if (!match) return null;

  const major = parseInt(match[1], 10);
  const minorPart = match[2];
  const patchPart = match[3];

  // 1 or 1.x or 1.* → >=1.0.0 <2.0.0
  if (!minorPart || minorPart === 'x' || minorPart === '*') {
    return {
      min: `${major}.0.0`,
      max: `${major + 1}.0.0`,
    };
  }

  const minor = parseInt(minorPart, 10);

  // 1.2.x or 1.2.* → >=1.2.0 <1.3.0
  if (!patchPart || patchPart === 'x' || patchPart === '*') {
    return {
      min: `${major}.${minor}.0`,
      max: `${major}.${minor + 1}.0`,
    };
  }

  // Not an x-range (all segments are numeric)
  return null;
}

/**
 * Parses hyphen range into min/max bounds
 * Returns null if not a hyphen range
 *
 * Patterns:
 * 1.2.3 - 2.3.4   → >=1.2.3 <=2.3.4
 * 1.2 - 2.3.4     → >=1.2.0 <=2.3.4  (fill missing segments)
 * 1.2.3 - 2.3     → >=1.2.3 <2.4.0   (upper partial: exclusive next)
 * 1.2.3 - 2       → >=1.2.3 <3.0.0
 */
function parseHyphenRange(constraint: string): { min: string; max: string; maxInclusive: boolean } | null {
  // Match pattern: version - version (with spaces around hyphen)
  const hyphenMatch = constraint.match(/^([^\s]+)\s+-\s+([^\s]+)$/);
  if (!hyphenMatch) return null;

  const [, lower, upper] = hyphenMatch;

  // Parse and fill lower bound (missing segments = 0)
  const lowerParts = lower.split('.');
  const lowerMin = [
    lowerParts[0] || '0',
    lowerParts[1] || '0',
    lowerParts[2] || '0',
  ].join('.');

  // Parse upper bound
  const upperParts = upper.split('.');

  // If upper is partial, use exclusive next version
  if (upperParts.length === 1) {
    // 1.2.3 - 2 → <3.0.0
    return {
      min: lowerMin,
      max: `${parseInt(upperParts[0], 10) + 1}.0.0`,
      maxInclusive: false,
    };
  }

  if (upperParts.length === 2) {
    // 1.2.3 - 2.3 → <2.4.0
    return {
      min: lowerMin,
      max: `${upperParts[0]}.${parseInt(upperParts[1], 10) + 1}.0`,
      maxInclusive: false,
    };
  }

  // Full version: inclusive upper bound
  return {
    min: lowerMin,
    max: upper,
    maxInclusive: true,
  };
}

/**
 * Checks if a version satisfies a constraint expression
 * Supports all npm/node-semver constraint types:
 * - Comparison operators: >=, >, <=, <, =
 * - Caret ranges: ^1.2.3
 * - Tilde ranges: ~1.2.3
 * - Hyphen ranges: 1.2.3 - 2.3.4
 * - X-ranges: 1.x, 1.2.*, *
 * - OR conditions: 1.2.x || >=2.0.0
 * - AND conditions: >=1.2.3 <2.0.0 (space-separated)
 */
function satisfies(version: string, constraint: string): boolean {
  const trimmed = constraint.trim();

  // Empty constraint or * = any version
  if (trimmed === '' || trimmed === '*') {
    return true;
  }

  // 1. Handle OR conditions (||) - check if ANY alternative matches
  if (trimmed.includes('||')) {
    const alternatives = trimmed.split('||').map((s) => s.trim());
    return alternatives.some((alt) => satisfies(version, alt));
  }

  // 2. Handle hyphen ranges (must check before space-separated AND)
  const hyphenRange = parseHyphenRange(trimmed);
  if (hyphenRange) {
    const { min, max, maxInclusive } = hyphenRange;
    const minCheck = compareVersions(version, min) >= 0;
    const maxCheck = maxInclusive
      ? compareVersions(version, max) <= 0
      : compareVersions(version, max) < 0;
    return minCheck && maxCheck;
  }

  // 3. Handle AND conditions (space-separated) - ALL must match
  // But don't split on spaces within operators like >= or <=
  const andParts = trimmed.split(/\s+/).filter((p) => p);
  if (andParts.length > 1) {
    return andParts.every((part) => satisfies(version, part));
  }

  // 4. Handle caret range (^)
  if (trimmed.startsWith('^')) {
    const { min, max } = expandCaretRange(trimmed.slice(1));
    return (
      compareVersions(version, min) >= 0 &&
      compareVersions(version, max) < 0
    );
  }

  // 5. Handle tilde range (~)
  if (trimmed.startsWith('~')) {
    const { min, max } = expandTildeRange(trimmed.slice(1));
    return (
      compareVersions(version, min) >= 0 &&
      compareVersions(version, max) < 0
    );
  }

  // 6. Handle x-ranges and wildcards
  const xRange = expandXRange(trimmed);
  if (xRange) {
    const { min, max } = xRange;
    const minCheck = compareVersions(version, min) >= 0;
    // max is null for * (any version)
    if (max === null) return true;
    return minCheck && compareVersions(version, max) < 0;
  }

  // 7. Handle comparison operators (order matters: check >= before >)
  if (trimmed.startsWith('>=')) {
    const target = trimmed.slice(2).trim();
    return compareVersions(version, target) >= 0;
  }

  if (trimmed.startsWith('>')) {
    const target = trimmed.slice(1).trim();
    return compareVersions(version, target) > 0;
  }

  if (trimmed.startsWith('<=')) {
    const target = trimmed.slice(2).trim();
    return compareVersions(version, target) <= 0;
  }

  if (trimmed.startsWith('<')) {
    const target = trimmed.slice(1).trim();
    return compareVersions(version, target) < 0;
  }

  if (trimmed.startsWith('=')) {
    const target = trimmed.slice(1).trim();
    return compareVersions(version, target) === 0;
  }

  // 8. Default: exact match (no operator)
  return compareVersions(version, trimmed) === 0;
}

// ============================================================================
// EXAMPLES: Comparison Operators
// ============================================================================

satisfies('1.5.0', '>=1.2.3');           // true  (1.5.0 >= 1.2.3)
satisfies('1.2.3', '>=1.2.3');           // true  (inclusive)
satisfies('1.2.2', '>=1.2.3');           // false (1.2.2 < 1.2.3)

satisfies('1.5.0', '>1.2.3');            // true  (1.5.0 > 1.2.3)
satisfies('1.2.3', '>1.2.3');            // false (not greater, equal)

satisfies('1.2.2', '<1.2.3');            // true  (1.2.2 < 1.2.3)
satisfies('1.2.3', '<1.2.3');            // false (not less, equal)

satisfies('1.2.3', '<=1.2.3');           // true  (inclusive)
satisfies('1.2.4', '<=1.2.3');           // false

satisfies('1.2.3', '=1.2.3');            // true  (exact match)
satisfies('1.2.3', '1.2.3');             // true  (exact, = optional)
satisfies('1.2.4', '=1.2.3');            // false

// ============================================================================
// EXAMPLES: Caret Ranges (allows non-breaking changes per SemVer)
// ============================================================================

// Major > 0: allows minor/patch updates
satisfies('1.5.0', '^1.2.3');            // true  (>=1.2.3 <2.0.0)
satisfies('1.99.99', '^1.2.3');          // true
satisfies('2.0.0', '^1.2.3');            // false (2.0.0 not < 2.0.0)

// Major = 0, Minor > 0: allows patch updates only
satisfies('0.2.4', '^0.2.3');            // true  (>=0.2.3 <0.3.0)
satisfies('0.3.0', '^0.2.3');            // false (0.3.0 not < 0.3.0)

// Major = 0, Minor = 0: exact match
satisfies('0.0.3', '^0.0.3');            // true  (>=0.0.3 <0.0.4)
satisfies('0.0.4', '^0.0.3');            // false

// ============================================================================
// EXAMPLES: Tilde Ranges (patch updates, minor if not specified)
// ============================================================================

satisfies('1.2.4', '~1.2.3');            // true  (>=1.2.3 <1.3.0)
satisfies('1.2.99', '~1.2.3');           // true
satisfies('1.3.0', '~1.2.3');            // false

satisfies('1.2.4', '~1.2');              // true  (same range as ~1.2.0)
satisfies('1.3.0', '~1.2');              // false

satisfies('1.5.0', '~1');                // true  (>=1.0.0 <2.0.0)
satisfies('2.0.0', '~1');                // false

// ============================================================================
// EXAMPLES: Hyphen Ranges (inclusive on both ends)
// ============================================================================

satisfies('1.5.0', '1.2.3 - 2.3.4');     // true  (>=1.2.3 <=2.3.4)
satisfies('2.3.4', '1.2.3 - 2.3.4');     // true  (inclusive upper)
satisfies('2.3.5', '1.2.3 - 2.3.4');     // false

satisfies('1.2.5', '1.2 - 2.3.4');       // true  (1.2 → 1.2.0)
satisfies('2.3.99', '1.2.3 - 2.3');      // false (2.3 → <2.4.0)

// ============================================================================
// EXAMPLES: X-Ranges / Wildcards
// ============================================================================

satisfies('1.5.0', '*');                 // true  (* matches any)
satisfies('0.0.0', '*');                 // true
satisfies('99.99.99', '*');              // true

satisfies('1.5.0', '1.x');               // true  (>=1.0.0 <2.0.0)
satisfies('1.0.0', '1.x');               // true
satisfies('2.0.0', '1.x');               // false

satisfies('1.2.4', '1.2.x');             // true  (>=1.2.0 <1.3.0)
satisfies('1.3.0', '1.2.x');             // false

satisfies('1.2.4', '1.2.*');             // true  (same as 1.2.x)
satisfies('0.0.0', '');                  // true  (empty string = *)

// ============================================================================
// EXAMPLES: Combined Ranges (AND - space separated)
// ============================================================================

satisfies('1.5.0', '>=1.2.3 <2.0.0');    // true  (both conditions met)
satisfies('1.2.3', '>=1.2.3 <2.0.0');    // true  (>= is inclusive)
satisfies('2.0.0', '>=1.2.3 <2.0.0');    // false (< exclusive)
satisfies('1.2.2', '>=1.2.3 <2.0.0');    // false

satisfies('1.0.1', '>1.0.0 <2.0.0');     // true
satisfies('1.0.0', '>1.0.0 <2.0.0');     // false (> is exclusive)

// ============================================================================
// EXAMPLES: OR Conditions (|| separated)
// ============================================================================

satisfies('1.2.0', '1.2.x || >=2.0.0');  // true  (matches first)
satisfies('2.5.0', '1.2.x || >=2.0.0');  // true  (matches second)
satisfies('1.5.0', '1.2.x || >=2.0.0');  // false (matches neither)

satisfies('0.5.0', '<1.0.0 || >=2.0.0'); // true  (pre-1.0)
satisfies('1.5.0', '<1.0.0 || >=2.0.0'); // false (gap)
satisfies('2.0.0', '<1.0.0 || >=2.0.0'); // true  (2.0.0+)

// ============================================================================
// EXAMPLES: Edge Cases
// ============================================================================

// Numeric comparison (not lexical)
satisfies('1.10.0', '>=1.9.0');          // true  (1.10.0 > 1.9.0)
satisfies('1.10.0', '1.x');              // true

// 0.x semantics
satisfies('0.5.0', '^0');                // true  (>=0.0.0 <1.0.0)
satisfies('1.0.0', '^0');                // false
satisfies('0.0.5', '^0.0');              // true  (>=0.0.0 <0.1.0)
satisfies('0.1.0', '^0.0');              // false
```

## Breaking Change Detection

> **See also**: [semver-patterns.md](./semver-patterns.md#version-comparison) for the `compareVersions()` function used by detection algorithms.

### Categories of Breaking Changes

| Type | Severity | Description | Example |
|------|----------|-------------|---------|
| `removed` | High | Feature/API completely removed | Command deleted |
| `changed` | High | Behavior changed incompatibly | Different output format |
| `renamed` | Medium | Name changed, function same | `/set-up` → `/refine` |
| `moved` | Medium | Location changed | Skill moved to different dir |

### Detection Heuristics

```typescript
type ChangeType = 'removed' | 'changed' | 'renamed' | 'moved';
type Component = 'command' | 'agent' | 'skill' | 'hook' | 'config';

interface ComponentItem {
  type: Component;
  name: string;
  path: string;           // Full path (e.g., ".claude/commands/audit.md")
  contentHash?: string;   // Optional: SHA-256 of content for behavior change detection
}

interface ComponentList {
  items: ComponentItem[];
  has(item: ComponentItem): boolean;
  getByName(name: string): ComponentItem | undefined;
  getByPath(path: string): ComponentItem | undefined;
}

interface DetectedChange {
  type: ChangeType;
  component: Component;
  name: string;
  severity: 'high' | 'medium' | 'low';
  autoMigratable: boolean;
  oldPath?: string;       // For moves: original path
  newPath?: string;       // For moves: new path
  newName?: string;       // For renames: the new name
  similarity?: number;    // For renames: similarity score (0-1)
}

// ============================================================================
// HELPER: Levenshtein Distance Algorithm
// ============================================================================

/**
 * Calculates the Levenshtein (edit) distance between two strings.
 * Returns the minimum number of single-character edits (insertions,
 * deletions, or substitutions) required to transform string `a` into `b`.
 *
 * Time complexity: O(m × n) where m = len(a), n = len(b)
 * Space complexity: O(min(m, n)) using rolling row optimization
 */
function levenshteinDistance(a: string, b: string): number {
  // Edge cases: empty strings
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Optimization: ensure `a` is the shorter string for space efficiency
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  const m = a.length;
  const n = b.length;

  // Use two rows instead of full matrix (space optimization)
  let previousRow: number[] = Array.from({ length: m + 1 }, (_, i) => i);
  let currentRow: number[] = new Array(m + 1);

  for (let j = 1; j <= n; j++) {
    currentRow[0] = j;

    for (let i = 1; i <= m; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      currentRow[i] = Math.min(
        previousRow[i] + 1,      // Deletion
        currentRow[i - 1] + 1,   // Insertion
        previousRow[i - 1] + cost // Substitution
      );
    }

    // Swap rows for next iteration
    [previousRow, currentRow] = [currentRow, previousRow];
  }

  return previousRow[m];
}

// ============================================================================
// HELPER: Similarity Ratio
// ============================================================================

/**
 * Calculates similarity ratio between two strings using Levenshtein distance.
 * Returns a value between 0 (completely different) and 1 (identical).
 *
 * Formula: 1 - (distance / max(len(a), len(b)))
 *
 * Recommended thresholds:
 * - >= 0.90: Very likely a rename (minor typo fix)
 * - >= 0.85: Likely a rename (recommended threshold)
 * - >= 0.70: Possibly related, review manually
 * - < 0.70: Probably different components
 */
function similarityRatio(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;

  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);

  return 1 - distance / maxLen;
}

// Configurable threshold for rename detection (default: 0.85)
const RENAME_SIMILARITY_THRESHOLD = 0.85;

// ============================================================================
// HELPER: Path Utilities
// ============================================================================

/**
 * Extracts the filename from a path (ignores directory structure).
 * Works with both Unix (/) and Windows (\) path separators.
 */
function extractFilename(path: string): string {
  // Normalize separators to forward slash
  const normalized = path.replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || '';
}

/**
 * Extracts the directory path (without filename).
 */
function extractDirectory(path: string): string {
  const normalized = path.replace(/\\/g, '/');
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash >= 0 ? normalized.substring(0, lastSlash) : '';
}

// ============================================================================
// DETECTION: Rename Detection
// ============================================================================

/**
 * Finds the best rename candidate for a removed component.
 * Returns the new component with highest similarity above threshold, or null.
 *
 * Algorithm:
 * 1. For each removed item, compare name similarity with all new items
 * 2. Track the candidate with highest similarity
 * 3. Only return if similarity >= RENAME_SIMILARITY_THRESHOLD
 * 4. Handle conflicts: if multiple removed items match the same new item,
 *    the one with higher similarity wins
 */
function findRenameCandidate(
  removedItem: ComponentItem,
  newItems: ComponentItem[],
  alreadyMatched: Set<string>  // Prevent duplicate matches
): { candidate: ComponentItem; similarity: number } | null {
  let bestMatch: ComponentItem | null = null;
  let bestSimilarity = 0;

  for (const newItem of newItems) {
    // Skip if this new item was already matched to another removed item
    if (alreadyMatched.has(newItem.name)) continue;

    // Skip if component types don't match (command can't rename to agent)
    if (removedItem.type !== newItem.type) continue;

    const similarity = similarityRatio(removedItem.name, newItem.name);

    if (similarity >= RENAME_SIMILARITY_THRESHOLD && similarity > bestSimilarity) {
      bestMatch = newItem;
      bestSimilarity = similarity;
    }
  }

  return bestMatch ? { candidate: bestMatch, similarity: bestSimilarity } : null;
}

// ============================================================================
// DETECTION: Move Detection
// ============================================================================

/**
 * Detects if a removed component was moved to a different path.
 * A "move" is when the filename is identical but the directory changed.
 *
 * Note: Move detection runs AFTER rename detection to avoid conflicts.
 * If a component was renamed, it won't be detected as moved.
 */
function findMoveCandidate(
  removedItem: ComponentItem,
  newItems: ComponentItem[],
  alreadyMatched: Set<string>
): ComponentItem | null {
  const removedFilename = extractFilename(removedItem.path);

  for (const newItem of newItems) {
    if (alreadyMatched.has(newItem.path)) continue;
    if (removedItem.type !== newItem.type) continue;

    const newFilename = extractFilename(newItem.path);

    // Same filename, different path = move
    if (removedFilename === newFilename) {
      const removedDir = extractDirectory(removedItem.path);
      const newDir = extractDirectory(newItem.path);

      if (removedDir !== newDir) {
        return newItem;
      }
    }
  }

  return null;
}

// ============================================================================
// DETECTION: Behavior Change Detection (Heuristic)
// ============================================================================

/**
 * Detects potential behavior changes between versions.
 *
 * IMPORTANT: Full behavior change detection requires semantic analysis
 * (parsing code, comparing function signatures, testing outputs).
 * This function provides HEURISTIC detection only.
 *
 * Heuristics used:
 * 1. Content hash comparison (if available)
 * 2. Significant file size change (>50% delta)
 *
 * For comprehensive detection, use:
 * - Unit test comparison
 * - API contract validation (e.g., oasdiff for OpenAPI)
 * - Manual review for critical components
 */
function detectBehaviorChanges(
  oldItem: ComponentItem,
  newItem: ComponentItem
): boolean {
  // If content hashes are available, compare them
  if (oldItem.contentHash && newItem.contentHash) {
    return oldItem.contentHash !== newItem.contentHash;
  }

  // Without content hashes, we cannot reliably detect behavior changes
  // Flag for manual review if this is a critical component
  return false;
}

// ============================================================================
// MAIN: Complete detectBreakingChanges Implementation
// ============================================================================

function detectBreakingChanges(
  oldVersion: ComponentList,
  newVersion: ComponentList
): DetectedChange[] {
  const changes: DetectedChange[] = [];
  const matchedNewItems = new Set<string>();  // Track matched items to prevent duplicates
  const matchedOldItems = new Set<string>();  // Track old items that found matches

  // Get items that exist in old but not in new (potential removals/renames/moves)
  const potentiallyRemoved: ComponentItem[] = [];
  for (const item of oldVersion.items) {
    if (!newVersion.has(item)) {
      potentiallyRemoved.push(item);
    }
  }

  // Get items that exist in new but not in old (potential additions/rename targets)
  const potentiallyAdded: ComponentItem[] = [];
  for (const item of newVersion.items) {
    if (!oldVersion.has(item)) {
      potentiallyAdded.push(item);
    }
  }

  // -------------------------------------------------------------------------
  // PHASE 1: Rename Detection (run first - highest priority after removal)
  // -------------------------------------------------------------------------
  for (const removedItem of potentiallyRemoved) {
    const renameMatch = findRenameCandidate(
      removedItem,
      potentiallyAdded,
      matchedNewItems
    );

    if (renameMatch) {
      changes.push({
        type: 'renamed',
        component: removedItem.type,
        name: removedItem.name,
        newName: renameMatch.candidate.name,
        severity: 'medium',
        autoMigratable: true,  // Renames can often be auto-migrated via alias
        similarity: renameMatch.similarity,
      });

      matchedNewItems.add(renameMatch.candidate.name);
      matchedOldItems.add(removedItem.name);
    }
  }

  // -------------------------------------------------------------------------
  // PHASE 2: Move Detection (same name, different path)
  // -------------------------------------------------------------------------
  for (const removedItem of potentiallyRemoved) {
    // Skip if already matched as rename
    if (matchedOldItems.has(removedItem.name)) continue;

    const moveMatch = findMoveCandidate(
      removedItem,
      potentiallyAdded,
      matchedNewItems
    );

    if (moveMatch) {
      changes.push({
        type: 'moved',
        component: removedItem.type,
        name: removedItem.name,
        oldPath: removedItem.path,
        newPath: moveMatch.path,
        severity: 'medium',
        autoMigratable: true,  // Moves can be auto-migrated via path update
      });

      matchedNewItems.add(moveMatch.path);
      matchedOldItems.add(removedItem.name);
    }
  }

  // -------------------------------------------------------------------------
  // PHASE 3: Pure Removals (not renamed or moved)
  // -------------------------------------------------------------------------
  for (const removedItem of potentiallyRemoved) {
    // Skip if already matched as rename or move
    if (matchedOldItems.has(removedItem.name)) continue;

    changes.push({
      type: 'removed',
      component: removedItem.type,
      name: removedItem.name,
      severity: 'high',
      autoMigratable: false,  // Removals require manual intervention
    });
  }

  // -------------------------------------------------------------------------
  // PHASE 4: Behavior Change Detection (heuristic)
  // -------------------------------------------------------------------------
  // Check items that exist in BOTH versions for content changes
  for (const oldItem of oldVersion.items) {
    const newItem = newVersion.getByName(oldItem.name);

    if (newItem && detectBehaviorChanges(oldItem, newItem)) {
      changes.push({
        type: 'changed',
        component: oldItem.type,
        name: oldItem.name,
        severity: 'high',
        autoMigratable: false,  // Behavior changes require manual review
      });
    }
  }

  return changes;
}

// ============================================================================
// EXAMPLES: Levenshtein Distance
// ============================================================================

levenshteinDistance('abc', 'abc');           // 0 (identical)
levenshteinDistance('abc', 'abd');           // 1 (one substitution: c→d)
levenshteinDistance('abc', 'ab');            // 1 (one deletion: c)
levenshteinDistance('abc', 'abcd');          // 1 (one insertion: d)
levenshteinDistance('', 'abc');              // 3 (three insertions)
levenshteinDistance('abc', '');              // 3 (three deletions)

levenshteinDistance('set-up', 'setup');      // 1 (delete hyphen)
levenshteinDistance('set-up', 'refine');     // 6 (significant changes)
levenshteinDistance('audit-qa', 'audit-qc'); // 1 (a→c substitution)
levenshteinDistance('list-tasks', 'list-task'); // 1 (delete s)

// Larger strings
levenshteinDistance('generate-epics', 'generate-epic');  // 1
levenshteinDistance('develop-task', 'develop-tasks');    // 1
levenshteinDistance('sync-pull', 'sync-push');           // 2 (ull→ush)

// ============================================================================
// EXAMPLES: Similarity Ratio
// ============================================================================

similarityRatio('abc', 'abc');               // 1.0 (identical)
similarityRatio('abc', 'abd');               // 0.67 (1 - 1/3)
similarityRatio('set-up', 'setup');          // 0.86 (1 - 1/6) ← ABOVE threshold
similarityRatio('set-up', 'refine');         // 0.14 (1 - 6/7) ← BELOW threshold
similarityRatio('audit-qa', 'audit-qc');     // 0.88 (1 - 1/8) ← ABOVE threshold
similarityRatio('list-tasks', 'list-task');  // 0.9 (1 - 1/10) ← ABOVE threshold

similarityRatio('', 'abc');                  // 0.0 (empty string)
similarityRatio('abc', '');                  // 0.0 (empty string)

// Real-world examples from v0.27.0
similarityRatio('/set-up', '/refine');       // 0.14 ← NOT a rename (different command)
similarityRatio('/next-task', '/suggest-task'); // 0.50 ← NOT a rename (below threshold)

// Examples that would be detected as renames
similarityRatio('auditQA', 'auditQC');       // 0.86 ← IS a rename
similarityRatio('list-task', 'listTask');    // 0.70 ← BORDERLINE (below 0.85)

// ============================================================================
// EXAMPLES: Rename Detection
// ============================================================================

// Scenario 1: Typo fix detected as rename
// Old: /set-up → New: /setup
// Similarity: 0.86 (above 0.85 threshold)
// Result: { type: 'renamed', name: '/set-up', newName: '/setup', similarity: 0.86 }

// Scenario 2: Different command, not a rename
// Old: /set-up → New: /refine
// Similarity: 0.14 (below 0.85 threshold)
// Result: { type: 'removed', name: '/set-up' }
//         (and /refine would be a new addition, not tracked as breaking)

// Scenario 3: Multiple candidates, highest wins
// Old: ['audit-a', 'audit-b']
// New: ['audit-c']  // only audit-a removed, audit-b stays
// Similarity(audit-a, audit-c) = 0.86
// Result: audit-a renamed to audit-c (only highest match)

// Scenario 4: Type mismatch prevents rename detection
// Old: { type: 'command', name: '/audit' }
// New: { type: 'agent', name: '/audit' }
// Result: command /audit removed, agent /audit added (NOT a rename)

// ============================================================================
// EXAMPLES: Move Detection
// ============================================================================

// Scenario 1: Skill moved to different directory
// Old: { path: '.claude/skills/tdd/SKILL.md' }
// New: { path: '.claude/skills/tdd-workflow/SKILL.md' }
// Same filename (SKILL.md), different directory
// Result: { type: 'moved', oldPath: '.claude/skills/tdd/SKILL.md',
//           newPath: '.claude/skills/tdd-workflow/SKILL.md' }

// Scenario 2: Agent promoted to command (type change, NOT a move)
// Old: { type: 'agent', path: '.claude/agents/audit.md' }
// New: { type: 'command', path: '.claude/commands/audit.md' }
// Result: agent removed, command added (type mismatch)

// Scenario 3: Same directory, different filename (NOT a move, maybe rename)
// Old: { path: '.claude/commands/set-up.md' }
// New: { path: '.claude/commands/refine.md' }
// Result: Not a move (filename changed). Check rename detection instead.

// ============================================================================
// EXAMPLES: Behavior Change Detection
// ============================================================================

// Scenario 1: Content hash changed
// Old: { name: '/audit', contentHash: 'abc123...' }
// New: { name: '/audit', contentHash: 'def456...' }
// Result: { type: 'changed', name: '/audit', severity: 'high' }

// Scenario 2: No content hash available (cannot detect)
// Old: { name: '/audit' }
// New: { name: '/audit' }
// Result: No change detected (requires manual review)

// Scenario 3: Content hash unchanged
// Old: { name: '/audit', contentHash: 'abc123...' }
// New: { name: '/audit', contentHash: 'abc123...' }
// Result: No change detected (content identical)

// ============================================================================
// EXAMPLES: Complete Detection Workflow
// ============================================================================

// Example: Detecting changes between v0.26.0 and v0.27.0
const oldVersion = {
  items: [
    { type: 'command', name: '/set-up', path: '.claude/commands/set-up.md' },
    { type: 'command', name: '/next-task', path: '.claude/commands/next-task.md' },
    { type: 'command', name: '/audit', path: '.claude/commands/audit.md' },
  ],
  // ... implementation
};

const newVersion = {
  items: [
    { type: 'command', name: '/refine', path: '.claude/commands/refine.md' },
    { type: 'command', name: '/suggest-task', path: '.claude/commands/suggest-task.md' },
    { type: 'command', name: '/audit', path: '.claude/commands/audit.md' },
  ],
  // ... implementation
};

const changes = detectBreakingChanges(oldVersion, newVersion);

// Expected results:
// [
//   { type: 'removed', component: 'command', name: '/set-up',
//     severity: 'high', autoMigratable: false },
//   { type: 'removed', component: 'command', name: '/next-task',
//     severity: 'high', autoMigratable: false },
// ]
//
// Note: /set-up→/refine and /next-task→/suggest-task have LOW similarity
// (0.14 and 0.50 respectively), so they are detected as removals, not renames.
// This matches the v0.27.0 breaking changes which required manual migration.

// ============================================================================
// EXAMPLES: Edge Cases
// ============================================================================

// Empty lists
detectBreakingChanges({ items: [] }, { items: [] });  // []

// Identical lists
detectBreakingChanges(sameList, sameList);  // []

// All removed
detectBreakingChanges(fullList, { items: [] });
// Returns all items as 'removed' with severity: 'high'

// All new (no breaking changes for additions)
detectBreakingChanges({ items: [] }, fullList);  // []

// Circular rename scenario (A→B, B→A) - each detected independently
// Old: [A, B], New: [A', B'] where A'≈B and B'≈A
// Result: A renamed to A' (if similarity > threshold), B renamed to B'
// Note: The algorithm prevents double-matching via alreadyMatched Set
```

### Breaking Change Rules

1. **MAJOR bump required** for:
   - Removing any public command, agent, skill, or hook
   - Changing output format of commands
   - Changing required tool permissions
   - Renaming without alias (when alias period expires)

2. **Deprecation required before removal**:
   - Announce in MINOR version before removal
   - Provide migration path
   - Allow at least one MINOR version gap

3. **Non-breaking changes** (MINOR or PATCH):
   - Adding new commands/agents/skills
   - Adding new optional parameters
   - Fixing bugs (unless relied upon)
   - Adding aliases

## Compatibility Validation Workflow

> **See also**: [semver-patterns.md](./semver-patterns.md#claudemd-metadata-extraction) for the `extractClaudeMetadata()` function used to read version from CLAUDE.md.

```typescript
interface ValidationResult {
  compatible: boolean;
  currentVersion: string;
  targetVersion: string;
  breakingChanges: BreakingChange[];
  warnings: string[];
  migrationRequired: boolean;
}

async function validateCompatibility(
  localVersion: string,
  hubVersion: string,
  matrix: CompatibilityMatrix
): Promise<ValidationResult> {
  const hubEntry = matrix.versions[hubVersion];

  if (!hubEntry) {
    return {
      compatible: false,
      currentVersion: localVersion,
      targetVersion: hubVersion,
      breakingChanges: [],
      warnings: [`Unknown version: ${hubVersion}`],
      migrationRequired: false,
    };
  }

  // Check if local version satisfies hub's compatibility constraint
  const meetsConstraint = satisfies(localVersion, hubEntry.compatible_with);

  // Collect breaking changes between versions
  const breakingChanges = collectBreakingChanges(
    matrix,
    localVersion,
    hubVersion
  );

  return {
    compatible: meetsConstraint && breakingChanges.length === 0,
    currentVersion: localVersion,
    targetVersion: hubVersion,
    breakingChanges,
    warnings: breakingChanges.length > 0
      ? ['Migration required for breaking changes']
      : [],
    migrationRequired: breakingChanges.length > 0,
  };
}

function collectBreakingChanges(
  matrix: CompatibilityMatrix,
  from: string,
  to: string
): BreakingChange[] {
  const changes: BreakingChange[] = [];

  // Iterate through all versions between `from` and `to`
  for (const [version, entry] of Object.entries(matrix.versions)) {
    if (compareVersions(version, from) > 0 && compareVersions(version, to) <= 0) {
      changes.push(...entry.breaking_changes);
    }
  }

  return changes;
}
```

### Validation Decision Tree

```
Is hub version in compatibility matrix?
  ├─ No → BLOCK: Unknown version
  └─ Yes
        ↓
Does local satisfy hub's compatible_with constraint?
  ├─ No → BLOCK: Version too old
  └─ Yes
        ↓
Are there breaking changes between versions?
  ├─ Yes → WARN: Show migration guide, require explicit consent
  └─ No → ALLOW: Safe to sync
```

## Example Usage

### Check Before Sync

```typescript
// Before pulling updates
const localMeta = extractClaudeMetadata(await readFile('CLAUDE.md'));
const hubMeta = await fetchHubMetadata();
const matrix = await loadCompatibilityMatrix();

const result = await validateCompatibility(
  localMeta.version!,
  hubMeta.version,
  matrix
);

if (!result.compatible) {
  console.log('Cannot sync:');
  for (const change of result.breakingChanges) {
    console.log(`  - ${change.type}: ${change.name}`);
    console.log(`    Migration: ${change.migration}`);
  }
  if (result.migrationRequired) {
    console.log('\nRun migration first or use --force to override');
  }
  process.exit(1);
}

console.log('Compatible. Proceeding with sync...');
```
