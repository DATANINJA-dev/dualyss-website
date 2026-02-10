# TASK-087: Create framework-scaffolding-patterns Skill - Scope Analysis

## Executive Summary

TASK-087 creates a **passive documentation skill** for framework installation patterns. This is the foundation skill for EPIC-010 installation and scaffolding tasks (TASK-091, TASK-092, TASK-093). Unlike TASK-086 (config-merging-patterns), this skill focuses on **context detection**, **directory structure generation**, and **migration strategies** for existing Claude Code setups.

**Task Type**: Documentation skill (no code implementation)  
**Complexity**: Medium  
**Priority**: High (blocks TASK-091, TASK-092, TASK-093)  
**Dependencies**: None (foundation skill)  

---

## 1. Files to Create

### Summary Table

| File | Type | Est. Lines | Purpose |
|------|------|-----------|---------|
| `SKILL.md` | Documentation | 150-200 | Skill definition, activation triggers, core principles |
| `context-detection.md` | Reference patterns | 250-300 | Target project analysis, tech stack detection |
| `scaffolding-templates.md` | Reference patterns | 300-350 | Directory structure, template generation |
| `migration-strategies.md` | Reference patterns | 250-300 | Existing setup migration, conflict handling |
| **CLAUDE.md** | Project docs | 10-15 lines | Add skill to structure tree, add note to changelog |

**Total: ~5 files, ~1100-1200 lines of documentation**

### Directory Structure

```
.claude/skills/framework-scaffolding-patterns/
├── SKILL.md                    # Type: passive, activation triggers
├── context-detection.md        # Project analysis patterns
├── scaffolding-templates.md    # Structure generation templates
└── migration-strategies.md     # Migration and conflict handling
```

---

## 2. Content Structure for Each File

### 2.1 SKILL.md (150-200 lines)

**Purpose**: Skill frontmatter, overview, activation triggers, core principles

**Required Sections**:

1. **Frontmatter (5-8 lines)**
   ```yaml
   ---
   name: framework-scaffolding-patterns
   description: |
     Provides patterns for scaffolding framework installations in target projects.
     Auto-activates when detecting existing .claude/ setups, analyzing tech stacks,
     and implementing migration strategies for existing Claude Code users.
     
     Type: passive (reference patterns for scaffolding operations)
   ---
   ```

2. **Skill Overview** (20-30 lines)
   - One-paragraph summary
   - High-level problem statement
   - Solution overview

3. **When This Skill Activates** (8-12 lines)
   - Detecting existing .claude/ directories
   - Analyzing target project tech stacks
   - Implementing scaffolding generators
   - Planning migrations from old setups
   - User mentions "scaffolding", "installation", "migration"
   - Working on EPIC-010 Installation tasks

4. **Core Principles** (60-80 lines, 5-6 principles)
   - **Context-Aware Installation**: Adapt to existing project structure
   - **Non-Destructive Operations**: Never overwrite without explicit consent
   - **Tech Stack Detection**: Identify framework ecosystem (Node, Python, Rust, etc.)
   - **Collision Avoidance**: Detect name conflicts with existing commands
   - **Reversible Migration**: Preserve existing local work, enable rollback
   - **Progressive Enhancement**: Support adding to minimal or full setups

5. **Quick Reference Table** (25-35 lines)
   - Operation | Pattern | When to Use
   - Detect existing .claude/
   - Analyze tech stack
   - Find file collisions
   - Plan scaffolding structure
   - Plan migration from old setup

6. **Supporting Files** (8-10 lines)
   - List three supporting files with one-line descriptions

7. **Integration Points** (20-25 lines)
   - Table: EPIC-010 tasks using this skill
   - TASK-091: Context analyzer uses context-detection.md
   - TASK-092: Scaffolding generator uses scaffolding-templates.md
   - TASK-093: Migration command uses migration-strategies.md
   - Related skills: config-merging-patterns, git-sync-patterns

8. **Constraints** (15-20 lines)
   - .claude/ directory must exist or be creatable
   - No existing git conflicts in .claude/
   - Must validate generated CLAUDE.md structure
   - Tech stack detection heuristic (80%+ confidence threshold)
   - Collision renaming uses consistent prefix

9. **Sources** (20-25 lines)
   - Yeoman project structure docs
   - Copier template engine patterns
   - create-react-app scaffolding approach

---

### 2.2 context-detection.md (250-300 lines)

**Purpose**: Patterns for detecting existing project state before scaffolding

**Required Sections**:

