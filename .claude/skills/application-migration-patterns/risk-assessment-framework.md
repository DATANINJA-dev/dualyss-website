# Risk Assessment Framework for Migrations

Comprehensive framework for assessing tech stack migration risks. Provides a 1-10 scoring methodology across five weighted categories to guide strategy selection and mitigation planning.

## Overview

This framework helps teams quantify migration risk before implementation. Use it during `/refine` to inform strategy selection and identify high-risk components requiring special attention.

**Key Statistics**:
- 83% of data migration projects fail, exceed budgets, or disrupt operations
- 23% of organizations experience data loss during migration
- Migration timeline estimates are typically off by 40-60%
- Failure rates drop 73% with proper risk assessment and planning

---

## Risk Categories

### 1. Data Loss Risk (Weight: 30%)

Data integrity is the highest-weighted risk due to potential for permanent, irreversible damage.

#### Scoring Indicators (1-10)

| Score | Condition | Examples |
|-------|-----------|----------|
| 1-2 | No schema changes, read-only migration | Log migration, static content |
| 3-4 | Minor schema changes, well-tested rollback | Adding columns, index changes |
| 5-6 | Moderate schema changes, partial rollback | Data type conversions, table splits |
| 7-8 | Major schema changes, limited rollback | Normalization changes, key restructuring |
| 9-10 | Destructive changes, no rollback | Column drops, referential integrity changes |

#### Checklist Items

- [ ] Schema changes required? (+2 points)
- [ ] Data type transformations needed? (+2 points)
- [ ] No rollback mechanism available? (+3 points)
- [ ] Production data directly modified? (+2 points)
- [ ] Referential integrity changes? (+1 point)
- [ ] Multi-table cascading changes? (+2 points)
- [ ] Historical data archival affected? (+1 point)

#### Mitigation Recommendations

| Risk Level | Mitigation Strategy |
|------------|---------------------|
| Low (1-3) | Standard backup before migration |
| Medium (4-6) | Incremental migration with checkpoints, tested rollback per phase |
| High (7-8) | Parallel database with real-time sync, shadow writes |
| Critical (9-10) | Blue-green deployment, extended parallel run (30+ days) |

**Best Practice**: Define and test a specific rollback procedure for each migration phase, not just project-wide. This ensures you can safely reverse a single step without impacting previously migrated data.

---

### 2. Authentication Complexity (Weight: 25%)

Authentication migrations carry high risk due to potential for complete user lockout and security vulnerabilities.

#### Scoring Indicators (1-10)

| Score | Condition | Examples |
|-------|-----------|----------|
| 1-2 | No auth changes | UI-only migration |
| 3-4 | Minor session handling changes | Cookie domain change |
| 5-6 | OAuth provider configuration changes | Scope updates, redirect URI changes |
| 7-8 | Full OAuth provider migration | Moving from Auth0 to Cognito |
| 9-10 | Password hashing algorithm change + MFA migration | Complete identity system rewrite |

#### Checklist Items

- [ ] Session management changes required? (+2 points)
- [ ] OAuth provider migration? (+3 points)
- [ ] Password hashing algorithm change? (+2 points)
- [ ] MFA implementation changes? (+2 points)
- [ ] User data schema changes? (+1 point)
- [ ] Token format/storage changes? (+2 points)
- [ ] SSO/federation changes? (+2 points)

#### Mitigation Recommendations

| Risk Level | Mitigation Strategy |
|------------|---------------------|
| Low (1-3) | Standard testing, phased rollout |
| Medium (4-6) | Parallel auth systems, gradual user migration |
| High (7-8) | Shadow authentication (validate against both), extended transition |
| Critical (9-10) | Dual-write pattern, force re-authentication, 90-day overlap |

**OWASP 2025 Considerations**:
- Use PKCE for all OAuth 2.0 flows
- Enforce MFA for sensitive operations
- Use HttpOnly cookies for sessions
- Validate OAuth redirect URIs strictly
- Avoid placing JWTs in localStorage

---

### 3. Integration Breakage (Weight: 20%)

External service dependencies multiply risk—each integration point is a potential failure cascade.

#### Scoring Indicators (1-10)

| Score | Condition | Examples |
|-------|-----------|----------|
| 1-2 | No external dependencies | Internal tool migration |
| 3-4 | 1-2 well-documented integrations | Single payment provider |
| 5-6 | 3-5 integrations, some undocumented | Multiple APIs, webhooks |
| 7-8 | 6-10 integrations, legacy API dependencies | Complex B2B integrations |
| 9-10 | 10+ integrations, deprecated API versions | Enterprise system with shadow APIs |

