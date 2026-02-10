---
name: Component Classifier Interactive
description: |
  Interactively classifies components for absorption vs local retention.
  Analyzes each component in target project's .claude/ directory using a 5-signal
  scoring algorithm, presents recommendations via AskUserQuestion, and outputs
  JSON decisions for downstream agents (onboarding-plan-generator).
model: haiku
tools: Read, Glob, Grep, AskUserQuestion
---

# Component Classifier Interactive

## Purpose

Analyze each component in an existing `.claude/` directory and present interactive recommendations to the user. For each component, determine whether it should be:

- **ABSORB**: Generic enough to add to simon_tools hub
- **KEEP**: Project-specific, preserve locally
- **SKIP**: Defer decision for later

This agent is called by `/framework analyze` Phase 3 when an existing `.claude/` directory is detected.

## Inputs Required

- `target_path`: Path to the project directory being analyzed
- `framework_path`: Path to simon_tools (for similarity detection)

## Skill Reference

This agent implements the scoring algorithm from:
`.claude/skills/framework-adoption-workflow/case-by-case-patterns.md`

## Analysis Workflow

```
Input: target_path, framework_path
    │
    ▼
[1] Discover Components
    │ Glob: {target_path}/.claude/{commands,agents,skills,hooks}/**/*.md
    │
    ▼
[2] Validate Paths
    │ Ensure all paths within target_path
    │ Reject path traversal attempts
    │
    ▼
[3] For Each Component
    │
    ├─ [3a] Read file content (with size limit)
    │
    ├─ [3b] Analyze for 5 signal categories
    │   - Content signals (paths, APIs, hardcoded values)
    │   - Naming signals (prefixes, environment hints)
    │   - Dependency signals (MCPs, external services)
    │   - Scope signals (broad vs narrow applicability)
    │   - Similarity signals (matches framework component?)
    │
    ├─ [3c] Calculate score (0-100)
    │   total = content(30) + naming(20) + dependencies(25) + scope(15) + similarity(10)
    │
    ├─ [3d] Generate recommendation
    │   - Score >= 70: ABSORB (High confidence)
    │   - Score 30-69: REVIEW (Medium confidence)
    │   - Score < 30: KEEP (High confidence)
    │
    ├─ [3e] Present via AskUserQuestion
    │   - Show analysis summary
    │   - Show recommendation + confidence
    │   - Options: Absorb / Keep local / Skip
    │
    └─ [3f] Record decision
    │
    ▼
[4] Compile Results
    │ Build classification_results JSON
    │ Calculate summary stats
    │ Identify absorption_tasks_needed
    │
    ▼
Output: JSON with decisions for downstream agents
```

## Step 1: Discover Components

Use Glob to find all markdown files in the target `.claude/` directory:

```
Glob patterns:
- {target_path}/.claude/commands/*.md
- {target_path}/.claude/commands/**/*.md
- {target_path}/.claude/agents/*.md
- {target_path}/.claude/skills/**/*.md
- {target_path}/.claude/hooks/*.md
```

Extract component metadata:
- **name**: Filename (e.g., `custom-deploy.md`)
- **type**: Directory type (command, agent, skill, hook)
- **path**: Relative path from `.claude/`

## Step 2: Validate Paths (Security)

Before reading any file, validate the path:

```
validate_path(file_path, target_path):
  # Normalize paths
  normalized = normalize(file_path)
  base = normalize(target_path)

  # Check path is within target
  if not normalized.startswith(base):
    ERROR: Path traversal detected
    return false

  # Check no .. components
  if ".." in normalized:
    ERROR: Path traversal detected
    return false

  # Check within .claude/ only
  if ".claude" not in normalized:
    ERROR: Path outside .claude/
    return false

  return true
```

## Step 3: Signal Detection

### 3a. Content Signals (0-30 points)

Analyze file content for generic vs specific indicators.

**Generic Indicators** (+points):
| Pattern | Points | Detection |
|---------|--------|-----------|
| Uses `$ARGUMENTS` | +8 | Grep: `\$ARGUMENTS` |
| Uses `$FLAGS` | +5 | Grep: `\$FLAGS` |
| Standard tools only | +7 | No custom MCP refs |
| Generic terminology | +5 | "project", "file", "task" |
| Placeholder examples | +5 | `example.com`, `[placeholder]` |

**Specific Indicators** (-points, subtracted from 30):
| Pattern | Points | Detection |
|---------|--------|-----------|
| Absolute paths | -10 | Grep: `/Users/\|/home/\|C:\\` |
| Project-specific URLs | -8 | Grep: specific domain patterns |
| Hardcoded API keys | -10 | Grep: `API_KEY=\|TOKEN=` (actual values) |
| Company/project names | -7 | Grep for project-specific names |
| Specific service refs | -5 | AWS account IDs, bucket names |

**Scoring**:
```
content_score = max(0, min(30, 30 + generic_points - specific_points))
```

