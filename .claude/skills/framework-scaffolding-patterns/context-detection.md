# Context Detection Patterns

Patterns for analyzing target projects before framework scaffolding. Context detection informs installation strategy by understanding existing setup, tech stack, and potential conflicts.

## Overview

Context detection is the **first phase** of framework installation. Before creating any files, analyze the target project to:

1. Detect existing `.claude/` directory and its contents
2. Identify the project's technology stack
3. Find existing MCP server configurations
4. Detect potential file collisions
5. Recommend the appropriate migration strategy

## Existing .claude/ Detection

### Directory Inventory

```
function inventoryClaudeDir(projectRoot):
  claudeDir = projectRoot + "/.claude"

  if not exists(claudeDir):
    return { has_claude_dir: false, contents: null }

  inventory = {
    has_claude_dir: true,
    commands: listFiles(claudeDir + "/commands/*.md"),
    agents: listFiles(claudeDir + "/agents/*.md"),
    skills: listDirs(claudeDir + "/skills/"),
    hooks: listFiles(claudeDir + "/hooks/*.md"),
    settings: exists(claudeDir + "/settings.local.json"),
    other_files: listFiles(claudeDir + "/*") - known_patterns
  }

  return inventory
```

### Framework vs Custom Classification

Classify files as framework-provided or user-created:

| Signal | Classification | Confidence |
|--------|----------------|------------|
| File matches framework manifest | Framework | 100% |
| Contains `<!-- simon_tools -->` comment | Framework | 95% |
| File in framework's known file list | Framework | 90% |
| Contains `<!-- LOCAL -->` markers | Custom | 85% |
| File not in framework manifest | Custom | 80% |
| Has local-specific paths/config | Custom | 75% |

```
function classifyFile(filePath, frameworkManifest):
  filename = basename(filePath)
  content = readFile(filePath)

  // Check manifest first (definitive)
  if filename in frameworkManifest.files:
    return { type: "framework", confidence: 100 }

  // Check for framework marker
  if content.contains("<!-- simon_tools -->"):
    return { type: "framework", confidence: 95 }

  // Check for local markers
  if content.contains("<!-- LOCAL"):
    return { type: "custom", confidence: 85 }

  // Default: assume custom
  return { type: "custom", confidence: 80 }
```

### Classification Output

```
Inventory Results:

Commands (5 total):
  Framework (3): commit.md, review-pr.md, deploy.md
  Custom (2): my-script.md, local-build.md

Agents (2 total):
  Framework (2): code-reviewer.md, test-runner.md
  Custom (0): -

Skills (1 total):
  Custom (1): my-company-patterns/

Hooks (0 total):
  -
```

## Tech Stack Detection

### Detection Signals

| File | Stack | Confidence | Notes |
|------|-------|------------|-------|
| `package.json` | Node.js | 90% | Check `type`, `main`, `module` fields |
| `tsconfig.json` | TypeScript | 95% | Node.js + TypeScript |
| `Cargo.toml` | Rust | 95% | Rust project |
| `go.mod` | Go | 95% | Go modules |
| `pyproject.toml` | Python | 90% | Modern Python |
| `requirements.txt` | Python | 85% | Legacy Python |
| `setup.py` | Python | 80% | Legacy Python |
| `composer.json` | PHP | 90% | PHP Composer |
| `Gemfile` | Ruby | 90% | Ruby Bundler |
| `pom.xml` | Java | 90% | Maven |
| `build.gradle` | Java/Kotlin | 90% | Gradle |
| `.csproj` | C#/.NET | 90% | .NET project |

### Multi-Stack Detection

Projects may use multiple technologies:

