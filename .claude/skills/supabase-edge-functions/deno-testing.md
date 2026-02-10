# Deno Testing Patterns

Testing strategies for Supabase Edge Functions using Deno's built-in test framework.

## Problem Statement

Testing Edge Functions requires a different approach than traditional Node.js:
- Deno has its own test runner (`Deno.test`)
- Different assertion library (`deno.land/std/testing`)
- Need to mock Supabase client and environment variables
- Integration testing against local Supabase instance

## Deno.test Basics

### Simple Test

```typescript
// tests/hello-world_test.ts

import { assertEquals } from "https://deno.land/std@0.208.0/testing/asserts.ts"

Deno.test("basic addition", () => {
  assertEquals(1 + 1, 2)
})
```

### Async Test

```typescript
Deno.test("async operation", async () => {
  const response = await fetch("https://api.example.com/data")
  const data = await response.json()

  assertEquals(data.status, "ok")
})
```

### Test with Setup/Teardown

```typescript
Deno.test({
  name: "database operation",
  async fn() {
    // Setup
    const client = createTestClient()
    await client.from("test_items").delete().neq("id", "")

    // Test
    const { data } = await client.from("test_items").insert({ name: "test" }).select()
    assertEquals(data?.length, 1)

    // Teardown
    await client.from("test_items").delete().neq("id", "")
  },
  // Optional: sanitizers
  sanitizeResources: false,  // Skip resource leak checks
  sanitizeOps: false,        // Skip async op checks
})
```

## Assertion Library

### Available Assertions

```typescript
import {
  assertEquals,
  assertNotEquals,
  assertStrictEquals,
  assertExists,
  assertStringIncludes,
  assertArrayIncludes,
  assertMatch,
  assertThrows,
  assertRejects,
  assert,
} from "https://deno.land/std@0.208.0/testing/asserts.ts"

// Equality
assertEquals(actual, expected)
assertNotEquals(actual, notExpected)
assertStrictEquals(actual, expected)  // Uses Object.is()

// Existence
assertExists(value)  // Not null or undefined
assert(condition)    // Truthy

// Strings
assertStringIncludes("hello world", "world")
assertMatch("hello", /^h/)

// Arrays
assertArrayIncludes([1, 2, 3], [1, 2])

// Errors
assertThrows(() => { throw new Error("boom") }, Error, "boom")
await assertRejects(async () => { throw new Error("async boom") })
```

## Testing Edge Functions

### Unit Testing a Function

```typescript
// supabase/functions/process-order/index.ts
export function calculateTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

Deno.serve(async (req) => {
  const { items } = await req.json()
  const total = calculateTotal(items)
  return new Response(JSON.stringify({ total }))
})
```

```typescript
// supabase/functions/process-order/process-order_test.ts
import { assertEquals } from "https://deno.land/std@0.208.0/testing/asserts.ts"
import { calculateTotal } from "./index.ts"

Deno.test("calculateTotal with multiple items", () => {
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 },
  ]
  assertEquals(calculateTotal(items), 35)
})

Deno.test("calculateTotal with empty array", () => {
  assertEquals(calculateTotal([]), 0)
})
```

### Integration Testing

```typescript
// tests/integration/hello-world_test.ts

import { assertEquals } from "https://deno.land/std@0.208.0/testing/asserts.ts"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "http://localhost:54321"
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "your-anon-key"

Deno.test("hello-world function returns greeting", async () => {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/hello-world`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "World" }),
    }
  )

  assertEquals(response.status, 200)

  const data = await response.json()
  assertEquals(data.message, "Hello, World!")
})

