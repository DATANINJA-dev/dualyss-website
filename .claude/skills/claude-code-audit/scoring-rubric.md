# Scoring Rubric

Detailed criteria for 1-10 scoring across all dimensions.

## Structure Score (15% weight)

### Commands

| Score | Criteria |
|-------|----------|
| 10 | Perfect frontmatter (description, allowed-tools, argument-hint), clear phases, explicit constraints, error handling, critical rules |
| 9 | All required elements, one minor gap (e.g., missing argument-hint when not needed) |
| 8 | Strong structure, clear organization, minor polish needed |
| 7 | Good structure, some sections could be clearer |
| 6 | Basic structure present, organization adequate |
| 5 | Frontmatter valid but incomplete, unclear phases |
| 4 | Frontmatter issues, poor organization |
| 3 | Missing required fields, no clear structure |
| 2 | Minimal structure, hard to follow |
| 1 | No discernible structure |

### Agents

| Score | Criteria |
|-------|----------|
| 10 | Complete frontmatter (name, description, model, tools), Purpose, Inputs, Steps, Output, Constraints |
| 9 | All sections present, minor formatting gaps |
| 8 | Strong structure, clear flow |
| 7 | Good structure, some sections brief |
| 6 | Basic structure, missing optional sections |
| 5 | Core sections present but unpolished |
| 4 | Missing required sections |
| 3 | Frontmatter incomplete |
| 2 | Minimal structure |
| 1 | No structure |

### Skills

| Score | Criteria |
|-------|----------|
| 10 | SKILL.md complete, all supporting files present, clear activation, comprehensive |
| 9 | Complete with minor gaps |
| 8 | Strong skill definition |
| 7 | Good structure, some files sparse |
| 6 | Basic SKILL.md, limited supporting files |
| 5 | SKILL.md present but incomplete |
| 4 | Missing supporting files |
| 3 | SKILL.md barely valid |
| 2 | Minimal structure |
| 1 | Invalid skill |

### Hooks

| Score | Criteria |
|-------|----------|
| 10 | Valid frontmatter (event, matcher), trigger conditions, validation checks, output format, failure handling |
| 9 | Complete with minor gaps |
| 8 | Strong hook definition |
| 7 | Good structure |
| 6 | Basic structure |
| 5 | Frontmatter valid, content sparse |
| 4 | Missing sections |
| 3 | Frontmatter issues |
| 2 | Minimal |
| 1 | Invalid |

---

## Best Practices Score (20% weight)

### Commands

| Score | Patterns Present |
|-------|------------------|
| 10 | All: input validation, phases, QA, reflection loop, parallelization, human-in-loop, extended thinking, checkpoints, metadata, file op actionability |
| 9 | 9 of 10 patterns |
| 8 | 8 of 10 patterns |
| 7 | 7 of 10 patterns (all essential) |
| 6 | 6 of 10 patterns |
| 5 | 5 of 10 patterns (core only) |
| 4 | 4 of 10 patterns |
| 3 | 3 of 10 patterns |
| 2 | 1-2 patterns |
| 1 | No patterns |

**Essential patterns** (required for 7+): Input validation, phased instructions, error handling, critical rules, file op actionability

**Advanced patterns** (for 8+): QA phase, reflection loop, parallelization, human-in-loop

### Agents

| Score | Patterns Present |
|-------|------------------|
| 10 | Purpose, Inputs, Steps, Output format, Constraints, correct model, minimal tools, scoring system, actionable output |
| 9 | 8 of 9 |
| 8 | 7 of 9 |
| 7 | 6 of 9 (all essential) |
| 6 | 5 of 9 |
| 5 | 4 of 9 |
| 4 | 3 of 9 |
| 3 | 2 of 9 |
| 2 | 1 |
| 1 | None |

### Skills

| Score | Patterns Present |
|-------|------------------|
| 10 | SKILL.md, activation triggers, supporting files, principles, constraints, usage examples, not overly broad |
| 9 | 6 of 7 |
| 8 | 5 of 7 |
| 7 | 4 of 7 |
| 6 | 3 of 7 |
| 5 | 2 of 7 |
| 4 | 1 of 7 |
| 3-1 | SKILL.md only or less |

**Bonus: Active Skills Pattern**
- **+1** to Best Practices score if skill has `workflows/` and/or `agents/` subdirectories
- Must have at least 1 workflow OR 1 agent to qualify
- Workflows must follow command structure (frontmatter, phases, instructions)
- Agents must follow agent frontmatter patterns (name, description, model, tools)

Active skills are "procedural packages" that can execute workflows with embedded agents, enabling domain-specific multi-agent verification. See gap-patterns.md for examples.

### Hooks

