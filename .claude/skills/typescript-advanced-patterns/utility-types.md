# Utility Type Creation Patterns

Creating custom utility types that extend TypeScript's built-in utilities.

## Problem Statement

TypeScript's built-in utility types (`Partial`, `Pick`, `Omit`, etc.) are shallow and limited:

```typescript
type User = {
  name: string;
  settings: {
    theme: string;
    notifications: {
      email: boolean;
      sms: boolean;
    };
  };
};

// Built-in Partial only makes top-level properties optional
type PartialUser = Partial<User>;
// {
//   name?: string;
//   settings?: { theme: string; notifications: {...} }; // Still required inside!
// }

// We need DeepPartial for nested optional properties
```

## Solution Pattern

### DeepPartial - Recursive Optional Properties

```typescript
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// Usage
type DeepPartialUser = DeepPartial<User>;
// {
//   name?: string;
//   settings?: {
//     theme?: string;
//     notifications?: {
//       email?: boolean;
//       sms?: boolean;
//     };
//   };
// }
```

### DeepReadonly - Recursive Immutability

```typescript
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

// Usage
const config: DeepReadonly<Config> = getConfig();
config.settings.theme = 'dark'; // Error: Cannot assign to readonly property
```

### RequiredKeys / OptionalKeys - Extract Key Types

```typescript
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// Usage
type User = { id: string; name?: string; email?: string };

type Required = RequiredKeys<User>; // "id"
type Optional = OptionalKeys<User>; // "name" | "email"
```

### Mutable - Remove Readonly

```typescript
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

type DeepMutable<T> = T extends object
  ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
  : T;

// Usage
type ReadonlyUser = { readonly id: string; readonly name: string };
type MutableUser = Mutable<ReadonlyUser>; // { id: string; name: string }
```

## Anti-Pattern

### Don't: Recreate built-in utilities

```typescript
// Anti-pattern: Replicating Pick
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Just use built-in Pick<T, K>
```

### Don't: Over-engineer simple cases

```typescript
// Anti-pattern: Complex utility for simple case
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// When this is simpler and clearer:
type UserUpdate = Partial<User>;

// Only use MakeOptional when you need selective optionality
```

### Don't: Create utilities without clear use cases

```typescript
// Anti-pattern: Utility without practical use
type WeirdType<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

// Only create utilities you'll actually use
```

## Real-World Examples

### Example 1: PickByValue - Filter Properties by Type

```typescript
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

type User = {
  id: number;
  name: string;
  email: string;
  age: number;
  isAdmin: boolean;
};

type StringProps = PickByValue<User, string>;
// { name: string; email: string }

type NumberProps = PickByValue<User, number>;
// { id: number; age: number }
```

### Example 2: OmitByValue - Remove Properties by Type

```typescript
type OmitByValue<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};

type NonFunctions = OmitByValue<{
  name: string;
  age: number;
  greet: () => void;
  save: () => Promise<void>;
}, Function>;
// { name: string; age: number }
```

### Example 3: Nullable - Make Properties Nullable

```typescript
type Nullable<T> = { [K in keyof T]: T[K] | null };

type DeepNullable<T> = T extends object
  ? { [K in keyof T]: DeepNullable<T[K]> | null }
  : T | null;

// Usage for API responses that might have null values
type ApiUser = DeepNullable<User>;
```

### Example 4: PathValue - Type-Safe Object Path Access

```typescript
type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : never
    : P extends keyof T
      ? T[P]
      : never;

// Type-safe get function
function get<T, P extends string>(obj: T, path: P): PathValue<T, P> {
  return path.split('.').reduce((o, k) => (o as any)[k], obj) as PathValue<T, P>;
}

const user = { profile: { address: { city: 'NYC' } } };
const city = get(user, 'profile.address.city'); // Type: string
```

### Example 5: Branded Types for Nominal Typing

