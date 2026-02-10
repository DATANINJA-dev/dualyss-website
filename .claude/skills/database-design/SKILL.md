---
name: database-design
description: Knowledge about relational database design, PostgreSQL patterns, Supabase integration, and best practices for scalable data models. Use when creating schemas, migrations, or optimizing queries.
---

# Database Design Skill

## Overview
This skill provides comprehensive knowledge about relational database design, PostgreSQL patterns, Supabase integration, and best practices for building scalable data models.

---

## Entity-Relationship Modeling

### ER Diagram Notation

```
Entity (Table)
┌─────────────────┐
│     PRODUCT     │
├─────────────────┤
│ PK id           │
│    name         │
│    price        │
│ FK category_id  │
│    created_at   │
└─────────────────┘

Relationships:
──────────── 1:1 (One to One)
────────────< 1:N (One to Many)
>───────────< N:M (Many to Many)
```

### Cardinality Patterns

| Relationship | Example | Implementation |
|--------------|---------|----------------|
| 1:1 | User ↔ Profile | FK in either table or same table |
| 1:N | User → Posts | FK in child table |
| N:M | Posts ↔ Tags | Junction/pivot table |

---

## Manager Assistant Schema

### Core Entities

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (workspaces)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  vision TEXT,
  maturity TEXT DEFAULT 'mvp',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Epics
CREATE TABLE epics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo',
  color TEXT DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID REFERENCES epics(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria JSONB DEFAULT '[]',
  story_points INTEGER,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo',
  labels TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks (subtasks of stories)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  hours_estimated DECIMAL(4,1),
  hours_actual DECIMAL(4,1),
  status TEXT DEFAULT 'todo',
  assignee_id UUID REFERENCES profiles(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sprints
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planned',
  velocity_planned INTEGER,
  velocity_actual INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sprint Stories (M:N relationship)
CREATE TABLE sprint_stories (
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'todo',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (sprint_id, story_id)
);

-- Team Members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'developer',
  capacity_hours INTEGER DEFAULT 40,
  skills TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPIs
CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  current_value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  unit TEXT,
  frequency TEXT DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Conversations (chat history)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Indexes

### Performance Indexes
```sql
-- Foreign key indexes (critical for JOINs)
CREATE INDEX idx_stories_epic_id ON stories(epic_id);
CREATE INDEX idx_stories_product_id ON stories(product_id);
CREATE INDEX idx_tasks_story_id ON tasks(story_id);
CREATE INDEX idx_sprints_product_id ON sprints(product_id);
CREATE INDEX idx_epics_product_id ON epics(product_id);

-- Query optimization indexes
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_priority ON stories(priority);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_sprint_stories_status ON sprint_stories(status);

-- Composite indexes for common queries
CREATE INDEX idx_stories_product_status ON stories(product_id, status);
CREATE INDEX idx_sprints_product_dates ON sprints(product_id, start_date, end_date);

-- Text search indexes
CREATE INDEX idx_stories_title_search ON stories USING gin(to_tsvector('english', title));
```

---

## Row Level Security (RLS)

### Enable RLS
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Products: Users can only see their own products
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (user_id = auth.uid());

-- Epics: Access through product ownership
CREATE POLICY "Users can view epics of own products" ON epics
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage epics of own products" ON epics
  FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE user_id = auth.uid())
  );

-- Stories: Access through product ownership
CREATE POLICY "Users can view stories of own products" ON stories
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage stories of own products" ON stories
  FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE user_id = auth.uid())
  );

-- Sprints: Access through product ownership
CREATE POLICY "Users can view sprints of own products" ON sprints
  FOR SELECT USING (
    product_id IN (SELECT id FROM products WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage sprints of own products" ON sprints
  FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE user_id = auth.uid())
  );
```

---

## Database Functions

### Auto-update timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add more triggers as needed...
```

### Cascade sort order
```sql
CREATE OR REPLACE FUNCTION reorder_stories(
  p_story_id UUID,
  p_new_position INTEGER,
  p_epic_id UUID
) RETURNS VOID AS $$
DECLARE
  v_current_position INTEGER;
BEGIN
  SELECT sort_order INTO v_current_position
  FROM stories WHERE id = p_story_id;

  IF p_new_position < v_current_position THEN
    UPDATE stories
    SET sort_order = sort_order + 1
    WHERE epic_id = p_epic_id
      AND sort_order >= p_new_position
      AND sort_order < v_current_position;
  ELSE
    UPDATE stories
    SET sort_order = sort_order - 1
    WHERE epic_id = p_epic_id
      AND sort_order > v_current_position
      AND sort_order <= p_new_position;
  END IF;

  UPDATE stories
  SET sort_order = p_new_position
  WHERE id = p_story_id;
END;
$$ LANGUAGE plpgsql;
```

### Calculate sprint velocity
```sql
CREATE OR REPLACE FUNCTION calculate_sprint_velocity(p_sprint_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_velocity INTEGER;
BEGIN
  SELECT COALESCE(SUM(s.story_points), 0) INTO v_velocity
  FROM sprint_stories ss
  JOIN stories s ON ss.story_id = s.id
  WHERE ss.sprint_id = p_sprint_id
    AND ss.status = 'done';

  RETURN v_velocity;
END;
$$ LANGUAGE plpgsql;
```

---

