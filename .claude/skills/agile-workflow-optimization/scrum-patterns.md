# Scrum Patterns

## Principle
Scrum is an empirical framework where teams commit to achievable Sprint Goals, inspect progress through regular ceremonies, and adapt based on real data. Focus on delivering value incrementally, not maximizing utilization.

## Sprint Planning

### Timebox
- **2-week sprint**: 4 hours maximum
- **1-month sprint**: 8 hours maximum
- **Formula**: 2 hours per week of sprint length

### Process
1. **Product Owner** presents highest-priority Product Backlog items
2. **Team** discusses and clarifies requirements
3. **Team** estimates capacity (accounting for PTO, meetings, operational work)
4. **Team** selects work they can commit to completing
5. **Team** creates Sprint Goal (a coherent objective for the Sprint)

### Key Patterns

**"Just Enough" Planning**
- Plan work in detail for immediate sprint only
- Avoid over-planning future sprints (waste due to changing requirements)
- Sprint backlog is owned by developers, not Product Owner

**Sprint Goal over Backlog Completion**
- Sprint Goal = commitment; Sprint Backlog = forecast
- If scope needs adjusting, protect the Sprint Goal
- Better to deliver a coherent increment than scattered incomplete items

**Capacity Calculation**
```
Available hours = (Team members × Working days × Hours/day) - Meetings - Operational
Focus factor = 0.6-0.8 (new teams use 0.6, mature teams use 0.8)
Sprint capacity = Available hours × Focus factor
```

## Story Points

### Purpose
Story points measure **relative complexity**, not time. They combine:
- **Complexity**: How intricate is the solution?
- **Effort**: How much work is involved?
- **Risk**: What could go wrong?
- **Uncertainty**: How much do we not know?

### Fibonacci Scale
Use: 1, 2, 3, 5, 8, 13, 21...

**Why Fibonacci?**
- Gaps widen as numbers increase (reflects estimation uncertainty)
- Forces "roughly equal" or "clearly bigger" decisions
- Prevents false precision (no 7 or 9 debates)

| Points | Meaning |
|--------|---------|
| 1 | Trivial, well-understood, minimal risk |
| 2 | Small, straightforward |
| 3 | Medium, some complexity |
| 5 | Significant work, some unknowns |
| 8 | Large, complex, should consider splitting |
| 13+ | Epic-sized, must be broken down |

### Planning Poker

1. **Presenter** explains the story
2. **Discussion** clarifies requirements and approach
3. **Silent vote** using Fibonacci cards
4. **Reveal** all votes simultaneously
5. **Discuss** highest and lowest votes (what did they see differently?)
6. **Re-vote** if needed (max 2 rounds)
7. **Consensus** or Product Owner decides tie

### Calibration

**Reference Story Pattern**
- Choose a well-understood story as the "1-point baseline"
- Example: "Add a new field to an existing form (no validation, no backend changes)"
- All estimates are relative to this baseline

**Common Mistakes to Avoid**
- Using points to judge developer productivity
- Converting points to hours
- Comparing points between teams
- Letting individuals estimate alone (whole-team estimates)
- Treating estimates as commitments

## Velocity

### Definition
Velocity = total story points completed per sprint (only "Done" items count)

### Yesterday's Weather Pattern

**Concept**: Use recent history to forecast capacity
- Calculate 3-sprint rolling average
- Low variance (< 20%) enables accurate forecasting
- High variance signals process or scope issues

**Calculation**:
```
Sprint N-2: 24 points
Sprint N-1: 28 points
Sprint N:   26 points
-------------------
Average velocity: 26 points/sprint
```

**Forecasting**:
```
Remaining backlog: 130 points
Average velocity: 26 points/sprint
Estimated sprints: 130 / 26 = 5 sprints
```

### Variance Reduction

To improve forecasting accuracy:
1. **Whole-team estimation** (diverse perspectives catch unknowns)
2. **Swarming** (team focuses on fewer items simultaneously)
3. **Breaking down large stories** (13+ points should be split)
4. **Consistent Definition of Done** (prevents scope creep)
5. **Limit WIP** (finish work before starting new work)

### What Velocity Is NOT

- A measure of team quality or productivity
- Comparable between teams
- A short-term predictor (valid for planning, not daily tracking)
- A target to maximize (optimizing velocity often harms quality)

