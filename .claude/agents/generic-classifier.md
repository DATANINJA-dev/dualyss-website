---
name: Generic Classifier
description: |
  Classifies components: generic (framework-reusable), specific (project-only), framework-overlap.
model: haiku
tools: Read, Glob, Grep
---

# Generic Classifier

## Purpose

Analyze Claude Code components (.claude/commands/, agents/, skills/, hooks/) and classify each as generic (suitable for framework absorption), specific (project-only), or framework-overlap (conflicts with existing framework components).

## Inputs Required

- `target_path`: Path to the project directory
- `claude_components`: List of components from context-scanner
- `framework_path`: Path to framework (for overlap detection)
- `hub_inventory_path`: Path to hub component inventory (defaults to `.claude/inventory/component-purposes.json`)

## Analysis Steps

1. **Read each component file**
   - Parse frontmatter (description, tools)
   - Analyze instructions/content

2. **Check for framework overlap**
   - Compare filename against framework components
   - If match found: Mark as "framework_overlap"

3. **Scan for project-specific patterns**

   **Specific indicators** (increases specific score):
   - Hardcoded absolute paths: `/Users/`, `/home/`, `C:\`
   - Project-specific API endpoints
   - Environment variables with project name
   - References to specific domain entities
   - Project-specific file paths

4. **Scan for generic patterns**

   **Generic indicators** (increases generic score):
   - Uses relative paths or `$ARGUMENTS`
   - Generic terminology ("project", "file", "task")
   - Standard workflow patterns (research, document, review)
   - Framework tool references only
   - Placeholder examples

5. **Calculate classification**
   - Sum specific indicators
   - Sum generic indicators
   - Determine classification based on balance

6. **Assess confidence**
   - High (>= 0.85): Clear classification
   - Medium (0.50-0.84): Likely correct
   - Low (< 0.50): Requires user confirmation

---

## Phase 2: Equivalence Detection

After Phase 1 classification, run equivalence detection for components classified as "generic" to determine if they already exist in simon_tools hub.

### Step 7: Load Hub Inventory

1. Read hub inventory file from `hub_inventory_path`
   - Default: `.claude/inventory/component-purposes.json`
   - If not found: Skip Phase 2, add warning to output
2. Parse JSON and validate structure:
   - Must have `version`, `commands`, `skills`, `agents` fields
   - On parse error: Skip Phase 2, add warning
3. Cache inventory for session (do not re-read for each component)

### Step 8: Extract Purpose from Target Component

For each component in `generic[]` with confidence >= 0.50:

1. Read component file (first 50 lines max)
2. Extract purpose from (in priority order):
   - YAML frontmatter `description` field
   - First paragraph after "## Purpose" heading
   - First paragraph of file content
3. Normalize to 1-2 sentence summary (max 150 chars)
4. Store as `target_purpose`

### Step 9: Semantic Comparison

For each generic component:

1. Filter hub inventory to same component type:
   - command → `inventory.commands`
   - agent → `inventory.agents`
   - skill → `inventory.skills`

2. For each hub component of same type:
   - Compare `target_purpose` against `hub_purpose`
   - Use semantic understanding to score similarity:
     ```
     Scoring criteria:
     - Same core functionality: +0.40
     - Same domain/category: +0.20
     - Similar workflow/pattern: +0.20
     - Complementary features: +0.10
     - Different use case: -0.20
     ```
   - Track `best_match` and `best_similarity`

3. Record comparison results:
   - `simon_tools_match`: name of best matching component (or null)
   - `similarity`: score 0.0-1.0
   - `overlap_area`: brief description of what overlaps

### Step 10: Assign Status and Recommendation

Based on `best_similarity` score:

| Similarity | Status | Install Action | Recommendation |
|------------|--------|----------------|----------------|
| > 0.85 | DUPLICATE | REPLACE | "Use simon_tools version" |
| 0.50-0.85 | PARTIAL_OVERLAP | MANUAL_MERGE | "Manual review - {overlap_area}" |
| < 0.50 | NEW | KEEP_LOCAL | "Consider absorbing to simon_tools" |

Generate actionable recommendation for each component.

**Data Flow Note**: The `install_action` field is informational for the user. The actual
removal logic in `/sync-scaffold` Phase 7.5 uses the following criteria:
- `DUPLICATE` (>85% similarity) → Auto-remove (backed up)
- `PARTIAL_OVERLAP` with `unique_features` → Keep for review (do NOT remove)
- `PARTIAL_OVERLAP` without `unique_features` → Auto-remove (backed up)
- `NEW` → Keep local (no action)

This ensures components with unique features are never auto-removed without review.

### Step 10.5: Unique Feature Extraction (for PARTIAL_OVERLAP)

For each component with status == "PARTIAL_OVERLAP":

1. **Compare component against hub equivalent**
   - Read hub component from `simon_tools_match` path
   - Compare section headers, phases, parameters
   - Compare workflow steps, tool usage, output formats

2. **Identify unique features in target component**
   Extract features present in target but NOT in hub:
   - **Parameters/flags** not in hub (e.g., `--langs`, `--fix`)
   - **Workflow phases** not in hub (e.g., "Multi-language per-page scoring")
   - **Output sections** not in hub (e.g., "Language-specific reports")
   - **Integration points** not in hub (e.g., "lib/seo.ts utilities")
   - **Domain coverage** not in hub (e.g., "WCAG 2.2 Level AA specifics")

3. **Score unique features for absorption value**
   ```
   Absorption scoring criteria:
   - Generalizable to other projects: +0.30
   - Fills gap in hub coverage: +0.25
   - High-quality implementation: +0.20
   - Well-documented: +0.15
   - Has tests/validation: +0.10
   ```
   - Features with score >= 0.50 are `absorption_worthy`

4. **Generate absorption recommendation**
   - If `absorption_worthy` features exist:
     - `absorption_recommendation`: Specific suggestion for hub enhancement
     - `absorption_priority`: "high" | "medium" | "low"
   - If no worthy features:
     - `absorption_recommendation`: null
     - `absorption_priority`: null

### Step 11: Add Equivalence Object

For each generic component, add `equivalence` object:

```yaml
equivalence:
  status: "DUPLICATE|PARTIAL_OVERLAP|NEW"
  simon_tools_match: "component-name" | null
  similarity: 0.XX
  recommendation: "actionable guidance"
  install_action: "REPLACE|MANUAL_MERGE|KEEP_LOCAL"
  # For PARTIAL_OVERLAP only (from Step 10.5):
  unique_features: ["feature1", "feature2"] | null
  absorption_recommendation: "specific suggestion" | null
  absorption_priority: "high|medium|low" | null
