---
description: Validate navigation flows and detect orphaned pages
allowed-tools: Task, Read, Glob, mcp__serena
argument-hint: "[path] [--fix] [--json] [--verbose]"
---

# validate-journeys

Analyze codebase navigation structure to detect orphaned pages, validate user journeys, and generate coverage reports with Mermaid diagrams.

## When to Use

- After scaffolding a project to validate navigation structure
- When refactoring routes to ensure no pages become orphaned
- To verify declared user journeys have complete navigation paths
- During code review to check route coverage
- Before deploying to catch navigation dead-ends

## Parameters

$ARGUMENTS = Path to analyze (optional, defaults to current directory)

**Flags**:
- `--fix`: Show auto-remediation suggestions
- `--json`: Output raw JSON instead of markdown report
- `--verbose`: Include detailed analysis with timing
- `--visual`: Capture screenshots at each journey step (requires Playwright MCP)

## Instructions

### Phase 0: Input Validation

1. **Parse arguments**:
   - Extract path from `$ARGUMENTS` (default: `.` current directory)
   - Check for `--fix` flag
   - Check for `--json` flag
   - Check for `--verbose` flag

2. **Validate path exists**:
   ```
   If path does not exist:
     [ERROR] E101: Path not found: [path]
     Exit 2
   ```

3. **Store flags for later phases**:
   ```
   fix_mode = "--fix" in arguments
   json_output = "--json" in arguments
   verbose_mode = "--verbose" in arguments
   visual_mode = "--visual" in arguments
   target_path = extracted path or "."
   ```

### Phase 1: Agent Invocation

4. **Launch journey-validator agent**:

   Use the Task tool to invoke the `journey-validator` agent:

   ```
   Task(
     subagent_type: "Journey Validator Agent",
     prompt: "Analyze navigation structure at path: [target_path]

              Perform all 6 phases:
              1. Framework Detection
              2. Route Extraction
              3. Link Extraction & Graph Building
              4. Orphan Detection (DFS)
              5. Journey Validation (if route-registry.yaml exists)
              6. Output Generation

              Return JSON summary and Mermaid diagram.",
     model: "haiku"
   )
   ```

5. **Handle agent errors**:
   ```
   If agent timeout (> 120s):
     [ERROR] E200: Agent timeout. Project may be too large.
     Suggest: Use --verbose for progress or narrow path scope
     Exit 2

   If agent fails:
     [ERROR] E201: Agent failed: [error message]
     Exit 2
   ```

6. **Parse agent output**:
   - Extract JSON summary
   - Extract Mermaid diagram
   - Store for formatting phases

### Phase 2: Framework Detection (from agent)

7. **Extract framework detection**:

   The agent returns framework detection results:
   ```json
   {
     "analysis_metadata": {
       "framework": "react-router",
       "framework_confidence": 95,
       "evidence": ["package.json: react-router-dom", "src/routes.tsx exists"]
     }
   }
   ```

8. **Handle detection failures**:
   ```
   If framework not detected (confidence < 50%):
     [WARNING] E401: No routing framework detected.
     Checking for route-registry.yaml...

     If route-registry.yaml exists:
       Proceed with manual route definitions
     Else:
       [ERROR] E402: Cannot analyze - no framework or registry found.
       Exit 2
   ```

9. **Display framework info** (if verbose):
   ```
   ## Framework Detection

   **Detected**: [framework name]
   **Confidence**: [X]%
   **Evidence**:
   - [evidence 1]
   - [evidence 2]
   ```

### Phase 3: Route Analysis (from agent)

10. **Extract route data**:

    The agent extracts routes and builds a navigation graph:
    ```json
    {
      "routes": {
        "total": 15,
        "list": [
          { "path": "/", "file": "src/pages/index.tsx", "type": "static" },
          { "path": "/dashboard", "file": "src/pages/dashboard.tsx", "type": "static" },
          { "path": "/products/:id", "file": "src/pages/products/[id].tsx", "type": "dynamic" }
        ]
      },
      "navigation_graph": {
        "nodes": 15,
        "edges": 28,
        "avg_out_degree": 1.87
      }
    }
    ```

11. **Extract orphan data**:

    Agent performs DFS to find unreachable routes:
    ```json
    {
      "orphans": {
        "count": 2,
        "list": [
          { "path": "/legacy-page", "file": "src/pages/legacy.tsx", "reason": "no_inbound_links" },
          { "path": "/admin/hidden", "file": "src/pages/admin/hidden.tsx", "reason": "no_inbound_links" }
        ],
        "severity": "WARNING"
      },
      "dead_ends": {
        "count": 1,
        "list": [
          { "path": "/logout", "file": "src/pages/logout.tsx", "allowed": true }
        ],
        "allowed_terminals": ["/logout", "/error", "/404", "/500"]
      }
    }
    ```

