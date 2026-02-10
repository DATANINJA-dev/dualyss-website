---
name: project-analysis
description: |
  Provides patterns for analyzing target projects before framework installation.
  Auto-activates when /framework analyze, /framework install, or /framework absorb
  are invoked. Covers project type detection, stack detection, component classification,
  and structure evaluation.
---

# Project Analysis Skill

This skill provides frameworks for analyzing projects to enable intelligent framework installation and component absorption.

## When This Skill Activates

- `/framework analyze` command execution
- `/framework install` context detection phase
- `/framework absorb` component classification
- Any task involving project type detection
- Component classification decisions (generic vs specific)

## Core Analysis Principles

1. **Type-first detection** - Identify project type before detailed analysis
2. **Distributed context** - Gather context from multiple sources (CLAUDE.md, README, docs/, src/)
3. **Non-invasive scanning** - Read-only analysis, never modify during analyze phase
4. **Actionable output** - Every finding should have a recommended action
5. **Classification confidence** - Report confidence levels for component classification

## Supporting Files

- `type-detection.md` - Project type detection patterns
- `stack-detection.md` - Technology stack identification
- `component-classification.md` - Generic vs specific classification heuristics
- `structure-evaluation.md` - Project structure assessment and improvement proposals
- `stack-mappings.md` - Stack-to-skill/agent recommendation mappings

## Project Types

| Type | Indicators | Typical Structure |
|------|------------|-------------------|
| **Documentation** | .md, .docx, .pptx, PDF predominant | docs/, research/, deliverables/ |
| **Code Web/SaaS** | package.json, src/, .ts/.js | src/, components/, tests/, lib/ |
| **Code Python** | pyproject.toml, requirements.txt | src/, tests/, scripts/ |
| **Code Rust** | Cargo.toml | src/, tests/ |
| **Code Go** | go.mod | cmd/, pkg/, internal/ |
| **Hybrid** | Significant code + documentation | Both structures |

## Component Classification

### Generic (Framework-Reusable)

Components are classified as **generic** when:
- No hardcoded file paths specific to the project
- No project-specific API endpoints or credentials
- Patterns are reusable across multiple projects
- Documentation uses generic examples
- No references to specific project entities (users, products, etc.)

### Specific (Project-Only)

Components are classified as **specific** when:
- Contains hardcoded paths to project files
- References project-specific APIs or services
- Uses project-specific terminology in logic (not just examples)
- Tightly coupled to project domain model

### Framework-Overlap

Components **overlap with framework** when:
- Same filename exists in framework
- Same purpose as existing framework component
- Potential conflict during installation

## Analysis Report Format

```yaml
project_analysis:
  timestamp: "ISO-8601"
  target_path: "/path/to/project"

  project_type:
    detected: "code_web"  # documentation, code_web, code_python, hybrid
    confidence: 0.95
    indicators:
      - "package.json found"
      - "src/ directory present"
      - "React dependencies detected"

  tech_stack:
    languages: ["typescript", "javascript"]
    frameworks: ["react", "next.js"]
    package_manager: "npm"
    detected_from: ["package.json", "tsconfig.json"]

  context_sources:
    - file: "CLAUDE.md"
      sections: ["metadata", "project description", "local notes"]
    - file: "README.md"
      content: "Project description and setup"
    - directory: "docs/"
      files: 5

  existing_claude_config:
    has_claude_dir: true
    commands: ["commit", "review", "custom-workflow"]
    agents: ["custom-reviewer"]
    skills: []
    hooks: []

  component_classification:
    generic:
      - name: "custom-workflow.md"
        type: "command"
        reason: "No project-specific references"
        confidence: 0.85
    specific:
      - name: "project-setup.md"
        type: "command"
        reason: "Hardcoded project paths"
        confidence: 0.90
    framework_overlap:
      - name: "commit.md"
        type: "command"
        reason: "Same name as framework command"
        resolution: "rename to local-commit.md"

  structure_evaluation:
    status: "NEEDS_IMPROVEMENT"  # GOOD, NEEDS_IMPROVEMENT, POOR
    issues:
      - type: "scattered_docs"
        description: "Documentation in multiple root folders"
        affected: ["docs/", "research/", "notes/"]
        proposal: "Consolidate in docs/ with subdirectories"
        priority: "medium"
    recommendations:
      - action: "Create README.md"
        priority: "high"
      - action: "Add tests/ directory"
        priority: "medium"

  migration_plan:
    strategy: "clean_install"  # clean_install, merge, preserve_local
    steps:
      - "Backup existing .claude/ to .backup/"
      - "Install framework with --clean"
      - "Absorb generic components: custom-workflow.md"
      - "Keep specific components in local-*"
    estimated_conflicts: 1
```

## Constraints

- Maximum 30 seconds for full analysis
- Maximum 100 files scanned per directory
- Report size capped at 50KB
- Confidence thresholds: high > 0.8, medium 0.5-0.8, low < 0.5
- Always provide actionable recommendations

## Usage

This skill is automatically activated when project analysis agents run. Agents reference these patterns to ensure consistent:
- Project type detection
- Technology stack identification
- Component classification
- Structure evaluation and recommendations
