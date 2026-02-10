# Conditional Types with Infer

Type-level conditionals and the `infer` keyword for extracting types from complex structures.

## Problem Statement

You need to extract or transform types based on their structure:

```typescript
// How do you get the return type of a function?
type MyFunc = () => { name: string; age: number };
// Want: { name: string; age: number }

// How do you unwrap a Promise?
type MyPromise = Promise<User[]>;
// Want: User[]

// How do you get array element type?
type MyArray = string[];
// Want: string
```

Without conditional types, you'd need to manually specify these extracted types.

## Solution Pattern

### Basic Conditional Type Syntax

```typescript
type Condition<T> = T extends SomeType ? TrueType : FalseType;
```

### Using `infer` to Extract Types

```typescript
// Extract return type
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;

type Result = ReturnOf<() => string>; // string

// Extract Promise inner type
type Awaited<T> = T extends Promise<infer U> ? U : T;

type Result = Awaited<Promise<number>>; // number

// Extract array element type
type ElementOf<T> = T extends (infer E)[] ? E : never;

type Result = ElementOf<string[]>; // string
```

### Distributive Conditional Types

When `T` is a union, the conditional distributes over each member:

```typescript
type ToArray<T> = T extends unknown ? T[] : never;

// Distributes: string | number becomes string[] | number[]
type Result = ToArray<string | number>; // string[] | number[]
```

### Non-Distributive Conditional Types

Wrap in tuple to prevent distribution:

```typescript
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;

// Does NOT distribute: keeps as union array
type Result = ToArrayNonDist<string | number>; // (string | number)[]
```

## Anti-Pattern

### Don't: Create overly nested conditionals

```typescript
// Anti-pattern: Hard to read and maintain
type DeepExtract<T> =
  T extends Promise<infer P>
    ? P extends Array<infer E>
      ? E extends object
        ? E extends { id: infer I }
          ? I
          : never
        : never
      : never
    : never;

// Better: Break into smaller, named types
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type UnwrapArray<T> = T extends (infer E)[] ? E : T;
type ExtractId<T> = T extends { id: infer I } ? I : never;

type DeepExtract<T> = ExtractId<UnwrapArray<UnwrapPromise<T>>>;
```

### Don't: Forget about `never` in unions

```typescript
// Anti-pattern: Never silently disappears from unions
type Filter<T, U> = T extends U ? T : never;

type Result = Filter<string | number | boolean, string | number>;
// Result: string | number (boolean becomes never, which disappears)

// Be explicit when this behavior is intentional
type FilteredUnion<T, U> = T extends U ? T : never;
// Document: "Returns never for non-matching types (disappears from unions)"
```

## Real-World Examples

### Example 1: API Response Type Extraction

```typescript
// Extract success data type from API response
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type ExtractData<T> = T extends { success: true; data: infer D } ? D : never;

type UserResponse = ApiResponse<{ id: string; name: string }>;
type UserData = ExtractData<UserResponse>; // { id: string; name: string }
```

### Example 2: Event Handler Parameter Extraction

```typescript
type EventMap = {
  click: { x: number; y: number };
  keydown: { key: string; code: number };
  submit: { formData: FormData };
};

// Extract event parameter type
type EventParam<K extends keyof EventMap> = EventMap[K];

// Extract handler function type
type Handler<K extends keyof EventMap> = (event: EventParam<K>) => void;

// Use in event emitter
function on<K extends keyof EventMap>(event: K, handler: Handler<K>) {
  // Type-safe handler registration
}

on('click', (e) => {
  console.log(e.x, e.y); // Correctly typed!
});
```

### Example 3: Function Overload Type Extraction

```typescript
// Extract all parameter types from overloaded function
type OverloadParameters<T> =
  T extends {
    (...args: infer A1): any;
    (...args: infer A2): any;
  } ? A1 | A2 :
  T extends (...args: infer A) => any ? A : never;

declare function fetch(url: string): Promise<Response>;
declare function fetch(url: string, init: RequestInit): Promise<Response>;

type FetchParams = OverloadParameters<typeof fetch>;
// [url: string] | [url: string, init: RequestInit]
```

