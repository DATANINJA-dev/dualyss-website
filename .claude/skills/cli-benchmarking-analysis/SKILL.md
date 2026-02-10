# CLI Benchmarking & Competitive Analysis

## Purpose

Provides systematic frameworks for comparing CLI tools, extracting design patterns, and documenting competitive positioning. Used for CLI architecture reviews, gap analysis, and UX benchmarking studies.

## Activation Triggers

- Competitive CLI analysis
- CLI architecture evaluation
- Tool comparison studies
- Command pattern benchmarking
- Gap analysis against conventions

## Type

Passive (analytical framework) - provides methodology and templates for CLI analysis.

## Content Structure

### Core Files

| File | Purpose |
|------|---------|
| SKILL.md | This file - skill overview and activation |
| benchmarking-framework.md | Step-by-step methodology for CLI comparison |
| pattern-matrices.md | Templates for documenting CLI patterns |
| gap-analysis-patterns.md | Framework for identifying deviations |
| cli-conventions.md | Reference for established conventions |

## Quick Reference

### Benchmarking Dimensions

1. **Naming Conventions** - verb-noun vs noun-verb, case, length
2. **Subcommand Structure** - depth, discoverability, hierarchy
3. **Flag Handling** - short/long, consistency, standards
4. **Help System** - comprehensiveness, examples, accessibility
5. **Error Messages** - clarity, actionability, suggestions
6. **Output Formats** - human-first, JSON support, machine-readable

### Common CLI Patterns

| Tool | Pattern | Example |
|------|---------|---------|
| git | verb-noun | `git add file.txt` |
| docker | noun verb | `docker container create` |
| kubectl | verb noun | `kubectl get pods` |
| gh | noun verb | `gh pr create` |
| heroku | topic:command | `heroku apps:create` |

### Gap Analysis Template

```markdown
## Deviation: [Pattern Name]

**Convention**: [What established tools do]
**Competitors**: [Tools that follow this convention]
**Current Implementation**: [What simon_tools does]
**Deviation Type**: Intentional / Unintentional
**Impact**: [User friction / benefit assessment]
**Recommendation**: Align / Maintain / Hybrid
**Rationale**: [Why this recommendation]
```

## Integration

This skill works alongside:
- `cli-design-principles` - for creating good CLIs
- `research-methodology` - for web research patterns
- `dx-evaluation-framework` - for measuring UX impact

## Sources

- [Command Line Interface Guidelines](https://clig.dev/) - 10/10 quality
- [GNU Coding Standards](https://www.gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html) - 10/10 quality
- [Heroku CLI Style Guide](https://devcenter.heroku.com/articles/cli-style-guide) - 9/10 quality
- [kubectl Documentation](https://kubernetes.io/docs/reference/kubectl/) - 9/10 quality
- [GitHub CLI Manual](https://cli.github.com/manual/) - 9/10 quality
