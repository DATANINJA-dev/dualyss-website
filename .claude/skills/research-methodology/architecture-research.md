# Architecture Research Guidelines

How to research reference architectures when proposing system-level solutions.

## Purpose

When the audit-solution-architect proposes new components (agents, skills, commands, hooks), it should research existing patterns to ensure proposals follow industry best practices.

---

## Query Patterns for Solution Research

### For New Active Skills

Search for multi-agent workflow patterns:

```
1. "[domain] multi-agent workflow architecture"
2. "[domain] Claude Code skill example"
3. "[domain] parallel analysis pattern"
4. "[domain] automated [domain] workflow"
```

**Examples**:
- "SEO multi-agent workflow architecture"
- "security audit parallel analysis pattern"
- "testing automated testing workflow"

### For New Specialist Agents

Search for category-specific automation:

```
1. "[domain] [category] analyzer agent"
2. "[domain] [category] best practices automation"
3. "Claude Code [category] agent example"
4. "[category] analysis checklist automated"
```

**Examples**:
- "SEO keyword analyzer agent"
- "security authentication best practices automation"
- "Claude Code performance agent example"

### For New QA/Synthesis Agents

Search for verification patterns:

```
1. "[domain] quality assurance synthesis"
2. "[domain] multi-agent verification pattern"
3. "Claude Code QA agent pattern"
4. "[domain] analysis scoring rubric"
```

### For New Hooks

Search for validation patterns:

```
1. "[domain] validation hook pattern"
2. "pre-commit [domain] validation"
3. "Claude Code hook [event] example"
4. "[domain] automated gatekeeping"
```

### For New Commands

Search for orchestration patterns:

```
1. "[domain] workflow orchestration"
2. "Claude Code [domain] command example"
3. "[domain] multi-step automation"
4. "[domain] CLI workflow pattern"
```

---

## Source Prioritization

Rate sources by reliability for architecture patterns:

### Tier 1: Authoritative (Weight: 1.0)
- **Anthropic official**: docs.anthropic.com, anthropic.com/engineering
- **Claude Code documentation**: Official guides and examples
- **Standards bodies**: W3C, OWASP, ISO standards for domain

### Tier 2: Expert Community (Weight: 0.8)
- **claudelog.com**: Claude Code tutorials and patterns
- **awesome-claude-code**: Curated GitHub repositories
- **medianeth.dev**: Engineering guides
- **Recognized domain experts**: Authors with credentials

### Tier 3: Industry Patterns (Weight: 0.6)
- **Domain-specific automation**: Industry tools and workflows
- **CI/CD platforms**: GitHub Actions, GitLab CI patterns
- **Enterprise tools**: How professional tools solve similar problems

### Tier 4: General Reference (Weight: 0.4)
- **Stack Overflow**: Community patterns (verify quality)
- **Dev.to/Medium**: Technical blogs (check author credentials)
- **GitHub examples**: Open source implementations

---

## Extracting Architecture Patterns

From each quality source, extract:

### 1. Agent Structure
```markdown
- Agent count: [N agents for this domain]
- Agent names: [naming conventions used]
- Responsibilities: [what each agent handles]
- Model selection: [haiku/sonnet/opus and why]
```

### 2. Workflow Flow
```markdown
- Parallel vs Sequential: [which parts parallel]
- Dependencies: [what depends on what]
- Data flow: [how information passes between agents]
- Checkpoints: [where human review happens]
```

### 3. Integration Points
```markdown
- Entry point: [command that triggers workflow]
- Skill reference: [what knowledge is shared]
- Tool requirements: [tools each agent needs]
- Output format: [how results are structured]
```

### 4. Quality Patterns
```markdown
- QA gate: [how verification happens]
- Scoring: [how quality is measured]
- Reflection: [when/how re-analysis occurs]
- Thresholds: [pass/fail criteria]
```

---

## Research Output Format

When research is complete, structure findings as:

```markdown
## Architecture Research: [Domain]

### Sources Consulted
| Source | Tier | Relevance | Quality |
|--------|------|-----------|---------|
| [name/url] | 1-4 | High/Med/Low | X.X/10 |

### Common Patterns Found

#### Agent Architecture
- **Typical agent count**: [N]
- **Model distribution**: [X haiku, Y sonnet]
- **Naming convention**: [pattern observed]

#### Workflow Patterns
- **Parallel groups**: [what runs together]
- **Sequential dependencies**: [what must be ordered]
- **QA positioning**: [where verification happens]

#### Integration Patterns
- **Entry point style**: [command structure]
- **Skill usage**: [how skills are referenced]
- **Output contracts**: [expected formats]

### Recommended Architecture for [Domain]

Based on research, propose:

```
[Recommended structure diagram]
```

### Confidence Level
- **High**: 3+ Tier 1-2 sources agree
- **Medium**: 2 sources or Tier 3 sources
- **Low**: Single source or Tier 4 only
```

---

## Search Limits

To maintain efficiency:

- **Max searches per domain**: 3-5
- **Max sources to evaluate**: 5-7
- **Stop when**: 3+ sources show consistent patterns
- **Expand search**: Only if initial results sparse

---

## Handling No Results

If web search returns few relevant results:

1. **Broaden domain**: Search parent domain
   - "keyword analysis" → "SEO analysis"
   - "XSS detection" → "security analysis"

2. **Search for analogous domains**:
   - Similar complexity level
   - Similar agent count expectations
   - Similar workflow patterns

3. **Fall back to general patterns**:
   - Use solution-patterns.md defaults
   - Apply framework best practices
   - Note "Limited research available" in proposal

4. **Flag for human review**:
   - Mark proposal as "Research: LIMITED"
   - Recommend manual verification
   - Provide rationale for proposed structure

---

## Quality Indicators

A good architecture research output has:

- [ ] 3+ sources consulted
- [ ] At least 1 Tier 1-2 source
- [ ] Consistent patterns identified
- [ ] Model selection justified
- [ ] Workflow clearly described
- [ ] Integration points documented
- [ ] Confidence level stated