```
function detectTechStack(projectRoot):
  stacks = []

  // Check each indicator
  if exists(projectRoot + "/package.json"):
    pkg = parseJson(readFile(projectRoot + "/package.json"))
    stack = { name: "nodejs", confidence: 90 }

    if exists(projectRoot + "/tsconfig.json"):
      stack.variant = "typescript"
      stack.confidence = 95

    // Detect framework
    if pkg.dependencies:
      if "next" in pkg.dependencies:
        stack.framework = "nextjs"
      else if "react" in pkg.dependencies:
        stack.framework = "react"
      else if "vue" in pkg.dependencies:
        stack.framework = "vue"
      else if "express" in pkg.dependencies:
        stack.framework = "express"

    stacks.push(stack)

  if exists(projectRoot + "/Cargo.toml"):
    stacks.push({ name: "rust", confidence: 95 })

  if exists(projectRoot + "/go.mod"):
    stacks.push({ name: "go", confidence: 95 })

  if exists(projectRoot + "/pyproject.toml"):
    stacks.push({ name: "python", confidence: 90, variant: "modern" })
  else if exists(projectRoot + "/requirements.txt"):
    stacks.push({ name: "python", confidence: 85, variant: "legacy" })

  return {
    primary: stacks[0] or { name: "unknown", confidence: 0 },
    all: stacks
  }
```

### Stack-Specific Customizations

Based on detected stack, customize installation:

| Stack | Customization |
|-------|---------------|
| Node.js/TypeScript | Add TypeScript-specific MCP servers, ESLint integration |
| Python | Add Python MCP servers, pytest configuration |
| Rust | Add Rust analyzer integration |
| Go | Add Go tools integration |
| Mixed | Combine relevant customizations |

## MCP Server Detection

### Parse Existing Configuration

```
function detectMcpServers(projectRoot):
  mcpConfig = null
  source = null

  // Check for existing .mcp.json
  if exists(projectRoot + "/.mcp.json"):
    mcpConfig = parseJson(readFile(projectRoot + "/.mcp.json"))
    source = ".mcp.json"

  // Check for .mcp.local.json (git-ignored)
  else if exists(projectRoot + "/.mcp.local.json"):
    mcpConfig = parseJson(readFile(projectRoot + "/.mcp.local.json"))
    source = ".mcp.local.json"

  if mcpConfig is null:
    return { servers: [], source: null }

  servers = []
  for name, config in mcpConfig.mcpServers:
    servers.push({
      name: name,
      command: config.command,
      type: config.type,
      is_framework: isFrameworkMcp(name),
      has_env_vars: config.env != null
    })

  return { servers: servers, source: source }
```

### Framework vs Custom MCP Classification

| Server Name | Type | Notes |
|-------------|------|-------|
| `serena` | Framework | Semantic code understanding |
| `github` | Framework | GitHub integration |
| `memory` | Framework | Memory persistence |
| `playwright` | Framework | Browser automation |
| Custom names | Custom | Project-specific servers |

## File Collision Detection

### Collision Types

| Type | Severity | Condition | Resolution |
|------|----------|-----------|------------|
| CRITICAL | High | Exact filename match | Rename to `local-{name}` |
| WARNING | Medium | Similar name pattern | Ask user preference |
| OK | None | No overlap | Proceed normally |

### Detection Algorithm

```
function detectCollisions(inventory, frameworkManifest):
  collisions = []

  for frameworkFile in frameworkManifest.files:
    // Check for exact match
    if frameworkFile in inventory.all_files:
      classification = classifyFile(inventory.path + "/" + frameworkFile)

      if classification.type == "custom":
        collisions.push({
          file: frameworkFile,
          type: "CRITICAL",
          existing: "custom",
          resolution: "rename_to_local"
        })
      else:
        // Framework file already exists - check version
        collisions.push({
          file: frameworkFile,
          type: "WARNING",
          existing: "framework",
          resolution: "check_version"
        })

    // Check for similar names
    similarFiles = findSimilar(frameworkFile, inventory.all_files)
    for similar in similarFiles:
      collisions.push({
        file: similar,
        framework_file: frameworkFile,
        type: "WARNING",
        resolution: "ask_user"
      })

  return collisions
```

### Collision Report Format

```
## Collision Report

### Critical (2)
| Existing File | Framework File | Resolution |
|---------------|----------------|------------|
| commit.md | commit.md | Rename to local-commit.md |
| deploy.md | deploy.md | Rename to local-deploy.md |

### Warnings (1)
| Existing File | Similar To | Recommended |
|---------------|------------|-------------|
| my-commit.md | commit.md | Keep as-is (no conflict) |

### Resolution Options
[R]ename collisions automatically (recommended)
[K]eep existing files (skip framework files)
[M]anual - decide per file
[A]bort installation
```

