---
description: Audit Claude Code configurations against best practices. Scores commands, agents, skills, and hooks for quality, security, and integration.
allowed-tools: Read, Glob, Grep, Task, AskUserQuestion, WebSearch, WebFetch
argument-hint: "[target] [-r] [-q] [-v] [--watch] [--quiet]"
---

# /audit

Comprehensive quality audit for Claude Code configuration files in `.claude/`.

## Parameters

- `$ARGUMENTS` - Target scope (optional):
  - Empty or `all` - Audit all components
  - `commands` - Only commands
  - `agents` - Only agents
  - `skills` - Only skills
  - `hooks` - Only hooks
  - `mcp` - Only MCP configuration
  - `[filename]` - Specific file (e.g., `audit.md`)

- **Flags**:
  - `--resume`, `-r` - Resume from most recent progress checklist
  - `--resume [audit_id]` - Resume from specific progress checklist
  - `--quick`, `-q` - Fast check (critical issues only, see `/audit:quick`)
  - `--verbose`, `-v` - Show detailed progress with timing and agent outputs
  - `--quiet` - Suppress progress indicators (show only errors and final results)
  - `--dry-run` - Preview audit scope without executing analyzers
  - `--baseline [audit_id]` - Compare against specific baseline audit instead of previous
  - `--strict-threshold [score]` - Fail audit if score below threshold (0.0-10.0, for CI/CD)
  - `--output-format [format]` - Report format: markdown (default), html, pdf
  - `--output-file [path]` - Output file path (default: stdout for markdown, auto-named for html/pdf)
  - `--watch` - Monitor .claude/ directory and re-run audits on file changes (v0.23.0)
    - Debounce: 1000ms (waits for changes to settle)
    - Graceful shutdown: Ctrl+C or type "stop"
    - Incompatible with: --dry-run, --resume
  - `--incremental` - Only audit files changed since last audit (v0.24.0)
    - Uses git diff or file mtime for change detection
    - Caches results in `backlog/audit-outputs/.audit-cache.json`
    - Compatible with: --watch, --resume, --dry-run, --baseline
  - `--no-cache` - Force full audit and rebuild cache (requires --incremental)

Note: `--verbose` and `--quiet` are mutually exclusive.

- **Timeout Configuration**:
  - Component analyzers (Phase 2): 120s per analyzer
  - Domain researcher delegation: 90s
  - Enhancement analyzers (Phase 3): 60s per analyzer
  - QA synthesis: 90s
  - Total audit timeout: 600s (soft limit, warnings only)

**Note**: All audits run the complete analysis pipeline. Target only filters WHAT to analyze.
**Note**: Artifact mode is always enabled - analyzers write JSON to `backlog/audit-outputs/` for efficient context management.

## Instructions

### Phase 0: Input Validation

[Extended thinking: Analyze $ARGUMENTS to determine intent.
If filename without extension, user likely means .md file.
If path contains .mcp.json, suggest /audit:mcp instead.
If user says "quick" or "fast", suggest /audit:quick.
Check for --dry-run flag first (scope preview only).
Check for --resume flag before processing target.]

1. **Check for --dry-run flag**:
   - If `$ARGUMENTS` contains `--dry-run`:
     ```
     is_dry_run = true
     ```
   - Remove `--dry-run` from arguments for target parsing
   - Note: --dry-run is incompatible with --resume (warn if both specified)

2. **Check for --baseline flag**:
   - If `$ARGUMENTS` contains `--baseline [audit_id]`:
     ```
     baseline_audit_id = [audit_id]
     ```
   - Validate baseline exists in `backlog/audit-history.json`:
     - Search for entry with matching `audit_id` or `timestamp`
     - If not found: ERROR - "Baseline audit not found: [audit_id]. Use `/audit` to list available audits."
   - Remove `--baseline [audit_id]` from arguments for target parsing
   - Note: --baseline is incompatible with --dry-run (warn if both specified)

3. **Check for --resume flag**:
   - If `$ARGUMENTS` contains `--resume`:
     ```
     is_resuming = true
     ```
   - If `--resume [audit_id]` specified:
     - Look for: `backlog/audit-outputs/audit-progress-[audit_id].md`
     - If not found: ERROR - "Progress checklist not found: audit-progress-[audit_id].md"
   - If `--resume` without audit_id:
     - Find most recent `audit-progress-*.md` in `backlog/audit-outputs/`
     - If none found: ERROR - "No progress checklist found. Run `/audit` to start fresh."
   - **If resuming**:
     - Load checklist file
     - Parse `**Target:**` to restore target scope
     - Parse `**Status:**` - must be `in_progress` (warn if `completed` or `failed`)
     - Parse all `- [x]` and `- [ ]` items to identify completed phases
     - Store: `resume_audit_id`, `completed_phases`, `skip_items`
     - Report:
       ```
       ## Resuming Audit: [audit_id]

       **Original Target:** [target]
       **Started:** [timestamp]

       ### Progress
       | Phase | Status |
       |-------|--------|
       | Phase 1 | [x] Complete |
       | Phase 2 | [~] Partial (X/Y) |
       | Phase 3 | [ ] Pending |
       ...

       Continue from Phase [N]? [Y/n]
       ```
     - Skip to Phase 0.5 with loaded `audit_id`

4. **Check for --strict-threshold flag**:
   - If `$ARGUMENTS` contains `--strict-threshold [score]`:
     ```
     strict_threshold = [score]
     ```
   - Validate score is numeric and in range 0.0-10.0:
     - If not numeric: ERROR - "Invalid threshold: [score]. Must be a number."
     - If out of range: ERROR - "Invalid threshold: [score]. Must be 0.0-10.0"
   - Remove `--strict-threshold [score]` from arguments for target parsing
   - Note: --strict-threshold is incompatible with --dry-run (warn if both specified)

5. **Check for --output-format flag**:
   - If `$ARGUMENTS` contains `--output-format [format]`:
     ```
     output_format = [format]
     ```
   - Validate format is one of: markdown, html, pdf
   - If invalid: ERROR - "Invalid format: [format]. Must be markdown, html, or pdf"
   - Remove `--output-format [format]` from arguments for target parsing
   - Default: markdown

6. **Check for --output-file flag**:
   - If `$ARGUMENTS` contains `--output-file [path]`:
     ```
     output_file = [path]
     ```
   - Remove `--output-file [path]` from arguments for target parsing
   - If format is html/pdf and no output_file specified: auto-generate name
     - Pattern: `audit-[audit_id].{html|pdf}`

7. **Check for --watch flag** (v0.23.0):
   - If `$ARGUMENTS` contains `--watch`:
     ```
     is_watching = true
     ```
   - Remove `--watch` from arguments for target parsing
   - **Incompatibility checks**:
     - If `is_dry_run == true`: ERROR - "--watch and --dry-run are incompatible. Watch mode requires writing artifacts."
     - If `is_resuming == true`: ERROR - "--watch and --resume are incompatible. Cannot resume into watch mode."
   - Store initial watch state variables:
     ```
     watch_poll_interval = 1000  # ms
     watch_debounce_ms = 1000    # ms trailing edge
     watch_last_scan = null
     watch_file_checksums = {}   # path -> checksum
     watch_pending_changes = []
     watch_audit_count = 0
     watch_start_time = now()
     ```

8. **Check for --incremental flag**:
   - If `$ARGUMENTS` contains `--incremental`:
     ```
     is_incremental = true
     ```
   - Remove `--incremental` from arguments for target parsing
   - **Compatibility matrix**:
     - `--incremental --dry-run`: Compatible (preview incremental scope)
     - `--incremental --resume`: Compatible (resume preserves incremental context)
     - `--incremental --watch`: Compatible (each watch cycle is incremental)
     - `--incremental --baseline`: Compatible (compare against baseline)
   - Store initial incremental state:
     ```
     incremental_mode = "full"  # Changes to "incremental" when cache valid
     changed_files = []
     unchanged_files = []
     cache_valid = false
     ```

