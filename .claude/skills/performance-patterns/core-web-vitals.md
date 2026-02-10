# Core Web Vitals 2026

This document covers the three Core Web Vitals metrics, their thresholds, and optimization strategies.

**Important**: INP (Interaction to Next Paint) replaced FID (First Input Delay) as the responsiveness metric in March 2024. All guidance uses INP, not FID.

## Overview

Core Web Vitals are Google's metrics for measuring real-world user experience. They focus on three aspects:

| Aspect | Metric | Question |
|--------|--------|----------|
| Loading | **LCP** | How fast does main content appear? |
| Interactivity | **INP** | How fast do interactions respond? |
| Visual Stability | **CLS** | Does the page shift unexpectedly? |

## Thresholds

### Summary Table

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **INP** | < 200ms | 200ms - 500ms | > 500ms |
| **CLS** | < 0.1 | 0.1 - 0.25 | > 0.25 |

**Note**: Thresholds are measured at the 75th percentile of page loads across real users.

---

## LCP (Largest Contentful Paint)

### What It Measures

Time until the largest content element (image, video, or text block) is rendered in the viewport.

### Target

- **Good**: < 2.5 seconds
- **Needs Improvement**: 2.5s - 4.0s
- **Poor**: > 4.0 seconds

### Common LCP Elements

1. `<img>` elements
2. `<image>` inside `<svg>`
3. `<video>` poster images
4. Background images via `url()`
5. Block-level text elements (`<h1>`, `<p>`, etc.)

### Optimization Strategies

#### 1. Optimize Resource Loading

```html
<!-- Preload critical images -->
<link rel="preload" as="image" href="hero.webp" fetchpriority="high">

<!-- Preconnect to critical origins -->
<link rel="preconnect" href="https://cdn.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">
```

#### 2. Optimize Images

| Strategy | Impact | Implementation |
|----------|--------|----------------|
| Use modern formats | High | WebP, AVIF instead of PNG/JPEG |
| Responsive images | High | `srcset` and `sizes` attributes |
| Lazy load below-fold | Medium | `loading="lazy"` (but NOT for LCP image) |
| CDN delivery | High | Serve from edge locations |
| Compression | Medium | Quality 80-85% for WebP |

```html
<!-- Responsive hero image -->
<img
  src="hero-800.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Hero image"
  fetchpriority="high"
>
```

#### 3. Optimize Server Response

| Strategy | Implementation |
|----------|----------------|
| Server-side rendering | Render critical content on server |
| Edge caching | Cache HTML at CDN edge |
| Database optimization | Index queries, connection pooling |
| Compression | Brotli/gzip for text resources |

#### 4. Minimize Render-Blocking Resources

```html
<!-- Defer non-critical JS -->
<script src="analytics.js" defer></script>

<!-- Async for independent scripts -->
<script src="third-party.js" async></script>

<!-- Critical CSS inline, rest deferred -->
<style>/* Critical above-fold CSS */</style>
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
```

---

## INP (Interaction to Next Paint)

### What It Measures

The latency of ALL user interactions (clicks, taps, key presses) throughout the page lifecycle. Reports the worst interaction (at 75th percentile).

**Key difference from FID**: INP measures ALL interactions, not just the first one. This captures jank that occurs after initial load.

### Target

- **Good**: < 200 milliseconds
- **Needs Improvement**: 200ms - 500ms
- **Poor**: > 500 milliseconds

### Interaction Phases

```
User Click → [Input Delay] → [Processing Time] → [Presentation Delay] → Visual Update
            └──────────────── INP Duration ────────────────────────────┘
```

1. **Input Delay**: Time waiting for main thread
2. **Processing Time**: Event handler execution
3. **Presentation Delay**: Rendering the update

### Optimization Strategies

#### 1. Break Up Long Tasks

Tasks > 50ms block the main thread. Use yielding strategies:

```javascript
// BAD: Long synchronous task
function processLargeArray(items) {
  items.forEach(item => heavyProcess(item)); // Blocks main thread
}

// GOOD: Yield to main thread periodically
async function processLargeArray(items) {
  for (const item of items) {
    heavyProcess(item);

    // Yield every 5ms to allow interactions
    if (performance.now() - startTime > 5) {
      await scheduler.yield(); // or requestIdleCallback
      startTime = performance.now();
    }
  }
}
```

#### 2. Optimize Event Handlers

```javascript
// BAD: Heavy computation in click handler
button.addEventListener('click', () => {
  const result = expensiveCalculation(); // Blocks
  updateUI(result);
});

// GOOD: Defer heavy work
button.addEventListener('click', () => {
  // Show immediate feedback
  button.classList.add('loading');

  // Defer heavy work
  requestAnimationFrame(() => {
    const result = expensiveCalculation();
    updateUI(result);
    button.classList.remove('loading');
  });
});
```