```typescript
// Brand symbol for nominal typing
declare const brand: unique symbol;

type Brand<T, B> = T & { [brand]: B };

// Create branded types
type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

// Type-safe IDs that aren't interchangeable
function getUser(id: UserId): User { ... }
function getOrder(id: OrderId): Order { ... }

const userId = 'user_123' as UserId;
const orderId = 'order_456' as OrderId;

getUser(userId);  // OK
getUser(orderId); // Error: OrderId not assignable to UserId
```

### Example 6: StrictOmit - Omit with Key Validation

```typescript
// Built-in Omit allows any string, including typos
type User = { id: string; name: string };
type Bad = Omit<User, 'nmae'>; // No error on typo!

// StrictOmit only allows existing keys
type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type Good = StrictOmit<User, 'name'>; // OK
type Error = StrictOmit<User, 'nmae'>; // Error: 'nmae' not in keyof User
```

### Example 7: AtLeastOne - Require At Least One Property

```typescript
type AtLeastOne<T, Keys extends keyof T = keyof T> =
  Keys extends keyof T
    ? Required<Pick<T, Keys>> & Partial<Omit<T, Keys>>
    : never;

type SearchParams = {
  query?: string;
  category?: string;
  tag?: string;
};

// At least one search param required
type ValidSearch = AtLeastOne<SearchParams>;

const search1: ValidSearch = { query: 'test' }; // OK
const search2: ValidSearch = {}; // Error: At least one property required
```

### Example 8: ExactlyOne - Require Exactly One Property

```typescript
type ExactlyOne<T, Keys extends keyof T = keyof T> =
  Keys extends keyof T
    ? Required<Pick<T, Keys>> & Partial<Record<Exclude<keyof T, Keys>, never>>
    : never;

type PaymentMethod = {
  creditCard?: { number: string };
  bankTransfer?: { iban: string };
  paypal?: { email: string };
};

type ValidPayment = ExactlyOne<PaymentMethod>;

const payment1: ValidPayment = { creditCard: { number: '1234' } }; // OK
const payment2: ValidPayment = { // Error: Can't have both
  creditCard: { number: '1234' },
  paypal: { email: 'test@test.com' },
};
```

## When to Use

| Built-in | Custom Alternative | When to Use Custom |
|----------|-------------------|-------------------|
| `Partial<T>` | `DeepPartial<T>` | Nested objects need optional props |
| `Readonly<T>` | `DeepReadonly<T>` | Full immutability needed |
| `Pick<T, K>` | `PickByValue<T, V>` | Filter by value type, not key |
| `Omit<T, K>` | `StrictOmit<T, K>` | Prevent typos in key names |
| None | `Brand<T, B>` | Need nominal typing (IDs, units) |

### Decision Criteria

Create custom utilities when:
1. Built-in utilities don't handle nested structures
2. You need type-based filtering (by value, not key)
3. You need nominal/branded types
4. You have a recurring pattern across your codebase

Don't create utilities when:
1. Built-in types suffice
2. It's a one-off transformation
3. The utility is too complex to understand at a glance

## Testing Utility Types

```typescript
// Use type assertions to test utility types
type Assert<T, Expected> = T extends Expected
  ? Expected extends T
    ? true
    : never
  : never;

// Test DeepPartial
type TestDeepPartial = Assert<
  DeepPartial<{ a: { b: string } }>,
  { a?: { b?: string } }
>; // Should be true

// Test PickByValue
type TestPickByValue = Assert<
  PickByValue<{ a: string; b: number }, string>,
  { a: string }
>; // Should be true
```

## TypeScript Version

- **Minimum**: TypeScript 4.1 (key remapping with `as`)
- **Recommended**: TypeScript 4.5+ (tail recursion optimization)

## Related Patterns

- [Conditional Types](./conditional-types.md) - Foundation for utility types
- [Mapped Types](./mapped-types.md) - Core mechanism for transformations
- [Template Literal Types](./template-literal-types.md) - String-based utilities