9. **Check for --no-cache flag**:
   - If `$ARGUMENTS` contains `--no-cache`:
     ```
     clear_cache = true
     ```
   - Remove `--no-cache` from arguments for target parsing
   - Note: `--no-cache` implies full audit but updates cache afterward
   - Only valid with `--incremental` (warn if used alone):
     ```
     if clear_cache AND NOT is_incremental:
       WARN: "--no-cache has no effect without --incremental"
     ```

10. Parse `$ARGUMENTS` to determine target scope (if not resuming)

11. **Categorize input**:
   - If empty → target = `all`
   - If known keyword (`all`, `commands`, `agents`, `skills`, `hooks`, `mcp`) → target = keyword
   - Otherwise → treat as filename

12. **If filename target**:
   - Search for file in order:
     1. Exact path if absolute/relative path provided
     2. `.claude/commands/[filename]`
     3. `.claude/agents/[filename]`
     4. `.claude/skills/[filename]/SKILL.md`
     5. `.claude/hooks/[filename]`
   - **If found**: Set target to resolved path, determine component type
   - **If NOT found**: ERROR - "File '[filename]' not found in .claude/. Searched: commands/, agents/, skills/, hooks/"

### Phase 0.1: Watch Setup (v0.23.0)

**Skip if `is_watching == false`**: Proceed directly to Phase 0.5 if not in watch mode.

1. **Display watch mode indicator**:
   ```
   ## Watch Mode Enabled

   Monitoring: .claude/ directory
   Debounce: 1000ms
   Targets: [target scope from Phase 0]
   Poll interval: 1000ms

   Initial audit starting...
   Press Ctrl+C or type "stop" to exit watch mode
   ```

2. **Initialize file checksums**:
   - Use Glob to list all files in watch scope:
     - If target = `all`: `.claude/**/*.md`
     - If target = `commands`: `.claude/commands/**/*.md`
     - If target = `agents`: `.claude/agents/**/*.md`
     - If target = `skills`: `.claude/skills/**/*.md`, `.claude/skills/**/SKILL.md`
     - If target = `hooks`: `.claude/hooks/**/*.md`
     - If target = filename: just that file
   - For each file:
     ```
     watch_file_checksums[path] = hash(file_content)
     watch_last_modified[path] = file_mtime
     ```
   - Store `watch_last_scan = now()`

3. **Validate watch scope**:
   - Count files in scope
   - If 0 files: ERROR - "No files found in watch scope. Check target: [target]"
   - If > 100 files: WARNING - "Large watch scope ([N] files). Consider targeting specific category."

4. **Initialize watch session in Memory MCP** (optional optimization):
   - Store checksums for delta comparison on subsequent cycles
   - Key: `audit_watch_session_[audit_id]`

**Note**: Watch mode proceeds to run the initial full audit (Phases 0.5-7.6), then enters the watch loop (Phase 7.7).

### Phase 0.5: Artifact Setup

**Skip if `is_dry_run`**: Dry-run mode skips artifact creation entirely. Proceed directly to Phase 1 Discovery.

1. **Generate or restore audit ID**:
   - **If resuming**: Use `resume_audit_id` from Phase 0
   - **If new audit**: Generate new ID
     - Format: `YYYY-MM-DDTHH-MM-SS-[random4]` (e.g., `2026-01-06T15-30-00-a1b2`)
   - Store as `audit_id` for this session

2. **Create artifact directory**:
   ```bash
   mkdir -p backlog/audit-outputs/[audit_id]/
   ```

3. **Test write capability**:
   - Write test file: `backlog/audit-outputs/[audit_id]/.test`
   - Delete test file
   - If write fails: ERROR - "Cannot write to artifact directory. Check permissions."

4. **Create audit manifest**:
   Write `backlog/audit-outputs/[audit_id]/.audit-manifest.json`:
   ```json
   {
     "audit_id": "[audit_id]",
     "timestamp": "[ISO timestamp]",
     "scope": "[target]",
     "expected_files": ["command-analyzer.json", "agent-analyzer.json", "skill-analyzer.json", "hook-analyzer.json", "dependency-analyzer.json"],
     "status": "in_progress"
   }
   ```

5. **Set artifact_path** for agent invocations:
   ```
   artifact_path = "backlog/audit-outputs/[audit_id]/"
   ```

### Phase 0.6: Progress Checklist Creation

**Skip if `is_dry_run`**: Dry-run mode does not create progress checklists.

1. **Generate progress checklist**:
   - **If resuming**: Skip to Phase 1 (checklist already loaded in Phase 0)
   - **If new audit**: Create file `backlog/audit-outputs/audit-progress-[audit_id].md`

2. **Initialize checklist structure**:
   ```markdown
   # Audit Progress: [audit_id]

   **Target:** [target scope]
   **Started:** [ISO timestamp]
   **Status:** in_progress
   **Version:** 1.0.0

   ## Phase 1: Discovery
   - [ ] Scan .claude/ directory
   - [ ] Count components

   ## Phase 2: Component Analysis
   <!-- Populated after Phase 1 discovery -->

   ## Phase 2.5: QA Synthesis
   - [ ] Run audit-qa.md
   - [ ] Calculate composite scores

   ## Phase 3: Enhancement Analysis (ALL ALWAYS RUN)
   - [ ] audit-mcp-analyzer
   - [ ] audit-enhancement-analyzer
   - [ ] audit-research-advisor
   - [ ] audit-solution-architect
   - [ ] audit-gap-analyzer
   - [ ] skill-discovery-advisor

   ## Phase 4: Recommendations
   - [ ] Run audit-recommender.md
   - [ ] Compare to previous audit

   ## Phase 5: Report Generation
   - [ ] Generate final report

   ## Phase 6: History Update
   - [ ] Update audit-history.json

   ## Phase 6.5: Cache Update (if incremental)
   - [ ] Update audit cache

   ## Phase 7: Task Generation
   - [ ] Offer task generation

   ## Phase 7.5: Artifact Cleanup
   - [ ] Cleanup artifacts

   ## Phase 7.6: GitHub Integration
   - [ ] GitHub integration (optional)
   ```

3. **Store checklist path** for updates:
   ```
   progress_checklist_path = "backlog/audit-outputs/audit-progress-[audit_id].md"
   ```

### Phase 0.7: Incremental Cache Loading (v0.24.0)

**Skip if `is_incremental == false`**: Proceed directly to Phase 1 if not in incremental mode.

1. **Check cache file exists**:
   - Path: `backlog/audit-outputs/.audit-cache.json`
   - If not exists OR `clear_cache == true`:
     ```
     cache_valid = false
     incremental_mode = "full"  # Will do full audit and create cache
     Log: "No cache found (or --no-cache specified). Running full audit."
     ```
   - If exists: Load and validate

2. **Validate cache structure**:
   ```json
   {
     "version": "1.0",
     "last_audit_id": "2026-01-08T12-00-00-a1b2",
     "last_audit_timestamp": "2026-01-08T12:00:00Z",
     "last_commit_hash": "abc123def",
     "files": {
       ".claude/commands/audit.md": {
         "hash": "sha256:...",
         "mtime": "2026-01-08T11:00:00Z",
         "score": 8.5,
         "verdict": "EXCELLENT",
         "analyzer_output_path": "backlog/audit-outputs/2026-01-08T12-00-00-a1b2/command-analyzer-audit.json"
       }
     }
   }
   ```
   - Check `version` field matches "1.0"
   - If mismatch: `cache_valid = false`, log "Cache version mismatch, running full audit"

