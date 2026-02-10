# Delta Detection Algorithm

Patterns for detecting file changes between sync operations using SHA-256 hash comparison and efficient mtime optimization.

## Overview

Delta detection identifies which files have been added, modified, deleted, or remain unchanged since the last sync. This enables:
- **Efficient sync**: Only transfer changed files
- **Scope preview**: Show user what will change before sync
- **Conflict detection**: Find files modified on both sides

## SyncDelta Interface

The output format for delta detection follows the EPIC-009 specification:

```typescript
interface SyncDelta {
  added: string[];      // Files in current but not in watermark
  modified: string[];   // Files with hash mismatch
  deleted: string[];    // Files in watermark but not in current
  unchanged: string[];  // Files with matching hash
}
```

### Example Output

```json
{
  "added": [
    "commands/new-feature.md",
    "agents/new-analyzer.md"
  ],
  "modified": [
    "commands/audit.md"
  ],
  "deleted": [
    "commands/deprecated.md"
  ],
  "unchanged": [
    "commands/help.md",
    "skills/tdd-workflow/SKILL.md"
  ]
}
```

## Watermark Snapshot Format

The watermark stores the last-known-good state for delta comparison:

### Location

Store in `.claude/.sync-state` (JSON format):

```json
{
  "version": "1.0.0",
  "last_sync": "2026-01-09T12:00:00Z",
  "files": {
    "commands/help.md": {
      "hash": "sha256:a1b2c3d4e5f6...",
      "mtime": 1736424000,
      "size": 2048
    },
    "agents/task-research.md": {
      "hash": "sha256:7890abcdef01...",
      "mtime": 1736420000,
      "size": 4096
    }
  }
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | String | Schema version for future migrations |
| `last_sync` | ISO 8601 | Timestamp of last successful sync |
| `files` | Object | Map of relative paths to file metadata |
| `files[path].hash` | String | SHA-256 hash prefixed with `sha256:` |
| `files[path].mtime` | Integer | Unix timestamp (seconds since epoch) |
| `files[path].size` | Integer | File size in bytes |

## Core Algorithm

### Pseudocode

```
function computeDelta(directory, watermarkPath):
    # Initialize result
    delta = {
        added: [],
        modified: [],
        deleted: [],
        unchanged: []
    }

    # Step 1: Load watermark (or empty if first run)
    if fileExists(watermarkPath):
        watermark = readJSON(watermarkPath)
        knownFiles = watermark.files
    else:
        knownFiles = {}

    # Step 2: Scan current directory
    currentFiles = listFilesRecursively(directory)

    # Step 3: Track which watermark files we've seen
    seenPaths = Set()

    # Step 4: Compare current files against watermark
    for filePath in currentFiles:
        relativePath = getRelativePath(filePath, directory)
        seenPaths.add(relativePath)

        if relativePath not in knownFiles:
            # New file - not in previous watermark
            delta.added.append(relativePath)
        else:
            # Existing file - check if modified
            known = knownFiles[relativePath]
            current = getFileMetadata(filePath)

            if current.mtime == known.mtime:
                # mtime unchanged - assume unchanged (optimization)
                delta.unchanged.append(relativePath)
            else:
                # mtime changed - verify with hash
                currentHash = computeSHA256(filePath)
                if currentHash != known.hash:
                    delta.modified.append(relativePath)
                else:
                    # Hash same despite mtime change (touch, copy, etc.)
                    delta.unchanged.append(relativePath)

    # Step 5: Find deleted files
    for knownPath in knownFiles:
        if knownPath not in seenPaths:
            delta.deleted.append(knownPath)

    return delta
```

### Time Complexity

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Load watermark | O(1) | Single file read |
| List directory | O(n) | n = number of files |
| mtime check | O(1) | stat() system call |
| Hash computation | O(m) | m = file size in bytes |
| Overall (best) | O(n) | All mtimes unchanged |
| Overall (worst) | O(n × m) | All files need hashing |

## SHA-256 Hash Computation

### Cross-Platform Commands

```bash
# Linux (GNU coreutils)
sha256sum .claude/commands/help.md | cut -d' ' -f1

# macOS (BSD)
shasum -a 256 .claude/commands/help.md | cut -d' ' -f1

