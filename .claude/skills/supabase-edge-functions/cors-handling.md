# CORS Handling

Configuring Cross-Origin Resource Sharing for Supabase Edge Functions called from browsers.

## Problem Statement

When calling Edge Functions from browser JavaScript, CORS policies block requests unless the server explicitly allows them:
- Browser sends preflight OPTIONS request for non-simple requests
- Server must respond with appropriate CORS headers
- Missing or incorrect headers result in blocked requests

## Standard CORS Headers

### Basic Configuration

```typescript
// supabase/functions/_shared/cors.ts

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}
```

### Header Explanation

| Header | Purpose | Common Values |
|--------|---------|---------------|
| `Access-Control-Allow-Origin` | Which origins can access | `*` or specific domain |
| `Access-Control-Allow-Headers` | Which headers client can send | auth, content-type, custom |
| `Access-Control-Allow-Methods` | Which HTTP methods allowed | GET, POST, PUT, DELETE |
| `Access-Control-Max-Age` | Preflight cache duration | `86400` (24 hours) |
| `Access-Control-Allow-Credentials` | Allow cookies/auth | `true` or omit |

## Preflight Handling

### Standard Pattern

Every Edge Function that accepts browser requests MUST handle OPTIONS:

```typescript
// supabase/functions/my-function/index.ts

import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // 1. Handle CORS preflight - MUST be first
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Process actual request
    const data = await req.json()

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    // 3. Errors also need CORS headers
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

### Why OPTIONS First?

```typescript
// ❌ Wrong: CORS check after body parsing fails for OPTIONS
Deno.serve(async (req) => {
  const body = await req.json()  // OPTIONS has no body - throws error!

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  // ...
})

// ✅ Correct: OPTIONS handled before any body parsing
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const body = await req.json()  // Safe - only reached for non-OPTIONS
  // ...
})
```

## Domain-Specific CORS

### Production vs Development

```typescript
// supabase/functions/_shared/cors.ts

const ALLOWED_ORIGINS = [
  'https://myapp.com',
  'https://www.myapp.com',
  'https://staging.myapp.com',
]

// Add localhost in development
if (Deno.env.get('ENVIRONMENT') !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:3000')
  ALLOWED_ORIGINS.push('http://localhost:5173')  // Vite default
}

export function getCorsHeaders(origin: string | null): HeadersInit {
  // Check if origin is allowed
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0]  // Fallback to primary domain

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }
}
```

### Usage with Dynamic Origin

```typescript
Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ... rest of function
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
```

## Handling Credentials

### When Credentials Are Needed

If your function uses cookies or HTTP authentication:

```typescript
export const corsHeadersWithCredentials = {
  'Access-Control-Allow-Origin': 'https://myapp.com',  // MUST be specific, not *
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
}
```

> **Warning**: When using `Access-Control-Allow-Credentials: true`, you CANNOT use `*` for `Access-Control-Allow-Origin`. You must specify exact origins.

### Client-Side Setup

```typescript
// Client must also opt-in to credentials
const response = await fetch('https://project.supabase.co/functions/v1/my-function', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  credentials: 'include',  // Required for cookies
  body: JSON.stringify(data),
})
```

## Supabase-Specific Headers

### Required Headers for Supabase Client

When using `@supabase/supabase-js` from browser, these headers are automatically sent:

| Header | Purpose |
|--------|---------|
| `authorization` | JWT bearer token |
| `apikey` | Supabase anon/service key |
| `x-client-info` | Client library version |
| `content-type` | Request body type |

Your CORS config must allow all of them:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  // ...
}
```

### Adding Custom Headers

If your function uses custom headers:

```typescript
// Client sends custom header
fetch(url, {
  headers: {
    'X-Custom-Tracking': 'value',
    // ... other headers
  },
})

// CORS must allow it
export const corsHeaders = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-custom-tracking',
  // ...
}
```

## Common Issues

### Issue 1: CORS Error Despite Headers

**Symptom**: Browser shows CORS error even with headers set.

**Cause**: OPTIONS handler missing or returning error.

```typescript
// ❌ Problem: Error before OPTIONS check
Deno.serve(async (req) => {
  const { userId } = await req.json()  // Fails for OPTIONS

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  // ...
})

// ✅ Fix: Check OPTIONS first
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { userId } = await req.json()
  // ...
})
```

