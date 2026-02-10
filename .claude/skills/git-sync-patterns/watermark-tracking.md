# Watermark Tracking

Patterns for tracking sync state through watermarks to enable efficient delta detection and conflict identification.

## Overview

A sync watermark records the last-known-good sync point between hub and target project. This enables:
- **Delta detection**: What changed since last sync?
- **Conflict identification**: Did both sides modify the same files?
- **Safe updates**: Don't overwrite without knowing what's at risk

## Watermark Format

### Location

Watermarks are stored in `CLAUDE.md` within the meta comment block:

```yaml
<!-- simon_tools_meta
version: 0.28.0
last_sync: 2026-01-09T12:00:00Z
sync_watermark: abc123def456
-->
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | SemVer | Current framework version |
| `last_sync` | ISO 8601 | Timestamp of last successful sync |
| `sync_watermark` | SHA | Hub commit hash at time of sync |

### Extended Format (Full Tracking)

For comprehensive tracking, extend the watermark:

```yaml
<!-- simon_tools_meta
version: 0.28.0
last_sync: 2026-01-09T12:00:00Z
sync_watermark:
  hub_commit: abc123def456
  local_commit: 789xyz012345
  file_count: 42
  file_hashes:
    ".claude/commands/audit.md": "sha256:a1b2c3..."
    ".claude/agents/task-research.md": "sha256:d4e5f6..."
-->
```

### Extended Fields

| Field | Type | Description |
|-------|------|-------------|
| `hub_commit` | SHA | Last hub commit included in sync |
| `local_commit` | SHA | Local commit after last sync |
| `file_count` | Integer | Number of files synced |
| `file_hashes` | Map | Per-file SHA-256 hashes at sync time |

## Reading the Watermark

### Pattern

```bash
# Extract watermark from CLAUDE.md
grep -A 5 "simon_tools_meta" CLAUDE.md
```

### Programmatic Extraction

```javascript
// Extract watermark from CLAUDE.md content
function extractWatermark(claudeMdContent) {
  const metaMatch = claudeMdContent.match(
    /<!--\s*simon_tools_meta\s*([\s\S]*?)-->/
  );

  if (!metaMatch) return null;

  const yaml = metaMatch[1];
  // Parse YAML content
  return parseYaml(yaml);
}
```

```python
# Python equivalent
import re
import yaml

def extract_watermark(claude_md_content: str) -> dict | None:
    match = re.search(
        r'<!--\s*simon_tools_meta\s*([\s\S]*?)-->',
        claude_md_content
    )

    if not match:
        return None

    return yaml.safe_load(match.group(1))
```

## Updating the Watermark

### When to Update

Update watermark **only** after a fully successful sync operation:

| Operation | Update Watermark? |
|-----------|------------------|
| Successful `subtree pull` | Yes |
| Successful `subtree add` | Yes |
| Failed sync (conflicts) | No |
| Partial sync (some files) | No |
| `subtree push` | No (hub tracks this) |

### Pattern

```bash
# After successful pull, update watermark
HUB_COMMIT=$(git ls-remote simon_tools main | cut -f1)
LOCAL_COMMIT=$(git rev-parse HEAD)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Update CLAUDE.md with new watermark
sed -i "s/last_sync:.*/last_sync: $TIMESTAMP/" CLAUDE.md
sed -i "s/sync_watermark:.*/sync_watermark: $HUB_COMMIT/" CLAUDE.md
```

### Programmatic Update

```javascript
function updateWatermark(claudeMdContent, newWatermark) {
  const timestamp = new Date().toISOString();

  const watermarkYaml = `<!-- simon_tools_meta
version: ${newWatermark.version}
last_sync: ${timestamp}
sync_watermark: ${newWatermark.hubCommit}
-->`;

  // Replace existing meta block
  return claudeMdContent.replace(
    /<!--\s*simon_tools_meta[\s\S]*?-->/,
    watermarkYaml
  );
}
```

## Validating the Watermark

### Pre-Sync Validation

Before attempting a sync, validate the watermark:

```javascript
function validateWatermark(watermark) {
  const errors = [];

  // Required fields
  if (!watermark.version) {
    errors.push('Missing version');
  }
  if (!watermark.last_sync) {
    errors.push('Missing last_sync timestamp');
  }
  if (!watermark.sync_watermark) {
    errors.push('Missing sync_watermark commit');
  }

  // Format validation
  if (watermark.last_sync && !isValidISO8601(watermark.last_sync)) {
    errors.push('Invalid last_sync format (expected ISO 8601)');
  }
  if (watermark.sync_watermark && !/^[a-f0-9]{40}$/.test(watermark.sync_watermark)) {
    errors.push('Invalid sync_watermark format (expected 40-char SHA)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Stale Watermark Detection

A watermark is considered stale when:

```javascript
function isWatermarkStale(watermark, thresholdDays = 30) {
  const lastSync = new Date(watermark.last_sync);
  const now = new Date();
  const daysSinceSync = (now - lastSync) / (1000 * 60 * 60 * 24);

  return daysSinceSync > thresholdDays;
}
```

**Warning thresholds:**
- `> 7 days`: Suggest checking for updates
- `> 30 days`: Warn about potential drift
- `> 90 days`: Recommend fresh sync

## Computing File Hashes

### Pattern

For detailed tracking, compute SHA-256 hashes of all synced files:

```bash
# Compute hash for a single file
sha256sum .claude/commands/audit.md

# Compute hashes for all .claude files
find .claude -type f -exec sha256sum {} \; > .claude_hashes.txt
```

### Programmatic Hashing

```javascript
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

function computeFileHashes(directory) {
  const files = glob.sync(`${directory}/**/*`, { nodir: true });
  const hashes = {};

  for (const file of files) {
    const content = fs.readFileSync(file);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    const relativePath = path.relative('.', file);
    hashes[relativePath] = `sha256:${hash}`;
  }

  return hashes;
}
```

## Missing Watermark Handling

### First-Time Sync

If no watermark exists, treat as initial installation:

```javascript
function handleMissingWatermark() {
  return {
    action: 'initialize',
    message: 'No watermark found. Treating as initial installation.',
    recommendation: 'Run subtree add to install framework'
  };
}
```

### Corrupted Watermark

If watermark exists but is invalid:

```javascript
function handleCorruptedWatermark(validationErrors) {
  return {
    action: 'warn',
    message: `Watermark corrupted: ${validationErrors.join(', ')}`,
    recommendation: 'Manually verify sync state, then update watermark'
  };
}
```

## Edge Cases

| Situation | Handling |
|-----------|----------|
| No watermark in CLAUDE.md | Treat as first-time install |
| Watermark but no `.claude/` | Watermark orphaned, suggest re-add |
| Multiple meta blocks | Use first occurrence, warn |
| Old watermark format | Migrate to new format |
| Hub commit no longer exists | Force-refresh required |

---

## Source

Watermark tracking pattern inspired by:
- Git bisect's good/bad commit tracking
- npm's package-lock.json integrity hashes
- [Git Subtree Basics Gist](https://gist.github.com/SKempin/b7857a6ff6bddb05717cc17a44091202) (sync state discussion)