3. **Detect changed files**:
   - **If in git repository** (preferred method):
     ```bash
     git diff --name-only [cache.last_commit_hash]..HEAD -- ".claude/**/*.md"
     ```
   - **If not in git or command fails** (fallback method):
     - For each cached file, compare current mtime with cached mtime
     - Mark as changed if mtime differs
   - **For new files** (in .claude/ but not in cache):
     - Add to `changed_files[]` with type "new"
   - **For deleted files** (in cache but not on disk):
     - Add to `deleted_files[]` for cache cleanup
   - Store results:
     ```
     changed_files = [list of changed file paths]
     unchanged_files = [list of unchanged file paths]
     new_files = [list of new file paths]
     deleted_files = [list of deleted file paths]
     ```

4. **Report incremental scope**:
   ```
   ## Incremental Audit Mode

   | Metric | Count |
   |--------|-------|
   | Changed files | [X] |
   | Unchanged (cached) | [Y] |
   | New files | [Z] |
   | Deleted files | [W] |

   ### Changed Files
   [List each changed file with modification type]
   - .claude/commands/audit.md (modified)
   - .claude/agents/new-agent.md (new)

   ### Using Cached Results For
   [List files using cached scores]
   - .claude/commands/generate-epics.md (score: 9.2)
   - .claude/agents/audit-qa.md (score: 8.8)
   ```

5. **Handle edge cases**:

   **5a. All files unchanged**:
   ```
   No changes detected since last audit ([cache.last_audit_timestamp]).

   Overall cached score: [X.X]/10 ([VERDICT])

   Options:
   [R]eport - View cached report
   [F]ull audit - Force complete re-audit
   [Q]uit - Exit without action
   ```
   - If "Report": Display cached results from previous audit artifacts
   - If "Full": Set `incremental_mode = "full"`, continue to Phase 1
   - If "Quit": Exit gracefully

   **5b. Cache corrupted or invalid**:
   ```
   WARNING: Cache file corrupted or invalid. Falling back to full audit.
   ```
   - Set `cache_valid = false`, `incremental_mode = "full"`
   - Delete corrupted cache file
   - Continue to Phase 1

   **5c. All files are new** (first audit on this scope):
   - Set `incremental_mode = "full"`
   - Log: "No cached files for this scope. Running full audit."

6. **Store incremental context** for Phase 2:
   ```
   incremental_context = {
     "mode": "incremental" | "full",
     "changed_files": [...],
     "unchanged_files": [...],
     "cached_scores": { "path": score, ... },
     "cached_outputs": { "path": "artifact_path", ... }
   }
   ```

### Phase 1: Discovery

**Resume check**: If `is_resuming` and Phase 1 fully complete in checklist, skip to Phase 2.

1. **Scan .claude/ directory** for components:
   ```
   .claude/commands/*.md → Commands
   .claude/agents/*.md → Agents
   .claude/skills/*/ → Skills (directories with SKILL.md)
   .claude/hooks/*.md → Hooks
   ```

2. **Count components** per type
3. **Filter** based on target scope

4. **Report discovery**:
   ```
   ## Audit Scope
   | Type | Count |
   |------|-------|
   | Commands | X |
   | Agents | X |
   | Skills | X |
   | Hooks | X |
   | MCP Servers | X |
   | **Total** | X |
   ```

5. **Update progress checklist**:
   - Mark Phase 1 items as complete: `[x]`
   - Populate Phase 2 section with discovered components:
     ```markdown
     ## Phase 2: Component Analysis
     - [ ] audit-command-analyzer: [command1.md]
     - [ ] audit-command-analyzer: [command2.md]
     ...
     - [ ] audit-agent-analyzer: [agent1.md]
     ...
     - [ ] audit-skill-analyzer: [skill1]
     ...
     - [ ] audit-hook-analyzer: [hook1.md]
     ...
     - [ ] audit-dependency-analyzer: full graph
     ```
   - Save checklist file

### Phase 1.5: Dry Run Preview (if --dry-run)

**If `is_dry_run` is true**, show scope preview and exit:

1. **Present dry-run summary**:
   ```
   ## Audit Scope Preview (--dry-run)

   **Target**: [target]
   **Components**: [N] total

   ### What Would Be Analyzed
   | Type | Count | Analyzer |
   |------|-------|----------|
   | Commands | [N] | audit-command-analyzer (sonnet) |
   | Agents | [N] | audit-agent-analyzer (sonnet) |
   | Skills | [N] | audit-skill-analyzer (haiku) |
   | Hooks | [N] | audit-hook-analyzer (haiku) |
   | Dependencies | 1 | audit-dependency-analyzer (sonnet) |

   ### Enhancement Analyzers (Phase 3)
   - audit-mcp-analyzer (haiku)
   - audit-enhancement-analyzer (sonnet)
   - audit-research-advisor (sonnet)
   - audit-solution-architect (sonnet)
   - audit-gap-analyzer (sonnet)
   - skill-discovery-advisor (haiku)

   ### Estimated Duration
   - Component Analysis: ~[N] minutes
   - Enhancement Analysis: ~5-10 minutes
   - Total: ~[N] minutes

   ---
   No artifacts created. No analyzers executed.
   Run `/audit [target]` to execute full audit.
   ```

2. **Exit without further processing**:
   - Do NOT create artifact directory
   - Do NOT create progress checklist
   - Do NOT execute any analyzers
   - Return immediately after displaying preview

### Phase 2: Parallel Analysis

**Resume check**: If `is_resuming`:
- Skip analyzers already marked `[x]` in checklist
- Only run analyzers still marked `[ ]`
- Use `skip_items` list from Phase 0 to filter

**Incremental check**: If `is_incremental == true` AND `cache_valid == true`:
- Filter analyzer invocations to only `changed_files[]` and `new_files[]`
- For each file in `unchanged_files[]`:
  - Load cached score from `.audit-cache.json`
  - Load cached analyzer output path if exists and valid
  - Add to `cached_results` for Phase 2.5 merging
- Log incremental scope:
  ```
  Incremental mode: Analyzing [N] changed files, using cache for [M] unchanged files.

  Analyzing:
  - .claude/commands/audit.md (modified)
  - .claude/agents/new-agent.md (new)

  Skipping (cached):
  - .claude/commands/generate-epics.md (8.9)
  - .claude/agents/audit-qa.md (8.7)
  ```

**Incremental analyzer selection**:
- If file is a command → run audit-command-analyzer
- If file is an agent → run audit-agent-analyzer
- If file is a skill → run audit-skill-analyzer
- If file is a hook → run audit-hook-analyzer
- **Always run audit-dependency-analyzer** (dependency graph may have changed)

> **WORKAROUND (TASK-176)**: Background agents have output capture issues.
> Run analyzers SEQUENTIALLY (NO run_in_background) to ensure output is captured.

Run analyzers **SEQUENTIALLY** using Task tool (NO run_in_background) with `timeout: 120000`:

- **audit-command-analyzer.md** (sonnet) - For each command file
- **audit-agent-analyzer.md** (sonnet) - For each agent file
  - Delegates to **audit-domain-researcher.md** (sonnet) for domain-focused agents
- **audit-skill-analyzer.md** (haiku) - For each skill directory
- **audit-hook-analyzer.md** (haiku) - For each hook file
- **audit-dependency-analyzer.md** (sonnet) - Full dependency graph analysis

**Example: Launching command analyzer**

```
Task tool invocation with:
- Agent: .claude/agents/audit-command-analyzer.md
- Model: sonnet
- NO run_in_background (TASK-176 workaround)
- timeout: 120000
- Inputs:
  - Command file path (e.g., .claude/commands/generate-epics.md)
  - artifact_path: [artifact_path from Phase 0.5]
  - Access to claude-code-audit skill criteria
  - Access to research-methodology skill
```

Repeat pattern for each analyzer with appropriate model and inputs.

