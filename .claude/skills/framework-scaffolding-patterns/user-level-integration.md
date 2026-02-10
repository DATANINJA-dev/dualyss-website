# User-Level Integration Patterns

**Context**: Framework scaffolding must consider user's global Claude configuration at `~/.claude` (Windows: `%USERPROFILE%\.claude`) as a source for skills, agents, commands, and MCPs.

**Principle**: Intelligent merge - detect user-level components, classify as personal/reusable/conflicting, offer integration options during installation.

---

## User-Level Discovery

### Detection Locations

| OS | User-Level Path | Framework Installation Path |
|----|-----------------|----------------------------|
| Windows | `C:\Users\<user>\.claude\` | `<project>\.claude\` |
| macOS/Linux | `~/.claude/` | `<project>/.claude/` |

### Component Inventory

```yaml
user_level_inventory:
  location: "${USER_PROFILE}/.claude"
  components:
    commands:
      - name: "personal-commit.md"
        classification: "personal"
        reason: "User-specific commit message template"
      - name: "work-template.md"
        classification: "reusable"
        reason: "Company-wide template, could apply to project"
      - name: "commit.md"
        classification: "framework_overlap"
        reason: "Conflicts with framework commit.md"

    agents:
      - name: "custom-reviewer.md"
        classification: "personal"
        reason: "Tailored to user's review style"
      - name: "company-compliance.md"
        classification: "reusable"
        reason: "Company-wide compliance checks"

    skills:
      - name: "team-conventions/"
        classification: "reusable"
        reason: "Team-specific patterns applicable across projects"
      - name: "personal-shortcuts/"
        classification: "personal"
        reason: "User-specific productivity tools"

    mcps:
      - server: "internal-api"
        classification: "reusable"
        reason: "Company API available to all projects"
      - server: "personal-kb"
        classification: "personal"
        reason: "User's personal knowledge base"
```

---

## Classification Algorithm

### Decision Tree

```
For each user-level component:
  1. Check name collision with framework
     → If YES: mark as "framework_overlap"

  2. Analyze content/purpose
     → If user-specific keywords (personal, my, custom): "personal"
     → If org keywords (company, team, work): "reusable"
     → Default: "reusable" (conservative)

  3. Check portability
     → If hardcoded user paths: "personal"
     → If environment-agnostic: "reusable"
```

### Keyword Patterns

| Classification | Keywords | File Patterns |
|----------------|----------|---------------|
| **Personal** | personal, my, custom, private, user-specific | `my-*.md`, `personal-*.md` |
| **Reusable** | company, team, org, work, shared | `company-*.md`, `team-*.md` |
| **Framework Overlap** | (name matches framework component) | `commit.md`, `refine.md` |

### Content Analysis

```javascript
function classifyComponent(component) {
  // Read frontmatter if present
  const frontmatter = parseFrontmatter(component.content);

  if (frontmatter.scope === "personal") return "personal";
  if (frontmatter.scope === "team" || frontmatter.scope === "organization") return "reusable";

  // Analyze content for hardcoded paths
  if (containsUserPaths(component.content)) return "personal";

  // Check name patterns
  if (component.name.startsWith("my-") || component.name.includes("personal")) return "personal";
  if (component.name.startsWith("company-") || component.name.startsWith("team-")) return "reusable";

  // Default: reusable (conservative - ask user during install)
  return "reusable";
}
```

---

## Permission Models

### Three Options

| Model | Mechanism | Pros | Cons | Use Case |
|-------|-----------|------|------|----------|
| **Copy** | Duplicate file to project `.claude/` | Independent, portable | Diverges over time, duplicates | Skills that need project-specific tweaks |
| **Symlink** | Symbolic link to user-level file | Shared updates, no duplication | Breaks on user-level deletion | Stable company-wide patterns |
| **Reference** | Path-based reference in config | Minimal footprint | Fragile (path-dependent) | Temporary development tools |

### Default Recommendations

| Component Type | Recommended Model | Rationale |
|----------------|-------------------|-----------|
| Skills | Copy | Projects often need customization |
| Agents | Copy | Project-specific agent configs |
| Commands | Symlink | Commands rarely need project variants |
| MCPs | Reference | MCPs configured per-project in .mcp.json |

### Implementation

```yaml
# framework-scaffolding-config.yaml
user_level_integration:
  default_permission_model: "prompt"  # prompt, copy, symlink, skip

  overrides:
    commands: "symlink"  # Commands shared across projects
    skills: "copy"       # Skills need project customization
    agents: "copy"       # Agents need project-specific configs
    mcps: "reference"    # MCPs handled via .mcp.json merge

  conflict_resolution:
    framework_vs_user: "framework_wins"  # Framework has precedence
    user_vs_project: "user_wins"         # User overrides project defaults
