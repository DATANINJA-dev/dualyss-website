# Const Type Parameters

TypeScript 5.0+ feature for preserving literal types in generic functions.

## Problem Statement

When passing literal values to generic functions, TypeScript widens the types:

```typescript
// Without const, types are widened
function getRoutes<T>(routes: T) {
  return routes;
}

const routes = getRoutes(['/home', '/about', '/contact']);
// Type: string[] (widened!)
// We lost the literal types '/home' | '/about' | '/contact'
```

This type widening loses precision and prevents type-safe access to specific values.

## Solution Pattern

Use `const` type parameters to preserve literal types:

```typescript
// With const, literal types are preserved
function getRoutes<const T>(routes: T) {
  return routes;
}

const routes = getRoutes(['/home', '/about', '/contact']);
// Type: readonly ["/home", "/about", "/contact"]
// Literal types preserved!

// Type-safe access
type Route = (typeof routes)[number]; // "/home" | "/about" | "/contact"
```

### Key Syntax

```typescript
// Const type parameter
function fn<const T>(value: T): T { ... }

// Multiple const parameters
function fn<const T, const U>(a: T, b: U): [T, U] { ... }

// Const with constraints
function fn<const T extends readonly string[]>(arr: T): T { ... }
```

## Anti-Pattern

### Don't: Use `as const` at call site when `const` parameter works

```typescript
// Anti-pattern: Requires caller to remember `as const`
function createConfig<T>(config: T) {
  return config;
}

// Caller must use `as const` - easy to forget
const config = createConfig({
  env: 'production',
  port: 3000,
} as const);

// Better: Use const type parameter - automatic preservation
function createConfig<const T>(config: T) {
  return config;
}

// Caller doesn't need to remember anything
const config = createConfig({
  env: 'production',
  port: 3000,
});
// Type: { readonly env: "production"; readonly port: 3000; }
```

### Don't: Expect mutable behavior with const parameters

```typescript
// Anti-pattern: Expecting to modify values
function getItems<const T extends string[]>(items: T) {
  items.push('new'); // Error! T is inferred as readonly
  return items;
}

// Better: Don't use const if you need mutability
function getItems<T extends string[]>(items: T) {
  items.push('new'); // OK
  return items;
}
```

## Real-World Examples

### Example 1: Type-Safe Route Definitions

```typescript
function defineRoutes<const T extends Record<string, string>>(routes: T) {
  return {
    routes,
    navigate: (path: keyof T) => console.log(`Navigating to ${routes[path]}`),
  };
}

const router = defineRoutes({
  home: '/',
  about: '/about',
  contact: '/contact',
});

router.navigate('home');    // OK
router.navigate('invalid'); // Error: Argument of type '"invalid"' is not assignable
```

### Example 2: Type-Safe Event Emitter

```typescript
function createEventEmitter<const T extends Record<string, unknown[]>>() {
  type EventMap = T;
  const listeners = new Map<keyof EventMap, Set<Function>>();

  return {
    on<K extends keyof EventMap>(event: K, callback: (...args: EventMap[K]) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(callback);
    },
    emit<K extends keyof EventMap>(event: K, ...args: EventMap[K]) {
      listeners.get(event)?.forEach(cb => cb(...args));
    },
  };
}

const emitter = createEventEmitter<{
  userLogin: [userId: string, timestamp: number];
  pageView: [path: string];
}>();

emitter.on('userLogin', (userId, timestamp) => {
  // userId: string, timestamp: number - correctly typed!
});

emitter.emit('userLogin', 'user123', Date.now()); // OK
emitter.emit('userLogin', 123, Date.now());       // Error: number not assignable to string
```

### Example 3: Builder Pattern with Literal Types

```typescript
function createBuilder<const T extends Record<string, unknown>>(defaults: T) {
  type State = Partial<T>;
  let state: State = {};

  return {
    set<K extends keyof T>(key: K, value: T[K]) {
      state[key] = value;
      return this;
    },
    build(): T {
      return { ...defaults, ...state } as T;
    },
  };
}

const userBuilder = createBuilder({
  name: '',
  role: 'user' as const,
  active: true,
});

const user = userBuilder
  .set('name', 'Alice')
  .set('role', 'admin') // Error if role is constrained
  .build();
```

## When to Use

| Scenario | Use Const? | Reason |
|----------|------------|--------|
| Route/path definitions | Yes | Preserve literal paths for type safety |
| Config objects | Yes | Preserve literal values for validation |
| Tuple builders | Yes | Preserve tuple structure and literals |
| Mutable arrays | No | Const implies readonly |
| Simple value passing | Maybe | Only if literal precision needed |

### Decision Criteria

Use `const` type parameters when:
1. You need to preserve literal types (strings, numbers, booleans)
2. You want automatic `readonly` inference
3. You're building type-safe APIs that depend on specific values
4. You want to avoid forcing callers to use `as const`

Don't use when:
1. You need to mutate the input
2. Widened types are acceptable
3. You're working with primitive wrappers

## Common Mistakes

### Mistake 1: Forgetting const makes readonly

```typescript
function process<const T extends string[]>(items: T) {
  // T is readonly! This fails:
  items.sort(); // Error: Property 'sort' does not exist on type 'T'

  // Solution: Create a mutable copy
  const mutable = [...items];
  mutable.sort(); // OK
}
```

### Mistake 2: Using const with already-wide types

```typescript
// Pointless: Input is already wide
function process<const T>(value: string | number) {
  // T doesn't capture literals here
}

// Meaningful: Input preserves literals
function process<const T extends string | number>(value: T) {
  // T captures the specific literal
}
```

## TypeScript Version

- **Minimum**: TypeScript 5.0
- **Stable**: TypeScript 5.0+

## Related Patterns

- [Conditional Types](./conditional-types.md) - Use with infer for type extraction
- [Mapped Types](./mapped-types.md) - Transform const-inferred types
- [Type Guards](./type-guards.md) - Runtime validation of literal types
