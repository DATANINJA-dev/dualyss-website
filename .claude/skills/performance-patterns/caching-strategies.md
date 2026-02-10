# Caching Strategies

This document covers caching patterns across different layers, including memory, Redis, CDN, and HTTP caching strategies.

## Overview

### Cache Layers

```
Client ─→ [CDN Cache] ─→ [Application Cache] ─→ [Database Cache] ─→ Database
           (Edge)         (Redis/Memory)          (Query Cache)
```

| Layer | Location | TTL Range | Best For |
|-------|----------|-----------|----------|
| Browser | Client | Hours-Days | Static assets, API responses |
| CDN | Edge | Hours-Days | Static assets, cacheable API |
| Application | Server | Seconds-Hours | Sessions, computed values |
| Database | DB Server | Minutes | Query results |

---

## Strategy Matrix

| Data Type | Strategy | TTL | Invalidation | Use Case |
|-----------|----------|-----|--------------|----------|
| User session | Memory/Redis | 30min | On logout | Auth tokens |
| API responses | Redis | 5min | On data change | REST/GraphQL |
| Static assets | CDN | 24h+ | On deploy | Images, CSS, JS |
| Computed values | Memory | 1-5min | Time-based | Aggregations |
| Database queries | Query cache | 10min | On write | Frequent reads |
| User preferences | Redis | 1h | On update | Settings |
| Rate limit counters | Redis | 1min | Time-based | API throttling |
| Search results | Redis | 15min | On index change | Full-text search |

---

## Memory Caching

### When to Use

- Single-server deployments
- Data that fits in memory
- Very low latency requirements (< 1ms)
- Computed values that are expensive to regenerate

### Implementation

#### Node.js (node-cache)

```javascript
import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 300,      // 5 min default TTL
  checkperiod: 60,  // Check for expired keys every 60s
  maxKeys: 10000    // Memory limit
});

// Set with TTL
cache.set('user:123', userData, 300);

// Get
const user = cache.get('user:123');

// Delete
cache.del('user:123');

// Get or compute
function getUser(userId) {
  const cached = cache.get(`user:${userId}`);
  if (cached) return cached;

  const user = await fetchFromDB(userId);
  cache.set(`user:${userId}`, user, 300);
  return user;
}
```

#### Python (cachetools)

```python
from cachetools import TTLCache, cached
from functools import lru_cache

# TTL cache
cache = TTLCache(maxsize=1000, ttl=300)

def get_user(user_id):
    if user_id in cache:
        return cache[user_id]

    user = fetch_from_db(user_id)
    cache[user_id] = user
    return user

# Decorator approach
@cached(cache=TTLCache(maxsize=100, ttl=300))
def get_expensive_data(key):
    return compute_expensive_data(key)

# LRU cache (no TTL, size-limited)
@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

### Memory Cache Limitations

| Limitation | Mitigation |
|------------|------------|
| Lost on restart | Use Redis for persistence |
| Not shared between servers | Use Redis for distributed |
| Memory pressure | Set maxsize, use LRU eviction |
| No TTL precision | Acceptable for most use cases |

---

## Redis Caching

### When to Use

- Multi-server deployments (shared state)
- Data persistence across restarts
- Complex data structures (lists, sets, hashes)
- Pub/sub patterns
- Session storage

### Implementation

#### Node.js (ioredis)

```javascript
import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

// String operations
await redis.set('user:123', JSON.stringify(user), 'EX', 300);
const user = JSON.parse(await redis.get('user:123'));

// Hash operations (better for objects)
await redis.hset('user:123', {
  name: user.name,
  email: user.email
});
await redis.expire('user:123', 300);
const userData = await redis.hgetall('user:123');

// Get-or-set pattern
async function cachedFetch(key, ttl, fetchFn) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchFn();
  await redis.set(key, JSON.stringify(data), 'EX', ttl);
  return data;
}
```

#### Python (redis-py)

```python
import redis
import json

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# String operations
r.setex('user:123', 300, json.dumps(user))
user = json.loads(r.get('user:123'))

# Hash operations
r.hset('user:123', mapping={'name': user['name'], 'email': user['email']})
r.expire('user:123', 300)
user_data = r.hgetall('user:123')

# Pipeline for multiple operations
with r.pipeline() as pipe:
    pipe.get('key1')
    pipe.get('key2')
    pipe.get('key3')
    results = pipe.execute()
```

### Redis Data Structures

| Structure | Use Case | Example |
|-----------|----------|---------|
| String | Simple values, JSON | `SET user:123 '{"name":"John"}'` |
| Hash | Object fields | `HSET user:123 name John email john@example.com` |
| List | Queues, feeds | `LPUSH notifications:123 "New message"` |
| Set | Unique values, tags | `SADD user:123:roles admin editor` |
| Sorted Set | Leaderboards, rankings | `ZADD leaderboard 100 user:123` |

---

## CDN Caching

### When to Use

- Static assets (images, CSS, JS)
- Geographically distributed users
- High-traffic cacheable content
- DDoS protection

### Cache-Control Headers

```
Cache-Control: public, max-age=31536000, immutable
               │       │                └─ Never revalidate
               │       └─ Cache for 1 year
               └─ Can be cached by CDN
