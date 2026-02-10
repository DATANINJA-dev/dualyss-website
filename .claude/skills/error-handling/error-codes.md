# Error Code Registry

Standardized error codes for all CLI commands. Each code has a unique identifier, standard message, and suggested fix.

## E0XX: Input Validation Errors

User-provided input is invalid or missing.

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E001 | Task not found | Check task ID spelling, run `/list-tasks` | 1 |
| E002 | Epic not found | Check epic ID spelling, run `/list-epics` | 1 |
| E003 | Invalid task ID format | Use TASK-XXX format (e.g., TASK-001) | 1 |
| E004 | Invalid epic ID format | Use EPIC-XXX format (e.g., EPIC-001) | 1 |
| E005 | Missing required argument | Provide the required argument, run `/help [command]` | 1 |
| E006 | Invalid status value | Valid values: backlog, in_progress, done | 1 |
| E007 | Invalid task type | Valid types: feature, bug, refactor, research, infra, docs | 1 |
| E008 | Invalid filter | Run `/help [command]` for valid filter options | 1 |
| E009 | Empty input | Provide a task idea or description | 1 |
| E010 | Input too brief | Provide more context (minimum 10 characters) | 1 |
| E011 | Invalid complexity value | Use 1-10 or S/M/L | 1 |
| E012 | Invalid date format | Use YYYY-MM-DD format | 1 |
| E013 | Duplicate ID | ID already exists, use a different identifier | 1 |
| E014 | Invalid flag | Run `/help [command]` for valid flags | 1 |
| E015 | Conflicting flags | Cannot use [flag1] with [flag2] | 1 |

## E1XX: File System Errors

Issues with files, directories, or data persistence.

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E100 | File not found | Check path exists, verify spelling | 2 |
| E101 | Directory not found | Create directory first, check path | 2 |
| E102 | Permission denied | Check file/directory permissions | 2 |
| E103 | File already exists | Use different name or --force flag | 1 |
| E104 | JSON parse error | Check file for syntax errors, validate JSON | 2 |
| E105 | Template not found | Check backlog/templates/ directory | 2 |
| E106 | Write failed | Check disk space and permissions | 2 |
| E107 | Read failed | Check file exists and is readable | 2 |
| E108 | Invalid file format | File does not match expected format | 1 |
| E109 | Corrupted file | File is corrupted, restore from backup | 2 |
| E110 | Backup not found | Check timestamp with `/sync-rollback --list` | 1 |
| E111 | Corrupt backup manifest | Backup unusable, try another timestamp | 1 |
| E112 | Checksum mismatch | Backup files corrupted, try another backup | 2 |
| E113 | Incomplete backup | Backup was interrupted, try another timestamp | 1 |
| E114 | Restore failed | Check permissions and disk space | 2 |
| E115 | Cleanup failed | Manual cleanup of `.backup/` may be needed | 0 |
| E120 | Copy failed | Check source exists and destination writable | 1 |
| E121 | Symlink fallback | Windows: enable Developer Mode for symlinks | 0 |
| E122 | Symlink failed | Check source exists and permissions | 1 |
| E123 | Conflict unresolved | Resolve conflict before proceeding | 1 |
| E124 | Source not found | User-level component missing, skipping | 0 |
| E125 | Manifest write failed | Check .claude/ directory permissions | 1 |

## E2XX: Agent/Execution Errors

Issues with agent execution, timeouts, or processing.

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E200 | Agent timeout | Retry or use --quick mode | 2 |
| E201 | Agent failed | Check agent logs, retry | 2 |
| E202 | QA score too low | Review findings, refine scope | 1 |
| E203 | Dependency incomplete | Complete dependent tasks first | 1 |
| E204 | Circular dependency | Resolve dependency chain | 1 |
| E205 | Analysis incomplete | Some agents did not complete, review partial results | 0 |
| E206 | Verification failed | Step verification did not pass, review changes | 1 |
| E207 | TDD compliance failed | Tests must be written before implementation | 1 |
| E208 | Test execution failed | Fix failing tests before proceeding | 1 |
| E209 | Build failed | Fix build errors before proceeding | 2 |
| E210 | Commit rejected | Pre-commit hook rejected changes | 1 |
| E211 | Acceptance criterion has no mapped test | Map test to AC or mark as untestable | 1 |
| E212 | Output capture failed | Agent output is empty or truncated, retry agent | 2 |
| E213 | Output file size mismatch | Output smaller than expected, verify file write | 2 |

## E3XX: Configuration Errors

