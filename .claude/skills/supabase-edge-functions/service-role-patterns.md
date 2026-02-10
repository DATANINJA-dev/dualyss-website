# Service Role Patterns

Safe patterns for using the service role key in Edge Functions to bypass Row-Level Security.

## Problem Statement

Edge Functions often need admin-level database access:
- Processing webhook events (no user context)
- Background jobs and scheduled tasks
- Admin operations on behalf of users
- Cross-tenant data aggregation

The service role key bypasses RLS, making proper usage critical for security.

> **Security Warning**: Service role operations bypass ALL Row-Level Security policies. A single vulnerability can expose your entire database. Follow the patterns below strictly.

## Service Role vs Anon Key

| Aspect | Anon Key | Service Role Key |
|--------|----------|------------------|
| RLS | Respected | **Bypassed** |
| Use in browser | Yes (public) | **NEVER** |
| Use in Edge Functions | For user context | For admin ops |
| Exposure risk | Low (RLS protects) | **Critical** |
| Default client | Yes | No |

### When to Use Each

```typescript
// ✅ Anon key: User-initiated operations
const userClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  {
    global: { headers: { Authorization: req.headers.get('Authorization')! } }
  }
)

// ✅ Service role: Webhook processing (no user context)
const adminClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)
```

## Safe Pattern 1: Webhook Handler with Signature Verification

> **Security Warning**: ALWAYS verify webhook signatures before using service role. Without verification, attackers can forge requests.

```typescript
// supabase/functions/stripe-webhook/index.ts

import { createClient } from '@supabase/supabase-js'
import Stripe from 'https://esm.sh/stripe@14.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

Deno.serve(async (req) => {
  // 1. Get signature from headers
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  // 2. Get raw body for verification
  const body = await req.text()

  // 3. Verify signature BEFORE any processing
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    )
  } catch (err) {
    console.error('Signature verification failed:', err.message)
    return new Response('Invalid signature', { status: 400 })
  }

  // 4. NOW safe to use service role (signature verified)
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // 5. Process event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // 6. Audit logging for service role operation
    await adminClient.from('audit_log').insert({
      action: 'stripe_checkout_completed',
      actor_type: 'webhook',
      actor_id: 'stripe',
      resource_type: 'subscription',
      resource_id: session.subscription,
      metadata: { event_id: event.id },
    })

    // 7. Update user subscription (admin operation)
    await adminClient
      .from('subscriptions')
      .upsert({
        user_id: session.client_reference_id,
        stripe_subscription_id: session.subscription,
        status: 'active',
      })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## Safe Pattern 2: Background Job Processing

> **Security Warning**: Background jobs run without user context. Log all operations for audit trail.

```typescript
// supabase/functions/process-daily-reports/index.ts

