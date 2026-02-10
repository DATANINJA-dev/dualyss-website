# Edge Function Structure

File organization, conventions, and the Deno.serve pattern for Supabase Edge Functions.

## Problem Statement

Edge Functions require specific file structure and patterns:
- Where to place function files
- How to structure the `Deno.serve()` handler
- TypeScript configuration for Deno
- Import management with import maps

## Directory Structure

### Standard Layout

```
project/
├── supabase/
│   ├── functions/
│   │   ├── _shared/              # Shared code between functions
│   │   │   ├── cors.ts           # CORS headers
│   │   │   ├── supabase-client.ts # Client factories
│   │   │   └── utils.ts          # Shared utilities
│   │   │
│   │   ├── my-function/          # Each function has its own directory
│   │   │   └── index.ts          # Entry point (required name)
│   │   │
│   │   ├── webhook-handler/
│   │   │   └── index.ts
│   │   │
│   │   └── scheduled-task/
│   │       └── index.ts
│   │
│   └── config.toml               # Supabase configuration
│
├── deno.json                     # Deno configuration (optional)
└── import_map.json               # Import aliases (optional)
```

### Key Conventions

| File/Directory | Purpose | Required |
|----------------|---------|----------|
| `supabase/functions/` | Root directory for all functions | Yes |
| `[name]/index.ts` | Function entry point | Yes |
| `_shared/` | Shared code (underscore prefix = not deployed) | No |
| `deno.json` | Deno config (compilerOptions, tasks) | No |
| `import_map.json` | Import aliases | No |

## Function Anatomy

### Basic Structure

```typescript
// supabase/functions/hello-world/index.ts

// 1. Imports
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

// 2. Type definitions (optional)
interface RequestBody {
  name: string
}

// 3. Main handler
Deno.serve(async (req: Request): Promise<Response> => {
  // 4. CORS preflight handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 5. Request processing
  try {
    const { name } = await req.json() as RequestBody

    // 6. Business logic
    const greeting = `Hello, ${name}!`

    // 7. Success response
    return new Response(
      JSON.stringify({ message: greeting }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    // 8. Error response
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
```

### Deno.serve() Explained

```typescript
// Deno.serve() is the modern way to create HTTP servers in Deno
// It replaces the older serve() from std/http

Deno.serve(handler)                    // Default port 8000
Deno.serve({ port: 3000 }, handler)    // Custom port (local dev only)
Deno.serve({ hostname: '0.0.0.0' }, handler)  // All interfaces

// Handler signature
type Handler = (request: Request, info?: Deno.ServeHandlerInfo) => Response | Promise<Response>

// Example with connection info
Deno.serve((req, info) => {
  console.log(`Request from: ${info.remoteAddr.hostname}`)
  return new Response('ok')
})
```

## TypeScript Configuration

### deno.json

```json
{
  "compilerOptions": {
    "allowJs": true,
    "lib": ["deno.window"],
    "strict": true
  },
  "lint": {
    "include": ["supabase/functions/"],
    "rules": {
      "tags": ["recommended"],
      "exclude": ["no-explicit-any"]
    }
  },
  "fmt": {
    "include": ["supabase/functions/"],
    "indentWidth": 2,
    "singleQuote": true
  },
  "imports": {
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2",
    "std/": "https://deno.land/std@0.208.0/"
  }
}
```

### Import Maps

```json
// import_map.json
{
  "imports": {
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2",
    "std/": "https://deno.land/std@0.208.0/",
    "shared/": "./supabase/functions/_shared/"
  }
}
```

Usage with import maps:
```typescript
// Instead of relative paths
import { corsHeaders } from '../_shared/cors.ts'

// Use aliases
import { corsHeaders } from 'shared/cors.ts'
```

## Request/Response Patterns

### Reading Request Data

```typescript
Deno.serve(async (req) => {
  // URL and method
  const url = new URL(req.url)
  const method = req.method

  // Query parameters
  const id = url.searchParams.get('id')

  // Headers
  const authHeader = req.headers.get('Authorization')
  const contentType = req.headers.get('Content-Type')

  // Body (JSON)
  const body = await req.json()

  // Body (FormData)
  const formData = await req.formData()

  // Body (text)
  const text = await req.text()

  // Body (binary)
  const buffer = await req.arrayBuffer()
})
```

### Creating Responses

```typescript
// JSON response
return new Response(JSON.stringify({ data }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
})

// Text response
return new Response('Hello, World!', {
  status: 200,
  headers: { 'Content-Type': 'text/plain' },
})

// HTML response
return new Response('<h1>Hello</h1>', {
  status: 200,
  headers: { 'Content-Type': 'text/html' },
})

// Redirect
return Response.redirect('https://example.com', 302)

// No content
return new Response(null, { status: 204 })

// Stream response
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue(new TextEncoder().encode('chunk 1'))
    controller.enqueue(new TextEncoder().encode('chunk 2'))
    controller.close()
  }
})
return new Response(stream, {
  headers: { 'Content-Type': 'text/plain' },
})
```

## Shared Code Pattern

### _shared/cors.ts

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}
```

### _shared/supabase-client.ts

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Anon client (respects RLS)
export function createAnonClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  )
}

// Service role client (bypasses RLS)
// ⚠️ WARNING: Only use for admin operations after proper authorization
export function createServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
}

// Client from request JWT (user context)
export function createClientFromRequest(req: Request): SupabaseClient {
  const authHeader = req.headers.get('Authorization')

  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: {
        headers: { Authorization: authHeader! },
      },
    }
  )
}
```

### _shared/utils.ts

```typescript
export function parseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export function requiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function optionalEnv(name: string, defaultValue: string): string {
  return Deno.env.get(name) ?? defaultValue
}
```

## Common Mistakes

### 1. Wrong Entry Point Name

```typescript
// ❌ Wrong: Function won't be found
supabase/functions/my-function/handler.ts
supabase/functions/my-function/main.ts

// ✅ Correct: Must be index.ts
supabase/functions/my-function/index.ts
```

### 2. Missing Deno Types

```typescript
// ❌ TypeScript errors for Deno APIs
Deno.serve(...)  // Error: Cannot find name 'Deno'

// ✅ Add to tsconfig or deno.json
{
  "compilerOptions": {
    "lib": ["deno.window"]
  }
}
```

### 3. Forgetting Async

```typescript
// ❌ Body never read (returns pending Promise)
Deno.serve((req) => {
  const body = req.json()  // Missing await
  return new Response(JSON.stringify(body))
})

// ✅ Await async operations
Deno.serve(async (req) => {
  const body = await req.json()
  return new Response(JSON.stringify(body))
})
```

### 4. Not Handling All Methods

```typescript
// ❌ Breaks for browsers (CORS preflight fails)
Deno.serve(async (req) => {
  const data = await req.json()
  return new Response(JSON.stringify(data))
})

// ✅ Handle OPTIONS for CORS
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  const data = await req.json()
  return new Response(JSON.stringify(data), { headers: corsHeaders })
})
```

## Local Development

```bash
# Start all functions with hot reload
supabase functions serve

# Start specific function
supabase functions serve my-function

# With environment variables
supabase functions serve --env-file .env.local

# With debug logging
supabase functions serve --debug

# Test invocation
curl -i --request POST 'http://localhost:54321/functions/v1/my-function' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name": "World"}'
```

## Related Resources

- [deno-testing.md](./deno-testing.md) - Testing Edge Functions
- [cors-handling.md](./cors-handling.md) - CORS configuration
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
