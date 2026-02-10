# Enhancement Patterns

Reference patterns for converting simple configurations into sophisticated multi-agent systems.

## Skill Enhancement Patterns

### Passive vs Active Skills

**Passive Skill** (knowledge only):
```
.claude/skills/[domain]/
└── SKILL.md              ← Static knowledge
```

**Active Skill** (knowledge + execution):
```
.claude/skills/[domain]/
├── SKILL.md              ← Knowledge + triggers
├── workflows/            ← Executable multi-step processes
│   └── [workflow].md     ← Invokable as /skill:workflow
├── agents/               ← Skill-specific subagents
│   └── [agent].md
└── knowledge/            ← Supporting reference files
    └── *.md
```

---

## When to Enhance Skills

### Criteria for Active Skill Conversion

| Criterion | Score +1 if True |
|-----------|------------------|
| Skill covers complex domain (SEO, security, testing) | +1 |
| Multiple verification steps would improve accuracy | +1 |
| Domain has clear workflow phases | +1 |
| Parallelizable analysis exists | +1 |
| MCP integration would add value | +1 |
| Iterative refinement benefits the output | +1 |

**Threshold**: Score >= 3 → Recommend active skill conversion

### Domain Suitability Matrix

| Domain | Active Benefit | Recommended Architecture |
|--------|---------------|-------------------------|
| **SEO** | High | 3+ parallel analyzers (meta, content, performance) |
| **Security** | High | Multi-layer checks (OWASP, auth, data) |
| **Testing** | High | TDD phases with verification agents |
| **Code Review** | Medium | Parallel reviewers by concern |
| **Documentation** | Medium | Structure + completeness checkers |
| **Performance** | High | Profiling + optimization suggestions |
| **Accessibility** | Medium | WCAG checkers by level |

---

## Active Skill Architectures

### Pattern 1: Parallel Analyzers

Best for: Domains with independent analysis dimensions.

```
.claude/skills/seo/
├── SKILL.md
├── workflows/
│   ├── full-audit.md       ← Orchestrates all agents
│   └── quick-check.md      ← Runs only critical agents
├── agents/
│   ├── meta-analyzer.md    ← Title, description, OG tags
│   ├── content-analyzer.md ← Keyword density, readability
│   ├── technical-analyzer.md ← Sitemap, robots, canonical
│   └── performance-analyzer.md ← Core Web Vitals
└── knowledge/
    └── seo-checklist.md
```

**Workflow structure (full-audit.md):**
```yaml
---
description: Complete SEO audit with all analyzers
allowed-tools: Task, Read, Glob, mcp__plugin_playwright
---

# /seo:full-audit

## Phase 1: Discovery
Read target URL/file, detect content type

## Phase 2: Parallel Analysis
Run ALL 4 agents in parallel:
- meta-analyzer (haiku)
- content-analyzer (sonnet)
- technical-analyzer (haiku)
- performance-analyzer (haiku + Playwright)

## Phase 3: Synthesis
Combine findings, score overall SEO health

## Phase 4: Recommendations
Prioritized fixes by impact/effort
```

### Pattern 2: Sequential Phases

Best for: Workflows with dependencies between steps.

```
.claude/skills/tdd-workflow/
├── SKILL.md
├── workflows/
│   └── cycle.md            ← Red-Green-Refactor cycle
├── agents/
│   ├── test-writer.md      ← Writes failing test
│   ├── test-runner.md      ← Runs tests, reports status
│   └── implementation.md   ← Writes code to pass test
└── knowledge/
    └── tdd-principles.md
```

**Workflow structure (cycle.md):**
```yaml
---
description: TDD Red-Green-Refactor cycle
allowed-tools: Task, Read, Write, Bash
---

# /tdd-workflow:cycle

## Phase 1: RED (Write Failing Test)
1. Launch test-writer agent
2. Agent writes test for feature
3. Run test-runner agent → Verify FAILS

## Phase 2: GREEN (Implement)
1. Launch implementation agent
2. Agent writes minimal code
3. Run test-runner agent → Verify PASSES

## Phase 3: REFACTOR (Optional)
If code needs cleanup:
1. Refactor implementation
2. Run test-runner agent → Verify still PASSES
```

### Pattern 3: QA Gate Pattern

Best for: Quality-critical workflows needing validation.

```
.claude/skills/code-review/
├── SKILL.md
├── workflows/
│   └── full-review.md
├── agents/
│   ├── style-reviewer.md     ← Lint, formatting
│   ├── logic-reviewer.md     ← Business logic
│   ├── security-reviewer.md  ← Vulnerabilities
│   └── review-qa.md          ← Synthesizes, gates
└── knowledge/
    └── review-checklist.md
```

**QA Gate flow:**
```
Reviewers (parallel) → review-qa → [score < 7?] → Reflection loop
                                 → [score >= 7?] → Approve
```

