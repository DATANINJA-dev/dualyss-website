# Type Guards and Narrowing

Runtime type checking with TypeScript type system benefits.

## Problem Statement

TypeScript doesn't know the runtime type of variables in conditional blocks:

```typescript
function processValue(value: string | number) {
  // TypeScript still sees value as string | number here
  value.toUpperCase(); // Error: Property 'toUpperCase' does not exist on type 'number'
}

// How do you tell TypeScript "I've verified this is a string"?
```

## Solution Pattern

### Built-in Type Guards

#### `typeof` Guard

```typescript
function processValue(value: string | number) {
  if (typeof value === 'string') {
    // TypeScript knows value is string here
    return value.toUpperCase();
  }
  // TypeScript knows value is number here
  return value.toFixed(2);
}
```

#### `instanceof` Guard

```typescript
class Dog {
  bark() { console.log('Woof!'); }
}

class Cat {
  meow() { console.log('Meow!'); }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // TypeScript knows this is Dog
  } else {
    animal.meow(); // TypeScript knows this is Cat
  }
}
```

#### `in` Operator Guard

```typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    animal.swim(); // TypeScript knows this is Fish
  } else {
    animal.fly();  // TypeScript knows this is Bird
  }
}
```

### Custom Type Predicates (`is` keyword)

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function process(value: unknown) {
  if (isString(value)) {
    // TypeScript knows value is string
    console.log(value.toUpperCase());
  }
}
```

### Assertion Functions (`asserts` keyword)

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Not a string!');
  }
}

function process(value: unknown) {
  assertIsString(value);
  // After assertion, TypeScript knows value is string
  console.log(value.toUpperCase());
}
```

### Discriminated Unions

```typescript
type Success = { status: 'success'; data: string };
type Error = { status: 'error'; message: string };
type Loading = { status: 'loading' };

type State = Success | Error | Loading;

function handleState(state: State) {
  switch (state.status) {
    case 'success':
      console.log(state.data); // TypeScript knows it's Success
      break;
    case 'error':
      console.log(state.message); // TypeScript knows it's Error
      break;
    case 'loading':
      console.log('Loading...'); // TypeScript knows it's Loading
      break;
  }
}
```

### `satisfies` Operator (TypeScript 4.9+)

```typescript
// Validates type without widening
const config = {
  theme: 'dark',
  fontSize: 14,
} satisfies Record<string, string | number>;

// config.theme is still 'dark' (literal), not string
config.theme.toUpperCase(); // OK - TypeScript knows it's 'dark'
```

## Anti-Pattern

### Don't: Use type assertions without validation

```typescript
// Anti-pattern: Unsafe type assertion
function processUser(data: unknown) {
  const user = data as User; // Dangerous! No runtime check
  console.log(user.name); // Could crash if data isn't actually User
}

// Better: Validate with type guard
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof (data as any).name === 'string'
  );
}

function processUser(data: unknown) {
  if (isUser(data)) {
    console.log(data.name); // Safe
  }
}
```

### Don't: Return boolean when type predicate is appropriate

```typescript
// Anti-pattern: Loses type information
function isString(value: unknown): boolean {
  return typeof value === 'string';
}

function process(value: unknown) {
  if (isString(value)) {
    value.toUpperCase(); // Error! TypeScript doesn't know it's string
  }
}

// Better: Use type predicate
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

### Don't: Forget exhaustive checks

```typescript
type Status = 'pending' | 'approved' | 'rejected';

function getStatusColor(status: Status): string {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'approved':
      return 'green';
    // Forgot 'rejected'! No compile error without exhaustive check
  }
}

// Better: Add exhaustive check
function getStatusColor(status: Status): string {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'approved':
      return 'green';
    case 'rejected':
      return 'red';
    default:
      // This ensures all cases are handled
      const exhaustiveCheck: never = status;
      throw new Error(`Unhandled status: ${exhaustiveCheck}`);
  }
}
```

## Real-World Examples

### Example 1: API Response Validation

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is { success: true; data: T } {
  return response.success === true;
}

async function fetchUser(id: string): Promise<User> {
  const response = await api.get<ApiResponse<User>>(`/users/${id}`);

  if (isSuccessResponse(response)) {
    return response.data; // TypeScript knows data exists
  }

  throw new Error(response.error); // TypeScript knows error exists
}
```

### Example 2: Form Field Validation

```typescript
type TextField = { type: 'text'; value: string; maxLength?: number };
type NumberField = { type: 'number'; value: number; min?: number; max?: number };
type SelectField = { type: 'select'; value: string; options: string[] };

type FormField = TextField | NumberField | SelectField;

function validateField(field: FormField): boolean {
  switch (field.type) {
    case 'text':
      return !field.maxLength || field.value.length <= field.maxLength;
    case 'number':
      return (
        (field.min === undefined || field.value >= field.min) &&
        (field.max === undefined || field.value <= field.max)
      );
    case 'select':
      return field.options.includes(field.value);
    default:
      const _exhaustive: never = field;
      return false;
  }
}
```