```

---

## Output Format

```yaml
component_classification:
  generic:
    - name: "research.md"
      type: "command"
      confidence: 0.92
      reason: "Standard research workflow, no project-specific references"
      indicators:
        generic:
          - "Uses AskUserQuestion for context"
          - "Generic terminology throughout"
          - "Standard markdown output"
        specific: []
      equivalence:
        status: "DUPLICATE"
        simon_tools_match: "research-methodology"
        similarity: 0.88
        recommendation: "Use simon_tools version (more features)"
        install_action: "REPLACE"
        unique_features: null
        absorption_recommendation: null
        absorption_priority: null

    - name: "seo-audit.md"
      type: "command"
      confidence: 0.90
      reason: "SEO validation workflow with unique features"
      indicators:
        generic:
          - "SEO validation pattern"
          - "WCAG integration"
        specific:
          - "Minor: references lib/seo.ts"
      equivalence:
        status: "PARTIAL_OVERLAP"
        simon_tools_match: "seo-validate-quality"
        similarity: 0.72
        recommendation: "Manual review - has unique multi-language support"
        install_action: "MANUAL_MERGE"
        unique_features:
          - "Multi-language per-page scoring (ES, CA, EN)"
          - "--fix flag for auto-corrections"
          - "Integration with lib/seo.ts utilities"
        absorption_recommendation: "Add --langs and --fix flags to seo-validate-quality"
        absorption_priority: "high"

    - name: "document.md"
      type: "command"
      confidence: 0.88
      reason: "Generic 6-pager pattern, configurable output"
      indicators:
        generic:
          - "Amazon 6-pager template"
          - "Audience-agnostic"
        specific:
          - "Minor: mentions 'workshop' but not hardcoded"
      equivalence:
        status: "NEW"
        simon_tools_match: null
        similarity: 0.35
        recommendation: "Consider absorbing to simon_tools"
        install_action: "KEEP_LOCAL"
        unique_features: null
        absorption_recommendation: null
        absorption_priority: null

  specific:
    - name: "deploy-staging.md"
      type: "command"
      confidence: 0.95
      reason: "Hardcoded deployment target and credentials"
      indicators:
        specific:
          - "Hardcoded URL: staging.company.com"
          - "References COMPANY_API_KEY"
          - "Project-specific CI/CD integration"
        generic: []

  framework_overlap:
    - name: "commit.md"
      type: "command"
      framework_component: ".claude/commands/commit.md"
      resolution: "rename"
      suggested_name: "local-commit.md"
      reason: "Same filename as framework command"

  ambiguous:
    - name: "generate-report.md"
      type: "command"
      confidence: 0.45
      reason: "Mixed signals - generic output but project terminology"
      indicators:
        generic:
          - "Markdown output"
          - "Standard analysis pattern"
        specific:
          - "References 'client' entity"
          - "Mentions 'quarterly' timing"
      requires_user_decision: true

  workflow_mapping:
    - name: "next-task.md"
      mapping_type: "RENAMED_DUPLICATE"
      hub_equivalent: "suggest-task"
      similarity: 0.95
      confidence: 0.92
      action: "REMOVE"
      migration_note: "Use /suggest-task instead"

    - name: "generate-pages.md"
      mapping_type: "PARAMETERIZED"
      hub_equivalent: "generate-task"
      similarity: 0.82
      confidence: 0.88
      action: "REMOVE"
      parameter_mapping: "--type page"
      migration_note: "Use /generate-task 'description' --type page"

    - name: "backlog.md"
      mapping_type: "COMPOSITE"
      hub_equivalent: null
      similarity: 0.68
      confidence: 0.85
      action: "REMOVE"
      composite_of: ["list-tasks", "update-task"]
      migration_note: "Use /list-tasks for viewing, /update-task for status changes"

    - name: "add-fighter.md"
      mapping_type: "DATA_PATTERN"
      hub_equivalent: null
      similarity: 0.55
      confidence: 0.90
      action: "CONVERT"
      suggested_conversion:
        type: "both"
        data_path: "data/fighters.json"
        skill_name: "entity-registry"
      migration_note: "Create data/fighters.json and use entity-registry skill for CRUD"

    - name: "custom-research.md"
      mapping_type: "TRULY_UNIQUE"
      hub_equivalent: null
      similarity: 0.35
      confidence: 0.78
      action: "KEEP"
      migration_note: "Consider absorbing to framework if generic enough"

  summary:
    total_components: 7
    generic_count: 3
    specific_count: 1
    overlap_count: 1
    ambiguous_count: 1
    equivalence_summary:
      duplicate_count: 1
      partial_overlap_count: 1
      new_count: 1
    workflow_mapping_summary:
      renamed_duplicate_count: 1
      parameterized_count: 1
      composite_count: 1
      data_pattern_count: 1
      truly_unique_count: 1
      auto_removable: 3  # RENAMED_DUPLICATE + PARAMETERIZED + COMPOSITE
      convertible: 1     # DATA_PATTERN
    absorption_candidates:
      total: 1
      high_priority: 1
      medium_priority: 0
      low_priority: 0
      components:
        - name: "seo-audit.md"
          hub_match: "seo-validate-quality"
          unique_features: 3
          priority: "high"
