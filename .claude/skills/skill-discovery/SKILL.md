# Skill Discovery

> Dynamic research-driven skill discovery for project and task domains

## Purpose

This skill enables **always-on** discovery of domain skills based on:
- **Project Type** (Level 1): SaaS, e-commerce, educational, report-based, etc.
- **Task Domain** (Level 2): auth, payments, SEO, accessibility, UX, etc.

## Core Philosophy

**Every run is an opportunity to discover improvements.**

- Discovery phases **NEVER skip** - they always execute
- Even excellent systems get recommendations for enhancement
- Research is cheap; missing improvements is expensive
- Cache accelerates but **never suppresses** research output

## Activation Triggers

### Level 1: Project-Aware (during `/generate-epics`)
- Activates: **Unconditionally** in Phase 3.1
- Agent: `project-skill-discovery.md`
- Output: Skill recommendations based on project type

### Level 2: Task-Aware (during `/set-up`)
- Activates: **Unconditionally** in Phase 1.6
- Agent: `task-skill-discovery.md`
- Output: Skill recommendations based on task domain

### Level 3: Audit Integration (during `/audit`)
- Activates: **Unconditionally** in Phase 6
- Agent: `skill-discovery-advisor.md`
- Output: Skill backing analysis for ALL agents

## Usage

This skill auto-activates during the commands above. It can also be referenced directly:

```
Reference: skill-discovery/project-type-patterns.md
Reference: skill-discovery/task-domain-patterns.md
Reference: skill-discovery/skill-template-generator.md
Reference: skill-discovery/research-sources.md
```

## Output Format

All recommendations include:
- **Rationale**: Why this skill is needed
- **Content suggestions**: Research-backed structure
- **Sources**: With quality scores (>= 7.0)
- **Priority**: critical / high / medium / low / info
- **Type**: active (knowledge + workflows) / passive (knowledge only)
- **Enhancement type**: `new` / `update` / `expand`

## User Control

- Never auto-creates skills - always presents options
- Options: `[C]reate / [S]elect / [L]ater / [N]one`
- `--quiet` flag suppresses info-level recommendations

## Related Files

| File | Purpose |
|------|---------|
| `project-type-patterns.md` | Project type → domain skill mappings |
| `task-domain-patterns.md` | Task domain → validation patterns |
| `skill-template-generator.md` | Templates for new skills |
| `research-sources.md` | Curated authoritative sources |