```

---

## Permission Model Execution Patterns

### Copy Implementation

Recursive copy for skills (directories), single file copy for commands/agents/hooks:

```javascript
/**
 * Copy a user-level component to the project
 * @param {string} source - Absolute path to user-level component
 * @param {string} destination - Path relative to project .claude/
 * @param {string} componentType - skill | command | agent | hook
 * @returns {CopyResult} - Result with file count and any errors
 */
async function copyComponent(source, destination, componentType) {
  const result = {
    method: 'copy',
    source,
    destination,
    timestamp: new Date().toISOString(),
    files_copied: 0,
    errors: []
  };

  try {
    // Skills are directories, need recursive copy
    if (componentType === 'skill') {
      await fs.cp(source, destination, {
        recursive: true,
        preserveTimestamps: true
      });
      // Count files recursively
      result.files_copied = await countFilesRecursive(destination);
    }
    // Commands, agents, hooks are single files
    else {
      await fs.copyFile(source, destination);
      result.files_copied = 1;
    }
  } catch (err) {
    result.errors.push({
      code: 'E120',
      message: `Copy failed: ${err.message}`,
      path: source
    });
    throw new IntegrationError('E120', `Failed to copy ${source}: ${err.message}`);
  }

  return result;
}
```

### Symlink Implementation (Cross-Platform)

Windows symlinks require special handling - use junctions for directories (no admin required):

```javascript
/**
 * Create a symbolic link to a user-level component
 * @param {string} source - Absolute path to user-level component
 * @param {string} destination - Path relative to project .claude/
 * @param {string} platform - 'win32' | 'darwin' | 'linux'
 * @returns {SymlinkResult} - Result with symlink type and fallback info
 */
async function symlinkComponent(source, destination, platform) {
  const result = {
    method: 'symlink',
    source,
    destination,
    timestamp: new Date().toISOString(),
    symlink_type: null,
    fallback_used: false
  };

  const isDir = await isDirectory(source);

  try {
    if (platform === 'win32') {
      // Windows: Use junction for directories (no admin needed)
      if (isDir) {
        result.symlink_type = 'junction';
        await fs.symlink(source, destination, 'junction');
      } else {
        // File symlinks require admin or Developer Mode
        result.symlink_type = 'file';
        await fs.symlink(source, destination, 'file');
      }
    } else {
      // Unix: Standard symlink
      result.symlink_type = 'symlink';
      await fs.symlink(source, destination);
    }
  } catch (err) {
    if (err.code === 'EPERM' && platform === 'win32') {
      // Windows permission error - fall back to copy with warning
      console.warn(`[WARNING] E121: Symlink failed (EPERM). Falling back to copy.`);
      console.warn(`         Enable Developer Mode or run as admin for symlinks.`);

      result.fallback_used = true;
      result.fallback_reason = 'EPERM - Developer Mode not enabled';

      // Fall back to copy
      const copyResult = await copyComponent(source, destination,
        isDir ? 'skill' : 'command');
      return {
        ...result,
        method: 'copy',  // Changed from symlink to copy
        original_method: 'symlink',
        files_copied: copyResult.files_copied
      };
    }

    throw new IntegrationError('E122', `Symlink failed: ${err.message}`);
  }

  return result;
}
```

### Reference Implementation (MCPs)

MCPs use reference model - path stored in `.mcp.json` pointing to user-level location:

```javascript
/**
 * Create a reference entry for an MCP server
 * @param {Object} mcpConfig - The MCP server configuration from user-level
 * @param {string} serverName - Name of the MCP server
 * @param {string} userLevelPath - Path to user's .claude directory
 * @returns {ReferenceResult} - Result with reference details
 */