#### 3. Use Web Workers for Heavy Computation

```javascript
// Main thread
const worker = new Worker('heavy-computation.js');

button.addEventListener('click', () => {
  worker.postMessage({ data: largeDataset });
});

worker.onmessage = (event) => {
  updateUI(event.data.result);
};
```

#### 4. Debounce High-Frequency Events

```javascript
// Debounce scroll handlers
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      handleScroll();
      ticking = false;
    });
    ticking = true;
  }
});
```

### INP Debugging

Use Chrome DevTools Performance panel:
1. Record interaction
2. Look for long tasks (> 50ms)
3. Identify blocking JavaScript
4. Check for layout thrashing

---

## CLS (Cumulative Layout Shift)

### What It Measures

Sum of all unexpected layout shifts during the page's entire lifespan. A shift occurs when visible elements move without user interaction.

### Target

- **Good**: < 0.1
- **Needs Improvement**: 0.1 - 0.25
- **Poor**: > 0.25

### CLS Calculation

```
Layout Shift Score = Impact Fraction × Distance Fraction
```

- **Impact Fraction**: Viewport area affected by shift
- **Distance Fraction**: Distance elements moved (as % of viewport)

### Common Causes

| Cause | Impact | Solution |
|-------|--------|----------|
| Images without dimensions | High | Always set `width` and `height` |
| Ads/embeds without space | High | Reserve space with containers |
| Dynamically injected content | Medium | Reserve space or use transforms |
| Web fonts causing FOIT/FOUT | Medium | Use `font-display: optional` or `swap` |
| Animations using layout properties | Low | Use `transform` instead |

### Optimization Strategies

#### 1. Always Set Image Dimensions

```html
<!-- GOOD: Explicit dimensions prevent shift -->
<img src="photo.jpg" width="800" height="600" alt="Photo">

<!-- GOOD: CSS aspect-ratio -->
<img src="photo.jpg" style="aspect-ratio: 4/3; width: 100%;" alt="Photo">
```

#### 2. Reserve Space for Dynamic Content

```css
/* Reserve space for ad slot */
.ad-container {
  min-height: 250px;
  background: #f0f0f0;
}

/* Skeleton placeholder */
.content-placeholder {
  min-height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  animation: shimmer 1.5s infinite;
}
```

#### 3. Optimize Font Loading

```css
/* Prevent FOIT with font-display */
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately, swap when loaded */
}

/* Or use optional for non-critical fonts */
@font-face {
  font-family: 'DecorativeFont';
  font-display: optional; /* Skip if not loaded quickly */
}
```

#### 4. Use Transform for Animations

```css
/* BAD: Layout-triggering animation */
.animate {
  animation: slide 0.3s;
}
@keyframes slide {
  from { margin-left: -100px; }
  to { margin-left: 0; }
}

/* GOOD: Transform-based animation */
.animate {
  animation: slide 0.3s;
}
@keyframes slide {
  from { transform: translateX(-100px); }
  to { transform: translateX(0); }
}
```

---

## Measurement Tools

### Real User Monitoring (RUM)

```javascript
// Using web-vitals library
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(metric => sendToAnalytics('LCP', metric.value));
onINP(metric => sendToAnalytics('INP', metric.value));
onCLS(metric => sendToAnalytics('CLS', metric.value));
```

### Synthetic Testing

| Tool | Use Case |
|------|----------|
| **Lighthouse** | Development, CI/CD |
| **PageSpeed Insights** | Quick checks, field data |
| **WebPageTest** | Detailed waterfall analysis |
| **Chrome DevTools** | Local debugging |

### Field Data Sources

- **Chrome User Experience Report (CrUX)**: Real Chrome user data
- **Search Console**: Core Web Vitals report
- **PageSpeed Insights**: Shows both lab and field data

---

## Quick Debugging Checklist

```
LCP Issues:
[ ] Is the LCP element loading slowly? → Preload, optimize, CDN
[ ] Is render blocked by JS/CSS? → Defer, inline critical
[ ] Is server response slow? → SSR, edge caching, DB optimization

INP Issues:
[ ] Long tasks visible in DevTools? → Break up, use workers
[ ] Heavy event handlers? → Debounce, defer, show feedback
[ ] Third-party scripts blocking? → Async load, facade patterns

CLS Issues:
[ ] Images without dimensions? → Add width/height
[ ] Content injected above viewport? → Reserve space
[ ] Fonts causing reflow? → font-display: swap/optional
[ ] Animations using margin/padding? → Use transform
```
