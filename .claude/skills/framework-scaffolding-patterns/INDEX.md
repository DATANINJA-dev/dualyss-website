# Framework Scaffolding Patterns Skill - Navigation Guide

Complete reference for framework scaffolding patterns synthesized from industry tools.

---

## Quick Navigation

### By Use Case

**"I'm starting a new project"**
- Start: [SKILL.md - Part 1: Context Detection](SKILL.md#part-1-context-detection-patterns)
- Deep dive: [context-detection-patterns.md - File-Based Detection](context-detection-patterns.md#file-based-detection-strategies)

**"I'm designing a template for others"**
- Start: [SKILL.md - Part 2: Template Organization](SKILL.md#part-2-scaffolding-template-organization)
- Deep dive: [template-organization.md](template-organization.md)

**"I'm updating an existing project"**
- Start: [SKILL.md - Part 3: Migration Strategies](SKILL.md#part-3-migration-strategies)
- Deep dive: [migration-strategies.md](migration-strategies.md)

**"I want to understand industry best practices"**
- Start: [SKILL.md - Part 7: Best Practices Summary](SKILL.md#part-7-best-practices-summary)
- Deep dive: [RESEARCH-SYNTHESIS.md](RESEARCH-SYNTHESIS.md)

---

### By Concept

**Context Detection**
| Concept | Location |
|---------|----------|
| File marker pattern | [SKILL.md 1.1](SKILL.md#11-file-based-project-detection) |
| Configuration parsing | [SKILL.md 1.2](SKILL.md#12-configuration-based-detection) |
| Signal-based detection | [SKILL.md 1.3](SKILL.md#13-signal-based-audiencescale-detection) |
| State analysis | [SKILL.md 1.4](SKILL.md#14-state-analysis-for-updates) |
| Implementation example | [context-detection-patterns.md](context-detection-patterns.md#implementation-example-claude-code-detection) |

**Template Organization**
| Concept | Location |
|---------|----------|
| Yeoman structure | [SKILL.md 2.1](SKILL.md#21-template-directory-structure) |
| Copier structure | [SKILL.md 2.1](SKILL.md#21-template-directory-structure) |
| Cookiecutter structure | [SKILL.md 2.1](SKILL.md#21-template-directory-structure) |
| Variables and context | [SKILL.md 2.2](SKILL.md#22-template-variables-and-context) |
| Variable persistence | [SKILL.md 2.3](SKILL.md#23-template-variable-persistence) |
| Complete examples | [template-organization.md - Examples](template-organization.md#examples-complete-variable-systems) |

**Migration Strategies**
| Concept | Location |
|---------|----------|
| Linked projects | [SKILL.md 3.1](SKILL.md#31-linked-project-pattern-existing--template) |
| Pre/post hooks | [SKILL.md 3.2](SKILL.md#32-pre-post-generation-hooks) |
| Conditional prompts | [SKILL.md 3.3](SKILL.md#33-smart-question-filtering-conditional-prompts) |
| Version validation | [SKILL.md 3.4](SKILL.md#34-version-compatibility-validation) |
| Migration hooks | [SKILL.md 3.5](SKILL.md#35-migration-tasks-and-hooks) |
| Implementation details | [migration-strategies.md](migration-strategies.md) |

**Lifecycle Methods**
| Concept | Location |
|---------|----------|
| Yeoman lifecycle | [SKILL.md 4.1](SKILL.md#41-yeoman-generator-methods) |
| Copier tasks | [SKILL.md 4.2](SKILL.md#42-copier-task-execution) |

**Validation and Quality**
| Concept | Location |
|---------|----------|
| Answer validation | [SKILL.md 6.1](SKILL.md#61-answer-validation) |
| Integrity checks | [SKILL.md 6.2](SKILL.md#62-integrity-checks) |

---

### By Industry Tool

**Yeoman**
- Governance: Explicit lifecycle methods (initializing → end)
- Best for: JavaScript/Node.js projects
- Key files: generator-name/package.json, generators/app/index.js
- References: [SKILL.md 2.1](SKILL.md#21-template-directory-structure), [SKILL.md 4.1](SKILL.md#41-yeoman-generator-methods)

**Copier**
- Governance: YAML configuration (copier.yml)
- Best for: Python projects, modern Python ecosystem
- Key files: copier.yml, .copier/tasks_*.py, .copier/migrations.py
- References: [SKILL.md 1.2](SKILL.md#12-configuration-based-detection), [SKILL.md 2.1](SKILL.md#21-template-directory-structure), [SKILL.md 2.3](SKILL.md#23-template-variable-persistence)

**Cookiecutter**
- Governance: JSON configuration (cookiecutter.json)
- Best for: Language-agnostic, simple templates
- Key files: cookiecutter.json, hooks/pre_gen_project.py
- References: [SKILL.md 2.1](SKILL.md#21-template-directory-structure), [SKILL.md 3.2](SKILL.md#32-pre-post-generation-hooks)

**Cruft**
- Governance: Updates and version management on top of Cookiecutter
- Best for: Maintaining template-generated projects
- Key files: .cruft.json
- References: [SKILL.md 3.1](SKILL.md#31-linked-project-pattern-existing--template), [migration-strategies.md - Linking Patterns](migration-strategies.md#linking-existing-projects-to-templates)

**create-next-app / create-react-app**
- Governance: Zero-config defaults with smart detection
- Best for: React/Next.js zero-config setup
- Key features: Automatic TypeScript detection, interactive prompts, sensible defaults
- References: [SKILL.md 1.3](SKILL.md#13-signal-based-audiencescale-detection)

---

## Document Map

```
SKILL.md (Main reference, 7 parts)
├── Part 1: Context Detection
├── Part 2: Template Organization
├── Part 3: Migration Strategies
├── Part 4: Generator Lifecycle Methods
├── Part 5: Project Detection
├── Part 6: Validation and Quality
└── Part 7: Best Practices Summary

context-detection-patterns.md (Deep reference)
├── File-Based Detection
├── Signal-Based Detection
├── Dynamic Context Variables
├── Project State Snapshots
├── Implementation Example
└── Failure Modes

template-organization.md (Deep reference)
├── Directory Structures (Yeoman/Copier/Cookiecutter)
├── Variable Definitions
├── Variable Scope
├── Type System
├── Conditional Variables
├── Variable Persistence
├── Filtering & Transformations
└── Examples

migration-strategies.md (Deep reference)
├── Linking Projects
├── Pre/Post Hooks
├── Version Compatibility
├── Migrations & Transformations
├── Conflict Detection
└── Update Strategies

RESEARCH-SYNTHESIS.md (Meta-documentation)
├── Research Overview
├── Pattern Categories
├── Convergence/Divergence Points
├── Recommendations
├── Design Decisions
├── Lessons Applied
├── Risk Analysis
└── Implementation Checklist

INDEX.md (This file)
└── Navigation guide
```

---

## Reading Paths

### Path 1: "I want to understand scaffolding in 15 minutes"
1. This INDEX (5 min)
2. [SKILL.md - Best Practices Summary](SKILL.md#part-7-best-practices-summary) (10 min)

**Outcome**: Understand core principles and common pitfalls

### Path 2: "I'm implementing `/sync-add` for Claude Code"
1. [SKILL.md - Part 1: Context Detection](SKILL.md#part-1-context-detection-patterns) (10 min)
2. [SKILL.md - Part 2: Template Organization](SKILL.md#part-2-scaffolding-template-organization) (15 min)
3. [context-detection-patterns.md - Implementation Example](context-detection-patterns.md#implementation-example-claude-code-detection) (10 min)
4. [template-organization.md - Examples](template-organization.md#examples-complete-variable-systems) (20 min)

**Outcome**: Ready to implement initial installation command

### Path 3: "I'm implementing `/sync-pull` with conflict detection"
1. [SKILL.md - Part 3: Migration Strategies](SKILL.md#part-3-migration-strategies) (20 min)
2. [migration-strategies.md - Conflict Detection](migration-strategies.md#smart-diff-and-conflict-detection) (15 min)
3. [migration-strategies.md - Update Strategies](migration-strategies.md#update-strategies-for-different-project-types) (10 min)

**Outcome**: Understand conflict detection and merge strategies

### Path 4: "I'm building a framework template for others"
1. [SKILL.md - Part 2: Template Organization](SKILL.md#part-2-scaffolding-template-organization) (20 min)
2. [template-organization.md](template-organization.md) (full, 40 min)
3. [SKILL.md - Part 6: Validation and Quality](SKILL.md#part-6-validation-and-quality-patterns) (15 min)
4. [migration-strategies.md - Hooks](migration-strategies.md#prepost-generation-hooks) (20 min)

**Outcome**: Ready to design and implement template

### Path 5: "I want complete mastery"
1. Read all documents in order:
   - SKILL.md (executive summary)
   - context-detection-patterns.md (deep detection)
   - template-organization.md (deep organization)
   - migration-strategies.md (deep migrations)
   - RESEARCH-SYNTHESIS.md (meta-analysis)

**Outcome**: Expert-level understanding, ready to advise others

---

## Key Diagrams

### Scaffolding Workflow
```
User invokes scaffolding
    ↓
[1.0] Detect context (existing project?)
    ├─→ No: New project path
    └─→ Yes: Update/migration path
    ↓
[1.5] Load previous state (if exists)
    ├─→ Found: Use as defaults
    └─→ Not found: Use template defaults
    ↓
[2.0] Ask questions (with conditionals)
    ↓
[3.0] Validate answers (pre-generation hook)
    ├─→ Invalid: Show errors, ask again
    └─→ Valid: Continue
    ↓
[4.0] Render templates (Jinja2)
    ↓
[5.0] Write files to disk
    ├─→ New project: All files
    └─→ Existing: Merge with conflict detection
    ↓
[6.0] Post-generation hook (setup tasks)
    ├─→ Git init, dependency install, etc.
    ↓
[7.0] Save answers file for future updates
    ↓
Done
```

### Conflict Resolution Flow
```
User runs /sync-pull
    ↓
[1.0] Load watermark (previous sync state)
    ↓
[1.5] Detect conflicts (BEFORE pulling)
    ├─→ No conflicts: Continue to [2.0]
    └─→ Conflicts found:
        ├─→ Show: file, type, severity
        ├─→ Ask: (K)eep hub, (L)eep local, (M)anual, (A)bort
        └─→ Resume from [2.0] with chosen resolution
    ↓
[2.0] Fetch template updates
    ↓
[3.0] Run migrations (version transforms)
    ↓
[4.0] Merge changes (smart update)
    ├─→ Checksum match: Update
    ├─→ Checksum differs: Keep local
    ├─→ Conflict: Show diff, ask user
    ↓
[4.5] Update watermark
    ↓
[5.0] Run post-update hooks
    ↓
Done
```

---

## Common Questions Answered

**Q: Where do I find the context detection algorithm?**
A: [context-detection-patterns.md - Signal Weighting Algorithm](context-detection-patterns.md#signal-weighting-algorithm)

**Q: How do I make questions conditional?**
A: [template-organization.md - Conditional Variables](template-organization.md#conditional-variables-and-progressive-disclosure)

**Q: What's the difference between Copier and Cookiecutter?**
A: [RESEARCH-SYNTHESIS.md - Divergence Points](RESEARCH-SYNTHESIS.md#divergence-points-tool-specific)

**Q: How do I prevent user customizations from being lost during updates?**
A: [migration-strategies.md - Checksum-Based Updates](migration-strategies.md#strategy-3-checksum-based-updates-unchanged-files)

**Q: What are the breaking change patterns?**
A: [migration-strategies.md - Breaking Change Handling](migration-strategies.md#breaking-change-handling)

**Q: How do I validate the framework installation?**
A: [SKILL.md - Part 6: Integrity Checks](SKILL.md#62-integrity-checks)

**Q: What's the complete lifecycle from first run to update?**
A: [Scaffolding Workflow diagram](#key-diagrams) in this file

---

## Related Skills

- **git-sync-patterns**: Watermark tracking, conflict detection workflows
- **error-handling**: Standardized error codes and messages
- **tdd-workflow**: Testing patterns during development
- **research-methodology**: Web research for framework decisions

---

## Contributing to This Skill

Found a pattern we missed? See a tool we should include? Have an implementation example?

Updates to this skill should:
1. Cite sources (links to official documentation)
2. Include concrete code examples
3. Relate back to Claude Code use cases
4. Follow existing documentation structure

See [SKILL.md - Best Practices](SKILL.md#71-design-principles) for quality standards.

---

## Glossary

| Term | Definition |
|------|-----------|
| **Answers File** | File storing user responses for future updates (e.g., `.copier-answers.yml`) |
| **Context** | Project state, user preferences, environment variables |
| **Hook** | Script executed at specific lifecycle stage (pre/post generation) |
| **Jinja2** | Python templating language used by Copier and Cookiecutter |
| **Marker File** | File indicating project root or framework installation (e.g., `.yo-rc.json`) |
| **Migration** | Version-based transformation of user answers or template files |
| **Scaffold** | Generate project structure from templates |
| **Signal** | Indicator of project characteristics (git contributors, CI/CD presence, etc.) |
| **Template** | Source project with variable placeholders |
| **Watermark** | Metadata tracking last sync state (hub version, local version, timestamp) |

---

**Skill Version**: 0.31.0 (matches framework version)
**Last Updated**: 2026-01-10
**Status**: Ready for implementation
**Target Task**: TASK-087
