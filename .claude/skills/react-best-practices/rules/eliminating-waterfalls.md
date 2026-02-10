# Eliminating Waterfalls

## Overview

Data fetching patterns to avoid request waterfalls. Waterfalls occur when sequential async operations block each other unnecessarily, causing 2-10× performance degradation.

## Rules

### async-defer-await: Defer Await Until Needed

**Impact**: HIGH
**Tags**: #performance #async #data-fetching

#### Problem

Awaiting operations before conditional logic blocks all code paths, even those that don't need the data.

#### Incorrect

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)

  if (skipProcessing) {
    return { skipped: true }
  }

  return processUserData(userData)
}
```

#### Correct

```typescript
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) {
    return { skipped: true }
  }

  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

#### Explanation

Move awaits into branches where they're actually consumed to prevent unnecessary blocking. This simple reordering can eliminate entire network requests when conditions short-circuit early.

---

### async-dependency-parallel: Dependency-Based Parallelization

**Impact**: CRITICAL
**Tags**: #performance #async #parallel #waterfall

#### Problem

Sequential awaits create unnecessary waterfalls when operations have only partial dependencies.

#### Incorrect

```typescript
const [user, config] = await Promise.all([
  fetchUser(),
  fetchConfig()
])
const profile = await fetchProfile(user.id)
```

#### Correct

```typescript
import { all } from 'better-all'

const { user, config, profile } = await all({
  async user() { return fetchUser() },
  async config() { return fetchConfig() },
  async profile() {
    return fetchProfile((await this.$.user).id)
  }
})
```

#### Explanation

Use `better-all` library or similar patterns to automatically start each task at the earliest possible moment, maximizing parallelism across dependency chains. This can reduce total request time by 50% or more when operations have partial dependencies.

---

### async-api-waterfall: Prevent Waterfall Chains in API Routes

**Impact**: CRITICAL
**Tags**: #performance #async #api #next.js

#### Problem

Sequential awaits in API routes force operations to wait unnecessarily. Independent operations should start immediately.

#### Incorrect

```typescript
export async function GET(request: Request) {
  const session = await auth()
  const config = await fetchConfig()
  const data = await fetchData(session.user.id)
  return Response.json({ data, config })
}
```

#### Correct

```typescript
export async function GET(request: Request) {
  const sessionPromise = auth()
  const configPromise = fetchConfig()
  const session = await sessionPromise
  const [config, data] = await Promise.all([
    configPromise,
    fetchData(session.user.id)
  ])
  return Response.json({ data, config })
}
```

#### Explanation

Initiate independent promises immediately, then await them later to maximize parallel execution. The key insight is that `auth()` and `fetchConfig()` can start simultaneously since neither depends on the other.

---

### async-promise-all: Promise.all() for Independent Operations

**Impact**: CRITICAL
**Tags**: #performance #async #parallel

#### Problem

Sequential awaits result in multiple network round trips when operations are independent.

#### Incorrect

```typescript
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()
```

#### Correct

```typescript
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

#### Explanation

Concurrent execution collapses multiple round trips into a single network request cycle. If each request takes 100ms, sequential execution takes 300ms while parallel execution takes only 100ms.

---

### async-suspense-boundaries: Strategic Suspense Boundaries

**Impact**: HIGH
**Tags**: #performance #react #suspense #streaming

#### Problem

Async components that await data before rendering block entire page layouts from displaying.

#### Incorrect

```typescript
async function Page() {
  const data = await fetchData()

  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <DataDisplay data={data} />
      </div>
      <div>Footer</div>
    </div>
  )
}
```

#### Correct

```typescript
function Page() {
  return (
    <div>
      <div>Sidebar</div>
      <div>Header</div>
      <div>
        <Suspense fallback={<Skeleton />}>
          <DataDisplay />
        </Suspense>
      </div>
      <div>Footer</div>
    </div>
  )
}

async function DataDisplay() {
  const data = await fetchData()
  return <div>{data.content}</div>
}
```

#### Explanation

Suspense boundaries enable granular streaming. The static shell (Header, Sidebar, Footer) renders immediately while data-dependent content streams in progressively. This improves perceived performance by showing content faster.

---

### async-share-promise: Share Promise Across Components

**Impact**: HIGH
**Tags**: #performance #react #suspense #deduplication

#### Problem

Multiple components needing the same data trigger separate fetches when using individual Suspense boundaries.

#### Incorrect

```typescript
function Page() {
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <DataDisplay />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <DataSummary />
      </Suspense>
    </>
  )
}

async function DataDisplay() {
  const data = await fetchData() // Separate fetch
  return <div>{data.content}</div>
}

async function DataSummary() {
  const data = await fetchData() // Another fetch!
  return <div>{data.summary}</div>
}
```

#### Correct

```typescript
function Page() {
  const dataPromise = fetchData()

  return (
    <Suspense fallback={<Skeleton />}>
      <DataDisplay dataPromise={dataPromise} />
      <DataSummary dataPromise={dataPromise} />
    </Suspense>
  )
}

function DataDisplay({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise)
  return <div>{data.content}</div>
}

function DataSummary({ dataPromise }: { dataPromise: Promise<Data> }) {
  const data = use(dataPromise)
  return <div>{data.summary}</div>
}
```

#### Explanation

Start fetches early and propagate promises to components using React's `use()` hook. Both components share the same promise instance, resulting in a single network request that serves multiple consumers.
