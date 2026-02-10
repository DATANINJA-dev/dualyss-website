# Advanced Patterns

## Overview

Composition patterns, custom hooks best practices, and state management techniques. These patterns improve code architecture and maintainability in complex React applications.

## Rules

### advanced-ref-handlers: Store Event Handlers in Refs

**Impact**: LOW
**Tags**: #performance #events #refs #optimization

#### Problem

Recreating event handlers on every render causes unnecessary listener re-attachments.

#### Incorrect

```typescript
function Component() {
  const [count, setCount] = useState(0)

  const handleClick = () => console.log(count) // New function every render

  useEffect(() => {
    element.addEventListener('click', handleClick)
    return () => element.removeEventListener('click', handleClick)
  }, [handleClick]) // Effect re-runs because handleClick changes
}
```

#### Correct

```typescript
function Component() {
  const [count, setCount] = useState(0)
  const handleClickRef = useRef<() => void>()

  handleClickRef.current = () => console.log(count)

  useEffect(() => {
    const handler = () => handleClickRef.current?.()
    element.addEventListener('click', handler)
    return () => element.removeEventListener('click', handler)
  }, []) // Effect runs once; ref provides latest count
}
```

#### Explanation

Store handlers in refs to keep event listeners stable while accessing current state. The ref is updated on every render, but the effect dependency stays stable.

---

### advanced-use-latest: useLatest for Stable Callback Refs

**Impact**: LOW
**Tags**: #patterns #hooks #callbacks #optimization

#### Problem

Manually managing refs for stable callbacks is verbose and error-prone.

#### Incorrect

```typescript
function useStableCallback(fn: () => void) {
  const ref = useRef(fn)

  useEffect(() => {
    ref.current = fn
  }) // Missing dependency

  return useCallback(() => ref.current(), [])
}
```

#### Correct

```typescript
function useLatest<T>(value: T) {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref
}

function Component() {
  const [count, setCount] = useState(0)
  const countRef = useLatest(count)

  const handleClick = useCallback(() => {
    console.log(countRef.current)
  }, [countRef])
}
```

#### Explanation

`useLatest` hook simplifies ref management. The callback remains stable while accessing the latest values through the ref.

---

### advanced-compound-components: Use Compound Components for Flexible APIs

**Impact**: MEDIUM
**Tags**: #patterns #composition #api-design

#### Problem

Prop drilling and rigid component APIs make customization difficult.

#### Incorrect

```typescript
function Tabs({
  tabs,
  activeTab,
  onTabChange,
  renderTabContent,
  tabClassName,
  contentClassName
}: TabsProps) {
  return (
    <div>
      <div className={tabClassName}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={activeTab === tab.id ? 'active' : ''}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={contentClassName}>
        {renderTabContent(activeTab)}
      </div>
    </div>
  )
}
```

#### Correct

```typescript
const TabsContext = createContext<TabsContextValue | null>(null)

function Tabs({ children, value, onChange }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      {children}
    </TabsContext.Provider>
  )
}

function TabList({ children }: { children: ReactNode }) {
  return <div role="tablist">{children}</div>
}

function Tab({ value, children }: TabProps) {
  const ctx = useContext(TabsContext)
  return (
    <button
      role="tab"
      aria-selected={ctx?.value === value}
      onClick={() => ctx?.onChange(value)}
    >
      {children}
    </button>
  )
}

function TabPanel({ value, children }: TabPanelProps) {
  const ctx = useContext(TabsContext)
  if (ctx?.value !== value) return null
  return <div role="tabpanel">{children}</div>
}

// Usage
<Tabs value={tab} onChange={setTab}>
  <TabList>
    <Tab value="a">Tab A</Tab>
    <Tab value="b">Tab B</Tab>
  </TabList>
  <TabPanel value="a">Content A</TabPanel>
  <TabPanel value="b">Content B</TabPanel>
</Tabs>
```

#### Explanation

Compound components provide flexible APIs through composition. Users can arrange, style, and extend components freely while the parent manages shared state through context.

---

### advanced-render-props: Use Render Props for Flexible Rendering

**Impact**: MEDIUM
**Tags**: #patterns #composition #flexibility

#### Problem

Components with fixed rendering logic can't be customized without forking.

