# RLS Policy Patterns

Complete CRUD policy patterns for Supabase Row-Level Security.

## Problem Statement

Developers often implement RLS policies through trial-and-error, leading to:
- Security vulnerabilities (data leakage between users)
- Missing policies for some operations (especially DELETE)
- Inconsistent policy patterns across tables
- Performance issues from poorly designed conditions

This guide provides copy-pasteable patterns that work correctly.

## Foundational Concepts

### Policy Structure

```sql
CREATE POLICY "policy_name"
  ON table_name
  FOR operation           -- SELECT, INSERT, UPDATE, DELETE, ALL
  TO role_name            -- anon, authenticated, service_role
  USING (condition)       -- Filter existing rows (read/update/delete)
  WITH CHECK (condition); -- Validate new/modified rows (insert/update)
```

### When to Use Each Clause

| Operation | USING | WITH CHECK | Purpose |
|-----------|-------|------------|---------|
| SELECT | ✓ | - | Which rows can be read |
| INSERT | - | ✓ | Validate new rows |
| UPDATE | ✓ | ✓ | USING: which rows can be updated; WITH CHECK: validate changes |
| DELETE | ✓ | - | Which rows can be deleted |

## CRUD Policy Patterns

### Pattern 1: User-Owned Data

**Use Case**: Each user owns their records (profiles, settings, personal data).

```sql
-- Enable RLS (required first!)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can create their own profile
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

**Testing Strategy**:
```sql
-- Test as user A
SET request.jwt.claims = '{"sub": "user-a-uuid"}';
SELECT * FROM profiles; -- Should only see user A's profile

-- Test as user B
SET request.jwt.claims = '{"sub": "user-b-uuid"}';
SELECT * FROM profiles; -- Should only see user B's profile
```

### Pattern 2: Public Read, Authenticated Write

**Use Case**: Content visible to everyone, but only authors can modify.

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- SELECT: Anyone can read published posts
CREATE POLICY "Anyone can read published posts"
  ON posts FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- SELECT: Authors can read their own drafts
CREATE POLICY "Authors can read own drafts"
  ON posts FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id AND published = false);

-- INSERT: Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- UPDATE: Authors can update their own posts
CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- DELETE: Authors can delete their own posts
CREATE POLICY "Authors can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);
```

### Pattern 3: Role-Based Access (Custom Claims)

**Use Case**: Different permissions based on user role stored in JWT claims.

```sql
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get role from JWT
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'user'
  );
$$ LANGUAGE SQL STABLE SECURITY INVOKER;

-- SELECT: Admins can view all settings
CREATE POLICY "Admins can view settings"
  ON admin_settings FOR SELECT
  TO authenticated
  USING (auth.user_role() = 'admin');

-- UPDATE: Admins can update settings
CREATE POLICY "Admins can update settings"
  ON admin_settings FOR UPDATE
  TO authenticated
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');
```

**⚠️ Security Warning**: Never use `auth.jwt()->>'role'` or `user_metadata` - these can be manipulated by users. Always use custom claims set server-side or a roles table.

### Pattern 4: Conditional Access (Soft Delete)

**Use Case**: Tables with soft delete where deleted records should be hidden.

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- SELECT: Only show non-deleted documents
CREATE POLICY "Users see non-deleted docs"
  ON documents FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id
    AND deleted_at IS NULL
  );

-- UPDATE: Prevent updating deleted documents
CREATE POLICY "Users update non-deleted docs"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_id
    AND deleted_at IS NULL
  )
  WITH CHECK (
    auth.uid() = owner_id
    -- Allow setting deleted_at but not un-deleting
  );

-- Soft delete policy (sets deleted_at instead of DELETE)
CREATE POLICY "Users can soft delete docs"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (
    auth.uid() = owner_id
    AND (
      -- Either no change to deleted_at, or setting it to NOW()
      deleted_at IS NOT DISTINCT FROM OLD.deleted_at
      OR deleted_at = NOW()
    )
  );
```

### Pattern 5: Time-Based Access

**Use Case**: Content with scheduled publish dates or expiration.

```sql
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- SELECT: Show only active announcements
CREATE POLICY "View active announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    published_at <= NOW()
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Admins can see all (including scheduled)
CREATE POLICY "Admins see all announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (auth.user_role() = 'admin');
```

## Anti-Patterns

### ❌ Don't: Forget to enable RLS

```sql
-- WRONG: Table has no RLS enabled
CREATE TABLE secrets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  secret_data TEXT
);
-- All data is accessible to anyone with anon key!

