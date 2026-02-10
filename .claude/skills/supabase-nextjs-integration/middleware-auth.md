# Middleware Authentication

Patterns for handling auth token refresh and route protection in Next.js middleware with Supabase.

## Use Case

Use this pattern when:
- You need to refresh auth tokens before they expire
- Protecting routes server-side (before page renders)
- Handling session persistence across requests
- Implementing role-based access control at the edge

## Implementation

### Basic Middleware Setup

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
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

  // IMPORTANT: Do NOT use getSession() here
  // getSession() reads from cookies which can be spoofed
  // getUser() validates the JWT with Supabase auth server
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Protected Routes Pattern

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings']

// Routes only accessible when NOT authenticated
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if current route is auth-only (login, signup)
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}
```

### Role-Based Access Control

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const roleRoutes: Record<string, string[]> = {
  admin: ['/admin'],
  moderator: ['/admin', '/moderate'],
  user: ['/dashboard', '/profile'],
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return supabaseResponse
  }

  // Fetch user role from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'user'
  const allowedRoutes = roleRoutes[userRole] || []

  const pathname = request.nextUrl.pathname

  // Check if user has access to this route
  const hasAccess = allowedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Admin routes but user is not admin
  if (pathname.startsWith('/admin') && !hasAccess) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return supabaseResponse
}
```

### Extracting Reusable Middleware Helper

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return { supabase, user, response: supabaseResponse }
}

// middleware.ts
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request)

  // Your route protection logic here

  return response
}
```

## Type Safety

### Typed Middleware Helper

```typescript
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type MiddlewareResult = {
  supabase: SupabaseClient<Database>
  user: User | null
  response: NextResponse
}

export async function updateSession(
  request: NextRequest
): Promise<MiddlewareResult> {
  // Implementation
}
```

### Typed Role Check

```typescript
type UserRole = 'admin' | 'moderator' | 'user'

const roleHierarchy: Record<UserRole, number> = {
  admin: 3,
  moderator: 2,
  user: 1,
}

function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
```

## Common Mistakes

### Using getSession() Instead of getUser()

```typescript
// INSECURE - session comes from cookies, can be forged
const { data: { session } } = await supabase.auth.getSession()
if (session) {
  // User could have modified cookie data!
}
```

```typescript
// SECURE - validates JWT with Supabase auth server
const { data: { user } } = await supabase.auth.getUser()
if (user) {
  // User is definitely authenticated
}
```

### Not Returning the Response Object

```typescript
// Wrong - cookies won't be set properly
export async function middleware(request: NextRequest) {
  const { user } = await updateSession(request)

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Missing: return the supabaseResponse!
  // Token refresh cookies won't be saved
}
```

```typescript
// Correct - always return the response from updateSession
export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request)

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response  // Contains refreshed session cookies
}
```

### Incorrect Matcher Pattern

```typescript
// Matches everything including static files - slow!
export const config = {
  matcher: ['/:path*'],
}
```

```typescript
// Correct - excludes static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Database Queries in Middleware (Performance)

```typescript
// Slow - database query on every request
export async function middleware(request: NextRequest) {
  const { supabase, user } = await updateSession(request)

  // This runs on EVERY request
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Only do this for specific routes that need it
}
```

```typescript
// Better - only query when needed
export async function middleware(request: NextRequest) {
  const { supabase, user, response } = await updateSession(request)

  // Only query for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
}
```

### Not Preserving Request Headers

```typescript
// Wrong - loses headers
supabaseResponse = NextResponse.next()
```

```typescript
// Correct - preserves headers
supabaseResponse = NextResponse.next({ request })
```

## Testing

### Unit Test Middleware

```typescript
// __tests__/middleware.test.ts
import { middleware } from '@/middleware'
import { NextRequest } from 'next/server'

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn().mockReturnValue({
    auth: {
      getUser: jest.fn(),
    },
  }),
}))

describe('middleware', () => {
  it('redirects unauthenticated users from protected routes', async () => {
    const { createServerClient } = require('@supabase/ssr')
    createServerClient().auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const request = new NextRequest('http://localhost/dashboard')
    const response = await middleware(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login')
  })

  it('allows authenticated users to access protected routes', async () => {
    const { createServerClient } = require('@supabase/ssr')
    createServerClient().auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    const request = new NextRequest('http://localhost/dashboard')
    const response = await middleware(request)

    expect(response.status).toBe(200)
  })
})
```

### Integration Test

```typescript
// Test actual token refresh
describe('middleware token refresh', () => {
  it('refreshes expired tokens', async () => {
    // Set up request with near-expiry token
    const request = new NextRequest('http://localhost/dashboard')
    request.cookies.set('sb-access-token', expiredToken)
    request.cookies.set('sb-refresh-token', validRefreshToken)

    const response = await middleware(request)

    // Check that new tokens were set
    const setCookies = response.headers.get('set-cookie')
    expect(setCookies).toContain('sb-access-token')
  })
})
```

## Related Patterns

- [ssr-setup.md](./ssr-setup.md) - Middleware client setup
- [cookie-sessions.md](./cookie-sessions.md) - Session cookie security
- [server-components.md](./server-components.md) - Auth in Server Components
- [security-patterns](../security-patterns/SKILL.md) - Auth security best practices