### Example 3: Event Handler with Narrowing

```typescript
type ClickEvent = { type: 'click'; x: number; y: number };
type KeyEvent = { type: 'key'; key: string; code: number };
type FocusEvent = { type: 'focus'; target: HTMLElement };

type AppEvent = ClickEvent | KeyEvent | FocusEvent;

function isClickEvent(event: AppEvent): event is ClickEvent {
  return event.type === 'click';
}

function isKeyEvent(event: AppEvent): event is KeyEvent {
  return event.type === 'key';
}

function handleEvent(event: AppEvent) {
  if (isClickEvent(event)) {
    console.log(`Clicked at ${event.x}, ${event.y}`);
  } else if (isKeyEvent(event)) {
    console.log(`Key pressed: ${event.key}`);
  } else {
    console.log(`Focused on ${event.target.tagName}`);
  }
}
```

### Example 4: Zod-Style Schema Validation

```typescript
type Schema<T> = {
  parse: (value: unknown) => T;
  safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: Error };
  isType: (value: unknown) => value is T;
};

function createStringSchema(): Schema<string> {
  return {
    parse(value) {
      if (typeof value !== 'string') throw new Error('Expected string');
      return value;
    },
    safeParse(value) {
      if (typeof value !== 'string') {
        return { success: false, error: new Error('Expected string') };
      }
      return { success: true, data: value };
    },
    isType(value): value is string {
      return typeof value === 'string';
    },
  };
}

const stringSchema = createStringSchema();

function process(value: unknown) {
  if (stringSchema.isType(value)) {
    console.log(value.toUpperCase()); // TypeScript knows it's string
  }
}
```

### Example 5: Deep Object Type Guard

```typescript
type User = {
  id: string;
  name: string;
  email: string;
  profile?: {
    bio: string;
    avatar: string;
  };
};

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;

  const obj = value as Record<string, unknown>;

  if (typeof obj.id !== 'string') return false;
  if (typeof obj.name !== 'string') return false;
  if (typeof obj.email !== 'string') return false;

  if (obj.profile !== undefined) {
    if (typeof obj.profile !== 'object' || obj.profile === null) return false;
    const profile = obj.profile as Record<string, unknown>;
    if (typeof profile.bio !== 'string') return false;
    if (typeof profile.avatar !== 'string') return false;
  }

  return true;
}

// Usage with API response
async function getUser(id: string): Promise<User> {
  const data = await fetch(`/api/users/${id}`).then(r => r.json());

  if (!isUser(data)) {
    throw new Error('Invalid user data');
  }

  return data; // TypeScript knows this is User
}
```

### Example 6: Assertion with Error Context

```typescript
function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg ?? 'Assertion failed');
  }
}

function assertDefined<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(msg ?? 'Value is null or undefined');
  }
}

function processOrder(orderId: string | null) {
  assertDefined(orderId, 'Order ID is required');
  // TypeScript knows orderId is string
  console.log(`Processing order: ${orderId.toUpperCase()}`);
}
```

## When to Use

| Scenario | Guard Type | Pattern |
|----------|------------|---------|
| Primitive check | `typeof` | `typeof x === 'string'` |
| Class instance | `instanceof` | `x instanceof MyClass` |
| Property existence | `in` | `'prop' in obj` |
| Custom validation | `is` predicate | `function isX(v): v is X` |
| Throw on invalid | `asserts` | `function assertX(v): asserts v is X` |
| Union with tag | Discriminated union | `switch (obj.type)` |
| Validate without widening | `satisfies` | `x satisfies Type` |
| Ensure all cases handled | Exhaustive check | `const _: never = x` |

### `is` vs `asserts` Decision

| Use `is` when | Use `asserts` when |
|---------------|-------------------|
| You want to check in conditionals | You want to throw on failure |
| Control flow continues either way | Function should never return on failure |
| Returning a boolean is natural | You're validating preconditions |

## Common Mistakes

### Mistake 1: Type predicate that doesn't actually check

```typescript
// Dangerous: Always returns true!
function isUser(value: unknown): value is User {
  return true; // Lies to TypeScript
}

// TypeScript trusts your predicate - make sure it's correct
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}
```

### Mistake 2: Not handling `null` in object checks

```typescript
// Bug: typeof null === 'object'
function isObject(value: unknown): value is object {
  return typeof value === 'object'; // Includes null!
}

// Fixed
function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}
```

### Mistake 3: Forgetting `satisfies` doesn't narrow

```typescript
const value = getData() satisfies string | number;
// value is still string | number - satisfies validates, doesn't narrow

// To narrow, use a type guard
if (typeof value === 'string') {
  // Now value is string
}
```

## TypeScript Version

- **Type predicates**: TypeScript 1.6+
- **Assertion functions**: TypeScript 3.7+
- **satisfies operator**: TypeScript 4.9+

## Related Patterns

- [Conditional Types](./conditional-types.md) - Type-level conditionals
- [Utility Types](./utility-types.md) - Creating validation utilities
- [Generics Advanced](./generics-advanced.md) - Generic type guards