## TargetContext Interface

The complete context object passed to scaffolding:

```typescript
interface TargetContext {
  // Project root
  project_root: string;

  // Existing .claude/ analysis
  has_claude_dir: boolean;
  existing_commands: string[];
  existing_agents: string[];
  existing_skills: string[];
  existing_hooks: string[];
  framework_files: string[];     // Files from framework
  custom_files: string[];        // User's custom files

  // Tech stack
  tech_stack: {
    primary: {
      name: string;              // "nodejs", "python", "rust", etc.
      variant?: string;          // "typescript", "modern", etc.
      framework?: string;        // "nextjs", "express", etc.
      confidence: number;        // 0-100
    };
    all: TechStack[];
  };

  // MCP servers
  mcp_servers: {
    servers: McpServer[];
    source: string | null;       // ".mcp.json" or ".mcp.local.json"
  };

  // Collisions
  collisions: Collision[];
  has_critical_collisions: boolean;

  // Recommended strategy
  migration_strategy: "A" | "B" | "C" | "D";
  strategy_reason: string;

  // Installation options
  recommended_level: "minimal" | "standard" | "full";
}

interface TechStack {
  name: string;
  variant?: string;
  framework?: string;
  confidence: number;
}

interface McpServer {
  name: string;
  command: string;
  type: "stdio" | "sse";
  is_framework: boolean;
  has_env_vars: boolean;
}

interface Collision {
  file: string;
  framework_file?: string;
  type: "CRITICAL" | "WARNING" | "OK";
  existing: "custom" | "framework";
  resolution: string;
}
```

## Migration Strategy Selection

Based on context, recommend one of four strategies:

| Strategy | Condition | Description |
|----------|-----------|-------------|
| A: Fresh | No `.claude/` exists | Full scaffolding, no migration needed |
| B: Custom | Custom `.claude/` exists | Preserve customs, merge framework |
| C: Old Version | Old framework version | Upgrade framework files in place |
| D: Minimal | Existing + want minimal | Add only missing files |

```
function selectStrategy(context: TargetContext): string {
  if (!context.has_claude_dir) {
    return "A";  // Fresh install
  }

  if (context.framework_files.length > 0) {
    // Has framework files - check version
    currentVersion = detectFrameworkVersion(context);
    if (currentVersion < FRAMEWORK_VERSION) {
      return "C";  // Upgrade
    }
  }

  if (context.custom_files.length > 0) {
    return "B";  // Custom migration
  }

  return "D";  // Minimal addition
}
```

## Edge Cases

### No .claude/ Directory

**Scenario**: Fresh project with no Claude Code setup.

```
Context:
  has_claude_dir: false
  migration_strategy: "A"
  strategy_reason: "No existing setup detected"

Action: Full scaffolding (Strategy A)
```

### Empty .claude/ Directory

**Scenario**: Directory exists but is empty or has only .gitkeep.

```
Context:
  has_claude_dir: true
  existing_commands: []
  existing_agents: []
  migration_strategy: "A"
  strategy_reason: "Empty .claude/ directory"

Action: Treat as fresh install (Strategy A)
```

### Many Custom Files

**Scenario**: Extensive custom setup with many commands/agents.

```
Context:
  has_claude_dir: true
  custom_files: ["cmd1.md", "cmd2.md", ..., "cmd20.md"]
  collisions: [{ file: "commit.md", type: "CRITICAL" }, ...]
  migration_strategy: "B"
  strategy_reason: "20 custom files detected, 3 collisions"

Action: Careful migration with collision resolution (Strategy B)
```

### Unusual Tech Stack

**Scenario**: Project uses uncommon technology or mixed stack.

```
Context:
  tech_stack:
    primary: { name: "unknown", confidence: 0 }
    all: []

Action:
  - Use generic scaffolding
  - Skip stack-specific customizations
  - Warn user about manual configuration needed
```

### Existing Framework with Local Modifications

**Scenario**: Framework files exist but have local changes.

