# Service Role Patterns

When and how to safely bypass RLS using the service role key.

## Problem Statement

RLS policies protect data at the database level, but some operations legitimately need to bypass these restrictions:

- Admin dashboards viewing all user data
- Batch processing / cron jobs
- Data migrations and backups
- System-level operations (notifications, analytics)
- Background workers processing queues

Using the service role incorrectly can expose your entire database.

## Service Role vs Anon Key

| Aspect | Anon Key | Service Role Key |
|--------|----------|------------------|
| **RLS** | Enforced | **BYPASSED** |
| **Access** | Public (client-side OK) | Server-side ONLY |
| **Use Case** | User-facing operations | Admin/system operations |
| **Exposure Risk** | Low (RLS protects data) | **CRITICAL** (full DB access) |
| **Rotation** | Optional | Required on leak |

### Key Security Rule

> **NEVER expose the service role key to clients.**
>
> If it's in browser code, mobile app bundles, or client-side JavaScript, your entire database is compromised.

## Safe Bypass Patterns

### Pattern 1: Backend-Only Admin API

**Use Case**: Admin dashboard that needs to view all users, orders, etc.

```typescript
// ✅ SAFE: Server-side API route (Next.js example)
// app/api/admin/users/route.ts

import { createClient } from '@supabase/supabase-js';

// Service role client - ONLY on server
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Never expose this
);

export async function GET(request: Request) {
  // Verify admin authentication first!
  const session = await getServerSession();
  if (!session?.user || session.user.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  // Now safe to use service role
  const { data: users, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // Log the admin action for audit
  await supabaseAdmin.from('audit_log').insert({
    action: 'admin_view_all_users',
    actor_id: session.user.id,
    timestamp: new Date().toISOString(),
  });

  return Response.json({ users });
}
```

**⚠️ Security Checklist**:
- [ ] Verify admin role BEFORE using service role
- [ ] Log all service role operations
- [ ] Rate limit admin endpoints
- [ ] Use separate admin authentication

### Pattern 2: Background Job Processing

**Use Case**: Cron jobs, queue workers, scheduled tasks.

```typescript
// ✅ SAFE: Supabase Edge Function (cron job)
// supabase/functions/daily-cleanup/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  // Verify this is called by Supabase cron (check secret)
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Delete old soft-deleted records
  const { data, error } = await supabaseAdmin
    .from('documents')
    .delete()
    .lt('deleted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .select('id');

  // Log cleanup action
  await supabaseAdmin.from('system_log').insert({
    action: 'daily_cleanup',
    details: { deleted_count: data?.length ?? 0 },
    timestamp: new Date().toISOString(),
  });

  return new Response(JSON.stringify({ deleted: data?.length ?? 0 }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Pattern 3: Data Migration

**Use Case**: One-time data migrations, schema updates with data transformation.

```typescript
// ✅ SAFE: Migration script (run locally or in CI)
// scripts/migrate-user-data.ts

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateUserData() {
  console.log('Starting migration...');

  // Create migration record
  const { data: migration } = await supabaseAdmin
    .from('migrations')
    .insert({
      name: 'migrate_user_profiles_v2',
      started_at: new Date().toISOString(),
      status: 'running',
    })
    .select()
    .single();

  try {
    // Fetch all users (bypasses RLS)
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*');

    if (error) throw error;

    // Process in batches
    const batchSize = 100;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      await supabaseAdmin
        .from('profiles')
        .upsert(
          batch.map(user => ({
            ...user,
            display_name: user.display_name || user.email.split('@')[0],
            migrated_at: new Date().toISOString(),
          }))
        );

      console.log(`Processed ${Math.min(i + batchSize, users.length)}/${users.length}`);
    }

    // Mark migration complete
    await supabaseAdmin
      .from('migrations')
      .update({
        completed_at: new Date().toISOString(),
        status: 'completed',
        records_processed: users.length,
      })
      .eq('id', migration.id);

    console.log('Migration completed successfully');
  } catch (error) {
    // Mark migration failed
    await supabaseAdmin
      .from('migrations')
      .update({
        completed_at: new Date().toISOString(),
        status: 'failed',
        error: error.message,
      })
      .eq('id', migration.id);

    throw error;
  }
}