Pass to component analyzers:
- File/directory path
- `artifact_path`
- Access to claude-code-audit skill criteria
- Access to research-methodology skill

Pass to dependency analyzer:
- Full component inventory from Phase 1
- Path to `.mcp.json`
- `artifact_path`
- Reference to `dependency-patterns.md` from claude-code-audit skill

Wait for all analyzers to complete using TaskOutput.

**Timeout handling**: If any analyzer times out:
- Log warning: "Analyzer [name] timed out after 120s"
- Continue with available results (graceful degradation)
- Mark as `[!]` (timed out) instead of `[x]` in progress checklist
- QA synthesis will note incomplete analysis in report

**Collecting results**: TaskOutput returns lightweight status; artifacts are on disk.

### Phase 2 Complete

**Verified:**
- Command analyzers completed
- Agent analyzers completed (with domain research delegation)
- Skill analyzers completed
- Hook analyzers completed
- Dependency analyzer completed

**Update progress checklist:**
- Mark each completed analyzer item as `[x]` with score:
  ```markdown
  - [x] audit-command-analyzer: generate-epics.md (score: 9.2)
  ```
- Save checklist file

**Outputs:** All analyzer results stored in session context

**Next:** Running QA synthesis to generate composite scores...

---

### Phase 2.5: QA Synthesis

**Resume check**: If `is_resuming` and Phase 2.5 fully complete, skip to Phase 3.

**Incremental merge**: If `is_incremental == true` AND `cache_valid == true`:
1. **Combine results**:
   - Fresh analyzer results for `changed_files[]` and `new_files[]`
   - Cached results for `unchanged_files[]` (loaded in Phase 2)
   - Remove entries for `deleted_files[]` from merged dataset
2. **Mark data source** for each component:
   ```
   merged_results = {
     ".claude/commands/audit.md": {
       "source": "fresh",
       "score": [from analyzer],
       "output_path": "[current artifact path]"
     },
     ".claude/commands/generate-epics.md": {
       "source": "cached",
       "score": 9.2,
       "output_path": "[cached artifact path]",
       "cached_from": "2026-01-07T10-00-00-x1y2"
     }
   }
   ```
3. **Note in QA input**: `incremental_audit: true, fresh_count: N, cached_count: M`
4. **Log merge summary**:
   ```
   Merging results: [N] fresh + [M] cached = [total] components
   ```

[Think harder: Synthesize results from all component analyzers and dependency analysis.
Consider:
- Cross-component patterns (are issues systemic or isolated?)
- Dependency chain health implications (do broken links affect many components?)
- Scoring consistency (are similar issues scored similarly across components?)
- System-wide improvement priorities (what fixes would cascade benefits?)]

Run **audit-qa.md** (sonnet) with:
- `artifact_directory`: [artifact_path from Phase 0.5]
- QA agent reads artifacts from disk
- Scoring rubric (including DependencyHealth dimension)

Outputs:
- Composite scores per component (with DependencyHealth factored in)
- System-wide verdicts
- Cross-component patterns
- Dependency chain issues (broken links, circular deps, orphans)
- Critical issues and warnings

### Phase 2.5 Complete

**Verified:**
- Composite scores calculated for all components
- System-wide verdicts assigned
- Dependency health assessed
- Critical issues identified

**Update progress checklist:**
- Mark Phase 2.5 items as `[x]`:
  ```markdown
  - [x] Run audit-qa.md (overall: X.X)
  - [x] Calculate composite scores
  ```
- Save checklist file

**Outputs:** QA synthesis report with overall score

**Next:** Presenting reflection options (always runs)...

---

### Phase 2.6: Reflection & Options (ALWAYS RUNS)

> **Core Principle**: Reflection options are ALWAYS presented regardless of score. Even excellent scores have improvement potential - continuous improvement (改善).

**ALWAYS present options to user** - no score-based gates:

1. **Present QA results** to user:
   ```
   Overall score is X.X ([VERDICT]).

   Key areas:
   - [Top strength]
   - [Top improvement opportunity]

   Options:
   [R]eview details - See full analysis
   [P]roceed to recommendations - Get fix suggestions
   [E]nhance focus - Deep dive on specific dimension
   [C]ancel - Stop audit
   ```

2. **Score-based guidance** (informational, not blocking):
   | Score Range | Guidance |
   |-------------|----------|
   | < 7.0 | Critical fixes - reflection strongly recommended |
   | 7.0 - 8.0 | Quality improvements - reflection valuable |
   | >= 8.0 | Enhancements - reflection for excellence |

3. If "Review details" - Show full analyzer outputs
4. Max 1 reflection iteration (prevents infinite loops)

### Phase 2.6 Complete

**Verified:**
- User feedback collected
- Reflection decision recorded
- Options presented regardless of score

**Outputs:** Proceeding to enhancement analysis

**Next:** Running enhancement and gap analyzers in parallel...

---

### Phase 3: Enhancement & Gap Analysis

**Resume check**: If `is_resuming`:
- Skip enhancement analyzers already marked `[x]` in checklist
- Only run analyzers still marked `[ ]`

> **WORKAROUND (TASK-176)**: Run analyzers SEQUENTIALLY to ensure output capture.

Run enhancement analyzers **SEQUENTIALLY** using Task tool (NO run_in_background) with `timeout: 60000`:

**Group 1** (run sequentially):
- **audit-mcp-analyzer.md** (haiku) with:
  - Path to `.mcp.json`
  - Project root for stack detection
  - Reference to `mcp-patterns.md`
  - `artifact_path`: [artifact_path from Phase 0.5]
- **audit-enhancement-analyzer.md** (sonnet) with:
  - Component inventory from Phase 1
  - QA scores from Phase 2.5
  - Dependency analyzer output (graph, health, issues)
  - Reference to `enhancement-patterns.md`
  - Reference to `dependency-patterns.md`
- **audit-research-advisor.md** (sonnet) - **ALWAYS RUNS**:
  - Component inventory from Phase 1
  - Dependency analyzer output (graph, issues)
  - Enhancement suggestions (preliminary)
  - Reference to research-methodology skill

Wait for Group 1 to complete using TaskOutput.

**Group 2** (after Group 1, ALWAYS RUNS):
- **audit-solution-architect.md** (sonnet) - **ALWAYS RUNS**:
  - Domain researcher outputs
  - QA synthesis scores
  - Reference to `solution-patterns.md`
  - **Gap Mode**: If coverage < 80%, propose new components
  - **Enhancement Mode**: If coverage >= 80%, propose optimizations
- **audit-gap-analyzer.md** (sonnet) - with research findings:
  - Component inventory from Phase 1
  - Audit scores from Phase 2.5
  - Research findings from audit-research-advisor
  - Reference `gap-patterns.md`
- **skill-discovery-advisor.md** (sonnet) - **ALWAYS RUNS** (skill backing cascade):
  - Full agent inventory from Phase 1
  - QA synthesis scores
  - Reference to `skill-discovery` skill
  - Analyzes ALL agents for skill backing
  - Recommends skill creation/enhancement

Wait for all to complete using TaskOutput.

### Phase 3 Complete

**Verified:**
- MCP analysis completed
- Enhancement analysis completed (including chain optimizations)
- Research advisor completed (always runs)
- Solution architect completed (always runs - gap or enhancement mode)
- Gap analyzer completed (with research findings)
- Skill discovery advisor completed (skill backing cascade)

**Update progress checklist:**
- Mark Phase 3 items as `[x]`:
  ```markdown
  - [x] audit-mcp-analyzer
  - [x] audit-enhancement-analyzer
  - [x] audit-research-advisor
  - [x] audit-solution-architect
  - [x] audit-gap-analyzer
  - [x] skill-discovery-advisor
  ```
- Save checklist file

**Outputs:** Enhancement opportunities, gap analysis, research-backed recommendations

**Next:** Generating prioritized recommendations...

