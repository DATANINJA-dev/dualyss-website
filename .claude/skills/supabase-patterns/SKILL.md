---
name: supabase-patterns
description: Patterns for Supabase integration with Next.js including server/browser clients, RLS policies, realtime, storage, and edge functions. Use when implementing database operations, auth flows, or realtime features.
---

# Supabase Patterns for Next.js

Knowledge base for Supabase integration patterns in Manager Assistant SaaS.

## Client Setup

### Server Client (for Server Components, Server Actions, Route Handlers)

```tsx
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component - ignore
          }
        }
      }
    }
  )
}
```

### Browser Client (for Client Components)

```tsx
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Service Role Client (for Admin Operations)

```tsx
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

// ONLY use in server-side code that needs admin privileges
// This bypasses RLS - use with extreme caution
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
```

### When to Use Each Client

| Client | Use Case | RLS Applied |
|--------|----------|-------------|
| Server Client | Server Components, Server Actions, Route Handlers | Yes |
| Browser Client | Client Components with 'use client' | Yes |
| Admin Client | Migrations, webhooks, cron jobs | No |

## Database Queries

### Basic SELECT Operations

```tsx
// Get all records
const { data, error } = await supabase
  .from('products')
  .select('*')

// Select specific columns
const { data, error } = await supabase
  .from('products')
  .select('id, name, description')

// With related data (joins)
const { data, error } = await supabase
  .from('products')
  .select(`
    *,
    epics (*),
    stories (
      id,
      title,
      status,
      story_points
    )
  `)

// Single record
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId)
  .single()
```

### Filters

```tsx
// Equality
.eq('status', 'active')

// Not equal
.neq('status', 'archived')

// Greater/Less than
.gt('story_points', 5)
.gte('story_points', 5)
.lt('story_points', 13)
.lte('story_points', 13)

// LIKE (pattern matching)
.like('name', '%search%')
.ilike('name', '%SEARCH%')  // Case insensitive

// IN
.in('status', ['todo', 'in_progress'])

// IS NULL
.is('deleted_at', null)

// Range
.range(0, 9)  // Pagination: first 10

// Contains (for arrays/JSON)
.contains('tags', ['urgent'])

// Full-text search
.textSearch('description', 'agile methodology')

// Combining filters
const { data, error } = await supabase
  .from('stories')
  .select('*')
  .eq('product_id', productId)
  .in('status', ['todo', 'in_progress'])
  .order('priority', { ascending: true })
  .limit(20)
```

### Ordering and Pagination

```tsx
// Order by
.order('created_at', { ascending: false })

// Multiple order columns
.order('priority', { ascending: true })
.order('created_at', { ascending: false })

// Pagination with range
.range(start, end)

// Example with pagination
const page = 1
const pageSize = 10
const start = (page - 1) * pageSize
const end = start + pageSize - 1

const { data, error, count } = await supabase
  .from('stories')
  .select('*', { count: 'exact' })
  .range(start, end)
```

### INSERT Operations

```tsx
// Single insert
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'Manager Assistant',
    description: 'AI-powered PM tool',
    user_id: userId
  })
  .select()
  .single()

// Multiple inserts
const { data, error } = await supabase
  .from('stories')
  .insert([
    { title: 'Story 1', product_id: productId },
    { title: 'Story 2', product_id: productId }
  ])
  .select()

// Upsert (insert or update)
const { data, error } = await supabase
  .from('settings')
  .upsert({
    user_id: userId,
    theme: 'dark',
    notifications: true
  })
  .select()
  .single()
```

### UPDATE Operations

```tsx
// Update single record
const { data, error } = await supabase
  .from('products')
  .update({ name: 'New Name' })
  .eq('id', productId)
  .select()
  .single()

// Update multiple records
const { data, error } = await supabase
  .from('stories')
  .update({ status: 'done' })
  .eq('sprint_id', sprintId)
  .select()

// Increment value
const { data, error } = await supabase.rpc('increment_story_points', {
  story_id: storyId,
  points_to_add: 3
})
```

### DELETE Operations

```tsx
// Delete single record
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId)

// Soft delete pattern
const { error } = await supabase
  .from('products')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', productId)
```

## Row Level Security (RLS)

### Enable RLS on Tables

```sql
-- Always enable RLS on tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
```

### Common RLS Policies

```sql
-- Users can only see their own products
CREATE POLICY "Users can view own products"
ON products FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own products
CREATE POLICY "Users can create own products"
ON products FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own products
CREATE POLICY "Users can update own products"
ON products FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own products
CREATE POLICY "Users can delete own products"
ON products FOR DELETE
USING (auth.uid() = user_id);
```

### Team-Based Access

```sql
-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members junction table
CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  PRIMARY KEY (team_id, user_id)
);

-- Products belong to teams
ALTER TABLE products ADD COLUMN team_id UUID REFERENCES teams(id);

-- Policy: Users can view products from their teams
CREATE POLICY "Team members can view team products"
ON products FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid()
  )
);

-- Policy: Only admins can delete products
CREATE POLICY "Team admins can delete products"
ON products FOR DELETE
USING (
  team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

### Helper Functions for RLS

```sql
-- Check if user is team member
CREATE OR REPLACE FUNCTION is_team_member(team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is team admin
CREATE OR REPLACE FUNCTION is_team_admin(team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use in policies
CREATE POLICY "Team members can view"
ON products FOR SELECT
USING (is_team_member(team_id));
```

## Authentication

### Sign Up

```tsx
// Server Action for sign up
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('name') as string
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/verify-email')
}
```

### Sign In

```tsx
// Server Action for sign in
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
```

### OAuth (Google, GitHub)

```tsx
// Server Action for OAuth
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })

  if (data.url) {
    redirect(data.url)
  }
}
```

### Auth Callback Route

```tsx
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could+not+authenticate`)
}
```

### Sign Out

```tsx
// Server Action for sign out
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