migrateUserData().catch(console.error);
```

### Pattern 4: System Notifications

**Use Case**: Sending notifications to users based on system events.

```typescript
// ✅ SAFE: Webhook handler for payment events
// app/api/webhooks/stripe/route.ts

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // Verify Stripe webhook signature
  const signature = request.headers.get('stripe-signature')!;
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    // Find user and create notification (bypasses RLS)
    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('stripe_customer_id', paymentIntent.customer)
      .single();

    if (user) {
      await supabaseAdmin.from('notifications').insert({
        user_id: user.id,
        type: 'payment_success',
        title: 'Payment Received',
        message: `Your payment of $${paymentIntent.amount / 100} was successful.`,
      });

      // Log system action
      await supabaseAdmin.from('audit_log').insert({
        action: 'system_notification_sent',
        actor_type: 'system',
        target_user_id: user.id,
        details: { payment_intent_id: paymentIntent.id },
      });
    }
  }

  return new Response('OK');
}
```

## Audit Logging Patterns

**Every service role operation should be logged.**

### Audit Log Schema

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Who performed the action
  actor_type TEXT NOT NULL,  -- 'user', 'admin', 'system', 'cron'
  actor_id UUID,             -- User ID if applicable

  -- What action was performed
  action TEXT NOT NULL,      -- 'admin_view_users', 'system_cleanup', etc.
  resource_type TEXT,        -- 'users', 'orders', etc.
  resource_id UUID,          -- Specific record if applicable

  -- Context
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,

  -- For compliance
  data_accessed TEXT[],      -- List of fields accessed
  data_modified JSONB        -- Before/after for updates
);

-- Index for querying
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_type, actor_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- RLS: Audit log is append-only, readable by admins
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (auth.user_role() = 'admin');

-- No UPDATE or DELETE policies - audit log is immutable
```

### Audit Helper Function

```typescript
// lib/audit.ts
import { SupabaseClient } from '@supabase/supabase-js';

interface AuditEntry {
  actorType: 'user' | 'admin' | 'system' | 'cron';
  actorId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  dataAccessed?: string[];
  dataModified?: { before?: unknown; after?: unknown };
}

export async function logAudit(
  supabaseAdmin: SupabaseClient,
  entry: AuditEntry,
  request?: Request
) {
  await supabaseAdmin.from('audit_log').insert({
    actor_type: entry.actorType,
    actor_id: entry.actorId,
    action: entry.action,
    resource_type: entry.resourceType,
    resource_id: entry.resourceId,
    details: entry.details,
    data_accessed: entry.dataAccessed,
    data_modified: entry.dataModified,
    ip_address: request?.headers.get('x-forwarded-for')?.split(',')[0],
    user_agent: request?.headers.get('user-agent'),
  });
}

// Usage
await logAudit(supabaseAdmin, {
  actorType: 'admin',
  actorId: session.user.id,
  action: 'export_user_data',
  resourceType: 'users',
  details: { format: 'csv', recordCount: 1500 },
  dataAccessed: ['email', 'name', 'created_at'],
});
```

## Security Warnings

### ⚠️ Never Do This

```typescript
// ❌ WRONG: Service role key in client-side code
const supabase = createClient(
  'https://xxx.supabase.co',
  'eyJhbGciOiJIUzI1NiIs...'  // This is the service role key!
);
// Anyone can view source and get full database access

// ❌ WRONG: Exposing via API without auth
app.get('/api/users', async (req, res) => {
  // No authentication check!
  const { data } = await supabaseAdmin.from('users').select('*');
  res.json(data);
});

// ❌ WRONG: Logging service role key
console.log('Connecting with key:', process.env.SUPABASE_SERVICE_ROLE_KEY);
// Keys in logs can be leaked

// ❌ WRONG: Committing to version control
// .env file with SUPABASE_SERVICE_ROLE_KEY=xxx
// Use .env.local (gitignored) instead
```

### ✅ Security Checklist

Before using service role:

- [ ] Is this running server-side only?
- [ ] Is the caller authenticated and authorized?
- [ ] Is this action logged to audit trail?
- [ ] Is the service role key in environment variables (not code)?
- [ ] Is there rate limiting on this endpoint?
- [ ] Have I minimized the data accessed?

## Key Rotation

If you suspect the service role key is compromised:

1. **Immediately** rotate the key in Supabase Dashboard
2. Update all server deployments with new key
3. Review audit logs for suspicious activity
4. Consider all data potentially exposed

```bash
# Supabase CLI key rotation
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=new_key_here

# Verify deployment has new key
curl -X POST your-function-url/health-check
```

## Alternative: Database Functions

For some operations, `SECURITY DEFINER` functions are safer than service role:

```sql
-- Function runs with definer's privileges (bypasses RLS)
CREATE OR REPLACE FUNCTION admin_get_user_count()
RETURNS INTEGER AS $$
DECLARE
  count INTEGER;
BEGIN
  -- Verify caller is admin
  IF auth.user_role() != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COUNT(*) INTO count FROM profiles;
  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage (with anon/authenticated key - no service role needed!)
const { data } = await supabase.rpc('admin_get_user_count');
```

**Benefits**:
- No service role key exposure risk
- Fine-grained control per function
- Authorization checked in database
- Audit logging can be built-in

See [common-pitfalls.md](./common-pitfalls.md) for more security anti-patterns.
