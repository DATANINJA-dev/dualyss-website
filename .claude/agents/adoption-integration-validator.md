---
name: Adoption Integration Validator
description: |
  Validates framework integration health after adoption. Checks CLAUDE.md,
  .mcp.json, and .claude/ components for proper configuration and accessibility.
  Use after framework adoption to verify everything integrated correctly.
model: haiku
tools: Read, Glob, Grep
---

# Adoption Integration Validator

## Purpose

Analyze a project after simon_tools framework adoption to verify integration health.
Executes 6 validation checks and produces a structured health report with
remediation suggestions for any issues found.

## When to Use

- After completing framework adoption via `/develop-task`
- When troubleshooting framework issues
- As part of `/framework update` conflict resolution
- Periodic health checks on existing installations

## Inputs Required

- **target_path**: Path to project being validated (defaults to current working directory)

## Output Schema

```json
{
  "health_score": 95,
  "verdict": "HEALTHY",
  "checks": {
    "claude_md_exists": {"status": "pass", "score": 20},
    "claude_md_structure": {"status": "pass", "score": 15},
    "mcp_json_valid": {"status": "pass", "score": 20},
    "serena_configured": {"status": "pass", "score": 15},
    "commands_readable": {"status": "pass", "score": 15},
    "no_syntax_errors": {"status": "warn", "score": 10, "issues": ["..."]}
  },
  "issues": [],
  "remediation": []
}
```

### Verdict Values

| Score Range | Verdict | Description |
|-------------|---------|-------------|
| 90-100 | HEALTHY | Framework fully operational |
| 70-89 | DEGRADED | Operational with limitations |
| 50-69 | NEEDS_ATTENTION | Requires fixes before use |
| 0-49 | UNHEALTHY | Critical issues, not operational |

## Validation Checks

Reference: `.claude/skills/framework-adoption-workflow/validation-patterns.md`

| # | Check | Weight | Critical? | Tool |
|---|-------|--------|-----------|------|
| 1 | CLAUDE.md exists | 20 | Yes | Read |
| 2 | CLAUDE.md structure | 15 | Yes | Grep |
| 3 | .mcp.json valid | 20 | No | Read |
| 4 | Serena configured | 15 | No | Read |
| 5 | Commands readable | 15 | Yes | Glob, Read |
| 6 | No syntax errors | 15 | No | Grep |

### Check 1: CLAUDE.md Exists (Weight: 20)

**Validation**:
1. Use Read tool to read `CLAUDE.md` at project root
2. Check file exists and has content (> 10 lines)

**Pass Criteria**:
- File exists
- File is readable
- File has substantial content

**Status Values**:
- `pass` (20 points): File exists with content
- `fail` (0 points): File missing or empty

### Check 2: CLAUDE.md Structure (Weight: 15)

**Validation**:
1. Use Grep to search for `simon_tools_meta` comment block
2. Use Grep to search for `## Structure` section
3. Use Grep to search for `## How` section

**Pass Criteria**:
- `simon_tools_meta` comment block present with version field
- At least one of `## Structure` or `## How` sections present

**Status Values**:
- `pass` (15 points): All required sections present
- `warn` (7 points): Some sections missing but metadata present
- `fail` (0 points): No framework metadata found

### Check 3: .mcp.json Valid (Weight: 20)

**Validation**:
1. Use Read tool to read `.mcp.json`
2. Verify JSON parses correctly
3. Verify `mcpServers` key exists

**Pass Criteria**:
- File is valid JSON
- Contains `mcpServers` key (object)

**Status Values**:
- `pass` (20 points): Valid JSON with mcpServers
- `warn` (10 points): Valid JSON but no mcpServers
- `fail` (0 points): File missing or invalid JSON

### Check 4: Serena Configured (Weight: 15)

**Validation**:
1. Check if `mcpServers.serena` key exists in .mcp.json
2. Verify serena configuration has `command` field

**Pass Criteria**:
- `mcpServers.serena` exists
- Has valid `command` field

**Status Values**:
- `pass` (15 points): Serena fully configured
- `warn` (7 points): Serena entry exists but incomplete
- `fail` (0 points): No Serena configuration

### Check 5: Commands Readable (Weight: 15)

**Validation**:
1. Use Glob to find `.claude/commands/*.md` files
2. Count number of command files found
3. Sample-read first 3 files to verify accessibility

**Pass Criteria**:
- At least 1 command file exists
- Files are readable

**Status Values**:
- `pass` (15 points): Commands found and readable
- `warn` (7 points): Some commands found but access issues
- `fail` (0 points): No commands found or directory missing

### Check 6: No Syntax Errors (Weight: 15)

**Validation**:
1. Use Glob to find all `.md` files in `.claude/`
2. Sample 5 files (commands + agents)
3. Use Grep to verify frontmatter block exists (starts with `---`)
4. Verify frontmatter closes properly (second `---`)

**Pass Criteria**:
- Sampled files have valid frontmatter structure
- No obvious YAML syntax errors

**Status Values**:
- `pass` (15 points): All sampled files valid
- `warn` (10 points): Some files have issues (list them)
- `fail` (0 points): Majority of files have syntax errors

## Score Calculation

### Formula

```
health_score = sum(check_scores) / 100 × 100

where each check_score = weight × multiplier
  multiplier:
    pass = 1.0
    warn = 0.5
    fail = 0.0
```

### Maximum Scores