Issues with system configuration or external dependencies.

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E300 | MCP not configured | Check .mcp.json exists and is valid | 2 |
| E301 | Serena not available | Ensure Serena MCP server is running | 2 |
| E302 | Invalid configuration | Check config file syntax | 2 |
| E303 | Missing skill | Create skill or remove reference | 2 |
| E304 | Missing agent | Create agent or remove reference | 2 |
| E305 | Missing hook | Create hook or remove reference | 2 |
| E306 | GitHub MCP unavailable | Check GitHub token and MCP config | 2 |
| E307 | Memory MCP unavailable | Check Memory MCP configuration | 2 |
| E308 | Invalid project structure | Missing required directories or files | 2 |
| E309 | Version mismatch | Update to compatible version | 1 |

## Usage Examples

### Basic Error
```
[ERROR] E001: Task not found

Details: TASK-999 does not exist in backlog/tasks/

Suggested fix:
  → Check task ID spelling
  → Run `/list-tasks` to see available tasks
```

### Error with File Context
```
[ERROR] E104: JSON parse error

Details: Syntax error in backlog/tasks.json at line 42

Suggested fix:
  → Check JSON syntax at line 42
  → Use a JSON validator tool
```

### Error with Phase Context
```
[ERROR] E202: QA score too low

Details: Phase 5 (QA Synthesis) returned score 4.8/10

Suggested fix:
  → Review agent findings for gaps
  → Adjust scope and retry
  → Use `/refine TASK-XXX --quick` for faster iteration
```

### Verbose Mode Error (with -v flag)
```
[ERROR] E201: Agent 'task-code-impact' failed

Details: Timeout after 120 seconds

Stack trace (verbose):
  at runAgent() in set-up.md:phase4
  at executeParallel() in set-up.md:step5
  timeout: 120000ms exceeded

Suggested fix:
  → Retry the command
  → Use --quick mode for faster execution
  → Check network connectivity
```

## E4XX: Distribution & Sync Errors

Distribution framework sync operations (EPIC-011: Distribution CLI & Hub Management).

### E42X: Distribution Command Errors

Issues with `/framework` and `/sync` command operations.

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E420 | Invalid framework command | Check command syntax, run `/help` | 1 |
| E421 | Project not initialized | Run `/sync-scaffold` or `/sync-add` first | 1 |
| E422 | Version incompatibility | Check compatibility with `/sync-check-version` | 1 |
| E423 | Sync conflict detected | Resolve conflicts with `/sync-status` | 1 |
| E424 | Hub registry not found | Initialize hub with `/sync-remote` | 1 |
| E425 | Target project not registered | Run `/sync-add` to register project | 1 |
| E426 | Cannot register from hub | Run `/framework register` from a target project, not the hub | 1 |
| E427 | Project already registered | Project is already in the registry. Use `/framework list` to view. | 1 |
| E428 | Project not in registry | Project not found. Use `/framework list` to see registered projects. | 1 |
| E429 | Registry file corrupted | Invalid YAML in registry file. Check `.simon-tools/registry.yaml` | 2 |

### E43X: Distribution Infrastructure Errors

System-level issues during distribution operations.

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E430 | Git subtree operation failed | Check git status, resolve conflicts | 2 |
| E431 | Network error during sync | Check connectivity, retry | 2 |
| E432 | Configuration merge failed | Review merge output, use `/sync-merge-preview` | 1 |
| E433 | CLAUDE.md section parse error | Check LOCAL markers, use `/sync-parse-claude` | 1 |

### Reserved Range

E434-E449 reserved for future distribution errors.

## E5XX: SEO Errors

SEO validation and external service errors for EPIC-012 (SEO Foundation & Skills).

### E50X: SEO Validation Errors

Issues with SEO-related content, markup, or configuration.

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E500 | Missing meta description | Add `<meta name="description">` tag | 1 |
| E501 | Duplicate title tag | Ensure unique `<title>` per page | 1 |
| E502 | Invalid hreflang | Fix language/region codes (e.g., en-US) | 1 |
| E503 | Missing canonical URL | Add `rel="canonical"` link | 1 |
| E504 | Invalid schema.org JSON-LD | Validate JSON syntax and schema type | 1 |
| E505 | Missing Open Graph tags | Add og:title, og:description, og:image | 1 |
| E506 | Robots.txt blocks indexing | Review robots.txt Disallow rules | 1 |
| E507 | Missing sitemap reference | Add sitemap URL to robots.txt | 1 |
| E508 | Orphaned page detected | Add navigation link or remove page | 1 |
| E509 | Broken internal link | Fix href to valid page | 1 |

### E52X: GEO (Generative Engine Optimization) Errors