### Example 4: Deep Readonly with Conditional Recursion

```typescript
type DeepReadonly<T> = T extends Function
  ? T  // Don't make functions readonly
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T; // Primitives stay as-is

type User = {
  name: string;
  settings: {
    theme: string;
    notifications: boolean;
  };
  updateProfile: (name: string) => void;
};

type ReadonlyUser = DeepReadonly<User>;
// {
//   readonly name: string;
//   readonly settings: {
//     readonly theme: string;
//     readonly notifications: boolean;
//   };
//   updateProfile: (name: string) => void; // Function unchanged
// }
```

### Example 5: Type-Safe Path Extraction

```typescript
// Extract nested property type using path
type Path<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Path<T[K], Rest>
      : never
    : P extends keyof T
      ? T[P]
      : never;

type User = {
  profile: {
    name: string;
    address: {
      city: string;
      zip: number;
    };
  };
};

type City = Path<User, 'profile.address.city'>; // string
type Zip = Path<User, 'profile.address.zip'>;   // number
type Invalid = Path<User, 'profile.invalid'>;   // never
```

## When to Use

| Scenario | Conditional Type? | Pattern |
|----------|-------------------|---------|
| Extract function return type | Yes | `T extends (...args: any[]) => infer R ? R : never` |
| Unwrap Promise/Array | Yes | `T extends Promise<infer U> ? U : T` |
| Filter union members | Yes | `T extends SomeType ? T : never` |
| Transform based on structure | Yes | `T extends { prop: infer P } ? ... : ...` |
| Simple type mapping | Maybe | Consider mapped types first |
| Boolean flags | No | Use simple generics |

### Decision Criteria

Use conditional types when:
1. You need to extract types from complex structures
2. You need different behavior based on type structure
3. You're implementing utility types like `ReturnType`, `Parameters`
4. You need to filter union members

Don't use when:
1. Simple generics would suffice
2. Mapped types handle the transformation
3. The conditional is always true or false

## Infer Placement Patterns

```typescript
// Function return type
T extends (...args: any[]) => infer R ? R : never

// Function parameters
T extends (...args: infer P) => any ? P : never

// Array element
T extends (infer E)[] ? E : never
T extends Array<infer E> ? E : never

// Promise inner type
T extends Promise<infer U> ? U : T

// Object property
T extends { prop: infer P } ? P : never

// Constructor instance type
T extends new (...args: any[]) => infer I ? I : never

// Template literal parts
T extends `${infer First}-${infer Rest}` ? [First, Rest] : never
```

## Common Mistakes

### Mistake 1: Forgetting distribution behavior

```typescript
type IsString<T> = T extends string ? true : false;

// Unexpected: distributes over union
type Result = IsString<string | number>; // true | false (boolean!)

// Fix: Wrap in tuple for non-distributive
type IsStringStrict<T> = [T] extends [string] ? true : false;
type Result = IsStringStrict<string | number>; // false
```

### Mistake 2: Infer in wrong position

```typescript
// Wrong: infer outside extends clause
type Bad<T> = infer U extends T ? U : never; // Syntax error

// Correct: infer inside extends clause
type Good<T> = T extends infer U ? U : never;
```

### Mistake 3: Infinite recursion

```typescript
// Dangerous: Can cause infinite recursion
type DeepFlatten<T> = T extends any[]
  ? DeepFlatten<T[number]>
  : T;

// Safer: Add depth limit or base case
type DeepFlatten<T, Depth extends number = 5> =
  Depth extends 0
    ? T
    : T extends (infer E)[]
      ? DeepFlatten<E, Subtract<Depth, 1>>
      : T;
```

## TypeScript Version

- **Minimum**: TypeScript 2.8 (conditional types)
- **Recommended**: TypeScript 4.1+ (template literal types with infer)

## Related Patterns

- [Mapped Types](./mapped-types.md) - Often combined with conditionals
- [Template Literal Types](./template-literal-types.md) - Use infer for string parsing
- [Utility Types](./utility-types.md) - Built on conditional types
