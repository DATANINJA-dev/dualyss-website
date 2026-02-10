# Navigation Code Templates

Framework-specific code templates for generating navigation boilerplate from route-registry.yaml definitions.

## Template Structure

Each framework section provides:
- Link component template
- Programmatic navigation template
- Breadcrumb component template
- Navigation helper functions

## React Router v6

### Link Component

```tsx
import { Link } from 'react-router-dom';

// Basic navigation link
<Link to="{{path}}">{{label}}</Link>

// With state passing
<Link to="{{path}}" state={{ from: '{{current_path}}' }}>
  {{label}}
</Link>

// Active link styling
import { NavLink } from 'react-router-dom';

<NavLink
  to="{{path}}"
  className={({ isActive }) => isActive ? 'active' : ''}
>
  {{label}}
</NavLink>
```

### Programmatic Navigation

```tsx
import { useNavigate } from 'react-router-dom';

function {{ComponentName}}() {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate('{{path}}');
  };

  // With state
  const navigateWithState = () => {
    navigate('{{path}}', { state: { from: '{{current_path}}' } });
  };

  // Go back
  const goBack = () => {
    navigate(-1);
  };

  return (/* component JSX */);
}
```

### Breadcrumb Component

```tsx
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  path: string;
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb">
        {items.map((item, index) => (
          <li key={item.path} className="breadcrumb-item">
            {index === items.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <Link to={item.path}>{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Usage from route registry:
// {{#each breadcrumb_path}}
// { path: '{{path}}', label: '{{label}}' },
// {{/each}}
```

### Navigation Helper

```tsx
import { useNavigate, useLocation } from 'react-router-dom';

function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    // Navigate to route from registry
    goTo: (path: string, state?: object) => {
      navigate(path, { state: { ...state, from: location.pathname } });
    },

    // Go back to entry point
    goBack: () => {
      const from = location.state?.from;
      if (from) {
        navigate(from);
      } else {
        navigate(-1);
      }
    },

    // Check if current route
    isActive: (path: string) => location.pathname === path,

    // Get current path
    currentPath: location.pathname,
  };
}
```

## Next.js (App Router)

### Link Component

```tsx
import Link from 'next/link';

// Basic navigation link
<Link href="{{path}}">{{label}}</Link>

// With prefetch control
<Link href="{{path}}" prefetch={false}>
  {{label}}
</Link>

// Replace instead of push
<Link href="{{path}}" replace>
  {{label}}
</Link>
```

### Programmatic Navigation

```tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';

function {{ComponentName}}() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = () => {
    router.push('{{path}}');
  };

  // Replace current history entry
  const replaceNavigation = () => {
    router.replace('{{path}}');
  };

  // Go back
  const goBack = () => {
    router.back();
  };

  // Refresh current page
  const refresh = () => {
    router.refresh();
  };

  return (/* component JSX */);
}
```

