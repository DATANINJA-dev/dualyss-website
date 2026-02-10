---
name: supabase-edge-functions
description: Production-ready patterns for Supabase Edge Functions with Deno, including testing, deployment, and security best practices
---

# Supabase Edge Functions Skill

Comprehensive patterns for building production-ready serverless functions with Supabase Edge Functions and Deno.

## Overview

Supabase Edge Functions are server-side TypeScript functions distributed globally at the edge, built on Deno Deploy. This skill provides:

- Function structure and conventions
- Deno testing patterns
- Service role security
- CORS handling
- Environment management
- Background job patterns
- CI/CD integration

> **Security Warning**: Edge Functions with service role access bypass RLS. Always validate requests before performing admin operations. See [service-role-patterns.md](./service-role-patterns.md).

## Type

**Passive** - Auto-activates based on context detection.

## Auto-Activation Triggers

### Keywords
- "Edge Functions"
- "Deno"
- "supabase functions"
- "invoke"
- "serverless"
- "background job"
- "waitUntil"
- "Deno.serve"
- "EdgeRuntime"

### File Patterns
- `**/functions/**/*.ts`
- `supabase/functions/**`
- `**/deno.json`

### Task Contexts
- Implementing serverless functions
- Webhook handlers
- Background job processing
- API route implementations
- Scheduled tasks (cron)

## Supporting Files

| File | Purpose |
|------|---------|
| [edge-function-structure.md](./edge-function-structure.md) | File organization and Deno.serve patterns |
| [deno-testing.md](./deno-testing.md) | Testing with Deno.test and assertions |
| [service-role-patterns.md](./service-role-patterns.md) | Safe RLS bypass patterns |
| [cors-handling.md](./cors-handling.md) | CORS configuration for browser access |
| [environment-variables.md](./environment-variables.md) | Secrets and config management |
| [background-jobs.md](./background-jobs.md) | EdgeRuntime.waitUntil patterns |
| [ci-cd-integration.md](./ci-cd-integration.md) | GitHub Actions and GitLab CI |
| [error-handling.md](./error-handling.md) | Robust error response patterns |

## Quick Reference

### Basic Edge Function

```typescript
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const { data, error } = await supabase.from('items').select('*')

    if (error) throw error

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### Pattern Categories

| Category | Use When |
|----------|----------|
| **Structure** | Setting up new functions, organizing code |
| **Testing** | Writing unit/integration tests for functions |
| **Security** | Admin operations, webhook verification |
| **CORS** | Browser-based function calls |
| **Environment** | Managing secrets across environments |
| **Background** | Long-running tasks, async processing |
| **CI/CD** | Automating deployments |
| **Errors** | Consistent error responses |

## Integration Points

### Consumed By
- `task-code-impact` - For analyzing Edge Function changes
- `stack-skill-recommender` - For Supabase project detection
- `task-security` - For service role usage analysis

### References
- [supabase-rls-patterns](../supabase-rls-patterns/SKILL.md) - For understanding RLS bypass implications
- [typescript-advanced-patterns](../typescript-advanced-patterns/SKILL.md) - For TypeScript patterns in Deno
- [security-patterns](../security-patterns/SKILL.md) - For webhook verification and auth

## CLI Commands

```bash
# Create new function
supabase functions new my-function

# Serve locally (with hot reload)
supabase functions serve

# Serve specific function
supabase functions serve my-function

# Deploy to production
supabase functions deploy my-function

# Deploy all functions
supabase functions deploy

# Set secrets
supabase secrets set MY_SECRET=value

# List secrets
supabase secrets list

# Delete function
supabase functions delete my-function
```

## Related Skills

- **supabase-rls-patterns** - Row-Level Security for data access control
- **typescript-advanced-patterns** - Advanced TypeScript for Deno
- **security-patterns** - Authentication and authorization patterns
