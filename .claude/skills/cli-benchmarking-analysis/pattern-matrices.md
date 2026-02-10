# CLI Pattern Matrices

## Overview

Templates for systematically documenting CLI patterns across multiple tools. Use these matrices to ensure consistent, comprehensive comparison.

## Master Comparison Matrix

### Naming Conventions

| Tool | Pattern | Case | Example | Notes |
|------|---------|------|---------|-------|
| git | verb-noun | lowercase | `git add file` | Industry standard |
| docker | noun verb | lowercase | `docker container create` | Management commands |
| kubectl | verb noun | lowercase | `kubectl get pods` | RESTful mapping |
| gh | noun verb | lowercase | `gh pr create` | GitHub resources |
| heroku | topic:command | lowercase | `heroku apps:create` | Colon separator |
| jira-cli | noun verb | kebab-case | `jira issue create` | Interactive focus |
| [target] | | | | |

### Subcommand Structure

| Tool | Max Depth | Discovery | Grouping | Aliases |
|------|-----------|-----------|----------|---------|
| git | 1 | `git help -a` | By function | Yes (config) |
| docker | 2 | `docker --help` | By resource | Limited |
| kubectl | 1 | `kubectl --help` | By verb | Yes (get=g) |
| gh | 2 | `gh --help` | By resource | Yes |
| heroku | 2 | `heroku help` | By topic | No |
| jira-cli | 2 | `jira --help` | By resource | Limited |
| [target] | | | | |

### Flag Handling

| Tool | Short Flags | Long Flags | Std Names | Order Ind. | Inverse |
|------|-------------|------------|-----------|------------|---------|
| git | Common only | All | -v,-f,-n | Mostly | Some |
| docker | Common only | All | -d,-p,-v | Yes | --no-* |
| kubectl | Common only | All | -o,-n,-l | Yes | Limited |
| gh | Common only | All | -R,-H,-B | Yes | --no-* |
| heroku | Rare | All | -a,-r | Yes | Limited |
| jira-cli | Common only | All | -p,-s | Yes | Limited |
| [target] | | | | | |

### Help System

| Tool | -h | --help | help cmd | Examples | Man page |
|------|------|--------|----------|----------|----------|
| git | Yes | Yes | Yes | In docs | Yes |
| docker | Yes | Yes | No | Yes | Yes |
| kubectl | Yes | Yes | Yes | Yes | Yes |
| gh | Yes | Yes | Yes | Yes | No |
| heroku | No | Yes | Yes | Yes | No |
| jira-cli | Yes | Yes | Yes | Yes | No |
| [target] | | | | | |

### Error Messages

| Tool | Clarity | Suggestions | Exit Codes | Debug Mode |
|------|---------|-------------|------------|------------|
| git | High | Yes | Standard | -v |
| docker | High | Some | Standard | --debug |
| kubectl | High | Yes | Standard | -v=N |
| gh | High | Yes | Standard | GH_DEBUG |
| heroku | High | Yes | Standard | HEROKU_DEBUG |
| jira-cli | Medium | Some | Standard | --debug |
| [target] | | | | |

### Output Formats

| Tool | Default | JSON | Table | Custom | Progress |
|------|---------|------|-------|--------|----------|
| git | Text | Limited | No | --format | Yes |
| docker | Text | Yes | Yes | --format | Yes |
| kubectl | Text | Yes | Yes | -o jsonpath | Yes |
| gh | Text | Yes | Yes | --jq | Yes |
| heroku | Text | Yes | Yes | No | Yes |
| jira-cli | Text | Yes | No | --template | Yes |
| [target] | | | | | |

## Scoring Rubrics

### Naming Consistency Score (0-10)

| Score | Criteria |
|-------|----------|
| 10 | All commands follow single pattern, no exceptions |
| 8-9 | >90% follow pattern, documented exceptions |
| 6-7 | >70% follow pattern, some inconsistency |
| 4-5 | Mixed patterns, hard to predict |
| 0-3 | No discernible pattern |

### Flag Standardization Score (0-10)

| Score | Criteria |
|-------|----------|
| 10 | POSIX compliant, all standard names used |
| 8-9 | Mostly POSIX, standard names for common flags |
| 6-7 | Some POSIX violations, most common flags standard |
| 4-5 | Inconsistent flag usage, custom names |
| 0-3 | Non-standard throughout |

### Help Comprehensiveness Score (0-10)

| Score | Criteria |
|-------|----------|
| 10 | Multiple entry points, examples, all commands documented |
| 8-9 | Good coverage, examples for common cases |
| 6-7 | Basic help, some examples |
| 4-5 | Minimal help, no examples |
| 0-3 | Missing or broken help |

### Error Actionability Score (0-10)

| Score | Criteria |
|-------|----------|
| 10 | All errors have suggestions, copy-paste fixes |
| 8-9 | Most errors have suggestions |
| 6-7 | Common errors have suggestions |
| 4-5 | Basic error messages only |
| 0-3 | Cryptic errors, no guidance |

## Aggregated Comparison

### CLI UX Score Summary

| Tool | Naming | Flags | Help | Errors | Output | Total |
|------|--------|-------|------|--------|--------|-------|
| git | 9 | 8 | 9 | 8 | 7 | 41/50 |
| docker | 8 | 8 | 8 | 8 | 9 | 41/50 |
| kubectl | 9 | 9 | 9 | 9 | 9 | 45/50 |
| gh | 9 | 8 | 9 | 9 | 9 | 44/50 |
| heroku | 7 | 7 | 8 | 8 | 8 | 38/50 |
| jira-cli | 8 | 7 | 8 | 7 | 8 | 38/50 |
| [target] | | | | | | |

## Feature Comparison Matrix

### Unique Capabilities

| Feature | git | docker | kubectl | gh | heroku | jira-cli | [target] |
|---------|-----|--------|---------|-----|--------|----------|----------|
| Interactive mode | Limited | No | No | Yes | Yes | Yes | |
| Config file | Yes | Yes | Yes | Yes | No | Yes | |
| Plugins/Extensions | No | Yes | Yes | Yes | Yes | No | |
| Shell completion | Yes | Yes | Yes | Yes | Yes | Yes | |
| CI/CD optimization | Yes | Yes | Yes | Yes | Yes | Limited | |
| Offline support | Yes | Limited | Limited | Limited | No | Limited | |

### Innovation Opportunities

| Opportunity | Seen In | Potential Value |
|-------------|---------|-----------------|
| Smart suggestions | gh, jira-cli | High - reduces errors |
| Fuzzy matching | fzf integrations | Medium - faster navigation |
| Context awareness | gh (repo detection) | High - fewer flags needed |
| Undo/rollback | git reflog | Medium - safety net |
| Templates | jira-cli | High - standardization |
| Wizards | heroku addons | Medium - onboarding |

## Gap Analysis Summary Template

```markdown
## Gap Analysis: [Target Tool]

### Alignment Status

| Dimension | Convention | Status | Gap |
|-----------|------------|--------|-----|
| Naming | verb-noun | Partial | /set-up ambiguous |
| Flags | POSIX | Yes | None |
| Help | Multi-entry | Partial | No -h |
| Errors | Actionable | Yes | None |
| Output | JSON support | No | Missing --json |

### Priority Matrix

| Gap | Impact | Effort | Priority |
|-----|--------|--------|----------|
| Naming clarity | High | Medium | P1 |
| JSON output | Medium | Low | P1 |
| -h flag support | Low | Low | P2 |

### Recommendations Summary

1. **P1**: Add --json flag to all list commands
2. **P1**: Document naming convention rationale
3. **P2**: Add -h alias for --help
```
