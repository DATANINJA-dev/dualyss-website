# CLI Usability Evaluation Checklist

## Overview
Use this checklist to audit CLI usability systematically. Each section includes scoring criteria (0-10) and actionable improvement suggestions.

## 1. Command Naming (Weight: 30%)

### Consistency (0-10)
- [ ] All commands follow same pattern (verb-noun or noun-verb) - **Score: ___**
- [ ] Verbs are from standard set (create, delete, list, get, update, run)
- [ ] No mixing of conventions (e.g., some hyphenated, some spaced)

**Scoring**:
- 10: Perfect consistency, zero deviations
- 7-9: Minor inconsistencies, easily fixable
- 4-6: Mixed patterns, causes confusion
- 0-3: No consistent pattern

**Red Flags**:
- `create-user` and `user delete` in same tool (pattern mismatch)
- `update` in one place, `edit` in another for same operation
- Abbreviations (`cfg`, `mgmt`) mixed with full words

### Clarity (0-10)
- [ ] Command names reveal purpose without docs - **Score: ___**
- [ ] No ambiguous names (e.g., "setup" vs "configure" vs "init" all present)
- [ ] Names align with industry conventions

**Test**: Show command name to unfamiliar user. Can they guess what it does?

## 2. Option Standards (Weight: 20%)

### Universal Flags (0-10)
- [ ] `-h/--help` supported - **Score: ___**
- [ ] `-v/--verbose` supported
- [ ] `-V/--version` supported
- [ ] Help text includes examples

**Scoring**:
- 10: All 4 present with quality help text
- 7-9: 3/4 present
- 4-6: 2/4 present
- 0-3: 0-1 present

### Flag Consistency (0-10)
- [ ] Short flags for common operations - **Score: ___**
- [ ] Long flags for clarity
- [ ] No positional argument overload (max 2)

**Red Flags**:
- 3+ positional arguments
- `--configuration` in one command, `--config` in another
- No short aliases for frequently-used flags

## 3. Discoverability (Weight: 25%)

### Help Quality (0-10)
- [ ] `--help` shows real-world examples - **Score: ___**
- [ ] Subcommands listed clearly
- [ ] Options grouped logically (required vs optional)

**Test**: Can user complete common task using only `--help`?

### Error Messages (0-10)
- [ ] Errors include corrective suggestions - **Score: ___**
- [ ] Similar commands suggested for typos
- [ ] Clear indication of what went wrong

**Example Good Error**:
```
Error: Task 'TASK-999' not found
Suggestion: Run 'list-tasks' to see available tasks
```

**Example Poor Error**:
```
Error: Invalid input
```

## 4. Documentation (Weight: 15%)

### Getting Started (0-10)
- [ ] Quick-start guide exists - **Score: ___**
- [ ] Common workflows documented
- [ ] First command executable within 5 minutes

**Test**: New user reading docs can complete first task in < 10 minutes.

### Depth (0-10)
- [ ] All commands documented - **Score: ___**
- [ ] All flags explained
- [ ] Edge cases covered

## 5. Workflow Efficiency (Weight: 10%)

### Common Tasks (0-10)
- [ ] Frequent operations are simple (minimal flags) - **Score: ___**
- [ ] Shortcuts/aliases provided
- [ ] Batch operations supported

**Test**: Time common workflows. Compare to competitor tools.

### Cognitive Load (0-10)
- [ ] Users don't need to memorize complex flag combos - **Score: ___**
- [ ] Sensible defaults minimize required options
- [ ] Progressive complexity (simple → advanced)

**Measurement**: Count concepts user must learn to complete basic task.

## Composite Score Calculation

```
Score = (Naming * 0.30) +
        (Options * 0.20) +
        (Discoverability * 0.25) +
        (Documentation * 0.15) +
        (Efficiency * 0.10)
```

### Interpretation
- **9-10**: Excellent - Industry-leading usability
- **7-8**: Good - Minor improvements needed
- **5-6**: Fair - Significant usability gaps
- **3-4**: Poor - Major overhaul recommended
- **0-2**: Critical - Blocks user adoption

## Action Plan Template

Based on audit, prioritize fixes:

### P0 (Critical - Fix Immediately)
- **Issue**: [specific problem]
- **Impact**: [how it affects users]
- **Fix**: [concrete solution]
- **Effort**: [S/M/L]

### P1 (High - Fix Soon)
...

### P2 (Medium - Improve Over Time)
...

## Example Audit

**Tool**: `simon_tools`

### Naming Consistency: 6/10
- Mixed patterns: `/generate-epics` (verb-noun-plural) vs `/set-up` (verb-preposition) vs `/audit` (noun)
- Fix: Unify pattern, e.g., `epic:generate`, `task:setup`, `framework:audit`

### Universal Flags: 8/10
- Missing `-V/--version`
- Help text exists but lacks examples for complex commands

### Discoverability: 7/10
- Good: Error messages sometimes suggest corrections
- Gap: No `--help` summary showing command tree

### Documentation: 9/10
- Excellent: Comprehensive CLAUDE.md
- Gap: No 5-minute quick-start

### Efficiency: 7/10
- Good: Sensible defaults for most commands
- Gap: No shortcuts for power users

**Composite**: (6*0.3 + 8*0.2 + 7*0.25 + 9*0.15 + 7*0.1) = **7.2/10**

**Verdict**: Good - Minor improvements recommended

**P0 Fixes**:
1. Add `-V/--version` flag (effort: S)
2. Unify naming pattern across all commands (effort: L, breaking change)
3. Add command tree to help output (effort: M)