12. **Handle empty results**:
    ```
    If routes.total == 0:
      [ERROR] E402: No routes found in [target_path].
      Check that path contains routing code.
      Exit 2
    ```

### Phase 4: Journey Validation (from agent)

13. **Check for route registry**:

    The agent checks for `route-registry.yaml` in the target path:
    ```
    If route-registry.yaml exists:
      Load declared journeys
      Validate each journey against navigation graph
    Else:
      Skip journey validation
      Note: "No route-registry.yaml found - journey validation skipped"
    ```

14. **Extract journey validation results**:
    ```json
    {
      "journeys": {
        "declared": 3,
        "validated": 2,
        "coverage": 0.92,
        "details": [
          {
            "name": "auth_flow",
            "steps": ["/login", "/dashboard", "/settings"],
            "status": "COMPLETE",
            "coverage": 1.0
          },
          {
            "name": "onboarding",
            "steps": ["/signup", "/welcome", "/profile-setup", "/dashboard"],
            "status": "PARTIAL",
            "coverage": 0.75,
            "missing_links": ["/welcome -> /profile-setup"]
          }
        ],
        "gaps": [
          { "journey": "onboarding", "missing_link": "/welcome -> /profile-setup" }
        ]
      }
    }
    ```

15. **Handle invalid registry**:
    ```
    If route-registry.yaml malformed:
      [WARNING] E403: Invalid route-registry.yaml - [parse error]
      Continuing without journey validation...
    ```

### Phase 4.5: Visual Journey Capture (if --visual)

16. **Check Playwright MCP availability** (if visual_mode):

    ```
    If visual_mode:
      Try to invoke mcp__plugin_playwright_playwright__browser_navigate

      If available:
        playwright_available = true
      Else:
        playwright_available = false
        Log: "[INFO] Playwright MCP not available. Skipping visual capture."
    ```

17. **Capture journey screenshots** (if playwright_available AND journeys exist):

    For each validated journey:
    ```
    journey_screenshots = []

    For each step in journey.steps:
      1. Navigate to step URL:
         mcp__plugin_playwright_playwright__browser_navigate(url: [step URL])

      2. Wait for page load:
         mcp__plugin_playwright_playwright__browser_wait_for(time: 2)

      3. Capture screenshot:
         mcp__plugin_playwright_playwright__browser_take_screenshot(
           filename: "journey-[journey_name]-step-[N].png",
           fullPage: false
         )

      4. Record screenshot path:
         journey_screenshots.push({
           step: N,
           url: step URL,
           screenshot: "[filename]"
         })

    5. Close browser after all journeys:
       mcp__plugin_playwright_playwright__browser_close()
    ```

    **Screenshot directory**: `backlog/journey-reports/[journey-name]/`
    Create directory if it doesn't exist.

    **Graceful degradation**: If any screenshot capture fails, log warning and continue. Never fail the entire validation due to screenshot issues.

### Phase 5: Calculate Health Score

18. **Calculate health score** (0-10):
    ```
    base_score = 10.0

    # Deductions
    orphan_penalty = min(orphans.count * 0.5, 3.0)
    dead_end_penalty = min(dead_ends.count * 0.2, 1.0)
    journey_gap_penalty = (1 - journeys.coverage) * 2.0 if journeys else 0

    health_score = base_score - orphan_penalty - dead_end_penalty - journey_gap_penalty
    health_score = max(0, health_score)
    ```

17. **Determine exit code**:
    ```
    If any errors occurred:
      exit_code = 2
    Else if orphans.count > 0:
      exit_code = 1
    Else:
      exit_code = 0
    ```

### Phase 6: Output Generation

18. **If --json flag**:

    Output raw JSON and exit:
    ```json
    {
      "analysis_metadata": { ... },
      "routes": { ... },
      "navigation_graph": { ... },
      "orphans": { ... },
      "dead_ends": { ... },
      "journeys": { ... },
      "health_score": 8.5,
      "exit_code": 1
    }
    ```