```
Context:
  framework_files: ["commit.md", "deploy.md"]
  local_modifications: ["commit.md"]  // Has <!-- LOCAL --> sections
  migration_strategy: "C"

Action:
  - Preserve LOCAL sections during upgrade
  - Use config-merging-patterns skill for merge
```

### Corrupted or Partial Setup

**Scenario**: .claude/ exists but is incomplete or corrupted.

```
Detection:
  - Missing required directories (commands/, agents/)
  - Invalid JSON in settings files
  - Broken symlinks

Context:
  has_claude_dir: true
  is_valid_setup: false
  validation_errors: ["Missing commands/", "Invalid settings.local.json"]
  migration_strategy: "D"
  strategy_reason: "Corrupted setup - minimal repair"

Action:
  - Backup existing files
  - Repair missing/broken components
  - Preserve valid custom files
```

## Full Detection Example

```
Analyzing target project: /home/user/my-project

## Step 1: Directory Detection
✓ Found .claude/ directory
  - commands/: 5 files
  - agents/: 2 files
  - skills/: 1 directory
  - hooks/: 0 files
  - settings.local.json: exists

## Step 2: File Classification
Framework files (4):
  - commands/commit.md (confidence: 95%)
  - commands/review-pr.md (confidence: 95%)
  - agents/code-reviewer.md (confidence: 100%)
  - agents/test-runner.md (confidence: 100%)

Custom files (4):
  - commands/my-script.md (confidence: 80%)
  - commands/local-build.md (confidence: 85%)
  - commands/deploy.md (confidence: 75%)
  - skills/my-company-patterns/ (confidence: 80%)

## Step 3: Tech Stack Detection
Primary: Node.js + TypeScript (confidence: 95%)
Framework: Next.js
Additional: None

## Step 4: MCP Detection
Source: .mcp.json
Servers (3):
  - serena (framework)
  - github (framework)
  - my-database (custom)

## Step 5: Collision Detection
Critical (1):
  - deploy.md conflicts with framework deploy.md

Warnings (0):
  - None

## Step 6: Strategy Selection
Recommended: Strategy B (Custom Migration)
Reason: Custom files detected with 1 collision

## Summary
┌─────────────────────────────────────────┐
│ Migration Strategy: B (Custom)          │
│ Installation Level: Standard            │
│ Collisions to resolve: 1                │
│ Files to rename: deploy.md → local-deploy.md │
│ Files to preserve: 4 custom files       │
│ MCP merge required: Yes                 │
└─────────────────────────────────────────┘

Proceed with installation? [Y/n/details]
```

## Claude Code Implementation Examples

Real `/sync-analyze` command output extracted from TASK-091 implementation.

### Example 1: Fresh Project Analysis

**Command**:
```bash
/sync-analyze /home/user/new-project
```

**Output**:
```
## Target Project Analysis

**Project**: /home/user/new-project
**Existing .claude/**: No
**Tech Stack**: Python, modern

### Existing Commands (0 total)
  Framework (0): -
  Custom (0): -

### Existing Agents (0 total)
  Framework (0): -
  Custom (0): -

### MCP Servers (0 total)
  No MCP configuration found.

### Collisions Detected
None - fresh project.

### Recommended Strategy
Strategy A (Fresh Install)
Reason: No existing setup detected

### Summary
┌─────────────────────────────────────────┐
│ Migration Strategy: A                   │
│ Installation Level: standard            │
│ Collisions to resolve: 0                │
│ Files to preserve: 0 custom files       │
│ MCP merge required: No                  │
└─────────────────────────────────────────┘
```

### Example 2: JSON Output for Programmatic Use

**Command**:
```bash
/sync-analyze --json
```

