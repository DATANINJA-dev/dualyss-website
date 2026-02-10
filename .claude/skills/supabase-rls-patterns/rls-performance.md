# RLS Performance Optimization

Strategies for maintaining query performance with Row-Level Security enabled.

## Problem Statement

RLS policies add overhead to every query:
- Policy conditions evaluated for each row
- Subqueries in policies multiply execution time
- JOIN-heavy policies degrade with table size
- Missing indexes cause full table scans
- Complex conditions prevent query optimization

This guide helps you maintain fast queries while keeping data secure.

## Performance Impact Overview

| Policy Pattern | Impact | Mitigation |
|----------------|--------|------------|
| Simple equality (`auth.uid() = user_id`) | Low | Index on user_id |
| Membership check (`id IN (SELECT...)`) | Medium | Helper function + index |
| Complex subquery | High | Materialized view |
| Function call per row | Variable | STABLE function + caching |

## Index Recommendations

### Essential Indexes

```sql
-- Rule: Index every column used in USING/WITH CHECK clauses

-- User-owned data pattern
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Multi-tenant pattern
CREATE INDEX idx_documents_org_id ON documents(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_org_members_org_user ON org_members(org_id, user_id);

-- Role-based pattern
CREATE INDEX idx_org_members_user_role ON org_members(user_id, role);

-- Time-based pattern
CREATE INDEX idx_posts_published_at ON posts(published_at)
  WHERE published_at IS NOT NULL;

-- Soft-delete pattern
CREATE INDEX idx_documents_not_deleted ON documents(org_id)
  WHERE deleted_at IS NULL;
```

### Composite Indexes for Common Queries

```sql
-- For policies checking multiple columns
CREATE INDEX idx_documents_org_owner ON documents(org_id, created_by);

-- For time-bounded queries
CREATE INDEX idx_announcements_active ON announcements(org_id, published_at, expires_at)
  WHERE published_at IS NOT NULL;
```

## Query Plan Analysis

### EXPLAIN ANALYZE with RLS

```sql
-- First, set auth context
SELECT set_config('request.jwt.claims', '{"sub": "user-uuid-here"}', true);

-- Analyze query with RLS applied
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM documents WHERE title ILIKE '%report%';

-- Look for:
-- 1. Seq Scan on large tables (bad)
-- 2. Index Scan (good)
-- 3. Filter rows removed (indicates RLS working)
-- 4. Nested Loop (may indicate subquery overhead)
```

### Example Analysis

```
Seq Scan on documents  (cost=0.00..25000.00 rows=1 width=100) (actual time=0.050..150.000 rows=50 loops=1)
  Filter: ((org_id = ANY (auth.user_org_ids())) AND (title ~~* '%report%'))
  Rows Removed by Filter: 99950
  Buffers: shared hit=5000
Planning Time: 0.500 ms
Execution Time: 150.500 ms
```

**Problem**: Full table scan (Seq Scan), 99,950 rows filtered.

**Solution**: Add index on org_id:

```sql
CREATE INDEX idx_documents_org_id ON documents(org_id);
```

**After index**:
```
Index Scan using idx_documents_org_id on documents  (cost=0.42..8.44 rows=1 width=100) (actual time=0.025..0.100 rows=50 loops=1)
  Index Cond: (org_id = ANY (auth.user_org_ids()))
  Filter: (title ~~* '%report%')
  Rows Removed by Filter: 0
  Buffers: shared hit=10
Planning Time: 0.200 ms
Execution Time: 0.150 ms
```

## Caching Strategies

### STABLE Functions

PostgreSQL caches results of `STABLE` functions within a single transaction:

```sql
-- STABLE = result cached within transaction
CREATE OR REPLACE FUNCTION auth.user_org_ids()
RETURNS UUID[] AS $$
  SELECT COALESCE(ARRAY_AGG(org_id), ARRAY[]::UUID[])
  FROM org_members
  WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY INVOKER;

-- Called once per query, not once per row
-- CRITICAL: Use STABLE, not VOLATILE
```

### Immutable for Constants

```sql
-- IMMUTABLE = result never changes (cacheable across transactions)
CREATE OR REPLACE FUNCTION auth.admin_role_name()
RETURNS TEXT AS $$
  SELECT 'admin'::TEXT;
$$ LANGUAGE SQL IMMUTABLE;
```

### Function Volatility Comparison

| Volatility | Caching | Use For |
|------------|---------|---------|
| `VOLATILE` | None | Random, time-based, modifying |
| `STABLE` | Within transaction | Session data, JWT claims |
| `IMMUTABLE` | Always | Constants, pure transforms |

## Avoiding N+1 in Policies

### ❌ Problem: Subquery per row

```sql
-- SLOW: Subquery runs for each row
CREATE POLICY "Check membership per row"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_id = documents.org_id  -- Correlated subquery!
      AND user_id = auth.uid()
    )
  );
```

### ✅ Solution: Helper function with caching

```sql
-- FAST: Function result cached
CREATE POLICY "Check membership with helper"
  ON documents FOR SELECT
  USING (org_id = ANY(auth.user_org_ids()));  -- Single call, cached
```

### Performance Comparison