### Get Current User

```tsx
// In Server Component
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Hello {user.email}</div>
}
```

## Realtime Subscriptions

### Subscribe to Table Changes

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Story } from '@/types/database'

export function useRealtimeStories(productId: string) {
  const [stories, setStories] = useState<Story[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchStories = async () => {
      const { data } = await supabase
        .from('stories')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (data) setStories(data)
    }

    fetchStories()

    // Subscribe to changes
    const channel = supabase
      .channel(`stories:${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories',
          filter: `product_id=eq.${productId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setStories(prev => [payload.new as Story, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setStories(prev =>
              prev.map(s =>
                s.id === payload.new.id ? payload.new as Story : s
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setStories(prev =>
              prev.filter(s => s.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [productId])

  return stories
}
```

### Broadcast Channels (for Presence/Typing)

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PresenceState {
  user_id: string
  name: string
  online_at: string
}

export function usePresence(roomId: string, userId: string, userName: string) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([])
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>()
        const users = Object.values(state).flat()
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            name: userName,
            online_at: new Date().toISOString()
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, userId, userName])

  return onlineUsers
}
```

## Storage

### Upload Files

```tsx
// Server Action for file upload
'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadAttachment(
  formData: FormData,
  storyId: string
) {
  const supabase = await createClient()
  const file = formData.get('file') as File

  if (!file) {
    return { error: 'No file provided' }
  }

  // Generate unique file path
  const fileExt = file.name.split('.').pop()
  const fileName = `${storyId}/${crypto.randomUUID()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false
    })

  if (error) {
    return { error: error.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('attachments')
    .getPublicUrl(data.path)

  return { url: publicUrl, path: data.path }
}
```

### Download Files

```tsx
// Get signed URL for private files
const { data, error } = await supabase.storage
  .from('attachments')
  .createSignedUrl('path/to/file.pdf', 3600) // 1 hour expiry

// Download file
const { data, error } = await supabase.storage
  .from('attachments')
  .download('path/to/file.pdf')
```

### Delete Files

```tsx
const { error } = await supabase.storage
  .from('attachments')
  .remove(['path/to/file.pdf', 'path/to/another.png'])
```

### Storage Policies

```sql
-- Allow authenticated users to upload to their folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view files in their folder
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Edge Functions

### Create Edge Function

```typescript
// supabase/functions/estimate-story/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization')!

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: { headers: { Authorization: authHeader } }
      }
    )

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get request body
    const { storyId } = await req.json()

    // Fetch story details
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single()

    if (storyError) throw storyError

    // Call AI for estimation (example)
    const estimation = await estimateWithAI(story)

    return new Response(
      JSON.stringify({ estimation }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
```

### Call Edge Function from Client

```tsx
const { data, error } = await supabase.functions.invoke('estimate-story', {
  body: { storyId: 'uuid-here' }
})
```

## Database Functions (RPC)

### Create Database Function

```sql
-- Function to calculate sprint velocity
CREATE OR REPLACE FUNCTION calculate_velocity(sprint_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_points INTEGER;
BEGIN
  SELECT COALESCE(SUM(story_points), 0) INTO total_points
  FROM stories
  WHERE sprint_id = sprint_uuid AND status = 'done';

  RETURN total_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to move stories to sprint
CREATE OR REPLACE FUNCTION move_stories_to_sprint(
  story_ids UUID[],
  target_sprint_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE stories
  SET sprint_id = target_sprint_id, updated_at = NOW()
  WHERE id = ANY(story_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Call Database Functions

```tsx
// Call function with parameters
const { data, error } = await supabase.rpc('calculate_velocity', {
  sprint_uuid: sprintId
})

// Call function with array parameter
const { error } = await supabase.rpc('move_stories_to_sprint', {
  story_ids: ['uuid1', 'uuid2', 'uuid3'],
  target_sprint_id: sprintId
})
```

## Type Generation

### Generate Types from Database

```bash
# Install Supabase CLI
npm install supabase --save-dev

# Generate types
npx supabase gen types typescript --project-id "your-project-id" > types/database.ts

# Or from local database
npx supabase gen types typescript --local > types/database.ts
```

### Using Generated Types

```tsx
// types/database.ts (generated)
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}

// Use in client
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Get typed data
const { data } = await supabase
  .from('products')
  .select('*')
  .single()

// data is typed as Database['public']['Tables']['products']['Row']
```

## Error Handling Pattern

```tsx
// lib/supabase/errors.ts
export class SupabaseError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.code = code
    this.name = 'SupabaseError'
  }
}

export function handleSupabaseError(error: any): never {
  if (error.code === 'PGRST116') {
    throw new SupabaseError('Record not found', 'NOT_FOUND')
  }
  if (error.code === '23505') {
    throw new SupabaseError('Record already exists', 'DUPLICATE')
  }
  if (error.code === '42501') {
    throw new SupabaseError('Permission denied', 'FORBIDDEN')
  }

  throw new SupabaseError(error.message || 'Database error', 'UNKNOWN')
}

// Usage
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('id', id)
  .single()

if (error) {
  handleSupabaseError(error)
}
```

## Migration Best Practices

```sql
-- migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables with proper constraints
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_team_id ON products(team_id);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only, never expose

# Site URL for auth redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
