# Migration Strategies

## Three Main Approaches

### 1. Big Bang Migration
**Definition**: All changes at once, immediate cutover

**Pros**:
- Fast completion
- No dual-system maintenance
- Clear before/after state

**Cons**:
- High risk (no gradual rollout)
- Requires extensive testing
- All users impacted simultaneously
- Hard to rollback

**When to Use**:
- Small user base (< 50 users)
- Simple migration (few breaking changes)
- Well-tested changes (confidence is high)
- Urgent need (can't wait for phased approach)

**Example**: simon_tools command renaming for internal team only

---

### 2. Phased Migration
**Definition**: Section by section, logical grouping

**Pros**:
- Lower risk (issues contained to phase)
- Staged learning curve
- Can adjust approach between phases
- Easier rollback (phase-specific)

**Cons**:
- Longer timeline
- Dual-system maintenance during transition
- Coordination overhead

**When to Use**:
- Medium-large user base (50-500 users)
- Complex migration (multiple breaking changes)
- Need to validate approach with subset first
- Users can migrate independently

**Example**: simon_tools phased migration

**Phase 1** (Week 1-2): Introduce `/refine` as alias to `/set-up`
- Both commands work identically
- Documentation updated to show both
- Deprecation warning on `/set-up`

**Phase 2** (Week 3-6): Encourage adoption
- Default examples use `/refine`
- `/set-up` shows: "Deprecated, use /refine instead"
- Track adoption metrics

**Phase 3** (Week 7-12): Remove old command
- If adoption > 90%, remove `/set-up`
- If adoption < 90%, extend timeline or keep alias

---

### 3. Trickle Migration
**Definition**: Continuous, incremental changes

**Pros**:
- Lowest risk (minimal change per iteration)
- Constant feedback loop
- Easy rollback (small changes)
- Adapts to user feedback

**Cons**:
- Longest timeline
- Complex coordination
- Prolonged dual-system state
- Can feel like "always migrating"

**When to Use**:
- Very large user base (500+ users)
- Continuous delivery environment
- Risk-averse organization
- Need to experiment and iterate

**Example**: simon_tools trickle migration
- Week 1: Add `/refine` alias
- Week 2: Update 1 doc file to use `/refine`
- Week 3: Update 5 task files
- Week 4: Update agents to reference `/refine`
- ... (continue until 100% migrated)

---

## Choosing the Right Strategy

### Decision Tree

```
User Base Size?
├── Small (< 50) → Big Bang (if well-tested)
├── Medium (50-500) → Phased
└── Large (500+) → Trickle

Complexity?
├── Simple (1-2 breaking changes) → Big Bang
├── Medium (3-5 breaking changes) → Phased
└── Complex (6+ breaking changes) → Phased or Trickle

Risk Tolerance?
├── High (can tolerate outage) → Big Bang
├── Medium (some downtime OK) → Phased
└── Low (zero downtime required) → Trickle

Timeline Urgency?
├── Urgent (< 1 week) → Big Bang
├── Moderate (1-3 months) → Phased
└── Flexible (3-12 months) → Trickle
```

### For Simon_Tools Command Renaming

**Recommended**: **Phased Migration**

**Rationale**:
- User base: Small-medium (exact count unknown, but likely < 100)
- Complexity: Simple (rename 1 command, update references)
- Risk: Medium (users accustomed to /set-up, need transition period)
- Timeline: Moderate (3 months reasonable for adoption)

---

## Sequencing & Scheduling

### Wave Planning

Organize migration into waves (logical grouping):

**Wave 1**: Low-risk, high-visibility
- Add `/refine` alias
- Update main documentation (CLAUDE.md, README.md)
- Announce in changelog

**Wave 2**: Medium-risk, medium-visibility
- Update all task file metadata to reference "refine"
- Update hooks and agents
- Add deprecation warning to `/set-up`

**Wave 3**: High-risk, low-visibility
- Remove `/set-up` command (if adoption > 90%)
- Final documentation sweep
- Post-migration validation

### Scheduling Considerations

**Avoid critical periods**:
- End of quarter (focus on delivery)
- Major releases (too much change simultaneously)
- Vacation periods (reduced support capacity)

**Ideal timing**:
- Start of sprint (aligned with planning)
- Post-release (after major features ship)
- Buffer time (2-week cushion for issues)

### Buffer Time

**Rule of Thumb**: Add 25% buffer to estimated duration

**Example**:
- Estimated migration: 8 weeks
- With buffer: 10 weeks (8 * 1.25)
- Rationale: Unexpected issues, adoption slower than projected

---

## Dependency Management

### Rule: Migrate Dependent Components Together

**Example**:
If `/set-up` is renamed to `/refine`:
- Command file: `.claude/commands/set-up.md` → `refine.md`
- Command invocations: All references in docs, hooks, agents
- Metadata: Task files tracking which command created plan
- Tests: Any tests verifying `/set-up` behavior

**Migration Wave**:
All of the above in Wave 2 (coordinated change).

---

## Testing & Validation

### Pre-Migration Testing

- [ ] Unit tests: All commands work in isolation
- [ ] Integration tests: Commands work together (generate → set-up → develop flow)
- [ ] User acceptance testing: Real users try new workflow
- [ ] Performance testing: No regression in speed

### Post-Migration Validation

- [ ] Data integrity: All files migrated correctly
- [ ] Functionality: All workflows still work
- [ ] Performance: No degradation
- [ ] User feedback: Survey results positive

### Automated Testing

Create migration validation script:
```bash
#!/bin/bash
# validate-migration.sh

echo "Checking for old command references..."
grep -r "/set-up" .claude/ backlog/ && exit 1 || echo "✓ No /set-up references"

echo "Checking new command works..."
/refine TASK-001 --quick && echo "✓ /refine command works" || exit 1

echo "Checking documentation updated..."
grep "/refine" CLAUDE.md && echo "✓ Docs updated" || exit 1

echo "All validations passed!"
```

---

## Sources

- [Plan Your Migration (Microsoft)](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/plan-migration)
- [Modern Data Migration Plan (Alation)](https://www.alation.com/blog/data-migration-plan/)
- [Data Migration Best Practices](https://medium.com/@cevvavijay/data-migration-framework-best-practices-ba41b4dc41f7)