| Approach | 1K rows | 10K rows | 100K rows |
|----------|---------|----------|-----------|
| Correlated subquery | 50ms | 500ms | 5000ms |
| Helper function | 5ms | 8ms | 15ms |
| JWT claim | 2ms | 3ms | 5ms |

## Materialized Views for Complex Hierarchies

### When to Use

- Deep team hierarchies (recursive CTEs)
- Complex permission calculations
- Frequently accessed, rarely changed data

### Implementation

```sql
-- Materialized view for team access
CREATE MATERIALIZED VIEW mv_user_team_access AS
WITH RECURSIVE team_tree AS (
  -- Direct memberships
  SELECT tm.user_id, tm.team_id, t.org_id, 1 AS depth
  FROM team_members tm
  JOIN teams t ON t.id = tm.team_id

  UNION ALL

  -- Inherited access from parent teams
  SELECT tt.user_id, child.id, child.org_id, tt.depth + 1
  FROM team_tree tt
  JOIN teams child ON child.parent_team_id = tt.team_id
  WHERE tt.depth < 10  -- Prevent infinite recursion
)
SELECT DISTINCT user_id, team_id, org_id
FROM team_tree;

-- Index the materialized view
CREATE INDEX idx_mv_user_team_user ON mv_user_team_access(user_id);
CREATE INDEX idx_mv_user_team_team ON mv_user_team_access(team_id);

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_team_access()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_team_access;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger on membership changes
CREATE TRIGGER trg_refresh_team_access
AFTER INSERT OR UPDATE OR DELETE ON team_members
FOR EACH STATEMENT EXECUTE FUNCTION refresh_team_access();
```

### Use in RLS Policy

```sql
-- Fast lookup against materialized view
CREATE POLICY "Team access via materialized view"
  ON documents FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM mv_user_team_access
      WHERE user_id = auth.uid()
    )
  );
```

## JWT Claims for High-Performance Access

### Setup

```typescript
// Set tenant context at login (server-side)
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: {
    org_id: userOrgId,
    team_ids: userTeamIds,
    role: userRole,
  },
});
```

### RLS Using Claims

```sql
-- Fast: No database lookup needed
CREATE OR REPLACE FUNCTION auth.jwt_org_id()
RETURNS UUID AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'org_id',
    ''
  )::UUID;
$$ LANGUAGE SQL STABLE SECURITY INVOKER;

CREATE POLICY "Org access from JWT"
  ON documents FOR SELECT
  USING (org_id = auth.jwt_org_id());
```

### Trade-offs

| Approach | Latency | Consistency | Complexity |
|----------|---------|-------------|------------|
| Database lookup | Higher | Real-time | Lower |
| JWT claims | Lower | Eventual | Higher |

**Use JWT claims when**:
- Performance is critical
- Membership changes infrequently
- Acceptable delay for permission updates (until token refresh)

## Benchmarking

### Simple Benchmark Function

```sql
CREATE OR REPLACE FUNCTION benchmark_rls_query(iterations INTEGER DEFAULT 100)
RETURNS TABLE(
  avg_ms NUMERIC,
  min_ms NUMERIC,
  max_ms NUMERIC,
  p95_ms NUMERIC
) AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  timings NUMERIC[];
  i INTEGER;
BEGIN
  FOR i IN 1..iterations LOOP
    start_time := clock_timestamp();

    PERFORM * FROM documents;  -- Your query here

    end_time := clock_timestamp();
    timings := array_append(timings,
      EXTRACT(MILLISECOND FROM end_time - start_time));
  END LOOP;

  RETURN QUERY SELECT
    ROUND(AVG(t), 2),
    ROUND(MIN(t), 2),
    ROUND(MAX(t), 2),
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY t), 2)
  FROM UNNEST(timings) AS t;
END;
$$ LANGUAGE plpgsql;

-- Run benchmark
SELECT set_config('request.jwt.claims', '{"sub": "user-uuid"}', true);
SELECT * FROM benchmark_rls_query(100);
```

### Compare Before/After

```sql
-- Before optimization
SELECT * FROM benchmark_rls_query(100);
-- avg_ms: 45.23, p95_ms: 78.50

-- After adding index
CREATE INDEX idx_documents_org_id ON documents(org_id);
SELECT * FROM benchmark_rls_query(100);
-- avg_ms: 2.15, p95_ms: 4.30
```

## Performance Checklist

### Before Deployment

- [ ] All policy columns indexed
- [ ] EXPLAIN ANALYZE shows Index Scan (not Seq Scan)
- [ ] Helper functions marked STABLE
- [ ] No correlated subqueries in hot paths
- [ ] Benchmarked with production data volume

### Monitoring in Production

```sql
-- Find slow queries with RLS
SELECT
  query,
  calls,
  mean_time,
  total_time
FROM pg_stat_statements
WHERE query LIKE '%documents%'
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## Common Performance Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Slow on large tables | Missing index | Add index on policy columns |
| Linear degradation with users | Per-row subquery | Use helper function |
| Slow first query | Cold cache | Warm cache or use JWT |
| Slow after membership change | Stale materialized view | Refresh trigger |
| Variable performance | VOLATILE function | Change to STABLE |
