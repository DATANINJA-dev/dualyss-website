# RLS Testing Strategies

Comprehensive testing approaches for Supabase Row-Level Security policies.

## Problem Statement

RLS policies are notoriously difficult to test:
- Bugs often only appear in production (with real users)
- Testing requires simulating different user contexts
- Negative tests (denied access) are easily forgotten
- Policy interactions can have unexpected results
- Performance impact is hard to measure pre-deployment

This guide provides systematic testing strategies to catch issues before production.

## Testing Approaches

| Approach | Best For | Setup Complexity |
|----------|----------|------------------|
| **pgTAP** | SQL-level unit tests | Medium |
| **Supabase CLI** | Local development testing | Low |
| **Integration Tests** | Application-level verification | Medium |
| **CI/CD Pipeline** | Automated regression testing | High |

## Local Supabase Setup

### Initialize Local Development

```bash
# Initialize Supabase project
supabase init

# Start local instance
supabase start

# Apply migrations (including RLS policies)
supabase db reset
```

### Test Database Configuration

```sql
-- supabase/migrations/00000000000000_test_setup.sql

-- Create test helper functions
CREATE OR REPLACE FUNCTION test.set_auth_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object(
    'sub', user_id,
    'role', 'authenticated',
    'aud', 'authenticated'
  )::text, true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION test.clear_auth()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', '', true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION test.set_auth_with_claims(
  user_id UUID,
  claims JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', (
    jsonb_build_object(
      'sub', user_id,
      'role', 'authenticated',
      'aud', 'authenticated'
    ) || claims
  )::text, true);
END;
$$ LANGUAGE plpgsql;
```

## pgTAP Unit Tests

### Setup pgTAP Extension

```sql
-- supabase/migrations/00000000000001_enable_pgtap.sql
CREATE EXTENSION IF NOT EXISTS pgtap;
```

### Basic RLS Test Structure

```sql
-- supabase/tests/rls_policies_test.sql

BEGIN;

-- Plan the number of tests
SELECT plan(10);

-- ===========================================
-- Test Setup: Create test data
-- ===========================================

-- Create test users
INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'user_a@test.com'),
  ('22222222-2222-2222-2222-222222222222', 'user_b@test.com'),
  ('33333333-3333-3333-3333-333333333333', 'admin@test.com');

-- Create test organizations
INSERT INTO organizations (id, name)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Org A'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Org B');

-- Create memberships
INSERT INTO org_members (org_id, user_id, role)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'member'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'member'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'admin');

-- Create test documents
INSERT INTO documents (id, org_id, title, created_by)
VALUES
  ('doc-a-1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Org A Doc 1', '11111111-1111-1111-1111-111111111111'),
  ('doc-a-2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Org A Doc 2', '33333333-3333-3333-3333-333333333333'),
  ('doc-b-1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Org B Doc 1', '22222222-2222-2222-2222-222222222222');

-- ===========================================
-- Test 1: User can read own org's documents
-- ===========================================

SELECT test.set_auth_user('11111111-1111-1111-1111-111111111111');

SELECT is(
  (SELECT COUNT(*) FROM documents WHERE org_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  2::bigint,
  'User A can see all Org A documents'
);

-- ===========================================
-- Test 2: User CANNOT read other org's documents
-- ===========================================

SELECT is(
  (SELECT COUNT(*) FROM documents WHERE org_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  0::bigint,
  'User A cannot see Org B documents'
);

-- ===========================================
-- Test 3: User can insert into own org
-- ===========================================

SELECT lives_ok(
  $$
    INSERT INTO documents (org_id, title, created_by)
    VALUES (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'New Doc',
      '11111111-1111-1111-1111-111111111111'
    )
  $$,
  'User A can insert into Org A'
);

-- ===========================================
-- Test 4: User CANNOT insert into other org
-- ===========================================

SELECT throws_ok(
  $$
    INSERT INTO documents (org_id, title, created_by)
    VALUES (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'Sneaky Doc',
      '11111111-1111-1111-1111-111111111111'
    )
  $$,
  '42501',  -- insufficient_privilege
  NULL,
  'User A cannot insert into Org B'
);

-- ===========================================
-- Test 5: User can update own documents
-- ===========================================

SELECT lives_ok(
  $$
    UPDATE documents
    SET title = 'Updated Title'
    WHERE id = 'doc-a-1'
  $$,
  'User A can update their own document'
);

-- ===========================================
-- Test 6: User CANNOT update others' documents
-- ===========================================

-- Verify the update had no effect on admin's document
SELECT test.set_auth_user('11111111-1111-1111-1111-111111111111');

UPDATE documents SET title = 'Hacked!' WHERE id = 'doc-a-2';

SELECT is(
  (SELECT title FROM documents WHERE id = 'doc-a-2'),
  'Org A Doc 2',
  'User A cannot update admin document (update silently fails)'
);

-- ===========================================
-- Test 7: Admin can update any document in org
-- ===========================================

SELECT test.set_auth_user('33333333-3333-3333-3333-333333333333');

SELECT lives_ok(
  $$
    UPDATE documents
    SET title = 'Admin Updated'
    WHERE id = 'doc-a-1'
  $$,
  'Admin can update any Org A document'
);

-- ===========================================
-- Test 8: Verify cross-tenant isolation (negative test)
-- ===========================================

SELECT test.set_auth_user('11111111-1111-1111-1111-111111111111');

SELECT is(
  (SELECT COUNT(*) FROM documents),
  3::bigint,  -- User A sees Org A docs only (including new one from test 3)
  'Total visible documents respects RLS'
);

-- ===========================================
-- Test 9: Anon users have no access
-- ===========================================

SELECT test.clear_auth();

SELECT is(
  (SELECT COUNT(*) FROM documents),
  0::bigint,
  'Unauthenticated users see no documents'
);

-- ===========================================
-- Test 10: Delete policy works
-- ===========================================

SELECT test.set_auth_user('11111111-1111-1111-1111-111111111111');

-- Try to delete own document
DELETE FROM documents WHERE id = 'doc-a-1';

SELECT is(
  (SELECT COUNT(*) FROM documents WHERE id = 'doc-a-1'),
  0::bigint,
  'User can delete own document'
);

-- Cleanup and finish
SELECT * FROM finish();
ROLLBACK;
```