```

| Directive | Meaning |
|-----------|---------|
| `public` | CDN/proxies can cache |
| `private` | Only browser can cache |
| `max-age=N` | Cache for N seconds |
| `s-maxage=N` | CDN-specific max-age |
| `no-cache` | Always revalidate |
| `no-store` | Never cache |
| `immutable` | Never changes (use with versioned URLs) |

### Implementation by Asset Type

```javascript
// Express.js example
app.use('/assets', express.static('public', {
  maxAge: '1y',
  immutable: true
}));

// Dynamic content - short cache
app.get('/api/products', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  res.json(products);
});

// Private data - no CDN cache
app.get('/api/user/profile', (req, res) => {
  res.set('Cache-Control', 'private, max-age=60');
  res.json(profile);
});
```

### CDN Cache Invalidation

| Method | Speed | Use Case |
|--------|-------|----------|
| Time-based (TTL) | Automatic | Acceptable staleness |
| Cache purge | Minutes | Emergency updates |
| Versioned URLs | Instant | Immutable assets |
| Surrogate keys | Fast | Selective invalidation |

```html
<!-- Versioned URLs - best practice -->
<link rel="stylesheet" href="/css/app.a1b2c3d4.css">
<script src="/js/bundle.e5f6g7h8.js"></script>
```

---

## HTTP Caching Headers

### ETag (Entity Tag)

```
Response: ETag: "abc123"

Subsequent Request: If-None-Match: "abc123"
Response: 304 Not Modified (if unchanged)
```

#### Implementation

```javascript
import crypto from 'crypto';

app.get('/api/data', (req, res) => {
  const data = getData();
  const etag = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');

  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }

  res.set('ETag', etag);
  res.json(data);
});
```

### Last-Modified

```
Response: Last-Modified: Wed, 15 Jan 2026 10:30:00 GMT

Subsequent Request: If-Modified-Since: Wed, 15 Jan 2026 10:30:00 GMT
Response: 304 Not Modified (if unchanged)
```

### Comparison

| Header | Best For | Precision |
|--------|----------|-----------|
| ETag | Content hash | Exact |
| Last-Modified | File timestamps | Second |

---

## Cache Invalidation Patterns

### 1. Time-Based (TTL)

Simplest approach - data expires after set time.

```javascript
await redis.set('product:123', JSON.stringify(product), 'EX', 300);
```

**Pros**: Simple, predictable
**Cons**: Stale data during TTL window

### 2. Event-Based

Invalidate on data change.

```javascript
async function updateProduct(productId, data) {
  await db.products.update(productId, data);
  await redis.del(`product:${productId}`);  // Invalidate cache
  await redis.del('products:list');          // Invalidate list
}
```

**Pros**: Always fresh
**Cons**: Complex dependency tracking

### 3. Write-Through

Write to cache and database simultaneously.

```javascript
async function updateProduct(productId, data) {
  const [dbResult] = await Promise.all([
    db.products.update(productId, data),
    redis.set(`product:${productId}`, JSON.stringify(data), 'EX', 300)
  ]);
  return dbResult;
}
```

**Pros**: Cache always warm
**Cons**: Write latency, consistency complexity

### 4. Cache-Aside (Lazy Loading)

Load into cache on first read.

```javascript
async function getProduct(productId) {
  const cached = await redis.get(`product:${productId}`);
  if (cached) return JSON.parse(cached);

  const product = await db.products.findById(productId);
  await redis.set(`product:${productId}`, JSON.stringify(product), 'EX', 300);
  return product;
}
```

**Pros**: Only caches accessed data
**Cons**: Cache miss on first request

---

## Cache Warming

Pre-populate cache before traffic hits.

```javascript
async function warmCache() {
  // Popular products
  const popular = await db.products.find({ featured: true });
  await Promise.all(
    popular.map(p =>
      redis.set(`product:${p.id}`, JSON.stringify(p), 'EX', 3600)
    )
  );

  // Category lists
  const categories = await db.categories.findAll();
  await redis.set('categories:all', JSON.stringify(categories), 'EX', 3600);

  console.log(`Warmed cache with ${popular.length} products`);
}

// Run on deployment or scheduled
warmCache();
```

---

## Quick Reference

### TTL Guidelines

| Data Type | Suggested TTL | Rationale |
|-----------|---------------|-----------|
| Static assets | 1 year | Use versioned URLs |
| API config | 5-15 min | Balance freshness vs load |
| User sessions | 30 min | Security vs convenience |
| Search results | 15 min | Index change frequency |
| Rate limits | 1 min | Short window |
| Feature flags | 1 min | Quick propagation |

### Cache Key Patterns

```
# Pattern: {type}:{id}:{variant}

user:123
product:456
product:456:summary
api:products:list:page:1
api:products:list:category:electronics:page:1
search:query:laptop:page:1
rate:user:123:minute
```

### Checklist

```
[ ] Identified cacheable data
[ ] Selected appropriate layer (memory/Redis/CDN)
[ ] Set TTL based on freshness needs
[ ] Planned invalidation strategy
[ ] Added cache key prefix/namespace
[ ] Handled cache miss gracefully
[ ] Considered thundering herd (use locks/coalescing)
[ ] Set up cache hit/miss monitoring
```
