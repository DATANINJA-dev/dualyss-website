# Advanced Generics

Constraints, defaults, variance annotations, and advanced generic patterns.

## Problem Statement

Basic generics accept any type, but real-world APIs need constraints:

```typescript
// Too permissive - accepts anything
function getProperty<T>(obj: T, key: string) {
  return obj[key]; // Error: Element implicitly has 'any' type
}

// How do you constrain T to objects?
// How do you ensure key is actually a key of T?
```

## Solution Pattern

### Generic Constraints with `extends`

```typescript
// Constrain T to have specific properties
function getProperty<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
getProperty(user, 'name'); // OK, returns string
getProperty(user, 'invalid'); // Error: 'invalid' is not assignable to 'name' | 'age'
```

### Default Type Parameters

```typescript
// Default generic to string if not specified
type Container<T = string> = {
  value: T;
};

const stringContainer: Container = { value: 'hello' }; // T defaults to string
const numberContainer: Container<number> = { value: 42 };
```

### Multiple Type Parameters with Relationships

```typescript
// U must extend T
function merge<T, U extends T>(target: T, source: Partial<U>): T {
  return { ...target, ...source };
}

// K must be a key of T
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => result[key] = obj[key]);
  return result;
}
```

### Variance Annotations (TypeScript 4.7+)

```typescript
// `out` - Covariant (output position)
interface Producer<out T> {
  produce(): T;
}

// `in` - Contravariant (input position)
interface Consumer<in T> {
  consume(value: T): void;
}

// `in out` - Invariant (both positions)
interface Processor<in out T> {
  process(value: T): T;
}
```

### Inferring from Function Parameters

```typescript
// Infer types from callback parameters
function createStore<T>(initialValue: T) {
  let value = initialValue;

  return {
    get: () => value,
    set: (newValue: T) => { value = newValue; },
    update: (updater: (current: T) => T) => { value = updater(value); },
  };
}

// T is inferred as { count: number }
const store = createStore({ count: 0 });
store.update(s => ({ count: s.count + 1 })); // Type-safe!
```

## Anti-Pattern

### Don't: Use unconstrained generics when constraints are needed

```typescript
// Anti-pattern: No constraints
function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b }; // Error: Spread types may only be created from object types
}

// Better: Constrain to objects
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}
```

### Don't: Use `any` as a generic fallback

```typescript
// Anti-pattern: any defeats the purpose
function process<T = any>(value: T): T {
  return value;
}

// Better: Use unknown or proper constraints
function process<T = unknown>(value: T): T {
  return value;
}

// Or be explicit about what's accepted
function process<T extends string | number>(value: T): T {
  return value;
}
```

### Don't: Over-generify simple functions

```typescript
// Anti-pattern: Unnecessary generic
function identity<T>(value: T): T {
  return value;
}

// When simple typing suffices:
function identity(value: string): string {
  return value;
}

// Use generics when you actually need type relationships
```

## Real-World Examples

### Example 1: Type-Safe Repository Pattern

```typescript
interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Repository<T extends Entity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T>;
  delete(id: string): Promise<void>;
}

interface User extends Entity {
  name: string;
  email: string;
}

class UserRepository implements Repository<User> {
  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // data has type: { name: string; email: string }
    return {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
  }
  // ... other methods
}
```

### Example 2: Builder Pattern with Chaining

```typescript
class QueryBuilder<T extends object, Selected extends keyof T = never> {
  private selections: (keyof T)[] = [];
  private conditions: Array<{ field: keyof T; value: any }> = [];

  select<K extends keyof T>(...fields: K[]): QueryBuilder<T, Selected | K> {
    this.selections.push(...fields);
    return this as unknown as QueryBuilder<T, Selected | K>;
  }

  where<K extends keyof T>(field: K, value: T[K]): this {
    this.conditions.push({ field, value });
    return this;
  }

  build(): { selections: (keyof T)[]; conditions: typeof this.conditions } {
    return { selections: this.selections, conditions: this.conditions };
  }
}

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const query = new QueryBuilder<User>()
  .select('id', 'name')
  .where('age', 25) // Type-safe: age must be number
  .build();
```

### Example 3: Factory Function with Type Inference

```typescript
type Constructor<T> = new (...args: any[]) => T;

function createFactory<T>(Ctor: Constructor<T>) {
  return {
    create: (...args: ConstructorParameters<typeof Ctor>): T => {
      return new Ctor(...args);
    },
    createMany: (count: number, ...args: ConstructorParameters<typeof Ctor>): T[] => {
      return Array.from({ length: count }, () => new Ctor(...args));
    },
  };
}

class User {
  constructor(public name: string, public age: number) {}
}

const userFactory = createFactory(User);
const user = userFactory.create('Alice', 30); // Type: User
const users = userFactory.createMany(5, 'Bob', 25); // Type: User[]
```

### Example 4: Type-Safe Event Emitter