1. **Overview** (20-30 lines)
   - What we're detecting and why
   - Inputs: Target project directory
   - Outputs: TargetContext structure

2. **Existing .claude/ Detection** (40-50 lines)
   - Check for `.claude/` directory
   - Inventory contents: commands/, agents/, skills/, hooks/
   - Count existing files by type
   - Identify custom vs framework components
   - Detection pseudocode

3. **Tech Stack Detection** (60-80 lines)
   - Package manager files (package.json, Cargo.toml, go.mod, requirements.txt, etc.)
   - Language inference from file extensions
   - Framework detection (React, Django, Axum, etc.)
   - Database inference (from imports, Docker Compose)
   - Confidence scoring (heuristic: 60%+ for detection to activate)
   - Table of detection signals with confidence weights

4. **MCP Server Detection** (40-50 lines)
   - Parse .mcp.json if exists
   - Identify custom MCPs (non-framework)
   - Extract server names and types
   - Check .mcp.local.json for local-only servers

5. **File Collision Detection** (50-60 lines)
   - Compare existing commands with framework commands
   - Collision types: exact match [CRITICAL], similar name [WARNING], no collision [OK]
   - Example collisions: commit.md, deploy.md, sync.md
   - Collision report structure

6. **Context Report Format** (30-40 lines)
   - TypeScript interface for TargetContext
   - JSON example output
   - Human-readable report template

7. **Edge Cases & Handling** (30-40 lines)
   - No existing .claude/
   - .claude/ exists but empty
   - .claude/ with many custom commands
   - Unusual tech stack combination
   - Missing package.json / no obvious tech stack
   - Corrupt or missing files

---

### 2.3 scaffolding-templates.md (300-350 lines)

**Purpose**: Patterns for generating initial framework directory structure

**Required Sections**:

1. **Overview** (20-30 lines)
   - What we're generating and why
   - Decision points: new install vs. migration
   - Template selection based on context

2. **Base Directory Structure** (50-70 lines)
   - Complete tree of directories
   - Which directories always created vs. conditional
   - File ownership (framework vs. local)
   - Example with annotations

3. **CLAUDE.md Generation** (60-80 lines)
   - Frontmatter: project name, version, tech stack
   - Sections to include: What, How, Features, Notes
   - Metadata fields: version, created, project_stack, customized_files
   - Template with placeholders
   - Tech-stack-specific sections (optional)

4. **.mcp.base.json Generation** (50-70 lines)
   - Framework MCPs template
   - Placeholder for local MCPs (.mcp.local.json)
   - Tech-stack-specific MCPs (e.g., if Python detected, add Python MCP)
   - Merge strategy if .mcp.json already exists

5. **Template File Copying** (40-50 lines)
   - Which framework files copy directly
   - Which files need placeholder substitution
   - Tech-stack-specific templates
   - Example: create language-specific task templates

6. **Interactive Customization Options** (30-40 lines)
   - Prompt: Include all framework skills? Y/N
   - Prompt: MCP servers to enable (checkboxes)
   - Prompt: Task templates for tech stack
   - Flow control: dry-run vs. confirm vs. execute

7. **Generated Structure Examples** (40-50 lines)
   - Minimal install (commands only)
   - Standard install (commands + selected agents)
   - Full install (all components)
   - Tech-specific examples (Node.js project, Python project)

---

### 2.4 migration-strategies.md (250-300 lines)

**Purpose**: Patterns for migrating existing .claude/ setups to framework

**Required Sections**:

1. **Overview** (20-30 lines)
   - Why migration matters
   - Preservation goals: existing local work, customizations
   - Migration scenarios: custom setup, old framework version, mixed setup

2. **Pre-Migration Assessment** (40-50 lines)
   - Identify local vs. framework files
   - Heuristics: file age, naming conventions, custom domains
   - Conflict detection: which files will collide?
   - Backup plan: what gets backed up?

3. **Migration Strategies** (80-100 lines)
   - **Strategy A: New Project** - No existing .claude/, create fresh structure
   - **Strategy B: Custom Project** - Existing .claude/ with custom files, migrate with prefixes
   - **Strategy C: Old Framework** - Existing .claude/ from older framework, update + preserve
   - **Strategy D: Minimal Merge** - Only framework commands, preserve everything else
   - Decision tree: which strategy applies?

4. **File Renaming Strategy** (40-50 lines)
   - Collision handling: rename with prefix (default: "local-")
   - Examples: commit.md → local-commit.md, my-deploy.md → local-my-deploy.md
   - Update internal references: imports, agent dependencies
   - Document renames in customized_files metadata

