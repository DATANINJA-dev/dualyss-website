# Multi-Tenant RLS Strategies

Patterns for isolating data between organizations, teams, and workspaces in SaaS applications.

## Problem Statement

Multi-tenant applications must guarantee complete data isolation between tenants. Common challenges:

- Cross-tenant data leakage (catastrophic security failure)
- Complex permission hierarchies (org → team → user)
- Performance impact from JOIN-heavy policies
- Handling shared resources across tenants
- Supporting multiple tenancy models (org-based, team-based, workspace-based)

## Multi-Tenancy Models

| Model | Best For | Complexity |
|-------|----------|------------|
| **Org-Based** | B2B SaaS with clear organization boundaries | Low |
| **Team-Based** | Collaborative apps with team hierarchies | Medium |
| **Workspace-Based** | Project management, content platforms | Medium |
| **Hierarchical** | Enterprise with nested org structures | High |

## Pattern 1: Simple Organization-Based Isolation

**Use Case**: Each organization has isolated data, all members have equal access.

### Schema

```sql
-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members
CREATE TABLE org_members (
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- Org-scoped data table (example: documents)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL: Add index for RLS performance
CREATE INDEX idx_documents_org_id ON documents(org_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
```

### RLS Policies

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user's organizations
CREATE OR REPLACE FUNCTION auth.user_org_ids()
RETURNS UUID[] AS $$
  SELECT COALESCE(
    ARRAY_AGG(org_id),
    ARRAY[]::UUID[]
  )
  FROM org_members
  WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY INVOKER;

-- Organizations: Members can see their orgs
CREATE POLICY "Members see their orgs"
  ON organizations FOR SELECT
  TO authenticated
  USING (id = ANY(auth.user_org_ids()));

-- Org Members: Members can see other members in their orgs
CREATE POLICY "See org members"
  ON org_members FOR SELECT
  TO authenticated
  USING (org_id = ANY(auth.user_org_ids()));

-- Documents: Members can read org documents
CREATE POLICY "Members read org documents"
  ON documents FOR SELECT
  TO authenticated
  USING (org_id = ANY(auth.user_org_ids()));

-- Documents: Members can create in their orgs
CREATE POLICY "Members create org documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id = ANY(auth.user_org_ids())
    AND created_by = auth.uid()
  );

-- Documents: Creators can update their documents
CREATE POLICY "Creators update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    org_id = ANY(auth.user_org_ids())
    AND created_by = auth.uid()
  )
  WITH CHECK (
    org_id = ANY(auth.user_org_ids())
    AND created_by = auth.uid()
  );

-- Documents: Creators can delete their documents
CREATE POLICY "Creators delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    org_id = ANY(auth.user_org_ids())
    AND created_by = auth.uid()
  );
```

### Testing

```sql
-- Verify isolation: User A should not see User B's org data
SELECT set_config('request.jwt.claims', '{"sub": "user-a-uuid"}', true);
SELECT * FROM documents WHERE org_id = 'user-b-org-uuid';
-- Expected: 0 rows

-- Verify access: User A should see their org data
SELECT set_config('request.jwt.claims', '{"sub": "user-a-uuid"}', true);
SELECT * FROM documents WHERE org_id = 'user-a-org-uuid';
-- Expected: User A's documents
```

## Pattern 2: Role-Based Organization Access

**Use Case**: Organization members have different permission levels (admin, editor, viewer).

### Schema Addition

```sql
-- Role definitions
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- Update org_members to use typed roles
ALTER TABLE org_members ALTER COLUMN role TYPE org_role USING role::org_role;
```

### RLS Policies with Roles

```sql
-- Helper: Check user's role in an org
CREATE OR REPLACE FUNCTION auth.user_org_role(check_org_id UUID)
RETURNS org_role AS $$
  SELECT role
  FROM org_members
  WHERE user_id = auth.uid() AND org_id = check_org_id;
$$ LANGUAGE SQL STABLE SECURITY INVOKER;

-- Documents: All members can read
CREATE POLICY "Members read documents"
  ON documents FOR SELECT
  TO authenticated
  USING (org_id = ANY(auth.user_org_ids()));

-- Documents: Editors+ can create
CREATE POLICY "Editors create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.user_org_role(org_id) IN ('owner', 'admin', 'editor')
    AND created_by = auth.uid()
  );

