---
name: retrospective-facilitation
description: |
  Guide team through structured retrospective ceremony with multiple formats.
  Supports 5+ formats: Start/Stop/Continue, 4Ls, Sailboat, Glad/Sad/Mad, Starfish.
  Uses industry-standard 5-phase structure for effective continuous improvement.
allowed-tools: Read, Write, AskUserQuestion
input-parameters:
  - FORMAT: string (optional - defaults to Start/Stop/Continue)
  - DURATION: number (optional - minutes, default 60)
  - TEAM_SIZE: number (optional - affects timing recommendations)
---

# Retrospective Facilitation Workflow

Guide a team through a structured retrospective ceremony. This workflow implements the industry-standard 5-phase retrospective pattern with multiple format options.

## Inputs

- **FORMAT** - Retrospective format (Start/Stop/Continue, 4Ls, Sailboat, Glad/Sad/Mad, Starfish)
- **DURATION** (optional) - Total time in minutes (default: 60)
- **TEAM_SIZE** (optional) - Number of participants (affects timing)

## Overview

**Total Duration**: 45-90 minutes (60 min default)

| Phase | Duration | Purpose |
|-------|----------|---------|
| 0. Setup | 5 min | Preparation, format selection |
| 1. Set the Stage | 5 min | Psychological safety, ground rules |
| 2. Gather Data | 15 min | Collect feedback using format |
| 3. Generate Insights | 20 min | Patterns, root causes |
| 4. Decide Actions | 10 min | 1-2 concrete action items |
| 5. Close | 5 min | Summarize, thank team |

---

## Phase 0: Setup & Format Selection (5 min)

### Pre-Retrospective Checklist

1. **Review previous retrospective**:
   - [ ] Read previous action items
   - [ ] Check completion status of each item
   - [ ] Prepare to report progress

2. **Prepare environment**:
   - [ ] Whiteboard/Miro board ready
   - [ ] Timer visible to all
   - [ ] Anonymous input option (if needed)

3. **Select format** (if not predetermined):

   Use AskUserQuestion:
   ```
   Select retrospective format:

   [1] Start/Stop/Continue - Quick, actionable (30-45 min)
   [2] 4Ls (Liked/Learned/Lacked/Longed for) - Deeper exploration (45-60 min)
   [3] Sailboat (Winds/Rocks/Anchors/Sunshine) - Visual, risk-aware (45-60 min)
   [4] Glad/Sad/Mad - Emotional perspective (30-45 min)
   [5] Starfish (Keep/Less/More/Stop/Start) - Granular (45-60 min)
   ```

---

## Phase 1: Set the Stage (5 min)

### Establish Psychological Safety

Read aloud or display:

> "This retrospective is a safe space. What's said here stays here.
> We assume everyone did their best with what they knew at the time.
> Focus on the system and process, not individual blame."

### Ground Rules

1. **Vegas Rule**: What happens in retro stays in retro
2. **Assume positive intent**: Everyone was trying their best
3. **Focus on process**: Critique systems, not people
4. **One voice at a time**: No interrupting
5. **Equal participation**: Everyone contributes

### Check-In Activity (Optional)

Quick round: "In one word, how are you feeling about last sprint?"

---

## Phase 2: Gather Data (15 min)

### Format Templates

#### Format 1: Start/Stop/Continue

| START | STOP | CONTINUE |
|-------|------|----------|
| What should we begin doing? | What should we stop doing? | What's working that we should keep? |

**How to facilitate**:
1. Silent brainstorm (5 min): Everyone writes sticky notes
2. Post to board in columns
3. Brief clarification round (no discussion yet)

**Example items**:
- START: Daily code reviews before 2pm
- STOP: Scheduling meetings during focus time
- CONTINUE: Pair programming for complex features

---

#### Format 2: 4Ls (Liked/Learned/Lacked/Longed for)

| LIKED | LEARNED | LACKED | LONGED FOR |
|-------|---------|--------|------------|
| What went well? | What did we learn? | What was missing? | What do we wish we had? |

**How to facilitate**:
1. Silent brainstorm: 2-3 items per category (5 min)
2. Round-robin sharing (7 min)
3. Group similar items (3 min)

**Example items**:
- LIKED: Successful launch with zero downtime
- LEARNED: CI pipeline catches 80% of issues before review
- LACKED: Clear acceptance criteria on stories
- LONGED FOR: More automated testing coverage

---

#### Format 3: Sailboat

```
                    ☀️ SUNSHINE (What's great)
                         |
                         |
        💨 WINDS ------> ⛵ <------ ⚓ ANCHORS (What slows us)
      (What pushes us)   |
                         |
                    🪨 ROCKS (Future risks)
```

| SUNSHINE | WINDS | ANCHORS | ROCKS |
|----------|-------|---------|-------|
| What's going great? | What propels us forward? | What slows us down? | What risks lie ahead? |

**How to facilitate**:
1. Draw sailboat on whiteboard
2. Silent brainstorm with colored stickies (5 min)
3. Place stickies in appropriate areas
4. Discuss patterns (10 min)

---

#### Format 4: Glad/Sad/Mad

| GLAD 😊 | SAD 😢 | MAD 😤 |
|---------|--------|--------|
| What made you happy? | What disappointed you? | What frustrated you? |

**How to facilitate**:
1. Personal reflection (3 min)
2. Share in small groups of 2-3 (5 min)
3. Share highlights with full team (7 min)

**Note**: This format surfaces emotional responses - be prepared to validate feelings.

---

#### Format 5: Starfish

