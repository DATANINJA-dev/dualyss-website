---
name: dx-assessment
description: |
  Execute a structured 8-step Developer Experience (DX) evaluation following the DX Core 4 methodology.
  Produces a quantitative DX Index (DXI) score and actionable improvement recommendations with ROI projections.
allowed-tools: Read, AskUserQuestion, Task, WebSearch, Grep, Glob
input-parameters:
  - WORKFLOW_OR_TOOL: string (required - what to evaluate, e.g., "epic creation workflow" or "CLI tool")
  - EVALUATION_TYPE: quick|full (optional - default: full)
  - RESUME_STEP: number (optional - resume from specific step 1-8)
---

# DX Assessment Workflow

Execute a comprehensive Developer Experience evaluation using the DX Core 4 methodology. This workflow guides you through 8 steps to produce a quantitative DXI score (0-10) and prioritized improvement recommendations.

## Overview

| Aspect | Description |
|--------|-------------|
| **Methodology** | DX Core 4 (Feedback Loops, Cognitive Load, Flow State) |
| **Output** | DXI Score (0-10), Prioritized Improvements, ROI Projections |
| **Duration** | Quick: 1-2 hours, Full: 1-2 weeks |
| **References** | See `core-dimensions.md`, `measurement-guide.md` |

## Input Parameters

- **WORKFLOW_OR_TOOL** (required): The workflow or tool to evaluate
- **EVALUATION_TYPE** (optional): `quick` for rapid assessment, `full` for comprehensive analysis
- **RESUME_STEP** (optional): Resume interrupted assessment from specific step

## Workflow Phases

### Phase 0: Setup & Scope Definition

**Duration**: 15-30 minutes
**Goal**: Define what to evaluate and establish success criteria

#### Step 0.1: Identify Evaluation Target

1. **Parse WORKFLOW_OR_TOOL parameter**:
   ```
   ## DX Assessment: [WORKFLOW_OR_TOOL]

   **Type**: [workflow | tool | framework | process]
   **Scope**: [description of boundaries]
   ```

2. **Use AskUserQuestion to clarify scope**:
   ```
   What are you evaluating?

   [W] Workflow (e.g., "epic creation flow", "PR review process")
   [T] Tool/CLI (e.g., "CLI commands", "IDE plugin")
   [F] Framework (e.g., "testing framework", "build system")
   [P] Process (e.g., "onboarding", "deployment")
   ```

#### Step 0.2: Define Success Criteria

3. **Prompt for success criteria**:
   ```
   Define "good DX" for this evaluation:

   Example criteria:
   - Time to completion: [target, e.g., "< 15 minutes"]
   - Error rate: [target, e.g., "< 1 error per session"]
   - Help lookups: [target, e.g., "< 2 lookups"]
   - Learning curve: [target, e.g., "productive in < 1 day"]

   Enter your criteria or use defaults? [Enter/defaults]
   ```

4. **Record success criteria**:
   ```
   ### Success Criteria
   | Metric | Target | Priority |
   |--------|--------|----------|
   | Time to completion | [target] | High |
   | Error rate | [target] | High |
   | Help lookups | [target] | Medium |
   | Learning curve | [target] | Medium |
   ```

#### Step 0.3: Select Metrics

5. **Choose quantitative metrics** (reference `measurement-guide.md`):
   ```
   Select metrics to track:

   **Feedback Loops** (40% weight):
   - [ ] Command-to-output latency
   - [ ] Error discovery time
   - [ ] Test cycle time

   **Cognitive Load** (30% weight):
   - [ ] Concepts to learn
   - [ ] Help lookups per task
   - [ ] Context switches

   **Flow State** (30% weight):
   - [ ] Interruption frequency
   - [ ] Resume time
   - [ ] Batch operation support

   [A] All metrics (recommended for full assessment)
   [S] Select specific metrics
   ```

#### Step 0.4: Checkpoint - Scope Confirmation

6. **Present scope summary for confirmation**:
   ```
   ## Phase 0 Complete: Scope Defined

   **Target**: [WORKFLOW_OR_TOOL]
   **Type**: [workflow/tool/framework/process]
   **Success Criteria**: [N] defined
   **Metrics**: [N] selected

   Proceed to Baseline Measurement? [Y/n/review]
   ```

