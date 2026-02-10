# Domain Depth Evaluation Methodology

How the `/audit` system evaluates domain expertise coverage.

## Philosophy

Domain depth is evaluated **dynamically through research**, not through static checklists. This ensures:

- **Any domain** can be evaluated (SEO, content writing, API design, etc.)
- **Standards stay current** with industry evolution
- **No manual maintenance** of domain-specific checklists
- **Consistent evaluation** across different domains

## When Domain Depth Applies

### Applicable To:

- **Agents** with a clear domain focus
  - SEO agents, security agents, UX agents
  - Testing agents, performance agents
  - Any agent that analyzes a specific professional domain

- **Commands** that orchestrate domain-specific agents
  - `/set-up` (orchestrates 7 domain agents)
  - Domain-specific audit commands

### NOT Applicable To:

- **Generic utility agents**
  - File readers, formatters
  - List generators, status reporters

- **Infrastructure commands**
  - `/list-tasks`, `/update-task`
  - `/list-epics`

- **Meta-audit agents**
  - `audit-command-analyzer` (evaluates structure, not domain)
  - `audit-qa` (synthesizes scores)

## Research Process

The `audit-domain-researcher` agent:

1. **Identifies the domain** from agent metadata (name, purpose, steps)
2. **Searches** for "[domain] comprehensive checklist [year]"
3. **Evaluates sources** using research-methodology skill
4. **Builds checklist** from authoritative sources
5. **Compares coverage** against agent content
6. **Scores** percentage covered

## Integration with Audit Scoring

### New Weight Distribution

| Dimension | Weight | Evaluates |
|-----------|--------|-----------|
| Structure | 20% | Frontmatter, phases, organization |
| Best Practices | 25% | QA patterns, reflection, parallelization |
| Tool Security | 15% | Minimal permissions, restrictions |
| Completeness | 15% | All sections filled |
| Integration | 10% | Ecosystem fit |
| **Domain Depth** | **15%** | Research-based domain coverage |

### Domain Depth Score Interpretation

| Coverage % | Score | Verdict |
|------------|-------|---------|
| >= 80% | 8.0-10.0 | COMPREHENSIVE |
| 60-79% | 6.0-7.9 | GOOD |
| 40-59% | 4.0-5.9 | PARTIAL |
| < 40% | 1.0-3.9 | SUPERFICIAL |

### Impact on Overall Score

**Example Calculation:**

| Dimension | Score | Weight | Contribution |
|-----------|-------|--------|--------------|
| Structure | 9.0 | 20% | 1.80 |
| Best Practices | 9.0 | 25% | 2.25 |
| Tool Security | 8.0 | 15% | 1.20 |
| Completeness | 9.0 | 15% | 1.35 |
| Integration | 8.5 | 10% | 0.85 |
| Domain Depth | 6.0 | 15% | 0.90 |
| **Total** | | **100%** | **8.35** |

Without domain depth, this would have scored ~8.7. The partial domain coverage pulls the score down appropriately.

## Unknown Domains

If the domain cannot be identified or researched:

- **Domain depth score** = 5.0 (neutral)
- **Verdict** = "DOMAIN_UNCLEAR"
- **Action** = No penalty or bonus applied
- **Note** = "Unable to evaluate domain depth for this component"

This ensures that:
1. Utility agents aren't unfairly penalized
2. Niche domains don't cause score drops
3. The limitation is transparently documented

## Audit Flow Integration

```
audit.md command
    │
    ├── Phase 2: Run analyzers in parallel
    │   ├── audit-command-analyzer (structure, patterns)
    │   ├── audit-agent-analyzer (structure, patterns)
    │   │   └── IF domain-focused agent THEN
    │   │       └── delegate to audit-domain-researcher
    │   │           └── Returns domain depth score
    │   ├── audit-skill-analyzer
    │   └── audit-hook-analyzer
    │
    └── Phase 2.5: QA Synthesis
        └── Includes domain depth in composite score
```

## Agent Analyzer Delegation

The `audit-agent-analyzer` determines when to invoke domain research:

**Trigger conditions:**
- Agent name contains domain keywords (seo, security, ux, test, etc.)
- Agent purpose mentions analyzing a specific domain
- Agent steps include domain-specific evaluations

**Delegation:**
```markdown
9. **Domain depth analysis** (if applicable)
   - IF agent appears domain-focused:
     - Launch audit-domain-researcher
     - Pass agent content
     - Receive domain depth score and analysis
     - Include in final report
   - ELSE:
     - Note "Domain depth: N/A (utility agent)"
     - Do not penalize
```

## Continuous Improvement

Because research is performed live:

- **No checklist maintenance** required
- **Industry evolution** automatically captured
- **New domains** work immediately
- **Standards changes** reflected in next audit

## Constraints

- Max 3 web searches per domain evaluation
- Prefer current year sources
- Cache not persistent across sessions
- Human judgment still recommended for edge cases
