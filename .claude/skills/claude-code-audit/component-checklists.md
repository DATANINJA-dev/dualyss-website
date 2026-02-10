# Component Validation Checklists

Per-type validation criteria for the audit system.

## Command Checklist

### Frontmatter (Required)
- [ ] Starts with `---` at very top of file
- [ ] `description` field present and descriptive
- [ ] `allowed-tools` field restricts to minimum needed
- [ ] `argument-hint` present if command takes arguments
- [ ] Closes with `---`

### Structure
- [ ] Clear `# command-name` title
- [ ] Brief explanation of purpose
- [ ] Parameter documentation (if applicable)
- [ ] `## Instructions` section with phases
- [ ] `## Error Handling` section
- [ ] `## CRITICAL RULES` section

### Input Handling
- [ ] Input validation at start of instructions
- [ ] Empty/invalid input handling
- [ ] Minimum context requirements documented

### Phases (Complex Commands)
- [ ] Phase 0: Pre-checks or matching
- [ ] Phase 1-N: Main workflow steps
- [ ] Phase X.5: QA/verification (if applicable)
- [ ] Phase X.6: Reflection loop (if applicable)
- [ ] Final Phase: Creation/output

### Best Practice Patterns
- [ ] Human-in-the-loop for destructive operations
- [ ] Extended thinking instruction (complex commands)
- [ ] Completion checkpoints between phases
- [ ] Draft preview before creation/modification
- [ ] Summary output with next steps
- [ ] File operation steps have explicit read/modify/write sub-steps

### Advanced Patterns
- [ ] QA agent integration after discovery
- [ ] Reflection loop with max iterations (2)
- [ ] Parallel agent execution where possible
- [ ] External feedback checkpoint
- [ ] Generation metadata tracking

### Tool Security
- [ ] No blanket `Bash` access
- [ ] `Write`/`Edit` only where necessary
- [ ] Path constraints documented
- [ ] Permissions justified in comments

---

## Agent Checklist

### Frontmatter (Required)
- [ ] `name` field present
- [ ] `description` explains when agent triggers
- [ ] `model` specified (haiku, sonnet, opus)
- [ ] `tools` limited to required set

### Structure
- [ ] Clear `# Agent Name` title
- [ ] `## Purpose` section explaining role
- [ ] `## Inputs Required` section
- [ ] `## Analysis Steps` with numbered process
- [ ] `## Output Format` with template
- [ ] `## Constraints` section

### Model Selection
- [ ] haiku for: research, docs, design, API checks, fast operations
- [ ] sonnet for: code impact, test planning, security, QA, complex judgment
- [ ] Model matches agent complexity

### Output Quality
- [ ] Structured output format (markdown tables)
- [ ] Scoring system where appropriate
- [ ] Actionable recommendations
- [ ] Clear severity/priority indicators

### Tool Permissions
- [ ] Only tools actually needed
- [ ] No Bash unless required
- [ ] Write/Edit only if agent creates files
- [ ] mcp__* only if MCP integration needed

### Integration
- [ ] Works with Task tool invocation
- [ ] Compatible with parallel execution
- [ ] Output consumable by QA agents
- [ ] Follows naming conventions

---

## Skill Checklist

### Structure (Required)
- [ ] `SKILL.md` present as entry point
- [ ] Frontmatter with `name` and `description`
- [ ] Description includes activation triggers
- [ ] Under 500 lines (5000 words)

### Content
- [ ] `## When This Skill Activates` section
- [ ] `## Core Principles` or equivalent
- [ ] `## Supporting Files` list
- [ ] `## Constraints` section
- [ ] Quick reference/summary

### Auto-Activation
- [ ] Trigger keywords documented
- [ ] Context match clear and specific
- [ ] Not overly broad activation
- [ ] No conflict with other skills

### Supporting Files
- [ ] Each file has focused purpose
- [ ] Cross-references between files
- [ ] No duplicate content
- [ ] Clear naming conventions

### Quality
- [ ] Comprehensive coverage of topic
- [ ] Examples where helpful
- [ ] Usage scenarios documented
- [ ] Relationship to commands/agents noted

---

## Hook Checklist

### Frontmatter (Required)
- [ ] `event` field with valid type
- [ ] `matcher` field with specific pattern (not just `*`)

### Valid Event Types
- [ ] PreToolUse - before tool execution
- [ ] PostToolUse - after tool completion
- [ ] Stop - when Claude stops
- [ ] SubagentStop - when subagent finishes
- [ ] SessionStart - session begins
- [ ] SessionEnd - session ends
- [ ] UserPromptSubmit - user submits prompt
- [ ] PreCompact - before context compaction
- [ ] Notification - system notification

### Content
- [ ] `## Trigger Conditions` documented
- [ ] `## Validation Checks` listed
- [ ] Script/logic explained
- [ ] `## Output Format` specified
- [ ] `## On Failure` handling

### Matcher Quality
- [ ] Specific tool name (not `*`)
- [ ] Path pattern if applicable
- [ ] Combined matcher for precision
- [ ] Documented why this scope

### Safety
- [ ] No over-triggering on common operations
- [ ] Clear allow/deny logic
- [ ] Graceful degradation on errors
- [ ] Doesn't block unnecessarily

---

## Cross-Component Checks

### Naming Conventions
- [ ] Commands: lowercase-with-dashes.md
- [ ] Agents: descriptive-purpose.md
- [ ] Skills: skill-name/ directory
- [ ] Hooks: trigger-context.md

### References
- [ ] Agent references in commands are valid
- [ ] Skill references exist
- [ ] Hook matchers match actual tools
- [ ] File paths in code are correct

### Model Consistency
- [ ] Similar agents use same model
- [ ] Model matches complexity
- [ ] No unnecessary opus usage

### Output Compatibility
- [ ] Agent outputs work with QA agents
- [ ] Command outputs are actionable
- [ ] Skill content is loadable
- [ ] Hook outputs follow JSON schema

---

## Quick Validation Summary

### Minimum Viable (Score 5+)
- [ ] Valid frontmatter
- [ ] Core sections present
- [ ] No syntax errors
- [ ] Basic functionality

### Good Quality (Score 7+)
- [ ] All essential patterns
- [ ] Proper structure
- [ ] Appropriate tools
- [ ] Complete content

### Excellent (Score 8+)
- [ ] Advanced patterns where applicable
- [ ] Minimal permissions
- [ ] Perfect integration
- [ ] Comprehensive documentation