#### Checklist Items

- [ ] API version changes required? (+2 points)
- [ ] Webhook endpoint changes? (+2 points)
- [ ] Third-party service coupling? (+1 point per service)
- [ ] Undocumented/shadow APIs detected? (+3 points)
- [ ] External consumer notification needed? (+2 points)
- [ ] OAuth token/federation with partners? (+2 points)
- [ ] Deprecated API versions in use? (+3 points)

#### Mitigation Recommendations

| Risk Level | Mitigation Strategy |
|------------|---------------------|
| Low (1-3) | API versioning, consumer notification |
| Medium (4-6) | API facade/gateway, parallel endpoints |
| High (7-8) | Full API inventory audit, staged deprecation (90+ days) |
| Critical (9-10) | Strangler pattern mandatory, 6+ month transition |

**2025 Reality Check**:
- Only 10% of organizations have API posture governance
- 58% report API sprawl as significant pain point
- Regional API availability declined year-over-year

---

### 4. Business Logic Risk (Weight: 15%)

Critical business logic (financial calculations, compliance code) requires highest verification standards.

#### Scoring Indicators (1-10)

| Score | Condition | Examples |
|-------|-----------|----------|
| 1-2 | No business logic changes | Infrastructure migration |
| 3-4 | Minor workflow changes | UI flow optimization |
| 5-6 | Moderate logic changes, well-tested | Notification rules update |
| 7-8 | Financial calculation changes | Pricing engine migration |
| 9-10 | Compliance-critical code changes | Tax calculation, regulatory reporting |

#### Checklist Items

- [ ] Financial calculations affected? (+3 points)
- [ ] Compliance/regulatory code changes? (+3 points)
- [ ] Critical user path modifications? (+2 points)
- [ ] Audit trail/logging changes? (+2 points)
- [ ] Approval workflow changes? (+1 point)
- [ ] Data validation rule changes? (+2 points)
- [ ] SLA-bound processes affected? (+2 points)

#### Mitigation Recommendations

| Risk Level | Mitigation Strategy |
|------------|---------------------|
| Low (1-3) | Standard unit/integration testing |
| Medium (4-6) | Golden dataset validation, A/B comparison |
| High (7-8) | Parallel calculation with automated comparison |
| Critical (9-10) | Extended parallel run (30-90 days), regulatory sign-off |

**Compliance Considerations (2025)**:
- DORA compliance required for EU financial entities since January 2025
- ISO 20022 migration completed July 2025 for Fedwire
- NIS2 and UK Cyber Resilience Bill expanded reporting obligations

---

### 5. Performance Risk (Weight: 10%)

Performance degradation affects user experience and can trigger SLA violations.

#### Scoring Indicators (1-10)

| Score | Condition | Examples |
|-------|-----------|----------|
| 1-2 | No performance-critical paths | Batch job migration |
| 3-4 | Standard web traffic | Marketing site migration |
| 5-6 | Real-time requirements (< 1s) | User-facing API migration |
| 7-8 | Low-latency requirements (< 200ms) | Search, autocomplete |
| 9-10 | Ultra-low latency (< 50ms), high throughput | Trading systems, real-time gaming |

#### Checklist Items

- [ ] P99 latency SLO affected? (+2 points)
- [ ] Throughput requirements change? (+2 points)
- [ ] Geographic distribution changes? (+1 point)
- [ ] Database query patterns affected? (+2 points)
- [ ] Caching strategy changes? (+1 point)
- [ ] CDN/edge changes? (+1 point)
- [ ] Real-time processing requirements? (+3 points)

#### Mitigation Recommendations

| Risk Level | Mitigation Strategy |
|------------|---------------------|
| Low (1-3) | Standard load testing |
| Medium (4-6) | Performance baseline + 20% headroom |
| High (7-8) | Staged rollout (1% → 5% → 25% → 100%), real-time monitoring |
| Critical (9-10) | Shadow traffic testing, geographic canary, instant rollback |

**SRE Best Practices**:
- Critical paths: P95 < 200ms, P99 < 500ms
- Standard operations: P95 < 1000ms, P99 < 2000ms
- Service Tier 1 (Critical): 99.9% availability (43.8 min/month max downtime)
- Use error budgets to balance velocity vs. reliability