## Scrum Ceremonies

### Daily Standup (Daily Scrum)
**Timebox**: 15 minutes
**Participants**: Developers (Scrum Master facilitates, PO observes)

**Focus Questions**:
1. What did I do yesterday toward the Sprint Goal?
2. What will I do today toward the Sprint Goal?
3. What blockers are in my way?

**Anti-patterns**:
- Status report to manager (not the purpose)
- Problem-solving in standup (take offline)
- Waiting for turn (conversation, not round-robin)

### Sprint Planning
**Timebox**: 8 hours max (1-month sprint), 4 hours (2-week sprint)
**Participants**: Scrum Master, Product Owner, Developers

**Outputs**:
- Sprint Goal (why this sprint matters)
- Sprint Backlog (what will be done)
- Initial plan (how work will be accomplished)

### Sprint Review
**Timebox**: 4 hours max (1-month sprint), 2 hours (2-week sprint)
**Participants**: Scrum Team + Stakeholders

**Purpose**:
- Demonstrate potentially shippable increment
- Gather stakeholder feedback
- Update Product Backlog based on learnings
- Discuss market changes, timeline, budget

**Anti-patterns**:
- Sign-off meeting (it's a working session)
- Demo of unfinished work (only "Done" items)
- One-way presentation (encourage discussion)

### Sprint Retrospective
**Timebox**: 3 hours max (1-month sprint), 1.5 hours (2-week sprint)
**Participants**: Scrum Team only (no stakeholders)

**Purpose**:
- Inspect how the sprint went (people, process, tools)
- Identify improvements for next sprint
- Create actionable improvement plan

**Start/Stop/Continue Framework**:
| Category | Question |
|----------|----------|
| **Start** | What should we begin doing? |
| **Stop** | What should we stop doing? |
| **Continue** | What's working that we should keep? |

**Output**: 1-3 actionable improvements for next sprint

## Anti-Patterns

### Process Anti-Patterns
- **Cargo-culting ceremonies**: Running events without understanding purpose
- **Skipping retrospectives**: Eliminates continuous improvement
- **Velocity targeting**: Gaming estimates to hit numbers
- **Sprint Zero**: Unlimited planning sprint before "real" work
- **Sprint-to-sprint carryover**: Routinely carrying over unfinished work

### Estimation Anti-Patterns
- **Individual estimates**: Miss diverse perspectives and risks
- **Points = hours**: Story points lose meaning when converted
- **Comparing teams**: Each team's points are calibrated differently
- **Pressured estimates**: Forcing lower numbers harms accuracy
- **Re-estimating completed work**: Points measure complexity at decision time

### Role Anti-Patterns
- **Product Owner as project manager**: PO owns what, not how
- **Scrum Master as team lead**: SM is servant-leader, not boss
- **Developers as "resources"**: People are individuals with skills

## Applying to Simon_Tools

### Sprint Planning for Features
When planning simon_tools development:
1. Use `/list-tasks --status backlog` to see available work
2. Estimate using Planning Poker with team
3. Select tasks that fit sprint capacity
4. Create Sprint Goal (e.g., "Complete audit enhancement epic")

### Velocity Tracking
- Track tasks completed per development cycle
- Note: Story points not yet tracked in tasks.json (enhancement opportunity)
- Use complexity field (XS=1, S=2, M=3, L=5, XL=8) as proxy

### Retrospective Questions for Framework Development
1. Which commands/agents caused confusion or rework?
2. What patterns made development faster?
3. Where did we discover gaps mid-implementation?
4. What documentation would have helped?

## Sources

- [The Scrum Guide (Official)](https://scrumguides.org/scrum-guide.html)
- [Scrum.org - Introduction to Scrum Events](https://www.scrum.org/resources/introduction-scrum-events)
- [Atlassian Agile Coach - Scrum Ceremonies](https://www.atlassian.com/agile/scrum/ceremonies)
- [Atlassian - Story Points Estimation](https://www.atlassian.com/agile/project-management/estimation)
- [Mountain Goat Software - Planning Poker](https://www.mountaingoatsoftware.com/agile/planning-poker)
- [Scrum Patterns - Notes on Velocity](https://sites.google.com/a/scrumplop.org/published-patterns/value-stream/notes-on-velocity)
