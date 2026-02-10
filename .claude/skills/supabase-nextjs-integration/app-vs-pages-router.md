# App Router vs Pages Router

Understanding the differences between Next.js App Router and Pages Router for Supabase integration.

## Use Case

Use this guide when:
- Starting a new project and choosing between routers
- Migrating from Pages Router to App Router
- Understanding which patterns apply to your setup
- Troubleshooting router-specific issues

## Key Differences

| Feature | Pages Router | App Router |
|---------|--------------|------------|
| Data Fetching | `getServerSideProps`, `getStaticProps` | async Server Components |
| Auth Pattern | `getServerSideProps` + cookies | Middleware + Server Components |
| Client Package | `@supabase/auth-helpers-nextjs` | `@supabase/ssr` |
| Server Actions | Not supported | Native support |
| Streaming | Limited | Full support |
| Caching | Manual | Built-in with revalidation |

## Package Comparison

### Pages Router (Legacy)

```bash
# Deprecated but still works
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

### App Router (Current)

```bash
# Recommended for new projects
npm install @supabase/ssr @supabase/supabase-js
```

## Data Fetching Patterns

### Pages Router: getServerSideProps

```typescript
// pages/dashboard.tsx
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { GetServerSidePropsContext } from 'next'

export default function Dashboard({ posts }: { posts: Post[] }) {
  return <PostList posts={posts} />
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const supabase = createPagesServerClient(ctx)

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', session.user.id)

  return {
    props: { posts: posts ?? [] },
  }
}
```

### App Router: Server Components

```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', user.id)

  return <PostList posts={posts ?? []} />
}
```

## Authentication Patterns

### Pages Router: _app.tsx Session Provider

```typescript
// pages/_app.tsx
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const [supabase] = useState(() => createPagesBrowserClient())

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  )
}
```

### App Router: Middleware + Server Components

```typescript
// middleware.ts
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// No session provider needed!
// Each Server Component creates its own client
```

## API Routes vs Route Handlers

### Pages Router: API Routes

```typescript
// pages/api/posts.ts
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createPagesServerClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const { data } = await supabase.from('posts').select('*')
    return res.status(200).json(data)
  }
}
```

### App Router: Route Handlers

```typescript
// app/api/posts/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase.from('posts').select('*')
  return NextResponse.json(data)
}
```

## Form Handling

### Pages Router: API Route + Client Form

```typescript
// pages/posts/new.tsx
import { useState } from 'react'

export default function NewPost() {
  const [title, setTitle] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })

    if (res.ok) {
      // Handle success
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit">Create</button>
    </form>
  )
}
```

### App Router: Server Actions

```typescript
// app/posts/new/page.tsx
import { createPost } from './actions'

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  )
}

// app/posts/new/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await supabase.from('posts').insert({
    title: formData.get('title') as string,
    author_id: user.id,
  })

  revalidatePath('/posts')
  redirect('/posts')
}
```

## Migration Guide

### Step 1: Update Dependencies

```bash
# Remove old packages
npm uninstall @supabase/auth-helpers-nextjs @supabase/auth-helpers-react

# Install new packages
npm install @supabase/ssr
```

### Step 2: Create New Client Files

```typescript
// lib/supabase/server.ts (new)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### Step 3: Add Middleware

```typescript
// middleware.ts (new)
import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Step 4: Migrate Pages One by One

```typescript
// Before: pages/dashboard.tsx
export async function getServerSideProps(ctx) {
  const supabase = createPagesServerClient(ctx)
  // ...
}

// After: app/dashboard/page.tsx
export default async function Dashboard() {
  const supabase = await createClient()
  // ...
}
```

### Step 5: Remove Session Provider

```typescript
// Before: pages/_app.tsx
<SessionContextProvider supabaseClient={supabase}>
  <Component {...pageProps} />
</SessionContextProvider>

// After: app/layout.tsx
// No session provider needed!
export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

## When to Use Each Router

### Use App Router When

- Starting a new project
- You want Server Actions for forms
- You need streaming and Suspense
- You want automatic caching with revalidation
- Building with React Server Components

### Use Pages Router When

- Maintaining existing Pages Router project
- Incremental migration (both can coexist)
- Library compatibility issues with App Router
- Team familiarity with Pages Router patterns

## Coexistence

Both routers can coexist in the same project:

```
app/                    # App Router
├── dashboard/
│   └── page.tsx
└── layout.tsx

pages/                  # Pages Router
├── _app.tsx
├── legacy-page.tsx
└── api/
    └── legacy-api.ts
```

Routes in `app/` take precedence over `pages/` for the same path.

## Common Migration Issues

### Session Not Persisting

```typescript
// Old: Session was managed by auth-helpers
// New: Must add middleware for token refresh

// Add middleware.ts with updateSession
```

### getServerSideProps Not Working

```typescript
// Old: Export getServerSideProps
export async function getServerSideProps() { }

// New: Make component async
export default async function Page() { }
```

### useSession Hook Missing

```typescript
// Old: useSession from auth-helpers-react
const { session } = useSession()

// New: Fetch in Server Component or use browser client
// Server Component:
const { data: { user } } = await supabase.auth.getUser()

// Client Component:
const [user, setUser] = useState(null)
useEffect(() => {
  supabase.auth.getUser().then(({ data }) => setUser(data.user))
}, [])
```

## Related Patterns

- [ssr-setup.md](./ssr-setup.md) - App Router client setup
- [middleware-auth.md](./middleware-auth.md) - App Router auth
- [server-actions.md](./server-actions.md) - App Router forms
- [server-components.md](./server-components.md) - App Router data fetching
