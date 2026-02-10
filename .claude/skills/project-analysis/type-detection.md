# Project Type Detection Patterns

## Detection Algorithm

```
detect_project_type(path):
  1. Scan root directory for indicators
  2. Score each type based on indicators found
  3. Return highest-scoring type with confidence

  Types:
    - documentation: High docs, low code
    - code_web: package.json + frontend patterns
    - code_python: pyproject.toml or requirements.txt
    - code_rust: Cargo.toml
    - code_go: go.mod
    - code_generic: Code files without clear framework
    - hybrid: Significant both code and docs
```

## Type Indicators

### Documentation Project

| Indicator | Weight | Detection Method |
|-----------|--------|------------------|
| .md files > 50% | +3 | Glob **/*.md count vs total |
| docs/ or research/ | +2 | Directory exists |
| .docx, .pptx files | +2 | Glob for Office files |
| No package.json/pyproject.toml | +2 | File not found |
| CLAUDE.md with content index | +1 | Parse CLAUDE.md sections |

**Example structures**:
```
workshop/
├── CLAUDE.md          # Content index
├── content/           # Main material
├── research/          # Background research
├── deliverables/      # Final outputs
└── reference/         # Reference material
```

### Code Web/SaaS Project

| Indicator | Weight | Detection Method |
|-----------|--------|------------------|
| package.json | +3 | File exists |
| src/ or app/ | +2 | Directory exists |
| React/Vue/Angular deps | +2 | Parse package.json |
| .tsx, .jsx files | +2 | Glob for JSX |
| next.config.js or vite.config.ts | +1 | Config file exists |

**Example structures**:
```
saas-app/
├── package.json
├── src/
│   ├── components/
│   ├── pages/
│   └── lib/
├── tests/
└── public/
```

### Code Python Project

| Indicator | Weight | Detection Method |
|-----------|--------|------------------|
| pyproject.toml | +3 | File exists |
| requirements.txt | +2 | File exists |
| setup.py | +2 | File exists |
| *.py files in src/ | +2 | Glob src/**/*.py |
| __init__.py files | +1 | Indicates packages |

**Example structures**:
```
python-project/
├── pyproject.toml
├── src/
│   └── package_name/
│       └── __init__.py
├── tests/
└── scripts/
```

### Hybrid Project

| Indicator | Weight | Detection Method |
|-----------|--------|------------------|
| Code indicators > 5 | +2 | Sum code weights |
| Doc indicators > 5 | +2 | Sum doc weights |
| Both src/ and docs/ | +2 | Both directories exist |
| README.md + package.json | +1 | Both files exist |

## Confidence Calculation

```
confidence = max_score / (max_score + second_score)

Example:
  documentation_score = 8
  code_web_score = 2

  confidence = 8 / (8 + 2) = 0.80 (high)
```

| Confidence | Level | Meaning |
|------------|-------|---------|
| >= 0.80 | High | Clear project type |
| 0.50-0.79 | Medium | Likely but not certain |
| < 0.50 | Low | Ambiguous, may be hybrid |

## Edge Cases

1. **Empty project**: Return type="unknown", confidence=0
2. **Only .git**: Return type="new", recommend /framework init
3. **Monorepo**: Detect subdirectories, return type="monorepo"
4. **Mixed signals**: Return type="hybrid" with sub-type breakdown
