# Common RLS Pitfalls

Security anti-patterns and lessons learned from real-world vulnerabilities, including CVE-2025-48757.

## CVE-2025-48757 Analysis

### Overview

Security researchers discovered over **170 applications** with critical RLS misconfigurations in 2025. The vulnerability analysis revealed common patterns that led to:

- Complete data exposure between tenants
- Privilege escalation via user-controlled metadata
- Authentication bypass through policy logic errors
- Data modification by unauthorized users

### Root Causes

| Category | Frequency | Severity |
|----------|-----------|----------|
| Missing RLS on tables | 35% | Critical |
| User-controlled policy inputs | 25% | Critical |
| Overly permissive defaults | 20% | High |
| Missing operation policies | 15% | High |
| Function security issues | 5% | Medium |

### Key Lesson

> Most RLS vulnerabilities are not sophisticated attacks. They are simple oversights: forgetting to enable RLS, trusting user-controllable data, or missing policies for specific operations.

## Anti-Pattern 1: Trusting user_metadata

### ❌ The Vulnerability

```sql
-- DANGEROUS: user_metadata can be modified by users!
CREATE POLICY "Check role from metadata"
  ON admin_data FOR SELECT
  USING (
    auth.jwt()->'user_metadata'->>'role' = 'admin'
  );
```

**Why it's dangerous**: Users can update their own `user_metadata` via the Supabase client:

```typescript
// Attacker can do this:
await supabase.auth.updateUser({
  data: { role: 'admin' }  // Grants themselves admin!
});
```

### ✅ The Fix

```sql
-- SAFE: Use app_metadata (server-controlled) or database table
CREATE POLICY "Check role from app_metadata"
  ON admin_data FOR SELECT
  USING (
    auth.jwt()->'app_metadata'->>'role' = 'admin'
  );

-- EVEN SAFER: Use a database table for roles
CREATE POLICY "Check role from database"
  ON admin_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

### How to Detect

```sql
-- Find policies using user_metadata
SELECT
  schemaname,
  tablename,
  policyname,
  qual
FROM pg_policies
WHERE qual::text LIKE '%user_metadata%';
```

### Remediation

1. Audit all policies for `user_metadata` usage
2. Replace with `app_metadata` or database lookups
3. Move role assignment to server-side only
4. Add tests for role manipulation attempts

## Anti-Pattern 2: Missing SECURITY INVOKER

### ❌ The Vulnerability

```sql
-- DANGEROUS: Function runs with definer's privileges
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS SETOF profiles AS $$
  SELECT * FROM profiles;
$$ LANGUAGE SQL;  -- Defaults to SECURITY DEFINER
```

**Why it's dangerous**: If this function is called from an RLS policy or accessible to users, it bypasses RLS because it runs with the function owner's privileges.

### ✅ The Fix

```sql
-- SAFE: Function runs with caller's privileges
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS SETOF profiles AS $$
  SELECT * FROM profiles;
$$ LANGUAGE SQL SECURITY INVOKER;
```

### When to Use Each

| Mode | Use When | Risk |
|------|----------|------|
| `SECURITY INVOKER` | Default - most functions | Low |
| `SECURITY DEFINER` | Admin functions needing elevated access | High (requires audit) |

### How to Detect

```sql
-- Find functions without explicit SECURITY INVOKER
SELECT
  proname,
  prosecdef  -- true = SECURITY DEFINER
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
AND prosecdef = true;
```

### Remediation

1. Audit all functions for `SECURITY DEFINER`
2. Add explicit `SECURITY INVOKER` to policy-related functions
3. Document why each `SECURITY DEFINER` function needs elevated privileges
4. Restrict `SECURITY DEFINER` functions to admin operations only

## Anti-Pattern 3: Forgetting to Enable RLS

### ❌ The Vulnerability

```sql
-- Table created but RLS not enabled
CREATE TABLE sensitive_data (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  ssn TEXT,
  credit_card TEXT
);

-- No ALTER TABLE ... ENABLE ROW LEVEL SECURITY!
-- All data is accessible to anyone with the anon key
```

### ✅ The Fix

```sql
-- ALWAYS enable RLS immediately after table creation
CREATE TABLE sensitive_data (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  ssn TEXT,
  credit_card TEXT
);

ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner
ALTER TABLE sensitive_data FORCE ROW LEVEL SECURITY;

-- Now add policies
CREATE POLICY "Users see own data"
  ON sensitive_data FOR SELECT
  USING (auth.uid() = user_id);
