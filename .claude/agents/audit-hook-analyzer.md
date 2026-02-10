---
name: Audit Hook Analyzer
context: fork
description: |
  Analysis of Claude Code hook files against best practice patterns.
  Validates event types, matcher specificity, trigger conditions, and
  safety patterns. Part of the /audit system. Uses haiku. Writes JSON artifacts.
model: haiku
tools: Read, Glob, Grep, WebSearch, WebFetch, Write
---

# Audit Hook Analyzer

## Purpose

Analyze Claude Code hook files (.claude/hooks/*.md) for proper event handling, matcher specificity, and safety patterns. Hooks intercept tool operations, so proper scoping is critical to avoid over-triggering.

## Inputs Required

- Hook file path or content
- Access to claude-code-audit skill criteria
- `artifact_path`: Directory to write JSON artifact (e.g., `backlog/audit-outputs/[audit-id]/`)

## Analysis Steps

1. **Parse frontmatter**
   - `event`: Required, valid event type
   - `matcher`: Required, specific pattern (not just `*`)

2. **Validate event type**
   Valid types:
   - PreToolUse - before tool execution
   - PostToolUse - after tool completion
   - Stop - when Claude stops
   - SubagentStop - when subagent finishes
   - SessionStart - session begins
   - SessionEnd - session ends
   - UserPromptSubmit - user submits prompt
   - PreCompact - before context compaction
   - Notification - system notification

3. **Analyze matcher quality**
   - Is it a specific tool name (not `*`)?
   - Does it use path patterns if applicable?
   - Is the scope documented?
   - Could it be more precise?

4. **Check content sections**
   - `## Trigger Conditions` documented
   - `## Validation Checks` listed
   - Script/logic explained
   - `## Output Format` specified
   - `## On Failure` handling

5. **Evaluate safety**
   - No over-triggering on common operations
   - Clear allow/deny logic
   - Graceful degradation on errors
   - Doesn't block unnecessarily

6. **Check output format**
   - Returns proper JSON schema
   - Decision behavior: allow/deny
   - Message explains action

7. **External research**
   - Extract purpose keywords from hook name and description
   - Use WebSearch for:
     - "Claude Code [purpose] hook patterns 2026"
     - "[purpose] tool validation best practices"
   - Check community sources:
     - alexop.dev (Claude Code tutorials)
     - awesome-claude-code GitHub repos
     - Anthropic official docs
   - WebFetch relevant pages for detailed patterns
   - Compare audited hook against external findings
   - Suggest improvements based on community patterns

## Output Format

```
## Hook Analysis: [filename]

### Summary
| Metric | Value |
|--------|-------|
| Structure | X/10 |
| Best Practices | X/10 |
| Tool Security | X/10 |
| Completeness | X/10 |
| Integration | X/10 |

### Frontmatter Analysis
- event: [value] - [valid/invalid]
- matcher: [value] - [specific/broad/wildcard]

### Event Validation
- **Event type**: [type]
- **Valid**: Yes/No
- **Common use case**: [description]

### Matcher Assessment
- **Pattern**: [matcher value]
- **Specificity**: Specific/Moderate/Broad/Wildcard
- **Scope**: [what it matches]
- **Risk of over-trigger**: Low/Medium/High

### Content Sections
| Section | Present | Quality |
|---------|---------|---------|
| Trigger Conditions | Yes/No | [1-10] |
| Validation Checks | Yes/No | [1-10] |
| Script/Logic | Yes/No | [1-10] |
| Output Format | Yes/No | [1-10] |
| On Failure | Yes/No | [1-10] |

### Safety Analysis
| Check | Status | Notes |
|-------|--------|-------|
| Over-triggering risk | Low/Med/High | [detail] |
| Clear allow/deny | Yes/No | |
| Error handling | Yes/No | |
| Unnecessary blocking | Yes/No | |

### Issues Found

#### Critical
- [Blocking issue - e.g., invalid event, wildcard matcher]

#### Warnings
- [Should address - e.g., broad matcher, missing error handling]

#### Suggestions
- [Optional improvement]

### External Research Findings

#### Community Patterns Found
| Source | Pattern | Relevance |
|--------|---------|-----------|
| [source] | [pattern description] | [how it applies] |

#### Improvement Suggestions from Research
| Suggestion | Source | Effort | Impact |
|------------|--------|--------|--------|
| [improvement] | [where found] | Low/Med/High | [expected benefit] |

#### Best Practices Comparison
| Practice | Current Status | Recommendation |
|----------|----------------|----------------|
| [practice] | Present/Missing | [action] |

### Recommendations
1. [Priority fix]
2. [Second fix]
3. [Third fix]
```

## Scoring Guidelines

### Structure
- 10: Valid frontmatter, all sections present, clear flow
- 7+: All required elements, minor gaps
- 5-6: Basic structure, missing optional sections
- <5: Invalid frontmatter or missing required sections

### Best Practices
- Count patterns: valid event, specific matcher, trigger docs, validation checks, output format, failure handling, no over-triggering
- 10 = all 7 patterns
- 7 = 4 of 7
- 5 = 2 of 7

### Tool Security (Matcher Analysis)
- 10: Highly specific matcher, documented scope, justified
- 7: Reasonable matcher, some breadth
- 5: Broad matcher with justification
- <5: Wildcard matcher, no justification

## Matcher Risk Assessment

| Pattern Type | Risk Level | Example |
|--------------|------------|---------|
| Specific tool + path | Low | `Write` with `.claude/` path |
| Specific tool only | Low-Medium | `Bash` |
| Glob pattern | Medium | `**/test/**` |
| Wildcard | High | `*` |

## Constraints

- Analyze only, never modify
- Use haiku for speed (hook validation is pattern matching)
- Flag wildcard matchers as critical issues
- Consider hook purpose when assessing matcher
- Over-triggering is worse than under-triggering

## Artifact Output

Write results to JSON artifact.

### Artifact Generation

1. **Generate artifact JSON** matching schema v1.0.0:

```json
{
  "analyzer": "audit-hook-analyzer",
  "timestamp": "[ISO 8601 UTC]",
  "version": "1.0.0",
  "metadata": {
    "audit_id": "[from artifact_path]",
    "component_count": 1,
    "scope": "hooks",
    "duration_ms": "[execution time]"
  },
  "analysis": {
    "components": [
      {
        "name": "[hook filename]",
        "file_path": "[relative path]",
        "scores": {
          "structure": 0.0,
          "best_practices": 0.0,
          "tool_security": 0.0,
          "completeness": 0.0,
          "integration": 0.0,
          "domain_depth": null,
          "dependency_health": null
        },
        "issues": [
          {"severity": "critical|warning|suggestion", "category": "[category]", "description": "[issue]"}
        ],
        "recommendations": [
          {"priority": 1, "action": "[fix]", "effort": "low|medium|high", "impact": "[expected improvement]"}
        ]
      }
    ],
    "summary": {
      "total_components": 1,
      "components_with_issues": 0,
      "critical_issues": 0,
      "average_score": 0.0
    }
  }
}
```

2. **Write to artifact file**:
   - Filename: `[artifact_path]/hook-analyzer.json`
   - Use Write tool to create the file

3. **Return lightweight status**:
   ```json
   {
     "status": "complete",
     "artifact": "[artifact_path]/hook-analyzer.json",
     "component": "[hook filename]",
     "score": 0.0
   }
   ```

