# Mapped Types

Systematic type transformations using mapped type syntax.

## Problem Statement

You need to transform object types systematically without manually duplicating each property:

```typescript
type User = {
  id: string;
  name: string;
  email: string;
  age: number;
};

// Manual approach - tedious and error-prone
type ReadonlyUser = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly age: number;
};

// What if User changes? You must update ReadonlyUser too!
```

## Solution Pattern

### Basic Mapped Type Syntax

```typescript
type Mapped<T> = {
  [K in keyof T]: T[K];
};
```

### Adding/Removing Modifiers

```typescript
// Add readonly
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Remove readonly
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

// Add optional
type Partial<T> = {
  [K in keyof T]?: T[K];
};

// Remove optional (make required)
type Required<T> = {
  [K in keyof T]-?: T[K];
};

// Combine: readonly and optional
type ReadonlyPartial<T> = {
  readonly [K in keyof T]?: T[K];
};
```

### Key Remapping with `as`

```typescript
// Rename keys
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type User = { name: string; age: number };
type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number }
```

### Filtering Keys with Conditionals

```typescript
// Keep only string properties
type StringsOnly<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type User = { id: number; name: string; email: string };
type StringProps = StringsOnly<User>;
// { name: string; email: string }
```

## Anti-Pattern

### Don't: Manually duplicate transformed properties

```typescript
// Anti-pattern: Manual transformation
type UserForm = {
  name: string;
  email: string;
  age: string;  // Changed to string for form input
};

type UserData = {
  name: string;
  email: string;
  age: number;
};

// Better: Use mapped type
type FormType<T> = {
  [K in keyof T]: string; // All form fields are strings
};

type UserForm = FormType<UserData>;
```

### Don't: Over-complicate simple transformations

```typescript
// Anti-pattern: Complex when simple suffices
type PickStrings<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

// When Pick + conditional would be clearer for specific keys
type StringFields = Pick<User, 'name' | 'email'>;
```

## Real-World Examples

### Example 1: Form State with Touched/Error Tracking

```typescript
type FormState<T> = {
  values: T;
  touched: { [K in keyof T]: boolean };
  errors: { [K in keyof T]?: string };
};

type UserForm = {
  name: string;
  email: string;
  age: number;
};

type UserFormState = FormState<UserForm>;
// {
//   values: { name: string; email: string; age: number };
//   touched: { name: boolean; email: boolean; age: boolean };
//   errors: { name?: string; email?: string; age?: string };
// }
```

### Example 2: API Response Wrapper

```typescript
type ApiField<T> = {
  value: T;
  isLoading: boolean;
  error: string | null;
};

type ApiResponse<T> = {
  [K in keyof T]: ApiField<T[K]>;
};

type UserData = {
  profile: { name: string };
  posts: Post[];
};

type UserApiResponse = ApiResponse<UserData>;
// {
//   profile: { value: { name: string }; isLoading: boolean; error: string | null };
//   posts: { value: Post[]; isLoading: boolean; error: string | null };
// }
```

### Example 3: Event Handlers Object

```typescript
type EventHandlers<T extends Record<string, any>> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (value: T[K]) => void;
};

type FormFields = {
  name: string;
  email: string;
  subscribe: boolean;
};

type FormHandlers = EventHandlers<FormFields>;
// {
//   onNameChange: (value: string) => void;
//   onEmailChange: (value: string) => void;
//   onSubscribeChange: (value: boolean) => void;
// }
```

### Example 4: Type-Safe Translation Keys

```typescript
type Translations = {
  'home.title': string;
  'home.description': string;
  'user.greeting': string;
  'user.logout': string;
};

// Extract namespace
type ExtractNamespace<T, NS extends string> = {
  [K in keyof T as K extends `${NS}.${infer Rest}` ? Rest : never]: T[K];
};

type HomeTranslations = ExtractNamespace<Translations, 'home'>;
// { title: string; description: string }

type UserTranslations = ExtractNamespace<Translations, 'user'>;
// { greeting: string; logout: string }
```

### Example 5: Recursive Deep Transformation

```typescript
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// Combine for nested config
type Config = {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
  database: {
    url: string;
  };
};

type ImmutableConfig = DeepReadonly<Config>;
type PartialConfig = DeepPartial<Config>;
```