19. **Generate markdown report** (default):

    ```markdown
    ## Navigation Validation Report

    **Framework**: [framework] (confidence: [X]%)
    **Routes Found**: [N]
    **Orphans Detected**: [N]
    **Health Score**: [X.X]/10

    ### Summary
    ✓ [N] routes analyzed
    ⚠️ [N] orphans detected
    ✓ [N]/[N] journeys validated ([X]% coverage)

    ### Orphaned Pages
    | Path | File | Suggestion |
    |------|------|------------|
    | /legacy-page | src/pages/legacy.tsx | Add to nav or remove |
    | /admin/hidden | src/pages/admin/hidden.tsx | Add to nav or remove |

    ### Dead-End Pages
    | Path | File | Status |
    |------|------|--------|
    | /logout | src/pages/logout.tsx | ✓ Allowed terminal |

    ### Journey Coverage
    | Journey | Status | Coverage |
    |---------|--------|----------|
    | auth_flow | ✓ Complete | 100% |
    | onboarding | ⚠️ Partial | 75% |

    ### Navigation Graph

    ```mermaid
    graph TD
        subgraph Public
            root["/"]:::root --> login["/login"]
            root --> signup["/signup"]
            login --> dashboard["/dashboard"]
        end

        subgraph Dashboard
            dashboard --> settings["/settings"]
            dashboard --> profile["/profile"]
        end

        subgraph Orphans
            legacy["/legacy-page"]:::orphan
            hidden["/admin/hidden"]:::orphan
        end

        classDef root fill:#9f9,stroke:#060,stroke-width:3px
        classDef orphan fill:#f96,stroke:#c00,stroke-width:3px,stroke-dasharray:5 5
        classDef deadend fill:#ff9,stroke:#cc6,stroke-width:2px
    ```

    ### Next Steps
    - Add navigation links to orphaned pages or remove unused routes
    - Complete missing journey steps: /welcome -> /profile-setup

    **Exit Code**: [0|1|2] ([clean|orphans found|error])
    ```

### Phase 7: Fix Suggestions (if --fix flag)

20. **Generate fix suggestions for orphans**:

    If `--fix` flag is set, add remediation suggestions:

    ```markdown
    ### 🔧 Suggested Fixes

    #### Orphaned Pages

    **Option A: Add navigation links**

    For `/legacy-page`:
    ```jsx
    // Add to your navigation component or relevant page
    <Link to="/legacy-page">Legacy Page</Link>
    ```

    For `/admin/hidden`:
    ```jsx
    // Add to admin dashboard navigation
    <Link to="/admin/hidden">Hidden Admin</Link>
    ```

    **Option B: Remove unused routes**

    If these pages are no longer needed:
    ```bash
    rm src/pages/legacy.tsx
    rm src/pages/admin/hidden.tsx
    ```

    #### Journey Gaps

    **Missing link: /welcome -> /profile-setup**

    Add navigation in `src/pages/welcome.tsx`:
    ```jsx
    <Link to="/profile-setup">Continue to Profile Setup</Link>
    // or programmatic navigation:
    navigate('/profile-setup')
    ```
    ```

21. **Suggest route-registry.yaml creation** (if missing):

    ```markdown
    #### Create Route Registry

    No `route-registry.yaml` found. Create one to enable journey validation:

    ```yaml
    # route-registry.yaml
    journeys:
      auth_flow:
        description: "User authentication flow"
        steps:
          - /login
          - /dashboard
          - /settings

      onboarding:
        description: "New user onboarding"
        steps:
          - /signup
          - /welcome
          - /profile-setup
          - /dashboard

    allowed_terminals:
      - /logout
      - /error
      - /404
    ```
    ```

## Error Codes

| Code | Description | Exit |
|------|-------------|------|
| E101 | Path not found | 2 |
| E200 | Agent timeout | 2 |
| E201 | Agent failed | 2 |
| E401 | No routing framework detected | 2 |
| E402 | No routes found | 2 |
| E403 | Invalid route-registry.yaml | 0 (continue) |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Clean - no orphans, all journeys valid |
| 1 | Orphans found - navigation issues detected |
| 2 | Error - could not complete analysis |

## Reference Skills

- `user-journey-validation`: Route patterns, graph algorithms, visualization templates
- `seo-validation/visual-testing`: Screenshot capture and baseline comparison patterns
- `writing-commands`: Command syntax and frontmatter patterns
- `error-handling`: Standardized error codes and messages

## Examples

### Basic validation
```
/validate-journeys
```

### With visual screenshots
```
/validate-journeys --visual
```

### JSON output with screenshots
```
/validate-journeys --visual --json
```

### Full analysis with fixes
```
/validate-journeys --visual --fix --verbose
```

**Note**: `--visual` requires Playwright MCP. If unavailable, the command continues without visual capture.