```
       KEEP          LESS
         \           /
          \    🌟   /
           \       /
            -------
           /       \
          /         \
       MORE        STOP
                    |
                  START
```

| KEEP | LESS | MORE | STOP | START |
|------|------|------|------|-------|
| Maintain | Do less of | Do more of | Stop entirely | Begin doing |

**How to facilitate**:
1. Explain 5 categories (2 min)
2. Silent brainstorm (5 min)
3. Dot voting for priority (3 min)
4. Discuss top items (5 min)

---

## Phase 3: Generate Insights (20 min)

### Identify Patterns

1. **Group related items**: Cluster similar feedback
2. **Name the clusters**: What theme connects them?
3. **Vote for importance**: Dot voting (3 dots per person)

### 5 Whys for Root Cause

For the top 2-3 themes, ask "Why?" five times:

**Example**:
```
Problem: "Deployments often fail on Friday"
Why 1: Because we rush to finish features before weekend
Why 2: Because we commit to too much in sprint planning
Why 3: Because estimates are consistently too optimistic
Why 4: Because we don't account for unexpected work
Why 5: Because we don't track interruption time
→ Root Cause: Need to track and budget for interruptions
```

### Discussion Questions

- "What's the real issue behind these patterns?"
- "Have we seen this before? What did we try?"
- "What's within our control to change?"

---

## Phase 4: Decide Actions (10 min)

### Action Item Guidelines

**SMART Criteria**:
- **S**pecific: Clear, concrete action
- **M**easurable: Know when it's done
- **A**ssignable: One owner (not "the team")
- **R**ealistic: Achievable in one sprint
- **T**ime-bound: Due date set

### Action Item Template

| Action | Owner | Due Date | Success Criteria |
|--------|-------|----------|------------------|
| Add interruption tracking to daily standup | @alice | End of sprint | Interruptions logged in Jira |
| Create deployment checklist | @bob | Sprint Day 3 | Checklist reviewed by team |

### Rules

1. **Maximum 2 actions per retro** (focus over quantity)
2. **One owner per action** (not "the team")
3. **Review at next retro** (accountability)

---

## Phase 5: Close (5 min)

### Summarize Key Insights

```
Today's Key Takeaways:
1. [Top insight from discussion]
2. [Second insight]
3. [Third insight if applicable]

Action Items:
1. [Action] - Owner: [name], Due: [date]
2. [Action] - Owner: [name], Due: [date]
```

### Appreciation Round (Optional)

"Take a moment to thank someone for their contribution this sprint."

### Close Out

- Confirm next retrospective date
- Thank everyone for participation
- Remind: "Action items will be reviewed at start of next sprint"

---

## Facilitation Tips

### Creating Psychological Safety

- **Model vulnerability**: Share your own struggles first
- **Validate emotions**: "That sounds frustrating" before problem-solving
- **Protect quiet voices**: "Let's hear from those who haven't spoken"
- **Redirect blame**: "Let's focus on what the process could have caught"

### Managing Dominant Voices

- Use round-robin for initial sharing
- Implement "talking stick" rule
- Silent brainstorming before discussion
- "Let's get a different perspective"

### Remote Team Adaptations

- **Async prep**: Share format 24h before for pre-thinking
- **Designated facilitator**: Critical in remote settings
- **Visual collaboration**: Miro/Mural over just talking
- **Time zone rotation**: Rotate inconvenient times fairly
- **Camera on policy**: Increases engagement
- **Break after 45 min**: Remote attention spans shorter

### When Retros Feel Stale

- Rotate format every 2-3 sprints
- Change facilitator
- Do "retro of the retro" - what's not working?
- Try themed retros (only discuss one topic deeply)

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Status report retro** | No improvement focus | Focus on "what to change" not "what happened" |
| **Blame game** | Kills psychological safety | Redirect to process, not people |
| **Too many actions** | Nothing gets done | Limit to 1-2 actions per retro |
| **No follow-up** | Actions forgotten | Review at start of next retro |
| **Same format always** | Team disengages | Rotate formats |
| **Skipping retros** | No improvement engine | Never skip - it's mandatory |
| **Manager dominates** | Team censors themselves | Manager speaks last or not at all |

---

## Follow-Up Template

After the retrospective, document results:

```markdown
# Sprint [N] Retrospective Summary

**Date**: [date]
**Facilitator**: [name]
**Format**: [format used]
**Attendees**: [names]

## Previous Action Item Review
| Action | Owner | Status | Notes |
|--------|-------|--------|-------|
| [from last retro] | [name] | Done/Partial/Not Done | [why] |

## Key Insights
1. [insight]
2. [insight]
3. [insight]

## New Action Items
| Action | Owner | Due Date | Success Criteria |
|--------|-------|----------|------------------|
| [action] | [name] | [date] | [criteria] |

## Parking Lot (Future Discussion)
- [item not actionable now]
```

---

## Sources

- [Atlassian: Sprint Retrospective - How to Hold an Effective Meeting](https://www.atlassian.com/team-playbook/plays/retrospective)
- [Retrium: The Five Phases of a Successful Retrospective](https://www.retrium.com/ultimate-guide-to-agile-retrospectives/five-phases-of-a-successful-retrospective)
- [Scrum.org: The 5 Phases of the Retrospective](https://www.scrum.org/forum/scrum-forum/49541/5-phases-retrospective)
- [EasyRetro: 17+ Most Popular Retrospective Formats](https://easyretro.io/ideas/retrospective-formats/)
- [Scaled Agile Framework: Iteration Retrospective](https://framework.scaledagile.com/iteration-retrospective)
