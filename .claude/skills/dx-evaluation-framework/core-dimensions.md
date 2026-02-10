# DX Core Dimensions

Based on the DX Core 4 framework and academic research by Greiler et al.

## Three Core Dimensions

### 1. Feedback Loops (Weight: 40%)
**Definition**: How quickly developers learn if something works

**Measurement**:
- Time from command invocation to actionable output
- Test execution speed (TDD cycles)
- Error discovery latency (immediate vs delayed)
- Deploy-to-feedback cycle time

**Example**:
- Good: `/set-up` QA score appears immediately after agents run
- Poor: Silent failures, errors discovered only in production

**Optimization**:
- Provide immediate validation
- Show progress indicators for long operations
- Surface errors early in workflow

### 2. Cognitive Load (Weight: 30%)
**Definition**: Mental effort required for basic tasks

**Measurement**:
- Number of concepts to learn
- Flags/options to remember for common tasks
- Context switches (tool → docs → tool)
- Decision points per workflow

**Example**:
- Low load: `/generate-epics "idea"` (one command, clear intent)
- High load: Remember 7-agent structure, QA thresholds, reflection iteration limits

**Optimization**:
- Sensible defaults (minimal flags for common cases)
- Progressive disclosure (simple by default, complexity via flags)
- Consistent patterns (don't reinvent per command)

### 3. Flow State (Weight: 30%)
**Definition**: Ability to work without interruption

**Measurement**:
- Frequency of context switches
- Tool friction points (where work stops)
- Resumability (can you pick up where you left off?)
- Batch operations (reduce round-trips)

**Example**:
- Good flow: Resumable workflows (`--resume` flag), parallel agent execution
- Poor flow: Must manually track where you left off, sequential blocking operations

**Optimization**:
- Minimize confirmation prompts for non-destructive operations
- Support batch operations
- Provide resumption mechanisms
- Run independent operations in parallel

## DX Index (DXI) Calculation

```
DXI = (FeedbackLoops * 0.40) + (CognitiveLoad * 0.30) + (FlowState * 0.30)
```

**Scoring Scale**: 0-10 for each dimension

**Benchmark**: 1-point DXI improvement = 13 minutes saved per developer per week

**Performance Impact**: Top quartile teams (DXI 8-10) are 4-5x more productive

## Example Evaluation

**Tool**: `simon_tools` framework

### Feedback Loops: 8/10
- ✓ Immediate QA scores after discovery
- ✓ Real-time agent output in develop-task
- ✗ No progress indicators during long-running agents
- ✗ Audit results sometimes require manual file reading

### Cognitive Load: 6/10
- ✓ Clear command names (generate-epics, set-up)
- ✗ Must remember epic → task → set-up → develop hierarchy
- ✗ Multiple resumption patterns (--resume in 3 different commands)
- ✗ 7-agent structure is complex for new users

### Flow State: 7/10
- ✓ Resumable workflows (`--resume`)
- ✓ Parallel agent execution
- ✗ Must manually track task progress
- ✗ Frequent user confirmations break flow

**DXI**: (8 * 0.40) + (6 * 0.30) + (7 * 0.30) = **7.1/10**

**Interpretation**: Above average DX. Main improvement area: reduce cognitive load through better command hierarchy and unified resumption.

## Sources

- [DX Core 4 Framework Overview (GetDX)](https://getdx.com/blog/developer-experience/)
- [An Actionable Framework for DX (Greiler et al.)](https://www.michaelagreiler.com/wp-content/uploads/2024/06/An-Actionable-Frewmework-for-DX.pdf)
- [Three Core Dimensions of DX (GetDX Research)](https://getdx.com/research/conceptual-framework-for-developer-experience/)
- [Developer Experience Index (DXI)](https://newsletter.getdx.com/p/dx-core-4-framework-overview)