---

### Phase 4: Recommendations & History

**Resume check**: If `is_resuming` and Phase 4 fully complete, skip to Phase 5.

[Think harder: Prioritize recommendations considering:
- Quick wins vs strategic investments
- Dependency order (fix foundations before extensions)
- User impact (fixes that improve daily workflow first)
- Research confidence (prioritize well-sourced recommendations)]

1. **Run audit-recommender.md** (haiku) with:
   - QA synthesis output
   - All issues from analyzers (including dependency analyzer)
   - Solution architect proposals
   - Enhancement analyzer suggestions (including chain optimizations)
   - Gap analysis results
   - Research advisor findings (improvement recommendations)

2. **Compare to baseline or previous audit** (if `backlog/audit-history.json` exists):
   - **If `baseline_audit_id` specified**:
     - Load audit entry matching `audit_id` or `timestamp` from history
     - If not found: WARN - "Baseline audit not found, falling back to previous audit"
     - Store as `comparison_audit` with label "Baseline: [audit_id]"
   - **Else** (default behavior):
     - Load most recent audit from history
     - Store as `comparison_audit` with label "vs Previous"
   - Compare scores (↑ improved, ↓ degraded)
   - Show delta summary with comparison label

### Phase 4 Complete

**Verified:**
- Recommendations prioritized
- History comparison completed (baseline or previous)

**Update progress checklist:**
- Mark Phase 4 items as `[x]`:
  ```markdown
  - [x] Run audit-recommender.md
  - [x] Compare to baseline/previous audit
  ```
- Save checklist file

**Outputs:** Prioritized fix list with research confidence levels

**Next:** Generating final audit report...

---

### Phase 5: Report Generation

**Resume check**: If `is_resuming` and Phase 5 fully complete, skip to Phase 6.

Generate final report:

```
# Audit Report: [project-name]
Generated: [timestamp]

## Executive Summary
| Metric | Value |
|--------|-------|
| Overall Score | X.X/10 |
| Verdict | [VERDICT] |
| Components | X commands, X agents, X skills, X hooks |
| Critical Issues | X |
| Warnings | X |

## Comparison: [Baseline: audit_id] OR [vs Previous]
| Component | Baseline/Previous | Current | Delta |
|-----------|-------------------|---------|-------|
| [name] | X.X | Y.Y | +/-Z.Z |

## Component Scores
[From QA synthesis - tables per type]

## Dependency Chain Analysis

### Chain Health
| Metric | Value |
|--------|-------|
| Dependency Health Score | X.X/10 |
| Chain Verdict | [HEALTHY/NEEDS_ATTENTION/UNHEALTHY] |
| Total Nodes | X |
| Total Edges | X |
| Max Chain Depth | X |

### Dependency Graph (ASCII)
```
[Top-level chain visualization]
```

### Dependency Graph (Mermaid)
```mermaid
[Mermaid diagram syntax]
```

### Chain Issues
| Issue Type | Count | Severity | Components |
|------------|-------|----------|------------|
| Broken Links | N | Critical | [list] |
| Circular Deps | N | Critical | [list] |
| Orphans | N | Warning | [list] |

### Chain Optimization Opportunities
| Opportunity | Type | Effort | Impact |
|-------------|------|--------|--------|
| [action] | [type] | Low/Med/High | [improvement] |

## Gap Analysis Results
### Coverage Assessment
| Category | Existing | Expected | Gap |
|----------|----------|----------|-----|
| Commands | X | Y | Z |

### High Priority Gaps
| Gap | Type | Rationale | Effort |
|-----|------|-----------|--------|
| [name] | [type] | [why needed] | [effort] |

## Enhancement Opportunities
### MCP Recommendations
| Missing MCP | Why | Effort | Impact |
|-------------|-----|--------|--------|

### Skill Enhancements
| Skill | Current | Suggested | Priority |
|-------|---------|-----------|----------|

### System-Level Proposals
| Proposal | Type | Gap Addressed | Priority | Effort |
|----------|------|---------------|----------|--------|

## Research Findings
### Claude Code Best Practices Applied
| Finding | Source | Applicable To | Action |
|---------|--------|---------------|--------|
| [pattern] | [source] | [components] | [recommendation] |

### Synergy Opportunities
| Component | + Integration | = Benefit |
|-----------|---------------|-----------|
| [skill/agent] | [MCP/agent] | [outcome] |

### Research Confidence
| Domain | Confidence | Sources |
|--------|------------|---------|
| [area] | High/Med/Low | X |

## Top Recommendations
[Top 5 quick wins from recommender]

## Next Steps
1. [Highest priority fix]
2. [Second priority]
3. [Third priority]

---
_Audit powered by claude-code-audit skill_
```

### Phase 5 Complete

**Verified:**
- Executive summary generated
- Component scores tabulated
- Dependency chain visualized
- Gap analysis included
- Enhancement opportunities listed
- Research findings documented
- Top recommendations prioritized

**Update progress checklist:**
- Mark Phase 5 items as `[x]`:
  ```markdown
  - [x] Generate final report
  ```
- Save checklist file

**Outputs:** Complete audit report ready for review

**Next:** Evaluating threshold (if set)...

---

### Phase 5.5: Threshold Evaluation (if --strict-threshold)

If `strict_threshold` is set:

1. **Compare final score against threshold**:
   ```
   Final Score: [X.X]
   Threshold: [strict_threshold]
   ```

2. **Determine result**:
   - If `final_score >= strict_threshold`:
     ```
     ## Quality Gate: PASS ✓
     Score [X.X] meets threshold [Y.Y]
     ```
   - If `final_score < strict_threshold`:
     ```
     ## Quality Gate: FAIL ✗
     Score [X.X] below threshold [Y.Y]
     Improvement needed: [difference] points
     ```

3. **Store result** for Phase 7.6:
   ```
   quality_gate_passed = (final_score >= strict_threshold)
   ```

### Phase 5.5 Complete

**Verified:**
- Threshold comparison performed
- PASS/FAIL result determined
- Result stored for GitHub integration

**Outputs:** Quality gate evaluation complete

**Next:** Converting report format (if non-markdown)...

---

### Phase 5.6: Report Format Conversion (if non-markdown)

If `output_format` is not markdown:

1. **For HTML format**:
   - Load HTML template from `.claude/skills/claude-code-audit/report-template.html`
   - Replace placeholders:
     - `{{project_name}}` - Project/audit target name
     - `{{timestamp}}` - Current timestamp
     - `{{audit_id}}` - Current audit ID
     - `{{content}}` - Full report markdown converted to HTML
   - Process Mermaid diagrams (leave as `<div class="mermaid">` for client-side rendering)
   - Write to `output_file` or `audit-[audit_id].html`

2. **For PDF format**:
   - Generate HTML first (as intermediate step)
   - Use one of:
     - **document-skills:pdf** - Preferred if available
     - **Playwright MCP** - Browser print to PDF via `mcp__plugin_playwright_playwright__browser_navigate` then print
     - **pandoc** - CLI fallback: `pandoc audit.html -o audit.pdf`
   - Write to `output_file` or `audit-[audit_id].pdf`

3. **Report output location**:
   ```
   Report generated: [output_file]
   Format: [format]
   Size: [file size]
   ```

4. **Error handling**:
   - HTML generation fails: Fall back to markdown output with warning
   - PDF generation fails: Suggest alternative methods
     ```
     PDF generation failed. Alternatives:
     1. Install document-skills plugin: claude plugin install document-skills
     2. Use pandoc: pandoc audit.html -o audit.pdf
     3. Open HTML in browser and print to PDF
     ```

### Phase 5.6 Complete

**Verified:**
- Report converted to requested format
- File written to specified/default location
- Mermaid diagrams included (rendered client-side for HTML)

**Outputs:** Report file generated