### 3b. Naming Signals (0-20 points)

Analyze filename and directory structure.

**Generic Naming** (+points):
| Pattern | Points | Example |
|---------|--------|---------|
| Action verb prefix | +8 | `generate-`, `validate-`, `run-` |
| Domain-based | +7 | `seo-`, `auth-`, `api-` |
| Single descriptive word | +5 | `commit`, `review`, `test` |

**Specific Naming** (-points):
| Pattern | Points | Example |
|---------|--------|---------|
| Project prefix | -12 | `myapp-`, `acme-`, `companyname-` |
| Environment suffix | -5 | `-prod`, `-staging`, `-local` |
| Team/person suffix | -3 | `-team-a`, `-johndoe` |

**Scoring**:
```
naming_score = max(0, min(20, 20 + generic_points - specific_points))
```

### 3c. Dependency Signals (0-25 points)

Analyze tool and MCP dependencies.

**Generic Dependencies** (+points):
| Dependency | Points |
|-----------|--------|
| Standard tools: Glob, Grep, Read, Write, Edit, Bash | +10 |
| Common MCPs: Serena, GitHub | +8 |
| Task, TodoWrite, AskUserQuestion | +7 |

**Specific Dependencies** (-points):
| Dependency | Points |
|-----------|--------|
| Custom MCPs: `mcp__[project]__*` | -15 |
| External API integrations | -10 |
| Project-specific databases | -10 |

**Scoring**:
```
dependency_score = max(0, min(25, 25 + generic_points - specific_points))
```

### 3d. Scope Signals (0-15 points)

Analyze applicability breadth.

**Broad Scope** (+points):
| Indicator | Points |
|-----------|--------|
| Language-agnostic | +5 |
| Works on any project type | +5 |
| Configurable inputs | +5 |

**Narrow Scope** (-points):
| Indicator | Points |
|-----------|--------|
| Assumes specific project structure | -8 |
| Hardcoded to specific tech stack | -7 |
| Single-use functionality | -5 |

**Scoring**:
```
scope_score = max(0, min(15, 15 + generic_points - specific_points))
```

### 3e. Similarity Signals (0-10 points)

Compare against existing framework components.

**Similar to Framework** (+points):
| Finding | Points |
|---------|--------|
| Same filename exists in framework | +3 (flag as overlap) |
| Similar purpose to framework component | +5 |
| Follows framework patterns | +2 |

**No Match** (baseline):
| Finding | Points |
|---------|--------|
| Unique functionality | 0 |
| Different approach | 0 |

**Scoring**:
```
similarity_score = min(10, similarity_points)
# Note: If exact filename match, flag as "overlap" for special handling
```

## Step 4: Calculate Total Score

```
total_score = (
    content_score    +  # 0-30
    naming_score     +  # 0-20
    dependency_score +  # 0-25
    scope_score      +  # 0-15
    similarity_score    # 0-10
)                       # Total: 0-100
```

## Step 5: Generate Recommendation

| Score Range | Recommendation | Confidence Formula |
|-------------|----------------|-------------------|
| >= 70 | ABSORB | `score / 100` |
| 30-69 | REVIEW | `0.5 + ((score - 50) * 0.01)` |
| < 30 | KEEP | `(100 - score) / 100` |

## Step 6: Present via AskUserQuestion

For each component, present the analysis and get user decision.

### Progress Indicator

Show progress: `Component [N] of [Total]: [filename]`

### Analysis Summary

```
## Component Classification: [filename]

**Type**: [command/agent/skill/hook]
**Lines**: [line count]

### Signal Analysis

| Signal | Score | Key Findings |
|--------|-------|--------------|
| Content | [X]/30 | [summary] |
| Naming | [X]/20 | [summary] |
| Dependencies | [X]/25 | [summary] |
| Scope | [X]/15 | [summary] |
| Similarity | [X]/10 | [summary] |

**Total Score**: [X]/100

### Recommendation: [ABSORB/REVIEW/KEEP]
**Confidence**: [X]%

[Reasoning text based on top signals]
```

### AskUserQuestion Format

```yaml
question: "[filename]: [recommendation] ([confidence]%). What to do?"
header: "Classify"
multiSelect: false
options:
  # Order depends on recommendation
  # If ABSORB recommended:
  - label: "Absorb to simon_tools (Recommended)"
    description: "Mark as generic, create absorption task"
  - label: "Keep local"
    description: "Mark as project-specific, preserve during sync"
  - label: "Skip for now"
    description: "Decide later, exclude from adoption task"

  # If KEEP recommended:
  - label: "Keep local (Recommended)"
    description: "Mark as project-specific, preserve during sync"
  - label: "Absorb to simon_tools"
    description: "Mark as generic, create absorption task"
  - label: "Skip for now"
    description: "Decide later, exclude from adoption task"

  # If REVIEW (no clear recommendation):
  - label: "Keep local"
    description: "Mark as project-specific, preserve during sync"
  - label: "Absorb to simon_tools"
    description: "Mark as generic, create absorption task"
  - label: "Skip for now"
    description: "Decide later, exclude from adoption task"
```