---

### Phase 1: Baseline Measurement

**Duration**: 2-4 hours
**Goal**: Measure current state across selected metrics

#### Step 1.1: Time the Current Workflow

7. **Execute workflow/tool multiple times**:
   ```
   Timing the workflow...

   Instructions:
   1. Run the workflow [N] times (recommended: 3-5)
   2. Record time for each run
   3. Note any variations

   | Run | Duration | Notes |
   |-----|----------|-------|
   | 1 | [time] | [observations] |
   | 2 | [time] | [observations] |
   | 3 | [time] | [observations] |

   **Average**: [calculated]
   ```

#### Step 1.2: Count Cognitive Load Points

8. **Identify cognitive load factors**:
   ```
   ## Cognitive Load Analysis

   **Concepts to Learn**:
   Count new terms, patterns, or concepts users must understand:

   | Concept | Complexity | Required? |
   |---------|------------|-----------|
   | [concept 1] | Low/Med/High | Yes/No |
   | [concept 2] | Low/Med/High | Yes/No |

   **Total concepts**: [N]

   **Flags/Options**:
   Count flags or options to remember for common tasks:
   - [flag 1]: [purpose]
   - [flag 2]: [purpose]

   **Total flags**: [N]

   **Decision Points**:
   Count choices users must make:
   - [decision 1]
   - [decision 2]

   **Total decisions**: [N]
   ```

#### Step 1.3: Identify Interruptions

9. **Map flow-breaking points**:
   ```
   ## Interruption Analysis

   **Forced Stops** (where users must wait or decide):
   | Point | Type | Duration | Required? |
   |-------|------|----------|-----------|
   | [point] | confirm/wait/decide | [time] | Yes/No |

   **Context Switches** (tool → docs → tool):
   | From | To | Reason |
   |------|----|----|
   | [tool] | [docs] | [reason] |

   **Help Lookups**: Track --help invocations or doc reads
   - Count: [N]
   - Common topics: [list]
   ```

#### Step 1.4: Checkpoint - Baseline Summary

10. **Present baseline data**:
    ```
    ## Phase 1 Complete: Baseline Measured

    ### Timing
    - Average duration: [time]
    - Variance: [low/medium/high]

    ### Cognitive Load
    - Concepts: [N]
    - Flags: [N]
    - Decisions: [N]

    ### Interruptions
    - Forced stops: [N]
    - Context switches: [N]
    - Help lookups: [N] average

    Proceed to User Testing? [Y/n/skip to Step 4]
    ```

---

### Phase 2: User Testing

**Duration**: 1 week (recommended) or 2-4 hours (quick)
**Goal**: Validate baseline with real users

> **Quick Mode**: Skip this phase or use abbreviated testing (1-2 users)

#### Step 2.1: First-Use Testing

11. **Test with new users** (5 recommended):
    ```
    ## First-Use Testing Protocol

    **Setup**:
    1. Recruit users unfamiliar with the tool/workflow
    2. Prepare realistic task: "[task description]"
    3. Set up observation (screen recording optional)

    **Instructions**:
    - Give user the task without guidance
    - Observe without assisting (unless stuck > 5 min)
    - Record metrics below

    | User | Time | Errors | Help Lookups | Success? |
    |------|------|--------|--------------|----------|
    | U1 | [time] | [N] | [N] | Yes/No |
    | U2 | [time] | [N] | [N] | Yes/No |
    | U3 | [time] | [N] | [N] | Yes/No |
    | U4 | [time] | [N] | [N] | Yes/No |
    | U5 | [time] | [N] | [N] | Yes/No |

    **Success rate**: [N]/5 = [%]
    ```

#### Step 2.2: Think-Aloud Protocol

12. **Capture user mental models** (3 users):
    ```
    ## Think-Aloud Observations

    Ask users to verbalize thoughts while working.

    **User [N] Observations**:
    - Expectations: [what they expected to happen]
    - Confusion points: [where they were confused]
    - Guesses vs. knowledge: [what they guessed vs. knew]

    **Common Confusion Points**:
    1. [confusion 1]
    2. [confusion 2]

    **Mental Model Gaps**:
    - Expected: [user expectation]
    - Actual: [tool behavior]
    ```