**Next:** Updating audit history...

---

### Phase 6: History Update

**Resume check**: If `is_resuming` and Phase 6 fully complete, skip to Phase 7.

If `backlog/` exists:

1. Update `backlog/audit-history.json`:
   ```json
   {
     "audits": [
       {
         "timestamp": "YYYY-MM-DD",
         "overall_score": X.X,
         "verdict": "VERDICT",
         "components": {
           "commands": X,
           "agents": X,
           "skills": X,
           "hooks": X
         },
         "scores": {
           "component-name": X.X
         }
       }
     ]
   }
   ```

2. **Ask user**: "Save audit to history? [Y/n]"

### Phase 6 Complete

**Verified:**
- Audit history updated (if confirmed)
- Historical comparison available for next audit

**Update progress checklist:**
- Mark Phase 6 items as `[x]`:
  ```markdown
  - [x] Update audit-history.json
  ```
- Save checklist file

**Outputs:** Audit saved to `backlog/audit-history.json`

**Next:** Updating incremental cache (if applicable)...

---

### Phase 6.5: Cache Update (v0.24.0)

**Skip if `is_incremental == false` AND `clear_cache == false`**:
Only update cache for incremental audits or when `--no-cache` forces rebuild.

1. **Get current git commit hash** (if in git repo):
   ```bash
   current_commit = git rev-parse HEAD
   ```
   - If not in git: `current_commit = null`

2. **Build cache entry for each audited file**:
   For each file in `changed_files[]` and `new_files[]`:
   ```json
   {
     "[file_path]": {
       "hash": "[sha256 of file content]",
       "mtime": "[file modification time ISO]",
       "score": [analyzer score],
       "verdict": "[EXCELLENT/GOOD/etc]",
       "analyzer_output_path": "backlog/audit-outputs/[audit_id]/[analyzer]-[filename].json"
     }
   }
   ```

3. **Merge with unchanged files** (keep their cache entries unchanged):
   - Copy entries from `unchanged_files[]` as-is
   - **Remove entries for `deleted_files[]`**

4. **Update cache metadata**:
   ```json
   {
     "version": "1.0",
     "last_audit_id": "[current audit_id]",
     "last_audit_timestamp": "[current timestamp ISO]",
     "last_commit_hash": "[current_commit]",
     "files": { ... merged entries ... }
   }
   ```

5. **Write cache file atomically**:
   - Write to temporary file: `backlog/audit-outputs/.audit-cache.json.tmp`
   - Rename to final: `backlog/audit-outputs/.audit-cache.json`
   - If write fails: WARN but don't fail audit

6. **Log cache update**:
   ```
   Cache updated: [N] entries ([M] fresh, [K] unchanged)
   Location: backlog/audit-outputs/.audit-cache.json
   ```

### Phase 6.5 Complete

**Verified:**
- Cache file updated (if incremental mode)
- File hashes and mtimes recorded
- Analyzer output paths stored for reuse

**Update progress checklist:**
- Mark Phase 6.5 items as `[x]`:
  ```markdown
  - [x] Update audit cache
  ```
- Save checklist file

**Outputs:** Cache ready for next incremental audit

**Next:** Checking for task generation opportunities...

---

### Phase 7: Task Generation (optional)

**Resume check**: If `is_resuming` and Phase 7 fully complete, skip to Phase 7.5.

If issues found (P0/P1/P2):

1. **Collect issues** from all phases:
   - Critical issues (P0)
   - Warnings (P1)
   - Enhancement opportunities (P2)

2. **Ask user**:
   ```
   Found X issues (Y critical, Z warnings, W enhancements).

   Generate tasks for these issues? [Y/n]
   ```

3. **If Yes**: For each issue by priority:
   - Run `/generate-task "[issue description]" --epic EPIC-AUDIT`
   - Link to audit report timestamp
   - Set appropriate priority (P0 → high, P1 → medium, P2 → low)

4. **Report created tasks**:
   ```
   Created X tasks:
   - TASK-XXX: [P0 issue] (high priority)
   - TASK-XXY: [P1 issue] (medium priority)
   - TASK-XXZ: [P2 enhancement] (low priority)
   ```

5. **Update progress checklist:**
   - Mark Phase 7 items as `[x]`:
     ```markdown
     - [x] Offer task generation
     ```
   - Save checklist file

### Phase 7.5: Artifact Cleanup

1. **Calculate artifact size**:
   - Count files in `backlog/audit-outputs/[audit_id]/`
   - Calculate total size in MB

2. **Ask user**:
   ```
   Audit complete. Artifacts stored in: backlog/audit-outputs/[audit_id]/
   Files: X | Size: Y MB

   Cleanup options:
   [K]eep for 7 days (default)
   [A]rchive indefinitely
   [D]elete immediately
   [S]kip cleanup
   ```

3. **Execute choice**:
   - **Keep (default)**: Add entry to `.cleanup-schedule.json`:
     ```json
     {
       "[audit_id]": {
         "created": "[timestamp]",
         "cleanup_date": "[timestamp + 7 days]",
         "size_mb": Y
       }
     }
     ```
   - **Archive**: Move to `backlog/audit-outputs/archive/[year]/[month]/[audit_id]/`
   - **Delete**: Remove directory `backlog/audit-outputs/[audit_id]/`
   - **Skip**: Leave as-is, no schedule entry

4. **Auto-cleanup old artifacts** (at start of each audit):
   - Check `.cleanup-schedule.json` for expired entries
   - Delete directories past cleanup_date
   - Remove expired entries from schedule

5. **Progress checklist cleanup**:
   - Ask user:
     ```
     Delete progress checklist (audit-progress-[audit_id].md)? [Y/n]
     ```
   - **If Yes**: Remove `backlog/audit-outputs/audit-progress-[audit_id].md`
   - **If No**: Keep for reference (useful for debugging/auditing)

### Phase 7.5 Complete

**Verified:**
- Artifact cleanup choice recorded (if applicable)
- Old artifacts cleaned up (if any expired)
- Progress checklist cleanup handled

**Update progress checklist** (if not deleted):
- Mark Phase 7.5 items as `[x]`:
  ```markdown
  - [x] Cleanup artifacts
  ```
- Update checklist status to `completed`:
  ```markdown
  **Status:** completed
  ```
- Save checklist file

**Outputs:** Artifact directory managed according to user preference

---

### Phase 7.6: GitHub Integration (Optional)

**Prerequisite**: GitHub MCP configured in `.mcp.json` with valid `GITHUB_PERSONAL_ACCESS_TOKEN`

1. **Check GitHub MCP availability**:
   - If GitHub MCP not available: Skip this phase silently
   - If available but no token: Skip with note "GitHub MCP available but GITHUB_PERSONAL_ACCESS_TOKEN not set"

2. **Detect git context**:
   - Check if project is in a git repository
   - Get current branch name
   - Get repository owner/name from remote URL
   - Check for open PR on current branch (if possible)

3. **If PR detected, ask user**:
   ```
   Found open PR #XXX for branch '[branch]'.

   Post audit results to GitHub? [Y/n]

   Options:
   [C]omment - Post audit summary as PR comment
   [S]tatus - Set commit status check (pass/fail based on score)
   [B]oth - Post comment AND set status
   [N]one - Skip GitHub integration
   ```

4. **If Comment selected**:
   - Format audit summary as markdown:
     ```markdown
     ## 🔍 Audit Results

     | Metric | Value |
     |--------|-------|
     | Overall Score | X.X/10 |
     | Verdict | [VERDICT] |
     | Critical Issues | N |
     | Warnings | N |

     ### Top Issues
     1. [Issue 1]
     2. [Issue 2]
     3. [Issue 3]

     ### Recommendations
     - [Top recommendation]

     ---
     _Generated by `/audit` on [timestamp]_
     ```
   - Post as PR comment using GitHub MCP