function createMcpReference(mcpConfig, serverName, userLevelPath) {
  // Expand any ~ to full user path
  const expandedConfig = expandPaths(mcpConfig, userLevelPath);

  // Add metadata markers for tracking
  return {
    ...expandedConfig,
    _source: 'user-level-reference',
    _original_path: `~/.claude/`,
    _integrated_at: new Date().toISOString()
  };
}

// Example output in .mcp.json:
// {
//   "mcpServers": {
//     "company-api": {
//       "command": "npx",
//       "args": ["-y", "@company/mcp-api"],
//       "_source": "user-level-reference",
//       "_original_path": "~/.claude/",
//       "_integrated_at": "2026-01-11T15:30:10Z"
//     }
//   }
// }
```

### Cross-Platform Symlink Handling

```
Symlink Strategy by Platform:

Windows:
  ├─ Directory → junction (no admin needed)
  │   └─ On EPERM: fall back to copy + warn
  └─ File → symlink (needs Developer Mode)
      └─ On EPERM: fall back to copy + warn

macOS/Linux:
  ├─ Directory → symlink
  └─ File → symlink
      └─ Both work without elevation

Fallback Detection Pattern:
  1. Attempt symlink
  2. Catch EPERM error
  3. Log warning with E121 code
  4. Execute copy instead
  5. Record in manifest.symlink_fallbacks[]
```

---

## Integration Strategies

### Strategy A: Interactive (Recommended for Standard installation)

```
During scaffolding:
  1. Detect user-level components
  2. Classify each component
  3. Present options:

     ## User-Level Components Found

     | Component | Type | Classification | Recommendation |
     |-----------|------|----------------|----------------|
     | team-conventions | skill | reusable | Copy to project |
     | personal-shortcuts | skill | personal | Skip |
     | company-api | MCP | reusable | Include in .mcp.json |
     | commit.md | command | overlap | Skip (framework has commit) |

     Select components to include:
     [x] team-conventions (copy)
     [ ] personal-shortcuts
     [x] company-api (reference)
     [ ] commit.md

  4. Apply user selections
  5. Generate integration manifest
```

### Strategy B: Automatic (for Full installation)

```
During scaffolding:
  1. Detect user-level components
  2. Classify each component
  3. Auto-include all "reusable" components
  4. Skip "personal" and "framework_overlap"
  5. Log included components
  6. Generate integration manifest
```

### Strategy C: Minimal (for Minimal installation)

```
During scaffolding:
  1. Skip user-level detection entirely
  2. Install framework only
  3. User can manually add user-level components later
```

---

## Three-Level MCP Merge

### Merge Order

```
Priority (highest to lowest):
  1. Framework (.mcp.base.json) - Framework-required MCPs
  2. User-level (~/.claude/.mcp.json) - User's global MCPs
  3. Project-local (.mcp.local.json) - Project-specific overrides

Merge algorithm:
  base = load_framework_mcps()
  user = load_user_level_mcps()
  local = load_project_local_mcps()

  merged = deep_merge(base, user, local)

  # Conflict resolution
  for server in merged.servers:
    if duplicate_detected(server):
      if server.source == "local":
        keep(server)  # Local wins
      elif server.source == "user":
        keep(server)  # User wins over framework
      else:
        keep(server)  # Framework default
```

### Example

```json
// ~/.claude/.mcp.json (user-level)
{
  "mcpServers": {
    "company-api": {
      "command": "npx",
      "args": ["-y", "@company/mcp-api"]
    },
    "personal-kb": {
      "command": "python",
      "args": ["~/scripts/kb-mcp.py"]
    }
  }
}

// .mcp.base.json (framework)
{
  "mcpServers": {
    "serena": { /* ... */ },
    "github": { /* ... */ }
  }
}

// .mcp.local.json (project-specific)
{
  "mcpServers": {
    "project-db": {
      "command": "node",
      "args": ["scripts/db-mcp.js"]
    }
  }
}