#### Step 2.3: Post-Task Interviews

13. **Collect qualitative feedback**:
    ```
    ## Interview Questions

    Ask all test users:

    1. "What was most confusing?"
       - [response summary]

    2. "Would you use this tool again?"
       - [response summary]

    3. "How does it compare to [familiar tool]?"
       - [response summary]

    4. "What would make it better?"
       - [response summary]

    **Trust Score** (1-10): [N]
    **Usefulness Score** (1-10): [N]
    **Findability Score** (1-10): [N]
    ```

#### Step 2.4: Checkpoint - User Testing Summary

14. **Present user testing findings**:
    ```
    ## Phase 2 Complete: User Testing Done

    ### First-Use Results
    - Success rate: [N]%
    - Average time: [time]
    - Average errors: [N]

    ### Key Findings
    1. [finding 1]
    2. [finding 2]
    3. [finding 3]

    ### User Quotes
    > "[notable quote]" - User [N]

    Proceed to Benchmark Analysis? [Y/n/review]
    ```

---

### Phase 3: Benchmark Analysis

**Duration**: 2-3 hours
**Goal**: Compare against competitors and best-in-class tools

#### Step 3.1: Identify Competitors

15. **List comparable tools**:
    ```
    ## Competitive Analysis

    **Comparable Tools**:
    | Tool | Domain | Why Compare |
    |------|--------|-------------|
    | [tool 1] | [domain] | [reason] |
    | [tool 2] | [domain] | [reason] |
    | [tool 3] | [domain] | [reason] |

    Select tools to benchmark: [Enter tool numbers]
    ```

#### Step 3.2: Time Competitor Workflows

16. **Measure same tasks in competitor tools**:
    ```
    ## Competitor Timing

    **Task**: [same task used in baseline]

    | Tool | Time | Steps | Complexity |
    |------|------|-------|------------|
    | [Your tool] | [baseline] | [N] | [rating] |
    | [Competitor 1] | [time] | [N] | [rating] |
    | [Competitor 2] | [time] | [N] | [rating] |

    **Best-in-class**: [tool] at [time]
    **Gap from best**: [difference]
    ```

#### Step 3.3: Gap Analysis

17. **Identify what competitors do better**:
    ```
    ## Gap Analysis

    | Dimension | Your Tool | Best-in-Class | Gap | Priority |
    |-----------|-----------|---------------|-----|----------|
    | Time to complete | [N] | [N] | [diff] | [H/M/L] |
    | Concepts to learn | [N] | [N] | [diff] | [H/M/L] |
    | Help lookups | [N] | [N] | [diff] | [H/M/L] |
    | Error messages | [quality] | [quality] | [diff] | [H/M/L] |

    **Patterns to Adopt**:
    - From [tool]: [pattern] - [why it's better]
    - From [tool]: [pattern] - [why it's better]
    ```

#### Step 3.4: Checkpoint - Benchmark Summary

18. **Present benchmark findings**:
    ```
    ## Phase 3 Complete: Benchmarking Done

    ### Position vs. Competitors
    | Metric | Rank | Gap from #1 |
    |--------|------|-------------|
    | Speed | [N]/[N] | [diff] |
    | Simplicity | [N]/[N] | [diff] |
    | Error handling | [N]/[N] | [diff] |

    ### Top Patterns to Adopt
    1. [pattern 1] from [tool]
    2. [pattern 2] from [tool]

    Proceed to DXI Calculation? [Y/n/review]
    ```

---

### Phase 4: Data Consolidation

**Duration**: 30 minutes
**Goal**: Prepare data for DXI calculation

#### Step 4.1: Consolidate All Metrics

