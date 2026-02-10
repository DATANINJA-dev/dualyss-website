# JavaScript Performance

## Overview

Event handlers, debouncing, throttling, and general JavaScript optimization patterns. These micro-optimizations improve performance in tight loops and frequently-called code.

## Rules

### js-batch-dom: Batch DOM CSS Changes

**Impact**: LOW-MEDIUM
**Tags**: #performance #dom #layout #reflow

#### Problem

Alternating DOM reads and writes force the browser to recalculate layout multiple times.

#### Incorrect

```typescript
const elements = document.querySelectorAll('.item')
for (const el of elements) {
  el.style.width = el.offsetWidth + 10 + 'px' // Read then write
  el.style.height = el.offsetHeight + 10 + 'px' // Read then write, causes reflow
}
```

#### Correct

```typescript
const elements = document.querySelectorAll('.item')
const widths: number[] = []
const heights: number[] = []

// Batch all reads
for (const el of elements) {
  widths.push(el.offsetWidth)
  heights.push(el.offsetHeight)
}

// Batch all writes
for (let i = 0; i < elements.length; i++) {
  elements[i].style.width = widths[i] + 10 + 'px'
  elements[i].style.height = heights[i] + 10 + 'px'
}
```

#### Explanation

Read all DOM properties first, then write all changes. This minimizes layout recalculations (reflows) which are expensive browser operations.

---

### js-index-maps: Build Index Maps for Repeated Lookups

**Impact**: LOW-MEDIUM
**Tags**: #performance #data-structures #lookup #algorithms

#### Problem

Repeatedly searching arrays for values is O(n). Maps provide O(1) lookup.

#### Incorrect

```typescript
const users = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' }
]

for (const user of allUsers) {
  // O(n) lookup per user
  const found = users.find(u => u.id === user.id)
}
```

#### Correct

```typescript
const users = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' }
]

const userMap = new Map(users.map(u => [u.id, u]))

for (const user of allUsers) {
  // O(1) lookup
  const found = userMap.get(user.id)
}
```

#### Explanation

Build a `Map` or object index once, then reuse for repeated lookups. For n items with m lookups, this reduces O(n×m) to O(n+m).

---

### js-cache-property: Cache Property Access in Loops

**Impact**: LOW-MEDIUM
**Tags**: #performance #loops #optimization

#### Problem

Repeatedly accessing object properties in loops incurs lookup overhead.

#### Incorrect

```typescript
for (let i = 0; i < items.length; i++) {
  console.log(items[i].name) // items lookup every iteration
  console.log(items[i].value) // items lookup every iteration
}
```

#### Correct

```typescript
for (let i = 0; i < items.length; i++) {
  const item = items[i]
  console.log(item.name)
  console.log(item.value)
}
```

#### Explanation

Cache object references to avoid repeated property lookups in tight loops. This is especially impactful when processing large datasets.

---

### js-cache-functions: Cache Repeated Function Calls

**Impact**: LOW-MEDIUM
**Tags**: #performance #caching #optimization

#### Problem

Calling the same expensive function multiple times wastes CPU.

#### Incorrect

```typescript
const results = items.filter(item => {
  return expensiveCheck(item) && otherCheck(item)
})

const count = items.filter(item => expensiveCheck(item)).length
```

#### Correct

```typescript
const checkResults = items.map(item => expensiveCheck(item))

const results = items.filter((item, i) => checkResults[i] && otherCheck(item))

const count = checkResults.filter(Boolean).length
```

#### Explanation

Cache expensive function results to avoid re-computation. This is particularly valuable when the same check is needed in multiple operations.

---

### js-combine-iterations: Combine Multiple Array Iterations

**Impact**: LOW-MEDIUM
**Tags**: #performance #arrays #loops #optimization

#### Problem

Chaining `.map()`, `.filter()`, `.reduce()` iterates the array multiple times.

#### Incorrect

```typescript
const active = users.filter(u => u.active)
const emails = active.map(u => u.email)
const summary = emails.reduce((acc, email) => acc + email, '')
```

