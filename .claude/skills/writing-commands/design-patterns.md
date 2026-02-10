# Design Patterns

Best practices for designing effective Claude Code commands.

## Contents
- [Core Principles](#core-principles)
- [Structure Patterns](#structure-patterns)
- [Constraints Section](#constraints-section)
- [Error Handling](#error-handling)
- [Input Validation](#input-validation)
- [Output Patterns](#output-patterns)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

## Core Principles

### 1. Single Responsibility
Each command should do **one thing well**.

**Good:**
- `/generate-task` - Creates a task
- `/validate-task` - Validates a task
- `/list-tasks` - Lists tasks

**Bad:**
- `/manage-tasks` - Creates, validates, lists, deletes, archives tasks

### 2. Clear Phases
Complex commands should have distinct phases:

```markdown
## Phase 1: Analysis
- Gather information
- Identify what's needed

## Phase 2: Action
- Perform the main task

## Phase 3: Summary
- Report what was done
- Show results
```

### 3. Human-in-the-Loop
For critical operations, get user confirmation:

```markdown
## Instructions

1. Analyze the request
2. **Ask for confirmation before proceeding**
3. Only execute after user approves
4. Show results

## Critical Rules
- NEVER execute without user confirmation
- Always show what will be done before doing it
```

**When to use:**
- Destructive operations (delete, overwrite)
- Operations that can't be undone
- Operations with side effects (commits, deployments)
- When requirements are ambiguous

## Structure Patterns

### Simple Command (< 50 lines)

```markdown
---
description: Brief description
allowed-tools: Tool1, Tool2
---

# command-name

Brief explanation.

## Instructions
1. Step one
2. Step two
3. Step three
```

### Complex Command (Multi-phase)

```markdown
---
description: Brief description
allowed-tools: Tools...
argument-hint: [arg]
---

# command-name

Explanation of what this command does.

## Parameter
$ARGUMENTS = Description of expected input

## Locations
- Where things are stored
- File patterns

## Instructions

### Phase 1: Analysis
1. First gather information
2. Identify requirements

### Phase 2: Discovery (if human-in-the-loop)
3. Ask clarifying questions
4. Wait for user input

### Phase 3: Execution
5. Perform the action
6. Handle errors

### Phase 4: Summary
7. Report results
8. Suggest next steps

## Critical Rules
- NEVER do X
- ALWAYS do Y
- If Z happens, do W
```

## Constraints Section

Every non-trivial command should have explicit constraints:

```markdown
## Critical Rules

- **NEVER** create files without user approval
- **NEVER** delete without confirmation
- **ALWAYS** show draft before executing
- **ALWAYS** validate input before processing
- If ambiguous, ask for clarification
- If error occurs, report clearly and stop
```

## Error Handling

Commands should handle errors gracefully:

```markdown
## Error Handling

- If file not found: Report which file and suggest alternatives
- If invalid input: Explain what's wrong and show expected format
- If operation fails: Show error details and suggest recovery steps
```

## Input Validation

Validate inputs at the start:

```markdown
## Instructions

1. **Validate input**
   - Check $ARGUMENTS is not empty
   - Verify format matches expected pattern
   - If invalid, explain and stop

2. Proceed with valid input...
```

## Output Patterns

### Summary Output
```markdown
## Summary Output

After completion, show:
- What was done
- Files created/modified
- Next steps (if any)
```

### Progress Feedback
For long operations:
```markdown
## Progress

- Use TodoWrite to track progress
- Update user as each phase completes
- Show intermediate results when helpful
```

## Anti-Patterns to Avoid

### 1. God Commands
Commands that try to do everything.

### 2. Silent Failures
Commands that fail without clear error messages.

### 3. Assumption-Based Design
Commands that assume context without asking.

### 4. No Constraints
Commands without explicit rules about what NOT to do.

### 5. Rigid Workflows
Commands that can't handle variations in input.
