---
name: security-auth
description: Knowledge about web application security, authentication patterns with Supabase Auth, and authorization with RLS policies. Use when implementing auth flows or security features.
---

# Security & Authentication Skill

## Overview
This skill provides comprehensive knowledge about web application security, authentication patterns, and authorization best practices for building secure SaaS applications.

---

## Authentication Fundamentals

### Authentication vs Authorization
| Concept | Definition | Question |
|---------|------------|----------|
| **Authentication** | Verify identity | "Who are you?" |
| **Authorization** | Verify permissions | "What can you do?" |

### Authentication Methods

| Method | Security | UX | Use Case |
|--------|----------|-----|----------|
| Password | Medium | Good | Standard apps |
| OAuth/SSO | High | Excellent | Enterprise |
| Magic Link | High | Good | Consumer apps |
| Passkeys/WebAuthn | Very High | Good | Modern apps |
| MFA | Very High | Medium | Sensitive data |

---

## Supabase Auth Integration

### Setup
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};
```

### Sign Up
```typescript
// app/signup/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signUp(formData: FormData) {
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/check-email');
}
```

### Sign In
```typescript
export async function signIn(formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}
```

### Sign Out
```typescript
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

### OAuth (Google, GitHub)
```typescript
export async function signInWithGoogle() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }
}
```

### Auth Callback Handler
```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
```

---

## Route Protection

### Middleware
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logged in users away from auth pages
  if (user && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'
  )) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Server Component Protection
```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <Dashboard user={user} />;
}
```

---

## Authorization Patterns

### Role-Based Access Control (RBAC)
```typescript
// types/auth.ts
export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export const PERMISSIONS = {
  owner: ['read', 'write', 'delete', 'invite', 'admin', 'billing'],
  admin: ['read', 'write', 'delete', 'invite'],
  member: ['read', 'write'],
  viewer: ['read'],
} as const;

export function hasPermission(
  role: Role,
  permission: string
): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}
```

### Database RBAC
```sql
-- Product members with roles
CREATE TABLE product_members (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (product_id, user_id)
);

-- RLS Policy based on membership
CREATE POLICY "Members can view product" ON products
  FOR SELECT USING (
    id IN (
      SELECT product_id FROM product_members
      WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Admins can update product" ON products
  FOR UPDATE USING (
    user_id = auth.uid()
    OR id IN (
      SELECT product_id FROM product_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );
```

### Resource-Based Authorization
```typescript
// lib/auth/can.ts
import { createClient } from '@/lib/supabase/server';

export async function canAccessProduct(productId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .single();

  return !!data;
}

export async function canEditProduct(productId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  // Check ownership
  const { data: owned } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .eq('user_id', user.id)
    .single();

  if (owned) return true;

  // Check admin membership
  const { data: member } = await supabase
    .from('product_members')
    .select('role')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])
    .single();

  return !!member;
}
```

---

## Password Security

### Password Requirements
```typescript
import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

export const signUpSchema = z.object({
  email: z.string().email('Invalid email'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

### Password Reset Flow
```typescript
// Request reset
export async function requestPasswordReset(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  return { error: error?.message };
}

// Complete reset
export async function updatePassword(newPassword: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { error: error?.message };
}
```

---

## Session Management

### Session Configuration
```typescript
// Supabase handles sessions automatically
// Configure in Supabase Dashboard:
// - JWT expiry: 3600 (1 hour)
// - Refresh token rotation: enabled
// - Refresh token reuse interval: 10 seconds
```

### Get Current User
```typescript
// Server Component
const { data: { user } } = await supabase.auth.getUser();

// Client Component
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user;

// Listen to auth changes (client)
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

## Security Headers

### Next.js Security Headers
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## OWASP Top 10 Protection

### 1. Injection Prevention
```typescript
// Use parameterized queries (Supabase does this)
const { data } = await supabase
  .from('products')
  .select()
  .eq('id', productId);  // Parameterized, safe

// Never concatenate user input into queries
// BAD: `SELECT * FROM products WHERE id = '${userInput}'`
```

### 2. Broken Authentication
- Use Supabase Auth (handles security)
- Implement rate limiting
- Use secure session management
- Require email verification

### 3. Sensitive Data Exposure
```typescript
// Never expose sensitive data in responses
// Strip sensitive fields
const safeUser = {
  id: user.id,
  email: user.email,
  name: user.name,
  // DON'T include: password_hash, api_keys, etc.
};
```

### 4. XML External Entities (XXE)
- Use JSON instead of XML
- If XML required, disable external entity processing

### 5. Broken Access Control
```typescript
// Always verify ownership
const { data } = await supabase
  .from('products')
  .select()
  .eq('id', productId)
  .eq('user_id', user.id)  // Verify ownership
  .single();

if (!data) {
  return { error: 'Not found or unauthorized' };
}
```

### 6. Security Misconfiguration
- Use environment variables for secrets
- Keep dependencies updated
- Disable debug mode in production
- Configure CORS properly

### 7. Cross-Site Scripting (XSS)
```typescript
// React escapes by default
// Be careful with dangerouslySetInnerHTML
// Sanitize user content if rendering HTML
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(userHtml);
```

### 8. Insecure Deserialization
- Validate and sanitize all input
- Use Zod schemas for validation
- Don't deserialize untrusted data

### 9. Using Components with Known Vulnerabilities
```bash
# Regular dependency audits
npm audit
npm audit fix

# Use Dependabot or Renovate for updates
```

### 10. Insufficient Logging & Monitoring
```typescript
// Log security events
console.log({
  event: 'login_attempt',
  email: email,
  success: !error,
  ip: request.ip,
  timestamp: new Date().toISOString(),
});
```

---

## Rate Limiting

### API Rate Limiting
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    },
  };
}
```

### Apply to API Routes
```typescript
// app/api/ai/route.ts
export async function POST(request: NextRequest) {
  const ip = request.ip ?? 'anonymous';
  const { success, headers } = await checkRateLimit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers }
    );
  }

  // Process request...
}
```

---

## Environment Variables

### Required Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server only, never expose

NEXT_PUBLIC_SITE_URL=http://localhost:3000

GOOGLE_AI_API_KEY=...  # Server only

# OAuth providers (if using)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Security Rules
1. Never commit `.env` files
2. Use `NEXT_PUBLIC_` prefix only for client-safe values
3. Service role keys are admin - use sparingly
4. Rotate keys regularly
5. Use different keys per environment

---

## Security Checklist

### Authentication
- [ ] Email verification required
- [ ] Password requirements enforced
- [ ] Rate limiting on auth endpoints
- [ ] Secure password reset flow
- [ ] Session expiry configured

### Authorization
- [ ] RLS enabled on all tables
- [ ] Ownership verified on all operations
- [ ] Role-based access control implemented
- [ ] API routes check authentication

### Data Protection
- [ ] HTTPS only
- [ ] Sensitive data encrypted at rest
- [ ] No sensitive data in URLs
- [ ] Input validation on all endpoints
- [ ] Output encoding to prevent XSS

### Infrastructure
- [ ] Environment variables for secrets
- [ ] Security headers configured
- [ ] CORS configured properly
- [ ] Dependencies regularly updated
- [ ] Error messages don't leak info

---

## Quick Reference

### Common Patterns
```typescript
// Check auth in server component
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/login');

// Check auth in API route
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Check resource ownership
const { data } = await supabase.from('table').select().eq('user_id', user.id);
```