5. **If Status selected**:
   - Determine state based on threshold (if set) or default:
     - **If `strict_threshold` set**: Use `quality_gate_passed` result from Phase 5.5
       - `success` if `quality_gate_passed = true`
       - `failure` if `quality_gate_passed = false`
     - **Else**: Use default threshold
       - `success` if score >= 7.0
       - `failure` if score < 7.0
   - Set commit status with:
     - context: `claude-code/audit`
     - description: `Audit: X.X/10 (VERDICT)` + ` [threshold: Y.Y]` if strict_threshold set
     - target_url: (optional link to full report if available)

6. **Report GitHub actions taken**:
   ```
   GitHub Integration:
   - [x] Posted audit summary to PR #XXX
   - [x] Set commit status: success (8.5/10)
   ```

### Phase 7.6 Complete

**Verified:**
- GitHub integration executed (if available and requested)
- PR comment posted (if selected)
- Commit status set (if selected)

**Update progress checklist** (if not deleted):
- Mark Phase 7.6 items as `[x]`:
  ```markdown
  - [x] GitHub integration (optional)
  ```
- Save checklist file

**Outputs:** Audit results visible in GitHub PR/commit status

---

### Phase 7.7: Watch Loop (v0.23.0)

**Skip if `is_watching == false`**: If not in watch mode, proceed to Phase 7.8 Shutdown.

**Initial audit complete.** Now entering watch loop for continuous monitoring.

1. **Display watch status**:
   ```
   [HH:MM:SS] ✓ Initial audit: [score]/10 ([verdict])
   [HH:MM:SS] Watching for changes...
   ```

2. **Poll for file changes** (loop every `watch_poll_interval` ms):

   a. **Scan watched files**:
      - Use Glob with same patterns from Phase 0.1 step 2
      - For each file, check:
        - New file? (path not in `watch_file_checksums`)
        - Deleted file? (path in checksums but file gone)
        - Modified file? (mtime > `watch_last_modified[path]` OR hash differs)

   b. **Collect changes**:
      - If changes detected:
        ```
        watch_pending_changes.push({
          path: [path],
          type: "created" | "modified" | "deleted",
          detected_at: now()
        })
        ```
      - Update `watch_last_scan = now()`

   c. **Apply debounce** (trailing edge):
      - If `watch_pending_changes` is non-empty:
        - Wait until no new changes for `watch_debounce_ms`
        - If more changes arrive during debounce, reset timer and merge changes
      - Once stable:
        ```
        debounce_complete = true
        ```

   d. **Check for user interrupt**:
      - If user types "stop" or sends Ctrl+C signal:
        - Set `watch_exit_requested = true`
        - Break loop → Proceed to Phase 7.8

3. **Trigger incremental audit** (when `debounce_complete` and changes exist):

   a. **Display change notification**:
      ```
      [HH:MM:SS] Change detected: [changed_files (comma-separated)]
      [HH:MM:SS] Running incremental audit...
      ```

   b. **Audit queue mutex**:
      - If audit already running: Queue changes, continue polling
      - If audit complete: Process next batch from queue

   c. **Run audit for changed components**:
      - Determine affected component types from changed paths
      - Re-run Phases 2-7.5 for those components only
      - Use existing artifact directory (same `audit_id`)

   d. **Calculate and display score delta**:
      ```
      previous_score = [last audit score]
      new_score = [current audit score]
      delta = new_score - previous_score

      [HH:MM:SS] ✓ Updated: [new_score]/10 ([verdict]) [+delta or -delta]
      ```

   e. **Update checksums**:
      - For each processed file:
        ```
        watch_file_checksums[path] = hash(new_content)
        watch_last_modified[path] = file_mtime
        ```
      - Clear `watch_pending_changes`
      - Increment `watch_audit_count`

4. **Memory management** (every 10 audit cycles):
   - Check context size
   - If approaching limits:
     ```
     [HH:MM:SS] ⚠ High memory usage. Consider restarting watch mode.
     ```
   - Clear any cached intermediate results

5. **Loop continuation**:
   - If `watch_exit_requested == false`: Return to step 2
   - If `watch_exit_requested == true`: Proceed to Phase 7.8

### Phase 7.7 Complete

**Verified:**
- File change detection working
- Debounce coalescing rapid changes
- Score deltas displaying correctly
- No overlapping audits

**Note:** Phase 7.7 is a loop - it continuously runs until user exits.

---

### Phase 7.8: Graceful Shutdown (v0.23.0)

**Skip if `is_watching == false`**: If not in watch mode, proceed directly to audit completion.

**User has requested exit** (Ctrl+C or "stop" command).

1. **Acknowledge shutdown request**:
   ```
   ^C
   [HH:MM:SS] Stopping watch mode...
   ```

2. **Wait for active audit to complete** (if any):
   - If audit in progress:
     ```
     [HH:MM:SS] Waiting for current audit to complete...
     ```
   - Allow up to 30 seconds for completion
   - If timeout: Warn and force exit

3. **Calculate session statistics**:
   ```
   watch_duration = now() - watch_start_time
   total_audits = watch_audit_count + 1  # Including initial
   avg_interval = watch_duration / total_audits
   final_score = [last recorded score]
   score_change = final_score - initial_score
   ```

4. **Display session summary**:
   ```
   [HH:MM:SS] Watch mode stopped

   ## Session Summary

   | Metric | Value |
   |--------|-------|
   | Duration | [HH:MM:SS] |
   | Total audits | [N] |
   | Files monitored | [N] |
   | Final score | [score]/10 ([verdict]) |
   | Score change | [+/-delta] from initial |

   Artifacts: backlog/audit-outputs/[audit_id]/
   ```

5. **Cleanup**:
   - Clear watch state from Memory MCP (if used)
   - Close any open file handles
   - Release audit mutex

6. **Offer next actions**:
   ```
   ### Next Steps
   - View detailed report: `Read backlog/audit-outputs/[audit_id]/qa-synthesis.json`
   - Restart watch: `/audit --watch [target]`
   - Full audit: `/audit [target]`
   ```

### Phase 7.8 Complete

**Verified:**
- Clean exit without errors
- Session summary accurate
- No orphaned resources

**Outputs:** Final session summary with statistics

---

## Error Handling

**Error Format Reference**: See `.claude/skills/error-handling/error-codes.md`

### Input Validation Errors

| Situation | Error | Exit |
|-----------|-------|------|
| Invalid target | [ERROR] E008: Invalid target '[input]'. Valid: all, commands, agents, skills, hooks, mcp, or filename | 1 |
| Conflicting flags | [ERROR] E009: Conflicting flags: --watch cannot be used with --resume or --dry-run | 1 |

### Configuration Errors

| Situation | Error | Exit |
|-----------|-------|------|
| No .claude/ directory | [ERROR] E301: No Claude Code configuration found in current directory | 2 |
| Empty target type | [WARNING] No [type] components found to audit | 0 |

### Agent/Execution Errors

| Situation | Error | Exit |
|-----------|-------|------|
| Analyzer timeout | [ERROR] E201: Analyzer '[name]' timed out after [seconds]s. Re-run with --resume | 2 |
| Analyzer crash | [ERROR] E202: Analyzer '[name]' failed: [reason]. Continuing with partial results | 2 |
| QA synthesis failure | [ERROR] E205: QA synthesis failed. Re-run with --resume from Phase 2.5 | 2 |
| All analyzers fail | [ERROR] E206: All analyzers failed. Check .claude/ configuration | 2 |

### Verbose Mode

Add `-v` or `--verbose` for detailed output:
```
> /audit -v
[2026-01-09 10:30:15] Phase 0: Target Resolution
[2026-01-09 10:30:15]   Target: all
[2026-01-09 10:30:16]   Found: 12 commands, 28 agents, 8 skills, 6 hooks
[2026-01-09 10:30:17] Phase 2: Parallel Analysis
[2026-01-09 10:30:17]   Starting: audit-command-analyzer (sonnet)
...
```

