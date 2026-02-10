# Cookie-Based Session Management

Understanding and securing cookie-based authentication sessions with Supabase in Next.js.

## Use Case

Use this pattern when:
- You need to understand how Supabase sessions work in Next.js
- Configuring secure cookie settings for production
- Debugging session-related issues
- Implementing custom session handling

## How Supabase Sessions Work

### Session Flow

```
1. User logs in → Supabase returns access_token + refresh_token
2. @supabase/ssr stores tokens in httpOnly cookies
3. Middleware reads cookies → validates/refreshes token
4. Server Components read cookies → create authenticated client
5. Token expires → middleware refreshes using refresh_token
```

### Cookie Structure

Supabase stores session data in cookies with the prefix `sb-<project-ref>-auth-token`:

```
sb-<project-ref>-auth-token.0 = base64(chunk1 of JWT)
sb-<project-ref>-auth-token.1 = base64(chunk2 of JWT)
...
```

JWTs are chunked because cookies have a 4KB size limit per cookie.

## Implementation

### Default Cookie Options (via @supabase/ssr)

```typescript
// @supabase/ssr applies these defaults
const defaultCookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 365,  // 1 year (refresh token lifetime)
}
```

### Custom Cookie Options

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'

const cookieOptions: CookieOptions = {
  path: '/',
  sameSite: 'strict',  // Stricter than default 'lax'
  httpOnly: true,
  secure: true,  // Force HTTPS even in development
  maxAge: 60 * 60 * 24 * 7,  // 1 week instead of 1 year
}

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
              cookieStore.set(name, value, {
                ...cookieOptions,
                ...options,  // Allow per-cookie overrides
              })
            )
          } catch {
            // Server Component context
          }
        },
      },
    }
  )
}
```

### Strict Session Timeout

```typescript
// Force re-authentication after inactivity
const INACTIVITY_TIMEOUT = 30 * 60 * 1000  // 30 minutes

export async function middleware(request: NextRequest) {
  const { supabase, user, response } = await updateSession(request)

  if (user) {
    const lastActivity = request.cookies.get('last-activity')?.value
    const now = Date.now()

    if (lastActivity && now - parseInt(lastActivity) > INACTIVITY_TIMEOUT) {
      // Session timed out - force re-login
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?reason=timeout', request.url))
    }

    // Update last activity
    response.cookies.set('last-activity', now.toString(), {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    })
  }

  return response
}
```

### Secure Sign-Out (Clear All Session Data)

```typescript
// app/auth/signout/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  const cookieStore = await cookies()

  // Sign out from Supabase
  await supabase.auth.signOut()

  // Clear all Supabase-related cookies
  cookieStore.getAll().forEach((cookie) => {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.delete(cookie.name)
    }
  })

  // Clear any custom session cookies
  cookieStore.delete('last-activity')

  redirect('/login')
}
```

## Security Best Practices

### Cookie Flag Reference

| Flag | Purpose | Recommended Value |
|------|---------|-------------------|
| `httpOnly` | Prevents JavaScript access | `true` (always) |
| `secure` | HTTPS only | `true` in production |
| `sameSite` | CSRF protection | `'strict'` or `'lax'` |
| `path` | Cookie scope | `'/'` |
| `maxAge` | Expiration | Based on security needs |

### sameSite Explained

```typescript
// 'strict' - Cookie only sent in same-site requests
// Prevents CSRF but breaks "Log in with Google" return flows
sameSite: 'strict'

// 'lax' (default) - Cookie sent on top-level navigations
// Good balance of security and usability
sameSite: 'lax'

// 'none' - Cookie sent on all requests (requires secure: true)
// Only use if you NEED cross-site cookies
sameSite: 'none'
```

### Production Configuration

```typescript
// lib/supabase/config.ts
export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  // Shorter maxAge for sensitive apps
  maxAge: process.env.NODE_ENV === 'production'
    ? 60 * 60 * 24  // 24 hours
    : 60 * 60 * 24 * 7,  // 7 days for development
}
```

## Common Mistakes

### Storing Tokens in localStorage

```typescript
// INSECURE - tokens accessible to XSS attacks
localStorage.setItem('supabase-token', session.access_token)

