# Skill Discovery Output Format Specification

Standardized output format for all skill discovery agents to ensure consistency across the framework.

## Purpose

This specification ensures:
1. All skill discovery agents produce consistent output
2. Downstream consumers (audit-recommender, user presentation) can reliably parse output
3. Priority levels and actions are unambiguous

## Priority Levels (Standardized)

| Level | Description | When to Use |
|-------|-------------|-------------|
| `critical` | Security/compliance, blocks deployment | Authentication, authorization, data protection |
| `high` | Core functionality, should implement | Main features, important patterns |
| `medium` | Important enhancement, recommended | Nice-to-have improvements |
| `low` | Nice-to-have, defer if needed | Minor optimizations |
| `info` | Informational only (suppressible with --quiet) | FYI items, research findings |

## Action Options (Standardized)

| Action | Code | Description |
|--------|------|-------------|
| Create | `[C]` | Create new skill from research |
| Update | `[U]` | Update existing skill with new content |
| Expand | `[E]` | Add new sections to existing skill |
| Later | `[L]` | Defer decision to post-implementation |
| None | `[N]` | Skip recommendation, no action needed |

## Enhancement Types

| Type | Description |
|------|-------------|
| `new` | Skill doesn't exist, needs creation |
| `update` | Skill exists but needs content update |
| `expand` | Skill exists but needs additional sections |

## Confidence Levels

| Level | Criteria |
|-------|----------|
| `high` | 3+ matching keywords, clear domain match |
| `medium` | 1-2 matching keywords, probable match |
| `low` | No direct keywords, inferred from context |

## Required Fields

Every skill discovery recommendation MUST include:

```json
{
  "domain": "string",
  "skill_name": "string",
  "priority": "critical|high|medium|low|info",
  "enhancement_type": "new|update|expand",
  "confidence": "high|medium|low",
  "rationale": "1-2 sentences explaining why",
  "sources": [
    {
      "name": "Source name",
      "url": "https://...",
      "quality": 7.0
    }
  ]
}
```

**Minimum sources**: 3 (each with quality score 7.0+)

## Project-Level Output Schema

Used by `project-skill-discovery` agent:

```json
{
  "version": "1.0.0",
  "task_id": null,
  "project_description": "string",
  "detection": {
    "detected_type": "string",
    "detected_types": ["string"],
    "confidence": "high|medium|low",
    "matching_keywords": ["string"],
    "is_hybrid": false,
    "clarification_needed": false,
    "suggested_types": ["string"]
  },
  "existing_skills": {
    "covered": ["skill-name"],
    "uncovered_domains": ["domain-name"],
    "alternatives_found": {
      "requested-skill": "existing-skill"
    }
  },
  "recommendations": [
    {
      "domain": "string",
      "skill_name": "string",
      "priority": "critical|high|medium|low",
      "enhancement_type": "new|update|expand",
      "confidence": "high|medium|low",
      "rationale": "string",
      "suggested_content": ["string"],
      "sources": [...]
    }
  ],
  "summary": {
    "total_recommendations": 0,
    "by_priority": {
      "critical": 0,
      "high": 0,
      "medium": 0,
      "low": 0
    },
    "by_enhancement_type": {
      "new": 0,
      "update": 0,
      "expand": 0
    },
    "average_source_quality": 0.0
  }
}
```

## Task-Level Output Schema

Used by `task-skill-discovery` agent:

```json
{
  "version": "1.0.0",
  "task_id": "TASK-XXX",
  "task_title": "string",
  "detection": {
    "primary_domain": "string",
    "primary_domains": ["string"],
    "secondary_domains": ["string"],
    "confidence": "high|medium|low",
    "matching_keywords": {},
    "is_multi_domain": false,
    "clarification_needed": false,
    "suggested_domains": ["string"]
  },
  "skill_coverage": {
    "primary_domain": {
      "has_skill": true,
      "skill_name": "string",
      "skill_type": "direct|alternative",
      "note": "string"
    },
    "secondary_coverage": {}
  },
  "recommendations": [...],
  "enhancements": [
    {
      "skill": "string",
      "gap": "string",
      "suggestion": "string",
      "source": "string"
    }
  ],
  "task_specific_checklist": ["string"],
  "summary": {
    "total_recommendations": 0,
    "total_enhancements": 0,
    "research_quality": 0.0
  }
}
```

## Audit-Level Output Schema

Used by `skill-discovery-advisor` agent:

```json
{
  "version": "1.0.0",
  "audit_scope": "all|commands|agents|specific",
  "agents_analyzed": 0,
  "skill_coverage": {
    "no_backing": 0,
    "partial_backing": 0,
    "full_backing": 0
  },
  "coverage_matrix": {
    "agent-name": {
      "detected_domains": ["string"],
      "skill_coverage": {},
      "coverage_percentage": 0,
      "note": "string"
    }
  },
  "recommendations": [...],
  "enhancements": [...],
  "research_quality": 0.0,
  "total_sources": 0
}
```

## User-Facing Markdown Format

All agents should produce user-readable markdown in addition to JSON:

```markdown
# Skill Discovery Report

## Detection
- **Type/Domain**: {type} ({confidence} confidence)
- **Keywords**: {keyword_list}
- **Hybrid/Multi-domain**: {yes/no}

## Skill Coverage
| Domain | Existing Skill | Status |
|--------|---------------|--------|
| {domain} | {skill or "none"} | {covered/partial/missing} |

## Recommendations

### Critical Priority
#### {skill_name}
**Domain**: {domain}
**Enhancement**: {new/update/expand}
**Confidence**: {confidence}

**Rationale**: {why this skill is needed}

**Suggested Content**:
- {item 1}
- {item 2}

**Sources**:
1. [{name}]({url}) (Quality: {score}/10)

**Action**: [C]reate / [U]pdate / [E]xpand / [L]ater / [N]one

### High Priority
...

## Summary
- **Total recommendations**: {N}
- **New skills needed**: {N}
- **Updates suggested**: {N}
- **Average research quality**: {score}/10
```

## Validation Rules

1. **Priority must be one of**: critical, high, medium, low, info
2. **Enhancement type must be one of**: new, update, expand
3. **Confidence must be one of**: high, medium, low
4. **Minimum 3 sources per recommendation**
5. **Each source must have quality >= 7.0**
6. **rationale must be 1-2 sentences (not empty)**
7. **skill_name must exist in registry OR enhancement_type must be "new"**

## Error Handling

If validation fails, output should include:

```json
{
  "validation_errors": [
    {
      "field": "recommendations[0].sources",
      "error": "Minimum 3 sources required, found 2"
    }
  ],
  "partial_output": true
}
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-20 | Initial specification |
