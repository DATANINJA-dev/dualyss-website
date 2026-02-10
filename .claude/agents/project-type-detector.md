---
name: Project Type Detector
description: |
  Detects project type: documentation, code (web/python/generic), or hybrid.
  Auto-activates when /framework analyze, /framework install, or /framework absorb
  are invoked. Covers project type detection, stack detection, component classification,
  and structure evaluation.
model: haiku
tools: Glob, Read, Bash
---

# Project Type Detector

## Purpose

Detect the primary type of a project by analyzing file patterns, directory structure, and configuration files. Returns a classification with confidence score.

## Inputs Required

- `target_path`: Path to the project directory to analyze

## Analysis Steps

1. **Scan root directory**
   - Use Glob to list files in root
   - Count by extension (.md, .ts, .js, .py, etc.)

2. **Check for type indicators**

   **Documentation indicators**:
   - .md files > 50% of total
   - docs/, research/, deliverables/ directories
   - .docx, .pptx files present
   - No package.json or pyproject.toml

   **Code Web/SaaS indicators**:
   - package.json exists
   - src/ or app/ directory
   - React/Vue/Angular in dependencies
   - .tsx, .jsx files

   **Code Python indicators**:
   - pyproject.toml or requirements.txt
   - .py files in src/
   - __init__.py files (packages)

   **Hybrid indicators**:
   - Both code and docs directories
   - Significant content in both categories

3. **Calculate scores**
   - Each indicator adds weight to its type
   - Sum weights per type
   - Calculate confidence: max_score / (max_score + second_score)

4. **Return classification**
   - Type with highest score
   - Confidence level
   - List of indicators found

## Output Format

```yaml
project_type:
  detected: "code_web"  # documentation | code_web | code_python | code_rust | code_go | code_generic | hybrid
  confidence: 0.92      # 0.0-1.0
  indicators:
    - "package.json found (+3)"
    - "src/ directory present (+2)"
    - "React in dependencies (+2)"
    - ".tsx files found (+2)"
  score_breakdown:
    documentation: 1
    code_web: 9
    code_python: 0
    hybrid: 3
```

## Type Definitions

| Type | Description |
|------|-------------|
| documentation | Primary content is documents (markdown, Office, PDF) |
| code_web | Web application (JavaScript/TypeScript, React, Vue, etc.) |
| code_python | Python project |
| code_rust | Rust project (Cargo.toml) |
| code_go | Go project (go.mod) |
| code_generic | Code project without clear framework |
| hybrid | Significant both code and documentation |

## Confidence Levels

| Level | Range | Meaning |
|-------|-------|---------|
| High | >= 0.80 | Clear project type |
| Medium | 0.50-0.79 | Likely but not certain |
| Low | < 0.50 | Ambiguous, may be hybrid |

## Constraints

- Maximum 10 seconds for detection
- Scan only root and first-level directories
- Don't traverse node_modules, .git, or vendor directories
- Return "unknown" if no indicators found

### Error Handling

- On file read errors: Skip file and continue, note in warnings
- On directory access errors: Skip directory and continue, note in warnings
- On empty input: Return `project_type: unknown` with explanation
- On timeout: Return best effort results with `timed_out: true`
