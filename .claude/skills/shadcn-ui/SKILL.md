---
name: shadcn-ui
description: Knowledge base for shadcn/ui component usage, theming, and customization patterns. Use when implementing UI components, forms, or design system elements.
---

# shadcn/ui Components

Knowledge base for shadcn/ui usage in Manager Assistant SaaS.

## Setup

```bash
# Initialize shadcn/ui in Next.js project
npx shadcn@latest init

# Configuration options:
# - Style: New York (recommended)
# - Base color: Slate
# - CSS variables: Yes
# - tailwind.config.js location: default
# - components.json location: default
# - Utility classes: @/lib/utils
# - React Server Components: Yes
```

## Adding Components

```bash
# Add individual components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu

# Add multiple components
npx shadcn@latest add button card input dialog form

# Add all components
npx shadcn@latest add --all
```

## Essential Components for Manager Assistant

### Button

```tsx
import { Button } from '@/components/ui/button'

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><IconPlus /></Button>

// With loading state
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Saving...' : 'Save'}
</Button>

// As child (for links)
import Link from 'next/link'

<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Product Name</CardTitle>
    <CardDescription>Product description here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### Form with Validation

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  vision: z.string().min(10, 'Vision must be at least 10 characters'),
})

type ProductFormValues = z.infer<typeof productSchema>

export function ProductForm() {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      vision: '',
    },
  })

  async function onSubmit(data: ProductFormValues) {
    // Handle form submission
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="My Product" {...field} />
              </FormControl>
              <FormDescription>
                The name of your product.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your product..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vision</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What is your product's vision?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create Product'}
        </Button>
      </form>
    </Form>
  )
}
```

### Dialog

```tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function NewProductDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>New Product</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Add a new product to manage. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Form fields here */}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Alert Dialog (Confirmations)

```tsx
'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export function DeleteProductDialog({
  productId,
  onDelete
}: {
  productId: string
  onDelete: (id: string) => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete(productId)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Dropdown Menu

```tsx
'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash, Eye } from 'lucide-react'

export function ProductActions({ productId }: { productId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Tabs

```tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

export function ProductDetailTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="backlog">Backlog</TabsTrigger>
        <TabsTrigger value="sprints">Sprints</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <ProductOverview />
      </TabsContent>
      <TabsContent value="backlog">
        <ProductBacklog />
      </TabsContent>
      <TabsContent value="sprints">
        <SprintList />
      </TabsContent>
      <TabsContent value="settings">
        <ProductSettings />
      </TabsContent>
    </Tabs>
  )
}
```

### Sheet (Drawer)

```tsx
'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

export function StoryDetailSheet({ story }: { story: Story }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          {story.title}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{story.title}</SheetTitle>
          <SheetDescription>
            {story.id} • {story.story_points} points
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{story.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Acceptance Criteria</h4>
            <ul className="text-sm space-y-1">
              {story.acceptance_criteria?.map((ac, i) => (
                <li key={i} className="text-muted-foreground">• {ac}</li>
              ))}
            </ul>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button>Edit Story</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

### Toast (with Sonner)

```bash
npx shadcn@latest add sonner
```

```tsx
// app/layout.tsx
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

```tsx
// Usage anywhere
'use client'

import { toast } from 'sonner'

function handleSubmit() {
  toast.success('Product created successfully!')

  // With description
  toast.success('Product created', {
    description: 'Your product has been saved.',
  })

  // Error
  toast.error('Failed to create product', {
    description: 'Please try again later.',
  })

  // With action
  toast('Product deleted', {
    action: {
      label: 'Undo',
      onClick: () => restoreProduct(),
    },
  })

  // Loading
  toast.promise(createProduct(data), {
    loading: 'Creating product...',
    success: 'Product created!',
    error: 'Failed to create product',
  })
}
```

### Select

```tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PrioritySelect({
  value,
  onValueChange
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Priority</SelectLabel>
          <SelectItem value="must">Must Have</SelectItem>
          <SelectItem value="should">Should Have</SelectItem>
          <SelectItem value="could">Could Have</SelectItem>
          <SelectItem value="wont">Won't Have</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
```

### Badge

```tsx
import { Badge } from '@/components/ui/badge'

// Variants
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>

// Custom colors for status
const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
}

<Badge className={statusColors[story.status]}>
  {story.status}
</Badge>
```

### Skeleton

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-20" />
      </CardFooter>
    </Card>
  )
}

export function ProductListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

### Accordion (for Epics)

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function EpicList({ epics }: { epics: Epic[] }) {
  return (
    <Accordion type="multiple" className="w-full">
      {epics.map((epic) => (
        <AccordionItem key={epic.id} value={epic.id}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{epic.stories?.length || 0}</Badge>
              <span>{epic.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pl-6">
              {epic.stories?.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
```

### Command (Search)

```tsx
'use client'

import { useState, useEffect } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useRouter } from 'next/navigation'

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type to search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Products">
          <CommandItem onSelect={() => router.push('/dashboard/products')}>
            View all products
          </CommandItem>
          <CommandItem onSelect={() => router.push('/dashboard/products/new')}>
            Create new product
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => router.push('/dashboard')}>
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => router.push('/dashboard/chat')}>
            AI Chat
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

## Theme Configuration

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Recommended Components for Manager Assistant

| Feature | Components Needed |
|---------|-------------------|
| Auth pages | Card, Form, Input, Button |
| Dashboard | Card, Tabs, Badge, Skeleton |
| Product list | Card, Button, DropdownMenu, AlertDialog |
| Backlog | Accordion, Card, Badge, Sheet, Checkbox |
| Sprint board | Card, Badge, Button, Dialog |
| AI Chat | Card, Input, Button, Skeleton, ScrollArea |
| Settings | Form, Input, Select, Switch, Button |

## Installation Commands

```bash
# Core UI
npx shadcn@latest add button card input textarea form

# Dialogs
npx shadcn@latest add dialog alert-dialog sheet

# Navigation
npx shadcn@latest add tabs dropdown-menu command

# Lists
npx shadcn@latest add accordion table

# Feedback
npx shadcn@latest add sonner skeleton badge

# Forms
npx shadcn@latest add select checkbox switch label

# Layout
npx shadcn@latest add separator scroll-area

# All at once
npx shadcn@latest add button card input textarea form dialog alert-dialog sheet tabs dropdown-menu command accordion sonner skeleton badge select checkbox switch label separator scroll-area
```