| Score | Patterns Present |
|-------|------------------|
| 10 | Valid event, specific matcher, trigger docs, validation checks, output format, failure handling, no over-triggering |
| 9 | 6 of 7 |
| 8 | 5 of 7 |
| 7 | 4 of 7 |
| 6 | 3 of 7 |
| 5 | 2 of 7 |
| 4-1 | Fewer |

---

## Tool Security Score (15% weight)

| Score | Criteria |
|-------|----------|
| 10 | Minimal required tools only, specific Bash restrictions, path constraints documented, justified permissions |
| 9 | Good restrictions, one minor over-permission |
| 8 | Reasonable tools, could be slightly tighter |
| 7 | Appropriate for purpose, some broad access |
| 6 | Slightly over-permissive |
| 5 | More tools than needed |
| 4 | Significantly over-permissive |
| 3 | Blanket access to dangerous tools |
| 2 | No restrictions documented |
| 1 | Dangerous permissions, no justification |

### Tool Risk Levels

| Tool | Risk | Justification Required |
|------|------|------------------------|
| Read, Glob, Grep | Low | No |
| Task, AskUserQuestion | Low | No |
| Write, Edit | Medium | Yes - what paths |
| Bash | High | Yes - what commands |
| mcp__* | Medium | Yes - why needed |

---

## Completeness Score (15% weight)

| Score | Criteria |
|-------|----------|
| 10 | All sections filled, no placeholders, comprehensive content, examples where helpful |
| 9 | Complete, minor gaps in optional sections |
| 8 | All required content, some optional sparse |
| 7 | Good coverage, some sections brief |
| 6 | Required sections present, optional missing |
| 5 | Core content only |
| 4 | Some required content missing |
| 3 | Significant gaps |
| 2 | Mostly empty/placeholder |
| 1 | Barely any content |

### Placeholder Detection

Penalize presence of:
- `{{PLACEHOLDER}}`
- `[TBD]`, `[TODO]`, `[PENDING]`
- `...` in code blocks
- `[description]`, `[value]`
- Empty sections with just headers

---

## Integration Score (10% weight)

| Score | Criteria |
|-------|----------|
| 10 | Uses existing patterns, references other components correctly, fits ecosystem perfectly |
| 9 | Strong integration, minor alignment gaps |
| 8 | Good integration, follows conventions |
| 7 | Works with system, some inconsistencies |
| 6 | Standalone but compatible |
| 5 | Limited integration |
| 4 | Inconsistent with framework |
| 3 | Conflicts with existing patterns |
| 2 | Breaks conventions |
| 1 | Incompatible |

### Integration Checks

- References valid files/agents
- Uses consistent naming conventions
- Output format compatible with consumers
- Follows established model selection
- Respects existing tool patterns

---

## Domain Depth Score (10% weight)

**Applies to**: Domain-focused agents only (SEO, security, UX, testing, etc.)
**Not applicable to**: Utility agents, infrastructure commands

Domain depth is evaluated dynamically through web research. The `audit-domain-researcher` agent:
1. Identifies the agent's domain
2. Researches comprehensive checklists for that domain
3. Compares agent coverage against research findings
4. Scores the coverage percentage

| Score | Coverage | Verdict |
|-------|----------|---------|
| 9-10 | >= 80% | COMPREHENSIVE - Agent thoroughly covers the domain |
| 7-8 | 60-79% | GOOD - Agent covers most important aspects |
| 5-6 | 40-59% | PARTIAL - Agent covers basics but misses significant areas |
| 3-4 | 20-39% | SUPERFICIAL - Agent only scratches the surface |
| 1-2 | < 20% | INADEQUATE - Agent barely addresses the domain |

### Domain Depth Evaluation Process

1. **Domain identification** from agent name/purpose
2. **Web research** using research-methodology skill
3. **Checklist synthesis** from authoritative sources
4. **Coverage comparison** against agent content
5. **Score calculation**: `(covered + partial×0.5) / total × 10`

### When Domain Depth is N/A

For non-domain-focused components:
- Score = 5.0 (neutral)
- Verdict = "DOMAIN_N/A"
- No penalty or bonus applied

### Research Quality Indicators

A valid domain depth evaluation requires:
- 3+ sources consulted
- Average source quality >= 5.0
- 20-35 checklist items generated
- Clear category structure

If research fails or is insufficient:
- Score = 5.0 (neutral)
- Verdict = "UNABLE_TO_RESEARCH"
- Flag for manual review

---

## Dependency Health Score (15% weight)

**Applies to**: All components in dependency graph
**Evaluated by**: audit-dependency-analyzer.md