19. **Gather all collected data**:
    ```
    ## Data Consolidation

    ### Feedback Loops Data
    | Metric | Value | Source |
    |--------|-------|--------|
    | Command latency | [N]s | Baseline |
    | Error discovery | [immediate/delayed] | Testing |
    | Test cycle time | [N]s | Baseline |

    ### Cognitive Load Data
    | Metric | Value | Source |
    |--------|-------|--------|
    | Concepts | [N] | Baseline |
    | Flags | [N] | Baseline |
    | Help lookups | [N] avg | User Testing |
    | Context switches | [N] | Baseline |

    ### Flow State Data
    | Metric | Value | Source |
    |--------|-------|--------|
    | Interruptions | [N] | Baseline |
    | Resume time | [N]s | Testing |
    | Batch support | [%] | Analysis |
    ```

#### Step 4.2: Checkpoint - Data Ready

20. **Confirm data completeness**:
    ```
    ## Phase 4 Complete: Data Consolidated

    **Data Completeness**:
    - Feedback Loops: [N]/3 metrics ✓
    - Cognitive Load: [N]/4 metrics ✓
    - Flow State: [N]/3 metrics ✓

    **Data Quality**:
    - Baseline measurements: [N] runs
    - User tests: [N] users
    - Benchmarks: [N] competitors

    Ready for DXI calculation? [Y/n]
    ```

---

### Phase 5: DX Index Calculation

**Duration**: 1 hour
**Goal**: Calculate quantitative DXI score (0-10)

> **Reference**: See `core-dimensions.md` for scoring guidance and dimension weights.

#### Step 5.1: Score Feedback Loops (40% weight)

21. **Rate each feedback loop metric** (0-10):
    ```
    ## Feedback Loops Scoring

    Rate each metric based on collected data:

    **Command-to-output latency**: [Score]/10
    - < 2s: 9-10
    - 2-5s: 7-8
    - 5-10s: 5-6
    - > 10s: 1-4
    **Your value**: [N]s → **Score**: [N]

    **Error discovery**: [Score]/10
    - Immediate (< 1s): 9-10
    - Fast (1-5s): 7-8
    - Delayed (5-30s): 5-6
    - Much later (> 30s): 1-4
    **Your value**: [timing] → **Score**: [N]

    **Test cycle time**: [Score]/10
    - < 10s: 9-10
    - 10-30s: 7-8
    - 30-60s: 5-6
    - > 60s: 1-4
    **Your value**: [N]s → **Score**: [N]

    **Feedback Loops Average**: ([S1] + [S2] + [S3]) / 3 = **[FL_Score]/10**
    ```

#### Step 5.2: Score Cognitive Load (30% weight)

22. **Rate cognitive load metrics** (0-10, inverted - lower load = higher score):
    ```
    ## Cognitive Load Scoring

    **Concepts to learn**: [Score]/10
    - < 5: 9-10
    - 5-10: 7-8
    - 10-15: 5-6
    - > 15: 1-4
    **Your value**: [N] concepts → **Score**: [N]

    **Help lookups per task**: [Score]/10
    - 0: 9-10
    - 1-2: 7-8
    - 3-4: 5-6
    - > 4: 1-4
    **Your value**: [N] lookups → **Score**: [N]

    **Context switches**: [Score]/10
    - 0-1: 9-10
    - 2-3: 7-8
    - 4-5: 5-6
    - > 5: 1-4
    **Your value**: [N] switches → **Score**: [N]

    **Cognitive Load Average**: ([S1] + [S2] + [S3]) / 3 = **[CL_Score]/10**
    ```

#### Step 5.3: Score Flow State (30% weight)

23. **Rate flow state metrics** (0-10):
    ```
    ## Flow State Scoring

    **Interruption frequency**: [Score]/10
    - < 3 per workflow: 9-10
    - 3-5: 7-8
    - 5-8: 5-6
    - > 8: 1-4
    **Your value**: [N] interruptions → **Score**: [N]

    **Resume time**: [Score]/10
    - < 30s: 9-10
    - 30-60s: 7-8
    - 1-3 min: 5-6
    - > 3 min: 1-4
    **Your value**: [N]s → **Score**: [N]

    **Batch operation support**: [Score]/10
    - > 80%: 9-10
    - 60-80%: 7-8
    - 40-60%: 5-6
    - < 40%: 1-4
    **Your value**: [N]% → **Score**: [N]

    **Flow State Average**: ([S1] + [S2] + [S3]) / 3 = **[FS_Score]/10**
    ```