-- CORRECT: Always enable RLS
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;
```

### ❌ Don't: Use permissive defaults

```sql
-- WRONG: Allows everything, then tries to restrict
CREATE POLICY "Allow all" ON data FOR ALL USING (true);
CREATE POLICY "Restrict delete" ON data FOR DELETE USING (is_admin());
-- Both policies apply! OR logic means "Allow all" wins.

-- CORRECT: Deny by default, explicit grants only
CREATE POLICY "Users read own" ON data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins delete" ON data FOR DELETE USING (is_admin());
```

### ❌ Don't: Forget DELETE policies

```sql
-- WRONG: Only SELECT/INSERT/UPDATE covered
CREATE POLICY "read" ON items FOR SELECT USING (...);
CREATE POLICY "write" ON items FOR INSERT WITH CHECK (...);
CREATE POLICY "update" ON items FOR UPDATE USING (...) WITH CHECK (...);
-- DELETE has no policy - defaults to DENY (good) but often forgotten

-- CORRECT: Explicit DELETE policy
CREATE POLICY "delete" ON items FOR DELETE USING (auth.uid() = owner_id);
```

### ❌ Don't: Mix USING and WITH CHECK incorrectly

```sql
-- WRONG: Using only USING for INSERT
CREATE POLICY "insert" ON items FOR INSERT USING (auth.uid() = user_id);
-- Error: INSERT requires WITH CHECK, not USING

-- WRONG: Using only WITH CHECK for SELECT
CREATE POLICY "read" ON items FOR SELECT WITH CHECK (auth.uid() = user_id);
-- Error: SELECT requires USING, not WITH CHECK

-- CORRECT: Right clause for each operation
CREATE POLICY "insert" ON items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "read" ON items FOR SELECT USING (auth.uid() = user_id);
```

## Real-World Examples

### Example 1: E-commerce Orders

```sql
-- Orders table with customer and admin access
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers see their own orders
CREATE POLICY "Customers view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

-- Customers can create orders (for themselves)
CREATE POLICY "Customers create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = customer_id
    AND status = 'pending'  -- New orders must be pending
  );

-- Customers can cancel pending orders
CREATE POLICY "Customers cancel pending orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = customer_id
    AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = customer_id
    AND status = 'cancelled'  -- Can only change to cancelled
  );

-- Admins have full access
CREATE POLICY "Admins manage all orders"
  ON orders FOR ALL
  TO authenticated
  USING (auth.user_role() = 'admin')
  WITH CHECK (auth.user_role() = 'admin');
```

### Example 2: Comments with Moderation

```sql
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved comments
CREATE POLICY "Read approved comments"
  ON comments FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Authors can see their pending comments
CREATE POLICY "Authors see pending comments"
  ON comments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = author_id
    AND status = 'pending'
  );

-- Moderators see all comments
CREATE POLICY "Moderators see all"
  ON comments FOR SELECT
  TO authenticated
  USING (auth.user_role() IN ('moderator', 'admin'));

-- Users create comments (pending by default)
CREATE POLICY "Users create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND status = 'pending'  -- Force pending status
  );

-- Authors can edit pending comments
CREATE POLICY "Authors edit pending"
  ON comments FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = author_id
    AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = author_id
    AND status = 'pending'  -- Can't self-approve
  );

-- Moderators can update status
CREATE POLICY "Moderators moderate"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.user_role() IN ('moderator', 'admin'))
  WITH CHECK (auth.user_role() IN ('moderator', 'admin'));
```

## Performance Notes

- **Index policy columns**: Always index columns used in USING/WITH CHECK clauses
- **Avoid subqueries in hot paths**: Simple equality checks are fastest
- **Use function indexes** for computed conditions

```sql
-- Index for user_id lookups
CREATE INDEX idx_posts_author_id ON posts(author_id);

-- Index for published status
CREATE INDEX idx_posts_published ON posts(published) WHERE published = true;

-- Composite index for common queries
CREATE INDEX idx_posts_author_published ON posts(author_id, published);
```

See [rls-performance.md](./rls-performance.md) for detailed optimization strategies.
