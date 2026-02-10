# Background Jobs

Using EdgeRuntime.waitUntil() for long-running tasks without blocking the HTTP response.

## Problem Statement

Edge Functions have execution time limits, but sometimes you need to:
- Process webhooks without timing out the sender
- Send emails after responding to the user
- Log analytics without slowing down responses
- Perform cleanup tasks asynchronously

`EdgeRuntime.waitUntil()` lets you return a response immediately while continuing to process in the background.

## EdgeRuntime.waitUntil Pattern

### Basic Pattern

```typescript
Deno.serve(async (req) => {
  const { userId, action } = await req.json()

  // 1. Return response immediately
  const response = new Response(JSON.stringify({ accepted: true }), {
    status: 202,  // 202 Accepted = "I got it, processing..."
    headers: { 'Content-Type': 'application/json' },
  })

  // 2. Process in background AFTER response is sent
  EdgeRuntime.waitUntil(
    processInBackground(userId, action)
  )

  return response
})

async function processInBackground(userId: string, action: string) {
  // This runs after the response is sent
  // Take your time - the user already got their response
  await sendAnalytics(userId, action)
  await updateAggregates(userId)
  await notifyAdmins(action)
}
```

### How It Works

```
Timeline:
─────────────────────────────────────────────────────────────────────>
     │              │                                    │
  Request       Response                            Background
  Received      Sent (202)                          Completes
     │              │                                    │
     │    [User waits]   [User continues]                │
     │<─────────────>    <──────────────────────────────>│
          ~50ms              Background processing
                             (up to execution limit)
```

## Use Cases

### Use Case 1: Webhook Processing

Process payment webhooks without making the sender wait:

```typescript
import { createClient } from '@supabase/supabase-js'
import Stripe from 'https://esm.sh/stripe@14.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

Deno.serve(async (req) => {
  // 1. Verify webhook signature first
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    )
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }

  // 2. Acknowledge receipt immediately
  // Stripe will retry if we don't respond within 20 seconds
  const response = new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  // 3. Process event in background
  EdgeRuntime.waitUntil(processStripeEvent(event))

  return response
})

async function processStripeEvent(event: Stripe.Event) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      await supabase.from('orders').update({
        status: 'paid',
        stripe_session_id: session.id,
      }).eq('id', session.client_reference_id)
      await sendOrderConfirmationEmail(session.customer_email!)
      break

    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription
      await supabase.from('subscriptions').update({
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000),
      }).eq('stripe_subscription_id', subscription.id)
      break
  }
}
```

### Use Case 2: Email Sending

Send emails without blocking the API response:

```typescript
Deno.serve(async (req) => {
  const { email, name, message } = await req.json()

  // Validate input
  if (!email || !message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Store the contact form submission
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data, error } = await supabase
    .from('contact_submissions')
    .insert({ email, name, message })
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to save' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Respond immediately
  const response = new Response(JSON.stringify({ success: true, id: data.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  // Send emails in background
  EdgeRuntime.waitUntil(
    Promise.all([
      sendConfirmationEmail(email, name),
      notifyTeam(data),
    ])
  )

  return response
})

async function sendConfirmationEmail(email: string, name: string) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: 'noreply@example.com', name: 'Example App' },
      subject: 'We received your message',
      content: [{
        type: 'text/plain',
        value: `Hi ${name}, thanks for reaching out. We'll get back to you soon.`,
      }],
    }),
  })

  if (!response.ok) {
    console.error('Failed to send confirmation email:', await response.text())
  }
}

async function notifyTeam(submission: { id: string; email: string; message: string }) {
  // Notify team via Slack, email, etc.
}
```

### Use Case 3: Analytics and Logging

Track events without impacting response time:

```typescript
Deno.serve(async (req) => {
  const startTime = Date.now()
  const { action, data } = await req.json()

  // Process the main request
  const result = await processAction(action, data)

  // Prepare response
  const response = new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

  // Log analytics in background
  const requestDuration = Date.now() - startTime
  EdgeRuntime.waitUntil(
    logAnalytics({
      action,
      duration: requestDuration,
      userId: data.userId,
      timestamp: new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      country: req.headers.get('cf-ipcountry'),  // Cloudflare header
    })
  )

  return response
})

async function logAnalytics(event: Record<string, unknown>) {
  // Send to analytics service
  await fetch('https://api.posthog.com/capture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: Deno.env.get('POSTHOG_API_KEY'),
      event: 'api_request',
      properties: event,
    }),
  })
}
```

## Error Handling in Background

### Catching Background Errors

Background errors won't affect the already-sent response, but you should still handle them:

```typescript
Deno.serve(async (req) => {
  const data = await req.json()

  // Respond immediately
  const response = new Response(JSON.stringify({ accepted: true }), {
    status: 202,
  })

  // Wrap background work in error handling
  EdgeRuntime.waitUntil(
    safeBackgroundProcess(data)
  )

  return response
})

async function safeBackgroundProcess(data: unknown) {
  try {
    await riskyOperation(data)
  } catch (error) {
    // Log the error for debugging
    console.error('Background processing failed:', error)

    // Optionally store for retry
    await storeFailedJob({
      data,
      error: error.message,
      timestamp: new Date().toISOString(),
    })

    // Optionally alert
    await alertOnFailure(error)
  }
}

