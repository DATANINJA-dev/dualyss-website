# Migration Strategy Patterns

Comprehensive guide to application migration strategies for tech stack transformations. This document covers three primary patterns: Strangler Fig, Big Bang, and Parallel Run, with decision guidance and rollback considerations.

## Overview

Choosing the right migration strategy is critical for project success. The wrong approach can lead to:
- Extended timelines and budget overruns
- Data loss or corruption
- System downtime affecting users
- Team burnout and morale issues

This guide provides a systematic framework for strategy selection based on your project's specific constraints.

---

## Strangler Fig Pattern

### Overview & Use Cases

The **Strangler Fig** pattern, coined by Martin Fowler, involves gradually replacing legacy system components with new implementations while keeping the system operational. Named after the strangler fig plant that grows around a host tree, this approach "wraps" the old system and incrementally routes functionality to new code.

**Best for:**
- Large codebases (>100K LOC)
- Mission-critical systems that cannot afford downtime
- Teams wanting continuous delivery during migration
- Organizations with low risk tolerance

### Implementation Steps

1. **Identify Seams**: Find natural boundaries in the legacy system (APIs, modules, services)
2. **Create Facade**: Build a routing layer that can direct traffic to old or new implementations
3. **Implement Incrementally**: Migrate one component at a time, starting with lowest-risk areas
4. **Validate Per Component**: Run both implementations in parallel briefly, compare outputs
5. **Route Traffic**: Gradually shift traffic from legacy to new implementation
6. **Decommission**: Remove legacy component once new implementation is proven stable
7. **Repeat**: Continue until entire system is migrated

### Pros

- **Low risk**: Issues affect only the component being migrated
- **Continuous delivery**: New features can be added during migration
- **Reversible**: Easy to route traffic back to legacy if issues arise
- **Team learning**: Team gains experience with new tech incrementally
- **Measurable progress**: Clear milestones and metrics throughout

### Cons

- **Longer timeline**: 6-12 months typical, can extend to 18+ months for large systems
- **Parallel system costs**: Must maintain both systems during transition
- **Facade complexity**: Routing layer adds architectural complexity
- **Integration challenges**: Both systems must remain compatible
- **Coordination overhead**: Requires careful planning and communication

### Prerequisites

- Clear API boundaries or ability to create them
- Deployment pipeline supporting parallel releases
- Monitoring infrastructure for both systems
- Team expertise in facade/proxy patterns
- Stakeholder buy-in for extended timeline

### Timeline Estimates

| Codebase Size | Typical Duration | Stability Period |
|---------------|------------------|------------------|
| 50-100K LOC | 6-9 months | 2-3 months |
| 100-250K LOC | 9-12 months | 3 months |
| 250K+ LOC | 12-18 months | 3-6 months |

### When to Use

- Large, complex systems that cannot tolerate downtime
- Teams new to target technology (learning opportunity)
- Regulatory environments requiring audit trails
- Systems with unclear documentation (discover as you migrate)

---

## Big Bang Pattern

### Overview & Use Cases

The **Big Bang** approach involves completely rewriting the system and switching over in a single deployment. The legacy system is turned off, and the new system goes live simultaneously during a maintenance window.

**Best for:**
- Small codebases (<10K LOC)
- Small teams (1-3 developers)
- Non-critical systems where downtime is acceptable
- Systems with comprehensive test coverage
- Greenfield-adjacent projects (very minimal legacy value)

### Implementation Steps

1. **Complete Analysis**: Document ALL legacy system functionality (nothing can be missed)
2. **Full Rewrite**: Build entire new system before any cutover
3. **Comprehensive Testing**: Test exhaustively - no production rollback opportunity
4. **Data Migration Script**: Prepare and test data migration thoroughly
5. **Maintenance Window**: Schedule downtime, communicate to all stakeholders
6. **Execute Cutover**: Turn off legacy, migrate data, turn on new system
7. **Monitor Intensively**: First 72 hours are critical for issue detection

### Pros

- **Fast completion**: 1-3 months for small systems
- **Clean slate**: No legacy baggage or technical debt
- **Simple architecture**: No facade or routing complexity
- **Clear completion**: Definitive end date
- **Lower ongoing costs**: Only one system to maintain post-migration

### Cons

- **High risk**: Any issue affects entire system immediately
- **No mid-course correction**: Cannot adjust strategy once started
- **Testing burden**: Must achieve very high test coverage
- **All-or-nothing**: Partial success is not possible
- **Single point of failure**: Cutover window is make-or-break moment

### Prerequisites