# Windows (PowerShell)
(Get-FileHash -Algorithm SHA256 .claude/commands/help.md).Hash.ToLower()

# Windows (cmd with certutil)
certutil -hashfile .claude\commands\help.md SHA256 | findstr /v "hash"
```

### Shell Function

```bash
# Cross-platform hash function
compute_sha256() {
    local file="$1"
    if command -v sha256sum &> /dev/null; then
        sha256sum "$file" | cut -d' ' -f1
    elif command -v shasum &> /dev/null; then
        shasum -a 256 "$file" | cut -d' ' -f1
    else
        echo "ERROR: No SHA-256 tool available" >&2
        return 1
    fi
}
```

### JavaScript Implementation

```javascript
const crypto = require('crypto');
const fs = require('fs');

function computeSHA256(filePath) {
  const content = fs.readFileSync(filePath);
  return 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');
}

// Streaming version for large files
function computeSHA256Stream(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve('sha256:' + hash.digest('hex')));
    stream.on('error', reject);
  });
}
```

### Python Implementation

```python
import hashlib
from pathlib import Path

def compute_sha256(file_path: str) -> str:
    """Compute SHA-256 hash of a file."""
    sha256 = hashlib.sha256()

    with open(file_path, 'rb') as f:
        # Read in chunks for memory efficiency
        for chunk in iter(lambda: f.read(8192), b''):
            sha256.update(chunk)

    return f'sha256:{sha256.hexdigest()}'
```

## mtime Optimization

### Rationale

Hashing every file is expensive. The mtime (modification time) check provides a fast path:

| Check Type | Speed | Accuracy |
|------------|-------|----------|
| mtime only | ~1μs per file | 99.9% (can miss `touch`, copy) |
| hash only | ~1-100ms per file | 100% |
| mtime + hash fallback | ~1μs to ~100ms | 100% |

### Implementation Pattern

```javascript
function needsHashCheck(currentMtime, knownMtime) {
  // If mtime matches, skip hash (optimization)
  if (currentMtime === knownMtime) {
    return false;
  }

  // mtime changed - need to verify with hash
  return true;
}

function classifyFile(filePath, knownEntry) {
  const stats = fs.statSync(filePath);
  const currentMtime = Math.floor(stats.mtimeMs / 1000);

  if (!needsHashCheck(currentMtime, knownEntry.mtime)) {
    return 'unchanged';
  }

  const currentHash = computeSHA256(filePath);
  if (currentHash !== knownEntry.hash) {
    return 'modified';
  }

  // Hash same but mtime different (touch, copy, etc.)
  return 'unchanged';
}
```

### Edge Case: Clock Skew

If files appear modified due to clock differences:

```javascript
function normalizeTimestamp(timestamp, toleranceSeconds = 2) {
  // Allow small timestamp tolerance for filesystem precision
  return Math.floor(timestamp / toleranceSeconds) * toleranceSeconds;
}
```

## Complete Shell Implementation

### delta-detect.sh

```bash
#!/bin/bash
# Delta detection for .claude/ directory
# Usage: ./delta-detect.sh [directory] [watermark-file]

set -euo pipefail

DIRECTORY="${1:-.claude}"
WATERMARK="${2:-.claude/.sync-state}"

# Initialize arrays
declare -a ADDED=()
declare -a MODIFIED=()
declare -a DELETED=()
declare -a UNCHANGED=()

# Cross-platform SHA-256
compute_sha256() {
    local file="$1"
    if command -v sha256sum &> /dev/null; then
        sha256sum "$file" | cut -d' ' -f1
    elif command -v shasum &> /dev/null; then
        shasum -a 256 "$file" | cut -d' ' -f1
    else
        openssl dgst -sha256 "$file" | awk '{print $2}'
    fi
}

# Get file mtime (Unix timestamp)
get_mtime() {
    local file="$1"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f '%m' "$file"
    else
        stat -c '%Y' "$file"
    fi
}

# Load watermark JSON (requires jq)
load_watermark() {
    if [[ -f "$WATERMARK" ]]; then
        cat "$WATERMARK"
    else
        echo '{"version":"1.0.0","files":{}}'
    fi
}

