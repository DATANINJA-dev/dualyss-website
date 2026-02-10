# Migration Task Decomposition Templates

Templates for breaking down migration epics into sprint-sized tasks. Each template provides a structured approach to decomposing 6-month migrations into trackable work units.

## Overview

Migration task decomposition extends the general decomposition strategies from `task-discovery/decomposition.md` with migration-specific patterns:

| Migration Type | Primary Strategy | Secondary Strategy | Typical Tasks |
|---------------|------------------|-------------------|---------------|
| Component | Dependency Chain | Risk Isolation | 5-7 |
| Data | Risk Isolation | Incremental | 6-8 |
| API | Vertical Slice | Incremental | 8-12 |

---

## Component Migration Template

**Use for**: Single service, module, or subsystem migration (e.g., Java Spring Boot → Node.js Express)

**Recommended Strategy**: Strangler Fig (from `migration-strategies.md`)

**Typical Duration**: 4-8 weeks

### Epic Structure

```yaml
epic: "Migrate [component] from [source_tech] to [target_tech]"
strategy: strangler_fig
estimated_duration: "6-8 weeks"
risk_level: medium

tasks:
  - title: "Set up [target_tech] project structure for [component]"
    type: infra
    complexity: S
    depends_on: []
    ac:
      - Project scaffolded with [target_tech] framework
      - CI/CD pipeline configured for new project
      - Development environment documented
      - Local dev setup tested by second team member

  - title: "Implement [component] core business logic in [target_tech]"
    type: feature
    complexity: M
    depends_on: ["setup"]
    ac:
      - Core business logic migrated to [target_tech]
      - Unit tests passing with 90%+ coverage
      - API parity validated against source implementation
      - Error handling matches source behavior

  - title: "Migrate [component] data layer to [target_tech]"
    type: feature
    complexity: M
    depends_on: ["core_logic"]
    ac:
      - Database connections configured
      - ORM/data access patterns implemented
      - Data migration script tested on staging
      - Rollback procedure documented and tested

  - title: "Create facade/router for [component] traffic switching"
    type: infra
    complexity: S
    depends_on: ["data_layer"]
    ac:
      - Traffic router can direct requests to old or new implementation
      - Feature flag or configuration toggle available
      - Logging captures which implementation serves each request
      - Router adds < 5ms latency overhead

  - title: "Integration testing for migrated [component]"
    type: feature
    complexity: S
    depends_on: ["facade"]
    ac:
      - Integration tests passing for all endpoints
      - Performance within 10% of source system
      - Error scenarios validated (timeouts, failures)
      - Load testing completed at 2x expected traffic

  - title: "Cutover [component] to production"
    type: infra
    complexity: S
    depends_on: ["integration_testing"]
    ac:
      - Traffic gradually shifted (10% → 50% → 100%)
      - Monitoring alerts configured for new component
      - Rollback executed successfully in staging
      - On-call documentation updated

  - title: "Decommission legacy [component]"
    type: infra
    complexity: S
    depends_on: ["cutover"]
    ac:
      - Legacy component traffic reduced to 0% for 7+ days
      - No errors related to old component in logs
      - Legacy resources scheduled for cleanup
      - Documentation updated to remove legacy references
```

### Example: Authentication Service Migration

```yaml
epic: "Migrate auth-service from Java Spring Boot to Node.js Express"
strategy: strangler_fig
estimated_duration: "6 weeks"

tasks:
  - title: "Set up Node.js Express project for auth-service"
    type: infra
    complexity: S
    ac:
      - Express.js project with TypeScript scaffolded
      - Docker configuration matching Java deployment
      - GitHub Actions CI/CD pipeline configured

  - title: "Implement JWT authentication logic in Node.js"
    type: feature
    complexity: M
    depends_on: ["setup"]
    ac:
      - JWT generation and validation matching Java implementation
      - Refresh token flow implemented
      - 95% unit test coverage on auth logic

  - title: "Migrate user session storage to Node.js"
    type: feature
    complexity: M
    depends_on: ["auth_logic"]
    ac:
      - Redis session storage configured
      - Session expiry matches Java implementation
      - Concurrent session handling tested

  - title: "Create auth-service traffic router"
    type: infra
    complexity: S
    depends_on: ["session_storage"]
    ac:
      - Nginx proxy routes based on feature flag
      - Request logging captures routing decisions

  - title: "Integration test auth flows"
    type: feature
    complexity: S
    depends_on: ["router"]
    ac:
      - Login/logout/refresh flows tested
      - OAuth provider integration verified
      - Performance < 50ms p99 latency

  - title: "Production cutover auth-service"
    type: infra
    complexity: S
    depends_on: ["integration_tests"]
    ac:
      - Gradual traffic shift completed
      - Zero auth failures during transition
```

---

## Data Migration Template

**Use for**: Database schema changes, data transformation, storage system migration (e.g., PostgreSQL → MongoDB)

**Recommended Strategy**: Parallel Run with Expand/Contract pattern

