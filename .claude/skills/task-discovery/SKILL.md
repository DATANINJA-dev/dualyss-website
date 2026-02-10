---
name: task-discovery
description: |
  Structured questioning patterns for task generation and refinement. This skill
  auto-activates when creating new tasks, refining existing task definitions,
  decomposing complex tasks into subtasks, or gathering acceptance criteria.
  Provides frameworks for extracting requirements through systematic questioning.
---

# Task Discovery Skill

This skill provides frameworks for extracting requirements through structured questioning. It activates automatically during task-related work.

## When This Skill Activates

- Creating new tasks from ideas (`/generate-task`)
- Refining existing task definitions
- Decomposing complex tasks into subtasks
- Gathering acceptance criteria
- Converting vague requirements into specific deliverables

## Core Discovery Principles

1. **Start with context** - Understand what exists before asking what's needed
2. **Ask one thing at a time** (Guided) or group related questions (Batch)
3. **Use agent findings** - Incorporate research into questions
4. **Seek specificity** - Transform vague answers into concrete requirements
5. **Validate understanding** - Confirm interpretation before proceeding

## Quick Reference

| Task Type | Key Questions Focus |
|-----------|-------------------|
| feature | User stories, acceptance criteria, scope boundaries |
| bug | Reproduction steps, expected vs actual, environment |
| refactor | Current state, desired state, constraints, scope |
| research | Questions to answer, success criteria, deliverables |
| infra | Current setup, proposed changes, rollback plan |
| docs | Audience, outline, format, examples needed |

## Supporting Files

- See `questioning.md` for detailed question frameworks by task type
- See `templates.md` for response templates and formatting guidelines
- See `decomposition.md` for breaking down complex tasks (complexity >= 7)

## Usage in Workflows

This skill is designed to work with:
- `/generate-task` command (primary use)
- Task refinement conversations
- Sprint planning sessions
- Requirements gathering discussions

## Constraints

- Never invent requirements - only include what was explicitly stated or clearly implied
- Transform vague answers into specific questions rather than assuming
- Respect user's time - consolidate related questions when using Batch mode
- Stop when all required fields for the task type can be filled
