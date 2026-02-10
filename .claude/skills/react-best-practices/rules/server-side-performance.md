# Server-Side Performance

## Overview

SSR optimization, streaming, caching strategies, and React Server Component patterns. These patterns improve time-to-first-byte and reduce server load.

## Rules

### server-auth-actions: Authenticate Server Actions Like API Routes

**Impact**: HIGH
**Tags**: #security #server-actions #next.js #authentication

#### Problem

Server Actions without authentication checks expose sensitive operations to unauthorized access.

#### Incorrect

```typescript
'use server'

export async function updateUserEmail(email: string) {
  // No authentication check
  await db.user.update({
    email: email
  })
  return { success: true }
}
```

#### Correct

```typescript
'use server'

export async function updateUserEmail(email: string) {
  const session = await auth()
  if (!session) {
    throw new Error('Unauthorized')
  }

  await db.user.update({
    where: { id: session.userId },
    data: { email: email }
  })
  return { success: true }
}
```

#### Explanation

Server Actions are callable from client code via POST requests. Always validate authentication and authorization before sensitive operations, just like you would for API routes.

---

### server-rsc-serialization: Avoid Duplicate Serialization in RSC Props

**Impact**: MEDIUM-HIGH
**Tags**: #performance #rsc #serialization #next.js

#### Problem

Serializing the same data multiple times across RSC boundaries inflates response size.

#### Incorrect

```typescript
async function Page() {
  const user = await db.user.findUnique({
    where: { id: '123' }
  })

  return (
    <>
      <Header user={user} />
      <Sidebar user={user} />
      <Content user={user} />
    </>
  )
}
```

#### Correct

```typescript
async function Page() {
  const user = await db.user.findUnique({
    where: { id: '123' }
  })

  return (
    <UserContext.Provider value={user}>
      <Header />
      <Sidebar />
      <Content />
    </UserContext.Provider>
  )
}
```

#### Explanation

Use context or composition to avoid passing the same large objects through multiple RSC component boundaries. Each prop crossing a server/client boundary gets serialized separately.

---

### server-lru-cache: Cross-Request LRU Caching

**Impact**: HIGH
**Tags**: #performance #caching #database #server

#### Problem

Without caching, identical requests across different users hit the database repeatedly.

#### Incorrect

```typescript
async function getPopularPosts() {
  // Every request queries the database
  return await db.posts.findMany({
    where: { likes: { gt: 1000 } },
    take: 10
  })
}
```

#### Correct

```typescript
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 600 })

async function getPopularPosts() {
  const cached = cache.get('popular_posts')
  if (cached) return cached

  const posts = await db.posts.findMany({
    where: { likes: { gt: 1000 } },
    take: 10
  })

  cache.set('popular_posts', posts)
  return posts
}
```

#### Explanation

LRU caches with TTL reduce database queries for frequently accessed, relatively static data. Popular posts don't change every second, so caching for 10 minutes is appropriate.

---

### server-minimal-serialization: Minimize Serialization at RSC Boundaries

**Impact**: MEDIUM-HIGH
**Tags**: #performance #rsc #database #select

#### Problem

Serializing complex objects at RSC boundaries creates large payloads and slows rendering.

#### Incorrect

```typescript
async function PostList() {
  const posts = await db.posts.findMany({
    include: {
      author: { include: { profile: true } },
      comments: { include: { author: true } },
      tags: true
    }
  })

  return <PostGrid posts={posts} />
}
```

#### Correct

```typescript
async function PostList() {
  const posts = await db.posts.findMany({
    select: {
      id: true,
      title: true,
      excerpt: true,
      authorName: true
    }
  })

  return <PostGrid posts={posts} />
}
```

#### Explanation

Select only necessary fields from the database to reduce payload size across RSC boundaries. Deep includes pull in far more data than typically needed for list views.

---

### server-parallel-fetch: Parallel Data Fetching with Component Composition

**Impact**: HIGH
**Tags**: #performance #data-fetching #waterfall #rsc

#### Problem

Nested async components create sequential fetches, forming waterfalls at the server level.

#### Incorrect

```typescript
async function Page() {
  const user = await fetchUser()

  return (
    <div>
      <Header user={user} />
      <Sidebar user={user} />
      <Content userId={user.id} />
    </div>
  )
}

async function Content({ userId }: { userId: string }) {
  const data = await fetchData(userId)
  return <div>{data}</div>
}
```

#### Correct

```typescript
async function Page() {
  const [user, data] = await Promise.all([
    fetchUser(),
    fetchData()
  ])

  return (
    <div>
      <Header user={user} />
      <Sidebar user={user} />
      <Content data={data} />
    </div>
  )
}

function Content({ data }: { data: Data }) {
  return <div>{data}</div>
}
```

#### Explanation

Fetch independent data in parallel at higher levels to avoid server-side waterfalls. Moving the fetch up allows Promise.all to parallelize requests.

---

### server-react-cache: Per-Request Deduplication with React.cache()

**Impact**: MEDIUM-HIGH
**Tags**: #performance #caching #deduplication #rsc

#### Problem

Multiple components requesting the same data trigger multiple database queries in a single request.

#### Incorrect

```typescript
async function fetchUser(id: string) {
  return await db.user.findUnique({ where: { id } })
}

async function Header() {
  const user = await fetchUser('123')
  return <div>{user.name}</div>
}

async function Sidebar() {
  const user = await fetchUser('123')
  return <div>{user.email}</div>
}
```

#### Correct

```typescript
import { cache } from 'react'

const fetchUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } })
})

async function Header() {
  const user = await fetchUser('123')
  return <div>{user.name}</div>
}

async function Sidebar() {
  const user = await fetchUser('123')
  return <div>{user.email}</div>
}
```

#### Explanation

`React.cache()` deduplicates fetch calls within a single render cycle, preventing redundant database queries. The cache is automatically cleared after each request.

---

### server-after-nonblocking: Use after() for Non-Blocking Operations

**Impact**: MEDIUM
**Tags**: #performance #next.js #async #logging

#### Problem

Awaiting non-critical operations (logging, analytics) delays response to the user.

#### Incorrect

```typescript
'use server'

export async function submitForm(data: FormData) {
  // Log and wait - slows down response
  await logToAnalytics(data)

  const result = await processForm(data)
  return result
}
```

#### Correct

```typescript
'use server'

import { after } from 'next/server'

export async function submitForm(data: FormData) {
  const result = await processForm(data)

  // Schedule non-critical work after response
  after(() => logToAnalytics(data))

  return result
}
```

#### Explanation

Use `next/server`'s `after()` to schedule logging, cleanup, and other non-blocking tasks after the response is sent. Users get faster responses while background work continues.
