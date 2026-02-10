# Visual Testing Patterns

This document covers visual testing patterns using Playwright MCP for SEO validation and journey verification.

## Overview

Visual testing captures screenshots and accessibility snapshots to validate page rendering, detect visual regressions, and verify user journey completion.

## Playwright MCP Integration

### Availability Check

Always check for Playwright MCP before using visual features:

```markdown
## Check Playwright MCP Availability

1. Attempt to use any Playwright tool (e.g., `mcp__plugin_playwright_playwright__browser_navigate`)
2. If tool exists: Playwright is available
3. If tool error or not found: Gracefully degrade to CLI-only mode

Graceful degradation message:
"[INFO] Playwright MCP not available. Skipping visual capture."
```

### Core Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `browser_navigate` | Load URL | First step before any visual capture |
| `browser_snapshot` | Accessibility tree | Preferred for DOM analysis |
| `browser_take_screenshot` | Visual PNG | For visual regression/reports |
| `browser_wait_for` | Wait for content | Before screenshots on dynamic pages |

---

## Screenshot Capture Patterns

### Basic Page Screenshot

```markdown
1. Navigate to URL:
   mcp__plugin_playwright_playwright__browser_navigate(url: "[target URL]")

2. Wait for page load:
   mcp__plugin_playwright_playwright__browser_wait_for(time: 2)

3. Capture screenshot:
   mcp__plugin_playwright_playwright__browser_take_screenshot(
     filename: "page-[timestamp].png",
     fullPage: true
   )
```

### Element Screenshot

```markdown
1. Get page snapshot to find element ref:
   mcp__plugin_playwright_playwright__browser_snapshot()

2. Capture specific element:
   mcp__plugin_playwright_playwright__browser_take_screenshot(
     ref: "[element ref from snapshot]",
     element: "[element description]",
     filename: "element-[name].png"
   )
```

### Screenshot Output Directory

Screenshots should be saved to:
- **SEO reports**: `backlog/seo-reports/screenshots/`
- **Journey reports**: `backlog/journey-reports/[journey-name]/`

Create directories if they don't exist before saving.

---

## Baseline Comparison Workflow

Visual regression detection by comparing current screenshots against baselines.

### Setting Baseline

```markdown
## First Run (Establish Baseline)

1. Capture current screenshot
2. Save to baseline directory:
   backlog/visual-baselines/[page-slug].png
3. Record baseline metadata:
   backlog/visual-baselines/[page-slug].json
   {
     "url": "[url]",
     "captured_at": "[timestamp]",
     "viewport": { "width": 1280, "height": 720 }
   }
```

### Comparison Check

```markdown
## Subsequent Runs (Compare to Baseline)

1. Capture current screenshot (temp file)
2. Load baseline if exists
3. If baseline exists:
   - Compare images (visual diff)
   - Report differences
4. If no baseline:
   - Prompt to establish baseline
   - Save as new baseline

Comparison result:
- MATCH: No visual differences
- CHANGED: Visual differences detected (show diff)
- NEW: No baseline exists (save as baseline?)
```

### Manual Baseline Update

```markdown
## Update Baseline

When intentional changes occur:

1. Run visual validation
2. Review flagged changes
3. Confirm changes are intentional
4. Update baseline:
   - Copy current screenshot to baseline directory
   - Update metadata with new timestamp
```

---

## Journey Screenshot Capture

Capture screenshots at each step of a user journey.

### Journey Validation with Screenshots

```markdown
## Journey: [journey_name]

For each step in journey:

1. Navigate to step URL:
   mcp__plugin_playwright_playwright__browser_navigate(url: "[step URL]")

2. Wait for page ready:
   mcp__plugin_playwright_playwright__browser_wait_for(time: 2)

3. Capture step screenshot:
   mcp__plugin_playwright_playwright__browser_take_screenshot(
     filename: "journey-[name]-step-[N].png"
   )

4. Verify expected elements (via snapshot):
   mcp__plugin_playwright_playwright__browser_snapshot()
   - Check for expected navigation elements
   - Verify page content loaded

5. Record step result:
   {
     "step": N,
     "url": "[step URL]",
     "screenshot": "journey-[name]-step-[N].png",
     "status": "PASS|FAIL",
     "timestamp": "[timestamp]"
   }
```