---

## Agent Enhancement Patterns

### Single Agent → Multi-Agent

**Before** (monolithic):
```yaml
# task-code-impact.md
Analyzes: files, dependencies, risks, tests (all in one)
```

**After** (specialized):
```yaml
# task-code-impact.md (orchestrator)
Coordinates 3 specialized agents:
- file-analyzer.md (haiku) → File list, import chains
- dependency-analyzer.md (haiku) → Version conflicts
- risk-analyzer.md (sonnet) → Security, breaking changes
```

### When to Split Agents

| Signal | Action |
|--------|--------|
| Agent prompt > 500 lines | Split by concern |
| Mixed model needs (fast + judgment) | Split by model |
| Independent analysis dimensions | Parallelize |
| Sequential dependencies | Keep together but phase |

---

## Command Enhancement Patterns

### Adding Sub-Commands

**Before**:
```yaml
# /audit
Does everything in one command
```

**After**:
```yaml
# /audit
Sub-commands:
- /audit mcp → MCP-specific deep analysis
- /audit skills → Skill enhancement suggestions
- /audit optimization → Model/parallelization analysis
- /audit integrations → Cross-component opportunities
```

### Adding QA Gates

**Before**:
```yaml
Phase 1: Discovery
Phase 2: Generation
Phase 3: Output
```

**After**:
```yaml
Phase 1: Discovery
Phase 2: Generation
Phase 2.5: QA Verification ← NEW
  - If score < 7: Reflection loop
  - If score >= 7: Continue
Phase 3: Output
```

---

## MCP Integration Patterns

### Skill + MCP Combinations

| Skill Domain | Recommended MCP | Integration |
|--------------|----------------|-------------|
| SEO | Playwright | Live page screenshot, metrics |
| Testing | GitHub | PR status, CI integration |
| Documentation | Memory | Persist style decisions |
| Security | GitHub | Dependency alerts |
| Performance | Playwright | Core Web Vitals measurement |

### Integration Example

```yaml
# seo/agents/performance-analyzer.md
---
name: Performance Analyzer
model: haiku
tools: Read, mcp__plugin_playwright
---

Uses Playwright to:
1. Navigate to URL
2. Measure Core Web Vitals (LCP, FID, CLS)
3. Take screenshot
4. Report metrics with benchmarks
```

---

## Enhancement Detection Algorithm

```
FOR each skill IN current_skills:
    score = 0

    # Check domain complexity
    IF skill.domain IN [seo, security, testing, review]:
        score += 1

    # Check for parallelizable work
    IF skill.has_multiple_concerns:
        score += 1

    # Check for sequential phases
    IF skill.has_workflow_phases:
        score += 1

    # Check for MCP opportunities
    IF skill.could_benefit_from_mcp:
        score += 1

    # Check for verification needs
    IF skill.needs_validation:
        score += 1

    IF score >= 3:
        RECOMMEND active skill conversion with:
            - Suggested workflows
            - Suggested agents
            - MCP integrations
            - Effort estimate
            - Impact assessment
```

---

## Priority Matrix

| Enhancement Type | Effort | Impact | Priority |
|-----------------|--------|--------|----------|
| Add workflow to passive skill | Medium | High | P1 |
| Add dedicated agents | Medium | High | P1 |
| Add MCP integration | Low | Medium | P1 |
| Add QA gate | Low | High | P0 |
| Split monolithic agent | Medium | Medium | P2 |
| Add sub-commands | Low | Medium | P2 |

---

## Output Format for Recommendations

```markdown
## Skill Enhancement: [skill-name]

### Current State
- Type: Passive / Active
- Files: [count]
- Has workflows: Yes/No
- Has agents: Yes/No

### Enhancement Opportunity
**Recommendation**: Convert to Active Skill

#### Suggested Structure
```
.claude/skills/[skill-name]/
├── SKILL.md (existing)
├── workflows/
│   └── [suggested-workflow].md
└── agents/
    ├── [agent-1].md
    └── [agent-2].md
```

#### Suggested Agents
| Agent | Model | Purpose |
|-------|-------|---------|
| [name] | haiku/sonnet | [purpose] |

#### MCP Integrations
| MCP | Benefit |
|-----|---------|
| [name] | [how it helps] |

#### Effort/Impact
- **Effort**: Low/Medium/High
- **Impact**: Low/Medium/High
- **Priority**: P0/P1/P2
```

---

## Sources

- [Anthropic Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [wshobson/agents](https://github.com/wshobson/agents) - Multi-agent patterns
- [alexop.dev](https://alexop.dev/posts/understanding-claude-code-full-stack/) - Skills architecture
- [Anthropic Multi-Agent Systems](https://www.anthropic.com/engineering/multi-agent-research-system)
