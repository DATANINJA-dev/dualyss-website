# Project Structure Evaluation Patterns

## Evaluation Criteria

### 1. Directory Organization

| Issue | Detection | Severity | Proposal |
|-------|-----------|----------|----------|
| Scattered documentation | .md files in > 3 root folders | Medium | Consolidate in docs/ |
| No source separation | Code files in root | Medium | Create src/ directory |
| Mixed concerns | Tests with source | Low | Create tests/ directory |
| No configuration separation | Config files scattered | Low | Create config/ or use root |

### 2. Standard Files

| File | Purpose | Severity if Missing |
|------|---------|---------------------|
| README.md | Project description | High |
| CLAUDE.md | AI context | Medium (for framework) |
| .gitignore | Git ignore patterns | Medium |
| LICENSE | License declaration | Low (personal projects) |

### 3. Code Project Standards

| Standard | Detection | Severity |
|----------|-----------|----------|
| Test directory | tests/ or __tests__/ exists | Medium |
| Source directory | src/ or lib/ exists | Medium |
| Package manifest | package.json, pyproject.toml | High |
| Lock file | package-lock.json, poetry.lock | Low |

### 4. Documentation Project Standards

| Standard | Detection | Severity |
|----------|-----------|----------|
| Index file | CLAUDE.md with sections | Medium |
| Organized content | Single content directory | Low |
| Clear outputs | deliverables/ or output/ | Low |

## Structure Assessment Algorithm

```
evaluate_structure(path, project_type):
  issues = []
  score = 100  # Start with perfect score

  1. Check standard files
     for file in required_files[project_type]:
       if not exists(file):
         issues.append(missing_file_issue(file))
         score -= file.severity_weight

  2. Check directory organization
     root_files = list_files(path, depth=1)
     if count_by_type(root_files, ".md") > 5:
       issues.append(scattered_docs_issue)
       score -= 10

  3. Check for common anti-patterns
     if project_type == "code":
       if no_test_directory():
         issues.append(no_tests_issue)
         score -= 15

  4. Calculate verdict
     if score >= 80: verdict = "GOOD"
     elif score >= 60: verdict = "NEEDS_IMPROVEMENT"
     else: verdict = "POOR"

  return StructureEvaluation(score, verdict, issues)
```

## Issue Types and Proposals

### scattered_docs

```yaml
type: scattered_docs
description: "Documentation scattered across multiple root directories"
detection:
  - .md files in > 3 different root folders
  - No single docs/ directory
affected:
  - docs/
  - research/
  - notes/
  - content/
proposal:
  action: "Consolidate documentation"
  target: "docs/"
  structure: |
    docs/
    ├── research/      # Background research
    ├── content/       # Main material
    ├── notes/         # Working notes
    └── reference/     # Reference material
priority: medium
effort: low
```

### missing_readme

```yaml
type: missing_readme
description: "No README.md in project root"
detection:
  - README.md not found
proposal:
  action: "Create README.md"
  content: |
    # Project Name

    Brief description of the project.

    ## Getting Started

    [Setup instructions]

    ## Structure

    [Directory overview]
priority: high
effort: low
```

### no_tests

```yaml
type: no_tests
description: "Code project without test directory"
detection:
  - tests/ not found
  - __tests__/ not found
  - No *.test.* or *.spec.* files
proposal:
  action: "Create test structure"
  structure: |
    tests/
    ├── unit/
    ├── integration/
    └── fixtures/
priority: medium
effort: medium
```

### mixed_src_root

```yaml
type: mixed_src_root
description: "Source code files in project root"
detection:
  - .ts, .js, .py files in root (not config)
  - > 3 source files in root
proposal:
  action: "Organize source code"
  structure: |
    src/
    ├── [moved source files]
priority: medium
effort: medium
```

### no_gitignore

```yaml
type: no_gitignore
description: "No .gitignore file"
detection:
  - .gitignore not found
proposal:
  action: "Create .gitignore"
  content: |
    # Detect from project type
    node_modules/      # if package.json
    __pycache__/       # if Python
    .env               # always
    .DS_Store          # always
priority: medium
effort: low
```

## Improvement Application

### Interactive Mode

```
Structure Evaluation: NEEDS_IMPROVEMENT (Score: 65/100)

Issues found:
1. [HIGH] Missing README.md
2. [MEDIUM] Documentation scattered (5 folders)
3. [MEDIUM] No test directory

Options:
[A] Apply all improvements automatically (with backup)
[R] Review proposals one by one
[S] Skip structure improvements, continue with installation
[M] Modify proposals before applying
```

### Automatic Mode (--auto flag)

```
Structure improvements applied:
  ✓ Created README.md with template
  ✓ Created tests/ directory
  ✗ Skipped doc consolidation (requires manual review)

Backup created: .backup/structure-2026-01-19/
```

## Migration Steps Generator

When improvements are accepted:

```
generate_migration_steps(issues):
  steps = []

  1. Create backup
     steps.append("mkdir -p .backup/structure-$(date)")

  2. Create missing directories
     for issue in issues.filter(type=missing_dir):
       steps.append(f"mkdir -p {issue.target}")

  3. Create missing files
     for issue in issues.filter(type=missing_file):
       steps.append(f"create {issue.file} with template")

  4. Move files (if reorganizing)
     for issue in issues.filter(type=reorganize):
       for file in issue.affected:
         steps.append(f"mv {file} {issue.target}/")

  5. Update references
     steps.append("Update CLAUDE.md with new structure")
     steps.append("Update any import paths")

  return steps
```

## Constraints

- Never delete files (only move with backup)
- Maximum 20 migration steps
- Always create backup before any changes
- Require confirmation for file moves
- Skip improvements if --preserve-structure flag