## Migrations

### Migration File Structure
```
supabase/migrations/
├── 20250101000000_create_profiles.sql
├── 20250101000001_create_products.sql
├── 20250101000002_create_epics.sql
├── 20250101000003_create_stories.sql
├── 20250101000004_create_tasks.sql
├── 20250101000005_create_sprints.sql
├── 20250101000006_create_sprint_stories.sql
├── 20250101000007_create_team_members.sql
├── 20250101000008_create_kpis.sql
├── 20250101000009_create_conversations.sql
├── 20250101000010_add_rls_policies.sql
├── 20250101000011_add_indexes.sql
└── 20250101000012_add_functions.sql
```

### Migration Best Practices
```sql
-- Always include rollback
-- 20250101000000_create_profiles.sql

-- Up migration
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  -- ... columns
);

-- Down migration (comment)
-- DROP TABLE profiles;
```

---

## Query Patterns

### Get product with all related data
```sql
SELECT
  p.*,
  (
    SELECT json_agg(e.* ORDER BY e.sort_order)
    FROM epics e
    WHERE e.product_id = p.id
  ) as epics,
  (
    SELECT json_agg(s.* ORDER BY s.start_date DESC)
    FROM sprints s
    WHERE s.product_id = p.id
  ) as sprints
FROM products p
WHERE p.id = $1 AND p.user_id = auth.uid();
```

### Get backlog with stories grouped by epic
```sql
SELECT
  e.id,
  e.title,
  e.description,
  e.priority,
  e.color,
  COALESCE(
    json_agg(
      json_build_object(
        'id', s.id,
        'title', s.title,
        'story_points', s.story_points,
        'status', s.status,
        'priority', s.priority
      ) ORDER BY s.sort_order
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'
  ) as stories
FROM epics e
LEFT JOIN stories s ON s.epic_id = e.id
WHERE e.product_id = $1
GROUP BY e.id
ORDER BY e.sort_order;
```

### Get sprint board with story statuses
```sql
SELECT
  s.id,
  s.name,
  s.goal,
  s.start_date,
  s.end_date,
  json_build_object(
    'todo', (
      SELECT json_agg(st.*) FROM stories st
      JOIN sprint_stories ss ON ss.story_id = st.id
      WHERE ss.sprint_id = s.id AND ss.status = 'todo'
    ),
    'in_progress', (
      SELECT json_agg(st.*) FROM stories st
      JOIN sprint_stories ss ON ss.story_id = st.id
      WHERE ss.sprint_id = s.id AND ss.status = 'in_progress'
    ),
    'done', (
      SELECT json_agg(st.*) FROM stories st
      JOIN sprint_stories ss ON ss.story_id = st.id
      WHERE ss.sprint_id = s.id AND ss.status = 'done'
    )
  ) as columns,
  calculate_sprint_velocity(s.id) as velocity_actual
FROM sprints s
WHERE s.id = $1;
```

---

## TypeScript Types Generation

### Generate types from Supabase
```bash
npx supabase gen types typescript --project-id your-project-id > lib/database.types.ts
```

### Type usage
```typescript
import { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

type Story = Database['public']['Tables']['stories']['Row'];
```

---

## Normalization Guidelines

### First Normal Form (1NF)
- All columns contain atomic values
- No repeating groups

```sql
-- BAD: Repeating columns
CREATE TABLE stories (
  label1 TEXT,
  label2 TEXT,
  label3 TEXT
);

-- GOOD: Array or junction table
CREATE TABLE stories (
  labels TEXT[]
);
-- OR
CREATE TABLE story_labels (
  story_id UUID,
  label TEXT
);
```

### Second Normal Form (2NF)
- 1NF + no partial dependencies

### Third Normal Form (3NF)
- 2NF + no transitive dependencies

```sql
-- BAD: Transitive dependency
CREATE TABLE stories (
  epic_id UUID,
  epic_name TEXT,  -- Depends on epic_id, not story
  product_id UUID
);

-- GOOD: Normalize
CREATE TABLE stories (
  epic_id UUID REFERENCES epics(id)
);
CREATE TABLE epics (
  id UUID,
  name TEXT,
  product_id UUID
);
```

---

## Performance Tips

1. **Index foreign keys** - Critical for JOIN performance
2. **Use EXPLAIN ANALYZE** - Understand query plans
3. **Avoid SELECT *** - Only fetch needed columns
4. **Batch operations** - Use bulk inserts/updates
5. **Connection pooling** - Use Supabase connection pooler
6. **Paginate results** - Never fetch unlimited rows
7. **Cache frequently accessed data** - Consider Redis for hot data

---

## Quick Reference

### Common Column Types
| PostgreSQL Type | Usage |
|-----------------|-------|
| UUID | Primary keys |
| TEXT | Variable length strings |
| INTEGER | Whole numbers |
| DECIMAL(p,s) | Precise numbers |
| BOOLEAN | True/false |
| TIMESTAMPTZ | Dates with timezone |
| JSONB | Structured JSON data |
| TEXT[] | Array of strings |

### Naming Conventions
- Tables: `snake_case`, plural (`products`, `stories`)
- Columns: `snake_case` (`created_at`, `user_id`)
- Indexes: `idx_table_column` (`idx_stories_status`)
- Foreign keys: `table_id` (`product_id`)
- Primary keys: `id`