// .mcp.json (generated merged result)
{
  "mcpServers": {
    "serena": { /* from framework */ },
    "github": { /* from framework */ },
    "company-api": { /* from user-level */ },
    "personal-kb": { /* from user-level */ },
    "project-db": { /* from project-local */ }
  }
}
```

---

## Conflict Resolution

### Conflict Types

| Conflict Type | Example | Resolution Strategy |
|---------------|---------|---------------------|
| **Name Collision** | User has `commit.md`, framework has `commit.md` | Framework wins, offer to rename user's as `user-commit.md` |
| **Incompatible Versions** | User skill v1, framework needs v2 | Prompt user: upgrade user-level or skip |
| **Path Dependency** | User component references `~/scripts/` | Warn: "Personal paths detected, copy recommended" |
| **MCP Duplicate** | User and framework both provide `github` MCP | Local > User > Framework priority |

### Resolution UI

```yaml
# Presented during scaffolding
conflicts_detected:
  - type: "name_collision"
    component: "commands/commit.md"
    user_path: "~/.claude/commands/commit.md"
    framework_path: "framework/commands/commit.md"
    options:
      - label: "Use framework (Recommended)"
        action: "skip_user_level"
      - label: "Rename user's as user-commit.md"
        action: "rename_and_copy"
      - label: "Use user's, skip framework"
        action: "user_override"

  - type: "path_dependency"
    component: "skills/personal-shortcuts/SKILL.md"
    issue: "References ~/scripts/personal-tool.py"
    recommendation: "Skip or copy with manual path update"
    options:
      - label: "Skip (Recommended)"
        action: "skip"
      - label: "Copy and fix paths manually"
        action: "copy_with_warning"
```

---

## Integration Manifest

### Purpose

Track which user-level components were integrated during installation for future reference and updates.

### Full Schema Definition (v1.0.0)

```yaml
# .claude/.user-level-integration-manifest.yaml
# Generated by /sync-integrate-user or /sync-scaffold with --user-level
# Git-ignored - project-specific tracking only

schema_version: "1.0.0"

integration_metadata:
  timestamp: "2026-01-11T15:30:00Z"
  user_level_path: "C:\\Users\\user\\.claude"
  installation_level: "standard"    # minimal | standard | full
  framework_version: "0.38.0"
  generator: "sync-scaffold"        # sync-scaffold | sync-integrate-user

integrated_components:
  # Copied components - files duplicated to project
  - name: "team-conventions"
    type: "skill"                   # command | agent | skill | mcp
    source: "~/.claude/skills/team-conventions"
    destination: ".claude/skills/team-conventions"
    method: "copy"                  # copy | symlink | reference
    classification: "reusable"      # personal | reusable | framework_overlap
    timestamp: "2026-01-11T15:30:05Z"
    files_copied: 3                 # Only for copy method

  # Symlinked components - linked to user-level
  - name: "company-template"
    type: "command"
    source: "~/.claude/commands/company-template.md"
    destination: ".claude/commands/company-template.md"
    method: "symlink"
    symlink_type: "junction"        # symlink | junction (Windows dirs)
    classification: "reusable"
    timestamp: "2026-01-11T15:30:07Z"

  # Referenced components - MCPs with path references
  - name: "company-api"
    type: "mcp"
    source: "user-level"
    method: "reference"
    included_in: ".mcp.json"
    server_name: "company-api"
    timestamp: "2026-01-11T15:30:10Z"

skipped_components:
  # Components not integrated
  - name: "personal-shortcuts"
    type: "skill"
    reason: "personal"              # personal | framework_overlap | user_skipped
  - name: "commit"
    type: "command"
    reason: "framework_overlap"
    framework_path: ".claude/commands/commit.md"

conflicts_resolved:
  # Conflicts that were resolved during integration
  - component: "review.md"
    type: "command"
    conflict_type: "target_overlap" # framework_overlap | target_overlap | both_overlap
    resolution: "renamed"           # renamed | override | skipped
    original_name: "review.md"
    final_name: "user-review.md"
    timestamp: "2026-01-11T15:30:12Z"