### Running pgTAP Tests

```bash
# Run all tests
supabase test db

# Run specific test file
supabase test db supabase/tests/rls_policies_test.sql

# With verbose output
supabase test db --debug
```

## Integration Testing (TypeScript)

### Test Setup

```typescript
// tests/rls.test.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

// Test configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper to create authenticated client
async function createAuthenticatedClient(email: string, password: string) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

describe('RLS Policies', () => {
  let adminClient: SupabaseClient;
  let userAClient: SupabaseClient;
  let userBClient: SupabaseClient;

  beforeAll(async () => {
    // Setup: Create test users and data with service role
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create test users
    await adminClient.auth.admin.createUser({
      email: 'user_a@test.com',
      password: 'test123456',
      email_confirm: true,
    });

    await adminClient.auth.admin.createUser({
      email: 'user_b@test.com',
      password: 'test123456',
      email_confirm: true,
    });

    // Get authenticated clients
    userAClient = await createAuthenticatedClient('user_a@test.com', 'test123456');
    userBClient = await createAuthenticatedClient('user_b@test.com', 'test123456');

    // Setup test data...
  });

  afterAll(async () => {
    // Cleanup test data
    await adminClient.from('documents').delete().neq('id', '');
    await adminClient.from('org_members').delete().neq('user_id', '');
    await adminClient.from('organizations').delete().neq('id', '');
  });

  describe('Document Access', () => {
    it('user can read documents in their organization', async () => {
      const { data, error } = await userAClient
        .from('documents')
        .select('*')
        .eq('org_id', testOrgAId);

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
    });

    it('user CANNOT read documents in other organizations', async () => {
      const { data, error } = await userAClient
        .from('documents')
        .select('*')
        .eq('org_id', testOrgBId);

      expect(error).toBeNull();
      expect(data).toHaveLength(0); // RLS filters results
    });

    it('user can insert documents in their organization', async () => {
      const { data, error } = await userAClient
        .from('documents')
        .insert({ org_id: testOrgAId, title: 'New Doc' })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.title).toBe('New Doc');
    });

    it('user CANNOT insert documents in other organizations', async () => {
      const { data, error } = await userAClient
        .from('documents')
        .insert({ org_id: testOrgBId, title: 'Sneaky Doc' })
        .select()
        .single();

      expect(error).not.toBeNull();
      expect(error?.code).toBe('42501'); // insufficient_privilege
    });
  });

  describe('Negative Tests - Unauthorized Access', () => {
    it('unauthenticated request sees no data', async () => {
      const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data, error } = await anonClient
        .from('documents')
        .select('*');

      expect(error).toBeNull();
      expect(data).toHaveLength(0);
    });

    it('user cannot update documents they do not own', async () => {
      // User A tries to update User B's document
      const { error } = await userAClient
        .from('documents')
        .update({ title: 'Hacked!' })
        .eq('id', userBDocumentId);

      // RLS silently filters - no error but no rows affected
      // Verify document unchanged
      const { data } = await adminClient
        .from('documents')
        .select('title')
        .eq('id', userBDocumentId)
        .single();

      expect(data?.title).not.toBe('Hacked!');
    });

    it('user cannot delete documents from other orgs', async () => {
      const { error } = await userAClient
        .from('documents')
        .delete()
        .eq('id', userBDocumentId);

      // Verify document still exists
      const { data } = await adminClient
        .from('documents')
        .select('id')
        .eq('id', userBDocumentId)
        .single();

      expect(data).not.toBeNull();
    });
  });
});
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test-rls.yml
name: Test RLS Policies

on:
  push:
    paths:
      - 'supabase/migrations/**'
      - 'supabase/tests/**'
  pull_request:
    paths:
      - 'supabase/migrations/**'

jobs:
  test-rls:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Start Supabase
        run: |
          supabase start
          supabase db reset

      - name: Run pgTAP tests
        run: supabase test db

      - name: Run integration tests
        env:
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          npm ci
          npm run test:rls

      - name: Stop Supabase
        if: always()
        run: supabase stop
```

