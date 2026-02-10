# Rendering Performance

## Overview

Virtual DOM optimization, hydration patterns, and CSS performance techniques. These patterns optimize how React renders and updates the DOM.

## Rules

### rendering-svg-wrapper: Animate SVG Wrapper Instead of SVG Element

**Impact**: MEDIUM-LOW
**Tags**: #performance #animation #svg #css

#### Problem

Animating SVG elements directly is less performant than animating a wrapper element.

#### Incorrect

```typescript
function AnimatedIcon() {
  return (
    <svg
      style={{
        animation: 'spin 2s linear infinite'
      }}
    >
      <circle cx="50" cy="50" r="40" />
    </svg>
  )
}
```

#### Correct

```typescript
function AnimatedIcon() {
  return (
    <div style={{ animation: 'spin 2s linear infinite' }}>
      <svg>
        <circle cx="50" cy="50" r="40" />
      </svg>
    </div>
  )
}
```

#### Explanation

HTML container animations are hardware-accelerated via CSS transforms. SVG animations may not benefit from GPU acceleration, leading to choppier performance.

---

### rendering-content-visibility: CSS content-visibility for Long Lists

**Impact**: MEDIUM-LOW
**Tags**: #performance #css #rendering #virtualization

#### Problem

Rendering thousands of items off-screen wastes CPU and memory.

#### Incorrect

```typescript
function LongList({ items }: { items: Item[] }) {
  return (
    <div>
      {items.map(item => (
        <div key={item.id} className="item">
          {item.content}
        </div>
      ))}
    </div>
  )
}
```

```css
.item {
  height: 50px;
  border: 1px solid #ccc;
}
```

#### Correct

```typescript
function LongList({ items }: { items: Item[] }) {
  return (
    <div>
      {items.map(item => (
        <div key={item.id} className="item">
          {item.content}
        </div>
      ))}
    </div>
  )
}
```

```css
.item {
  height: 50px;
  border: 1px solid #ccc;
  content-visibility: auto;
  contain-intrinsic-size: 50px;
}
```

#### Explanation

`content-visibility: auto` skips rendering and layout of off-screen items. The browser re-enables rendering when scrolled into view. `contain-intrinsic-size` prevents layout shifts.

---

### rendering-hoist-static: Hoist Static JSX Elements

**Impact**: MEDIUM-LOW
**Tags**: #performance #react #memory #optimization

#### Problem

Static JSX created inside components is recreated on every render, wasting memory.

#### Incorrect

```typescript
function Page() {
  const header = <header>My App</header>

  return (
    <div>
      {header}
      <main>Content</main>
    </div>
  )
}
```

#### Correct

```typescript
const HEADER = <header>My App</header>

function Page() {
  return (
    <div>
      {HEADER}
      <main>Content</main>
    </div>
  )
}
```

#### Explanation

Move static JSX outside components. Define them once at module level to avoid recreating identical elements on every render.

---

### rendering-svg-precision: Optimize SVG Precision

**Impact**: LOW-MEDIUM
**Tags**: #performance #svg #file-size #optimization

#### Problem

Excessive decimal precision in SVG coordinates inflates file size without visual benefit.

#### Incorrect

```xml
<svg viewBox="0 0 100 100">
  <circle cx="50.123456789" cy="50.987654321" r="40.246813579" />
  <path d="M10.123456789 20.987654321 L90.123456789 80.987654321" />
</svg>
```

#### Correct

```xml
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="51" r="40.2" />
  <path d="M10.1 21 L90.1 81" />
</svg>
```

#### Explanation

Round SVG coordinates to 1-2 decimal places. Visual differences are imperceptible at screen resolution, but file size savings can be significant for complex SVGs.

---

### rendering-hydration-mismatch: Prevent Hydration Mismatch Without Flickering

**Impact**: MEDIUM
**Tags**: #performance #ssr #hydration #next.js

#### Problem

Server and client render different content, causing hydration mismatches and layout shifts.

#### Incorrect

```typescript
function Component() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div>Loading...</div>
  }

  return <ClientOnlyContent />
}
```

#### Correct

```typescript
function Component() {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? (
        <ServerPlaceholder />
      ) : (
        <ClientOnlyContent />
      )}
    </div>
  )
}
```

#### Explanation

Use `suppressHydrationWarning` for known mismatches. Conditionally render based on environment detection to match server output structure while allowing client-specific content.

---

### rendering-conditional-null: Use Conditional Rendering Over CSS Display

**Impact**: LOW-MEDIUM
**Tags**: #performance #react #rendering #dom

#### Problem

Using visibility styles for show/hide leaves unused elements in the DOM.

#### Incorrect

```typescript
function Modal({ isOpen }: { isOpen: boolean }) {
  return (
    <div style={{ display: isOpen ? 'block' : 'none' }}>
      Modal content
    </div>
  )
}
```

#### Correct

```typescript
function Modal({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) {
    return null
  }

  return <div>Modal content</div>
}
```

#### Explanation

Conditional rendering (returning `null`) removes elements from the DOM entirely. This is cleaner than CSS visibility and prevents hidden elements from consuming memory.

---

### rendering-explicit-conditions: Use Explicit Conditional Rendering

**Impact**: LOW-MEDIUM
**Tags**: #react #rendering #bugs #best-practice

#### Problem

Implicit falsy values in JSX render unexpected content.

#### Incorrect

```typescript
function Component({ count, error }: { count: number; error: string | null }) {
  return (
    <div>
      {count && <div>{count} items</div>}
      {error && <div>{error}</div>}
    </div>
  )
}

// If count is 0, renders "0" (0 is falsy but rendered as text)
// If error is '', renders nothing ('' is falsy)
```

#### Correct

```typescript
function Component({ count, error }: { count: number; error: string | null }) {
  return (
    <div>
      {count > 0 && <div>{count} items</div>}
      {error !== null && error !== '' && <div>{error}</div>}
    </div>
  )
}
```

#### Explanation

Explicitly compare booleans. Don't rely on JavaScript falsy coercion in JSX. Numbers like 0 will render as text, not skip rendering, which can cause unexpected UI bugs.