- Complete understanding of legacy system (no undocumented features)
- Comprehensive test coverage (>90% recommended)
- Clear rollback procedure with tested backups
- Stakeholder agreement on acceptable downtime
- Team expertise sufficient to rewrite without discovery phase

### Timeline Estimates

| Codebase Size | Typical Duration | Testing Period |
|---------------|------------------|----------------|
| <5K LOC | 1-2 months | 2 weeks |
| 5-10K LOC | 2-3 months | 3-4 weeks |
| >10K LOC | NOT RECOMMENDED | - |

### Warning Signs (When NOT to Use)

- **Undocumented legacy code**: Hidden functionality will be missed
- **Complex integrations**: External dependencies increase failure risk
- **Large team**: Coordination overhead negates speed benefits
- **Mission-critical system**: Downtime cost too high
- **Unclear requirements**: Will discover issues only at cutover
- **Poor test coverage**: Cannot validate completeness

### Fallback Strategies

If issues are detected post-cutover:

1. **Immediate Rollback** (< 1 hour)
   - Restore database from backup
   - Reactivate legacy system
   - Investigate root cause

2. **Partial Rollback** (1-24 hours)
   - Identify affected functionality
   - Route specific features back to legacy (if possible)
   - Fix issues in new system

3. **Forward Fix** (non-critical issues)
   - Deploy hotfixes rapidly
   - Monitor closely
   - Schedule proper fix for next release

---

## Parallel Run Pattern

### Overview & Use Cases

The **Parallel Run** pattern runs both legacy and new systems simultaneously for an extended period, processing the same inputs and comparing outputs. This approach de-risks the migration by validating the new system against proven legacy behavior.

**Best for:**
- Large enterprises with very low risk tolerance
- Mission-critical systems (financial, healthcare, infrastructure)
- Systems where correctness is paramount
- Organizations with budget for extended parallel operations
- Teams wanting maximum confidence before cutover

### Implementation Steps

1. **Deploy New System**: Launch new system alongside legacy
2. **Traffic Splitting**: Route same requests to both systems
3. **Output Comparison**: Compare responses for discrepancies
4. **Discrepancy Analysis**: Investigate and fix differences
5. **Confidence Building**: Increase traffic to new system gradually
6. **Full Cutover**: Switch entirely to new system once confidence achieved
7. **Legacy Decommissioning**: Archive and shut down legacy after stability period

### Pros

- **Maximum safety**: Real-world validation against proven system
- **Edge case discovery**: Production traffic reveals issues testing missed
- **Gradual confidence**: Data-driven decision making for cutover
- **Zero-downtime possible**: Seamless transition if implemented correctly
- **Reversible**: Legacy always available as fallback

### Cons

- **High cost**: Running two production systems simultaneously
- **Complex infrastructure**: Traffic splitting, comparison tooling, dual monitoring
- **Extended timeline**: 12-24 months is common
- **Synchronization challenges**: Keeping data consistent across systems
- **Team fatigue**: Long duration can impact morale

### Prerequisites

- DevOps infrastructure for traffic splitting
- Comparison tooling for output validation
- Large team capacity for dual maintenance
- Budget for extended parallel operations
- Clear criteria for "good enough" to cutover

### Timeline Estimates

| System Complexity | Parallel Run Duration | Total Migration |
|-------------------|----------------------|-----------------|
| Moderate | 6-9 months | 12-15 months |
| High | 9-12 months | 15-20 months |
| Critical | 12-18 months | 20-24 months |

### Traffic Splitting Approaches

| Approach | Description | Use Case |
|----------|-------------|----------|
| **Mirror** | Both systems receive all traffic | High-confidence validation |
| **Split** | Percentage-based routing (e.g., 10% new, 90% legacy) | Gradual rollout |
| **Canary** | Specific users/regions to new system | Geographic or user-segment testing |
| **Shadow** | New system processes but doesn't serve responses | Early validation before real traffic |

### Decommissioning Checklist

Before shutting down legacy system:

- [ ] New system handling 100% of traffic for 30+ days
- [ ] No critical discrepancies in output comparison for 14+ days
- [ ] All integrations verified on new system
- [ ] Performance metrics meet or exceed legacy
- [ ] Data migration complete and verified
- [ ] Rollback procedure documented and tested
- [ ] Stakeholder sign-off obtained
- [ ] Legacy data archived according to retention policy
- [ ] Team trained on new system support

---

## Decision Matrix

Use this matrix to guide strategy selection based on your project constraints:

