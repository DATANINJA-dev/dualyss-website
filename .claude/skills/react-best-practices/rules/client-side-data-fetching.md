# Client-Side Data Fetching

## Overview

SWR, React Query patterns, event listener optimization, and localStorage management. These patterns improve client-side data handling and reduce unnecessary network requests.

## Rules

### client-event-dedup: Deduplicate Global Event Listeners

**Impact**: MEDIUM
**Tags**: #performance #events #memory #optimization

#### Problem

Multiple components attaching separate listeners to global events wastes memory and CPU.

#### Incorrect

```typescript
function Layout() {
  useEffect(() => {
    const handleResize = () => console.log('resize')
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
}

function Sidebar() {
  useEffect(() => {
    const handleResize = () => console.log('sidebar resize')
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
}
```

#### Correct

```typescript
const useGlobalResize = (() => {
  let listeners: Set<() => void> = new Set()
  let attached = false

  return (callback: () => void) => {
    useEffect(() => {
      listeners.add(callback)

      if (!attached) {
        const handleResize = () => listeners.forEach(cb => cb())
        window.addEventListener('resize', handleResize)
        attached = true

        return () => {
          window.removeEventListener('resize', handleResize)
          attached = false
        }
      }

      return () => listeners.delete(callback)
    }, [callback])
  }
})()

function Layout() {
  useGlobalResize(() => console.log('resize'))
}

function Sidebar() {
  useGlobalResize(() => console.log('sidebar resize'))
}
```

#### Explanation

Centralize global event listeners to attach once. Internally manage subscriber callbacks to avoid redundant listeners on window, document, or other global objects.

---

### client-passive-listeners: Use Passive Event Listeners for Scrolling

**Impact**: MEDIUM
**Tags**: #performance #events #scroll #ux

#### Problem

Non-passive event listeners block scrolling until the handler completes, causing jank.

#### Incorrect

```typescript
useEffect(() => {
  const handleScroll = (e: Event) => {
    // Heavy computation blocks scrolling
    calculateMetrics()
  }
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

#### Correct

```typescript
useEffect(() => {
  const handleScroll = () => {
    calculateMetrics()
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

#### Explanation

Passive listeners don't block scrolling. `{ passive: true }` signals that the handler won't call `preventDefault()`, allowing the browser to scroll immediately.

---

### client-swr-dedup: Use SWR for Automatic Deduplication

**Impact**: MEDIUM
**Tags**: #performance #data-fetching #swr #caching

#### Problem

Multiple components fetching the same data trigger multiple requests simultaneously.

#### Incorrect

```typescript
function UserProfile() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`/api/user/123`).then(r => r.json()).then(setUser)
  }, [])

  return <div>{user?.name}</div>
}

function UserHeader() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`/api/user/123`).then(r => r.json()).then(setUser)
  }, [])

  return <div>{user?.email}</div>
}
```

#### Correct

```typescript
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function UserProfile() {
  const { data: user } = useSWR('/api/user/123', fetcher)
  return <div>{user?.name}</div>
}

function UserHeader() {
  const { data: user } = useSWR('/api/user/123', fetcher)
  return <div>{user?.email}</div>
}
```

#### Explanation

SWR automatically deduplicates requests to the same URL across all hooks. A single request serves multiple consumers, with built-in caching and revalidation.

---

### client-localstorage-version: Version and Minimize localStorage Data

**Impact**: MEDIUM
**Tags**: #performance #storage #persistence #migration

#### Problem

Unversioned localStorage data accumulates and becomes stale. Malformed data causes errors.

#### Incorrect

```typescript
function usePersistentState(key: string, initialValue: string) {
  const [state, setState] = useState(() => {
    return localStorage.getItem(key) ?? initialValue
  })

  const setPersistentState = (value: string) => {
    setState(value)
    localStorage.setItem(key, value)
  }

  return [state, setPersistentState]
}
```

#### Correct

```typescript
function usePersistentState<T>(key: string, initialValue: T, version: number = 1) {
  const versionedKey = `${key}:v${version}`

  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(versionedKey)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  const setPersistentState = (value: T) => {
    setState(value)
    try {
      localStorage.setItem(versionedKey, JSON.stringify(value))
    } catch (e) {
      if (e instanceof DOMException && e.code === 22) {
        // Storage quota exceeded
        localStorage.removeItem(versionedKey)
      }
    }
  }

  return [state, setPersistentState] as const
}
```

#### Explanation

Version keys to enable schema migrations when data format changes. Validate JSON and handle storage quota errors. Versioning prevents old data from breaking new code.

---

### client-react-query: Use React Query for Complex Data Requirements

**Impact**: MEDIUM-HIGH
**Tags**: #performance #data-fetching #react-query #caching

#### Problem

Manual fetch handling leads to inconsistent loading states, race conditions, and no caching.

#### Incorrect

```typescript
function UserPosts({ userId }: { userId: string }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetch(`/api/users/${userId}/posts`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setPosts(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [userId])

  // ... render
}
```

#### Correct

```typescript
import { useQuery } from '@tanstack/react-query'

function UserPosts({ userId }: { userId: string }) {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetch(`/api/users/${userId}/posts`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // ... render
}
```

#### Explanation

React Query handles loading states, error handling, caching, background refetching, and race conditions automatically. The query key ensures proper cache invalidation when userId changes.

---

### client-optimistic-updates: Implement Optimistic Updates

**Impact**: MEDIUM
**Tags**: #performance #ux #mutations #react-query

#### Problem

Waiting for server response before updating UI makes interactions feel slow.

#### Incorrect

```typescript
function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    setLoading(true)
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
    setLiked(true)
    setLoading(false)
  }

  return (
    <button onClick={handleLike} disabled={loading}>
      {liked ? 'Liked' : 'Like'}
    </button>
  )
}
```

#### Correct

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function LikeButton({ postId }: { postId: string }) {
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: () => fetch(`/api/posts/${postId}/like`, { method: 'POST' }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] })
      const previous = queryClient.getQueryData(['post', postId])
      queryClient.setQueryData(['post', postId], (old: any) => ({
        ...old,
        liked: true
      }))
      return { previous }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['post', postId], context?.previous)
    },
  })

  return <button onClick={() => mutate()}>Like</button>
}
```

#### Explanation

Optimistic updates show the expected result immediately, then roll back on error. This makes interactions feel instant while maintaining data consistency.