#### Incorrect

```typescript
function DataFetcher({ url }: { url: string }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(url).then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [url])

  if (loading) return <div>Loading...</div>
  return <div>{JSON.stringify(data)}</div>
}
```

#### Correct

```typescript
function DataFetcher<T>({
  url,
  children
}: {
  url: string
  children: (data: T | null, loading: boolean) => ReactNode
}) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(url).then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [url])

  return <>{children(data, loading)}</>
}

// Usage
<DataFetcher url="/api/user">
  {(user, loading) => (
    loading ? <Spinner /> : <UserCard user={user} />
  )}
</DataFetcher>
```

#### Explanation

Render props delegate rendering decisions to the consumer. The component handles data fetching logic while the parent controls exactly how to display loading states and data.

---

### advanced-custom-hook-composition: Compose Custom Hooks for Reusability

**Impact**: MEDIUM
**Tags**: #patterns #hooks #composition #reusability

#### Problem

Duplicating stateful logic across components leads to inconsistencies.

#### Incorrect

```typescript
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])

  // ... render
}

function UserSettings({ userId }: { userId: string }) {
  // Same fetch logic duplicated
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // ...
}
```

#### Correct

```typescript
function useUser(userId: string) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])

  return { user, loading, error }
}

function UserProfile({ userId }: { userId: string }) {
  const { user, loading, error } = useUser(userId)
  // ... render
}

function UserSettings({ userId }: { userId: string }) {
  const { user, loading, error } = useUser(userId)
  // ... render
}
```

#### Explanation

Extract stateful logic into custom hooks for reusability. Hooks compose naturally - you can build complex hooks from simpler ones.

---

### advanced-state-reducer: Use Reducer for Complex State Logic

**Impact**: MEDIUM
**Tags**: #patterns #state #reducer #complexity

#### Problem

Multiple related state variables with interdependent updates become hard to manage.

#### Incorrect

```typescript
function Form() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrors({})
    try {
      await submitForm({ name, email })
      setIsSubmitted(true)
    } catch (e) {
      setErrors({ form: e.message })
    }
    setIsSubmitting(false)
  }
}
```

#### Correct

```typescript
type State = {
  name: string
  email: string
  errors: Record<string, string>
  status: 'idle' | 'submitting' | 'success' | 'error'
}

type Action =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; error: string }

function formReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SUBMIT_START':
      return { ...state, status: 'submitting', errors: {} }
    case 'SUBMIT_SUCCESS':
      return { ...state, status: 'success' }
    case 'SUBMIT_ERROR':
      return { ...state, status: 'error', errors: { form: action.error } }
  }
}

function Form() {
  const [state, dispatch] = useReducer(formReducer, initialState)

  const handleSubmit = async () => {
    dispatch({ type: 'SUBMIT_START' })
    try {
      await submitForm({ name: state.name, email: state.email })
      dispatch({ type: 'SUBMIT_SUCCESS' })
    } catch (e) {
      dispatch({ type: 'SUBMIT_ERROR', error: e.message })
    }
  }
}
```

#### Explanation

Reducers centralize state transitions, making complex state logic predictable and testable. State changes become explicit actions rather than scattered setState calls.

---

### advanced-context-splitting: Split Context by Update Frequency

**Impact**: MEDIUM
**Tags**: #performance #context #optimization #state

#### Problem

Single large context causes all consumers to re-render on any change.

#### Incorrect

```typescript
const AppContext = createContext<AppState | null>(null)

function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('light')
  const [notifications, setNotifications] = useState([])

  return (
    <AppContext.Provider value={{
      user, setUser,
      theme, setTheme,
      notifications, setNotifications
    }}>
      {children}
    </AppContext.Provider>
  )
}
```

#### Correct

```typescript
const UserContext = createContext<UserState | null>(null)
const ThemeContext = createContext<ThemeState | null>(null)
const NotificationsContext = createContext<NotificationsState | null>(null)

function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('light')
  const [notifications, setNotifications] = useState([])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <NotificationsContext.Provider value={{ notifications, setNotifications }}>
          {children}
        </NotificationsContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  )
}
```

#### Explanation

Split contexts by update frequency and consumer needs. Components subscribing to theme won't re-render when notifications change, improving performance.