Issues with AI search platform citation detection and GEO validation.

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E520 | GEO validation failed | Check network/API, review platform status | 2 |
| E521 | Platform not supported | Use: chatgpt, perplexity, claude, gemini, all | 1 |
| E522 | API rate limit exceeded | Wait for cooldown, use different API key | 2 |
| E523 | Platform scraping blocked | Platform may have changed, try API method | 2 |
| E524 | Keyword too long | Max 200 characters allowed | 1 |
| E525 | Invalid output format | Use: console, json, csv | 1 |
| E526 | Network timeout | Retry with --timeout, check connectivity | 2 |
| E527 | No citations found | Informational - keyword not cited on platform | 0 |
| E528 | Invalid keyword file | Use one keyword per line, UTF-8 encoding | 1 |
| E529 | Authentication failed | Check API credentials for platform | 2 |

### E53X: Orthography Validation Errors

Issues with spelling and grammar validation using LanguageTool.

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E530 | Orthography validation failed | Review errors below, fix content issues | 1 |
| E531 | Spelling errors found | Fix misspelled words shown in report | 1 |
| E532 | Grammar errors found | Fix grammar issues shown in report | 1 |
| E533 | Language not supported | Use tier1 languages: en, es, fr, de | 1 |
| E534 | Content not accessible | Check file path/URL is valid and readable | 2 |
| E535 | LanguageTool not available | Install LanguageTool or check server is running | 2 |
| E536 | Hunspell download failed | Check network connectivity, try again later | 2 |
| E537 | Cache corrupted | Clear cache with --clear-cache, reload dictionaries | 2 |

### E54X: GEO Technical Validation Errors

Issues with GEO technical validation for AI crawler readiness (TASK-141).

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E540 | Invalid URL format | URL must start with http:// or https:// | 1 |
| E541 | No semantic HTML structure | Add proper heading hierarchy, lists, or tables | 1 |
| E542 | Missing JSON-LD schema | Add schema.org JSON-LD with Article, FAQ, or HowTo type | 1 |
| E543 | JavaScript-only content (no SSR) | Implement server-side rendering (Next.js, Nuxt, Remix) | 1 |
| E544 | No quotable content found | Add statistics, quotes, or highlighted key facts | 1 |
| E545 | TTFB exceeds threshold | Optimize server response time (target < 200ms) | 1 |
| E546 | Connection timeout | Check URL is accessible, increase --timeout | 2 |
| E547 | DNS resolution failed | Check URL spelling, verify domain exists | 2 |
| E548 | SSL certificate error | Check certificate validity, use http:// if SSL not required | 2 |
| E549 | GEO technical validation failed | General validation failure, check network/URL | 2 |

### E55X: SEO External Service Errors

Issues with external SEO tools, APIs, and validation services.

| Code | Message | Suggested Fix | Exit |
|------|---------|---------------|------|
| E550 | Lighthouse API unavailable | Check network, retry later | 2 |
| E551 | Lighthouse timeout | Retry with simpler page, check server | 2 |
| E552 | Schema validator timeout | Retry with smaller payload | 2 |
| E553 | Schema validator error | Check validator service status | 2 |
| E554 | PageSpeed Insights unavailable | Check API key, retry later | 2 |
| E555 | Search Console API error | Verify credentials, check quota | 2 |
| E556 | Crawler blocked by server | Check robots.txt, verify server allows crawling | 2 |
| E557 | SSL certificate error | Renew certificate, check configuration | 2 |
| E558 | DNS resolution failed | Check domain configuration | 2 |
| E559 | CDN cache purge failed | Retry cache purge, check CDN status | 2 |

## Adding New Error Codes

When adding a new error code:

1. **Choose the right range**:
   - E0XX: User input problems
   - E1XX: File/storage problems
   - E2XX: Execution/agent problems
   - E3XX: Configuration problems
   - E4XX: Distribution & sync operations (E401-E418 config-merging, E420-E433 distribution)
   - E5XX: SEO validation/external service problems (E50X validation, E52X GEO citation, E53X orthography, E54X GEO technical, E55X external)

2. **Use next available number** in the range

3. **Write clear message**: Short, describes what went wrong

4. **Provide actionable fix**: What the user can do to resolve

5. **Set correct exit code**:
   - 1 = User can fix (bad input, missing data)
   - 2 = System issue (timeout, infrastructure)

## Backlog Metadata: last_error

Commands that fail should record the error in the backlog JSON for debugging:

```json
{
  "id": "TASK-042",
  "status": "backlog",
  "last_error": {
    "code": "E201",
    "message": "Agent timed out after 120s",
    "timestamp": "2026-01-09T10:30:45Z",
    "command": "/develop-task TASK-042",
    "phase": "Step 3: Implementation"
  }
}
```

### last_error Fields

| Field | Required | Description |
|-------|----------|-------------|
| code | Yes | Error code (E001, E201, etc.) |
| message | Yes | Human-readable error message |
| timestamp | Yes | ISO 8601 timestamp |
| command | Yes | Command that failed |
| phase | No | Phase/step where failure occurred |

The `last_error` field is cleared on successful completion of the command.