# Main delta detection
main() {
    local watermark
    watermark=$(load_watermark)

    # Track seen files
    declare -A seen

    # Scan current files
    while IFS= read -r -d '' file; do
        local rel_path="${file#$DIRECTORY/}"
        seen["$rel_path"]=1

        # Check if file exists in watermark
        local known_hash known_mtime
        known_hash=$(echo "$watermark" | jq -r ".files[\"$rel_path\"].hash // empty")
        known_mtime=$(echo "$watermark" | jq -r ".files[\"$rel_path\"].mtime // empty")

        if [[ -z "$known_hash" ]]; then
            # New file
            ADDED+=("$rel_path")
        else
            # Check mtime first (optimization)
            local current_mtime
            current_mtime=$(get_mtime "$file")

            if [[ "$current_mtime" == "$known_mtime" ]]; then
                # mtime unchanged - assume unchanged
                UNCHANGED+=("$rel_path")
            else
                # mtime changed - verify hash
                local current_hash
                current_hash="sha256:$(compute_sha256 "$file")"

                if [[ "$current_hash" != "$known_hash" ]]; then
                    MODIFIED+=("$rel_path")
                else
                    UNCHANGED+=("$rel_path")
                fi
            fi
        fi
    done < <(find "$DIRECTORY" -type f -print0 2>/dev/null)

    # Find deleted files
    while IFS= read -r known_path; do
        if [[ -z "${seen[$known_path]:-}" ]]; then
            DELETED+=("$known_path")
        fi
    done < <(echo "$watermark" | jq -r '.files | keys[]')

    # Output as JSON
    printf '{\n'
    printf '  "added": %s,\n' "$(printf '%s\n' "${ADDED[@]:-}" | jq -R . | jq -s .)"
    printf '  "modified": %s,\n' "$(printf '%s\n' "${MODIFIED[@]:-}" | jq -R . | jq -s .)"
    printf '  "deleted": %s,\n' "$(printf '%s\n' "${DELETED[@]:-}" | jq -R . | jq -s .)"
    printf '  "unchanged": %s\n' "$(printf '%s\n' "${UNCHANGED[@]:-}" | jq -R . | jq -s .)"
    printf '}\n'
}

main "$@"
```

## JavaScript Implementation

### delta-detector.js

```javascript
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Compute SHA-256 hash of a file
 */
function computeHash(filePath) {
  const content = fs.readFileSync(filePath);
  return 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Get file metadata (mtime and size)
 */
function getFileMetadata(filePath) {
  const stats = fs.statSync(filePath);
  return {
    mtime: Math.floor(stats.mtimeMs / 1000),
    size: stats.size
  };
}

/**
 * Recursively list all files in a directory
 */
function listFiles(dir, baseDir = dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(path.relative(baseDir, fullPath).replace(/\\/g, '/'));
    }
  }

  return files;
}

/**
 * Load watermark from file
 */
function loadWatermark(watermarkPath) {
  if (!fs.existsSync(watermarkPath)) {
    return { version: '1.0.0', files: {} };
  }

  return JSON.parse(fs.readFileSync(watermarkPath, 'utf8'));
}

/**
 * Compute delta between current state and watermark
 * @param {string} directory - Directory to scan (e.g., '.claude')
 * @param {string} watermarkPath - Path to watermark file
 * @returns {SyncDelta} Delta result
 */
function computeDelta(directory, watermarkPath) {
  const delta = {
    added: [],
    modified: [],
    deleted: [],
    unchanged: []
  };

  // Load watermark
  const watermark = loadWatermark(watermarkPath);
  const knownFiles = watermark.files || {};

  // Track seen files
  const seen = new Set();

  // Scan current files
  const currentFiles = listFiles(directory);

  for (const relativePath of currentFiles) {
    seen.add(relativePath);
    const fullPath = path.join(directory, relativePath);

    if (!(relativePath in knownFiles)) {
      // New file
      delta.added.push(relativePath);
    } else {
      // Existing file - check for changes
      const known = knownFiles[relativePath];
      const current = getFileMetadata(fullPath);

      if (current.mtime === known.mtime) {
        // mtime unchanged - assume unchanged
        delta.unchanged.push(relativePath);
      } else {
        // mtime changed - verify with hash
        const currentHash = computeHash(fullPath);
        if (currentHash !== known.hash) {
          delta.modified.push(relativePath);
        } else {
          // Hash same despite mtime change
          delta.unchanged.push(relativePath);
        }
      }
    }
  }

  // Find deleted files
  for (const knownPath of Object.keys(knownFiles)) {
    if (!seen.has(knownPath)) {
      delta.deleted.push(knownPath);
    }
  }

  return delta;
}

