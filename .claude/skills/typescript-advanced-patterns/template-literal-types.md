# Template Literal Types

String manipulation at the type level using template literal syntax.

## Problem Statement

You need type-safe string patterns but `string` is too broad:

```typescript
type EventHandler = (event: string) => void;

// Problem: Any string is accepted
const handler: EventHandler = (event) => {};
handler('onClick');     // OK
handler('typo');        // Also OK - no type safety!
handler(123 as any);    // Runtime error waiting to happen
```

## Solution Pattern

### Basic Template Literal Syntax

```typescript
type Greeting = `Hello, ${string}!`;

const valid: Greeting = 'Hello, World!';   // OK
const invalid: Greeting = 'Hi there!';     // Error
```

### Intrinsic String Manipulation Types

TypeScript provides built-in string manipulation:

```typescript
type Upper = Uppercase<'hello'>;      // "HELLO"
type Lower = Lowercase<'HELLO'>;      // "hello"
type Cap = Capitalize<'hello'>;       // "Hello"
type Uncap = Uncapitalize<'Hello'>;   // "hello"
```

### Union Expansion

Template literals distribute over unions:

```typescript
type Size = 'small' | 'medium' | 'large';
type Color = 'red' | 'blue' | 'green';

type ColoredSize = `${Color}-${Size}`;
// "red-small" | "red-medium" | "red-large" |
// "blue-small" | "blue-medium" | "blue-large" |
// "green-small" | "green-medium" | "green-large"
```

### Pattern Matching with `infer`

```typescript
type ExtractRoute<T> = T extends `/api/${infer Resource}/${infer Id}`
  ? { resource: Resource; id: Id }
  : never;

type Result = ExtractRoute<'/api/users/123'>;
// { resource: "users"; id: "123" }
```

## Anti-Pattern

### Don't: Create combinatorial explosion

```typescript
// Anti-pattern: Exponential growth
type A = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j';
type B = A;
type C = A;

type Combined = `${A}-${B}-${C}`;
// 10 × 10 × 10 = 1000 types! Slow compilation

// Better: Use constrained unions or branded types
type ValidCombination = 'a-b-c' | 'a-b-d' | 'x-y-z'; // Explicit valid combinations
```

### Don't: Use template literals where simple unions suffice

```typescript
// Anti-pattern: Over-engineering
type HttpMethod = `${'GET' | 'POST' | 'PUT' | 'DELETE'}`;

// Simpler: Just use the union directly
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
```

### Don't: Expect runtime validation from type literals

```typescript
// Anti-pattern: Types don't validate at runtime
type Email = `${string}@${string}.${string}`;

function sendEmail(email: Email) {
  // Type says it's valid, but could still be wrong at runtime
  // "not-an-email" as Email would bypass the type
}

// Better: Use type + runtime validation
function sendEmail(email: string) {
  if (!isValidEmail(email)) throw new Error('Invalid email');
  // ...
}
```

## Real-World Examples

### Example 1: Type-Safe CSS Class Names

```typescript
type Spacing = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
type Direction = 't' | 'r' | 'b' | 'l' | 'x' | 'y' | '';
type Property = 'm' | 'p';

type SpacingClass = `${Property}${Direction}-${Spacing}`;
// "m-1" | "m-2" | ... | "mt-1" | "mr-1" | ... | "p-1" | "pt-1" | ...

function applySpacing(className: SpacingClass) {
  // Type-safe Tailwind-like classes
}

applySpacing('mt-4'); // OK
applySpacing('mx-3'); // OK
applySpacing('mz-5'); // Error: 'z' is not valid direction
```

### Example 2: Type-Safe Event Names

```typescript
type DomEvent = 'click' | 'focus' | 'blur' | 'change' | 'submit';
type EventHandler = `on${Capitalize<DomEvent>}`;
// "onClick" | "onFocus" | "onBlur" | "onChange" | "onSubmit"

type EventProps = {
  [K in EventHandler]?: (event: Event) => void;
};

const props: EventProps = {
  onClick: (e) => console.log(e),
  onFocus: (e) => console.log(e),
  onTypo: (e) => {},  // Error: 'onTypo' does not exist
};
```

### Example 3: API Route Type Extraction

```typescript
type ApiRoutes = {
  '/users': { GET: User[]; POST: User };
  '/users/:id': { GET: User; PUT: User; DELETE: void };
  '/posts': { GET: Post[] };
  '/posts/:id/comments': { GET: Comment[] };
};

// Extract route parameters
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type UserIdParams = ExtractParams<'/users/:id'>; // "id"
type CommentParams = ExtractParams<'/posts/:postId/comments/:commentId'>;
// "postId" | "commentId"
```

### Example 4: Type-Safe Object Paths