5. **MCP Configuration Migration** (40-50 lines)
   - Detect existing .mcp.json
   - Move to .mcp.local.json (preserve local servers)
   - Create .mcp.base.json from framework template
   - Merge strategy: deep merge with local servers preserved
   - Update .gitignore to exclude .mcp.local.json

6. **Backup & Rollback** (30-40 lines)
   - Create pre-migration backup: .backup/pre-migration-TIMESTAMP/
   - Backup contents: .claude/, .mcp.json, CLAUDE.md
   - Rollback procedure: restore from backup
   - Cleanup: remove backup after N days

7. **Migration Examples** (30-40 lines)
   - Step-by-step: Old Framework → Current Framework
   - Step-by-step: Custom .claude/ → Framework Install
   - Conflict resolution: commit.md collision

---

### 2.5 CLAUDE.md Updates (10-15 lines)

**Location**: `.claude/skills/` structure section

**Changes**:

1. Add to skills tree (after `git-sync-patterns`):
   ```markdown
   └── framework-scaffolding-patterns/ # Framework installation patterns (v0.31.0)
       ├── SKILL.md
       ├── context-detection.md
       ├── scaffolding-templates.md
       └── migration-strategies.md
   ```

2. Add to Notes section:
   ```markdown
   - Framework v0.31.0 - Framework Scaffolding Patterns (EPIC-010):
     - New `framework-scaffolding-patterns` skill for context detection, scaffolding, migration
     - Foundation for TASK-091 (context analyzer), TASK-092 (scaffolding generator), TASK-093 (migration)
   ```

---

## 3. Cross-References and Downstream Dependencies

### Dependency Chain

```
TASK-087 (framework-scaffolding-patterns skill)
    ├── → TASK-091 (context analyzer)
    │    └─ Uses: context-detection.md
    │
    ├── → TASK-092 (scaffolding generator)
    │    └─ Uses: scaffolding-templates.md
    │
    └── → TASK-093 (migration command)
         └─ Uses: migration-strategies.md
```

### Cross-Reference Details

| Reference From | Reference To | Link Type | Usage |
|---|---|---|---|
| SKILL.md | context-detection.md | Navigation | Quick ref mentions TASK-091 |
| SKILL.md | scaffolding-templates.md | Navigation | Quick ref mentions TASK-092 |
| SKILL.md | migration-strategies.md | Navigation | Quick ref mentions TASK-093 |
| context-detection.md | scaffolding-templates.md | Data flow | TargetContext feeds scaffolding decisions |
| scaffolding-templates.md | migration-strategies.md | Condition | Uses same structure for both new and migrated |
| All files | config-merging-patterns | Related | .mcp.json merge uses config-merging skill |
| All files | git-sync-patterns | Related | After scaffolding, sync operations apply |

### How TASK-091, 092, 093 Will Use This Skill

**TASK-091** (context analyzer):
- Reads context-detection.md patterns
- Implements TargetContext interface
- Uses tech stack detection heuristics
- Uses collision detection patterns
- Creates `/sync-analyze` command

**TASK-092** (scaffolding generator):
- Reads scaffolding-templates.md patterns
- Uses TargetContext from TASK-091
- Generates directory structure from templates
- Generates CLAUDE.md and .mcp.base.json
- Creates `/sync-scaffold` command with options

**TASK-093** (migration command):
- Reads migration-strategies.md patterns
- Uses TargetContext from TASK-091
- Applies migration strategy (A/B/C/D)
- Renames colliding files
- Backs up existing .claude/
- Creates `/sync-migrate` command

---

## 4. CLAUDE.md Updates

### Update Location 1: Skills Structure (Line ~141-155)

**Current**:
```markdown
└── git-sync-patterns/        # Git subtree sync operations (v0.29.0)
    ├── SKILL.md
    ├── subtree-operations.md
    ├── watermark-tracking.md
    ├── delta-detection.md
    ├── conflict-detection.md
    └── workflows/
```

**Updated**:
```markdown
├── git-sync-patterns/        # Git subtree sync operations (v0.29.0)
│   ├── SKILL.md
│   ├── subtree-operations.md
│   ├── watermark-tracking.md
│   ├── delta-detection.md
│   ├── conflict-detection.md
│   └── workflows/
└── framework-scaffolding-patterns/  # Framework installation patterns (v0.31.0)
    ├── SKILL.md
    ├── context-detection.md
    ├── scaffolding-templates.md
    └── migration-strategies.md
```

