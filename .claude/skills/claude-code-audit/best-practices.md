# Best Practices Pattern Catalog

Reference patterns for Claude Code component evaluation.

## Command Patterns

### Essential Patterns (Required)

1. **Input Validation**
   ```markdown
   ## Input Validation
   1. Check $ARGUMENTS is not empty
   2. Validate format/constraints
   ```

2. **Phased Instructions**
   ```markdown
   ### Phase 1: Discovery
   ### Phase 2: Analysis
   ### Phase 3: Creation
   ```

3. **Critical Rules Section**
   ```markdown
   ## CRITICAL RULES
   - **ALWAYS** do X
   - **NEVER** do Y
   ```

4. **Error Handling**
   ```markdown
   ## Error Handling
   | Situation | Action |
   |-----------|--------|
   ```

### Advanced Patterns (Complex Commands)

5. **QA/Verification Phase**
   ```markdown
   ### Phase X.5: QA
   - Run QA agent
   - Score quality
   - Present results
   ```

6. **Reflection Loop**
   ```markdown
   ### Phase X.6: Reflection (if score < 7)
   - Max 2 iterations
   - Re-run specific agents
   - User decides: refine/proceed/cancel
   ```

7. **Parallel Agent Execution**
   ```markdown
   Run IN PARALLEL using Task tool with run_in_background: true:
   - agent-1.md
   - agent-2.md
   ```

8. **Human-in-the-Loop**
   ```markdown
   Proceed? [Y/n]
   Options: [A]pprove / [R]evise / [C]ancel
   ```

9. **Extended Thinking**
   ```markdown
   [Extended thinking: Consider X, Y, Z before proceeding]
   ```

10. **Draft Preview**
    ```markdown
    ## Proposed [Entity]
    [Preview content]
    Adjust? [Y/n]
    ```

11. **Completion Checkpoints**
    ```markdown
    ### Phase X Complete
    - Verified: [what was done]
    - Next: [what comes next]
    ```

12. **Generation Metadata**
    ```yaml
    _generation_metadata:
      qa_score: X.X
      reflection_iterations: N
      agents_run: [list]
    ```

---

## Agent Patterns

### Essential Patterns (Required)

1. **Purpose Section**
   ```markdown
   ## Purpose
   [Clear explanation of agent's role]
   ```

2. **Inputs Required**
   ```markdown
   ## Inputs Required
   - Input 1
   - Input 2
   ```

3. **Analysis Steps**
   ```markdown
   ## Analysis Steps
   1. **Step name**
      - Detail
   2. **Step name**
      - Detail
   ```

4. **Output Format**
   ```markdown
   ## Output Format
   ```
   [Structured template]
   ```
   ```

5. **Constraints Section**
   ```markdown
   ## Constraints
   - Only analyze, never modify
   - Limit to top N results
   ```

### Model Selection Guide

| Agent Type | Model | Rationale |
|------------|-------|-----------|
| Research, context gathering | haiku | Fast, sufficient |
| Code analysis, security | sonnet | Deep understanding |
| UX, docs, design | haiku | Pattern matching |
| QA, scoring | sonnet | Judgment required |

### Output Quality Patterns

6. **Scoring System**
   ```markdown
   ### Quality Score: [X.X]/10 - [VERDICT]
   | Dimension | Score | Notes |
   ```

7. **Actionable Recommendations**
   ```markdown
   ### Recommendations
   1. [Specific action]
   2. [Specific action]
   ```

8. **Severity Indicators**
   ```markdown
   ### Critical Issues (blocking)
   ### Warnings (non-blocking)
   ### Suggestions (polish)
   ```

---

## Skill Patterns

### Essential Patterns (Required)

1. **SKILL.md Entry Point**
   - Frontmatter with name and description
   - Clear activation triggers
   - Quick reference section

2. **When This Skill Activates**
   ```markdown
   ## When This Skill Activates
   - Trigger 1
   - Trigger 2
   ```

3. **Supporting Files List**
   ```markdown
   ## Supporting Files
   - `file1.md` - Purpose
   - `file2.md` - Purpose
   ```

### Quality Patterns

4. **Core Principles**
   ```markdown
   ## Core Principles
   1. Principle
   2. Principle
   ```

5. **Constraints**
   ```markdown
   ## Constraints
   - Don't do X
   - Focus on Y
   ```

6. **Usage Examples**
   ```markdown
   ## Usage
   This skill works with:
   - /command-1
   - /command-2
   ```

---

## Hook Patterns

### Essential Patterns (Required)

1. **Valid Frontmatter**
   ```yaml
   ---
   event: PreToolUse | PostToolUse | Stop | ...
   matcher: Write | Edit | Bash | ...
   ---
   ```

2. **Trigger Conditions**
   ```markdown
   ## Trigger Conditions
   - Tool: [tool name]
   - Path pattern: [glob]
   ```

3. **Validation Checks**
   ```markdown
   ## Validation Checks
   - [ ] Check 1
   - [ ] Check 2
   ```

4. **Output Format**
   ```markdown
   ## Output Format
   ```json
   {"decision": {"behavior": "allow|deny", "message": "..."}}
   ```
   ```

### Quality Patterns

5. **On Failure Handling**
   ```markdown
   ## On Failure
   - Log error
   - Suggest remediation
   - Don't auto-fix
   ```

6. **Specific Matchers**
   - Avoid `*` wildcards when possible
   - Use path patterns to limit scope
   - Combine tool + path for precision

---

## Anti-Patterns to Avoid

### Commands
- Blanket tool permissions (`Bash` without restrictions)
- No input validation
- Missing error handling
- No human approval for destructive operations

### Agents
- Wrong model selection (sonnet for simple tasks)
- Overly broad tool access
- Unstructured output
- No constraints section

### Skills
- Overly broad activation triggers
- Missing SKILL.md
- No supporting file references
- Duplicate content across files

### Hooks
- `*` matcher (triggers on everything)
- No error handling
- Blocking without reason
- Over-triggering on common operations
