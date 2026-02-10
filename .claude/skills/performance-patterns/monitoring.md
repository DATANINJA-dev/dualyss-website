# Performance Monitoring

This document covers Real User Monitoring (RUM), synthetic testing, performance budgets, load testing, and resource estimation.

## Overview

### Monitoring Types

| Type | When | Data Source | Use Case |
|------|------|-------------|----------|
| **RUM** | Production | Real users | Actual performance |
| **Synthetic** | CI/CD, Dev | Lab conditions | Regression detection |
| **Load Testing** | Pre-release | Simulated traffic | Capacity planning |
| **Profiling** | Development | Local machine | Debugging |

---

## Real User Monitoring (RUM)

### What RUM Captures

```
User loads page
    ↓
[Navigation Timing] → TTFB, DOM load, page load
[Paint Timing] → FCP, LCP
[Interaction Timing] → INP
[Layout Shift] → CLS
[Resource Timing] → Individual asset loads
[Custom Events] → Business metrics
```

### Implementation with web-vitals

```javascript
import { onLCP, onINP, onCLS, onTTFB, onFCP } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,  // 'good', 'needs-improvement', 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    // Add context
    url: window.location.href,
    userAgent: navigator.userAgent,
    connectionType: navigator.connection?.effectiveType
  });

  // Use sendBeacon for reliability
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  } else {
    fetch('/analytics', { body, method: 'POST', keepalive: true });
  }
}

// Register handlers
onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
onTTFB(sendToAnalytics);
onFCP(sendToAnalytics);
```

### RUM Aggregation

```sql
-- PostgreSQL: Calculate p75 Core Web Vitals
SELECT
  date_trunc('hour', timestamp) as hour,
  percentile_cont(0.75) WITHIN GROUP (ORDER BY lcp) as lcp_p75,
  percentile_cont(0.75) WITHIN GROUP (ORDER BY inp) as inp_p75,
  percentile_cont(0.75) WITHIN GROUP (ORDER BY cls) as cls_p75
FROM vitals
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY 1
ORDER BY 1;
```

### RUM Services

| Service | Features | Pricing |
|---------|----------|---------|
| Google Analytics 4 | Free Core Web Vitals, basic | Free |
| Vercel Analytics | Edge-based, Next.js native | Included/Pro |
| Cloudflare Web Analytics | Privacy-focused, free | Free |
| Datadog RUM | Full stack, APM integration | Per session |
| New Relic Browser | Enterprise, detailed traces | Per GB |
| SpeedCurve | Historical comparison, budgets | Subscription |

---

## Synthetic Monitoring

### Lighthouse

#### CLI Usage

```bash
# Basic audit
lighthouse https://example.com --output html --output-path report.html

# Performance only, mobile
lighthouse https://example.com --only-categories=performance --preset=perf

# JSON output for CI
lighthouse https://example.com --output json --output-path report.json
```

#### Lighthouse CI

```yaml
# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/products'],
      numberOfRuns: 3,
      startServerCommand: 'npm start',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
      },
    },
    upload: {
      target: 'lhci',
      serverBaseUrl: 'https://lhci.example.com',
    },
  },
};
```

```yaml
# GitHub Actions
name: Lighthouse CI
on: push

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci && npm run build
      - run: npx @lhci/cli@0.14.x autorun
```

### WebPageTest

```bash
# CLI usage
webpagetest test https://example.com \
  --location ec2-us-east-1:Chrome \
  --connectivity Cable \
  --runs 3 \
  --first-view-only \
  --json output.json
```

### Comparison

| Tool | Best For | Pros | Cons |
|------|----------|------|------|
| Lighthouse | CI/CD gates | Free, detailed | Lab only |
| WebPageTest | Deep analysis | Real devices, video | Slower |
| PageSpeed Insights | Quick checks | Field + lab data | No automation |

---

## Performance Budgets

### Budget Types

| Type | Metric | Example Budget |
|------|--------|----------------|
| **Timing** | LCP, INP, TTFB | LCP < 2.5s |
| **Size** | JS bundle, total page | JS < 300KB |
| **Count** | Requests, third-parties | < 50 requests |
| **Score** | Lighthouse performance | > 90 |

### Budget Definition

```json
// budget.json
[
  {
    "path": "/*",
    "timings": [
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "first-contentful-paint", "budget": 1500 },
      { "metric": "interactive", "budget": 3500 }
    ],
    "resourceSizes": [
      { "resourceType": "script", "budget": 300 },
      { "resourceType": "stylesheet", "budget": 100 },
      { "resourceType": "image", "budget": 500 },
      { "resourceType": "total", "budget": 1000 }
    ],
    "resourceCounts": [
      { "resourceType": "third-party", "budget": 10 }
    ]
  }
]
```

### Webpack Bundle Budget

```javascript
// webpack.config.js
module.exports = {
  performance: {
    maxAssetSize: 300000,      // 300KB per asset
    maxEntrypointSize: 500000, // 500KB entry point
    hints: 'error'             // Fail build if exceeded
  }
};
```

### Budget Alerting

```javascript
// CI script
const budget = require('./budget.json');
const report = require('./lighthouse-report.json');

const violations = [];

// Check LCP
const lcp = report.audits['largest-contentful-paint'].numericValue;
if (lcp > budget.timings.lcp) {
  violations.push(`LCP ${lcp}ms exceeds budget ${budget.timings.lcp}ms`);
}

// Check bundle size
const jsSize = report.audits['total-byte-weight'].details.items
  .filter(i => i.resourceType === 'Script')
  .reduce((sum, i) => sum + i.transferSize, 0);

if (jsSize > budget.sizes.js * 1024) {
  violations.push(`JS ${jsSize/1024}KB exceeds budget ${budget.sizes.js}KB`);
}

if (violations.length > 0) {
  console.error('Budget violations:', violations);
  process.exit(1);
}
```