### Journey Report Generation

```markdown
## Visual Journey Report

**Journey**: [journey_name]
**Steps**: [N]
**Status**: [COMPLETE|PARTIAL|FAILED]

### Step Screenshots

| Step | URL | Screenshot | Status |
|------|-----|------------|--------|
| 1 | /login | [thumbnail] | PASS |
| 2 | /dashboard | [thumbnail] | PASS |
| 3 | /settings | [thumbnail] | FAIL |

### Failed Steps

Step 3: /settings
- Expected: Settings page with user preferences
- Actual: 404 error page
- Screenshot: [link to screenshot]

### Journey Map

[Mermaid diagram showing journey flow with screenshot thumbnails]
```

---

## SEO Visual Validation

### Lighthouse with Screenshots

```markdown
## Combined Lighthouse + Visual Audit

1. Navigate to target URL
2. Capture "before" screenshot
3. Run Lighthouse audit (via CLI)
4. Capture "after" screenshot (if needed)
5. Capture specific elements:
   - Hero section
   - Navigation
   - CTA buttons
   - Footer

Output:
- Lighthouse JSON report
- Full page screenshot
- Element screenshots (optional)
```

### Core Web Vitals Visual Context

```markdown
## Visual Context for CWV Issues

When LCP issues detected:
1. Capture screenshot highlighting largest contentful paint element
2. Use accessibility snapshot to identify LCP candidate

When CLS issues detected:
1. Capture screenshot sequence showing layout shifts
2. Annotate areas of visual instability

When INP issues suspected:
1. Capture interactive element screenshots
2. Document interaction patterns
```

---

## Example Workflow: Visual SEO Validation

Complete workflow combining Lighthouse and Playwright:

```markdown
## Visual SEO Validation Workflow

### Input
- URL: https://example.com
- Mode: full (Lighthouse + visual)

### Phase 1: Setup
1. Check Playwright MCP availability
2. Navigate to URL
3. Wait for full page load

### Phase 2: Visual Capture
4. Capture full page screenshot
5. Capture accessibility snapshot
6. Identify key elements (nav, hero, CTA)

### Phase 3: Lighthouse Audit
7. Run Lighthouse CLI
8. Parse results

### Phase 4: Baseline Comparison
9. Load visual baseline (if exists)
10. Compare current vs baseline
11. Flag visual regressions

### Phase 5: Report
12. Generate combined report:
    - Lighthouse scores
    - Visual screenshots
    - Regression status
    - Recommendations

### Output
- Report: backlog/seo-reports/[url-slug]-[date].md
- Screenshots: backlog/seo-reports/screenshots/[url-slug]/
- JSON: backlog/seo-reports/[url-slug]-[date].json
```

---

## Quick Reference

### Graceful Degradation Checklist

```
[ ] Check Playwright MCP availability first
[ ] Provide info message when unavailable
[ ] Continue with CLI-only functionality
[ ] Never fail due to missing Playwright
[ ] Document which features require Playwright
```

### Screenshot Naming Convention

```
[context]-[identifier]-[timestamp].png

Examples:
- seo-homepage-20260119T143000.png
- journey-auth-flow-step-1.png
- baseline-dashboard.png
- element-hero-section.png
```

### Directory Structure

```
backlog/
├── seo-reports/
│   ├── screenshots/
│   │   └── [url-slug]/
│   │       ├── full-page.png
│   │       └── elements/
│   └── [url-slug]-[date].md
├── journey-reports/
│   └── [journey-name]/
│       ├── step-1.png
│       ├── step-2.png
│       └── report.md
└── visual-baselines/
    ├── [page-slug].png
    └── [page-slug].json
```
