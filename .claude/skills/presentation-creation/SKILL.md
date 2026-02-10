---
name: presentation-creation
description: |
  Create professional PowerPoint presentations in McKinsey/BCG consulting style.
  Auto-activates when tasks involve slides, presentations, pitch decks, or when
  user mentions "create presentation", "make slides", "PowerPoint", or "pitch deck".
  Provides pyramid principle structure, SCR narrative arc, and action title patterns.
---

# Presentation Creation Skill

Create compelling presentations that communicate effectively. This skill enhances Claude's natural presentation abilities with consulting-quality patterns while preserving flexibility and depth.

## Philosophy

**Content quality comes first.** Structure and formatting exist to serve your message, not constrain it. Use the frameworks below as guides, not rigid templates - adapt them to your specific audience and purpose.

## Activation Triggers

- Task type: "presentation", "slides", "deck", "pitch"
- Keywords: "create presentation", "make slides", "PowerPoint", "pitch deck"
- File patterns: Creating `.pptx` files or presentation markdown

## Quick Start

Tell me about your presentation. I'll help you structure it effectively.

**Key questions to consider** (answer what's relevant):

1. **Who is your audience?** What do they already know? What do they care about?
2. **What's your goal?** Inform, persuade, update, or propose?
3. **What's your core message?** If they remember one thing, what should it be?
4. **What evidence supports it?** Data, examples, stories, or analysis?
5. **What action do you want?** Decision, approval, feedback, or awareness?

**I'll then generate:**
- A structured outline with slide-by-slide breakdown
- Action titles that communicate each slide's key point
- Content that balances depth with clarity
- Speaker notes to guide your delivery

---

**Example Interaction**

> *"Create a presentation for investors about a new SaaS product that uses AI to predict project delays."*

From this, I'll create a pitch deck that:
- Opens with the market problem and opportunity
- Presents your solution with clear differentiation
- Shows traction, team, and business model
- Ends with a clear ask and next steps

**Prefer more structure?** Use the SCR framework:
- **Situation**: What context does the audience need?
- **Complication**: What problem or opportunity requires action?
- **Resolution**: What do you recommend and why?

## Reference Files (Use as Needed)

**Core Frameworks** - Use when you want more structure:
| File | When to Use |
|------|-------------|
| [pyramid-principle.md](frameworks/pyramid-principle.md) | Complex arguments needing clear logic |
| [scr-structure.md](frameworks/scr-structure.md) | Persuasive presentations with recommendations |
| [action-titles.md](frameworks/action-titles.md) | Ensuring slides communicate clearly |

**Visual Guidelines** - Use for polished formatting:
| File | When to Use |
|------|-------------|
| [layout-principles.md](visual-guidelines/layout-principles.md) | Designing slide layouts |
| [chart-selection.md](visual-guidelines/chart-selection.md) | Choosing visualizations for data |
| [typography.md](visual-guidelines/typography.md) | Font and sizing decisions |

**Templates & Tools** - Use for specific outputs:
| File | When to Use |
|------|-------------|
| [mckinsey-templates.md](mckinsey-templates.md) | Consulting-style slide patterns |
| [writing-style-guide.md](writing-style-guide.md) | Professional tone and phrasing |
| [python-pptx-integration.md](python-pptx-integration.md) | Programmatic PPTX generation |
| [mcp-integration.md](mcp-integration.md) | MCP server for AI-driven creation |

## Key Principles (Quick Reference)

1. **Pyramid Principle**: Lead with the answer, support with 3-5 arguments, provide evidence
2. **SCR Structure**: Situation (context) → Complication (problem) → Resolution (proposal)
3. **Action Titles**: Every slide title states the takeaway as a complete sentence
4. **One Idea Per Slide**: Clear message, visual supports it, no information overload

## Slide Structures

### Title Slide
```
[COMPANY/PROJECT LOGO]
[Main Title - Action Statement]
[Subtitle - Context/Date]
[Author/Team] | [Date]
```

### Executive Summary
```
[Action Title: Key Recommendation]

SITUATION          COMPLICATION        RESOLUTION
[2-3 bullets]      [2-3 bullets]       [2-3 bullets]

[Metric Box 1]  [Metric Box 2]  [Metric Box 3]
```

### Content Slide
```
[Action Title - States the Point]

[Left Column: 60%]          [Right Column: 40%]
- Key point 1               [Supporting Visual]
- Key point 2
- Key point 3

[Source: Data source if applicable]
```

## Presentation Structures (Adapt to Your Needs)

These are starting points - adjust based on your content and audience:

### Persuading / Recommending (10-15 slides)
**Purpose**: Get a decision or approval

Title → Executive Summary → Problem & Impact → Your Approach → How It Works (2-3 slides) → Timeline → Investment → Expected ROI → Risks & Mitigations → Next Steps → Appendix

*Key: Lead with your recommendation. Support with evidence. End with clear action.*

### Informing / Teaching (10-20 slides)
**Purpose**: Build understanding

Title → Agenda → Context/Background → Key Concepts (3-5 slides) → Deep Dives (2-3 slides) → Key Takeaways → Q&A → Resources

*Key: Structure for learning. Move from familiar to new. Reinforce key points.*

### Status Updates (5-8 slides)
**Purpose**: Keep stakeholders aligned

Title (with RAG status) → Key Metrics → Accomplishments → In Progress → Blockers/Risks → Next Period → Help Needed

*Key: Be concise. Highlight what matters. Make asks clear.*

### Investor Pitch (12-15 slides)
**Purpose**: Secure funding

Title → Problem → Solution → Market Size → Business Model → Traction → Competition → Team → Financials → Ask → Appendix

*Key: Tell a compelling story. Show momentum. Be specific about the ask.*

## Metric Callout Boxes

```
┌─────────────────┐
│      47%        │
│  Cost Reduction │
└─────────────────┘
```

Include: number (large, bold), brief label, optional comparison.

## Speaker Notes

Every slide should have:
- **Opening**: How to introduce this slide
- **Key Points**: What to emphasize
- **Transition**: How to move to next slide
- **Time**: Suggested duration
- **Backup**: Additional context if questioned

## PowerPoint Generation

### Workflow
1. Define structure from requirements
2. Write action titles for all slides first
3. Create content section by section
4. Add visuals that support each message
5. Write speaker notes for each slide
6. Review flow end-to-end

### Generation Tools

**Primary**: Use `document-skills:pptx` for PowerPoint generation:
```
/skill document-skills:pptx
```

**Fallback**: Generate structured markdown for conversion via pandoc, Marp, or reveal.js.

**Programmatic**: See [python-pptx-integration.md](python-pptx-integration.md) for template-based automation.

### Output Format
```markdown
---
title: "[Presentation Title]"
author: "[Author]"
theme: "mckinsey"
---

# Slide 1: [Action Title]

## Content
[Slide content]

## Visual
[Visual description]

## Speaker Notes
[What to say]
```

## What Makes a Great Presentation

### Content Quality (Most Important)

**Compelling narrative**: Your presentation tells a story with a clear beginning, middle, and end. Each slide advances the narrative.

**Specific, not generic**: Instead of "Market is growing," say "Project management software market growing 12% CAGR, reaching $9.8B by 2027." Specifics build credibility.

**Audience-aware**: Every slide answers "Why should they care?" The content addresses their concerns, uses their language, and respects their time.

**Actionable insights**: Don't just present data - interpret it. "Sales dropped 15%" becomes "Sales dropped 15% because new reps lack structured methodology - we can fix this."

### Structure & Flow

- **Action titles**: Each slide title states the takeaway: "AI reduces project delays by 35%" not "Project Delay Analysis"
- **One idea per slide**: If you can't summarize the slide in one sentence, split it
- **Logical progression**: Each slide builds on the previous one
- **Clear transitions**: The audience should know where you're going

### Formatting (Supports Content)

- [ ] Consistent visual style throughout
- [ ] Data has sources cited
- [ ] 6 or fewer bullets per slide
- [ ] Visuals that support the message (not decoration)
- [ ] Speaker notes for delivery guidance

### Common Pitfalls to Avoid

- Generic content that could apply to any company
- Slides that require extensive explanation
- Walls of text or bullet-point overload
- Missing the "so what?" for data points
- Unclear or missing calls to action

## Citation Standards

### When to Cite
All statistics, market data, quotes, competitive info, and research findings.

### In-Slide Format
```
Revenue grew 15%¹ while costs decreased 8%²

───────────
¹ Company Q3 2026 Report
² Internal analysis, Oct 2026
```

### Source Credibility
1. **Tier 1**: Company financials, SEC filings, peer-reviewed research
2. **Tier 2**: Industry analysts (Gartner, McKinsey, Forrester)
3. **Tier 3**: Trade publications, industry associations
4. **Tier 4**: News articles, expert interviews
5. **Avoid**: Wikipedia, unverified blogs, social media

## Related Skills

- document-creation: Source material for presentations
- research-methodology: Gathering presentation content