-- Documents: Editors+ can update (their own), Admins+ can update any
CREATE POLICY "Update documents by role"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    org_id = ANY(auth.user_org_ids())
    AND (
      created_by = auth.uid()  -- Own documents
      OR auth.user_org_role(org_id) IN ('owner', 'admin')  -- Admin override
    )
  )
  WITH CHECK (
    org_id = ANY(auth.user_org_ids())
  );

-- Documents: Admins+ can delete
CREATE POLICY "Admins delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    auth.user_org_role(org_id) IN ('owner', 'admin')
  );

-- Org Members: Only admins can manage members
CREATE POLICY "Admins manage members"
  ON org_members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.user_org_role(org_id) IN ('owner', 'admin')
  );

CREATE POLICY "Admins update members"
  ON org_members FOR UPDATE
  TO authenticated
  USING (auth.user_org_role(org_id) IN ('owner', 'admin'))
  WITH CHECK (
    auth.user_org_role(org_id) IN ('owner', 'admin')
    -- Prevent role escalation: can't grant higher than own role
    AND (
      auth.user_org_role(org_id) = 'owner'
      OR role NOT IN ('owner')
    )
  );
```

## Pattern 3: Team-Based Hierarchical Access

**Use Case**: Organizations with teams, where team membership grants access to team resources.

### Schema

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_team_id UUID REFERENCES teams(id),  -- For nested teams
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  PRIMARY KEY (team_id, user_id)
);

-- Documents now belong to teams
ALTER TABLE documents ADD COLUMN team_id UUID REFERENCES teams(id);

CREATE INDEX idx_teams_org_id ON teams(org_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_documents_team_id ON documents(team_id);
```

### RLS Policies

```sql
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Helper: Get user's team IDs
CREATE OR REPLACE FUNCTION auth.user_team_ids()
RETURNS UUID[] AS $$
  SELECT COALESCE(ARRAY_AGG(team_id), ARRAY[]::UUID[])
  FROM team_members
  WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY INVOKER;

-- Teams: Members see teams in their orgs
CREATE POLICY "See org teams"
  ON teams FOR SELECT
  TO authenticated
  USING (org_id = ANY(auth.user_org_ids()));

-- Team Members: See members of teams you're in
CREATE POLICY "See team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (team_id = ANY(auth.user_team_ids()));

-- Documents: Access by team membership
CREATE POLICY "Team members read documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    team_id = ANY(auth.user_team_ids())
    OR team_id IS NULL AND org_id = ANY(auth.user_org_ids())  -- Org-level docs
  );

-- Documents: Team members can create
CREATE POLICY "Team members create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    (team_id = ANY(auth.user_team_ids()) OR team_id IS NULL)
    AND org_id = ANY(auth.user_org_ids())
    AND created_by = auth.uid()
  );
```

## Pattern 4: JWT Claims for Tenant Context

**Use Case**: High-performance access where tenant ID is embedded in JWT.

### Setup (Server-Side)

```typescript
// When generating JWT, include org_id claim
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Set custom claims via admin API or database trigger
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: {
    org_id: userOrgId,
    role: userRole,
  },
});
```

### RLS Policies

```sql
-- Helper: Get org_id from JWT claims (fast - no DB lookup)
CREATE OR REPLACE FUNCTION auth.jwt_org_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->'app_metadata'->>'org_id')::UUID,
    NULL
  );
$$ LANGUAGE SQL STABLE SECURITY INVOKER;

-- Documents: Use JWT claim for fast filtering
CREATE POLICY "Org members read documents (JWT)"
  ON documents FOR SELECT
  TO authenticated
  USING (org_id = auth.jwt_org_id());

-- CRITICAL: Ensure claim refresh when user changes orgs
```

**⚠️ Warning**: JWT claims are cached until token refresh. If a user changes organizations, they need a new token.

## Pattern 5: Intentional Cross-Tenant Sharing

**Use Case**: Allow specific resources to be shared across organizations (e.g., templates, public assets).

### Schema

```sql
CREATE TABLE shared_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_org_id UUID NOT NULL REFERENCES organizations(id),
  resource_type TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  shared_with_orgs UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shared_resources_shared_with ON shared_resources USING GIN(shared_with_orgs);
```

### RLS Policies

