---
name: epic-discovery
description: |
  Passive skill providing question frameworks for product and feature discovery.
  Auto-activates when generating epics, PRDs, or conducting product-level analysis.
activation:
  contexts:
    - "epic generation"
    - "PRD creation"
    - "product vision"
    - "feature scoping"
  triggers:
    - "/generate-epics"
    - "create epic"
    - "new product"
---

# Epic Discovery Skill

This is a **passive skill** providing question frameworks for product-level discovery. It complements the task-discovery skill with product-focused questioning.

## Skill Structure

```
epic-discovery/
├── SKILL.md                    # This file (entry point)
├── product-questions.md        # Product-scale question framework
└── feature-questions.md        # Feature-scale question framework
```

Note: Active workflows and discovery validation are handled by the `generate-epics` command
which references these frameworks and uses the `epic-discovery-qa` agent.

## When This Skill Activates

- Creating new epics (`/generate-epics`)
- Generating PRD content for product-scale ideas
- Defining product vision and strategy
- Conducting competitive analysis
- Defining user personas at product level
- Structuring multi-epic project decomposition

## Core Discovery Principles

1. **Product thinking** - Start with problem, not solution
2. **User-centric** - Ground every feature in real user needs
3. **Scope discipline** - MVP first, expand later
4. **Market awareness** - Know the competitive landscape
5. **Validate assumptions** - Challenge before committing
6. **Quality gating** - Validate discovery before proceeding

## Quick Reference

| Scale | Key Questions Focus | Workflow |
|-------|-------------------|----------|
| Product-scale | Vision, personas, market position, business model | Full discovery |
| Feature-scale | User need, scope boundaries, integration points | Focused discovery |
| Extension | Current state, gap being filled, constraints | Minimal discovery |

## Question Depth Levels

1. **Vision Level** - Why does this need to exist?
2. **Persona Level** - Who specifically needs this and why?
3. **Scope Level** - What's in/out for v1?
4. **Validation Level** - How will we know it's working?

## Question Priority Categories

| Priority | Meaning | Discovery Impact |
|----------|---------|------------------|
| **Must Ask** | Block epic creation if unanswered | Required for COMPLETE validation |
| **Should Ask** | Warn if skipped, reduce confidence | Expected for quality discovery |
| **Nice to Ask** | Bonus context, not required | Improves depth if time permits |

## Supporting Files

- `product-questions.md` - Product-scale questioning frameworks (5 phases, ~25 questions)
- `feature-questions.md` - Feature-scale questioning frameworks (4 phases, ~20 questions)

## Usage in Workflows

This skill integrates with:
- `/generate-epics` command (primary use) - Triggers discovery workflow
- PRD generation flows - Uses product-questions framework
- Product strategy discussions - Reference question frameworks
- Multi-epic planning sessions - Scale detection and validation

## Relationship to Task Discovery

| Aspect | Epic Discovery | Task Discovery |
|--------|----------------|----------------|
| Type | Passive (knowledge) | Passive (knowledge) |
| Abstraction | Product/epic level | Individual task level |
| Questions | Why, who, what scope | How, acceptance criteria |
| Output | Question frameworks | Question frameworks |
| Consumer | generate-epics command | generate-task command |

## Constraints

- Focus on product-level concerns, defer implementation details
- Transform vague ideas into clear product vision
- Respect scale - don't over-engineer feature-scale as product-scale
- Stop when enough context to create quality epics
- Let task-discovery handle implementation-level questions