symlink_fallbacks:
  # Windows symlink permission issues - fell back to copy
  - component: "shared-config"
    type: "skill"
    requested_method: "symlink"
    actual_method: "copy"
    reason: "EPERM - Developer Mode not enabled"
    timestamp: "2026-01-11T15:30:15Z"

summary:
  total_selected: 5       # User chose to integrate these
  total_integrated: 3     # Successfully integrated
  copied: 1               # Number using copy method
  symlinked: 1            # Number using symlink method
  referenced: 1           # Number using reference method
  skipped: 2              # Skipped (personal/overlap/user choice)
  conflicts_resolved: 1   # Conflicts that needed resolution
  symlink_fallbacks: 1    # Symlinks that fell back to copy
```

### Schema Notes

| Field | Required | Description |
|-------|----------|-------------|
| `schema_version` | Yes | For future migration compatibility |
| `integration_metadata` | Yes | Context of when/how integration occurred |
| `integrated_components` | Yes | Array of successfully integrated items |
| `skipped_components` | No | Array of intentionally skipped items |
| `conflicts_resolved` | No | Array of conflicts and their resolutions |
| `symlink_fallbacks` | No | Windows-specific fallback tracking |
| `summary` | Yes | Counts for quick status check |

### Manifest Location

- **Path**: `.claude/.user-level-integration-manifest.yaml`
- **Git Status**: Git-ignored (project-specific, not shared)
- **Created By**: `/sync-scaffold --user-level` or `/sync-integrate-user`
- **Updated By**: Regenerated on each integration run

---

## Error Codes (E120-E125)

User-level integration errors use the E12x range:

| Code | Severity | Message Template | Exit |
|------|----------|------------------|------|
| E120 | ERROR | Copy failed: {details} | 1 |
| E121 | WARNING | Symlink failed (EPERM). Falling back to copy. | 0 |
| E122 | ERROR | Symlink failed: {details} | 1 |
| E123 | ERROR | Conflict unresolved: {component} has {conflict_type} | 1 |
| E124 | WARNING | Source not found: {path}. Skipping component. | 0 |
| E125 | ERROR | Manifest write failed: {details} | 1 |

### Error Handling Patterns

```javascript
// E120 - Copy failure
if (err.code === 'ENOENT') {
  throw new IntegrationError('E120', `Copy failed: Source not found: ${source}`);
}
if (err.code === 'EACCES') {
  throw new IntegrationError('E120', `Copy failed: Permission denied: ${destination}`);
}

// E121 - Symlink fallback (warning, not error)
if (err.code === 'EPERM' && platform === 'win32') {
  console.warn(`[WARNING] E121: Symlink failed (EPERM). Falling back to copy.`);
  // Continue with copy...
}

// E122 - Symlink failure (non-EPERM)
throw new IntegrationError('E122', `Symlink failed: ${err.message}`);

// E123 - Unresolved conflict
if (conflict && !resolution) {
  throw new IntegrationError('E123',
    `Conflict unresolved: ${component.name} has ${conflict.type}`);
}

// E124 - Source not found (warning, skip component)
if (!await exists(source)) {
  console.warn(`[WARNING] E124: Source not found: ${source}. Skipping.`);
  manifest.skipped.push({ name, reason: 'source_not_found' });
  continue;
}