/**
 * Save current state as new watermark
 */
function saveWatermark(directory, watermarkPath) {
  const files = {};

  for (const relativePath of listFiles(directory)) {
    const fullPath = path.join(directory, relativePath);
    const metadata = getFileMetadata(fullPath);

    files[relativePath] = {
      hash: computeHash(fullPath),
      mtime: metadata.mtime,
      size: metadata.size
    };
  }

  const watermark = {
    version: '1.0.0',
    last_sync: new Date().toISOString(),
    files
  };

  fs.writeFileSync(watermarkPath, JSON.stringify(watermark, null, 2));
  return watermark;
}

module.exports = { computeDelta, saveWatermark, computeHash };
```

## Edge Cases

### No Watermark (First Run)

When no watermark exists, treat all files as added:

```javascript
function handleNoWatermark(directory) {
  const files = listFiles(directory);
  return {
    added: files,
    modified: [],
    deleted: [],
    unchanged: []
  };
}
```

### Empty Directory

Return empty delta:

```javascript
{
  added: [],
  modified: [],
  deleted: [],
  unchanged: []
}
```

### Permission Denied

Skip inaccessible files with warning:

```javascript
function safeListFiles(dir) {
  const files = [];
  const errors = [];

  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      try {
        // ... process entry
      } catch (e) {
        if (e.code === 'EACCES') {
          errors.push({ path: entry.name, error: 'Permission denied' });
        } else {
          throw e;
        }
      }
    }
  } catch (e) {
    if (e.code === 'EACCES') {
      errors.push({ path: dir, error: 'Permission denied' });
    } else {
      throw e;
    }
  }

  return { files, errors };
}
```

### Binary Files

SHA-256 handles binary files natively - no special treatment needed:

```javascript
// Works for all file types: text, images, PDFs, etc.
const hash = computeHash('image.png');  // Returns valid hash
```

### Symlinks

By default, follow symlinks (resolve to actual content):

```javascript
// fs.readFileSync follows symlinks by default
// To detect symlinks explicitly:
function isSymlink(filePath) {
  return fs.lstatSync(filePath).isSymbolicLink();
}
```

### Unicode Filenames

Use UTF-8 encoding (Node.js/Python default):

```javascript
// Node.js handles Unicode filenames correctly
const files = fs.readdirSync('.claude');  // Returns Unicode strings
```

### Large Files (>10MB)

Use streaming hash for memory efficiency:

```javascript
async function computeHashStream(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve('sha256:' + hash.digest('hex')));
    stream.on('error', reject);
  });
}
```

## Performance Considerations

### Target Performance

For 100+ files in `.claude/`:
- **Best case** (all unchanged): < 100ms
- **Typical case** (10% changed): < 500ms
- **Worst case** (all changed): < 2s

### Optimization Strategies

1. **mtime check first**: Avoid hashing unchanged files
2. **Parallel hashing**: Hash multiple files concurrently
3. **Streaming**: Don't load large files into memory
4. **Incremental watermark**: Only update changed entries

### Parallel Hash Computation

```javascript
async function computeDeltaParallel(directory, watermarkPath, concurrency = 4) {
  // ... same setup ...

  // Parallel hash computation for files needing check
  const needsHash = filesToCheck.filter(f => f.mtimeChanged);

  const chunks = [];
  for (let i = 0; i < needsHash.length; i += concurrency) {
    chunks.push(needsHash.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map(async (file) => {
      file.hash = await computeHashStream(file.path);
    }));
  }

  // ... classify based on hash results ...
}
```

## Integration with TASK-077

This delta detection algorithm is consumed by TASK-077 (Sync Watermark) for:
- Updating watermark after successful sync
- Detecting conflicts before sync
- Reporting sync status to users

---

## Sources

- EPIC-009 Core Sync Engine specification
- [Node.js crypto module](https://nodejs.org/api/crypto.html)
- [Python hashlib](https://docs.python.org/3/library/hashlib.html)
- SHA-256 NIST standard (FIPS 180-4)
