# Continuous Improvement (Kaizen)

## Principle
Allocate 15% of sprint time to productivity improvements. Treat process optimization as first-class work.

## Implementation

### Budget
- 2-week sprint = 10 working days = 80 hours
- 15% = 12 hours for improvements
- 1-2 improvements per sprint

### Selection Criteria
Prioritize improvements by:
1. **Impact**: How much time/frustration does it save?
2. **Effort**: How long to implement?
3. **Learning**: Does it teach us something valuable?

**Framework**: Impact / Effort = Priority Score

## Experimentation Pattern

### 1. Hypothesis
"We believe that [change] will result in [outcome] for [users]"

**Example**:
"We believe that adding progress indicators will reduce perceived wait time and improve user satisfaction during long-running agents"

### 2. Metrics
Define success criteria:
- Quantitative: User satisfaction score +0.5
- Qualitative: Fewer complaints about "is it stuck?"

### 3. Experiment
- Implement change in branch
- A/B test or pilot with subset of users
- Duration: 1-2 weeks

### 4. Evaluate
- Did metrics improve?
- Were there unexpected side effects?
- Is the change worth keeping?

### 5. Decide
- **Keep**: Merge to main, update docs
- **Iterate**: Refine based on feedback, re-test
- **Discard**: Revert, document learnings

## Example Improvements for Simon_Tools

### Sprint 1: Progress Indicators
- **Hypothesis**: Users don't know if agents are running or stuck
- **Change**: Add "Agent X running... (30s elapsed)" messages
- **Metric**: User satisfaction +0.5, support tickets about "stuck" -50%
- **Effort**: 4 hours
- **Outcome**: Keep

### Sprint 2: Complexity Detection
- **Hypothesis**: Running full 7-agent analysis for trivial tasks wastes time
- **Change**: Auto-detect task complexity, suggest quick vs full mode
- **Metric**: Average set-up time for small tasks -40%
- **Effort**: 8 hours
- **Outcome**: Keep

### Sprint 3: Command Naming A/B Test
- **Hypothesis**: "refine" is clearer than "set-up" for agile practitioners
- **Change**: Offer both `/set-up` and `/refine` as aliases, track usage
- **Metric**: % choosing /refine over /set-up
- **Effort**: 2 hours (alias) + 2 hours (tracking)
- **Outcome**: Data-driven decision

## Retrospective Questions

After each sprint, ask:
1. What slowed us down this sprint?
2. What tool/process frustrated us?
3. If we could change one thing, what would it be?
4. What did we learn that could help others?

Document answers, prioritize top 3 for next sprint.

## Sources

- [Agile Process Improvement (Axify)](https://axify.io/blog/agile-process-improvement)
- [Kaizen Continuous Improvement](https://www.atlassian.com/agile/project-management/continuous-improvement)
