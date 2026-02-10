# SSR Client Setup

Setting up `@supabase/ssr` for Server-Side Rendering in Next.js App Router applications.

## Use Case

Use this pattern when:
- Setting up Supabase in a new Next.js 14/15 project
- Migrating from `@supabase/auth-helpers-nextjs` to `@supabase/ssr`
- You need separate clients for Server Components and Client Components
- You want type-safe database queries with generated types

## Installation

```bash
npm install @supabase/ssr @supabase/supabase-js
```

## Implementation

### Directory Structure

```
lib/
└── supabase/
    ├── server.ts     # Server Components, Server Actions, Route Handlers
    ├── client.ts     # Client Components
    └── middleware.ts # Middleware (optional, can inline in middleware.ts)
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Warning**: Never expose `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_` prefix. Service role keys bypass RLS and should only be used in server-side code that isn't bundled for the client.

### Server Client (lib/supabase/server.ts)

```typescript
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
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

### Browser Client (lib/supabase/client.ts)

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Middleware Client (lib/supabase/middleware.ts)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not use getSession() here - it can be spoofed
  // Use getUser() which validates the JWT on the server
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, user, response: supabaseResponse }
}
```

## Type Safety

### With Generated Types

```typescript
import type { Database } from '@/types/database'

// Client is fully typed
const supabase = createClient()

// TypeScript knows the shape of 'profiles' table
const { data } = await supabase
  .from('profiles')
  .select('id, display_name, avatar_url')
  .single()

// data is typed as:
// { id: string; display_name: string | null; avatar_url: string | null } | null
```

### Without Types (Not Recommended)

```typescript
// Works but no autocomplete or type checking
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: { ... } }
)
```

See [type-generation.md](./type-generation.md) for generating database types.

## Common Mistakes

### Exposing Service Role Key

```typescript
// Never do this - service role bypasses RLS
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!, // EXPOSED TO CLIENT!
  { cookies: { ... } }
)
```

### Caching Client Across Requests

```typescript
// Never cache the client at module level
let cachedClient: SupabaseClient | null = null

export function createClient() {
  if (!cachedClient) {
    cachedClient = createServerClient(...) // Wrong - shared across requests!
  }
  return cachedClient
}
```

Each request must create a fresh client to handle cookies correctly.

### Using getSession() for Authorization

```typescript
// Insecure - session can be forged
const { data: { session } } = await supabase.auth.getSession()
if (session) {
  // User could have forged session data
}

// Secure - validates JWT on server
const { data: { user } } = await supabase.auth.getUser()
if (user) {
  // User is definitely authenticated
}
```

### Missing Cookie Handler in setAll

```typescript
// Incomplete - will fail silently on auth state changes
cookies: {
  getAll() {
    return cookieStore.getAll()
  },
  // Missing setAll - auth refresh won't work!
}
```

## Testing

### Unit Test Setup

```typescript
// __tests__/lib/supabase/server.test.ts
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

describe('createClient', () => {
  it('creates a client with cookie handlers', async () => {
    const mockCookies = {
      getAll: jest.fn().mockReturnValue([]),
      set: jest.fn(),
    }
    ;(cookies as jest.Mock).mockResolvedValue(mockCookies)

    const client = await createClient()

    expect(client).toBeDefined()
    expect(client.from).toBeDefined()
  })
})
```

### Integration Test

```typescript
// Verify client can connect
const supabase = await createClient()
const { data, error } = await supabase.from('profiles').select('count')

expect(error).toBeNull()
```

## Related Patterns

- [middleware-auth.md](./middleware-auth.md) - Using the middleware client for auth
- [type-generation.md](./type-generation.md) - Generating the Database type
- [cookie-sessions.md](./cookie-sessions.md) - Understanding cookie security
