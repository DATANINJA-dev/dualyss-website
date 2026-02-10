# Gap Analysis Patterns

Reference patterns for identifying configuration gaps based on industry best practices.

## Essential Patterns (Should Have)

These patterns are recommended by Anthropic and widely adopted in the Claude Code community.

### 1. TDD Workflow Skill

**Why**: Anthropic explicitly recommends TDD for agentic coding - write tests first, avoid mocks, confirm failure before implementing.

**Detection**: Check for skill/command mentioning:
- "test first", "TDD", "test-driven"
- "avoid mocks", "real tests"
- "confirm failure"

**If missing**: Suggest `tdd-workflow` skill with:
- Test-first principles
- Mock avoidance guidance
- Iteration patterns

**Source**: [Anthropic Engineering Blog](https://www.anthropic.com/engineering/claude-code-best-practices)

---

### 2. Context Management Skill

**Why**: Long sessions cause "context drift" - models gradually deprioritize earlier system-level instructions. Need guidance on when to `/clear` and delegate to subagents.

**Detection**: Check for guidance on:
- `/clear` usage patterns
- Subagent delegation for research
- Context window management
- Session hygiene

**If missing**: Suggest `context-management` skill with:
- When to clear context
- Subagent delegation patterns
- Signs of context drift

**Source**: [alexop.dev](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)

---

### 3. Reflection Agent

**Why**: Self-review before committing catches errors. Running a separate review pass with fresh context often yields better results.

**Detection**: Check for agent with:
- "reflection", "self-review", "verify"
- Pre-commit validation
- Quality gate patterns

**If missing**: Suggest `reflection-agent` with:
- Pre-commit review steps
- Error pattern detection
- Quality checklist

**Source**: Community best practice, parallel review patterns

---

### 4. Block-at-Submit Hooks

**Why**: Research shows blocking at commit time is more effective than blocking at write/edit. Blocking mid-plan "frustrates" the agent.

**Detection**: Check for:
- PreToolUse hooks on `Bash(git commit)`
- Commit validation patterns
- Test-before-commit enforcement

**If missing**: Suggest `commit-validator` hook with:
- Test pass verification
- Lint check enforcement
- Commit message validation

**Source**: [alexop.dev hooks guide](https://alexop.dev/posts/understanding-claude-code-full-stack/)

---

### 5. Active Skills Pattern

**Why**: Skills can be "procedural packages" with embedded workflows and agents, not just passive knowledge. This enables domain-specific multi-agent verification (e.g., SEO audit with 4 parallel analyzers, TDD cycle with test quality verification).

**Detection**: Check for skill directories with:
- `workflows/` subdirectory
- `agents/` subdirectory
- SKILL.md references to Task tool

**If missing**: Suggest converting passive skills to active skills when:
- Skill covers complex domain (SEO, security, testing, code review)
- Multiple verification steps would benefit accuracy
- Domain has clear workflow phases

**Architecture**:
```
.claude/skills/[domain]/
├── SKILL.md              ← Knowledge + triggers (unchanged)
├── workflows/            ← Executable workflows (/skill:workflow)
│   └── [workflow].md
├── agents/               ← Skill-specific agents
│   └── [agent].md
└── knowledge/            ← Supporting reference files
    └── *.md
```

**Example - Active TDD Skill**:
```
.claude/skills/tdd-workflow/
├── SKILL.md                  ← TDD knowledge + triggers
├── workflows/
│   └── cycle.md              ← /tdd-workflow:cycle
│       Phase 1: RED (write failing test)
│       Phase 2: GREEN (implement)
│       Phase 3: REFACTOR (improve)
│       Each phase runs verification agents
└── agents/
    ├── test-quality.md       ← Evaluates test design
    └── code-quality.md       ← Checks implementation
```

**Source**:
- [Anthropic Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [wshobson/agents](https://github.com/wshobson/agents)

---

## Advanced Patterns (Nice to Have)

These patterns provide additional value but are not essential for all projects.

### 6. Parallel Review Workflow

**Why**: Having one Claude write code while another reviews it (separate contexts) often yields better results than self-review.

**Detection**: Check for:
- Commands/skills about multi-Claude patterns
- Parallel checkout guidance
- Git worktree usage

**If missing**: Low priority - suggest only for teams

**Source**: Anthropic multi-Claude patterns

---

### 7. Documentation Fetcher Agent

**Why**: Prevents outdated guidance on external libraries. Agent fetches current docs before answering.

**Detection**: Check for:
- Agents that fetch library documentation
- WebFetch for API docs
- Version-aware guidance

**If missing**: Medium priority for projects with many dependencies

**Source**: Dexie-db-specialist pattern from community

---

### 8. Headless Automation Commands

**Why**: Programmatic Claude usage for CI/CD pipelines using `claude -p "prompt" --json | command`.

**Detection**: Check for:
- Commands supporting `--json` output
- Pipeline-friendly patterns
- GitHub Actions integration

**If missing**: Low priority unless automation is needed

**Source**: Anthropic headless mode docs

---

### 9. Checklist Manager Agent

**Why**: Track errors/tasks in markdown checklists during complex sessions. Provides structured progress tracking.

**Detection**: Check for:
- Agents managing task lists
- Error tracking patterns
- Session progress logging

**If missing**: Medium priority for complex workflows

**Source**: Community session management patterns

---

## Anti-Patterns to Flag

These patterns indicate configuration issues that should be addressed.

### 1. Over-Complex Slash Commands

**Signal**: Commands with 10+ phases, extensive logic, multiple agent orchestrations.

**Problem**: Should be simple shortcuts. Complex workflows belong in skills or dedicated commands.

**Fix**: Split into focused commands or convert to skill with supporting files.

---

### 2. Missing CLAUDE.md

**Signal**: No root `CLAUDE.md` file in project.

**Problem**: Foundation for all customization. Without it, no project-wide conventions are enforced.

**Fix**: Create root `CLAUDE.md` with project conventions.

---

### 3. Blocking Hooks on Write/Edit

**Signal**: PreToolUse hooks that deny Write or Edit operations.

**Problem**: Blocking mid-plan confuses the agent. More effective to validate at commit time.

**Fix**: Move validation to commit-time hooks (block-at-submit).

---

### 4. No Nested CLAUDE.md

**Signal**: Only root `CLAUDE.md`, no subdirectory-specific files.

**Problem**: Miss opportunity for specialized instructions (e.g., testing patterns in `tests/`, database conventions in `db/`).

**Fix**: Add nested `CLAUDE.md` for specialized subdirectories.

---

### 5. Opus for Simple Tasks

**Signal**: Agents using `model: opus` for research, documentation, or pattern matching.

**Problem**: Over-provisioning. Haiku sufficient for fast operations, sonnet for judgment.

**Fix**: Reserve opus for truly complex reasoning. Use haiku/sonnet appropriately.

---

### 6. Blanket Tool Permissions

**Signal**: `allowed-tools: *` or `tools: Bash, Write, Edit, Read, ...` without restrictions.

**Problem**: Security risk. Violates principle of least privilege.

**Fix**: Specify exact tools needed. Document restrictions in comments.

---

## Expected Coverage Baselines

| Category | Minimum | Good | Excellent |
|----------|---------|------|-----------|
| Commands | 5 | 8 | 12+ |
| Agents | 10 | 20 | 30+ |
| Skills | 2 | 4 | 6+ |
| Hooks | 2 | 4 | 6+ |

## Priority Matrix

| Pattern | Priority | Effort | Impact |
|---------|----------|--------|--------|
| TDD Workflow | High | Low | High |
| Context Management | High | Low | High |
| Reflection Agent | High | Medium | High |
| Block-at-Submit Hooks | High | Medium | High |
| Active Skills Pattern | Medium | High | High |
| Parallel Review | Medium | Medium | Medium |
| Documentation Fetcher | Medium | Medium | Medium |
| Headless Automation | Low | Medium | Low |
| Checklist Manager | Low | Low | Medium |
| Vertical Chain Completeness | High | Medium | High |
| Orphan Prevention | Medium | Low | Medium |
| Circular Dependency Prevention | High | Low | High |
| Optimal Chain Depth | Medium | Medium | Medium |

---

## Dependency Chain Patterns

Patterns for healthy vertical dependency chains in Claude Code configurations.

### 10. Vertical Chain Completeness

**Why**: Commands should reach MCPs through proper agent/skill chains, enabling validation, logging, and reuse at each level. Direct MCP calls skip important quality gates.

**Detection**: Check for:
- Commands directly invoking MCPs without agents
- Agents directly invoking MCPs without skill context
- Missing intermediate layers in execution paths

**Healthy Chain Pattern**:
```
[command] (orchestrator)
    ↓ Phase 2: Parallel Analysis
[agent-1] + [agent-2] + [agent-3]
    ↓ Each agent references
[skill] (knowledge + patterns)
    ↓ Skills may integrate
[MCP] (external capability)
```

**If missing**: Suggest adding intermediate agents/skills for:
- Validation before MCP calls
- Logging and observability
- Reuse across commands
- Error handling and fallbacks

**Source**: [Anthropic Multi-Agent System](https://www.anthropic.com/engineering/multi-agent-research-system)

---

### 11. Orphan Prevention Pattern

**Why**: Orphaned components indicate dead code or missing integration. Every component should be reachable from an entry point (command).

**Detection**: Check for:
- Agents never referenced by any command
- Skills never referenced by any agent
- MCPs defined but never used by any component
- Hooks with no matching trigger patterns

**If orphans found**:
1. Determine if component is still needed
2. If needed: Add reference from appropriate parent
3. If deprecated: Remove or archive with documentation
4. If utility: Document as standalone component

**Prevention**: Pre-write hooks can check for orphan creation patterns

---

### 12. Circular Dependency Prevention

**Why**: Circular dependencies create infinite loops, undefined execution order, and debugging nightmares. Agent A → Agent B → Agent A breaks execution.

**Detection**: Use topological sort on dependency graph. If sort fails (back-edge detected), cycles exist.

**Common Circular Patterns**:
- Agent A calls Agent B, Agent B calls Agent A
- Command delegates to agent that invokes same command
- Skill references agent that references same skill
- Mutual delegation between agents

**Fix Pattern**:
- Extract shared logic to neutral component (skill)
- Introduce direction (parent always calls child)
- Use skill for shared state instead of mutual calls
- Restructure responsibilities to eliminate cycle

**Source**: [Dependency Graphs in AI Agents](https://www.gocodeo.com/post/dependency-graphs-orchestration-and-control-flows-in-ai-agent-frameworks)

---

### 13. Optimal Chain Depth

**Why**: Too shallow = missing validation opportunities. Too deep = complexity, performance overhead, and context dilution.

**Optimal Depth**: 2-4 levels

| Depth | Assessment | Example |
|-------|------------|---------|
| 1 | Too shallow | Command → MCP direct (no validation) |
| 2 | Minimal | Command → Agent → MCP |
| 3 | Good | Command → Agent → Skill → MCP |
| 4 | Maximum recommended | Command → Agent → Sub-agent → Skill |
| 5+ | Too deep | Review for consolidation |

**Detection**: Trace longest path from each command to terminal node (MCP or external call).

**If too shallow**:
- Add agent layer for validation/error handling
- Add skill reference for domain knowledge

**If too deep**:
- Consolidate related agents
- Move logic to skill knowledge files
- Consider parallel execution instead of sequential

**Source**: Static analysis best practices, Anthropic agent patterns