**TargetContext Output** (consumed by `/sync-scaffold` and `/sync-migrate`):
```json
{
  "project_root": "/home/user/my-project",
  "has_claude_dir": true,
  "existing_commands": ["deploy.md", "my-script.md", "local-build.md"],
  "existing_agents": ["custom-agent.md"],
  "existing_skills": ["my-company-patterns"],
  "existing_hooks": [],
  "framework_files": [],
  "custom_files": ["deploy.md", "my-script.md", "local-build.md", "custom-agent.md"],
  "tech_stack": {
    "primary": {
      "name": "nodejs",
      "variant": "typescript",
      "framework": "nextjs",
      "confidence": 95
    },
    "all": [
      { "name": "nodejs", "variant": "typescript", "framework": "nextjs", "confidence": 95 }
    ]
  },
  "mcp_servers": {
    "servers": [
      { "name": "my-database", "command": "npx", "type": "stdio", "is_framework": false, "has_env_vars": true }
    ],
    "source": ".mcp.json"
  },
  "collisions": [
    { "file": "deploy.md", "type": "CRITICAL", "existing": "custom", "resolution": "rename_to_local", "suggested_name": "local-deploy.md" }
  ],
  "has_critical_collisions": true,
  "migration_strategy": "B",
  "strategy_reason": "Custom files detected, no framework files",
  "recommended_level": "standard"
}
```

### Example 3: User-Level Configuration Analysis

**Command** (v0.33.0+):
```bash
/sync-analyze --user-level
```

**Combined Output** (target + user-level):
```
## Target Project Analysis
[... target analysis ...]

## User-Level Analysis

**Path**: /home/user/.claude
**Detected**: Yes
**Components**: 8 total

### Commands (3 total)
| Name | Classification | Reason |
|------|----------------|--------|
| personal-commit.md | personal | Name pattern: personal-* |
| company-template.md | reusable | Name pattern: company-* |
| commit.md | framework_overlap | Matches framework component |

### MCP Servers (2 total)
| Server | Classification | Reason |
|--------|----------------|--------|
| company-api | reusable | Org keyword: company |
| personal-kb | personal | Name pattern: personal-* |

### User-Level Summary
┌─────────────────────────────────────────┐
│ Total components: 8                      │
│ Reusable: 3 (recommended for include)    │
│ Personal: 4 (skip by default)            │
│ Framework overlap: 1 (will be skipped)   │
└─────────────────────────────────────────┘

### Integration Recommendations
┌─────────────────────────────────────────────────────┐
│ Reusable user components to offer: 3                │
│ Recommended for integration:                        │
│   - company-template (command)                      │
│   - team-conventions (skill)                        │
│   - company-api (MCP)                               │
│ Components to skip (personal): 4                    │
│ Components to skip (overlap): 1                     │
└─────────────────────────────────────────────────────┘
```

### Example 4: Detection with Collisions

**Before** (existing project structure):
```
my-project/
├── .claude/
│   ├── commands/
│   │   ├── deploy.md          # Custom command (collision!)
│   │   └── my-script.md       # Custom command
│   └── agents/
│       └── custom-agent.md    # Custom agent
├── .mcp.json                  # Existing MCP config
└── package.json               # Node.js project
```

**Command**:
```bash
/sync-analyze --detailed
```

**Detailed Classification Output**:
```
### File Classification Details

| File | Type | Confidence | Signal |
|------|------|------------|--------|
| commands/deploy.md | custom | 80% | no marker |
| commands/my-script.md | custom | 80% | no marker |
| agents/custom-agent.md | custom | 80% | no marker |

### Collision Analysis

| Existing File | Framework File | Severity | Resolution |
|---------------|----------------|----------|------------|
| deploy.md | deploy.md | CRITICAL | Rename to local-deploy.md |

### Strategy Selection
Strategy B selected because:
  1. .claude/ directory exists (not Strategy A)
  2. No framework files found (not Strategy C)
  3. Custom files detected: 3
  4. Collisions detected: 1 (will be renamed)
```

### Key Transformation: Context Detection → Downstream Consumers

The TargetContext object flows through the scaffolding pipeline:

```
/sync-analyze                    →  TargetContext JSON
     ↓
/sync-scaffold                   ←  Consumes context.migration_strategy,
                                     context.recommended_level,
                                     context.collisions
     ↓
/sync-migrate                    ←  Consumes context.custom_files,
                                     context.framework_files,
                                     context.collisions
     ↓
/sync-mcp-merge                  ←  Consumes context.mcp_servers.source
```

This pattern ensures consistent context flows between commands, enabling intelligent decision-making at each phase.
