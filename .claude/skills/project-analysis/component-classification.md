# Component Classification Patterns

## Classification Categories

### 1. Generic (Framework-Reusable)

Components that can be absorbed into the framework and reused across projects.

**Positive signals (add confidence)**:
- Uses generic terminology ("project", "file", "task") not specific entities
- No hardcoded paths (or uses relative paths / environment variables)
- No project-specific API endpoints
- Documentation uses placeholder examples
- Logic applies to multiple domains
- Following established patterns (research, document, review)

**Negative signals (reduce confidence)**:
- References specific directories (e.g., "/Users/john/my-project")
- Contains project-specific credentials or API keys
- Tightly coupled to specific domain model

### 2. Specific (Project-Only)

Components that should remain local to the project.

**Positive signals**:
- References specific project files or directories
- Uses project-specific terminology in logic
- Integrates with project-specific APIs or services
- Contains project-specific configuration
- Depends on project-specific state

**Examples**:
- `deploy-to-production.md` - Specific deployment target
- `update-client-database.md` - Specific database
- `send-weekly-report.md` - Specific business process

### 3. Framework-Overlap

Components with same name or purpose as existing framework components.

**Detection**:
```
overlap = component_name in framework_components
       OR component_purpose similar_to framework_purpose
```

**Resolution strategies**:
- `rename`: Add `local-` prefix to project component
- `merge`: Combine functionality (if compatible)
- `replace`: Use framework version, archive local
- `keep_local`: Framework version not suitable, keep local only

## Classification Algorithm

```
classify_component(component, framework_components):
  1. Check for framework overlap
     - If name matches: return "framework_overlap"

  2. Scan for project-specific patterns
     - Hardcoded paths: +30% specific
     - Project API references: +25% specific
     - Domain-specific entities: +20% specific

  3. Scan for generic patterns
     - Generic terminology: +25% generic
     - Relative paths only: +20% generic
     - Pattern-based logic: +25% generic

  4. Calculate scores
     generic_score = sum(generic_signals)
     specific_score = sum(specific_signals)

  5. Determine classification
     if generic_score > specific_score + 20%:
       return "generic"
     elif specific_score > generic_score + 20%:
       return "specific"
     else:
       return "ambiguous" (requires user decision)

  6. Calculate confidence
     confidence = abs(generic_score - specific_score) / 100
```

## Heuristics by Component Type

### Commands

| Check | Generic Signal | Specific Signal |
|-------|----------------|-----------------|
| File references | Relative, configurable | Absolute, hardcoded |
| API calls | Generic patterns (REST, GraphQL) | Project-specific endpoints |
| Output format | Standard (markdown, JSON) | Project-specific format |
| Dependencies | Framework tools only | Project-specific tools |

### Agents

| Check | Generic Signal | Specific Signal |
|-------|----------------|-----------------|
| Analysis scope | Any codebase | Specific directory structure |
| Output | Generic recommendations | Project-specific actions |
| Tools used | Framework standard | Project-specific MCPs |

### Skills

| Check | Generic Signal | Specific Signal |
|-------|----------------|-----------------|
| Patterns | Industry standard | Company-specific |
| Activation triggers | Generic keywords | Project-specific keywords |
| Supporting files | Templates, examples | Project configurations |

## Confidence Thresholds

| Confidence | Action |
|------------|--------|
| >= 0.85 | Auto-classify, no confirmation needed |
| 0.70-0.84 | Show classification with confidence |
| 0.50-0.69 | Request user confirmation |
| < 0.50 | Cannot determine, require explicit choice |

## Examples

### Generic Command (High Confidence)

```yaml
# /research command
- Uses AskUserQuestion for context: Generic pattern
- Writes to user-specified path: Not hardcoded
- Analysis methodology: Standard research steps
- No project-specific integrations

Classification: generic
Confidence: 0.92
Reason: "Standard research workflow applicable to any project"
```

### Specific Command (High Confidence)

```yaml
# /deploy-staging command
- Targets: staging.mycompany.com
- Uses: company-specific CI/CD
- Requires: MYCOMPANY_API_KEY
- Integrates: internal monitoring

Classification: specific
Confidence: 0.95
Reason: "Hardcoded deployment target and company-specific integrations"
```

### Ambiguous Command (Low Confidence)

```yaml
# /generate-report command
- Generic: Uses markdown output
- Specific: References "client" entity
- Generic: Standard analysis patterns
- Specific: Mentions "quarterly" which may be company-specific

Classification: ambiguous
Confidence: 0.45
Action: Request user decision
```

## User Decision Prompt

When confidence is low:

```
The following component could not be automatically classified:

Component: generate-report.md
Type: command

Signals found:
  Generic: Markdown output, standard analysis
  Specific: References "client" entity, "quarterly" timing

Please classify:
[G] Generic - Absorb to framework (will generalize references)
[S] Specific - Keep local only
[R] Review - Show me the component content first
```
