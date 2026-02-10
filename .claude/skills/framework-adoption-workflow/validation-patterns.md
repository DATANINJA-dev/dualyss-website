# Validation Patterns

Post-installation verification patterns to confirm successful framework adoption. These checks run during [Phase 4 (Develop)](adoption-phases.md#phase-4-develop) after each step and as final verification.

## Validation Overview

| Category | Check | Critical? | Weight |
|----------|-------|-----------|--------|
| Structure | .claude/ directories | Yes | 20 |
| Structure | CLAUDE.md exists | Yes | 15 |
| Configuration | simon_tools_meta present | Yes | 15 |
| Configuration | .mcp.json valid | No | 10 |
| Commands | Core commands available | Yes | 15 |
| Skills | Auto-activation works | No | 10 |
| Integration | Serena MCP responds | No | 15 |

## Category Details

### Structure Validation

#### .claude/ Directories

**Check**: Verify required directory structure exists.

**Required Directories**:
```
.claude/
├── commands/       # Slash commands
├── agents/         # Analysis agents
├── skills/         # Domain knowledge
└── hooks/          # Validation hooks
```

**Validation Command**:
```bash
# Unix
for dir in commands agents skills hooks; do
  test -d ".claude/$dir" && echo "✓ $dir" || echo "✗ $dir"
done

# Windows (PowerShell)
@('commands','agents','skills','hooks') | ForEach-Object {
  if (Test-Path ".claude\$_") { "✓ $_" } else { "✗ $_" }
}
```

**Success Criteria**:
- All 4 directories exist
- Each directory is non-empty (has at least one .md file)

**Recovery on Failure**:
```
[FAIL] Missing directory: .claude/agents/

Recovery options:
1. Re-run step: /develop-task TASK-XXX --step N
2. Manual fix: mkdir -p .claude/agents && cp ...
3. Full reinstall: /framework rollback TASK-XXX && /develop-task TASK-XXX
```

#### CLAUDE.md Exists

**Check**: Verify CLAUDE.md file exists at project root.

**Validation Command**:
```bash
test -f "CLAUDE.md" && head -20 CLAUDE.md
```

**Success Criteria**:
- File exists
- File is readable
- File has simon_tools header structure

### Configuration Validation

#### simon_tools_meta Present

**Check**: Verify CLAUDE.md contains valid simon_tools metadata.

**Expected Structure**:
```markdown
<!-- simon_tools_meta
version: 0.46.0
created: 2026-01-20
last_sync: 2026-01-20
project_stack: [node, typescript]
customized_files: []
-->
```

**Validation Command**:
```bash
grep -A5 "simon_tools_meta" CLAUDE.md | head -6
```

**Success Criteria**:
- `simon_tools_meta` comment block exists
- `version:` field present and non-empty
- `created:` field present with valid date
- `last_sync:` field present with valid date

**Recovery on Failure**:
```
[FAIL] Missing simon_tools_meta

The CLAUDE.md file exists but lacks framework metadata.

Recovery options:
1. Add metadata manually (see template below)
2. Re-run CLAUDE.md merge step
3. Use /framework analyze to regenerate

Template:
<!-- simon_tools_meta
version: 0.46.0
created: YYYY-MM-DD
last_sync: YYYY-MM-DD
project_stack: []
customized_files: []
-->
```

#### .mcp.json Valid

**Check**: Verify MCP configuration file is valid JSON with Serena config.

**Expected Structure**:
```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["--from", "serena-mcp", "serena-mcp"],
      "env": {
        "SERENA_PROJECTS_CONFIG": "..."
      }
    }
  }
}
```

**Validation Command**:
```bash
# Check JSON valid
cat .mcp.json | jq . >/dev/null 2>&1 && echo "JSON valid"

# Check serena exists
cat .mcp.json | jq -e '.mcpServers.serena' >/dev/null 2>&1 && echo "Serena configured"
```

**Success Criteria**:
- File is valid JSON
- `mcpServers.serena` key exists
- Serena configuration has `command` field

**Recovery on Failure**:
```
[WARNING] Serena MCP not configured

Framework will work with limited functionality.
Add Serena configuration:

{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["--from", "serena-mcp", "serena-mcp"]
    }
  }
}
```

### Command Validation

#### Core Commands Available

**Check**: Verify essential commands are installed and accessible.

**Required Commands**:
| Command | File | Purpose |
|---------|------|---------|
| help | .claude/commands/help.md | Display available commands |
| list-tasks | .claude/commands/list-tasks.md | List tasks in backlog |
| list-epics | .claude/commands/list-epics.md | List epics with progress |

**Validation Command**:
```bash
for cmd in help list-tasks list-epics; do
  test -f ".claude/commands/$cmd.md" && echo "✓ $cmd" || echo "✗ $cmd"
done
```

**Success Criteria**:
- All 3 core command files exist
- Files have valid frontmatter
- Files are non-empty (> 10 lines)

**Recovery on Failure**:
```
[FAIL] Missing command: list-tasks

Recovery options:
1. Copy from hub: cp <hub>/.claude/commands/list-tasks.md .claude/commands/
2. Re-run commands installation step
3. Check file permissions
```

### Skill Validation

#### Auto-Activation Works

**Check**: Verify skill activation triggers are functional.

**Test Method**:
1. Select a skill with known triggers (e.g., `tdd-workflow`)
2. Create a test prompt containing trigger keyword
3. Verify skill header appears in response

**Manual Validation**:
```
Test: Type "I want to write tests using TDD"
Expected: tdd-workflow skill should activate
Verify: Look for skill activation in response context
```

**Success Criteria**:
- At least one skill auto-activates
- Skill content is accessible
- No errors during activation

### Integration Validation

#### Serena MCP Responds

**Check**: Verify Serena MCP server is operational.

**Test Method**:
```bash
# Attempt to use Serena tool
# This is tested indirectly through Claude Code

# Expected: mcp__serena tools available
# - mcp__serena__find_symbol
# - mcp__serena__get_symbols_overview
# - etc.
```

**Success Criteria**:
- Serena tools appear in available tools
- `mcp__serena__list_dir` returns results
- No connection errors

**Recovery on Failure**:
```
[WARNING] Serena MCP not responding

Possible causes:
1. uvx not installed: pip install uvx
2. serena-mcp not found: uvx will auto-install
3. Configuration error: Check .mcp.json syntax

Restart Claude Code after fixing configuration.
```

## Health Check Summary

After all validations, generate a health check summary:

### Healthy Installation
```
## Framework Health Check: HEALTHY

**Installation Date**: 2026-01-20
**Version**: 0.46.0

### Structure (4/4)
✓ .claude/commands/ (12 files)
✓ .claude/agents/ (8 files)
✓ .claude/skills/ (15 skills)
✓ .claude/hooks/ (4 files)

### Configuration (3/3)
✓ CLAUDE.md with simon_tools_meta
✓ .mcp.json valid
✓ Serena MCP configured

### Commands (3/3)
✓ /help available
✓ /list-tasks available
✓ /list-epics available

### Integration (2/2)
✓ Skills auto-activate
✓ Serena MCP responds

**Health Score**: 100%
**Status**: Fully operational
```

### Degraded Installation
```
## Framework Health Check: DEGRADED

**Installation Date**: 2026-01-20
**Version**: 0.46.0

### Structure (4/4)
✓ .claude/commands/ (12 files)
✓ .claude/agents/ (8 files)
✓ .claude/skills/ (15 skills)
✓ .claude/hooks/ (4 files)

### Configuration (2/3)
✓ CLAUDE.md with simon_tools_meta
✓ .mcp.json valid
⚠ Serena MCP not responding

### Commands (3/3)
✓ /help available
✓ /list-tasks available
✓ /list-epics available

### Integration (1/2)
✓ Skills auto-activate
✗ Serena MCP not responding

**Health Score**: 85%
**Status**: Operational with limitations

### Recommendations
1. Check Serena MCP configuration
2. Restart Claude Code
3. Run: uvx --from serena-mcp serena-mcp --check
```

## Step-by-Step Validation

During `/develop-task`, validation runs after each step:

```
Step 2 Complete: Install Core Structure

### Step Validation
✓ .claude/commands/ created (12 files)
✓ .claude/agents/ created (8 files)
✓ .claude/skills/ created (15 directories)
✓ .claude/hooks/ created (4 files)

Step 2 validated successfully.
Proceed to Step 3? [Y/n]
```

## Final Verification

After all steps complete, run full validation:

```
## Final Verification

Running complete health check...

[1/7] Structure validation........... ✓
[2/7] CLAUDE.md validation........... ✓
[3/7] simon_tools_meta validation.... ✓
[4/7] .mcp.json validation........... ✓
[5/7] Core commands validation....... ✓
[6/7] Skills validation.............. ✓
[7/7] Serena integration............. ✓

### Result: PASS

All 7 validation checks passed.
Framework installation verified.

Mark TASK-XXX as done? [Y/n]
```

## Cross-References

- Pre-installation checks: [prerequisite-checklist.md](prerequisite-checklist.md)
- Phase workflow: [adoption-phases.md](adoption-phases.md)
- Scaffolding templates: [framework-scaffolding-patterns](../framework-scaffolding-patterns/SKILL.md)
