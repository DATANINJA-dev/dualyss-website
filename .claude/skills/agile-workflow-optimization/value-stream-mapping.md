# Value Stream Mapping

## Overview
Value stream mapping visualizes the entire development cycle from idea to deployed feature, identifying bottlenecks, waste, and optimization opportunities.

## Simon_Tools Value Stream

```
Idea → Epic Discovery (research) → Epic Creation → Task Generation →
Task Refinement (/set-up: 7 agents) → Development (/develop-task: TDD cycles) →
Review → Deploy
```

## Metrics to Track

### Cycle Time
Time from start to done for each stage:
- Epic discovery: ~30-60 min (market research, personas, scope)
- Epic creation: ~5 min (file generation)
- Task generation: ~10-20 min (discovery agents)
- Task refinement (/set-up): ~15-30 min (7 agents + QA)
- Development: Variable (depends on complexity)

**Total Lead Time**: Idea → deployed feature

### Throughput
- Tasks completed per week/sprint
- Epics closed per month
- Features shipped per quarter

### Work in Progress (WIP)
- Epics in discovery: ?
- Tasks in set-up: ?
- Tasks in development: ?

**Bottleneck Detection**: Where does work pile up?

## Bottleneck Analysis

### Common Bottlenecks in Development Workflows

| Stage | Symptom | Root Cause | Solution |
|-------|---------|------------|----------|
| Discovery | Epics stuck in research | Analysis paralysis, scope creep | Time-box discovery, define "good enough" |
| Task creation | Too many backlog tasks | Over-planning, no prioritization | WIP limit on backlog, regular cleanup |
| Refinement (/set-up) | Tasks waiting for review | Sequential agent execution | Parallel execution (already implemented) |
| Development | Long cycle times | Large tasks, unclear acceptance criteria | Break into smaller tasks, TDD |
| Review | PRs waiting for feedback | Async reviews, no dedicated time | Scheduled review blocks, auto-merge rules |

### For Simon_Tools

**Potential Bottlenecks**:
1. **Epic discovery**: 30-60 min is significant - can we reduce?
   - Already parallelized agents
   - Could add quick mode for simple ideas
2. **Task refinement**: 7 agents may be overkill for small tasks
   - Already has `--quick` mode
   - Could add complexity detection (auto-select mode)
3. **Manual prioritization**: No automatic `/next-task` suggestions based on dependencies
   - Implemented but may need heuristics improvement

## Waste Identification

### Types of Waste (Lean Manufacturing)

1. **Waiting**: Time when work is blocked
   - Example: Waiting for QA score after `/set-up`
   - Solution: Background processing, progress indicators

2. **Overproduction**: Creating more than needed
   - Example: Generating comprehensive PRD for small features
   - Solution: Scale detection (already implemented)

3. **Rework**: Redoing work due to errors
   - Example: Reflection loop in discovery (max 2 iterations)
   - Solution: QA gates (already implemented)

4. **Motion**: Unnecessary movement between tools
   - Example: Context switching between CLI and docs
   - Solution: Inline help, examples in --help text

5. **Over-processing**: More work than customer needs
   - Example: Running all 7 set-up agents for trivial changes
   - Solution: Quick mode, complexity detection

## Optimization Opportunities

### Based on Value Stream Analysis

**P0 (High Impact, Low Effort)**:
- Add progress indicators during long-running agents (reduce waiting waste)
- Implement complexity detection (auto-select quick vs full mode)
- Improve inline help (reduce context switching)

**P1 (High Impact, Medium Effort)**:
- Create tutorial mode for first-time users (reduce learning curve)
- Add WIP limits to backlog (prevent over-planning)
- Implement automated task cleanup (stale tasks)

**P2 (Medium Impact, High Effort)**:
- Dashboard for workflow visualization (see bottlenecks)
- Predictive `/next-task` based on velocity and dependencies
- A/B test command naming (data-driven decisions)

## Continuous Improvement

### Kaizen Principle
Allocate 15% of sprint time to productivity improvements:
- Treat process improvements as actionable deliverables
- At least 1 improvement per sprint
- Run regular experiments with feedback loops

**Example for Simon_Tools**:
- Sprint 1: Add progress indicators
- Sprint 2: Implement complexity detection
- Sprint 3: Improve inline help
- Sprint 4: A/B test command naming

### Sources

- [Exploring Agile Workflows (Atlassian)](https://www.atlassian.com/agile/project-management/workflow)
- [Agile Process Improvement (Axify)](https://axify.io/blog/agile-process-improvement)
- [Value Stream Mapping for Software](https://www.planview.com/resources/guide/lean-principles-101/what-is-value-stream-mapping/)