#### Step 5.4: Calculate DX Index

24. **Apply weighted formula**:
    ```
    ## DX Index Calculation

    **Formula**: DXI = (FL × 0.40) + (CL × 0.30) + (FS × 0.30)

    **Your Scores**:
    - Feedback Loops (FL): [FL_Score]/10 × 0.40 = [weighted]
    - Cognitive Load (CL): [CL_Score]/10 × 0.30 = [weighted]
    - Flow State (FS): [FS_Score]/10 × 0.30 = [weighted]

    **DX Index**: [FL_weighted] + [CL_weighted] + [FS_weighted] = **[DXI]/10**
    ```

#### Step 5.5: Interpret DXI Score

25. **Provide interpretation**:
    ```
    ## DXI Interpretation

    **Score**: [DXI]/10

    | Range | Rating | Interpretation |
    |-------|--------|----------------|
    | 9-10 | Excellent | Best-in-class DX, minimal improvement needed |
    | 7-8.9 | Good | Above average, targeted improvements valuable |
    | 5-6.9 | Moderate | Average DX, significant room for improvement |
    | 3-4.9 | Poor | Below average, major issues to address |
    | 1-2.9 | Critical | Severely impacted DX, urgent action needed |

    **Your Rating**: [Rating]

    **Primary Weakness**: [lowest dimension]
    **Primary Strength**: [highest dimension]
    ```

#### Step 5.6: Checkpoint - DXI Complete

26. **Present DXI summary**:
    ```
    ## Phase 5 Complete: DXI Calculated

    ### DX Index Score: [DXI]/10 - [Rating]

    | Dimension | Score | Weight | Weighted |
    |-----------|-------|--------|----------|
    | Feedback Loops | [N]/10 | 40% | [N] |
    | Cognitive Load | [N]/10 | 30% | [N] |
    | Flow State | [N]/10 | 30% | [N] |
    | **Total** | - | - | **[DXI]** |

    **Benchmark**: 1 DXI point = ~13 min/week/developer saved

    Proceed to Improvement Identification? [Y/n]
    ```

---

### Phase 6: Identify Improvements

**Duration**: 2 hours
**Goal**: Prioritize improvements by impact and effort

> **Reference**: See `measurement-guide.md` for ROI formulas.

#### Step 6.1: List Potential Improvements

27. **Brainstorm improvements from data**:
    ```
    ## Improvement Brainstorm

    Based on your data, list potential improvements:

    **Feedback Loop Improvements**:
    - [ ] [improvement 1]
    - [ ] [improvement 2]

    **Cognitive Load Improvements**:
    - [ ] [improvement 1]
    - [ ] [improvement 2]

    **Flow State Improvements**:
    - [ ] [improvement 1]
    - [ ] [improvement 2]

    **From Competitor Analysis**:
    - [ ] [pattern from competitor]
    - [ ] [pattern from competitor]

    **From User Feedback**:
    - [ ] [user suggestion]
    - [ ] [user suggestion]
    ```

#### Step 6.2: Score Impact and Effort

28. **Rate each improvement**:
    ```
    ## Improvement Scoring

    For each improvement, estimate:
    - **DXI Gain**: Projected improvement (0.1 - 1.0+ points)
    - **User Impact**: High/Medium/Low
    - **Effort**: S(mall), M(edium), L(arge), XL

    | Improvement | DXI Gain | Impact | Effort | Priority |
    |-------------|----------|--------|--------|----------|
    | [improvement 1] | +[N] | H/M/L | S/M/L/XL | [calc] |
    | [improvement 2] | +[N] | H/M/L | S/M/L/XL | [calc] |
    | [improvement 3] | +[N] | H/M/L | S/M/L/XL | [calc] |

    **Priority Formula**: (DXI Gain × Impact Multiplier) / Effort
    - Impact: High=3, Medium=2, Low=1
    - Effort: S=1, M=2, L=4, XL=8
    ```

#### Step 6.3: Calculate ROI

