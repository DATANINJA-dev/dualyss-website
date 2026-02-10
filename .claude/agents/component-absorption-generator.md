---
name: Component Absorption Generator
description: |
  Generates tasks from generic-classifier output for component absorption.
  Groups related components to avoid task explosion and creates reviewable
  tasks for each component/group to absorb into simon_tools hub.
model: haiku
tools: Read, Write, Glob
---

# Component Absorption Generator

## Purpose

Transform generic-classifier output into individual absorption tasks. Each task
represents one component (or group of related components) to be absorbed into
the simon_tools hub. This enables task-based review instead of direct absorption.

## When to Use

- After `component-classifier-interactive` marks components for absorption
- When `onboarding-plan-generator` needs to create sub-tasks for absorbed components
- During `/framework absorb` workflow to generate reviewable tasks
- When converting classified components into actionable work items

## Inputs Required

- **classifier_output**: JSON output from `generic-classifier` agent
- **target_epic_id**: Epic to link generated tasks to (optional, defaults to current)
- **base_task_id**: Starting task ID if reserved by caller (optional)

## Input Schema

From `generic-classifier` agent:

```json
{
  "generic_components": [
    {
      "type": "command",
      "name": "my-command",
      "path": ".claude/commands/my-command.md",
      "confidence": 0.85
    },
    {
      "type": "agent",
      "name": "my-agent",
      "path": ".claude/agents/my-agent.md",
      "confidence": 0.92
    }
  ],
  "overlap_components": [
    {
      "type": "command",
      "name": "commit",
      "path": ".claude/commands/commit.md",
      "framework_match": ".claude/commands/commit.md",
      "resolution": "skip"
    }
  ],
  "specific_components": [...]
}
```

**Note**: Only `generic_components` are processed. Overlap and specific components are skipped.

## Output Schema

```json
{
  "tasks_created": [
    {
      "id": "TASK-215",
      "title": "Absorb command: my-command",
      "components": ["my-command.md"],
      "type": "command",
      "file": "backlog/tasks/TASK-215.md"
    },
    {
      "id": "TASK-216",
      "title": "Absorb seo-validate commands (3)",
      "components": ["seo-validate-meta.md", "seo-validate-geo.md", "seo-validate-quality.md"],
      "type": "command",
      "file": "backlog/tasks/TASK-216.md"
    }
  ],
  "summary": {
    "total_tasks": 2,
    "total_components": 4,
    "by_type": {
      "command": 2,
      "agent": 0,
      "skill": 0
    }
  },
  "skipped": {
    "overlap": 1,
    "specific": 0,
    "invalid_path": 0
  }
}
```

## Grouping Rules

Components are grouped to avoid task explosion while maintaining logical separation.

### Rule 1: Separate by Type

Always separate tasks by component type:
- Commands → separate tasks from agents
- Agents → separate tasks from skills
- Skills → separate tasks from hooks

**Example**:
```
Input: [cmd-a, cmd-b, agent-x]
Output: 2 tasks (1 for commands, 1 for agent)
```

### Rule 2: Group by Prefix

Components with the same prefix (text before first `-`) are grouped together.

**Algorithm**:
```
1. Extract prefix: filename.split('-')[0]
2. Group by: (type, prefix) tuple
3. Components without '-' use full name as prefix
```

**Examples**:
```
seo-validate-meta.md    → prefix: "seo"
seo-validate-geo.md     → prefix: "seo"
commit.md               → prefix: "commit"
my-custom-tool.md       → prefix: "my"
```

**Result**: `seo-*` commands grouped together, `commit` and `my-*` are separate.

### Rule 3: Split Large Groups

Groups with more than 5 components are split into multiple tasks.

**Algorithm**:
```
If group.size > 5:
  num_tasks = ceil(group.size / 5)
  Split into num_tasks tasks of ~equal size
```

**Example**:
```
Input: 8 utility commands (util-1 through util-8)
Output: 2 tasks
  - Task 1: util-1, util-2, util-3, util-4, util-5
  - Task 2: util-6, util-7, util-8
```

### Rule 4: Preserve Related Components

If components reference each other (detected via content analysis), keep them together
even if they have different prefixes.

**Detection**: Look for imports, includes, or explicit references in frontmatter.

### Grouping Summary Table

| Scenario | Action | Example |
|----------|--------|---------|
| Single component | One task | `commit.md` → 1 task |
| Same prefix, ≤5 | Group into one task | `seo-*.md` (3 files) → 1 task |
| Same prefix, >5 | Split into multiple tasks | `util-*.md` (8 files) → 2 tasks |
| Different types | Separate tasks | `cmd.md` + `agent.md` → 2 tasks |
| Mixed prefixes | Separate by prefix | `seo-*.md` + `api-*.md` → 2 tasks |

