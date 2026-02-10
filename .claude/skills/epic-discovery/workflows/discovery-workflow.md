---
name: discovery-workflow
description: |
  Orchestrated workflow for product and feature-scale discovery. Guides users through
  structured questioning, validates completeness, and produces discovery context
  ready for epic generation. Adapts question depth based on scale.
allowed-tools: Read, AskUserQuestion, Task
---

# Discovery Workflow

Structured workflow for extracting product/feature requirements through systematic questioning. This workflow adapts its depth based on the scale of the idea being explored.

## Inputs

- **Idea description** - The raw concept from the user
- **Scale** - Product-scale or Feature-scale (detected or specified)
- **Existing context** (optional) - Prior discovery, related epics

## Workflow Phases

### Phase 1: Scale Detection

[Extended thinking: Analyze the idea for scale indicators. Product-scale: new domain, multiple user types, business model implied. Feature-scale: bounded scope, single user flow, fits existing domain.]

1. **Analyze idea for scale indicators**:

   | Indicator | Points to |
   |-----------|-----------|
   | "SaaS", "platform", "marketplace" | Product-scale |
   | Multiple user types mentioned | Product-scale |
   | Revenue/pricing mentioned | Product-scale |
   | "Add", "implement", "feature" | Feature-scale |
   | References existing system | Feature-scale |
   | Clear bounded scope | Feature-scale |

2. **Confirm scale with user**:
   ```
   Based on your description, this appears to be [product-scale / feature-scale].

   [If product-scale]
   This means we'll explore: market context, user personas, competitive landscape, MVP scope.

   [If feature-scale]
   This means we'll focus on: user need, scope boundaries, integration points.

   Is this classification correct? [Y/n/switch]
   ```

### Phase 2: Question Framework Selection

3. **Load appropriate questions**:
   - **Product-scale**: Use `product-questions.md`
   - **Feature-scale**: Use `feature-questions.md`

4. **Identify question priority**:
   - **Must Ask** (block if unclear) - Always ask these
   - **Should Ask** (warn if unclear) - Ask unless time-constrained
   - **Nice to Ask** (proceed if unclear) - Ask opportunistically

### Phase 3: Guided Discovery

5. **For Product-Scale** - Ask in phases:

   **Vision Phase** (Must Ask):
   - "What problem does this solve, and for whom?"
   - "What makes your approach different from existing solutions?"
   - "If this succeeds wildly, what does that look like in 1 year?"

   **Market Phase** (Should Ask):
   - "Who are the main competitors or alternatives?"
   - "What's your positioning? (Cheaper, faster, specialized, etc.)"

   **Persona Phase** (Must Ask):
   - "Describe your ideal first customer in detail"
   - "What's their biggest frustration with the status quo?"

   **Scope Phase** (Must Ask):
   - "What's the ONE thing this product must do extremely well?"
   - "If you could only ship 3 features, which would they be?"
   - "What's explicitly out of scope for v1?"

   **Validation Phase** (Should Ask):
   - "How will you measure if this is working?"
   - "How will this make money?"

6. **For Feature-Scale** - Ask in phases:

   **Context Phase** (Must Ask):
   - "What exists today that this relates to?"
   - "Who specifically needs this feature?"
   - "What are they trying to accomplish?"

   **Scope Phase** (Must Ask):
   - "What's the core functionality this must provide?"
   - "What's explicitly NOT part of this feature?"

   **Integration Phase** (Should Ask):
   - "How does this connect to existing features?"
   - "Are there dependencies on other work?"

   **Success Phase** (Should Ask):
   - "What must be true for this feature to be complete?"
   - "How will we know if this feature is successful?"

### Phase 4: Discovery Validation

7. **Run Discovery Validator** agent:
   - Use Task tool to invoke `agents/discovery-validator.md`
   - Pass all collected answers as context
   - Pass scale and question framework used

8. **Present validation results**:
   ```
   ## Discovery Validation

   **Completeness Score**: [X.X]/10 - [COMPLETE / NEEDS_MORE / INSUFFICIENT]

   | Category | Coverage | Notes |
   |----------|----------|-------|
   | Must Ask | X/Y answered | [gaps] |
   | Should Ask | X/Y answered | [gaps] |
   | Nice to Ask | X/Y answered | [gaps] |

   [If COMPLETE]
   Discovery is ready for epic generation.

   [If NEEDS_MORE]
   ### Recommended Follow-ups
   - [Question that would improve discovery]

   [If INSUFFICIENT]
   ### Required Before Proceeding
   - [Critical question that must be answered]
   ```

### Phase 5: Discovery Output

9. **Synthesize discovery context**:
   ```
   ## Discovery Context for Epic Generation

   ### Scale
   [Product / Feature]-scale

   ### Core Vision
   [Synthesized from vision/context answers]

   ### Target User
   [Synthesized from persona/user need answers]

   ### Scope Summary
   - **In scope**: [list]
   - **Out of scope**: [list]
   - **Dependencies**: [list]

   ### Success Criteria
   [Synthesized from validation/success answers]

   ### Open Questions
   [Questions that remain unanswered but are non-blocking]

   ### Discovery Metadata
   - **Validation score**: [X.X]/10
   - **Must-ask coverage**: [X/Y]
   - **Timestamp**: [date]
   ```

## Error Handling

| Situation | Action |
|-----------|--------|
| User wants to skip questions | Warn about gaps, allow proceeding |
| Scale seems wrong mid-discovery | Offer to switch and restart |
| Conflicting answers detected | Ask clarifying question |
| User abandons discovery | Save partial context for later |

## Critical Rules

- **ALWAYS validate discovery** before marking complete
- **NEVER proceed with INSUFFICIENT** validation - require user to answer critical questions
- **Adapt question depth** to user's time and patience
- **Preserve partial discovery** - don't lose progress if interrupted
- **Distinguish Must/Should/Nice** - enforce appropriate rigor per category
