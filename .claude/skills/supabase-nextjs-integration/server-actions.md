# Server Actions with Supabase

Patterns for handling form submissions and mutations using Next.js Server Actions with Supabase.

## Use Case

Use this pattern when:
- Handling form submissions (create, update, delete)
- You want progressive enhancement (works without JS)
- Mutations need server-side auth validation
- You need to revalidate cached data after changes

## Implementation

### Basic Server Action

```typescript
// app/posts/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  // Validate auth - never trust client
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const { error } = await supabase
    .from('posts')
    .insert({
      title,
      content,
      author_id: user.id,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/posts')
  redirect('/posts')
}
```

### Using the Action in a Form

```typescript
// app/posts/new/page.tsx
import { createPost } from '../actions'

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input type="text" name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

### Action with Return Value (for client-side handling)

```typescript
// app/posts/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResult = {
  success: boolean
  error?: string
  data?: { id: string }
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      author_id: user.id,
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/posts')
  return { success: true, data: { id: data.id } }
}
```

### Client Component with useFormState

```typescript
// app/posts/new/form.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createPost, type ActionResult } from '../actions'

const initialState: ActionResult = { success: false }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Post'}
    </button>
  )
}

export function CreatePostForm() {
  const [state, formAction] = useFormState(createPost, initialState)

  return (
    <form action={formAction}>
      {state.error && <p className="error">{state.error}</p>}

      <input type="text" name="title" required />
      <textarea name="content" required />
      <SubmitButton />
    </form>
  )
}
```

### Update Action

```typescript
// app/posts/[id]/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // RLS ensures user can only update their own posts
  const { error } = await supabase
    .from('posts')
    .update({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .eq('author_id', user.id)  // Extra safety

  if (error) {
    return { error: error.message }
  }

  // Revalidate specific paths
  revalidatePath(`/posts/${postId}`)
  revalidatePath('/posts')

  // Or use tags for more granular control
  revalidateTag(`post-${postId}`)

  return { success: true }
}
```

### Delete Action

```typescript
// app/posts/[id]/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deletePost(postId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/posts')
  redirect('/posts')
}
```

### Action with Zod Validation

```typescript
// app/posts/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const PostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
})

export type FormState = {
  errors?: {
    title?: string[]
    content?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { errors: { _form: ['Not authenticated'] } }
  }

  // Validate input
  const validatedFields = PostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      ...validatedFields.data,
      author_id: user.id,
    })

  if (error) {
    return { errors: { _form: [error.message] } }
  }

  revalidatePath('/posts')
  return { success: true }
}
```

### Optimistic Updates

```typescript
// app/posts/[id]/like-button.tsx
'use client'

import { useOptimistic, useTransition } from 'react'
import { likePost } from './actions'

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string
  initialLiked: boolean
  initialCount: number
}) {
  const [isPending, startTransition] = useTransition()

  const [optimistic, addOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, newLiked: boolean) => ({
      liked: newLiked,
      count: newLiked ? state.count + 1 : state.count - 1,
    })
  )

  return (
    <button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          addOptimistic(!optimistic.liked)
          await likePost(postId, !optimistic.liked)
        })
      }}
    >
      {optimistic.liked ? '❤️' : '🤍'} {optimistic.count}
    </button>
  )
}
```

## Type Safety

### Typed Form Data

```typescript
import type { ProfileUpdate } from '@/types/supabase'

export async function updateProfile(formData: FormData) {
  const updates: ProfileUpdate = {
    display_name: formData.get('display_name') as string | null,
    bio: formData.get('bio') as string | null,
  }

  // TypeScript ensures updates matches expected shape
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
}
```

### Binding Arguments with Type Safety

```typescript
// In Server Component
import { updatePost } from './actions'

export default async function EditPostPage({ params }: { params: { id: string } }) {
  // Bind the postId to the action
  const updatePostWithId = updatePost.bind(null, params.id)

  return <form action={updatePostWithId}>...</form>
}

// In actions.ts
export async function updatePost(postId: string, formData: FormData) {
  // postId is guaranteed to be the bound value
}
```

## Common Mistakes

### Not Validating Auth in Action

```typescript
// INSECURE - trusts client-provided user ID
export async function createPost(formData: FormData) {
  const userId = formData.get('userId')  // Client could send any ID!

  await supabase.from('posts').insert({
    author_id: userId,  // Allows impersonation
    ...
  })
}
```

```typescript
// SECURE - validates auth on server
export async function createPost(formData: FormData) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  await supabase.from('posts').insert({
    author_id: user.id,  // Verified user
    ...
  })
}
```

### Missing 'use server' Directive

```typescript
// ERROR - action runs on client, exposes database credentials
import { createClient } from '@/lib/supabase/server'

export async function createPost(formData: FormData) {
  // This will fail - server-only code
  const supabase = await createClient()
}
```

```typescript
// CORRECT - runs on server
'use server'

import { createClient } from '@/lib/supabase/server'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
}
```

### Forgetting to Revalidate Cache

```typescript
// UI won't update after mutation
export async function createPost(formData: FormData) {
  await supabase.from('posts').insert({ ... })

  // Missing: revalidatePath('/posts')
  // Posts list will show stale data
}
```

### Using redirect() in try/catch

```typescript
// redirect() throws, so this won't work as expected
export async function createPost(formData: FormData) {
  try {
    await supabase.from('posts').insert({ ... })
    redirect('/posts')  // Throws NEXT_REDIRECT
  } catch (error) {
    // Catches the redirect! Wrong behavior
    return { error: 'Something went wrong' }
  }
}
```

```typescript
// Correct - check for redirect error or use finally
export async function createPost(formData: FormData) {
  const { error } = await supabase.from('posts').insert({ ... })

  if (error) {
    return { error: error.message }
  }

  redirect('/posts')  // Only called on success
}
```

## Testing

### Unit Test with Mock

```typescript
// __tests__/app/posts/actions.test.ts
import { createPost } from '@/app/posts/actions'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      }),
    },
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    }),
  }),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('createPost', () => {
  it('creates a post for authenticated user', async () => {
    const formData = new FormData()
    formData.set('title', 'Test Post')
    formData.set('content', 'Test content')

    const result = await createPost(formData)

    expect(result.success).toBe(true)
  })
})
```

### Integration Test

```typescript
// Test against actual Supabase
describe('createPost integration', () => {
  it('creates post in database', async () => {
    const formData = new FormData()
    formData.set('title', 'Integration Test Post')
    formData.set('content', 'Content')

    await createPost(formData)

    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('title', 'Integration Test Post')
      .single()

    expect(data).not.toBeNull()
  })
})
```

## Related Patterns

- [server-components.md](./server-components.md) - Fetching data to display in forms
- [middleware-auth.md](./middleware-auth.md) - Auth before action execution
- [type-generation.md](./type-generation.md) - Typed database operations