29. **Project value of improvements**:
    ```
    ## ROI Projection

    **Inputs**:
    - Developer count: [N]
    - Hourly rate: $[N]
    - Weeks per year: 52

    **Formula**:
    ROI = (DXI Gain × 13 min/week × Dev Count × Hourly Rate × 52) / Implementation Cost

    **Per-Improvement ROI**:
    | Improvement | DXI Gain | Time Saved/Week | Annual Value | Cost | ROI |
    |-------------|----------|-----------------|--------------|------|-----|
    | [improvement 1] | +[N] | [N] min | $[N] | $[N] | [N]x |
    | [improvement 2] | +[N] | [N] min | $[N] | $[N] | [N]x |

    **Example Calculation**:
    - DXI Gain: +0.5 points
    - Time saved: 0.5 × 13 = 6.5 min/week/dev
    - 10 developers × $100/hour × 52 weeks
    - Annual value: 6.5 min × 10 × $100/60 × 52 = $5,633
    ```

#### Step 6.4: Prioritized Roadmap

30. **Create improvement roadmap**:
    ```
    ## Improvement Roadmap

    ### High Priority (Quick Wins)
    | # | Improvement | DXI Impact | Effort | ROI |
    |---|-------------|------------|--------|-----|
    | 1 | [improvement] | +[N] | S | [N]x |
    | 2 | [improvement] | +[N] | S | [N]x |

    ### Medium Priority
    | # | Improvement | DXI Impact | Effort | ROI |
    |---|-------------|------------|--------|-----|
    | 3 | [improvement] | +[N] | M | [N]x |
    | 4 | [improvement] | +[N] | M | [N]x |

    ### Low Priority (Long-term)
    | # | Improvement | DXI Impact | Effort | ROI |
    |---|-------------|------------|--------|-----|
    | 5 | [improvement] | +[N] | L/XL | [N]x |

    **Projected Total DXI Improvement**: +[N] points
    **Projected Annual Value**: $[N]
    ```

#### Step 6.5: Checkpoint - Improvements Identified

31. **Present improvement summary**:
    ```
    ## Phase 6 Complete: Improvements Identified

    ### Summary
    - Total improvements: [N]
    - Quick wins: [N]
    - Total projected DXI gain: +[N]
    - Projected annual value: $[N]

    ### Top 3 Recommendations
    1. [improvement] - ROI: [N]x
    2. [improvement] - ROI: [N]x
    3. [improvement] - ROI: [N]x

    Proceed to A/B Testing (optional)? [Y/n/skip]
    ```

---

### Phase 7: A/B Testing (Optional)

**Duration**: 2-4 weeks
**Goal**: Validate improvements with controlled testing

> **Note**: This phase is optional. Skip for quick assessments or when changes are low-risk.

#### Step 7.1: Select Improvement to Test

32. **Choose test candidate**:
    ```
    ## A/B Test Setup

    **Selected Improvement**: [improvement]
    **Hypothesis**: [what you expect to change]

    **Control (A)**: Current implementation
    **Variant (B)**: With improvement

    **Success Metrics**:
    - Primary: [metric, e.g., time to complete]
    - Secondary: [metric, e.g., error rate]
    ```

#### Step 7.2: Run Test

33. **Execute A/B test**:
    ```
    ## A/B Test Execution

    **Duration**: [N] weeks
    **Sample Size**: [N] users per group

    | Group | Users | Avg Time | Errors | Satisfaction |
    |-------|-------|----------|--------|--------------|
    | A (Control) | [N] | [time] | [N] | [N]/10 |
    | B (Variant) | [N] | [time] | [N] | [N]/10 |

    **Statistical Significance**:
    - p-value: [N]
    - Significant? [Yes/No (p < 0.05)]
    ```

#### Step 7.3: Analyze Results

34. **Interpret A/B test**:
    ```
    ## A/B Test Results

    **Outcome**: [Variant B wins / No significant difference / Control A wins]

    **Measured Improvement**:
    - Time: [N]% [faster/slower]
    - Errors: [N]% [fewer/more]
    - Satisfaction: [N] point change

    **Actual DXI Impact**: +[N] (vs. projected +[N])

    **Decision**: [Implement / Iterate / Abandon]
    ```

#### Step 7.4: Checkpoint - A/B Complete

