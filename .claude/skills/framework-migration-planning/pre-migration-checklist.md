# Pre-Migration Checklist

## 1. Define Migration Goals
**Why are we migrating?**

Common goals:
- [ ] Improve developer experience (clearer naming, better workflow)
- [ ] Align with industry standards (agile terminology)
- [ ] Reduce technical debt (consolidate similar commands)
- [ ] Enable new features (new architecture required)
- [ ] Compliance (security, regulations)

**Success criteria**:
- Quantitative: DX score +0.5, adoption rate >80% in 6 months
- Qualitative: User satisfaction improved, fewer support tickets

## 2. Assess Current Environment
**What exists today?**

- [ ] Document all commands (name, purpose, flags, usage frequency)
- [ ] Map dependencies (which commands call others)
- [ ] Identify integrations (hooks, agents, skills that depend on commands)
- [ ] Review documentation (what needs updating)
- [ ] Analyze usage patterns (which commands are used most)

**Example for simon_tools**:
```
Commands:
- generate-epics (used 5x/week)
- generate-task (used 20x/week)
- set-up (used 15x/week) ← Target for renaming
- develop-task (used 12x/week)
- audit (used 2x/week)

Dependencies:
- generate-task depends on epic file structure
- set-up depends on task file format
- develop-task depends on set-up plan structure

Integrations:
- 3 hooks reference "set-up"
- 7 agents are invoked by set-up
- Documentation in CLAUDE.md, README.md, 47 task files
```

## 3. Conduct Data Discovery
**What data will be affected?**

- [ ] Identify all data formats (epic files, task files, indexes)
- [ ] Map data dependencies (what breaks if format changes)
- [ ] Assess data volume (how much to migrate)
- [ ] Backup strategy (how to rollback if needed)

**Example**:
- 4 epic files (EPIC-001 to EPIC-004)
- 47 task files (TASK-001 to TASK-047)
- epics.json, tasks.json indexes
- backlog/working/ temporary files

## 4. Map Dependencies
**What depends on what?**

Create dependency graph:
```
/set-up
  ├── Depends on: task file format (TASK-XXX.md)
  ├── Creates: Implementation Plan section
  ├── Invokes: 7 agents (code-impact, test, security, ux, integration, seo, design)
  ├── Used by: /develop-task (reads implementation plan)
  └── Referenced in:
      ├── CLAUDE.md (3 locations)
      ├── README.md (1 location)
      ├── 47 task files (metadata)
      └── develop-step-pre-commit.md hook
```

**Critical**: Migrate dependent components together to avoid breakage.

## 5. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Users don't adopt new naming | High | Medium | Provide aliases, deprecate gradually |
| Breaking existing workflows | Medium | High | Phased migration, backward compatibility |
| Documentation outdated | High | Low | Automated find-replace, review checklist |
| Data corruption | Low | Critical | Backup before migration, rollback plan |
| Integration failures | Medium | High | Test all hooks/agents, mock runs |

**Red Flags**:
- No rollback plan
- No backup strategy
- No user communication plan
- No testing environment

## 6. Develop Backup/Recovery Plans
**How do we undo if things go wrong?**

- [ ] Full backup before migration (git tag, data export)
- [ ] Rollback procedure documented
- [ ] Partial recovery plan (some changes succeed, others fail)
- [ ] Testing environment (don't test on production)

**Example Rollback**:
1. Restore git tag: `git reset --hard pre-migration-v0.23`
2. Restore data: Copy `backlog/` from backup
3. Notify users: "Migration rolled back, use old commands"
4. Post-mortem: What went wrong?

## 7. Conduct Mock Runs
**Practice before production**

- [ ] Clone production data to test environment
- [ ] Run migration scripts
- [ ] Validate results (data integrity, functionality)
- [ ] Measure duration (how long will production migration take?)
- [ ] Identify issues (fix before production run)

**Success criteria for mock run**:
- 100% data migrated successfully
- All commands work as expected
- No errors in logs
- Performance acceptable

## 8. Team Readiness Evaluation
**Are users ready for the change?**

- [ ] Assess skills needed for new workflow
- [ ] Identify capability gaps
- [ ] Provide training (docs, tutorials, examples)
- [ ] Build migration team (developers, docs, support)

**Training Checklist**:
- [ ] Migration guide published (MIGRATION.md)
- [ ] Video tutorial created (optional)
- [ ] FAQ updated (common questions)
- [ ] Support channel ready (Discord, GitHub Issues)

## 9. Communication Plan
**How do we tell users?**

- [ ] Pre-announcement (2 weeks before): "Migration coming, here's what's changing"
- [ ] Migration guide published (step-by-step instructions)
- [ ] Deprecation warnings (old commands show message)
- [ ] Announcement day (changelog, blog post, email)
- [ ] Post-migration support (FAQ, troubleshooting)

**Example Timeline**:
- T-14 days: Pre-announcement
- T-7 days: Migration guide published
- T-1 day: Final reminder
- T-0: Migration day
- T+1: Check-in, address issues
- T+7: Review adoption metrics
- T+30: Post-mortem, lessons learned

## 10. Success Metrics
**How do we know if migration succeeded?**

- [ ] Migration completion rate: % of users migrated
- [ ] Adoption rate: % using new commands
- [ ] Time to proficiency: How long until productive
- [ ] Error/support ticket rates: Are users struggling?
- [ ] User satisfaction: Survey scores

**Targets**:
- Week 1: 20% adoption
- Week 4: 60% adoption
- Week 12: 90% adoption
- Week 26: 100% adoption, old commands deprecated

## Sources

- [Plan Your Migration (Microsoft Cloud Adoption Framework)](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/plan-migration)
- [Data Migration Framework & Best Practices](https://medium.com/@cevvavijay/data-migration-framework-best-practices-ba41b4dc41f7)
- [Complete Data Migration Checklist (Rivery)](https://rivery.io/data-migration-checklist/)