**Typical Duration**: 6-12 weeks

### Epic Structure

```yaml
epic: "Migrate [data_entity] from [source_db] to [target_db]"
strategy: parallel_run
pattern: expand_contract
estimated_duration: "8-10 weeks"
risk_level: high

phases:
  expand: "Add new schema alongside original"
  migrate: "Transform and copy data"
  contract: "Remove old schema after validation"

tasks:
  # EXPAND PHASE
  - title: "Design [target_db] schema for [data_entity]"
    type: feature
    complexity: M
    depends_on: []
    phase: expand
    ac:
      - Schema design reviewed and approved
      - Field mapping documented (source → target)
      - Transformation rules specified
      - Edge cases identified (nulls, defaults, enums)

  - title: "Create [target_db] schema and indexes"
    type: infra
    complexity: S
    depends_on: ["schema_design"]
    phase: expand
    ac:
      - Schema deployed to staging environment
      - Indexes created for query patterns
      - Constraints match business rules
      - Performance baseline established

  - title: "Implement dual-write for [data_entity]"
    type: feature
    complexity: M
    depends_on: ["schema_creation"]
    phase: expand
    ac:
      - Application writes to both old and new schemas
      - Write failures to new schema are logged but don't fail requests
      - Dual-write can be toggled via feature flag
      - No performance regression > 10%

  # MIGRATE PHASE
  - title: "Build data migration script for [data_entity]"
    type: feature
    complexity: M
    depends_on: ["dual_write"]
    phase: migrate
    ac:
      - Migration script handles all transformation rules
      - Script is idempotent (safe to re-run)
      - Progress tracking and resume capability
      - Estimated runtime for production data calculated

  - title: "Execute historical data migration"
    type: infra
    complexity: M
    depends_on: ["migration_script"]
    phase: migrate
    ac:
      - Historical data migrated to new schema
      - Data integrity validation passed (row counts, checksums)
      - Migration completed within maintenance window
      - Rollback procedure tested

  - title: "Validate data consistency between schemas"
    type: feature
    complexity: S
    depends_on: ["historical_migration"]
    phase: migrate
    ac:
      - Comparison queries show 100% data match
      - Sample records manually verified
      - Edge cases validated (nulls, special characters)
      - Consistency check runs daily for 7+ days

  # CONTRACT PHASE
  - title: "Switch reads to [target_db]"
    type: feature
    complexity: S
    depends_on: ["data_validation"]
    phase: contract
    ac:
      - Application reads from new schema
      - Query performance meets SLA
      - Caching updated if applicable
      - Monitoring shows healthy read patterns

  - title: "Remove dual-write and legacy schema"
    type: infra
    complexity: S
    depends_on: ["switch_reads"]
    phase: contract
    ac:
      - Dual-write disabled for 14+ days without issues
      - Legacy schema backup created
      - Legacy schema dropped from production
      - Documentation updated
```

### Example: User Profiles to Document Store

```yaml
epic: "Migrate user_profiles from PostgreSQL to MongoDB"
strategy: parallel_run
pattern: expand_contract
estimated_duration: "10 weeks"

tasks:
  # EXPAND
  - title: "Design MongoDB document schema for user_profiles"
    type: feature
    complexity: M
    ac:
      - Document structure optimized for read patterns
      - Nested objects for preferences, settings
      - Index strategy for common queries

  - title: "Deploy MongoDB collection with indexes"
    type: infra
    complexity: S
    ac:
      - Collection created in production cluster
      - Compound indexes for email, org_id lookups

  - title: "Implement dual-write to PostgreSQL and MongoDB"
    type: feature
    complexity: M
    ac:
      - UserRepository writes to both stores
      - MongoDB failures logged, don't block requests
      - Feature flag controls dual-write

  # MIGRATE
  - title: "Build user_profiles migration script"
    type: feature
    complexity: M
    ac:
      - Batch processing for 10M+ records
      - Resume from checkpoint on failure
      - Transform: JSON columns → nested documents

  - title: "Execute historical user migration"
    type: infra
    complexity: M
    ac:
      - 10M records migrated in < 4 hours
      - Zero data loss verified

  - title: "Validate user data consistency"
    type: feature
    complexity: S
    ac:
      - Automated comparison for 100k sample records
      - All profile fields match

  # CONTRACT
  - title: "Switch user reads to MongoDB"
    type: feature
    complexity: S
    ac:
      - p99 latency < 20ms for profile lookups

  - title: "Remove PostgreSQL user_profiles table"
    type: infra
    complexity: S
    ac:
      - Table dropped after 14-day validation period
```

---

## API Migration Template

**Use for**: REST API endpoint migration, versioning transitions, service consolidation

**Recommended Strategy**: Strangler Fig with domain-based decomposition

**Typical Duration**: 8-16 weeks

### Epic Structure

