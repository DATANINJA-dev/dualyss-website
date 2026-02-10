---
name: dx-evaluation-framework
description: Evaluates developer experience (DX) using the DX Core 4 methodology with quantitative and qualitative metrics. Includes guided 8-step assessment workflow.
---

# dx-evaluation-framework

## Type
active

## Auto-Activation Triggers
- User mentions: "developer experience", "DX", "workflow optimization", "developer productivity", "tool friction"
- User requests: "DX assessment", "evaluate DX", "measure developer experience"
- When evaluating framework usability
- During workflow analysis
- When measuring development velocity

## Description
Provides structured framework for evaluating and measuring developer experience (DX) using the DX Core 4 methodology. Enables data-driven decisions about workflow optimization, tool design, and productivity improvements through quantitative and qualitative metrics.

**Active capability**: Run a guided 8-step DX assessment workflow that produces a quantitative DX Index (DXI) score (0-10) with prioritized improvement recommendations and ROI projections.

## Workflows

### dx-assessment
**Path**: `workflows/dx-assessment.md`

Execute a comprehensive DX evaluation with guided steps:
- **Phase 0**: Define scope and success criteria
- **Phases 1-4**: Baseline measurement, user testing, benchmarking, data consolidation
- **Phase 5**: Calculate DX Index (DXI) using weighted formula
- **Phases 6-8**: Identify improvements, A/B testing (optional), post-implementation validation

**Parameters**:
- `WORKFLOW_OR_TOOL` (required): What to evaluate
- `EVALUATION_TYPE`: `quick` (1-2 hours) or `full` (1-2 weeks)
- `RESUME_STEP`: Resume from specific step (1-8)

**Output**: DX Assessment Report with DXI score, competitive position, prioritized recommendations, and ROI projections.

Use when:
- Evaluating framework or tool design
- Measuring workflow efficiency
- Identifying developer pain points
- Justifying productivity investments

## When to Use This Skill
- **Workflow evaluation**: Is our epic → task → set-up → develop flow efficient?
- **Tool design decisions**: Should we add this feature or flag?
- **Pain point identification**: Where do developers get stuck?
- **Before/after measurement**: Did our changes improve DX?
- **Priority setting**: Which improvements have highest DX impact?

## Core Principles

1. **Feedback over assumption** - Measure DX with data, not intuition. Collect behavioral metrics before proposing changes.
2. **Three dimensions always** - Evaluate Feedback Loops, Cognitive Load, and Flow State together. Optimizing one at the expense of others creates imbalance.
3. **Quantify impact** - Translate DX scores to productivity metrics (e.g., 1 DXI point = 13 min/week saved). Make the business case.
4. **Iterate continuously** - DX is an ongoing improvement process. Baseline → measure → improve → re-baseline.

## Supporting Files
- core-dimensions.md - DX Core 4 framework (speed, effectiveness, quality, impact)
- measurement-guide.md - Quantitative and qualitative metrics
- evaluation-process.md - Step-by-step DX assessment protocol

## Constraints

- Evaluations require data from actual developer workflows (not hypothetical scenarios)
- DXI comparisons only valid within same tool/context (cross-tool comparisons need normalization)
- Survey data supplements, not replaces, behavioral metrics (both quantitative and qualitative needed)
- Minimum 3+ data points before drawing conclusions (avoid N=1 generalizations)