Deno.test("hello-world function handles missing name", async () => {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/hello-world`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  )

  assertEquals(response.status, 400)

  const data = await response.json()
  assertStringIncludes(data.error, "name")
})
```

## Mocking Supabase Client

### Mock Pattern

```typescript
// tests/mocks/supabase-mock.ts

export function createMockSupabaseClient(mockData: Record<string, unknown[]>) {
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: mockData[table]?.[0], error: null }),
        }),
        data: mockData[table],
        error: null,
      }),
      insert: (data: unknown) => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: 1, ...data }, error: null }),
        }),
      }),
      update: (data: unknown) => ({
        eq: () => Promise.resolve({ data, error: null }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    auth: {
      getUser: () => Promise.resolve({
        data: { user: { id: "test-user-id", email: "test@example.com" } },
        error: null,
      }),
    },
  }
}
```

### Using the Mock

```typescript
import { assertEquals } from "https://deno.land/std@0.208.0/testing/asserts.ts"
import { createMockSupabaseClient } from "./mocks/supabase-mock.ts"

// Function being tested
async function getUser(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) throw error
  return data
}

Deno.test("getUser returns user data", async () => {
  const mockClient = createMockSupabaseClient({
    users: [{ id: "123", name: "John" }],
  })

  const user = await getUser(mockClient as SupabaseClient, "123")

  assertEquals(user.name, "John")
})
```

## Mocking Environment Variables

### Using stub

```typescript
import { assertEquals } from "https://deno.land/std@0.208.0/testing/asserts.ts"
import { stub } from "https://deno.land/std@0.208.0/testing/mock.ts"

Deno.test("function uses environment variable", () => {
  // Stub Deno.env.get
  const envStub = stub(Deno.env, "get", (key: string) => {
    if (key === "API_KEY") return "test-api-key"
    return undefined
  })

  try {
    // Your test code
    const apiKey = Deno.env.get("API_KEY")
    assertEquals(apiKey, "test-api-key")
  } finally {
    // Always restore
    envStub.restore()
  }
})
```

### Environment File Approach

```bash
# .env.test
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-key
API_KEY=test-api-key
```

```bash
# Run tests with env file
deno test --allow-env --allow-net --env=.env.test
```

## Mocking fetch

```typescript
import { stub } from "https://deno.land/std@0.208.0/testing/mock.ts"
import { assertEquals } from "https://deno.land/std@0.208.0/testing/asserts.ts"

Deno.test("external API call", async () => {
  const fetchStub = stub(
    globalThis,
    "fetch",
    () => Promise.resolve(new Response(
      JSON.stringify({ status: "ok" }),
      { status: 200 }
    ))
  )

  try {
    const response = await fetch("https://api.external.com/data")
    const data = await response.json()

    assertEquals(data.status, "ok")
  } finally {
    fetchStub.restore()
  }
})
```

## Test Coverage

```bash
# Generate coverage
deno test --coverage=coverage

# Generate HTML report
deno coverage coverage --html

# Generate lcov report (for CI)
deno coverage coverage --lcov --output=coverage.lcov
```

## Running Tests

### Basic Commands

```bash
# Run all tests
deno test

# Run specific file
deno test supabase/functions/my-function/my-function_test.ts

# Run with permissions
deno test --allow-env --allow-net --allow-read

# Watch mode
deno test --watch

# Filter by test name
deno test --filter "calculateTotal"

# Parallel execution
deno test --parallel
```

### Recommended Test Script

```json
// deno.json
{
  "tasks": {
    "test": "deno test --allow-env --allow-net --allow-read",
    "test:watch": "deno test --allow-env --allow-net --allow-read --watch",
    "test:coverage": "deno test --allow-env --allow-net --allow-read --coverage=coverage && deno coverage coverage --html"
  }
}
```

```bash
# Run via task
deno task test
deno task test:watch
deno task test:coverage
```

## CI Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test Edge Functions

on:
  push:
    paths:
      - 'supabase/functions/**'
  pull_request:
    paths:
      - 'supabase/functions/**'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Run tests
        run: deno test --allow-env --allow-net --allow-read

      - name: Generate coverage
        run: |
          deno test --allow-env --allow-net --allow-read --coverage=coverage
          deno coverage coverage --lcov --output=coverage.lcov

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: coverage.lcov
```

## Common Test Mistakes

### 1. Not Cleaning Up Resources

```typescript
// ❌ Resource leak
Deno.test("database test", async () => {
  const response = await fetch(url)
  const data = await response.json()
  assertEquals(data.status, "ok")
  // Response body not consumed if large
})

// ✅ Consume or close resources
Deno.test("database test", async () => {
  const response = await fetch(url)
  const data = await response.json()
  assertEquals(data.status, "ok")
  // Body fully consumed by json()
})

// ✅ Or disable sanitizers for specific tests
Deno.test({
  name: "resource-heavy test",
  fn: async () => { ... },
  sanitizeResources: false,
})
```

### 2. Hardcoding URLs

```typescript
// ❌ Won't work in CI
const response = await fetch("http://localhost:54321/functions/v1/test")

// ✅ Use environment variables
const BASE_URL = Deno.env.get("SUPABASE_URL") ?? "http://localhost:54321"
const response = await fetch(`${BASE_URL}/functions/v1/test`)
```

### 3. Missing Permissions

```typescript
// ❌ Test fails with permission error
// deno test
// error: Uncaught PermissionDenied: requires env access

// ✅ Grant required permissions
// deno test --allow-env --allow-net
```

## Test Organization

```
supabase/
└── functions/
    ├── _shared/
    │   ├── utils.ts
    │   └── utils_test.ts         # Unit tests for shared code
    │
    ├── my-function/
    │   ├── index.ts
    │   └── my-function_test.ts   # Unit tests for this function
    │
    └── tests/
        └── integration/
            └── my-function_test.ts  # Integration tests
```

## Related Resources

- [edge-function-structure.md](./edge-function-structure.md) - Function organization
- [ci-cd-integration.md](./ci-cd-integration.md) - CI/CD setup
- [Deno Testing Documentation](https://deno.land/manual/basics/testing)