---

## Composite Score Calculation

### Formula

```
risk_score = (data_loss × 0.30) + (auth × 0.25) + (integration × 0.20) + (business × 0.15) + (performance × 0.10)
```

### Score Interpretation

| Score Range | Risk Level | Recommended Strategy | Timeline |
|-------------|------------|---------------------|----------|
| 1.0 - 3.0 | **Low** | Big Bang feasible | 1-3 months |
| 3.1 - 5.0 | **Medium-Low** | Strangler Fig recommended | 3-6 months |
| 5.1 - 7.0 | **Medium-High** | Strangler Fig required | 6-12 months |
| 7.1 - 8.0 | **High** | Parallel Run required | 12-18 months |
| 8.1 - 10.0 | **Critical** | Phase over 6+ months, decompose first | 18-24+ months |

### Strategy Mapping Quick Reference

| Composite Score | Strategy | Key Actions |
|-----------------|----------|-------------|
| ≤ 3.0 | Big Bang | Full backup, maintenance window, tested rollback |
| 3.1 - 5.0 | Strangler Fig | Identify seams, facade routing, incremental migration |
| 5.1 - 7.0 | Strangler Fig + Monitoring | Above + real-time comparison, automated alerts |
| 7.1 - 8.0 | Parallel Run | Dual systems, traffic mirroring, output comparison |
| > 8.0 | Decompose First | Break into smaller migrations, reassess each |

---

## Example Risk Assessment

### Scenario: Java Spring Boot → Node.js Express Migration

**Project Context**: E-commerce platform with 150K LOC, PostgreSQL database, OAuth 2.0 authentication, 5 third-party integrations.

| Category | Score | Reasoning |
|----------|-------|-----------|
| **Data Loss** | 5 | Schema changes for JSON support, but rollback tested |
| **Auth Complexity** | 6 | OAuth migration + session format change |
| **Integration Breakage** | 4 | 5 integrations, all documented with API contracts |
| **Business Logic** | 7 | Pricing engine and tax calculations affected |
| **Performance** | 4 | P99 < 500ms SLO, standard web traffic |

**Composite Score**: (5 × 0.30) + (6 × 0.25) + (4 × 0.20) + (7 × 0.15) + (4 × 0.10) = **5.25**

**Recommendation**: Strangler Fig required with enhanced monitoring. Prioritize pricing engine validation. Estimate 6-9 months.

**High-Risk Components**:
1. Pricing engine (business logic, score 7)
2. OAuth migration (auth complexity, score 6)
3. Tax calculation (business logic, score 7)

**Suggested Decomposition**:
1. Migrate read-only catalog service first (low risk)
2. Migrate user profile with parallel auth
3. Migrate checkout with parallel pricing validation
4. Cut over payment processing last

---

## Sources

### Data Migration Risk
- [Monte Carlo Data - Data Migration Risks Checklist](https://www.montecarlodata.com/blog-data-migration-risks-checklist/)
- [Rivery - Complete Data Migration Checklist 2026](https://rivery.io/data-learning-center/complete-data-migration-checklist/)
- [Streamkap - Data Migration Best Practices 2025](https://streamkap.com/resources-and-guides/data-migration-best-practices)

### Authentication Security
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP OAuth2 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)
- [OWASP Top 10 2025 - Authentication Failures](https://owasp.org/Top10/2025/A07_2025-Authentication_Failures/)

### API & Integration Risk
- [Venminder - Third-Party API Risk Mitigation](https://www.venminder.com/blog/how-mitigate-third-party-api-risk)
- [DigitalOcean - Cloud Migration Risks 2025](https://www.digitalocean.com/resources/articles/cloud-migration-risks)
- [Uptrends - State of API Reliability 2025](https://www.uptrends.com/state-of-api-reliability-2025)

### Performance & SRE
- [Google SRE - Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)
- [Google SRE - Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Uptrace - SLA/SLO Monitoring Requirements 2025](https://uptrace.dev/blog/sla-slo-monitoring-requirements)

### Compliance & Business Risk
- [Regnology - DORA Compliance Checklist](https://www.regnology.net/en/resources/insights/dora-compliance-checklist/)
- [Cloudficient - Data Migration Challenges 2025](https://www.cloudficient.com/blog/10-common-data-migration-challenges-and-how-to-overcome-them)