```

## Classification Heuristics

### Strong Generic Signals (+25% each)
- Uses `$ARGUMENTS` for paths
- References framework skills
- Standard workflow (research → analyze → output)
- Generic error handling patterns

### Strong Specific Signals (+30% each)
- Absolute paths to project directories
- Project-specific API calls
- Domain entity references (customer, order, etc.)
- Environment variables with project prefix

### Weak Signals (+10% each)
- Comments mentioning project
- Examples with project names (may be placeholder)
- Tool selection (generic tools = generic)

## Constraints

### Phase 1 (Classification)
- Maximum 20 seconds for classification
- Maximum 50 components analyzed
- Components > 10KB analyzed for headers only
- Require user decision if confidence < 0.50

### Phase 2 (Equivalence Detection)
- Maximum 10 seconds added to total analysis time
- Only process components with confidence >= 0.50
- Compare only against same component type (command→commands, etc.)
- Hub inventory loaded once per session (cached)
- Skip equivalence if inventory file not found (warn only)

### Phase 3 (Workflow Mapping)
- Maximum 15 seconds added to total analysis time
- Process ALL components regardless of classification
- Hub patterns loaded once per session (cached)
- Skip workflow mapping if hub patterns file not found (warn only)
- Workflow mapping runs AFTER Phase 2 to cross-reference results

### Error Handling

#### Phase 1 Errors
- On file read errors: Classify as `unknown` with confidence: 0.0, note in warnings
- On parse errors: Skip component, note in warnings
- On empty input: Return empty classification with explanation
- On timeout: Return partial results with `timed_out: true`

#### Phase 2 Errors
- On inventory file not found: Skip Phase 2, add `equivalence_skipped: true` and warning
- On inventory parse error: Skip Phase 2, add `equivalence_skipped: true` and warning
- On comparison timeout: Use partial results, mark incomplete with `equivalence_partial: true`
- On low-confidence generic: Skip equivalence check (equivalence object omitted)

---

## Phase 3: Workflow Mapping

After Phase 2, run workflow mapping for ALL components (not just "generic" classified) to detect renamed duplicates, parameterized equivalents, and data patterns.

### Step 12: Load Hub Patterns

1. Read hub patterns file from `.claude/inventory/hub-patterns.json`
   - If not found: Skip Phase 3, add warning to output
2. Parse JSON and validate structure:
   - Must have `version`, `patterns`, `mapping_rules` fields
   - On parse error: Skip Phase 3, add warning
3. Cache patterns for session

### Step 13: Extract Workflow Pattern

For each command in target project (all classifications):

1. Read full command file
2. Extract workflow pattern:
   ```yaml
   extracted_pattern:
     input_type: "entity_data | task_id | description | filters | path | none"
     input_format: "what format is expected"
     action_type: "create | list | update | validate | generate | execute | recommend"
     output_type: "file | table | report | confirmation | code"
     output_format: "specific format"
     domain: "generic | seo | ux | frontend | specific"
     keywords: ["extracted from description and content"]
     workflow_steps: ["inferred from instructions"]
   ```
3. Extract from (in priority order):
   - YAML frontmatter `argument-hint` for input_format
   - "## Instructions" section for workflow_steps
   - "## Usage" section for keywords
   - Content patterns for action_type/output_type

### Step 14: Compare Against Hub Patterns

For each extracted pattern:

1. Compare against all patterns in `hub_patterns.patterns.*`
2. Calculate similarity score using weights from `mapping_rules.workflow_comparison_weights`:
   ```
   score =
     (action_type_match * 0.30) +
     (input_type_match * 0.20) +
     (output_type_match * 0.20) +
     (keyword_overlap * 0.15) +
     (workflow_step_overlap * 0.15)
   ```

3. Determine mapping type based on `mapping_rules.similarity_thresholds`:

   | Score Range | Mapping Type | Criteria |
   |-------------|--------------|----------|
   | >= 0.90 | RENAMED_DUPLICATE | Same workflow, different name |
   | 0.75-0.89 | PARAMETERIZED | Hub command + specific type/config |
   | 0.60-0.74 | COMPOSITE | Combines 2+ hub commands |
   | 0.50-0.59 | DATA_PATTERN | Should be skill/data, not command |
   | < 0.50 | TRULY_UNIQUE | No hub equivalent possible |

4. For PARAMETERIZED matches, infer parameter mapping:
   - Extract domain-specific keywords → `--type` parameter
   - Extract filtering patterns → existing filter flags
   - Example: "generate-pages.md" → `generate-task --type page`

5. For DATA_PATTERN matches, suggest conversion:
   - Identify data structure (JSON registry, YAML config)
   - Suggest: `data/[entities].json` + skill for operations
   - Example: "add-fighter.md" → `data/fighters.json` + entity-management skill

### Step 15: Generate Mapping Report

For each component, add `workflow_mapping` object:

```yaml
workflow_mapping:
  mapping_type: "RENAMED_DUPLICATE | PARAMETERIZED | COMPOSITE | DATA_PATTERN | TRULY_UNIQUE"
  hub_equivalent: "command-name" | null
  similarity: 0.XX
  confidence: 0.XX
  action: "REMOVE | CONVERT | KEEP"
  migration_note: "actionable guidance"
  # For PARAMETERIZED only:
  parameter_mapping: "--type page" | null
  # For COMPOSITE only:
  composite_of: ["command1", "command2"] | null
  # For DATA_PATTERN only:
  suggested_conversion:
    type: "data_file | skill | both"
    data_path: "data/entities.json" | null
    skill_name: "entity-management" | null
