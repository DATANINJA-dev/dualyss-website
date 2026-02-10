---
name: framework-scaffolding-patterns
description: |
  Provides patterns for scaffolding framework installations in target projects.
  Auto-activates when handling context detection, scaffolding generation,
  or migration from existing Claude Code setups.

  Type: passive (reference patterns for scaffolding operations)
---

# Framework Scaffolding Patterns Skill

This skill provides foundational patterns for installing the simon_tools framework in target projects. It covers context detection, structure generation, and migration strategies for existing Claude Code setups.

## When This Skill Activates

- Implementing target project context detection or analysis
- Generating framework directory structure in new projects
- Migrating existing Claude Code setups to framework structure
- **Integrating user-level Claude configuration into project installation**
- **Detecting and classifying user's global ~/.claude/ components**
- User mentions "scaffolding", "install framework", "project setup", "user-level integration"
- Working on EPIC-010 Configuration & Installation tasks (TASK-091, TASK-092, TASK-093)
- Implementing sync commands that initialize framework in target projects

## Core Principles

### 1. Context-Aware Installation

Analyze target project AND user-level configuration before scaffolding:

```
Rule: ALWAYS detect existing setup before scaffolding
Inputs:
  - Target: .claude/ existence, tech stack, MCP servers, existing commands
  - User-level: ~/.claude/ components, personal skills, user MCPs
Output: Combined TargetContext + UserLevelContext guiding installation
```

### 2. Non-Destructive Operations

Never overwrite or delete user's existing work without explicit consent:

```
Rule: Preserve existing files, rename on collision
Pattern: existing-command.md → local-existing-command.md
Exception: Only user-initiated --force flag allows overwrite
```

### 3. Tech Stack Detection

Identify project technology to customize installation:

```
Detection signals:
- package.json → Node.js/TypeScript
- Cargo.toml → Rust
- go.mod → Go
- pyproject.toml/requirements.txt → Python
- composer.json → PHP
```

### 4. Collision Avoidance

Handle naming conflicts between framework, target, and user-level files:

```
Collision types:
- CRITICAL: Exact name match (commit.md exists in project or user-level)
- WARNING: Similar name (my-commit.md vs commit.md)
- OK: No overlap

Resolution priority:
- Framework > User-level > Project (framework wins in conflicts)
- Offer to rename user-level as "user-commit.md"
- Prefix project-existing as "local-commit.md"
```

### 5. Reversible Installation

Always enable rollback to pre-installation state:

```
Before installation:
1. Create backup: .claude-backup-[timestamp]/
2. Record pre-state in backup/manifest.json
3. Proceed with scaffolding

Rollback: Restore from backup, remove framework files
```

### 6. Progressive Enhancement

Install only what's needed, enable incremental adoption:

```
Installation levels:
- Minimal: CLAUDE.md + backlog/ only
- Standard: + .claude/commands/ core set
- Full: Complete framework with all components
```

## Quick Reference

| Operation | Pattern | When to Use |
|-----------|---------|-------------|
| Detect context | Analyze .claude/, package.json, .mcp.json | Before any scaffolding |
| Classify files | Framework vs custom heuristics | Determine migration strategy |
| Generate structure | Template-based directory creation | Fresh installations |
| Migrate existing | Preserve + rename + merge | Existing .claude/ setups |
| Validate output | Structure + content checks | After scaffolding complete |

## Supporting Files

- `context-detection.md` - Target project analysis patterns and TargetContext interface
- `scaffolding-templates.md` - Directory structure templates and generation patterns
- `migration-strategies.md` - Four migration strategies (A-D) with step-by-step guides
- **`user-level-integration.md` - User-level configuration detection, classification, and integration patterns**

## Integration Points

### EPIC-010 Tasks Using This Skill

| Task | Usage |
|------|-------|
| TASK-091 | Implements context analyzer using `context-detection.md` patterns |
| TASK-092 | Implements scaffolding generator using `scaffolding-templates.md` |
| TASK-093 | Implements migration command using `migration-strategies.md` |

### Related Skills

