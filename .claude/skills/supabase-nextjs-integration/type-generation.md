# Type Generation

Generating TypeScript types from your Supabase database schema for type-safe queries.

## Use Case

Use this pattern when:
- Setting up a new Supabase + Next.js project
- Your database schema has changed
- You want autocomplete for table/column names
- You need type-safe query results and mutations

## Implementation

### Prerequisites

```bash
# Install Supabase CLI
npm install -D supabase

# Or globally
npm install -g supabase
```

### Generate Types from Remote Database

```bash
# Login to Supabase (one-time)
npx supabase login

# Generate types
npx supabase gen types typescript --project-id your-project-id > types/database.ts
```

### Generate Types from Local Development

```bash
# Start local Supabase
npx supabase start

# Generate from local
npx supabase gen types typescript --local > types/database.ts
```

### Recommended Directory Structure

```
types/
├── database.ts      # Generated - DO NOT EDIT
├── supabase.ts      # Re-exports and custom types
└── index.ts         # Barrel export
```

### Generated Type Structure

```typescript
// types/database.ts (generated)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      // ... other tables
    }
    Views: {
      // ... views
    }
    Functions: {
      // ... functions
    }
    Enums: {
      // ... enums
    }
  }
}
```

### Custom Type Helpers (types/supabase.ts)

```typescript
import type { Database } from './database'

// Table row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']

// Insert types (for creating new records)
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type PostInsert = Database['public']['Tables']['posts']['Insert']

// Update types (for partial updates)
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type PostUpdate = Database['public']['Tables']['posts']['Update']

// Enum types
export type PostStatus = Database['public']['Enums']['post_status']

// Function return types
export type GetUserPostsReturn = Database['public']['Functions']['get_user_posts']['Returns']
```

### Package.json Script

```json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > types/database.ts",
    "db:types:local": "supabase gen types typescript --local > types/database.ts"
  }
}
```

## Type Safety

### Typed Client Usage

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/supabase'

export default async function ProfilePage() {
  const supabase = await createClient()

  // Autocomplete for table names
  const { data, error } = await supabase
    .from('profiles')  // TypeScript knows this table exists
    .select('id, display_name, avatar_url')  // Autocomplete for columns
    .single()

  // data is typed as Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null

  return <div>{data?.display_name}</div>
}
```

### Typed Inserts

```typescript
import type { ProfileInsert } from '@/types/supabase'

const newProfile: ProfileInsert = {
  id: userId,
  display_name: 'John Doe',
  // avatar_url is optional (has default)
  // created_at is optional (has default)
}

const { error } = await supabase
  .from('profiles')
  .insert(newProfile)  // TypeScript validates the shape
```

### Typed Updates

```typescript
import type { ProfileUpdate } from '@/types/supabase'

const updates: ProfileUpdate = {
  display_name: 'Jane Doe',
  // Only include fields you want to update
}

const { error } = await supabase
  .from('profiles')
  .update(updates)  // TypeScript validates partial shape
  .eq('id', userId)
```

### Typed RPC Calls

```typescript
// For database functions
const { data, error } = await supabase
  .rpc('get_user_posts', { user_id: userId })

// data is typed based on function return type
```

## CI/CD Integration

### GitHub Action for Type Generation

```yaml
# .github/workflows/update-types.yml
name: Update Database Types

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

jobs:
  update-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Generate types
        run: npx supabase gen types typescript --project-id ${{ secrets.SUPABASE_PROJECT_ID }} > types/database.ts
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Create PR if types changed
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: update database types'
          title: 'chore: update database types'
          branch: update-db-types
```

## Common Mistakes

### Not Regenerating After Schema Changes

```typescript
// Schema was updated to add 'bio' column
// But types weren't regenerated

const { data } = await supabase
  .from('profiles')
  .select('bio')  // TypeScript error: 'bio' doesn't exist

// Solution: Run `npm run db:types` after schema changes
```

### Editing Generated Files

```typescript
// types/database.ts
// DO NOT EDIT - This file will be overwritten

export type Database = {
  // Adding custom types here will be lost on regeneration
}

// Instead, add custom types to types/supabase.ts
```

### Wrong Select Type Inference

```typescript
// This returns all columns
const { data: full } = await supabase.from('profiles').select('*')
// full: Profile | null

// This returns specific columns
const { data: partial } = await supabase.from('profiles').select('id, name')
// partial: Pick<Profile, 'id' | 'name'> | null

// Common mistake: assuming select() returns full row
const { data } = await supabase.from('profiles').select('id')
data?.display_name  // TypeScript error - not selected!
```

### Missing Null Checks

```typescript
const { data } = await supabase.from('profiles').select('*').single()

// data can be null
console.log(data.display_name)  // Possible runtime error!

// Always check for null
if (data) {
  console.log(data.display_name)
}

// Or use optional chaining
console.log(data?.display_name)
```

## Testing

### Verify Types Compile

```bash
# Add to CI pipeline
npx tsc --noEmit
```

### Type Test Example

```typescript
// types/__tests__/database.test.ts
import type { Database, Profile, ProfileInsert } from '@/types/supabase'
import { expectType } from 'tsd'

// Verify Profile has expected fields
declare const profile: Profile
expectType<string>(profile.id)
expectType<string | null>(profile.display_name)

// Verify Insert makes required fields optional
declare const insert: ProfileInsert
expectType<string>(insert.id)  // id is required
// display_name is optional in Insert
```

## Related Patterns

- [ssr-setup.md](./ssr-setup.md) - Using typed clients
- [server-components.md](./server-components.md) - Type-safe data fetching
- [server-actions.md](./server-actions.md) - Type-safe mutations
