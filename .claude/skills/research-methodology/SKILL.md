---
name: research-methodology
description: |
  Auto-activates when agents need to conduct web research, evaluate sources,
  or synthesize findings into structured outputs. Provides consistent research
  methodology across the framework.
---

# Research Methodology Skill

This skill provides frameworks for conducting quality web research and synthesizing findings. Used by audit-domain-researcher, audit-gap-analyzer, and any future research-heavy agents.

## When This Skill Activates

- Agents performing web research for domain knowledge
- Commands that need external information gathering
- Gap analysis requiring current best practices
- Any task requiring source evaluation and synthesis
- Domain depth evaluation during audits

## Core Research Principles

1. **Current sources first** - Prefer recent (current year) authoritative content
2. **Multiple perspectives** - Consult 3+ sources per topic
3. **Source evaluation** - Rate source quality (authority, recency, depth)
4. **Structured synthesis** - Transform research into actionable checklists
5. **Citation tracking** - Always note where information came from

## Supporting Files

- `web-research.md` - How to conduct effective web searches
- `source-evaluation.md` - Rating source quality and reliability
- `checklist-synthesis.md` - Building checklists from research findings
- `architecture-research.md` - Researching reference architectures for system-level proposals

## Usage

This skill is automatically activated when research-heavy agents run. Agents reference these guidelines to ensure consistent:
- Search query formulation
- Source quality assessment
- Checklist generation from findings

## Constraints

- Max 5 web searches per research task
- Prefer authoritative sources (official docs, industry leaders)
- Flag when sources conflict or are outdated
- Never present research as fact without citation
- Stop searching when consistent patterns emerge across 3+ sources