- `config-merging-patterns` (TASK-086) - Used for .mcp.json merge during migration
- `git-sync-patterns` (EPIC-009) - After scaffolding, sync commands become available
- `version-compatibility-management` (TASK-073) - Version validation during installation

## Agent Integration Patterns

Agents consume this skill by referencing its supporting files within their execution steps. This section shows patterns for correct integration.

### Pattern 1: Inline Reference in Agent Steps

Use the `Reference:` pattern to point agents to specific supporting files:

```markdown
### Phase 1: Context Detection

1. **Analyze target project**:
   - Reference: `framework-scaffolding-patterns/context-detection.md`
   - Extract TargetContext using documented interface
   - Check for existing .claude/ directory
```

**Example**: See `.claude/agents/task-skill-discovery.md` (lines 34-36) for this pattern in use.

### Pattern 2: Agent Frontmatter Structure

Agents that consume scaffolding patterns should declare appropriate tools:

```yaml
---
name: Context Analysis Agent
description: |
  Analyzes target project for framework installation.
  References framework-scaffolding-patterns skill.
model: haiku
tools:
  - Read      # Read context-detection.md patterns
  - Glob      # Scan for existing .claude/ files
  - Grep      # Search for framework markers
  - Bash      # Execute tech stack detection
inputs_required:
  - target_path: "Path to target project root"
  - installation_level: "minimal|standard|full"
---
```

**Example**: See `.claude/agents/develop-context-analyzer.md` for frontmatter structure patterns.

### Pattern 3: Context Extraction in Agent Steps

Use Glob/Grep to find and read skill patterns:

```markdown
### Phase 2: Load Patterns

1. **Locate skill patterns**:
   ```
   Glob: .claude/skills/framework-scaffolding-patterns/*.md
   ```

2. **Extract relevant interface**:
   - Read `context-detection.md` for TargetContext schema
   - Read `scaffolding-templates.md` for installation levels
   - Read `migration-strategies.md` for strategy selection

3. **Apply patterns**:
   ```yaml
   target_context:
     has_existing_claude: [result of detection]
     tech_stack_detected: [from package.json/etc.]
     migration_strategy: [A|B|C|D based on patterns]
   ```
```

**Example**: See `.claude/agents/develop-context-analyzer.md` (lines 68-73) for Glob pattern extraction.

### Supporting File Reference Table

| Use Case | Supporting File | Example Agent |
|----------|-----------------|---------------|
| Target project analysis | `context-detection.md` | develop-context-analyzer |
| Directory structure generation | `scaffolding-templates.md` | (used by /sync-scaffold) |
| Existing setup migration | `migration-strategies.md` | (used by /sync-migrate) |
| User-level integration | `user-level-integration.md` | (used by /sync-scaffold) |

### Command Tool Path Comments

Commands referencing this skill should include a tool path comment:

```markdown
<!-- Tool Path Constraints:
Skill Reference: .claude/skills/framework-scaffolding-patterns/context-detection.md
-->
```

**Example**: See `.claude/commands/sync-analyze.md` for this pattern.

## Constraints

- **Directory structure** - .claude/ must follow standard layout (commands/, agents/, skills/, hooks/)
- **Backup required** - Pre-installation backup mandatory unless --no-backup flag
- **Collision naming** - Renamed files use "local-" prefix (not "old-" or timestamps)
- **Validation step** - Post-scaffolding validation must pass before completion
- **Rollback capability** - Installation must be reversible for 7 days (backup retention)

## Sources

This skill synthesizes patterns from authoritative project scaffolding tools:

1. **Yeoman Generator Framework**
   - URL: https://yeoman.io/authoring/
   - Authority: Industry-standard scaffolding tool
   - Used for: Lifecycle patterns, template organization

2. **Copier Template Engine**
   - URL: https://copier.readthedocs.io/
   - Authority: Modern Python templating tool
   - Used for: Context detection, answers persistence

3. **create-react-app / create-next-app**
   - URL: https://create-react-app.dev/docs/getting-started
   - Authority: Official React/Next.js tooling
   - Used for: Zero-config patterns, smart defaults

4. **Cookiecutter**
   - URL: https://cookiecutter.readthedocs.io/
   - Authority: Popular template engine
   - Used for: Template variables, hook patterns