#### Correct

```typescript
let summary = ''
for (const user of users) {
  if (user.active) {
    summary += user.email
  }
}
```

#### Explanation

Combine filters, maps, and reductions into a single loop to avoid multiple array passes. For large arrays, this significantly reduces iteration overhead.

---

### js-early-return: Early Return from Functions

**Impact**: LOW
**Tags**: #performance #readability #patterns

#### Problem

Nested conditionals are harder to optimize and read.

#### Incorrect

```typescript
function process(item: Item) {
  if (item.valid) {
    if (item.approved) {
      if (item.processed) {
        return item.result
      }
    }
  }
  return null
}
```

#### Correct

```typescript
function process(item: Item) {
  if (!item.valid) return null
  if (!item.approved) return null
  if (!item.processed) return null
  return item.result
}
```

#### Explanation

Use early returns to reduce nesting and improve branch prediction. Guard clauses make the success path clearer and improve code readability.

---

### js-hoist-regex: Hoist RegExp Creation

**Impact**: LOW
**Tags**: #performance #regex #memory #optimization

#### Problem

Creating regex patterns in loops allocates new objects repeatedly.

#### Incorrect

```typescript
for (const text of texts) {
  if (/^[a-z]+$/.test(text)) { // New regex every iteration
    process(text)
  }
}
```

#### Correct

```typescript
const pattern = /^[a-z]+$/

for (const text of texts) {
  if (pattern.test(text)) { // Reuses same regex
    process(text)
  }
}
```

#### Explanation

Define regex patterns outside loops. Reuse across multiple test/match calls to avoid repeated regex compilation and object allocation.

---

### js-set-lookup: Use Set/Map for O(1) Lookups

**Impact**: MEDIUM
**Tags**: #performance #data-structures #lookup #algorithms

#### Problem

`Array.includes()` is O(n). `Set.has()` is O(1).

#### Incorrect

```typescript
const allowedIds = ['123', '456', '789']

for (const item of items) {
  if (allowedIds.includes(item.id)) { // O(n) lookup
    process(item)
  }
}
```

#### Correct

```typescript
const allowedIds = new Set(['123', '456', '789'])

for (const item of items) {
  if (allowedIds.has(item.id)) { // O(1) lookup
    process(item)
  }
}
```

#### Explanation

Use `Set` for membership checks and `Map` for key-value lookups. Both provide O(1) operations, crucial for performance with large datasets.

---

### js-immutable-sort: Use toSorted() Instead of sort() for Immutability

**Impact**: MEDIUM
**Tags**: #performance #immutability #arrays #es2023

#### Problem

`.sort()` mutates the array in-place, causing unexpected side effects.

#### Incorrect

```typescript
const items = [3, 1, 2]
const sorted = items.sort((a, b) => a - b)
// items is now [1, 2, 3] - original mutated!
```

#### Correct

```typescript
const items = [3, 1, 2]
const sorted = items.toSorted((a, b) => a - b)
// items is still [3, 1, 2] - original unchanged
```

#### Explanation

`.toSorted()` returns a new sorted array while preserving the original. This prevents mutation bugs and aligns with functional programming principles. Requires ES2023 or polyfill.

---

### js-loop-minmax: Use Loop for Min/Max Instead of Sort

**Impact**: LOW-MEDIUM
**Tags**: #performance #algorithms #optimization

#### Problem

Using `.sort()` to find min/max is O(n log n) when a single loop is O(n).

#### Incorrect

```typescript
const max = numbers.sort((a, b) => b - a)[0]
const min = numbers.sort((a, b) => a - b)[0]
```

#### Correct

```typescript
let max = -Infinity
let min = Infinity

for (const num of numbers) {
  if (num > max) max = num
  if (num < min) min = num
}
```

#### Explanation

Single loop for min/max is O(n). Sorting is O(n log n) and unnecessary for this operation. For large arrays, the performance difference is significant.
