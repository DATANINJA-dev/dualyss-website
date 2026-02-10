# Error Handling

Robust error response patterns for Supabase Edge Functions.

## Problem Statement

Edge Functions need consistent error handling that:
- Provides useful information for debugging
- Doesn't leak sensitive information
- Uses appropriate HTTP status codes
- Maintains CORS headers even on errors
- Enables client-side error handling

## Standard Error Response Format

### JSON Error Structure

```typescript
interface ErrorResponse {
  error: {
    code: string       // Machine-readable error code
    message: string    // Human-readable message
    details?: unknown  // Additional context (optional)
  }
}
```

### Example Responses

```typescript
// Validation error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email address is required",
    "details": {
      "field": "email",
      "constraint": "required"
    }
  }
}

// Authentication error
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}

// Internal error
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## HTTP Status Code Guide

| Status | When to Use | Example |
|--------|-------------|---------|
| 400 | Invalid request data | Missing fields, wrong format |
| 401 | Missing or invalid auth | No token, expired token |
| 403 | Authenticated but not authorized | User can't access resource |
| 404 | Resource not found | User ID doesn't exist |
| 409 | Conflict | Duplicate email |
| 422 | Valid syntax but unprocessable | Business rule violation |
| 429 | Too many requests | Rate limit exceeded |
| 500 | Server error | Database down, bug |
| 502 | Bad gateway | External service failed |
| 503 | Service unavailable | Maintenance mode |

## Error Response Helper

### Utility Module

```typescript
// supabase/functions/_shared/error-response.ts

import { corsHeaders } from './cors.ts'

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'SERVICE_UNAVAILABLE'

interface ErrorOptions {
  code: ErrorCode
  message: string
  status?: number
  details?: unknown
}

const STATUS_MAP: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  EXTERNAL_SERVICE_ERROR: 502,
  SERVICE_UNAVAILABLE: 503,
}

export function errorResponse(options: ErrorOptions): Response {
  const status = options.status ?? STATUS_MAP[options.code] ?? 500

  const body: { error: { code: string; message: string; details?: unknown } } = {
    error: {
      code: options.code,
      message: options.message,
    },
  }

  if (options.details !== undefined) {
    body.error.details = options.details
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

// Convenience functions for common errors
export const validationError = (message: string, details?: unknown) =>
  errorResponse({ code: 'VALIDATION_ERROR', message, details })

export const unauthorizedError = (message = 'Authentication required') =>
  errorResponse({ code: 'UNAUTHORIZED', message })

export const forbiddenError = (message = 'Access denied') =>
  errorResponse({ code: 'FORBIDDEN', message })

export const notFoundError = (resource = 'Resource') =>
  errorResponse({ code: 'NOT_FOUND', message: `${resource} not found` })

export const conflictError = (message: string) =>
  errorResponse({ code: 'CONFLICT', message })

export const internalError = (message = 'An unexpected error occurred') =>
  errorResponse({ code: 'INTERNAL_ERROR', message })
```

### Usage

```typescript
import {
  validationError,
  unauthorizedError,
  notFoundError,
  internalError,
} from '../_shared/error-response.ts'

Deno.serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return unauthorizedError()
    }

    // Parse body
    const body = await req.json()

    // Validation
    if (!body.email) {
      return validationError('Email is required', { field: 'email' })
    }

    if (!isValidEmail(body.email)) {
      return validationError('Invalid email format', {
        field: 'email',
        value: body.email,
      })
    }

    // Business logic
    const user = await findUser(body.email)
    if (!user) {
      return notFoundError('User')
    }

    return new Response(JSON.stringify({ user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return internalError()
  }
})
```

## Try-Catch Patterns

### Basic Pattern

```typescript
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // All your logic here
    const result = await processRequest(req)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    // Centralized error handling
    return handleError(error)
  }
})

function handleError(error: unknown): Response {
  // Log full error for debugging
  console.error('Error:', error)

  // Check for known error types
  if (error instanceof ValidationError) {
    return validationError(error.message, error.details)
  }

  if (error instanceof AuthError) {
    return unauthorizedError(error.message)
  }

  if (error instanceof NotFoundError) {
    return notFoundError(error.resource)
  }

  // Generic error - don't leak details
  return internalError()
}
```

### Custom Error Classes

```typescript
// supabase/functions/_shared/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'AuthError'
  }
}

export class NotFoundError extends AppError {
  constructor(public resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
    this.name = 'ConflictError'
  }
}
```

### Error Handler

```typescript
// supabase/functions/_shared/error-handler.ts

import { corsHeaders } from './cors.ts'
import { AppError } from './errors.ts'