```sql
ALTER TABLE shared_resources ENABLE ROW LEVEL SECURITY;

-- Can read if: own org, explicitly shared, or public
CREATE POLICY "Read shared resources"
  ON shared_resources FOR SELECT
  TO authenticated
  USING (
    owner_org_id = ANY(auth.user_org_ids())  -- Own org
    OR auth.user_org_ids() && shared_with_orgs  -- Shared with my org
    OR is_public = true  -- Public
  );

-- Only owner org can modify
CREATE POLICY "Owner manages resources"
  ON shared_resources FOR ALL
  TO authenticated
  USING (owner_org_id = ANY(auth.user_org_ids()))
  WITH CHECK (owner_org_id = ANY(auth.user_org_ids()));
```

## Anti-Patterns

### ❌ Don't: Trust client-provided tenant ID

```sql
-- WRONG: Client can pass any org_id
CREATE POLICY "Read by org_id param"
  ON documents FOR SELECT
  USING (org_id = current_setting('app.current_org_id')::UUID);
-- Attacker can set app.current_org_id to any value!

-- CORRECT: Always verify membership
CREATE POLICY "Read by verified membership"
  ON documents FOR SELECT
  USING (org_id = ANY(auth.user_org_ids()));
```

### ❌ Don't: Use expensive subqueries without caching

```sql
-- WRONG: Subquery runs for every row
CREATE POLICY "Expensive check"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM org_members
      WHERE org_id = documents.org_id
      AND user_id = auth.uid()
    )
  );
-- Performance degrades as tables grow

-- BETTER: Use helper function (PostgreSQL caches within transaction)
CREATE POLICY "Cached check"
  ON documents FOR SELECT
  USING (org_id = ANY(auth.user_org_ids()));
```

### ❌ Don't: Forget to filter JOINed tables

```sql
-- WRONG: RLS on documents but joining unprotected comments
SELECT d.*, c.*
FROM documents d
JOIN comments c ON c.document_id = d.id;
-- If comments table has no RLS, all comments are visible!

-- CORRECT: Enable RLS on ALL related tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments follow document access"
  ON comments FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE org_id = ANY(auth.user_org_ids())
    )
  );
```

## Performance Considerations

### Index Strategy

```sql
-- Essential indexes for multi-tenant queries
CREATE INDEX idx_documents_org_id ON documents(org_id);
CREATE INDEX idx_documents_org_team ON documents(org_id, team_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_org_members_org_user ON org_members(org_id, user_id);
```

### Helper Function Caching

PostgreSQL caches `STABLE` function results within a transaction:

```sql
-- STABLE ensures result is cached per-transaction
CREATE OR REPLACE FUNCTION auth.user_org_ids()
RETURNS UUID[] AS $$
  SELECT COALESCE(ARRAY_AGG(org_id), ARRAY[]::UUID[])
  FROM org_members
  WHERE user_id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY INVOKER;
-- Called once per query, not once per row
```

### Materialized Views for Complex Hierarchies

```sql
-- For deeply nested team structures
CREATE MATERIALIZED VIEW user_accessible_team_ids AS
WITH RECURSIVE team_tree AS (
  -- Base: direct memberships
  SELECT team_id, user_id
  FROM team_members

  UNION

  -- Recursive: parent team access grants child access
  SELECT t.id, tt.user_id
  FROM teams t
  JOIN team_tree tt ON t.parent_team_id = tt.team_id
)
SELECT * FROM team_tree;

-- Refresh periodically or via trigger
CREATE INDEX idx_user_accessible_teams ON user_accessible_team_ids(user_id);
```

## Testing Multi-Tenant Isolation

```sql
-- Test function: Verify complete isolation
CREATE OR REPLACE FUNCTION test_tenant_isolation()
RETURNS TABLE(test_name TEXT, passed BOOLEAN, details TEXT) AS $$
DECLARE
  org_a_id UUID;
  org_b_id UUID;
  user_a_id UUID;
  user_b_id UUID;
BEGIN
  -- Setup: Create test orgs and users
  -- ... (setup code)

  -- Test 1: User A cannot see Org B documents
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', user_a_id)::text, true);

  IF EXISTS (SELECT 1 FROM documents WHERE org_id = org_b_id) THEN
    RETURN QUERY SELECT 'Cross-tenant read', false,
      'User A could read Org B documents';
  ELSE
    RETURN QUERY SELECT 'Cross-tenant read', true, 'Properly isolated';
  END IF;

  -- Additional tests...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

See [rls-testing.md](./rls-testing.md) for comprehensive testing strategies.