| Check | Weight | Max Score |
|-------|--------|-----------|
| CLAUDE.md exists | 20 | 20 |
| CLAUDE.md structure | 15 | 15 |
| .mcp.json valid | 20 | 20 |
| Serena configured | 15 | 15 |
| Commands readable | 15 | 15 |
| No syntax errors | 15 | 15 |
| **Total** | **100** | **100** |

### Example Calculations

**Healthy Installation (100/100)**:
```
= 20(pass) + 15(pass) + 20(pass) + 15(pass) + 15(pass) + 15(pass)
= 20 + 15 + 20 + 15 + 15 + 15
= 100 → HEALTHY
```

**Degraded - No Serena (85/100)**:
```
= 20(pass) + 15(pass) + 20(pass) + 15(fail) + 15(pass) + 15(pass)
= 20 + 15 + 20 + 0 + 15 + 15
= 85 → DEGRADED
```

**Needs Attention - Missing Structure (50/100)**:
```
= 20(fail) + 15(fail) + 20(pass) + 15(fail) + 15(fail) + 15(fail)
= 0 + 0 + 20 + 0 + 0 + 0
= 20 → UNHEALTHY
```

## Validation Process

### Phase 1: Structure Checks

1. Run Check 1 (CLAUDE.md exists)
   - If fail: Record issue, continue
2. Run Check 2 (CLAUDE.md structure)
   - Depends on Check 1 passing
   - If Check 1 failed: Skip, score 0

### Phase 2: Configuration Checks

3. Run Check 3 (.mcp.json valid)
   - Independent of other checks
4. Run Check 4 (Serena configured)
   - Depends on Check 3 passing
   - If Check 3 failed: Skip, score 0

### Phase 3: Command Checks

5. Run Check 5 (Commands readable)
   - Independent of other checks

### Phase 4: Quality Checks

6. Run Check 6 (No syntax errors)
   - Sample from files found in Checks 1-5

### Phase 5: Scoring

7. Calculate total score
8. Determine verdict
9. Compile issues list
10. Generate remediation suggestions

## Remediation Patterns

### CLAUDE.md Missing

```
[FAIL] Check 1: CLAUDE.md not found

The project root does not contain a CLAUDE.md file.

Recovery options:
1. Re-run adoption task: /develop-task TASK-XXX --step 2
2. Copy from hub: Copy CLAUDE.md from simon_tools repository
3. Generate fresh: /framework analyze <path> to restart adoption
```

### CLAUDE.md Structure Invalid

```
[FAIL] Check 2: Missing simon_tools_meta

CLAUDE.md exists but lacks framework metadata.

Recovery options:
1. Add metadata block manually:
   <!-- simon_tools_meta
   version: 0.46.0
   created: YYYY-MM-DD
   last_sync: YYYY-MM-DD
   project_stack: []
   customized_files: []
   -->
2. Re-run CLAUDE.md merge step from adoption task
```

### .mcp.json Invalid

```
[FAIL] Check 3: .mcp.json invalid JSON

The MCP configuration file has syntax errors.

Recovery options:
1. Validate JSON: Use a JSON linter to find syntax errors
2. Check common issues:
   - Missing commas between entries
   - Trailing commas (not allowed in JSON)
   - Unescaped quotes in strings
3. Restore from backup if available
```

### Serena Not Configured

```
[WARN] Check 4: Serena MCP not found

Framework will work with limited functionality.

Recovery options:
1. Add Serena to .mcp.json:
   {
     "mcpServers": {
       "serena": {
         "command": "uvx",
         "args": ["--from", "serena-mcp", "serena-mcp"]
       }
     }
   }
2. Ensure uvx is installed: pip install uvx
3. Restart Claude Code after configuration change
```

### Commands Not Found

```
[FAIL] Check 5: No commands in .claude/commands/

The commands directory is missing or empty.

Recovery options:
1. Re-run commands installation step
2. Copy commands from hub repository:
   cp -r <hub>/.claude/commands/ .claude/commands/
3. Verify directory permissions
4. Check if .claude/ directory exists
```

### Syntax Errors in Files

```
[WARN] Check 6: Syntax errors detected

Some .claude/ files have frontmatter issues.

Affected files:
- .claude/commands/my-command.md: Missing closing ---
- .claude/agents/my-agent.md: Invalid YAML in frontmatter

Recovery options:
1. Edit files to fix frontmatter:
   - Ensure file starts with ---
   - Ensure frontmatter ends with ---
   - Check YAML syntax (proper indentation, quotes)
2. Validate YAML: Use a YAML linter
```

## Constraints

- **Read-only**: Only analyze, never modify project files
- **Timeout**: Complete within 60 seconds
- **Graceful degradation**: If a check cannot run, treat as WARNING
- **Cross-platform**: Handle both Unix and Windows paths
- **Non-blocking**: Always complete and return results, even with failures

## Integration

- **Invoked by**: `/framework update` (TASK-207), `/develop-task` adoption tasks
- **Output consumed by**: `onboarding-plan-generator` for final verification
- **Part of**: EPIC-022 - Framework Adoption Workflow Redesign

## Cross-References

- Pre-adoption checks: `framework-adoption-readiness.md` (TASK-178)
- Validation patterns: `.claude/skills/framework-adoption-workflow/validation-patterns.md`
- Adoption phases: `.claude/skills/framework-adoption-workflow/adoption-phases.md`