### Update Location 2: Notes Section (End of file)

**Add after config-merging-patterns note**:
```markdown
- Framework v0.31.0 - Framework Scaffolding Patterns (EPIC-010):
  - New `framework-scaffolding-patterns` skill for context detection, directory scaffolding, migration
  - Foundation for TASK-091 (context analyzer), TASK-092 (scaffolding generator), TASK-093 (migration)
```

---

## 5. Verification Checklist

### Acceptance Criteria (From Task Definition)

| AC# | Criterion | Verification Method |
|-----|-----------|---------------------|
| 1 | Skill directory created | `ls -la .claude/skills/framework-scaffolding-patterns/` (expect 4 files) |
| 2 | SKILL.md complete | `cat .claude/skills/framework-scaffolding-patterns/SKILL.md` - check for: frontmatter, 6+ sections, passive type |
| 3 | context-detection.md complete | `cat .claude/skills/framework-scaffolding-patterns/context-detection.md` - check for: detection patterns, collision logic, examples |
| 4 | scaffolding-templates.md complete | `cat .claude/skills/framework-scaffolding-patterns/scaffolding-templates.md` - check for: structure examples, CLAUDE.md template, .mcp.base.json |
| 5 | migration-strategies.md complete | `cat .claude/skills/framework-scaffolding-patterns/migration-strategies.md` - check for: strategies A-D, migration steps, examples |
| 6 | Examples in all files | Grep for "Example:", "e.g.", "```" in all files (expect 15+ examples total) |

### Additional Verification

| Item | Verification |
|------|---------------|
| **Line counts** | Run `wc -l .claude/skills/framework-scaffolding-patterns/*.md` (expect ~1100-1200 total) |
| **References** | Grep context-detection.md for TargetContext interface definition |
| **References** | Grep scaffolding-templates.md for references to context-detection output |
| **References** | Grep migration-strategies.md for references to file renaming patterns |
| **CLAUDE.md** | Check structure tree includes new skill at correct location |
| **CLAUDE.md** | Check Notes section includes v0.31.0 entry for scaffolding patterns |
| **CLAUDE.md** | Verify no duplicate skill entries |
| **Markdown syntax** | Run `markdownlint .claude/skills/framework-scaffolding-patterns/` (if available) |
| **Consistency** | Compare style with TASK-086 files (similar structure, tone, example depth) |
| **Activation triggers** | Verify SKILL.md lists all 3 downstream tasks (TASK-091, 092, 093) |

### Comparison with TASK-086 (Reference)

Expected structure similarity:

| Aspect | TASK-086 (config-merging) | TASK-087 (framework-scaffolding) |
|--------|---|---|
| Skill type | Passive | Passive |
| Main file | SKILL.md (180 lines) | SKILL.md (150-200 lines) |
| Support files | 3 files (section-parsing, mcp-merge, three-way-merge) | 3 files (context-detection, scaffolding-templates, migration-strategies) |
| Total lines | ~1100 | ~1100-1200 |
| Examples per file | 3-5 | 3-5 |
| Code snippets | Regex, pseudocode, YAML | Pseudocode, JSON, tree structures |
| Integration | TASK-088, 089, 090 | TASK-091, 092, 093 |

---

## Key Patterns Inspired By

1. **Yeoman Generator Framework**
   - Interactive prompts during scaffolding
   - Template system with placeholder substitution
   - Conflict detection and resolution

2. **Copier Template Engine**
   - Context detection from target directory
   - Tech-stack-specific templates
   - Migration strategies for existing files

3. **create-react-app**
   - Non-destructive installation (no global state)
   - Clear error messages for collisions
   - Structured rollback capability

---

## Notes for Implementation

- **TASK-087 is DOCUMENTATION ONLY** - No code is written, only patterns documented
- Pattern files should read like reference manuals (not how-to guides)
- Include pseudocode for algorithms (Python/JavaScript style)
- Use consistent terminology: "target project", "framework", "hub", "migration"
- Examples should be realistic and specific to actual use cases
- All examples should be copy-paste testable (complete, valid code/config)

---

## Related Tasks

- **TASK-086**: config-merging-patterns (reference for structure, now complete)
- **TASK-091**: context analyzer (reads context-detection.md)
- **TASK-092**: scaffolding generator (reads scaffolding-templates.md)
- **TASK-093**: migration command (reads migration-strategies.md)
- **EPIC-010**: Configuration & Installation (this task contributes AC #5)