## Test Checklist

### For Each Table with RLS

- [ ] **SELECT**: User can read allowed rows
- [ ] **SELECT (negative)**: User cannot read disallowed rows
- [ ] **INSERT**: User can insert valid rows
- [ ] **INSERT (negative)**: User cannot insert invalid rows
- [ ] **UPDATE**: User can update allowed rows
- [ ] **UPDATE (negative)**: User cannot update disallowed rows
- [ ] **DELETE**: User can delete allowed rows
- [ ] **DELETE (negative)**: User cannot delete disallowed rows
- [ ] **Anon access**: Unauthenticated requests handled correctly
- [ ] **Cross-tenant**: Complete isolation verified

### Policy Interaction Tests

- [ ] Multiple policies on same operation (OR logic)
- [ ] USING vs WITH CHECK interaction
- [ ] Role-based policy escalation prevention
- [ ] Soft-delete awareness in policies

## Common Test Mistakes

### ❌ Testing only happy paths

```typescript
// WRONG: Only tests successful access
it('user can access documents', async () => {
  const { data } = await userClient.from('documents').select('*');
  expect(data.length).toBeGreaterThan(0);
});

// CORRECT: Also test denied access
it('user CANNOT access other org documents', async () => {
  const { data } = await userClient
    .from('documents')
    .select('*')
    .eq('org_id', otherOrgId);
  expect(data).toHaveLength(0);
});
```

### ❌ Using service role for all tests

```typescript
// WRONG: Service role bypasses RLS
const { data } = await adminClient.from('documents').select('*');
// This always returns all documents!

// CORRECT: Use authenticated client
const { data } = await userClient.from('documents').select('*');
// This respects RLS policies
```

### ❌ Not testing UPDATE behavior

```typescript
// RLS UPDATE policies don't throw errors - they silently filter
// WRONG assumption: Expecting error on denied update
const { error } = await userClient
  .update({ title: 'New' })
  .eq('id', otherUserDocId);
expect(error).not.toBeNull(); // FAILS! No error thrown

// CORRECT: Verify data unchanged
await userClient.from('documents')
  .update({ title: 'Hacked!' })
  .eq('id', otherUserDocId);

const { data } = await adminClient
  .from('documents')
  .select('title')
  .eq('id', otherUserDocId)
  .single();

expect(data?.title).not.toBe('Hacked!');
```

## Performance Testing

```sql
-- Test policy performance
EXPLAIN ANALYZE
SELECT * FROM documents
WHERE org_id = 'test-org-id';

-- Check if indexes are being used
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM documents
WHERE org_id IN (
  SELECT org_id FROM org_members WHERE user_id = 'test-user-id'
);
```

See [rls-performance.md](./rls-performance.md) for optimization strategies.