// E125 - Manifest write failure
try {
  await writeManifest(manifest);
} catch (err) {
  throw new IntegrationError('E125', `Manifest write failed: ${err.message}`);
}
```

### Integration with Error Handling Skill

These error codes should be added to `.claude/skills/error-handling/error-codes.md` in the E1XX (File System) range.

---

## Discovery Questions to Resolve

Before implementing, these questions should be answered:

1. **Default Permission Model**: Should skills be copied or symlinked by default?
   - Recommendation: Copy (allows project-specific tweaks)

2. **Hooks**: Should user-level hooks be integrated?
   - Recommendation: Skip (hooks are often environment-specific)

3. **Settings**: Should user-level `settings.local.json` be merged?
   - Recommendation: Skip (settings are user-specific, not project-specific)

4. **Portability**: Should user-level components be sync-able to hub via `/sync-push`?
   - Recommendation: No - user-level components stay local, only framework components sync

5. **Updates**: When framework updates, what happens to copied user-level components?
   - Recommendation: Leave unchanged (user owns copied components)

6. **Cleanup**: Should uninstall remove integrated user-level components?
   - Recommendation: Preserve (user may have customized them)

---

## Task Integration

### Expansion of TASK-091 (Context Analyzer)

**Original Scope**: Analyze target project for existing .claude/, tech stack, MCPs

**New Scope**: Also analyze user-level configuration

**Implementation**:

1. **Phase 1**: Detect user-level .claude/ existence
2. **Phase 2**: Inventory user-level components
3. **Phase 3**: Classify components (personal/reusable/overlap)
4. **Phase 4**: Merge with target context
5. **Output**: Combined context object with integration recommendations

### New Task: User-Level Component Classifier

**Purpose**: Implement classification algorithm

**Scope**:
- Keyword pattern matching
- Frontmatter parsing
- Path dependency detection
- Conflict detection
- Output classification report

### Expansion of TASK-089 (MCP Merge)

**Original Scope**: Merge .mcp.base.json + .mcp.local.json

**New Scope**: Three-level merge (user + base + local)

**Implementation**:
- Add user-level .mcp.json detection
- Implement priority-based merge
- Handle server name collisions
- Generate .mcp.json with all three sources

### Expansion of TASK-093 (Migration Strategies)

**Original Scope**: Migrate from existing project .claude/

**New Scope**: Also handle user-level component migration

**Implementation**:
- Add Strategy D: User-Level Integration
- Interactive prompts for component selection
- Permission model selection per component
- Integration manifest generation

---

## Reference Architecture

```
Installation Flow with User-Level Integration:

1. Pre-Install Context Detection
   ├─ Detect target project .claude/ (existing)
   ├─ Detect user-level ~/.claude/ (NEW)
   ├─ Classify user-level components (NEW)
   └─ Merge contexts

2. Scaffolding Planning
   ├─ Determine installation level (minimal/standard/full)
   ├─ Select integration strategy based on level (NEW)
   └─ Generate scaffolding plan

3. Conflict Detection
   ├─ Framework vs Target collisions
   ├─ Framework vs User-level collisions (NEW)
   └─ Generate conflict resolution plan

4. Interactive Prompts (Standard/Full only)
   ├─ Present user-level component options (NEW)
   ├─ Select permission model per component (NEW)
   └─ Resolve conflicts

5. Installation Execution
   ├─ Copy framework files
   ├─ Integrate user-level components (NEW)
   ├─ Merge MCP configs (three-level) (NEW)
   └─ Generate integration manifest (NEW)

6. Post-Install Verification
   ├─ Validate .mcp.json merge
   ├─ Test symlinks (if used)
   └─ Generate installation report
```

---

## Testing Checklist

- [ ] User-level .claude/ detected correctly on Windows/macOS/Linux
- [ ] Components classified accurately (personal/reusable/overlap)
- [ ] Copy permission model creates independent files
- [ ] Symlink permission model creates valid links
- [ ] Three-level MCP merge produces correct .mcp.json
- [ ] Conflict resolution UI presents clear options
- [ ] Integration manifest tracks all integrated components
- [ ] Framework updates don't break user-level integrations
- [ ] Uninstall preserves user-level components

---

## Future Enhancements

1. **Smart Classification**: ML-based classification instead of keyword patterns
2. **Update Sync**: Option to sync user-level component updates to project
3. **Multi-User**: Handle multiple user-level configs on shared machines
4. **Cloud Sync**: Sync user-level config across machines
5. **Component Registry**: Central registry of reusable user-level components

---

## Related Files

- `context-detection.md` - Needs user-level detection section
- `migration-strategies.md` - Needs user-level migration variants
- `scaffolding-templates.md` - Needs integration prompts
- `TASK-091.md` - Context analyzer expansion
- `TASK-089.md` - MCP merge expansion
- `TASK-093.md` - Migration strategy expansion