## Task Generation

### ID Generation

1. Read `backlog/tasks.json` using Read tool
2. Parse JSON and extract all task IDs
3. Find maximum ID number: `max(int(id.split('-')[1]) for id in task_ids)`
4. Allocate sequential IDs starting from `max + 1`

**Example**:
```
Existing tasks: TASK-208, TASK-207, TASK-181
Max ID: 208
New tasks: TASK-209, TASK-210, TASK-211
```

### Task File Template

Each generated task follows `backlog/templates/feature.md` structure:

```markdown
---
id: TASK-XXX
type: feature
status: backlog
epic_id: EPIC-022
complexity: S
depends_on: []
created: YYYY-MM-DD
work_stream: Framework-Absorption
---

# Absorb [type]: [name]

## Context

Component(s) from [source_project] marked for absorption into simon_tools hub
by the generic-classifier with confidence [avg_confidence].

## Description

Absorb the following [type](s) into simon_tools:

| Component | Source Path | Target Path | Confidence |
|-----------|-------------|-------------|------------|
| [name] | [source_path] | .claude/[type]s/[name].md | [confidence] |

## Acceptance Criteria

- [ ] Component copied to simon_tools hub
- [ ] Frontmatter updated for framework standards
- [ ] No project-specific references remain
- [ ] Integration tested with existing framework
- [ ] CHANGELOG.md updated

## Technical Notes

- **Source**: [source_project_path]
- **Classifier confidence**: [confidence]
- **Grouped with**: [other_components_if_any]
```

### Task Title Format

| Scenario | Title Format |
|----------|-------------|
| Single component | `Absorb [type]: [name]` |
| Multiple components | `Absorb [prefix] [type]s ([count])` |

**Examples**:
- `Absorb command: commit`
- `Absorb seo-validate commands (3)`
- `Absorb data agents (5)`

### File Operations

1. **Write task file**: `backlog/tasks/TASK-XXX.md`
2. **Update tasks.json**: Add entry to `tasks` array
   ```json
   {
     "id": "TASK-XXX",
     "title": "Absorb command: my-command",
     "type": "feature",
     "status": "backlog",
     "complexity": "S",
     "epic_id": "EPIC-022",
     "depends_on": [],
     "created": "YYYY-MM-DD",
     "work_stream": "Framework-Absorption"
   }
   ```

## Processing Steps

Execute these steps in order:

### Step 1: Validate Input

1. Parse classifier_output JSON
2. Verify `generic_components` array exists
3. If empty or missing: Return early with `tasks_created: []`
4. Validate each component has: type, name, path, confidence

### Step 2: Filter Components

1. Extract only `generic_components` (skip overlap/specific)
2. Validate paths start with `.claude/`
3. Log skipped components with reasons

### Step 3: Group Components

1. For each component, extract prefix from name
2. Create groups keyed by `(type, prefix)` tuple
3. Apply grouping rules (max 5 per group)

### Step 4: Determine Task IDs

1. Read `backlog/tasks.json`
2. Find max existing task ID
3. Reserve sequential IDs for each group

### Step 5: Generate Tasks

For each group:
1. Generate task content from template
2. Write to `backlog/tasks/TASK-XXX.md`
3. Prepare tasks.json entry

### Step 6: Update Registry

1. Read current `backlog/tasks.json`
2. Append new task entries
3. Write updated tasks.json

### Step 7: Generate Output

1. Compile `tasks_created` array
2. Calculate summary statistics
3. Return JSON output

## Constraints

### Input Limits
- Maximum 50 components per invocation
- Timeout: 30 seconds for complete processing
- Skip components with confidence < 0.50

### Path Validation
- All component paths must start with `.claude/`
- No path traversal (`..`) allowed
- Skip and warn if path invalid

### File Safety
- Never overwrite existing task files
- If TASK-XXX.md exists, increment ID
- Atomic writes to tasks.json (read-modify-write)

### Error Handling

| Error | Action |
|-------|--------|
| Invalid JSON input | Return error with details |
| tasks.json not found | Return error: "backlog/tasks.json not found" |
| tasks.json parse error | Return error with JSON syntax location |
| Write permission denied | Return error with file path |
| Component limit exceeded | Process first 50, warn about remainder |

## Cross-References

- **Input source**: `generic-classifier.md` (component classification)
- **Classification patterns**: `.claude/skills/framework-adoption-workflow/case-by-case-patterns.md`
- **Consumer**: `onboarding-plan-generator.md` (creates main adoption task)
- **Task template**: `backlog/templates/feature.md`
- **Part of**: EPIC-022 - Framework Adoption Workflow Redesign