### Issue 2: Headers Missing on Error Responses

**Symptom**: Errors return but browser blocks reading them.

**Cause**: Error responses don't include CORS headers.

```typescript
// ❌ Problem: Error response without CORS
return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

// ✅ Fix: Always include CORS headers
return new Response(JSON.stringify({ error: 'Not found' }), {
  status: 404,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})
```

### Issue 3: Credentials with Wildcard Origin

**Symptom**: `Access-Control-Allow-Credentials` doesn't work.

**Cause**: Using `*` with credentials.

```typescript
// ❌ Invalid: Credentials require specific origin
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
}

// ✅ Valid: Specific origin with credentials
{
  'Access-Control-Allow-Origin': 'https://myapp.com',
  'Access-Control-Allow-Credentials': 'true',
}
```

### Issue 4: Custom Headers Blocked

**Symptom**: Requests with custom headers fail.

**Cause**: Custom headers not in `Allow-Headers`.

```typescript
// ❌ Problem: Custom header not allowed
// Client sends: X-Request-ID: abc123
{
  'Access-Control-Allow-Headers': 'authorization, content-type',  // Missing!
}

// ✅ Fix: Add custom header to allowed list
{
  'Access-Control-Allow-Headers': 'authorization, content-type, x-request-id',
}
```

## Debugging CORS

### Browser DevTools

1. Open Network tab
2. Look for the OPTIONS request (preflight)
3. Check Response Headers for CORS headers
4. If preflight fails, the actual request won't be sent

### Test with curl

```bash
# Test preflight
curl -X OPTIONS 'https://project.supabase.co/functions/v1/my-function' \
  -H 'Origin: http://localhost:3000' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: authorization, content-type' \
  -v

# Check response headers include:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Headers: authorization, ...
# Access-Control-Allow-Methods: POST, ...
```

### Local Testing

```bash
# Serve function locally
supabase functions serve my-function

# Test from another terminal
curl -X OPTIONS 'http://localhost:54321/functions/v1/my-function' \
  -H 'Origin: http://localhost:3000' \
  -v
```

## CORS Helper Utility

### Complete Reusable Module

```typescript
// supabase/functions/_shared/cors.ts

type CorsConfig = {
  allowedOrigins?: string[]
  allowedHeaders?: string[]
  allowedMethods?: string[]
  allowCredentials?: boolean
  maxAge?: number
}

const DEFAULT_CONFIG: CorsConfig = {
  allowedOrigins: ['*'],
  allowedHeaders: ['authorization', 'x-client-info', 'apikey', 'content-type'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowCredentials: false,
  maxAge: 86400,
}

export function createCorsHeaders(
  origin: string | null,
  config: CorsConfig = {}
): HeadersInit {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  // Determine allowed origin
  let allowOrigin: string
  if (mergedConfig.allowedOrigins?.includes('*')) {
    allowOrigin = '*'
  } else if (origin && mergedConfig.allowedOrigins?.includes(origin)) {
    allowOrigin = origin
  } else {
    allowOrigin = mergedConfig.allowedOrigins?.[0] ?? '*'
  }

  const headers: HeadersInit = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': mergedConfig.allowedHeaders!.join(', '),
    'Access-Control-Allow-Methods': mergedConfig.allowedMethods!.join(', '),
    'Access-Control-Max-Age': String(mergedConfig.maxAge),
  }

  if (mergedConfig.allowCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true'
  }

  return headers
}

// Convenience export for simple cases
export const corsHeaders = createCorsHeaders(null)
```

### Usage

```typescript
import { createCorsHeaders, corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Simple: use default headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Advanced: dynamic origin with credentials
  const origin = req.headers.get('origin')
  const headers = createCorsHeaders(origin, {
    allowedOrigins: ['https://myapp.com', 'https://staging.myapp.com'],
    allowCredentials: true,
  })

  return new Response(JSON.stringify({ data }), {
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
})
```

## Related Resources

- [edge-function-structure.md](./edge-function-structure.md) - Function setup
- [error-handling.md](./error-handling.md) - Error responses with CORS
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