import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  // 1. Verify this is called from authorized source
  const authHeader = req.headers.get('Authorization')
  const expectedToken = Deno.env.get('INTERNAL_CRON_SECRET')

  if (authHeader !== `Bearer ${expectedToken}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. Create service client for cross-tenant access
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // 3. Log job start
  const jobId = crypto.randomUUID()
  await adminClient.from('job_log').insert({
    id: jobId,
    job_type: 'daily_reports',
    started_at: new Date().toISOString(),
    status: 'running',
  })

  try {
    // 4. Process all organizations (cross-tenant)
    const { data: orgs } = await adminClient
      .from('organizations')
      .select('id, name')

    for (const org of orgs ?? []) {
      // Process each org's data
      const { data: metrics } = await adminClient
        .from('metrics')
        .select('*')
        .eq('org_id', org.id)
        .gte('created_at', new Date(Date.now() - 86400000).toISOString())

      // Store aggregated report
      await adminClient.from('daily_reports').insert({
        org_id: org.id,
        report_date: new Date().toISOString().split('T')[0],
        total_events: metrics?.length ?? 0,
        // ... more aggregations
      })
    }

    // 5. Log job completion
    await adminClient.from('job_log').update({
      completed_at: new Date().toISOString(),
      status: 'completed',
    }).eq('id', jobId)

    return new Response(JSON.stringify({ success: true, jobId }))
  } catch (error) {
    // 6. Log job failure
    await adminClient.from('job_log').update({
      completed_at: new Date().toISOString(),
      status: 'failed',
      error_message: error.message,
    }).eq('id', jobId)

    throw error
  }
})
```

## Safe Pattern 3: Admin Action on Behalf of User

> **Security Warning**: Verify user has permission for the requested action before using service role.

```typescript
// supabase/functions/admin-delete-user/index.ts

import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  // 1. Get user client to verify admin status
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    }
  )

  // 2. Verify the requesting user is an admin
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: adminCheck } = await userClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single()

  if (!adminCheck) {
    return new Response('Forbidden: Admin role required', { status: 403 })
  }

  // 3. Parse request
  const { targetUserId } = await req.json()
  if (!targetUserId) {
    return new Response('Missing targetUserId', { status: 400 })
  }

  // 4. NOW safe to use service role (admin verified)
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // 5. Audit logging BEFORE the action
  await adminClient.from('audit_log').insert({
    action: 'admin_delete_user',
    actor_type: 'user',
    actor_id: user.id,
    resource_type: 'user',
    resource_id: targetUserId,
    metadata: { reason: 'Admin deletion' },
  })

  // 6. Perform admin action
  const { error } = await adminClient.auth.admin.deleteUser(targetUserId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }))
})
```

## Anti-Patterns (NEVER Do These)

### Never Return Service Role in Response

```typescript
// ❌ CRITICAL: Exposes service role to client
Deno.serve(async (req) => {
  return new Response(JSON.stringify({
    url: Deno.env.get('SUPABASE_URL'),
    key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),  // NEVER!
  }))
})
```

### Never Use Service Role Without Authorization Check

```typescript
// ❌ CRITICAL: Any request can trigger admin operations
Deno.serve(async (req) => {
  const { userId } = await req.json()

  const adminClient = createClient(...)

  // No auth check! Anyone can delete any user
  await adminClient.from('users').delete().eq('id', userId)
})
```

### Never Trust User-Provided Data for Admin Ops

```typescript
// ❌ CRITICAL: User controls which org they access
Deno.serve(async (req) => {
  const { orgId, action } = await req.json()

  const adminClient = createClient(...)

  // User could pass any orgId and access other orgs' data
  const { data } = await adminClient.from('secrets').select('*').eq('org_id', orgId)
})

// ✅ SAFE: Derive orgId from verified user
Deno.serve(async (req) => {
  const userClient = createClient(...)
  const { data: { user } } = await userClient.auth.getUser()

  // Get org from user's membership (RLS enforced)
  const { data: membership } = await userClient
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  // Only then use service role for the verified org
  const adminClient = createClient(...)
  const { data } = await adminClient.from('secrets').select('*').eq('org_id', membership.org_id)
})
```

## Audit Logging Patterns

### Audit Log Schema

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  actor_type TEXT NOT NULL,  -- 'user', 'webhook', 'cron', 'system'
  actor_id TEXT,             -- user_id, webhook source, etc.
  resource_type TEXT,        -- 'user', 'subscription', 'document'
  resource_id TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT
);

-- Index for querying
CREATE INDEX idx_audit_log_actor ON audit_log(actor_type, actor_id);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
```

### Audit Helper Function

```typescript
// supabase/functions/_shared/audit.ts

import { SupabaseClient } from '@supabase/supabase-js'

interface AuditEntry {
  action: string
  actorType: 'user' | 'webhook' | 'cron' | 'system'
  actorId?: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  req?: Request
}

export async function auditLog(
  adminClient: SupabaseClient,
  entry: AuditEntry
): Promise<void> {
  await adminClient.from('audit_log').insert({
    action: entry.action,
    actor_type: entry.actorType,
    actor_id: entry.actorId,
    resource_type: entry.resourceType,
    resource_id: entry.resourceId,
    metadata: entry.metadata,
    ip_address: entry.req?.headers.get('x-forwarded-for')?.split(',')[0],
    user_agent: entry.req?.headers.get('user-agent'),
  })
}
```

### Usage

```typescript
import { auditLog } from '../_shared/audit.ts'

// After verification, before sensitive operation
await auditLog(adminClient, {
  action: 'export_all_users',
  actorType: 'user',
  actorId: adminUser.id,
  resourceType: 'report',
  metadata: { format: 'csv', record_count: users.length },
  req,
})
```

## Key Rotation

### Rotation Checklist

1. Generate new service role key in Supabase Dashboard
2. Update in all environments:
   - `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=new-key`
   - Update CI/CD secrets
3. Monitor for errors after rotation
4. Revoke old key after confirming new key works

### Zero-Downtime Rotation

```typescript
// Support both keys during rotation period
const SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY_OLD')

if (!SERVICE_ROLE_KEY) {
  throw new Error('No service role key configured')
}
```

## Security Checklist

### Before Using Service Role

- [ ] Authorization verified (signature, token, or user role)
- [ ] User input validated and sanitized
- [ ] Resource access scope is minimal and justified
- [ ] Audit logging implemented

### Code Review Checklist

- [ ] No service role key in responses
- [ ] No service role key in logs
- [ ] Authorization happens BEFORE creating admin client
- [ ] Audit log entry created for the operation
- [ ] Error handling doesn't leak sensitive information

## Related Resources

- [supabase-rls-patterns](../supabase-rls-patterns/SKILL.md) - Understanding RLS implications
- [error-handling.md](./error-handling.md) - Safe error responses
- [security-patterns](../security-patterns/SKILL.md) - General security patterns