```yaml
epic: "Migrate [api_domain] API from [v1] to [v2]"
strategy: strangler_fig
decomposition: domain_based
estimated_duration: "10-12 weeks"
risk_level: medium

tasks:
  # FOUNDATION
  - title: "Design [v2] API contract for [api_domain]"
    type: feature
    complexity: M
    depends_on: []
    ac:
      - OpenAPI/Swagger spec for v2 endpoints
      - Breaking changes documented with migration guide
      - Backward compatibility strategy defined
      - Versioning approach decided (URL, header, query param)

  - title: "Set up API versioning infrastructure"
    type: infra
    complexity: S
    depends_on: ["api_design"]
    ac:
      - Routing supports v1 and v2 simultaneously
      - Version detection middleware implemented
      - Deprecation headers configured
      - API gateway rules updated

  # DOMAIN: [Domain 1] (example: Users)
  - title: "Migrate [domain_1] read endpoints to v2"
    type: feature
    complexity: S
    depends_on: ["versioning_infra"]
    domain: "[domain_1]"
    ac:
      - GET endpoints return v2 response format
      - Backward-compatible transformation for v1 clients
      - Response time within 5% of v1
      - 100% test coverage for new endpoints

  - title: "Migrate [domain_1] write endpoints to v2"
    type: feature
    complexity: M
    depends_on: ["domain_1_reads"]
    domain: "[domain_1]"
    ac:
      - POST/PUT/DELETE endpoints accept v2 format
      - Validation rules updated for new schema
      - Error responses follow v2 format
      - Idempotency preserved

  - title: "Canary rollout [domain_1] v2 endpoints"
    type: infra
    complexity: S
    depends_on: ["domain_1_writes"]
    domain: "[domain_1]"
    ac:
      - 5% traffic routed to v2 for 48 hours
      - Error rate < 0.1%
      - Latency within SLA
      - Rollback tested

  # DOMAIN: [Domain 2] (example: Orders)
  - title: "Migrate [domain_2] read endpoints to v2"
    type: feature
    complexity: S
    depends_on: ["versioning_infra"]
    domain: "[domain_2]"
    ac:
      - GET endpoints return v2 response format
      - Pagination follows v2 conventions
      - Filtering/sorting parameters updated

  - title: "Migrate [domain_2] write endpoints to v2"
    type: feature
    complexity: M
    depends_on: ["domain_2_reads"]
    domain: "[domain_2]"
    ac:
      - Transaction handling preserved
      - Webhook payloads updated to v2 format
      - Rate limiting rules applied

  - title: "Canary rollout [domain_2] v2 endpoints"
    type: infra
    complexity: S
    depends_on: ["domain_2_writes"]
    domain: "[domain_2]"
    ac:
      - 5% → 25% → 100% traffic shift
      - Zero transaction failures

  # FINALIZATION
  - title: "Full traffic migration to v2"
    type: infra
    complexity: S
    depends_on: ["domain_1_canary", "domain_2_canary"]
    ac:
      - 100% traffic on v2 for all domains
      - v1 endpoints return deprecation warnings
      - Client migration guide published

  - title: "Deprecate and sunset v1 endpoints"
    type: infra
    complexity: S
    depends_on: ["full_migration"]
    ac:
      - v1 traffic < 1% for 30+ days
      - v1 endpoints return 410 Gone or redirect
      - v1 code paths removed from codebase
      - API documentation updated
```

---

## Task Size Guidelines

### Complexity Mapping

| Complexity | Duration | Scope | Points |
|------------|----------|-------|--------|
| **S** | 1-2 days | Single file/function, config change, minor feature | 1-2 |
| **M** | 3-5 days | Single component, moderate feature, data transformation | 3-5 |
| **L** | 1-2 weeks | Multiple components, complex feature, cross-cutting concern | 8-13 |

### When to Decompose Further

Decompose a migration task if:
- Estimated duration > 5 days (split into M or S tasks)
- More than 3 files affected in different modules
- Multiple acceptance criteria span different concerns
- Task requires expertise from different team members
- Risk assessment shows HIGH for any single task

### Dependency Patterns

```
Linear Chain (most common for migrations):
  Setup → Implementation → Testing → Cutover → Cleanup

Parallel Domains (for API migrations):
  Setup ─┬→ Domain A → Canary A ─┬→ Full Migration
         ├→ Domain B → Canary B ─┤
         └→ Domain C → Canary C ─┘

Expand-Contract (for data migrations):
  Expand ─┬→ Dual-Write ─┬→ Migrate → Validate → Contract
          │              │
          └→ Schema ─────┘
```

---

## Related Patterns

- **Migration Strategies**: See `migration-strategies.md` for Strangler Fig, Big Bang, and Parallel Run patterns
- **General Decomposition**: See `task-discovery/decomposition.md` for the 5 decomposition strategies
- **TDD for Migrations**: See `tdd-functional-parity.md` (TASK-162) for testing patterns during migration
- **Risk Assessment**: See `risk-assessment-framework.md` (TASK-160) for scoring migration risk