35. **Present A/B summary**:
    ```
    ## Phase 7 Complete: A/B Testing Done

    **Tests Run**: [N]
    **Improvements Validated**: [N]
    **Improvements Rejected**: [N]

    Proceed to Post-Implementation Validation? [Y/n]
    ```

---

### Phase 8: Post-Implementation Validation

**Duration**: Ongoing (monthly)
**Goal**: Verify improvements and track long-term DX

#### Step 8.1: Re-measure After Implementation

36. **Repeat baseline measurements**:
    ```
    ## Post-Implementation Measurement

    **Improvements Implemented**: [list]
    **Time Since Implementation**: [N] weeks

    ### New Measurements
    | Metric | Before | After | Change |
    |--------|--------|-------|--------|
    | Time to complete | [N] | [N] | [N]% |
    | Concepts | [N] | [N] | [N]% |
    | Help lookups | [N] | [N] | [N]% |
    | Interruptions | [N] | [N] | [N]% |
    ```

#### Step 8.2: Calculate New DXI

37. **Recalculate DX Index**:
    ```
    ## Updated DXI

    | Dimension | Before | After | Change |
    |-----------|--------|-------|--------|
    | Feedback Loops | [N] | [N] | +/-[N] |
    | Cognitive Load | [N] | [N] | +/-[N] |
    | Flow State | [N] | [N] | +/-[N] |
    | **DXI** | **[N]** | **[N]** | **+/-[N]** |

    **Actual vs. Projected**:
    - Projected improvement: +[N]
    - Actual improvement: +[N]
    - Variance: [N]%
    ```

#### Step 8.3: Track Ongoing Metrics

38. **Set up continuous monitoring**:
    ```
    ## Ongoing Monitoring Plan

    **Monthly Check-ins**:
    - [ ] Re-run timing measurements
    - [ ] Check support ticket rates
    - [ ] Survey user satisfaction

    **Quarterly Review**:
    - [ ] Full DXI recalculation
    - [ ] Benchmark against competitors
    - [ ] Identify new improvement opportunities

    **Success Criteria**:
    - DXI maintained at [N]+ over 6 months
    - No regression in key metrics
    - User satisfaction ≥ [N]/10
    ```

#### Step 8.4: Final Checkpoint

39. **Present validation summary**:
    ```
    ## Phase 8 Complete: Validation Done

    ### DX Improvement Summary
    - Starting DXI: [N]/10
    - Current DXI: [N]/10
    - Total Improvement: +[N] points

    ### ROI Achieved
    - Projected annual value: $[N]
    - Actual time saved: [N] hours/year
    - Actual value: $[N]

    Assessment complete. Generate final report? [Y/n]
    ```

---

## Output Format: Final DX Assessment Report

When generating the final report, use this template structure:

### Report Template