### Example 6: Prefixed Object Keys

```typescript
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K];
};

type DbFields = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
};

type PrefixedDbFields = Prefixed<DbFields, 'db'>;
// { dbId: number; dbCreatedAt: Date; dbUpdatedAt: Date }
```

### Example 7: Nullable Database Columns

```typescript
type NullableColumns<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | null : T[P];
};

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  bio: string;
};

// Only phone and bio can be null
type DbUser = NullableColumns<User, 'phone' | 'bio'>;
// { id: number; name: string; email: string; phone: string | null; bio: string | null }
```

### Example 8: Discriminated Union from Object

```typescript
type ObjectToUnion<T extends Record<string, object>> = {
  [K in keyof T]: { type: K } & T[K];
}[keyof T];

type Events = {
  click: { x: number; y: number };
  keydown: { key: string };
  submit: { formData: FormData };
};

type EventUnion = ObjectToUnion<Events>;
// | { type: 'click'; x: number; y: number }
// | { type: 'keydown'; key: string }
// | { type: 'submit'; formData: FormData }
```

## When to Use

| Scenario | Mapped Type Pattern |
|----------|---------------------|
| Make all props optional | `{ [K in keyof T]?: T[K] }` |
| Make all props required | `{ [K in keyof T]-?: T[K] }` |
| Make all props readonly | `{ readonly [K in keyof T]: T[K] }` |
| Remove readonly | `{ -readonly [K in keyof T]: T[K] }` |
| Rename keys | `{ [K in keyof T as NewKey]: T[K] }` |
| Filter keys | `{ [K in keyof T as Condition ? K : never]: T[K] }` |
| Transform values | `{ [K in keyof T]: Transform<T[K]> }` |
| Deep transformation | Recursive mapped type |

### Decision Criteria

Use mapped types when:
1. You need to transform all properties uniformly
2. You want modifiers (readonly, optional) applied/removed
3. You need to rename keys systematically
4. You want to filter properties by type

Don't use when:
1. You only need a few specific properties (use Pick/Omit)
2. The transformation varies per property (use intersection)
3. Simple union or intersection suffices

## Homomorphic vs Non-Homomorphic

### Homomorphic Mapped Types

Preserve modifiers from original type:

```typescript
type Homomorphic<T> = {
  [K in keyof T]: T[K];
};

type Original = { readonly a: string; b?: number };
type Mapped = Homomorphic<Original>;
// { readonly a: string; b?: number } - modifiers preserved!
```

### Non-Homomorphic Mapped Types

Don't preserve original modifiers:

```typescript
type Keys = 'a' | 'b' | 'c';

type NonHomomorphic = {
  [K in Keys]: string;
};
// { a: string; b: string; c: string } - no original type to preserve from
```

## Common Mistakes

### Mistake 1: Forgetting to handle `never` keys

```typescript
// Keys that map to never disappear
type Filtered<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type Data = { name: string; count: number };
type StringsOnly = Filtered<Data>;
// { name: string } - count disappeared (intentional, but be aware)
```

### Mistake 2: Not handling index signatures

```typescript
type Original = { [key: string]: number; specific: number };

type Mapped<T> = {
  [K in keyof T]: string;
};

type Result = Mapped<Original>;
// { [key: string]: string; specific: string } - index signature included!
```

### Mistake 3: Infinite recursion in deep types

```typescript
// Dangerous: Can cause infinite recursion
type DeepMap<T> = {
  [K in keyof T]: T[K] extends object ? DeepMap<T[K]> : T[K];
};

// Safer: Add depth limit or exclude functions
type DeepMap<T> = T extends Function
  ? T
  : T extends object
    ? { [K in keyof T]: DeepMap<T[K]> }
    : T;
```

## TypeScript Version

- **Minimum**: TypeScript 2.1 (basic mapped types)
- **Key Remapping**: TypeScript 4.1 (`as` clause)
- **Recommended**: TypeScript 4.1+

## Related Patterns

- [Conditional Types](./conditional-types.md) - For filtering in mapped types
- [Template Literal Types](./template-literal-types.md) - For key renaming
- [Utility Types](./utility-types.md) - Built on mapped types