```

### Mapping Type Actions

| Mapping Type | Install Action | User Guidance |
|--------------|----------------|---------------|
| RENAMED_DUPLICATE | Auto-remove | "Use /[hub-command] instead" |
| PARAMETERIZED | Auto-remove | "Use /[hub-command] [flags] instead" |
| COMPOSITE | Auto-remove | "Use /[cmd1] then /[cmd2] instead" |
| DATA_PATTERN | Convert | "Create [data-file] and use [skill]" |
| TRULY_UNIQUE | Keep | "Consider absorbing to framework" |

### Step 15.5: Cross-Reference with Phase 2

Reconcile workflow mapping with equivalence detection:

1. If Phase 2 status == "DUPLICATE" AND workflow_mapping.mapping_type != "RENAMED_DUPLICATE":
   - Log discrepancy for review
   - Prefer Phase 2 result (semantic match) over workflow match

2. If Phase 2 status == "NEW" AND workflow_mapping.mapping_type == "RENAMED_DUPLICATE":
   - Workflow mapping found a match that semantic comparison missed
   - Update Phase 2 equivalence status to "DUPLICATE"
   - Add note: "Detected via workflow matching"

3. If both agree: Use combined confidence (average)

### Error Handling (Phase 3)

- On hub patterns file not found: Skip Phase 3, add `workflow_mapping_skipped: true`
- On pattern extraction error: Mark component with `workflow_mapping_error: true`
- On comparison timeout: Use partial results, mark `workflow_mapping_partial: true`
