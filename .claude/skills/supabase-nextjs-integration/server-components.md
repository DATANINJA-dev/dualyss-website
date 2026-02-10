# Server Components Data Fetching

Patterns for fetching data from Supabase in Next.js Server Components.

## Use Case

Use this pattern when:
- Fetching data that doesn't need client-side interactivity
- You want to eliminate client-side waterfalls
- SEO is important (data is rendered server-side)
- You need to validate auth before rendering

## Implementation

### Basic Data Fetching

```typescript
// app/posts/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function PostsPage() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    throw new Error('Failed to fetch posts')
  }

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### With Authentication

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Always use getUser() - validates JWT on server
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // RLS policies use this authenticated user
  const { data: userPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', user.id)

  return <PostList posts={userPosts ?? []} />
}
```

### Parallel Data Fetching

```typescript
// app/profile/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Fetch in parallel - not a waterfall
  const [profileResult, postsResult, followersResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', params.id).single(),
    supabase.from('posts').select('*').eq('author_id', params.id).limit(5),
    supabase.from('follows').select('count').eq('following_id', params.id).single(),
  ])

  return (
    <div>
      <h1>{profileResult.data?.display_name}</h1>
      <p>{followersResult.data?.count} followers</p>
      <PostList posts={postsResult.data ?? []} />
    </div>
  )
}
```

### Nested Data with Joins

```typescript
// app/posts/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function PostPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Single query with related data - prevents N+1
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      created_at,
      author:profiles!author_id (
        id,
        display_name,
        avatar_url
      ),
      comments (
        id,
        content,
        created_at,
        author:profiles!author_id (
          display_name
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !post) {
    notFound()
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author?.display_name}</p>
      <div>{post.content}</div>
      <CommentList comments={post.comments} />
    </article>
  )
}
```

### With Pagination

```typescript
// app/posts/page.tsx
import { createClient } from '@/lib/supabase/server'
import { Pagination } from '@/components/pagination'

const POSTS_PER_PAGE = 10

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = Number(searchParams.page) || 1
  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const supabase = await createClient()

  const { data: posts, count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count ?? 0) / POSTS_PER_PAGE)

  return (
    <>
      <PostList posts={posts ?? []} />
      <Pagination currentPage={page} totalPages={totalPages} />
    </>
  )
}
```

## Type Safety

### Inferred Types from Select

```typescript
const { data } = await supabase
  .from('posts')
  .select('id, title, author:profiles!author_id(display_name)')
  .single()

// data is typed as:
// {
//   id: string
//   title: string
//   author: { display_name: string | null } | null
// } | null
```

### Explicit Return Type

```typescript
import type { Database } from '@/types/database'

type PostWithAuthor = Database['public']['Tables']['posts']['Row'] & {
  author: Pick<Database['public']['Tables']['profiles']['Row'], 'display_name'> | null
}

async function getPost(id: string): Promise<PostWithAuthor | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('posts')
    .select('*, author:profiles!author_id(display_name)')
    .eq('id', id)
    .single()

  return data
}
```

## Common Mistakes

### Using getSession() for Auth Validation

```typescript
// INSECURE - session can be forged by client
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  redirect('/login')
}

// Session data is from cookies - client could have modified it
const userId = session.user.id  // Could be fake!
```

```typescript
// SECURE - validates JWT with Supabase auth server
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
  redirect('/login')
}

const userId = user.id  // Verified by Supabase
```

### N+1 Query Pattern

```typescript
// N+1 queries - BAD
const { data: posts } = await supabase.from('posts').select('*')

for (const post of posts ?? []) {
  // This runs N additional queries!
  const { data: author } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', post.author_id)
    .single()
}
```

```typescript
// Single query with join - GOOD
const { data: posts } = await supabase
  .from('posts')
  .select(`
    *,
    author:profiles!author_id (*)
  `)
```

### Creating Client Outside Component

```typescript
// Wrong - client created at module load time
const supabase = await createClient()  // Error: can't await at module level

export default async function Page() {
  // supabase might have stale cookies
}
```

```typescript
// Correct - client created per request
export default async function Page() {
  const supabase = await createClient()
  // Fresh client with current cookies
}
```

### Missing Error Handling

```typescript
// Missing error check
const { data } = await supabase.from('posts').select('*')
return <PostList posts={data} />  // data could be null on error!
```

```typescript
// Proper error handling
const { data, error } = await supabase.from('posts').select('*')

if (error) {
  // Option 1: Throw to error boundary
  throw new Error(`Failed to fetch posts: ${error.message}`)

  // Option 2: Return fallback UI
  return <p>Failed to load posts</p>
}

return <PostList posts={data ?? []} />
```

### Forgetting count Option for Pagination

```typescript
// Missing count - can't calculate total pages
const { data } = await supabase
  .from('posts')
  .select('*')
  .range(0, 9)
```

```typescript
// Include count for pagination
const { data, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })  // or 'planned', 'estimated'
  .range(0, 9)
```

## Testing

### Component Test with Mock

```typescript
// __tests__/app/posts/page.test.tsx
import { render, screen } from '@testing-library/react'
import PostsPage from '@/app/posts/page'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: [
              { id: '1', title: 'Test Post', created_at: '2024-01-01' },
            ],
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

describe('PostsPage', () => {
  it('renders posts', async () => {
    const page = await PostsPage()
    render(page)

    expect(screen.getByText('Test Post')).toBeInTheDocument()
  })
})
```

### Integration Test

```typescript
// Test actual data fetching against test database
import { createClient } from '@/lib/supabase/server'

describe('Posts data fetching', () => {
  it('fetches posts with authors', async () => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!author_id(*)')
      .limit(1)
      .single()

    expect(error).toBeNull()
    expect(data).toHaveProperty('author')
  })
})
```

## Related Patterns

- [ssr-setup.md](./ssr-setup.md) - Client setup
- [server-actions.md](./server-actions.md) - Mutations for fetched data
- [middleware-auth.md](./middleware-auth.md) - Auth before data fetching
- [supabase-rls-patterns](../supabase-rls-patterns/SKILL.md) - RLS policies for data access