```

### How to Detect

```sql
-- Find tables without RLS enabled
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT tablename FROM pg_policies
)
AND tablename NOT LIKE 'pg_%'
AND tablename NOT LIKE '_prisma_%';
```

### Remediation

1. Run detection query regularly (CI/CD)
2. Enable RLS on all user-facing tables
3. Create migration to retroactively enable RLS
4. Use database hooks to auto-enable RLS on new tables

## Anti-Pattern 4: Missing DELETE Policies

### ❌ The Vulnerability

```sql
-- Policies only for SELECT, INSERT, UPDATE
CREATE POLICY "read" ON items FOR SELECT USING (...);
CREATE POLICY "write" ON items FOR INSERT WITH CHECK (...);
CREATE POLICY "update" ON items FOR UPDATE USING (...) WITH CHECK (...);

-- DELETE has no policy! Defaults to deny, but...
-- If someone adds a permissive DELETE policy later, it's wide open
```

### ✅ The Fix

```sql
-- ALWAYS create explicit policies for ALL operations
CREATE POLICY "read" ON items FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "write" ON items FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "update" ON items FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "delete" ON items FOR DELETE USING (auth.uid() = owner_id);
```

### How to Detect

```sql
-- Find tables missing DELETE policies
WITH table_policies AS (
  SELECT
    tablename,
    ARRAY_AGG(DISTINCT cmd) AS commands
  FROM pg_policies
  WHERE schemaname = 'public'
  GROUP BY tablename
)
SELECT tablename
FROM table_policies
WHERE NOT 'd' = ANY(commands)  -- 'd' = DELETE
AND 's' = ANY(commands);       -- Has SELECT, so RLS is in use
```

### Remediation

1. Audit all tables with RLS for missing operation policies
2. Add explicit DELETE policies
3. Document intentional omissions (if DELETE should be denied)
4. Add to code review checklist

## Anti-Pattern 5: Overly Permissive Defaults

### ❌ The Vulnerability

```sql
-- "Allow all" policy that overrides restrictions
CREATE POLICY "Allow all read" ON data FOR SELECT USING (true);

-- Later, someone adds a restriction thinking it helps
CREATE POLICY "Restrict to org" ON data FOR SELECT
  USING (org_id = auth.user_org_id());

-- PROBLEM: Policies are OR'd together!
-- "Allow all" + "Restrict to org" = ALLOW ALL
```

### ✅ The Fix

```sql
-- Don't use permissive defaults
-- Start with restrictive policies only

CREATE POLICY "Users read own org data"
  ON data FOR SELECT
  USING (org_id = auth.user_org_id());

CREATE POLICY "Admins read all"
  ON data FOR SELECT
  USING (auth.user_role() = 'admin');

-- These OR together correctly:
-- User sees own org OR is admin
```

### Understanding Policy Logic

```sql
-- Multiple policies on same operation = OR (any can grant access)
-- USING vs WITH CHECK = AND (both must pass for UPDATE)

-- Policy combination examples:
-- Policy A: USING (is_public = true)
-- Policy B: USING (owner_id = auth.uid())
-- Result: Can read if public OR if owner

-- For restrictive (all must pass), use single policy with AND:
CREATE POLICY "Restrictive"
  ON data FOR SELECT
  USING (
    is_public = true
    AND org_id = auth.user_org_id()
  );
```

### How to Detect

```sql
-- Find overly permissive policies
SELECT
  tablename,
  policyname,
  qual
FROM pg_policies
WHERE qual::text = 'true'
   OR qual::text LIKE '%true%';
```

## Anti-Pattern 6: Forgetting WITH CHECK on UPDATE

### ❌ The Vulnerability

```sql
-- UPDATE with only USING
CREATE POLICY "Update own"
  ON documents FOR UPDATE
  USING (auth.uid() = owner_id);
-- No WITH CHECK!

-- User can update their document to change owner_id:
UPDATE documents SET owner_id = 'other-user-id' WHERE id = 'my-doc';
-- Now 'other-user-id' owns the document!
```

### ✅ The Fix

```sql
-- UPDATE needs both USING and WITH CHECK
CREATE POLICY "Update own"
  ON documents FOR UPDATE
  USING (auth.uid() = owner_id)        -- Can update IF you own it
  WITH CHECK (auth.uid() = owner_id);  -- New value must still be yours