```typescript
type PathKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? PathKeys<T[K], `${Prefix}${K}.`> | `${Prefix}${K}`
          : `${Prefix}${K}`
        : never;
    }[keyof T]
  : never;

type User = {
  name: string;
  address: {
    city: string;
    zip: number;
  };
  contacts: {
    email: string;
  };
};

type UserPaths = PathKeys<User>;
// "name" | "address" | "address.city" | "address.zip" | "contacts" | "contacts.email"
```

### Example 5: Type-Safe Query String Builder

```typescript
type QueryParam<K extends string, V extends string | number | boolean> = `${K}=${V}`;

type BuildQuery<T extends Record<string, string | number | boolean>> = {
  [K in keyof T]: QueryParam<K & string, T[K]>;
}[keyof T];

type SearchParams = {
  page: number;
  limit: number;
  sort: 'asc' | 'desc';
};

type QueryString = BuildQuery<SearchParams>;
// "page=1" | "page=2" | ... | "limit=10" | ... | "sort=asc" | "sort=desc"
```

### Example 6: Database Column Naming Convention

```typescript
type ToSnakeCase<S extends string> =
  S extends `${infer First}${infer Rest}`
    ? First extends Uppercase<First>
      ? `_${Lowercase<First>}${ToSnakeCase<Rest>}`
      : `${First}${ToSnakeCase<Rest>}`
    : S;

type SnakeCase<T> = {
  [K in keyof T as ToSnakeCase<K & string>]: T[K];
};

type UserModel = {
  firstName: string;
  lastName: string;
  createdAt: Date;
};

type DbUser = SnakeCase<UserModel>;
// { first_name: string; last_name: string; created_at: Date }
```

### Example 7: BEM Class Name Generator

```typescript
type BEMBlock<B extends string> = B;
type BEMElement<B extends string, E extends string> = `${B}__${E}`;
type BEMModifier<B extends string, M extends string> = `${B}--${M}`;
type BEMElementModifier<B extends string, E extends string, M extends string> = `${B}__${E}--${M}`;

type BEM<
  B extends string,
  E extends string | never = never,
  M extends string | never = never
> = [E] extends [never]
  ? [M] extends [never]
    ? BEMBlock<B>
    : BEMModifier<B, M>
  : [M] extends [never]
    ? BEMElement<B, E>
    : BEMElementModifier<B, E, M>;

type CardClass = BEM<'card'>;                        // "card"
type CardTitleClass = BEM<'card', 'title'>;          // "card__title"
type CardFeaturedClass = BEM<'card', never, 'featured'>; // "card--featured"
type CardTitleLarge = BEM<'card', 'title', 'large'>; // "card__title--large"
```

## When to Use

| Scenario | Template Literal? | Pattern |
|----------|-------------------|---------|
| Event handler names | Yes | `` `on${Capitalize<Event>}` `` |
| Route path patterns | Yes | `` `/api/${Resource}/${Id}` `` |
| CSS class prefixes | Yes | `` `${Prefix}-${Size}` `` |
| Object key transformations | Yes | `` `get${Capitalize<Key>}` `` |
| Simple string unions | No | Just use union type directly |
| Large combinatorics | No | Causes slow compilation |
| Runtime validation | No | Use runtime checks instead |

### Decision Criteria

Use template literal types when:
1. You need type-safe string patterns
2. You want automatic union expansion
3. You're generating property names
4. You need to parse string patterns with `infer`

Don't use when:
1. Simple union suffices
2. Combinations would be huge (100+ combinations)
3. You need runtime validation
4. Pattern is too complex to express

## Common Mistakes

### Mistake 1: Forgetting union distribution

```typescript
type Route = `/api/${'users' | 'posts'}`;
// Results in: "/api/users" | "/api/posts"
// NOT: "/api/users | posts"
```

### Mistake 2: Expecting number unions to work naturally

```typescript
// Numbers become string literals
type Port = `port:${1 | 2 | 3}`;
// "port:1" | "port:2" | "port:3" (strings, not numbers)

// If you need numbers:
type Ports = 1 | 2 | 3;
type PortString = `port:${Ports}`; // Same result
```

### Mistake 3: Not handling empty strings

```typescript
type Prefix<T extends string> = T extends '' ? T : `prefix-${T}`;

type Test1 = Prefix<'value'>; // "prefix-value"
type Test2 = Prefix<''>;      // "" (no prefix for empty)
```

## Performance Considerations

```typescript
// Slow: Large union × Large union
type Slow = `${LargeUnion1}-${LargeUnion2}-${LargeUnion3}`;

// Fast: Constrained combinations
type Fast = 'a-b-c' | 'd-e-f' | 'g-h-i';

// Rule of thumb: Keep total combinations under 1000
// Unions of 10 × 10 × 10 = 1000 is usually the limit
```

## TypeScript Version

- **Minimum**: TypeScript 4.1 (template literal types)
- **Recommended**: TypeScript 4.3+ (improved inference)

## Related Patterns

- [Mapped Types](./mapped-types.md) - For key remapping with template literals
- [Conditional Types](./conditional-types.md) - For pattern matching with infer
- [Utility Types](./utility-types.md) - Building string utilities