```markdown
# DX Assessment Report

**Subject**: [WORKFLOW_OR_TOOL]
**Assessment Type**: [quick | full]
**Date**: [assessment date]
**Assessor**: [name/team]

---

## Executive Summary

**DX Index Score**: [DXI]/10 - [Rating]

| Dimension | Score | Status |
|-----------|-------|--------|
| Feedback Loops | [N]/10 | [Good/Needs Work] |
| Cognitive Load | [N]/10 | [Good/Needs Work] |
| Flow State | [N]/10 | [Good/Needs Work] |

**Key Finding**: [one-sentence summary of biggest insight]

**Top Recommendation**: [single most impactful improvement]

---

## Detailed Scores

### Feedback Loops (40% weight): [N]/10

| Metric | Value | Score | Notes |
|--------|-------|-------|-------|
| Command latency | [N]s | [N]/10 | [observation] |
| Error discovery | [timing] | [N]/10 | [observation] |
| Test cycle time | [N]s | [N]/10 | [observation] |

### Cognitive Load (30% weight): [N]/10

| Metric | Value | Score | Notes |
|--------|-------|-------|-------|
| Concepts to learn | [N] | [N]/10 | [observation] |
| Help lookups | [N]/task | [N]/10 | [observation] |
| Context switches | [N] | [N]/10 | [observation] |

### Flow State (30% weight): [N]/10

| Metric | Value | Score | Notes |
|--------|-------|-------|-------|
| Interruptions | [N] | [N]/10 | [observation] |
| Resume time | [N]s | [N]/10 | [observation] |
| Batch support | [N]% | [N]/10 | [observation] |

---

## Competitive Position

| Metric | Your Tool | Best-in-Class | Gap |
|--------|-----------|---------------|-----|
| Time to complete | [N] | [N] | [diff] |
| Learning curve | [N] | [N] | [diff] |
| Error handling | [N] | [N] | [diff] |

---

## Prioritized Recommendations

### Quick Wins (Implement First)

| # | Improvement | DXI Impact | Effort | ROI |
|---|-------------|------------|--------|-----|
| 1 | [improvement] | +[N] | S | [N]x |
| 2 | [improvement] | +[N] | S | [N]x |

### Medium Priority

| # | Improvement | DXI Impact | Effort | ROI |
|---|-------------|------------|--------|-----|
| 3 | [improvement] | +[N] | M | [N]x |
| 4 | [improvement] | +[N] | M | [N]x |

### Long-Term Improvements

| # | Improvement | DXI Impact | Effort | ROI |
|---|-------------|------------|--------|-----|
| 5 | [improvement] | +[N] | L | [N]x |

---

## ROI Projection

**Assumptions**:
- Developer count: [N]
- Hourly rate: $[N]
- Implementation period: [N] weeks

**Projected Impact**:

| Improvement | Time Saved/Week | Annual Value | Cost | ROI |
|-------------|-----------------|--------------|------|-----|
| [improvement 1] | [N] min | $[N] | $[N] | [N]x |
| [improvement 2] | [N] min | $[N] | $[N] | [N]x |
| **Total** | **[N] min** | **$[N]** | **$[N]** | **[N]x** |

---

## Action Items

### Immediate (This Sprint)
- [ ] [action 1]
- [ ] [action 2]

### Short-Term (This Quarter)
- [ ] [action 3]
- [ ] [action 4]

### Long-Term (This Year)
- [ ] [action 5]

---

## Appendix

### Data Collection Summary
- Baseline runs: [N]
- User tests: [N] participants
- Competitors benchmarked: [N]
- A/B tests conducted: [N]

### Methodology Notes
- Assessment methodology: DX Core 4
- Weighting: FL 40%, CL 30%, FS 30%
- DXI benchmark: 1 point = ~13 min/week/developer

### References
- `core-dimensions.md`: Dimension definitions and scoring
- `measurement-guide.md`: Metrics and ROI formulas
- `evaluation-process.md`: 8-step evaluation methodology

---

*Generated by dx-assessment workflow*
*Framework: DX Core 4*
```

---

## Error Handling

| Situation | Action |
|-----------|--------|
| Missing baseline data | Prompt to complete Phase 1 first |
| Insufficient user tests | Allow proceeding with warning |
| No competitors identified | Skip Phase 3, note in report |
| A/B test skipped | Mark as "Not validated" in report |
| Interrupted assessment | Save progress, enable `--resume` |

---

## Quick Mode Shortcuts

When `EVALUATION_TYPE=quick`:

| Phase | Full Duration | Quick Duration | Notes |
|-------|---------------|----------------|-------|
| Phase 0 | 30 min | 15 min | Use defaults |
| Phase 1 | 4 hours | 1 hour | 1-2 timing runs |
| Phase 2 | 1 week | Skip | User testing optional |
| Phase 3 | 3 hours | 1 hour | 1-2 competitors |
| Phase 4 | 30 min | 15 min | Same |
| Phase 5 | 1 hour | 30 min | Same |
| Phase 6 | 2 hours | 1 hour | Top 5 only |
| Phase 7 | 2-4 weeks | Skip | A/B testing optional |
| Phase 8 | Ongoing | Skip | Post-validation optional |

---

## Resume Support

To resume an interrupted assessment:

```
Use RESUME_STEP parameter to continue from a specific phase:

RESUME_STEP=1 → Resume from Phase 1 (Baseline)
RESUME_STEP=5 → Resume from Phase 5 (DXI Calculation)

Previous data should be preserved in working documents.
```

---