async function storeFailedJob(job: Record<string, unknown>) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  await supabase.from('failed_jobs').insert(job)
}
```

### Retry Pattern

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      console.log(`Attempt ${attempt} failed:`, error.message)

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
      }
    }
  }

  throw lastError
}

// Usage in background
EdgeRuntime.waitUntil(
  withRetry(() => sendEmail(recipient, subject, body), 3, 2000)
)
```

## Execution Limits

### Understanding Limits

| Environment | Max Execution Time |
|-------------|-------------------|
| Free tier | 60 seconds |
| Pro tier | 60 seconds |
| After response sent | Same limit applies |

> **Important**: The execution limit applies to the TOTAL function execution time, including background work. If your function takes 50 seconds to respond and you start a 30-second background task, it will be cut off at 60 seconds total.

### Designing for Limits

```typescript
Deno.serve(async (req) => {
  const { items } = await req.json()

  // ❌ Bad: Processing 1000 items might exceed limit
  EdgeRuntime.waitUntil(
    Promise.all(items.map(processItem))
  )

  // ✅ Better: Batch processing with limit awareness
  EdgeRuntime.waitUntil(
    processBatch(items.slice(0, 100))  // Process only first 100
  )

  // ✅ Best: Queue remaining for separate processing
  if (items.length > 100) {
    await queueRemainingItems(items.slice(100))
  }

  return new Response(JSON.stringify({ accepted: true }))
})

async function queueRemainingItems(items: unknown[]) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Store for later processing by a cron job
  await supabase.from('job_queue').insert({
    type: 'process_items',
    payload: items,
    status: 'pending',
  })
}
```

## Multiple Background Tasks

### Running Tasks in Parallel

```typescript
Deno.serve(async (req) => {
  const { userId, orderId } = await req.json()

  // Respond immediately
  const response = new Response(JSON.stringify({ success: true }))

  // Run multiple background tasks in parallel
  EdgeRuntime.waitUntil(
    Promise.all([
      sendOrderConfirmation(userId, orderId),
      updateInventory(orderId),
      logPurchaseAnalytics(userId, orderId),
      triggerFulfillment(orderId),
    ])
  )

  return response
})
```

### Running Tasks Sequentially

```typescript
Deno.serve(async (req) => {
  const { data } = await req.json()

  const response = new Response(JSON.stringify({ accepted: true }))

  // Sequential processing - each step depends on previous
  EdgeRuntime.waitUntil(
    (async () => {
      const processedData = await step1Process(data)
      const enrichedData = await step2Enrich(processedData)
      await step3Store(enrichedData)
      await step4Notify(enrichedData)
    })()
  )

  return response
})
```

## Anti-Patterns

### Don't Wait for waitUntil

```typescript
// ❌ Wrong: Awaiting waitUntil defeats the purpose
Deno.serve(async (req) => {
  const data = await req.json()

  await EdgeRuntime.waitUntil(processBackground(data))  // Don't await!

  return new Response(JSON.stringify({ done: true }))
})

// ✅ Correct: Don't await, just register
Deno.serve(async (req) => {
  const data = await req.json()

  EdgeRuntime.waitUntil(processBackground(data))  // No await

  return new Response(JSON.stringify({ accepted: true }))
})
```

### Don't Ignore Critical Errors

```typescript
// ❌ Wrong: Silent failures
EdgeRuntime.waitUntil(
  processPayment(data)  // If this fails, you'll never know!
)

// ✅ Correct: Handle errors
EdgeRuntime.waitUntil(
  processPayment(data).catch(async (error) => {
    console.error('Payment processing failed:', error)
    await alertOncall(error)
    await storeForRetry(data)
  })
)
```

### Don't Exceed Time Limits

```typescript
// ❌ Wrong: Unbounded processing
EdgeRuntime.waitUntil(
  items.forEach(async (item) => {
    await processItem(item)  // Could take forever!
  })
)

// ✅ Correct: Bounded with timeout
EdgeRuntime.waitUntil(
  Promise.race([
    processItems(items.slice(0, 50)),
    timeout(55000),  // Leave buffer before 60s limit
  ])
)

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Background timeout')), ms)
  )
}
```

## Monitoring Background Jobs

### Logging Pattern

```typescript
async function trackedBackgroundJob(
  jobName: string,
  fn: () => Promise<void>,
) {
  const startTime = Date.now()
  console.log(`[${jobName}] Starting background job`)

  try {
    await fn()
    const duration = Date.now() - startTime
    console.log(`[${jobName}] Completed in ${duration}ms`)
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${jobName}] Failed after ${duration}ms:`, error)
    throw error
  }
}

// Usage
EdgeRuntime.waitUntil(
  trackedBackgroundJob('send-email', () => sendEmail(recipient, body))
)
```

## Related Resources

- [edge-function-structure.md](./edge-function-structure.md) - Function basics
- [error-handling.md](./error-handling.md) - Error patterns
- [service-role-patterns.md](./service-role-patterns.md) - Background jobs often need admin access
