# Bundle Size Optimization

## Overview

Code splitting, tree shaking, and import optimization patterns. Reducing bundle size improves initial load time and time-to-interactive for users.

## Rules

### bundle-barrel-imports: Avoid Barrel File Imports

**Impact**: HIGH
**Tags**: #performance #bundle #tree-shaking #imports

#### Problem

Barrel files (index.ts re-exporting everything) cause tree-shaking to fail, bundling unused code.

#### Incorrect

```typescript
// utils/index.ts - barrel file
export * from './formatDate'
export * from './parseJSON'
export * from './calculateDistance'
export * from './validateEmail'

// usage - pulls in entire barrel
import { formatDate } from './utils'
```

#### Correct

```typescript
// usage - direct import enables tree-shaking
import { formatDate } from './utils/formatDate'
```

#### Explanation

Direct imports preserve tree-shaking capabilities. Bundlers cannot reliably eliminate unused exports from barrel files because the re-export pattern obscures what's actually used.

---

### bundle-conditional-loading: Conditional Module Loading

**Impact**: HIGH
**Tags**: #performance #bundle #dynamic-import #code-splitting

#### Problem

Loading features unconditionally bloats the bundle for users who don't need them.

#### Incorrect

```typescript
import { AdvancedChart } from './charts/advanced'
import { DataAnalytics } from './analytics/pro'

export function Dashboard({ isPremium }: { isPremium: boolean }) {
  if (!isPremium) {
    return <div>Basic dashboard</div>
  }
  return <AdvancedChart />
}
```

#### Correct

```typescript
export async function Dashboard({ isPremium }: { isPremium: boolean }) {
  if (!isPremium) {
    return <div>Basic dashboard</div>
  }

  const { AdvancedChart } = await import('./charts/advanced')
  return <AdvancedChart />
}
```

#### Explanation

Dynamic imports defer loading until the condition is met, excluding unused code from initial bundles. Premium features only load for premium users.

---

### bundle-defer-third-party: Defer Non-Critical Third-Party Libraries

**Impact**: MEDIUM-HIGH
**Tags**: #performance #bundle #third-party #lazy-loading

#### Problem

Including heavy third-party libraries in the main bundle delays application startup.

#### Incorrect

```typescript
import { HeavyAnalytics } from 'analytics-library'

export function App() {
  useEffect(() => {
    HeavyAnalytics.track('page_view')
  }, [])

  return <div>App content</div>
}
```

#### Correct

```typescript
export function App() {
  useEffect(() => {
    import('analytics-library').then(({ HeavyAnalytics }) => {
      HeavyAnalytics.track('page_view')
    })
  }, [])

  return <div>App content</div>
}
```

#### Explanation

Defer analytics, tracking, and non-critical integrations to reduce main bundle and improve initial load performance. Users see content faster while background services load asynchronously.

---

### bundle-dynamic-heavy: Dynamic Imports for Heavy Components

**Impact**: MEDIUM-HIGH
**Tags**: #performance #bundle #react-lazy #suspense

#### Problem

Large component libraries bundled upfront delay route transitions.

#### Incorrect

```typescript
import { CodeEditor } from 'heavy-editor-library'

export function Page() {
  return <CodeEditor />
}
```

#### Correct

```typescript
import { lazy, Suspense } from 'react'

const CodeEditor = lazy(() =>
  import('heavy-editor-library').then(m => ({ default: m.CodeEditor }))
)

export function Page() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <CodeEditor />
    </Suspense>
  )
}
```

#### Explanation

Code splitting for heavy components via `React.lazy()` and `Suspense` defers loading until needed. This is especially valuable for routes or features that aren't immediately visible.

---

### bundle-preload-intent: Preload Based on User Intent

**Impact**: MEDIUM
**Tags**: #performance #bundle #preload #ux

#### Problem

Users must wait for chunks to download on-demand. Preloading on intent signals reduces perceived latency.

#### Incorrect

```typescript
const Editor = lazy(() => import('./Editor'))

export function Dashboard() {
  return (
    <>
      <div>Dashboard content</div>
      <Suspense fallback={null}>
        <Editor />
      </Suspense>
    </>
  )
}
```

#### Correct

```typescript
const Editor = lazy(() => import('./Editor'))

export function Dashboard() {
  const handleMouseEnter = () => {
    // Preload on hover
    import('./Editor')
  }

  return (
    <>
      <div>Dashboard content</div>
      <button onMouseEnter={handleMouseEnter}>
        Open Editor
      </button>
      <Suspense fallback={null}>
        <Editor />
      </Suspense>
    </>
  )
}
```

#### Explanation

Detect user intent (hover, focus) to initiate preloading before the actual interaction. This minimizes wait time when the user clicks, as the chunk is already downloading or cached.

---

### bundle-named-exports: Prefer Named Exports for Tree-Shaking

**Impact**: MEDIUM
**Tags**: #performance #bundle #tree-shaking #exports

#### Problem

Default exports can interfere with tree-shaking in some bundler configurations.

#### Incorrect

```typescript
// utils.ts
const formatDate = (date: Date) => { /* ... */ }
const formatCurrency = (amount: number) => { /* ... */ }

export default { formatDate, formatCurrency }

// usage
import utils from './utils'
utils.formatDate(new Date())
```

#### Correct

```typescript
// utils.ts
export const formatDate = (date: Date) => { /* ... */ }
export const formatCurrency = (amount: number) => { /* ... */ }

// usage
import { formatDate } from './utils'
formatDate(new Date())
```

#### Explanation

Named exports are statically analyzable, allowing bundlers to determine exactly which exports are used. Default exports that return objects prevent this analysis.

---

### bundle-analyze-regularly: Analyze Bundle Regularly

**Impact**: MEDIUM
**Tags**: #performance #bundle #tooling #monitoring

#### Problem

Bundle size creeps up over time without monitoring, degrading performance gradually.

#### Incorrect

```typescript
// No bundle analysis configured
// package.json
{
  "scripts": {
    "build": "next build"
  }
}
```

#### Correct

```typescript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... other config
})

// package.json
{
  "scripts": {
    "build": "next build",
    "analyze": "ANALYZE=true next build"
  }
}
```

#### Explanation

Regular bundle analysis identifies unexpected size increases and opportunities for optimization. Run analysis after adding new dependencies or before releases.
