# Real-Time Patterns

Implementing real-time subscriptions with Supabase in Next.js applications.

## Use Case

Use this pattern when:
- Building chat applications or live feeds
- Showing real-time notifications
- Collaborative editing features
- Live dashboards with streaming data
- Presence tracking (who's online)

## Implementation

### Basic Subscription Setup

Real-time requires a **Client Component** since it needs persistent WebSocket connections.

```typescript
// components/real-time-posts.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/types/supabase'

export function RealTimePosts({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts((current) => [payload.new as Post, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setPosts((current) =>
              current.map((post) =>
                post.id === payload.new.id ? (payload.new as Post) : post
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setPosts((current) =>
              current.filter((post) => post.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    // IMPORTANT: Cleanup on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### Server Component + Client Component Pattern

Fetch initial data on server, subscribe to updates on client:

```typescript
// app/posts/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server'
import { RealTimePosts } from '@/components/real-time-posts'

export default async function PostsPage() {
  const supabase = await createClient()

  const { data: initialPosts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  return <RealTimePosts initialPosts={initialPosts ?? []} />
}
```

### Filtered Subscriptions

```typescript
// Only subscribe to changes for specific user
useEffect(() => {
  const channel = supabase
    .channel('user-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,  // Only this user's notifications
      },
      (payload) => {
        setNotifications((current) => [payload.new as Notification, ...current])
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [userId, supabase])
```

### Multiple Table Subscriptions

```typescript
useEffect(() => {
  const channel = supabase
    .channel('dashboard-updates')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      handleOrderChange
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'inventory' },
      handleInventoryChange
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'alerts' },
      handleNewAlert
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [supabase])
```

### Presence (Who's Online)

```typescript
// components/presence-indicator.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePresenceState } from '@supabase/supabase-js'

type UserPresence = {
  id: string
  name: string
  online_at: string
}

export function PresenceIndicator({
  roomId,
  currentUser,
}: {
  roomId: string
  currentUser: { id: string; name: string }
}) {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([])
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<UserPresence>()
        const users = Object.values(state).flat()
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: currentUser.id,
            name: currentUser.name,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [roomId, currentUser, supabase])

  return (
    <div>
      <span>{onlineUsers.length} online</span>
      <ul>
        {onlineUsers.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Broadcast Messages (No Database)

For ephemeral messages that don't need persistence:

```typescript
// components/typing-indicator.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function TypingIndicator({
  roomId,
  userId,
}: {
  roomId: string
  userId: string
}) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel(`typing:${roomId}`)

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== userId) {
          setTypingUsers((current) =>
            current.includes(payload.userId)
              ? current
              : [...current, payload.userId]
          )

          // Remove after 3 seconds
          setTimeout(() => {
            setTypingUsers((current) =>
              current.filter((id) => id !== payload.userId)
            )
          }, 3000)
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [roomId, userId, supabase])

  // Send typing event
  const sendTyping = () => {
    supabase.channel(`typing:${roomId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId },
    })
  }

  return {
    typingUsers,
    sendTyping,
  }
}
```

## Type Safety

### Typed Payload Handling

```typescript
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type PostPayload = RealtimePostgresChangesPayload<
  Database['public']['Tables']['posts']['Row']
>

function handlePostChange(payload: PostPayload) {
  if (payload.eventType === 'INSERT') {
    const newPost = payload.new  // Typed as Post
    console.log(newPost.title)
  }
}
```

### Type-Safe Channel Names

```typescript
type ChannelName =
  | `room:${string}`
  | `user:${string}`
  | 'global-notifications'

function createTypedChannel(name: ChannelName) {
  return supabase.channel(name)
}
```

## Common Mistakes

### Not Cleaning Up Subscriptions

```typescript
// MEMORY LEAK - subscriptions keep running
useEffect(() => {
  const channel = supabase.channel('posts')
    .on('postgres_changes', {...}, handler)
    .subscribe()

  // Missing cleanup!
}, [])
```

```typescript
// CORRECT - cleanup on unmount
useEffect(() => {
  const channel = supabase.channel('posts')
    .on('postgres_changes', {...}, handler)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### Creating Multiple Subscriptions

```typescript
// WRONG - new subscription on every render
function Component() {
  supabase.channel('posts').subscribe()  // Runs on every render!
}
```

```typescript
// CORRECT - subscribe once in useEffect
function Component() {
  useEffect(() => {
    const channel = supabase.channel('posts').subscribe()
    return () => supabase.removeChannel(channel)
  }, [])
}
```

### Using Real-Time in Server Components

```typescript
// Won't work - Server Components can't maintain WebSocket connections
export default async function Page() {
  const supabase = await createClient()

  // This won't work!
  supabase.channel('posts').subscribe()
}
```

### Missing RLS for Real-Time

```sql
-- Real-time respects RLS!
-- If you don't have a SELECT policy, you won't receive updates

-- Enable real-time for table
ALTER publication supabase_realtime ADD TABLE posts;

-- Must have SELECT policy for the user
CREATE POLICY "Users can view posts"
ON posts FOR SELECT
TO authenticated
USING (true);
```

### Not Enabling Real-Time in Dashboard

Real-time must be enabled per-table in Supabase Dashboard:
1. Go to Database → Replication
2. Select tables for real-time
3. Or use SQL: `ALTER publication supabase_realtime ADD TABLE your_table;`

## Performance Considerations

### Limit Subscription Scope

```typescript
// Too broad - receives ALL changes
.on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, handler)

// Better - only listen to what you need
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'posts',
  filter: `channel_id=eq.${channelId}`  // Scoped to specific channel
}, handler)
```

### Debounce Rapid Updates

```typescript
import { useMemo } from 'react'
import debounce from 'lodash/debounce'

const debouncedHandler = useMemo(
  () => debounce((payload) => {
    // Handle update
  }, 100),
  []
)

useEffect(() => {
  const channel = supabase.channel('rapid-updates')
    .on('postgres_changes', {...}, debouncedHandler)
    .subscribe()

  return () => {
    debouncedHandler.cancel()
    supabase.removeChannel(channel)
  }
}, [])
```

## Testing

### Mock Real-Time for Testing

```typescript
// __tests__/components/real-time-posts.test.tsx
import { render, screen, act } from '@testing-library/react'
import { RealTimePosts } from '@/components/real-time-posts'

const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnThis(),
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    channel: () => mockChannel,
    removeChannel: jest.fn(),
  }),
}))

describe('RealTimePosts', () => {
  it('renders initial posts', () => {
    const posts = [{ id: '1', title: 'Test Post' }]
    render(<RealTimePosts initialPosts={posts} />)

    expect(screen.getByText('Test Post')).toBeInTheDocument()
  })

  it('subscribes to changes on mount', () => {
    render(<RealTimePosts initialPosts={[]} />)

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.any(Object),
      expect.any(Function)
    )
    expect(mockChannel.subscribe).toHaveBeenCalled()
  })
})
```

### Integration Test with Real Supabase

```typescript
// Test actual real-time connection
describe('Real-time integration', () => {
  it('receives INSERT events', async () => {
    const received: any[] = []

    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        received.push(payload)
      })
      .subscribe()

    // Insert a record
    await supabase.from('posts').insert({ title: 'Real-time test' })

    // Wait for event
    await new Promise((r) => setTimeout(r, 1000))

    expect(received.length).toBe(1)
    expect(received[0].new.title).toBe('Real-time test')

    await supabase.removeChannel(channel)
  })
})
```

## Related Patterns

- [ssr-setup.md](./ssr-setup.md) - Browser client for subscriptions
- [server-components.md](./server-components.md) - Initial data fetching
- [supabase-rls-patterns](../supabase-rls-patterns/SKILL.md) - RLS for real-time