---

## Load Testing

### Tools Comparison

| Tool | Best For | Language | Learning Curve |
|------|----------|----------|----------------|
| **k6** | API testing, CI/CD | JavaScript | Low |
| **Artillery** | HTTP/WebSocket | YAML/JS | Low |
| **Locust** | Python projects | Python | Low |
| **JMeter** | Enterprise, complex | Java/GUI | High |
| **wrk** | Simple HTTP | Lua | Very Low |
| **Gatling** | CI/CD, reports | Scala | Medium |

### k6 Example

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up
    { duration: '3m', target: 50 },   // Sustained load
    { duration: '1m', target: 100 },  // Spike
    { duration: '2m', target: 100 },  // Sustained spike
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],    // <1% errors
  },
};

export default function () {
  const res = http.get('https://api.example.com/products');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

```bash
# Run test
k6 run load-test.js

# Run with more VUs
k6 run --vus 100 --duration 5m load-test.js
```

### Artillery Example

```yaml
# artillery.yml
config:
  target: "https://api.example.com"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Spike"

scenarios:
  - name: "Browse products"
    flow:
      - get:
          url: "/products"
          expect:
            - statusCode: 200
            - contentType: json
      - think: 2
      - get:
          url: "/products/{{ $randomNumber(1, 100) }}"
```

### Load Testing Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **Smoke** | Minimal load | Verify system works |
| **Load** | Expected load | Baseline performance |
| **Stress** | Beyond capacity | Find breaking point |
| **Spike** | Sudden increase | Flash sale simulation |
| **Soak** | Long duration | Memory leak detection |

---

## Resource Estimation

### Task Type Impact Matrix

| Task Type | CPU | Memory | Storage | Network |
|-----------|-----|--------|---------|---------|
| CRUD operations | Low | Low | Medium | Low |
| Batch processing | High | Medium | Low | Low |
| File uploads | Low | High | High | High |
| Real-time features | Medium | Medium | Low | High |
| Analytics/reporting | High | High | Medium | Low |
| Search/filtering | Medium | Medium | Low | Low |
| Image processing | High | High | High | Medium |

### Estimation Guidelines

```
Baseline users: 1,000 concurrent
Peak multiplier: 3x (events, launches)
Growth factor: 2x per year

CPU: (baseline × peak × task_weight) / cores_per_instance
Memory: (session_size × concurrent_users) + application_base
Storage: (data_per_user × users) × retention_period
Bandwidth: (avg_response × requests_per_second) × 8
```

### Capacity Planning

```javascript
// Capacity calculator
function estimateCapacity(config) {
  const {
    concurrentUsers,
    requestsPerSecond,
    avgResponseSize,
    sessionSizeKB,
    peakMultiplier = 3
  } = config;

  return {
    // Memory (GB)
    memory: Math.ceil((sessionSizeKB * concurrentUsers * peakMultiplier) / 1024 / 1024),

    // Bandwidth (Mbps)
    bandwidth: Math.ceil((avgResponseSize * requestsPerSecond * 8) / 1024 / 1024),

    // CPU (estimate based on requests)
    cpuCores: Math.ceil(requestsPerSecond / 1000), // ~1000 req/s per core

    // Instances (assuming 4 core, 8GB instances)
    instances: Math.ceil(Math.max(
      (sessionSizeKB * concurrentUsers * peakMultiplier) / (8 * 1024 * 1024),
      requestsPerSecond / 4000
    ))
  };
}
```

---

## Alerting

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| LCP p75 | > 2.5s | > 4.0s |
| INP p75 | > 200ms | > 500ms |
| CLS p75 | > 0.1 | > 0.25 |
| Error rate | > 1% | > 5% |
| Latency p99 | > 1s | > 3s |
| CPU | > 70% | > 90% |
| Memory | > 80% | > 95% |

### Alert Example (Datadog)

```yaml
# Datadog monitor
name: "High LCP detected"
type: metric alert
query: avg(last_5m):p75:rum.performance.largest_contentful_paint{env:production} > 2500
message: |
  LCP p75 is {{value}}ms, exceeding 2.5s threshold.

  Possible causes:
  - Slow server response
  - Large images not optimized
  - Render-blocking resources

  Dashboard: https://app.datadoghq.com/dashboard/perf
thresholds:
  warning: 2000
  critical: 2500
```

---

## Quick Reference

### Monitoring Checklist

```
RUM Setup:
[ ] web-vitals library installed
[ ] LCP, INP, CLS reported
[ ] Analytics endpoint receiving data
[ ] Dashboards showing p75 metrics

Synthetic Testing:
[ ] Lighthouse CI in pipeline
[ ] Performance budgets defined
[ ] Alerts on budget violations
[ ] Regular WebPageTest runs

Load Testing:
[ ] Baseline load test exists
[ ] Stress test for peak capacity
[ ] Soak test for memory leaks
[ ] Results documented

Alerting:
[ ] Core Web Vitals alerts
[ ] Error rate alerts
[ ] Latency alerts
[ ] Resource alerts (CPU, memory)
```

### Dashboard Metrics

| Category | Metrics |
|----------|---------|
| **User Experience** | LCP p75, INP p75, CLS p75, FCP |
| **Backend** | TTFB, API latency p50/p99, error rate |
| **Resources** | CPU %, memory %, connections |
| **Business** | Page views, conversions, bounce rate |