```

### When to Allow owner_id Changes

```sql
-- If admins should be able to transfer ownership
CREATE POLICY "Admin transfer ownership"
  ON documents FOR UPDATE
  USING (auth.user_role() = 'admin')
  WITH CHECK (
    -- New owner must exist and be in same org
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = owner_id
      AND org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );
```

## Anti-Pattern 7: RLS on Views Without SECURITY INVOKER

### ❌ The Vulnerability

```sql
-- View created by superuser
CREATE VIEW user_summary AS
  SELECT id, email, COUNT(*) as doc_count
  FROM profiles
  JOIN documents ON documents.owner_id = profiles.id
  GROUP BY profiles.id;

-- View runs with definer (superuser) privileges
-- RLS on underlying tables is bypassed!
```

### ✅ The Fix

```sql
-- Use SECURITY INVOKER views (PostgreSQL 15+)
CREATE VIEW user_summary
WITH (security_invoker = true) AS
  SELECT id, email, COUNT(*) as doc_count
  FROM profiles
  JOIN documents ON documents.owner_id = profiles.id
  GROUP BY profiles.id;
```

### For Older PostgreSQL

```sql
-- Alternative: Use function wrapper
CREATE FUNCTION get_user_summary()
RETURNS TABLE(id UUID, email TEXT, doc_count BIGINT)
SECURITY INVOKER AS $$
  SELECT id, email, COUNT(*)
  FROM profiles
  JOIN documents ON documents.owner_id = profiles.id
  GROUP BY profiles.id;
$$ LANGUAGE SQL;
```

## Security Checklist

### Before Production

- [ ] RLS enabled on ALL user-facing tables
- [ ] No `user_metadata` in policy conditions
- [ ] All functions use `SECURITY INVOKER` (unless documented exception)
- [ ] Policies exist for ALL operations (SELECT, INSERT, UPDATE, DELETE)
- [ ] No `USING (true)` permissive policies
- [ ] UPDATE policies have both USING and WITH CHECK
- [ ] Views use `security_invoker = true` (PostgreSQL 15+)
- [ ] Cross-tenant isolation tested
- [ ] Negative tests (denied access) written

### Ongoing Monitoring

```sql
-- Weekly security audit query
WITH security_issues AS (
  -- Tables without RLS
  SELECT 'Missing RLS' as issue, tablename as details
  FROM pg_tables
  WHERE schemaname = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename
  )
  AND tablename NOT LIKE 'pg_%'

  UNION ALL

  -- Permissive policies
  SELECT 'Permissive policy', tablename || '.' || policyname
  FROM pg_policies
  WHERE qual::text = 'true'

  UNION ALL

  -- user_metadata usage
  SELECT 'user_metadata in policy', tablename || '.' || policyname
  FROM pg_policies
  WHERE qual::text LIKE '%user_metadata%'

  UNION ALL

  -- SECURITY DEFINER functions
  SELECT 'SECURITY DEFINER function', proname::text
  FROM pg_proc
  WHERE pronamespace = 'public'::regnamespace
  AND prosecdef = true
)
SELECT * FROM security_issues;
```

## Recovery Patterns

### Emergency: Disable Compromised Access

```sql
-- Immediately revoke all access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Re-grant with RLS enforcement
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
```

### Fix Exposed Data

```sql
-- 1. Enable RLS on compromised table
ALTER TABLE exposed_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE exposed_table FORCE ROW LEVEL SECURITY;

-- 2. Add restrictive policy
CREATE POLICY "Lockdown" ON exposed_table
  FOR ALL
  USING (false)    -- Deny all until proper policies added
  WITH CHECK (false);

-- 3. Add correct policies
CREATE POLICY "Proper access" ON exposed_table
  FOR SELECT
  USING (auth.uid() = owner_id);

-- 4. Drop lockdown
DROP POLICY "Lockdown" ON exposed_table;
```

### Audit Compromised Period

```sql
-- Check what was accessed during vulnerability window
SELECT
  timestamp,
  actor_id,
  action,
  resource_type,
  resource_id
FROM audit_log
WHERE timestamp BETWEEN '2026-01-01' AND '2026-01-15'
AND (
  action LIKE 'read_%'
  OR action LIKE 'export_%'
)
ORDER BY timestamp;
```

## Related Resources

- [rls-policy-patterns.md](./rls-policy-patterns.md) - Correct policy patterns
- [rls-testing.md](./rls-testing.md) - Testing strategies
- [service-role-patterns.md](./service-role-patterns.md) - Safe bypass patterns
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
