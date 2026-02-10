---
name: supabase-nextjs-integration
description: Production-ready patterns for Next.js + Supabase integration with @supabase/ssr, Server Components, Server Actions, and middleware authentication
---

# Supabase + Next.js Integration Skill

Comprehensive patterns for building production-ready Next.js applications with Supabase, focusing on the App Router architecture.

## Overview

This skill provides production patterns for integrating Supabase with Next.js 14/15 App Router applications. It covers:

- Server-side rendering with `@supabase/ssr`
- Type-safe database queries with generated types
- Authentication with cookie-based sessions
- Data fetching in Server Components
- Mutations with Server Actions
- Middleware token refresh
- Real-time subscriptions

> **Security Note**: Always use `getUser()` for auth validation, never trust `getSession()` alone. Session data can be forged by the client. See [middleware-auth.md](./middleware-auth.md).

## Type

**Passive** - Auto-activates based on context detection.

## Auto-Activation Triggers

### Keywords
- "Next.js Supabase"
- "@supabase/ssr"
- "Server Components"
- "Server Actions"
- "middleware auth"
- "Supabase auth"
- "createServerClient"
- "createBrowserClient"

### File Patterns
- `**/lib/supabase/**`
- `**/utils/supabase/**`
- `**/middleware.ts`
- `**/app/**/page.tsx`
- `**/app/**/actions.ts`

### Task Contexts
- Implementing Next.js + Supabase projects
- Server-side data fetching with Supabase
- Form mutations with Server Actions
- Authentication middleware setup
- Cookie-based session management

## Quick Navigation by Goal

| I want to... | Read |
|--------------|------|
| Set up Supabase in a Next.js project | [ssr-setup.md](./ssr-setup.md) |
| Generate TypeScript types for my database | [type-generation.md](./type-generation.md) |
| Fetch data in Server Components | [server-components.md](./server-components.md) |
| Handle form submissions with Server Actions | [server-actions.md](./server-actions.md) |
| Set up auth middleware for token refresh | [middleware-auth.md](./middleware-auth.md) |
| Understand cookie session security | [cookie-sessions.md](./cookie-sessions.md) |
| Add real-time subscriptions | [real-time-patterns.md](./real-time-patterns.md) |
| Migrate from Pages Router or compare approaches | [app-vs-pages-router.md](./app-vs-pages-router.md) |

## Reading Order for New Users

**Foundation** (start here):
1. [ssr-setup.md](./ssr-setup.md) - Client setup for Server/Browser
2. [type-generation.md](./type-generation.md) - Type-safe database queries

**Core Patterns** (most common use cases):
3. [server-components.md](./server-components.md) - Data fetching
4. [server-actions.md](./server-actions.md) - Mutations
5. [middleware-auth.md](./middleware-auth.md) - Auth token refresh

**Advanced Topics**:
6. [cookie-sessions.md](./cookie-sessions.md) - Session security
7. [real-time-patterns.md](./real-time-patterns.md) - Subscriptions
8. [app-vs-pages-router.md](./app-vs-pages-router.md) - Router comparison

## Supporting Files

| File | Purpose |
|------|---------|
| [ssr-setup.md](./ssr-setup.md) | @supabase/ssr client configuration |
| [type-generation.md](./type-generation.md) | Database type generation workflow |
| [server-components.md](./server-components.md) | Async data fetching patterns |
| [server-actions.md](./server-actions.md) | Form handling with 'use server' |
| [middleware-auth.md](./middleware-auth.md) | Token refresh and route protection |
| [cookie-sessions.md](./cookie-sessions.md) | Secure session management |
| [real-time-patterns.md](./real-time-patterns.md) | Subscription setup and cleanup |
| [app-vs-pages-router.md](./app-vs-pages-router.md) | Router differences and migration |

## Quick Reference

### Server Client Setup

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
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
            // Called from Server Component - read-only
          }
        },
      },
    }
  )
}
```

### Server Component Data Fetching

```typescript
// app/profile/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()

  // Always use getUser() for auth validation
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return <div>{profile?.display_name}</div>
}
```

### Server Action

```typescript
// app/profile/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: formData.get('name') as string })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}
```

## Integration Points

### Consumed By
- `task-code-impact` - For analyzing Next.js + Supabase changes
- `stack-skill-recommender` - For Next.js + Supabase project detection
- `task-security` - For auth pattern analysis

### References
- [supabase-rls-patterns](../supabase-rls-patterns/SKILL.md) - RLS policy patterns
- [supabase-edge-functions](../supabase-edge-functions/SKILL.md) - Edge Function invocation
- [react-best-practices](../react-best-practices/SKILL.md) - React optimization patterns
- [typescript-advanced-patterns](../typescript-advanced-patterns/SKILL.md) - Type-safe patterns

## Version Compatibility

| Package | Minimum Version | Notes |
|---------|-----------------|-------|
| `@supabase/ssr` | 0.5.0 | Stable cookie API |
| `@supabase/supabase-js` | 2.39.0 | Required by @supabase/ssr |
| Next.js | 14.0.0 | App Router support |
| Next.js | 15.0.0 | Full async cookies() support |

## Related Skills

- **supabase-rls-patterns** - Row-Level Security for data access control
- **supabase-edge-functions** - Serverless functions with Deno
- **react-best-practices** - React/Next.js optimization patterns
- **typescript-advanced-patterns** - Advanced TypeScript for type-safe patterns
- **security-patterns** - Authentication and authorization best practices
