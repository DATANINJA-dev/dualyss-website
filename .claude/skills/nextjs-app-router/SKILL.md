---
name: nextjs-app-router
description: Knowledge base for Next.js 15 App Router patterns including Server Components, Client Components, Server Actions, and routing. Use when implementing pages, layouts, or data fetching.
---

# Next.js 14+ App Router

Knowledge base for Next.js App Router patterns in Manager Assistant SaaS.

## Core Concepts

### File-Based Routing

```
app/
├── layout.tsx          # Root layout (wraps all pages)
├── page.tsx            # Home page (/)
├── loading.tsx         # Loading UI
├── error.tsx           # Error boundary
├── not-found.tsx       # 404 page
├── globals.css         # Global styles
├── dashboard/
│   ├── layout.tsx      # Dashboard layout (nested)
│   ├── page.tsx        # /dashboard
│   └── products/
│       ├── page.tsx        # /dashboard/products
│       └── [id]/
│           ├── page.tsx    # /dashboard/products/:id
│           └── edit/
│               └── page.tsx # /dashboard/products/:id/edit
├── api/
│   └── products/
│       ├── route.ts    # GET, POST /api/products
│       └── [id]/
│           └── route.ts # GET, PUT, DELETE /api/products/:id
└── (auth)/             # Route group (no URL segment)
    ├── login/
    │   └── page.tsx    # /login
    └── signup/
        └── page.tsx    # /signup
```

### Special Files

| File | Purpose |
|------|---------|
| `page.tsx` | UI for route segment |
| `layout.tsx` | Shared UI for segment and children |
| `loading.tsx` | Loading state (Suspense boundary) |
| `error.tsx` | Error boundary (client component) |
| `not-found.tsx` | 404 UI |
| `route.ts` | API endpoint |
| `template.tsx` | Like layout but re-mounts on navigation |

## Server Components (Default)

```tsx
// app/dashboard/products/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ProductList } from '@/components/product-list'

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return <ProductList products={products} />
}
```

**Benefits:**
- Data fetching on server (no client bundle)
- Direct database/API access
- Secure (secrets never exposed)
- SEO friendly

## Client Components

```tsx
// components/product-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ProductForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const res = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        description: formData.get('description')
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    if (res.ok) {
      router.push('/dashboard/products')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input name="name" placeholder="Product name" required />
      <Input name="description" placeholder="Description" />
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Product'}
      </Button>
    </form>
  )
}
```

**When to use 'use client':**
- useState, useEffect, useReducer
- Event handlers (onClick, onChange)
- Browser APIs
- Custom hooks with state
- Third-party client libraries

## Server Actions

```tsx
// app/actions/products.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('products').insert({
    name: formData.get('name') as string,
    description: formData.get('description') as string
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/products')
  redirect('/dashboard/products')
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/products')
}
```

**Using in forms:**

```tsx
// components/product-form-server.tsx
import { createProduct } from '@/app/actions/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ProductFormServer() {
  return (
    <form action={createProduct}>
      <Input name="name" placeholder="Product name" required />
      <Input name="description" placeholder="Description" />
      <Button type="submit">Create Product</Button>
    </form>
  )
}
```

## API Route Handlers

```tsx
// app/api/products/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('products')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data, { status: 201 })
}

// app/api/products/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('products')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return new NextResponse(null, { status: 204 })
}
```

## Layouts and Templates

```tsx
// app/dashboard/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
```

## Middleware

```tsx
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers }
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (
    (request.nextUrl.pathname === '/login' ||
     request.nextUrl.pathname === '/signup') &&
    user
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
```

## Loading States

```tsx
// app/dashboard/products/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  )
}
```

## Error Handling

```tsx
// app/dashboard/products/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function ProductsError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
```

## Metadata

```tsx
// app/layout.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Manager Assistant',
    template: '%s | Manager Assistant'
  },
  description: 'AI-powered product management platform',
  openGraph: {
    title: 'Manager Assistant',
    description: 'AI-powered product management platform',
    url: 'https://manager-assistant.vercel.app',
    siteName: 'Manager Assistant',
    type: 'website'
  }
}

// Dynamic metadata
// app/dashboard/products/[id]/page.tsx
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('name')
    .eq('id', id)
    .single()

  return {
    title: product?.name ?? 'Product'
  }
}
```

## Caching and Revalidation

```tsx
// On-demand revalidation
import { revalidatePath, revalidateTag } from 'next/cache'

// Revalidate specific path
revalidatePath('/dashboard/products')

// Revalidate by tag
revalidateTag('products')

// In fetch with tags
fetch('https://api.example.com/products', {
  next: { tags: ['products'] }
})

// Time-based revalidation
fetch('https://api.example.com/products', {
  next: { revalidate: 3600 } // 1 hour
})

// No caching
fetch('https://api.example.com/products', {
  cache: 'no-store'
})
```

## Parallel Routes

```
app/
└── dashboard/
    ├── layout.tsx
    ├── page.tsx
    ├── @analytics/
    │   └── page.tsx
    └── @notifications/
        └── page.tsx
```

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  notifications
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  notifications: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <main className="col-span-8">{children}</main>
      <aside className="col-span-4">
        {analytics}
        {notifications}
      </aside>
    </div>
  )
}
```

## Project Structure for Manager Assistant

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── (marketing)/
│   │   ├── page.tsx          # Landing
│   │   └── layout.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Overview
│   │   ├── products/
│   │   │   ├── page.tsx      # List
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx  # Detail
│   │   │       ├── backlog/page.tsx
│   │   │       ├── sprints/page.tsx
│   │   │       └── settings/page.tsx
│   │   └── chat/page.tsx     # AI Chat
│   ├── api/
│   │   ├── products/...
│   │   ├── epics/...
│   │   ├── stories/...
│   │   ├── sprints/...
│   │   └── ai/
│   │       ├── analyze/route.ts
│   │       └── estimate/route.ts
│   └── actions/
│       ├── products.ts
│       ├── stories.ts
│       └── sprints.ts
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   ├── products/        # Product-specific
│   ├── backlog/         # Backlog-specific
│   └── sprints/         # Sprint-specific
├── lib/
│   ├── supabase/
│   │   ├── client.ts    # Browser client
│   │   └── server.ts    # Server client
│   ├── utils.ts
│   └── validations/
└── types/
    └── database.ts      # Generated from Supabase
```