### Breadcrumb Component

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  path: string;
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb">
        {items.map((item, index) => (
          <li key={item.path} className="breadcrumb-item">
            {index === items.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <Link href={item.path}>{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

### Navigation Helper

```tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return {
    // Navigate to route from registry
    goTo: (path: string) => {
      router.push(path);
    },

    // Go back
    goBack: () => {
      router.back();
    },

    // Check if current route
    isActive: (path: string) => pathname === path,

    // Get current path
    currentPath: pathname,

    // Get search params
    getParam: (key: string) => searchParams.get(key),
  };
}
```

## Vue Router

### Link Component

```vue
<template>
  <!-- Basic navigation link -->
  <router-link to="{{path}}">{{label}}</router-link>

  <!-- With named route -->
  <router-link :to="{ name: '{{route_name}}' }">{{label}}</router-link>

  <!-- With params -->
  <router-link :to="{ name: '{{route_name}}', params: { id: {{id}} } }">
    {{label}}
  </router-link>

  <!-- Active class styling -->
  <router-link
    to="{{path}}"
    active-class="active"
    exact-active-class="exact-active"
  >
    {{label}}
  </router-link>
</template>
```

### Programmatic Navigation

```vue
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const handleNavigation = () => {
  router.push('{{path}}');
};

// With named route
const navigateNamed = () => {
  router.push({ name: '{{route_name}}' });
};

// With params
const navigateWithParams = (id: string) => {
  router.push({ name: '{{route_name}}', params: { id } });
};

// Replace current entry
const replaceNavigation = () => {
  router.replace('{{path}}');
};

// Go back
const goBack = () => {
  router.back();
};

// Go forward
const goForward = () => {
  router.forward();
};
</script>
```

### Breadcrumb Component

```vue
<template>
  <nav aria-label="Breadcrumb">
    <ol class="breadcrumb">
      <li
        v-for="(item, index) in items"
        :key="item.path"
        class="breadcrumb-item"
      >
        <span v-if="index === items.length - 1" aria-current="page">
          {{ item.label }}
        </span>
        <router-link v-else :to="item.path">
          {{ item.label }}
        </router-link>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  path: string;
  label: string;
}

defineProps<{
  items: BreadcrumbItem[];
}>();
</script>
```

### Navigation Helper

```vue
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

const navigation = {
  // Navigate to route from registry
  goTo: (path: string) => {
    router.push(path);
  },

  // Go back
  goBack: () => {
    router.back();
  },

  // Check if current route
  isActive: (path: string) => route.path === path,

  // Get current path
  currentPath: computed(() => route.path),

  // Get route param
  getParam: (key: string) => route.params[key],
};
</script>
```

## SvelteKit

### Link Component

```svelte
<!-- Basic navigation link -->
<a href="{{path}}">{{label}}</a>

<!-- Prefetch on hover -->
<a href="{{path}}" data-sveltekit-preload-data="hover">
  {{label}}
</a>

<!-- No scroll reset -->
<a href="{{path}}" data-sveltekit-noscroll>
  {{label}}
</a>

<!-- Replace history -->
<a href="{{path}}" data-sveltekit-replacestate>
  {{label}}
</a>
```

### Programmatic Navigation

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  const handleNavigation = async () => {
    await goto('{{path}}');
  };

  // Replace current entry
  const replaceNavigation = async () => {
    await goto('{{path}}', { replaceState: true });
  };

  // No scroll reset
  const navigateNoScroll = async () => {
    await goto('{{path}}', { noScroll: true });
  };

  // Go back (browser history)
  const goBack = () => {
    history.back();
  };
</script>
```

### Breadcrumb Component

```svelte
<script lang="ts">
  interface BreadcrumbItem {
    path: string;
    label: string;
  }

  export let items: BreadcrumbItem[];
</script>

<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    {#each items as item, index}
      <li class="breadcrumb-item">
        {#if index === items.length - 1}
          <span aria-current="page">{item.label}</span>
        {:else}
          <a href={item.path}>{item.label}</a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
```

### Navigation Helper

```svelte
<script lang="ts" context="module">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';

  export const navigation = {
    // Navigate to route from registry
    goTo: async (path: string) => {
      await goto(path);
    },

    // Go back
    goBack: () => {
      history.back();
    },

    // Check if current route
    isActive: (path: string) => get(page).url.pathname === path,

    // Get current path
    getCurrentPath: () => get(page).url.pathname,

    // Get URL param
    getParam: (key: string) => get(page).params[key],
  };
</script>
```

## Template Variables Reference

Variables available for template interpolation from route-registry.yaml:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{path}}` | Route path | `/dashboard` |
| `{{label}}` | Display label | `Dashboard` |
| `{{route_name}}` | Named route identifier | `dashboard` |
| `{{current_path}}` | Current page path | `/settings` |
| `{{ComponentName}}` | PascalCase component name | `DashboardPage` |
| `{{breadcrumb_path}}` | Array of ancestor routes | `[{path, label}, ...]` |
| `{{entry_points}}` | Pages that link here | `['/home', '/sidebar']` |
| `{{exit_points}}` | Pages linked from here | `['/settings', '/profile']` |

## CSS Patterns

### Breadcrumb Styling (Framework-Agnostic)

```css
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: '/';
  padding: 0 0.5rem;
  color: #6c757d;
}

.breadcrumb-item a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.breadcrumb-item [aria-current="page"] {
  color: #6c757d;
}
```

### Active Link Styling

```css
/* React Router / Vue Router */
.nav-link.active,
.router-link-active {
  font-weight: bold;
  color: #007bff;
}

/* Exact match */
.router-link-exact-active {
  border-bottom: 2px solid #007bff;
}
```

## TypeScript Types

### Shared Types (Framework-Agnostic)

```typescript
interface RouteDefinition {
  path: string;
  label: string;
  name?: string;
  entry_points?: string[];
  exit_points?: string[];
  meta?: {
    requiresAuth?: boolean;
    roles?: string[];
    [key: string]: unknown;
  };
}

interface BreadcrumbItem {
  path: string;
  label: string;
}

interface NavigationContext {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  canGoBack: boolean;
}
```

## Generation Notes

When generating code from route-registry.yaml:

1. **Detect framework first** - Use `framework-detection.md` patterns
2. **Parse YAML structure** - Extract routes with entry/exit points
3. **Build breadcrumb chains** - Traverse parent relationships
4. **Generate imports** - Framework-specific import statements
5. **Apply templates** - Substitute variables into templates
6. **Format output** - Apply consistent code style

### Output Modes

| Mode | Description |
|------|-------------|
| `preview` | Display generated code without writing files |
| `write` | Create navigation component files |
| `clipboard` | Copy generated code to clipboard |