export function handleError(error: unknown): Response {
  // Log for debugging (will appear in Supabase logs)
  console.error('Error:', error)

  // Handle known errors
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
        },
      }),
      {
        status: error.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  // Handle Supabase errors
  if (isSupabaseError(error)) {
    return handleSupabaseError(error)
  }

  // Handle fetch errors (external services)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'EXTERNAL_SERVICE_ERROR',
          message: 'External service unavailable',
        },
      }),
      {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  // Unknown error - don't leak details
  return new Response(
    JSON.stringify({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
}

function isSupabaseError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}

function handleSupabaseError(error: { code: string; message: string }): Response {
  // Map Supabase error codes to HTTP status
  const statusMap: Record<string, number> = {
    'PGRST116': 404,  // No rows found
    '23505': 409,     // Unique violation
    '23503': 400,     // Foreign key violation
    '42501': 403,     // RLS violation
  }

  const status = statusMap[error.code] ?? 500

  return new Response(
    JSON.stringify({
      error: {
        code: error.code,
        message: error.message,
      },
    }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
}
```

## Validation Patterns

### Input Validation

```typescript
interface CreateUserInput {
  email: string
  name: string
  age?: number
}

function validateCreateUser(input: unknown): CreateUserInput {
  if (typeof input !== 'object' || input === null) {
    throw new ValidationError('Request body must be an object')
  }

  const { email, name, age } = input as Record<string, unknown>

  // Required fields
  if (typeof email !== 'string' || !email) {
    throw new ValidationError('Email is required', { field: 'email' })
  }

  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format', {
      field: 'email',
      value: email,
    })
  }

  if (typeof name !== 'string' || !name) {
    throw new ValidationError('Name is required', { field: 'name' })
  }

  if (name.length < 2 || name.length > 100) {
    throw new ValidationError('Name must be 2-100 characters', {
      field: 'name',
      min: 2,
      max: 100,
    })
  }

  // Optional fields
  if (age !== undefined) {
    if (typeof age !== 'number' || age < 0 || age > 150) {
      throw new ValidationError('Age must be a number between 0-150', {
        field: 'age',
      })
    }
  }

  return { email, name, age }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```

### Usage

```typescript
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const input = validateCreateUser(body)  // Throws ValidationError if invalid

    // Proceed with valid input
    const user = await createUser(input)

    return new Response(JSON.stringify({ user }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return handleError(error)
  }
})
```

## External Service Errors

### Handling Third-Party Failures

```typescript
async function callExternalAPI(data: unknown): Promise<unknown> {
  const response = await fetch('https://api.external.com/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorBody = await response.text()

    // Log full error for debugging
    console.error('External API error:', {
      status: response.status,
      body: errorBody,
    })

    // Return appropriate error to client
    if (response.status === 429) {
      throw new AppError(
        'External service rate limited',
        'RATE_LIMITED',
        429,
      )
    }

    if (response.status >= 500) {
      throw new AppError(
        'External service unavailable',
        'EXTERNAL_SERVICE_ERROR',
        502,
      )
    }

    throw new AppError(
      'External service error',
      'EXTERNAL_SERVICE_ERROR',
      502,
    )
  }

  return response.json()
}
```

### Retry with Backoff

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      console.log(`Attempt ${attempt} failed:`, error)

      // Don't retry on client errors (4xx)
      if (error instanceof AppError && error.status < 500) {
        throw error
      }

      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

// Usage
const data = await fetchWithRetry(
  () => callExternalAPI({ userId: '123' }),
  3,
  1000,
)
```

## Logging Best Practices

### What to Log

```typescript
// ✅ DO log these
console.error('Database query failed:', {
  query: 'select * from users where id = $1',
  params: ['user-id'],  // Be careful with PII
  error: error.message,
})

console.log('Request processed:', {
  method: req.method,
  path: new URL(req.url).pathname,
  duration: Date.now() - startTime,
})

// ❌ DON'T log these
console.log('API Key:', Deno.env.get('API_KEY'))  // Never log secrets
console.log('User password:', input.password)      // Never log passwords
console.log('Full request:', req)                  // Too much data
```

### Structured Logging

```typescript
function log(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  }

  if (level === 'error') {
    console.error(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

// Usage
log('info', 'Request started', {
  method: req.method,
  path: new URL(req.url).pathname,
})

log('error', 'Database query failed', {
  error: error.message,
  query: 'get_user',
})
```

## Security Considerations

### Never Leak Internal Details

```typescript
// ❌ Bad: Exposes internal structure
return new Response(JSON.stringify({
  error: error.stack,  // Exposes code paths
  query: 'SELECT * FROM users WHERE email = $1',  // Exposes schema
  dbError: pgError.detail,  // Exposes database details
}))

// ✅ Good: Generic message, log details server-side
console.error('Database error:', pgError)  // Server logs only
return new Response(JSON.stringify({
  error: {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  },
}))
```

### Environment-Aware Detail Level

```typescript
function handleError(error: unknown): Response {
  const isDev = Deno.env.get('ENVIRONMENT') !== 'production'

  const response: { error: { code: string; message: string; stack?: string } } = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  }

  // Only include stack trace in development
  if (isDev && error instanceof Error) {
    response.error.stack = error.stack
  }

  return new Response(JSON.stringify(response), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
```

## Complete Example

```typescript
// supabase/functions/create-order/index.ts

import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'
import { ValidationError, NotFoundError } from '../_shared/errors.ts'
import { handleError } from '../_shared/error-handler.ts'

interface CreateOrderInput {
  userId: string
  items: { productId: string; quantity: number }[]
}

function validateInput(body: unknown): CreateOrderInput {
  if (typeof body !== 'object' || body === null) {
    throw new ValidationError('Invalid request body')
  }

  const { userId, items } = body as Record<string, unknown>

  if (typeof userId !== 'string' || !userId) {
    throw new ValidationError('userId is required', { field: 'userId' })
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError('At least one item is required', { field: 'items' })
  }

  for (const item of items) {
    if (typeof item.productId !== 'string' || typeof item.quantity !== 'number') {
      throw new ValidationError('Invalid item format', { field: 'items' })
    }
    if (item.quantity < 1) {
      throw new ValidationError('Quantity must be at least 1', {
        field: 'items',
        productId: item.productId,
      })
    }
  }

  return { userId, items: items as CreateOrderInput['items'] }
}

Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse and validate
    const body = await req.json()
    const input = validateInput(body)

    // Create client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', input.userId)
      .single()

    if (userError || !user) {
      throw new NotFoundError('User')
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: input.userId,
        items: input.items,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      throw orderError
    }

    return new Response(JSON.stringify({ order }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return handleError(error)
  }
})
```

## Related Resources

- [cors-handling.md](./cors-handling.md) - CORS on error responses
- [service-role-patterns.md](./service-role-patterns.md) - Error logging in admin context
- [deno-testing.md](./deno-testing.md) - Testing error scenarios