// Also wrong in React state
const [token, setToken] = useState(session.access_token)
```

```typescript
// SECURE - let @supabase/ssr handle cookies
// Tokens stored in httpOnly cookies, inaccessible to JavaScript
const supabase = createBrowserClient(url, key)
await supabase.auth.signInWithPassword({ email, password })
// Cookies are set automatically
```

### Not Setting httpOnly

```typescript
// INSECURE - JavaScript can access token
cookieStore.set('auth-token', token, {
  httpOnly: false,  // XSS can steal this!
})
```

### Missing secure Flag in Production

```typescript
// INSECURE - token sent over HTTP
cookieStore.set('auth-token', token, {
  secure: false,  // Man-in-the-middle can intercept
})
```

### Trusting Client-Provided Session Data

```typescript
// INSECURE - client can modify session cookies
const { data: { session } } = await supabase.auth.getSession()
const userId = session?.user.id  // Could be forged!

// Use this for server-side validation
const { data: { user } } = await supabase.auth.getUser()
const userId = user?.id  // Validated with Supabase
```

### Overly Long Session Lifetime

```typescript
// Risky for sensitive apps
maxAge: 60 * 60 * 24 * 365  // 1 year

// Better for sensitive apps
maxAge: 60 * 60 * 24  // 24 hours with refresh
```

## Debugging Sessions

### Check Current Cookies

```typescript
// In Server Component or Server Action
import { cookies } from 'next/headers'

export async function debugCookies() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  console.log('All cookies:', allCookies.map(c => ({
    name: c.name,
    hasValue: !!c.value,
    // Don't log actual values in production!
  })))

  const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'))
  console.log('Supabase cookies count:', supabaseCookies.length)
}
```

### Validate Session State

```typescript
// Diagnostic endpoint for debugging
// app/api/auth/debug/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  return NextResponse.json({
    hasUser: !!user,
    hasSession: !!session,
    userError: userError?.message,
    sessionError: sessionError?.message,
    // Session expiry
    expiresAt: session?.expires_at
      ? new Date(session.expires_at * 1000).toISOString()
      : null,
  })
}
```

## Testing

### Test Cookie Security

```typescript
describe('cookie security', () => {
  it('sets httpOnly flag on auth cookies', async () => {
    // After sign in
    const response = await signIn(email, password)

    const setCookies = response.headers.get('set-cookie')

    expect(setCookies).toContain('HttpOnly')
    expect(setCookies).toContain('Secure')
    expect(setCookies).toMatch(/SameSite=(Strict|Lax)/)
  })

  it('clears all session cookies on sign out', async () => {
    await signIn(email, password)
    const response = await signOut()

    const setCookies = response.headers.get('set-cookie')

    // Check for cookie deletion (Max-Age=0 or Expires in past)
    expect(setCookies).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/)
  })
})
```

### Test Session Refresh

```typescript
describe('session refresh', () => {
  it('refreshes near-expiry tokens in middleware', async () => {
    // Set token that expires in 5 minutes
    const nearExpiryToken = createToken({ exp: Date.now()/1000 + 300 })

    const request = new NextRequest('http://localhost/dashboard')
    request.cookies.set('sb-access-token', nearExpiryToken)

    const response = await middleware(request)

    // New token should be set
    const setCookies = response.headers.get('set-cookie')
    expect(setCookies).toContain('sb-access-token')
  })
})
```

## Related Patterns

- [ssr-setup.md](./ssr-setup.md) - Client setup with cookie handlers
- [middleware-auth.md](./middleware-auth.md) - Token refresh in middleware
- [security-patterns](../security-patterns/SKILL.md) - General auth security