### Phase-Specific Failure Recovery

| Phase | Failure Mode | Error Code | Recovery Action |
|-------|--------------|------------|-----------------|
| 0.5 | Artifact directory creation fails | E102 | Check disk space, permissions. Delete partial: `rm -rf backlog/audit-outputs/[audit_id]/` |
| 0.6 | Progress checklist creation fails | E103 | Restart audit (no cleanup needed) |
| 2 | Analyzer timeout/crash | E201/E202 | Audit continues with partial results. Re-run with `--resume` |
| 2.5 | QA synthesis fails | E205 | Check analyzer outputs. Re-run with `--resume` from Phase 2.5 |
| 3 | Enhancement analyzer fails | E202 | Audit completes without enhancement data. Re-run full audit |
| 5 | Report generation fails | E103 | Results still in artifacts. Manually review `backlog/audit-outputs/[audit_id]/` |
| 5.5 | Threshold check fails | (expected) | Expected behavior for `--strict-threshold`. Review score |
| 6 | History update fails | E108 | Check `backlog/audit-history.json` format. Backup and fix |
| 7 | Task generation fails | E202 | Optional feature. Manually create tasks from report |
| 7.5 | Artifact cleanup fails | E109 | Manual cleanup: `rm -rf backlog/audit-outputs/[audit_id]/` |
| 0.1 | Watch scope empty | E301 | Verify target exists. Check `.claude/` directory structure |
| 7.7 | File watcher polling fails | E202 | Log warning, retry 3x, then exit watch mode gracefully |
| 7.7 | Incremental audit timeout | E201 | Skip this cycle, log warning, continue watching |
| 7.7 | Memory growth > 500MB | (warning) | Warn user, suggest restarting watch mode |
| 7.8 | Shutdown timeout (> 30s) | E201 | Force exit, warn about potential incomplete audit |
| 0.7 | Cache file corrupted | E108 | Warning, delete cache, fall back to full audit |
| 0.7 | Cache version mismatch | (expected) | Full audit, rebuild cache |
| 0.7 | Git diff fails | E202 | Fall back to mtime comparison |
| 0.7 | All files unchanged | (info) | Offer: view cached report, force full audit, or quit |
| 6.5 | Cache write fails | E103 | Warning (non-blocking), audit results still valid |
| 6.5 | File deleted during audit | E104 | Skip, remove from cache, warn user |

### Artifact Cleanup Commands

**Clean specific audit artifacts:**
```bash
# Unix/macOS
rm -rf backlog/audit-outputs/[audit_id]/
rm -f backlog/audit-outputs/audit-progress-[audit_id].md

# Windows (PowerShell)
Remove-Item -Recurse -Force backlog\audit-outputs\[audit_id]\
Remove-Item -Force backlog\audit-outputs\audit-progress-[audit_id].md
```

**Clean all orphaned artifacts** (older than 7 days):
```bash
# Unix/macOS - list first, then delete
find backlog/audit-outputs/ -maxdepth 1 -type d -mtime +7 -name "20*"

# Windows (PowerShell) - list first
Get-ChildItem backlog\audit-outputs -Directory | Where-Object {$_.CreationTime -lt (Get-Date).AddDays(-7)}
```

**Safety check before cleanup:**
- Verify no audit is currently running (`audit-progress-*.md` with `Status: in_progress`)
- Check for valuable custom reports before deletion

### Rollback Procedures

**Restore to clean state after failed audit:**

1. **Identify failed audit ID** from error message or recent directories:
   ```bash
   ls -lt backlog/audit-outputs/ | head -5
   ```

2. **Check if resumable** (progress checklist exists and Status: in_progress):
   - If yes: Try `--resume [audit_id]` first
   - If no: Proceed to cleanup

3. **Clean partial artifacts**:
   ```bash
   rm -rf backlog/audit-outputs/[audit_id]/
   rm -f backlog/audit-outputs/audit-progress-[audit_id].md
   ```

4. **Verify audit-history.json** is valid JSON:
   ```bash
   # Unix/macOS
   python3 -m json.tool backlog/audit-history.json > /dev/null && echo "Valid"

   # Windows (PowerShell)
   Get-Content backlog\audit-history.json | ConvertFrom-Json
   ```

5. **If history corrupted**: Restore from backup or remove last entry manually

### Recovery Decision Tree

```
Audit failed?
├── During Phase 0-1 (setup)?
│   └── Delete artifacts → Start fresh
├── During Phase 2-4 (analysis)?
│   ├── Progress checklist exists?
│   │   └── Yes → Try `--resume`
│   └── No → Delete artifacts → Start fresh
├── During Phase 5-7 (reporting)?
│   └── Results in artifacts → Manual review → Clean up
└── Unknown error?
    └── Check logs → Report issue → Clean up → Start fresh
```

## CRITICAL RULES

- **ALWAYS** run the complete pipeline (analysis + enhancements + gaps + history)
- **ALWAYS** use parallel execution for analyzers
- **NEVER** modify any files during audit - analysis only
- **ALWAYS** use sonnet for QA synthesis
- **ALWAYS** provide actionable recommendations
- **ALWAYS** present reflection options regardless of score (continuous improvement 改善)
- **ALWAYS** run solution-architect (gap mode OR enhancement mode)
- **ALWAYS** run skill-discovery-advisor for skill backing cascade
- **NEVER** assign neutral 5.0 scores - always produce meaningful analysis
- **NEVER** skip phases based on score thresholds

## Example Usage

```bash
/audit              # Audit everything
/audit commands     # Audit only commands
/audit agents       # Audit only agents
/audit skills       # Audit only skills
/audit hooks        # Audit only hooks
/audit mcp          # Audit MCP configuration
/audit audit.md     # Audit specific file

# Output format examples
/audit --output-format html                    # HTML to audit-[id].html
/audit --output-format pdf                     # PDF to audit-[id].pdf
/audit --output-format html --output-file report.html  # Custom path
/audit commands --output-format pdf            # Audit commands, PDF output

# Watch mode examples (v0.23.0)
/audit --watch                 # Watch all .claude/ files, re-audit on changes
/audit --watch commands        # Watch only command files
/audit --watch agents          # Watch only agent files
/audit --watch audit.md        # Watch specific file
/audit:quick --watch           # Quick audit on changes (critical issues only)

# Watch mode behavior:
# - Initial full audit runs first
# - Polls every 1000ms for changes
# - Debounces rapid changes (waits 1000ms after last change)
# - Type "stop" or Ctrl+C to exit gracefully

# Incremental mode examples (v0.24.0)
/audit --incremental            # Audit only changed files since last audit
/audit --incremental commands   # Incremental audit of commands only
/audit --incremental --no-cache # Force full audit, rebuild cache
/audit --incremental --watch    # Watch with incremental updates each cycle
/audit --incremental --dry-run  # Preview which files would be audited

# Incremental mode behavior:
# - First run: Full audit, creates cache at backlog/audit-outputs/.audit-cache.json
# - Subsequent runs: Only audit changed files (git diff or mtime comparison)
# - Cache stores: file hash, mtime, score, verdict, analyzer output path
# - Use --no-cache to force full audit and rebuild cache
# - If no changes: Option to view cached report, force audit, or quit
```

## Verdicts Reference

| Score | Verdict | Meaning |
|-------|---------|---------|
| >= 8.0 | EXCELLENT | Production ready |
| 7.0-7.9 | GOOD | Minor improvements only |
| 5.0-6.9 | NEEDS_IMPROVEMENT | Specific fixes required |
| 3.0-4.9 | POOR | Significant refactoring |
| < 3.0 | CRITICAL | Should not be used |
