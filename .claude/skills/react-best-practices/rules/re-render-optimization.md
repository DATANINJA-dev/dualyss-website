# Re-render Optimization

## Overview

Patterns for preventing unnecessary re-renders using useMemo, useCallback, and React.memo(). These patterns optimize component update cycles and reduce wasted renders.

## Rules

### rerender-defer-state: Defer State Reads to Usage Point

**Impact**: MEDIUM
**Tags**: #performance #react #state #context

#### Problem

Reading state at component level causes re-renders when that state changes, even for components that don't display it.

#### Incorrect

```typescript
function Page() {
  const [filter, setFilter] = useState('')
  const [items, setItems] = useState([])

  // Component re-renders whenever filter changes
  return (
    <div>
      <FilterInput value={filter} onChange={setFilter} />
      <ItemList items={items} filter={filter} />
      <Sidebar filter={filter} />
    </div>
  )
}
```

#### Correct

```typescript
function Page() {
  return (
    <FilterProvider>
      <FilterInput />
      <ItemList />
      <Sidebar />
    </FilterProvider>
  )
}

function ItemList() {
  const { filter } = useFilter()
  // Only this component re-renders on filter changes
  return <div>{filter}</div>
}

function Sidebar() {
  // Doesn't use filter, doesn't re-render
  return <div>Sidebar</div>
}
```

#### Explanation

Move state and its consumers into isolated contexts/components to limit re-render scope. Components that don't consume the context won't re-render when it changes.

---

### rerender-memo-components: Extract to Memoized Components

**Impact**: MEDIUM
**Tags**: #performance #react #memo #optimization

#### Problem

Parent re-renders trigger all child re-renders by default, even if their props haven't changed.

#### Incorrect

```typescript
function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveChild name="test" />
    </div>
  )
}

function ExpensiveChild({ name }: { name: string }) {
  return <div>Expensive computation: {name}</div>
}
```

#### Correct

```typescript
function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <MemoizedChild name="test" />
    </div>
  )
}

const MemoizedChild = memo(function ExpensiveChild({ name }: { name: string }) {
  return <div>Expensive computation: {name}</div>
})
```

#### Explanation

`React.memo()` prevents re-renders when props haven't changed. Pair with stable prop references (primitives or memoized objects/functions) for maximum effect.

---

### rerender-narrow-deps: Narrow Effect Dependencies

**Impact**: MEDIUM
**Tags**: #performance #react #useEffect #dependencies

#### Problem

Effects with broad dependencies re-run unnecessarily, wasting computation and network requests.

#### Incorrect

```typescript
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)

  const user_obj = { id: userId } // New object every render

  useEffect(() => {
    fetch(`/api/users/${user_obj.id}`).then(r => r.json()).then(setUser)
  }, [user_obj]) // Effect runs every render because user_obj is new
}
```

#### Correct

```typescript
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${userId}`).then(r => r.json()).then(setUser)
  }, [userId]) // Effect runs only when userId changes
}
```

#### Explanation

Depend on primitive values, not objects. Destructure complex dependencies to their minimal form. Objects create new references on every render, causing unnecessary effect executions.

---

### rerender-derived-state: Subscribe to Derived State

**Impact**: MEDIUM
**Tags**: #performance #react #useMemo #derived

#### Problem

Deriving state from props in render triggers extra renders. Derive in effects or use useMemo instead.

#### Incorrect

```typescript
function Counter({ initialValue }: { initialValue: number }) {
  const [count, setCount] = useState(initialValue)

  // Runs every render without memoization
  const doubled = count * 2

  return <div>{doubled}</div>
}
```

#### Correct

```typescript
function Counter({ initialValue }: { initialValue: number }) {
  const [count, setCount] = useState(initialValue)
  const doubled = useMemo(() => count * 2, [count])

  return <div>{doubled}</div>
}
```

#### Explanation

For simple calculations, the render cost is minimal. But for complex derivations involving array operations, filtering, or heavy computation, use `useMemo` to cache results and avoid recalculating on every render.

---

### rerender-functional-setState: Use Functional setState Updates

**Impact**: MEDIUM
**Tags**: #performance #react #state #closure

#### Problem

State updates based on previous state can trigger additional renders when dependencies aren't properly captured.

#### Incorrect

```typescript
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1) // Depends on stale count closure
    }, 1000)
    return () => clearInterval(timer)
  }, []) // Missing count dependency causes stale closure
}
```

#### Correct

```typescript
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => prev + 1) // Uses latest state
    }, 1000)
    return () => clearInterval(timer)
  }, []) // No dependencies needed
}
```

#### Explanation

Functional updates (`setState(prev => ...)`) don't depend on current state closure. This eliminates the need for state dependencies in effects and prevents stale closure bugs.

---

### rerender-lazy-init: Use Lazy State Initialization

**Impact**: MEDIUM
**Tags**: #performance #react #useState #initialization

#### Problem

Expensive computations run on every render if placed directly in `useState` initialization.

#### Incorrect

```typescript
function DataTable() {
  // Runs every render!
  const [rows, setRows] = useState(expensiveComputeInitialRows())

  return <table>...</table>
}
```

#### Correct

```typescript
function DataTable() {
  const [rows, setRows] = useState(() => expensiveComputeInitialRows())

  return <table>...</table>
}
```

#### Explanation

Pass a function to `useState` for lazy initialization. The function is called once during initial render, not on every subsequent render. This is crucial for expensive initial computations.

---

### rerender-transitions: Use Transitions for Non-Urgent Updates

**Impact**: MEDIUM
**Tags**: #performance #react #useTransition #responsiveness

#### Problem

Large state updates block the UI from responding to user input like typing and clicks.

#### Incorrect

```typescript
function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q) // Blocks UI if filtering/fetching is slow
    setResults(filterResults(q))
  }

  return (
    <div>
      <input onChange={handleChange} />
      <List results={results} />
    </div>
  )
}
```

#### Correct

```typescript
function SearchResults() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q) // Urgent: input feels responsive immediately

    startTransition(() => {
      setResults(filterResults(q)) // Non-urgent: filtered later
    })
  }

  return (
    <div>
      <input onChange={handleChange} />
      {isPending && <div>Filtering...</div>}
      <List results={results} />
    </div>
  )
}
```

#### Explanation

`useTransition()` prioritizes urgent updates (keeping input responsive) over non-urgent ones (filtering/rendering large lists). This keeps the UI feeling snappy even with expensive operations.