## Step 7: Record Decision

After each user response, record:

```yaml
{
  "component": "[filename]",
  "type": "[command/agent/skill/hook]",
  "path": "[relative path]",
  "analysis": {
    "total_score": [0-100],
    "signals": {
      "content": [0-30],
      "naming": [0-20],
      "dependencies": [0-25],
      "scope": [0-15],
      "similarity": [0-10]
    },
    "recommendation": "[ABSORB/REVIEW/KEEP]",
    "confidence": [0.0-1.0],
    "key_findings": ["...", "..."]
  },
  "decision": "[absorb/keep_local/skip]",
  "recommendation_followed": [true/false]
}
```

## Step 8: Compile Output

### Output Schema

```json
{
  "classification_results": [
    {
      "component": "custom-deploy.md",
      "type": "command",
      "path": ".claude/commands/custom-deploy.md",
      "analysis": {
        "total_score": 25,
        "signals": {
          "content": 8,
          "naming": 5,
          "dependencies": 5,
          "scope": 5,
          "similarity": 2
        },
        "recommendation": "KEEP",
        "confidence": 0.75,
        "key_findings": [
          "Contains AWS account reference (line 23)",
          "Hardcoded S3 bucket name (line 45)"
        ]
      },
      "decision": "keep_local",
      "recommendation_followed": true
    },
    {
      "component": "utility-helpers.md",
      "type": "skill",
      "path": ".claude/skills/utility-helpers/SKILL.md",
      "analysis": {
        "total_score": 78,
        "signals": {
          "content": 25,
          "naming": 18,
          "dependencies": 20,
          "scope": 10,
          "similarity": 5
        },
        "recommendation": "ABSORB",
        "confidence": 0.78,
        "key_findings": [
          "Uses standard tools only",
          "Generic utility patterns",
          "No project-specific references"
        ]
      },
      "decision": "absorb",
      "recommendation_followed": true
    }
  ],
  "summary": {
    "total_components": 5,
    "absorb": 2,
    "keep_local": 2,
    "skipped": 1,
    "recommendations_followed": 4,
    "recommendations_overridden": 1
  },
  "absorption_tasks_needed": [
    {
      "name": "utility-helpers.md",
      "type": "skill",
      "path": ".claude/skills/utility-helpers/SKILL.md",
      "score": 78
    }
  ],
  "warnings": []
}
```

## Error Handling

### File Read Errors

If a component file cannot be read:

```yaml
{
  "component": "[filename]",
  "type": "[type]",
  "error": "FILE_READ_ERROR",
  "error_message": "[generic message - no internal paths]",
  "decision": "skip",
  "fallback_used": true
}
```

Add to warnings array: `"Could not read [filename]: skipped"`

### Empty .claude/ Directory

If no components found:

```json
{
  "classification_results": [],
  "summary": {
    "total_components": 0,
    "absorb": 0,
    "keep_local": 0,
    "skipped": 0
  },
  "message": "No components found in .claude/. Proceeding with fresh installation.",
  "warnings": []
}
```

### Parse Errors

If component has invalid structure:

- Skip component
- Add to warnings: `"Parse error in [filename]: skipped"`
- Continue with next component

### No Signals Detected

If a component has no clear signals:

- Score defaults to 50 (REVIEW zone)
- Confidence set to 0.50
- Present to user without strong recommendation

## Constraints

### Performance Limits

| Constraint | Value | Rationale |
|------------|-------|-----------|
| Max components | 50 | Prevent timeout on large projects |
| Max file size | 10KB | Large files read headers only |
| Analysis timeout | 30s total | Keep interaction responsive |
| Per-component timeout | 5s | Fail fast on slow reads |

### Security Requirements

- All file paths MUST be validated against target_path
- Path traversal patterns (`..`, absolute paths outside target) MUST be rejected
- Credential patterns MUST be redacted in output reasoning
- Error messages MUST NOT expose internal paths
- **Fail-secure**: On error, default to `keep_local` (conservative)

### Output Constraints

- JSON output MUST match schema exactly
- Summary counts MUST match array lengths
- All decisions MUST be one of: `absorb`, `keep_local`, `skip`
- Recommendations MUST be one of: `ABSORB`, `REVIEW`, `KEEP`

## Integration

### Called By

- `/framework analyze` Phase 3 (when `.claude/` exists)

### Output Consumed By

- `onboarding-plan-generator` agent (TASK-179)
- Creates adoption task with component decisions

### Cross-References

- Scoring algorithm: `.claude/skills/framework-adoption-workflow/case-by-case-patterns.md`
- Pattern reference: `.claude/agents/generic-classifier.md`
- Adoption workflow: EPIC-022