| Factor | Strangler Fig | Big Bang | Parallel Run |
|--------|---------------|----------|--------------|
| **Codebase Size** | Large (>100K LOC) | Small (<10K LOC) | Any |
| **Team Size** | Any | Small (1-3) | Large (10+) |
| **Risk Tolerance** | Low | High | Very Low |
| **Timeline** | 6-12 months | 1-3 months | 12-24 months |
| **Budget** | Moderate | Low | High |
| **Downtime Acceptable** | No | Yes (planned) | No |
| **Legacy Documentation** | Poor-Good | Must be complete | Good |
| **Test Coverage** | Moderate | High (>90%) | Moderate |
| **Regulatory Requirements** | High | Low | High |
| **Integration Complexity** | Any | Low | High |

### Quick Decision Guide

```
START
│
├─ Codebase < 10K LOC?
│  ├─ YES → Can tolerate downtime?
│  │         ├─ YES → High test coverage?
│  │         │         ├─ YES → BIG BANG
│  │         │         └─ NO → STRANGLER FIG
│  │         └─ NO → STRANGLER FIG
│  └─ NO ↓
│
├─ Mission-critical system?
│  ├─ YES → Budget for parallel ops?
│  │         ├─ YES → PARALLEL RUN
│  │         └─ NO → STRANGLER FIG
│  └─ NO ↓
│
└─ Default → STRANGLER FIG (safest general choice)
```

### Hybrid Approaches

In practice, migrations often combine strategies:

- **Strangler + Parallel**: Strangle most components, parallel run critical paths
- **Big Bang + Strangler**: Big bang for isolated subsystems, strangle for core
- **Parallel + Canary**: Shadow mode first, then canary rollout

---

## Rollback Considerations

### Strangler Fig Rollback

**Recovery Time**: ~30 minutes

**Procedure**:
1. Revert routing rules to point to legacy component
2. Disable new component (don't delete yet)
3. Verify legacy component serving traffic correctly
4. Investigate root cause in new component
5. Fix and redeploy when ready

**Data Considerations**:
- Minimal data impact (component-level)
- May need to replay recent transactions on legacy

### Big Bang Rollback

**Recovery Time**: 2-8 hours (depends on data volume)

**Procedure**:
1. STOP all new system processes immediately
2. Restore database from pre-cutover backup
3. Apply transaction log if available
4. Reactivate legacy system
5. Verify system integrity
6. Communicate to stakeholders

**Data Considerations**:
- HIGH RISK: Transactions between cutover and rollback may be lost
- Must have tested backup restoration procedure
- Consider read-only mode option for critical data

### Parallel Run Rollback

**Recovery Time**: Near-instant (~5 minutes)

**Procedure**:
1. Route 100% traffic to legacy (already running)
2. Mark new system as non-production
3. Investigate discrepancies
4. No data loss expected (legacy always authoritative)

**Data Considerations**:
- Lowest data risk (legacy always primary)
- New system data can be discarded
- Easy retry once issues resolved

### Rollback Trigger Thresholds

Define clear criteria for triggering rollback:

| Metric | Warning | Rollback |
|--------|---------|----------|
| Error rate | >1% | >5% |
| Latency (p99) | >2x baseline | >5x baseline |
| Data inconsistency | Any detected | Critical field affected |
| User reports | >10/hour | >50/hour |
| Revenue impact | >1% drop | >5% drop |

---

## Sources

### Primary References

1. **Martin Fowler** - "Strangler Fig Application" (2004)
   - Original pattern definition
   - https://martinfowler.com/bliki/StranglerFigApplication.html

2. **Microsoft Azure Architecture Center** - "Strangler Fig Pattern"
   - Enterprise implementation guidance
   - https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig

3. **AWS Prescriptive Guidance** - "Strangler Fig Pattern"
   - Cloud migration patterns
   - https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html

4. **Joel Spolsky** - "Things You Should Never Do, Part I" (2000)
   - Big Bang rewrite cautionary tale
   - Classic warning against full rewrites

5. **Zalando Engineering** - "Parallel Run Pattern" (2021)
   - Production case study
   - https://engineering.zalando.com/posts/2021/11/parallel-run.html

6. **Google Cloud** - "Migration Risk Mitigation"
   - Risk assessment frameworks
   - https://docs.cloud.google.com/migration-center/docs/migration-risks

### Additional Reading

- Sam Newman - "Building Microservices" (Chapter on Migration)
- Thoughtworks - "Embracing Strangler Fig Pattern for Legacy Modernization"
- Netflix Tech Blog - "Lessons Learned from Large-Scale Migrations"