```typescript
type EventMap = Record<string, any[]>;

class TypedEventEmitter<Events extends EventMap> {
  private listeners = new Map<keyof Events, Set<Function>>();

  on<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => this.off(event, listener);
  }

  off<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<E extends keyof Events>(event: E, ...args: Events[E]): void {
    this.listeners.get(event)?.forEach(listener => listener(...args));
  }
}

// Usage
interface AppEvents {
  userLogin: [userId: string, timestamp: number];
  pageView: [path: string];
  error: [error: Error, context: string];
}

const emitter = new TypedEventEmitter<AppEvents>();

emitter.on('userLogin', (userId, timestamp) => {
  // userId: string, timestamp: number
  console.log(`User ${userId} logged in at ${timestamp}`);
});

emitter.emit('userLogin', 'user123', Date.now());
emitter.emit('userLogin', 123, Date.now()); // Error: number not assignable to string
```

### Example 5: Generic Constraints with Multiple Bounds

```typescript
interface Serializable {
  serialize(): string;
}

interface Comparable<T> {
  compareTo(other: T): number;
}

// Multiple constraints using intersection
function processAndSort<T extends Serializable & Comparable<T>>(items: T[]): string[] {
  return items
    .sort((a, b) => a.compareTo(b))
    .map(item => item.serialize());
}

class SortableItem implements Serializable, Comparable<SortableItem> {
  constructor(public value: number) {}

  serialize(): string {
    return JSON.stringify({ value: this.value });
  }

  compareTo(other: SortableItem): number {
    return this.value - other.value;
  }
}

const items = [new SortableItem(3), new SortableItem(1), new SortableItem(2)];
const sorted = processAndSort(items);
// ["{"value":1}","{"value":2}","{"value":3}"]
```

### Example 6: Higher-Kinded Type Workaround

```typescript
// TypeScript doesn't have HKT, but we can simulate
interface Functor<F> {
  map: <A, B>(fa: F, f: (a: A) => B) => F;
}

// Array functor
type ArrayF<T> = T[];

const arrayFunctor: Functor<ArrayF<any>> = {
  map: <A, B>(fa: ArrayF<A>, f: (a: A) => B): ArrayF<B> => fa.map(f),
};

// Option/Maybe functor
type Option<T> = { tag: 'some'; value: T } | { tag: 'none' };

const optionFunctor: Functor<Option<any>> = {
  map: <A, B>(fa: Option<A>, f: (a: A) => B): Option<B> =>
    fa.tag === 'some' ? { tag: 'some', value: f(fa.value) } : { tag: 'none' },
};
```

### Example 7: Generic Function Overloads

```typescript
// Overload signatures
function parse(value: string, type: 'number'): number;
function parse(value: string, type: 'boolean'): boolean;
function parse(value: string, type: 'json'): object;
function parse<T>(value: string, type: string): T;

// Implementation
function parse(value: string, type: string): unknown {
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true';
    case 'json':
      return JSON.parse(value);
    default:
      return value;
  }
}

const num = parse('42', 'number'); // Type: number
const bool = parse('true', 'boolean'); // Type: boolean
const obj = parse('{"a":1}', 'json'); // Type: object
```

## When to Use

| Scenario | Pattern |
|----------|---------|
| Ensure object type | `T extends object` |
| Ensure specific properties | `T extends { prop: Type }` |
| Key must exist on object | `K extends keyof T` |
| Fallback type | `T = DefaultType` |
| Multiple related types | `<T, U extends T>` |
| Covariant output | `interface X<out T>` |
| Contravariant input | `interface X<in T>` |
| Type inference from args | Let TypeScript infer from function calls |

### Variance Explained

```typescript
// Covariance (out): Dog -> Animal is OK
interface Producer<out T> {
  get(): T;
}
// Producer<Dog> assignable to Producer<Animal>

// Contravariance (in): Animal -> Dog is OK
interface Consumer<in T> {
  set(value: T): void;
}
// Consumer<Animal> assignable to Consumer<Dog>

// Invariance (in out): Must be exact match
interface Processor<in out T> {
  process(value: T): T;
}
// Processor<Dog> NOT assignable to Processor<Animal>
```

## Common Mistakes

### Mistake 1: Constraint doesn't match usage

```typescript
// Bug: T extends object doesn't guarantee specific properties
function getName<T extends object>(obj: T): string {
  return obj.name; // Error: Property 'name' does not exist
}

// Fixed: Add property constraint
function getName<T extends { name: string }>(obj: T): string {
  return obj.name;
}
```

### Mistake 2: Default obscures required constraint

```typescript
// Confusing: Default makes it seem optional, but constraint is needed
function process<T extends number = number>(value: T) { ... }

// Clearer: Only use default when truly optional
function process<T = string>(value: T) { ... } // No constraint
function process<T extends number>(value: T) { ... } // Required constraint
```

### Mistake 3: Generic when union suffices

```typescript
// Over-engineering
function format<T extends string | number>(value: T): string {
  return String(value);
}

// Simpler
function format(value: string | number): string {
  return String(value);
}
```

### Mistake 4: Not leveraging inference

```typescript
// Unnecessary explicit generic
const result = identity<string>('hello');

// Let TypeScript infer
const result = identity('hello'); // Inferred as string
```

## TypeScript Version

- **Basic generics**: TypeScript 1.0+
- **Default type parameters**: TypeScript 2.3+
- **Variance annotations**: TypeScript 4.7+

## Related Patterns

- [Conditional Types](./conditional-types.md) - Use with generics for conditional logic
- [Mapped Types](./mapped-types.md) - Generic type transformations
- [Utility Types](./utility-types.md) - Built on generic patterns
- [Const Type Parameters](./const-type-parameters.md) - Special generic modifier