| Score | Criteria | Indicators |
|-------|----------|------------|
| 10 | All chains healthy | No broken links, no circular deps, <5% orphans, optimal depth (2-4) |
| 9 | Minor issues | 1-2 orphans, all links valid, depth acceptable |
| 8 | Good health | <10% orphans, no circular deps, minor depth issues |
| 7 | Acceptable | Some orphans, minor depth issues, all links valid |
| 6 | Needs attention | 1 broken link OR 10-20% orphans |
| 5 | Moderate issues | 2-3 broken links, some shallow chains |
| 4 | Significant issues | Multiple broken links, circular dep detected |
| 3 | Poor health | 5+ broken links, high orphan rate (>25%) |
| 2 | Critical issues | Many broken links, complex circular deps |
| 1 | Unhealthy graph | Graph analysis fails, severe structural issues |

### Dependency Health Sub-Metrics

| Sub-Metric | Weight | Description |
|------------|--------|-------------|
| Link Validity | 30% | % of valid references (target exists) |
| Circular Deps | 25% | Deduct per cycle detected |
| Orphan Rate | 15% | % of unreferenced components |
| Chain Depth | 15% | Optimal 2-4 levels, penalize extremes |
| Chain Coverage | 15% | % of MCPs reached through agent chains |

### Dependency Health Calculation

```
link_score = (valid_links / total_references) × 10
circular_score = 10 - (circular_deps × 2)  # min 0
orphan_score = 10 - (orphan_rate × 10)     # e.g., 20% orphans = 8.0
depth_score = 10 if optimal else 10 - |depth - 3| × 2
coverage_score = (connected_mcps / total_mcps) × 10

DependencyHealth = (link × 0.30) + (circular × 0.25) +
                   (orphan × 0.15) + (depth × 0.15) +
                   (coverage × 0.15)
```

### When Dependency Health is N/A

For projects with fewer than 3 components:
- Score = 5.0 (neutral)
- Verdict = "DEPENDENCY_N/A"
- No penalty or bonus applied

### Chain Health Indicators

**Critical Issues** (blocking):
- Any broken link to non-existent component
- Circular dependency detected

**Warnings**:
- Orphan rate > 15%
- Chain depth > 4 or < 2
- MCP coverage < 50%

**Info**:
- Shallow chains (command → MCP direct)
- Deep chains (5+ levels)
- Unused skills

---

## Composite Score Calculation

```
Composite = (Structure × 0.15) + (BestPractices × 0.20) +
            (ToolSecurity × 0.15) + (Completeness × 0.15) +
            (Integration × 0.10) + (DomainDepth × 0.10) +
            (DependencyHealth × 0.15)
```

**Weight Distribution** (v0.15.0):
| Dimension | Weight | Notes |
|-----------|--------|-------|
| Structure | 15% | Reduced from 20% |
| Best Practices | 20% | Reduced from 25% |
| Tool Security | 15% | Unchanged |
| Completeness | 15% | Unchanged |
| Integration | 10% | Unchanged |
| Domain Depth | 10% | Reduced from 15% |
| Dependency Health | 15% | **NEW** |

Note: For non-domain components, Domain Depth = 5.0 (neutral). For projects with <3 components, Dependency Health = 5.0 (neutral).

### Example: Domain-Focused Agent

| Dimension | Score | Weight | Contribution |
|-----------|-------|--------|--------------|
| Structure | 9.0 | 15% | 1.35 |
| Best Practices | 9.0 | 20% | 1.80 |
| Tool Security | 8.0 | 15% | 1.20 |
| Completeness | 9.0 | 15% | 1.35 |
| Integration | 8.5 | 10% | 0.85 |
| Domain Depth | 7.0 | 10% | 0.70 |
| Dependency Health | 8.0 | 15% | 1.20 |
| **Composite** | | 100% | **8.45** |

**Verdict**: EXCELLENT (>= 8.0)

### Example: Utility Agent (Domain N/A, Few Dependencies)

| Dimension | Score | Weight | Contribution |
|-----------|-------|--------|--------------|
| Structure | 8.0 | 15% | 1.20 |
| Best Practices | 7.0 | 20% | 1.40 |
| Tool Security | 9.0 | 15% | 1.35 |
| Completeness | 7.5 | 15% | 1.13 |
| Integration | 8.0 | 10% | 0.80 |
| Domain Depth | 5.0 | 10% | 0.50 |
| Dependency Health | 5.0 | 15% | 0.75 |
| **Composite** | | 100% | **7.13** |

**Verdict**: GOOD (7.0-7.9 range) - Domain depth and dependency health neutral as expected

### Example: Complex Command with Dependencies

| Dimension | Score | Weight | Contribution |
|-----------|-------|--------|--------------|
| Structure | 9.0 | 15% | 1.35 |
| Best Practices | 8.5 | 20% | 1.70 |
| Tool Security | 8.0 | 15% | 1.20 |
| Completeness | 8.5 | 15% | 1.28 |
| Integration | 9.0 | 10% | 0.90 |
| Domain Depth | 5.0 | 10% | 0.50 |
| Dependency Health | 9.5 | 15% | 1.43 |
| **Composite** | | 100% | **8.36** |

**Verdict**: EXCELLENT - Strong dependency chain management
