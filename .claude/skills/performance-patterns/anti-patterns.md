# Performance Anti-Patterns

This document covers common performance anti-patterns across database, network, and frontend layers, along with detection methods and fixes.

## Overview

| Category | Anti-Pattern | Risk Level |
|----------|--------------|------------|
| Database | N+1 Query | High |
| Database | Missing Index | Medium |
| Database | Unbounded Query | High |
| Database | SELECT * | Low |
| Database | Cross-Join | High |
| Network | Sync I/O in Loop | High |
| Network | No Connection Pooling | Medium |
| Frontend | Blocking Scripts | High |
| Frontend | Unoptimized Images | Medium |
| Frontend | Layout Thrashing | High |

---

## Database Anti-Patterns

### N+1 Query Problem

**Risk Level**: High
**Impact**: Query count grows linearly with data size

#### Description

Executing one query to get a list, then N additional queries to get related data for each item.

#### Detection

```sql
-- Log shows pattern like:
SELECT * FROM orders WHERE user_id = 1;
SELECT * FROM products WHERE id = 101;
SELECT * FROM products WHERE id = 102;
SELECT * FROM products WHERE id = 103;
-- ... repeated for each order item
```

#### Bad Pattern

```python
# Python/SQLAlchemy - N+1 anti-pattern
orders = session.query(Order).filter_by(user_id=user_id).all()
for order in orders:
    # Each access triggers a separate query
    print(order.items)  # N queries!
```

```javascript
// Node.js/Sequelize - N+1 anti-pattern
const orders = await Order.findAll({ where: { userId } });
for (const order of orders) {
  const items = await order.getItems(); // N queries!
}
```

#### Good Pattern

```python
# Python/SQLAlchemy - Eager loading
orders = session.query(Order)\
    .options(joinedload(Order.items))\
    .filter_by(user_id=user_id).all()
```

```javascript
// Node.js/Sequelize - Include related data
const orders = await Order.findAll({
  where: { userId },
  include: [{ model: Item }]  // Single query with JOIN
});
```

```sql
-- Raw SQL: Use JOIN instead of separate queries
SELECT o.*, i.*
FROM orders o
LEFT JOIN items i ON i.order_id = o.id
WHERE o.user_id = ?;
```

---

### Missing Index

**Risk Level**: Medium
**Impact**: Full table scans instead of index seeks

#### Description

Querying on columns without indexes causes the database to scan every row.

#### Detection

```sql
-- PostgreSQL: Identify slow queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check for sequential scans
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
-- Look for "Seq Scan" in output
```

#### Bad Pattern

```sql
-- Table without index
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),  -- No index!
  created_at TIMESTAMP
);

-- This query scans every row
SELECT * FROM users WHERE email = 'test@example.com';
```

#### Good Pattern

```sql
-- Add index on frequently queried columns
CREATE INDEX idx_users_email ON users(email);

-- Composite index for multi-column queries
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Partial index for specific conditions
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';
```

#### Index Selection Guidelines

| Query Pattern | Index Type |
|---------------|------------|
| `WHERE col = ?` | B-tree (default) |
| `WHERE col LIKE 'prefix%'` | B-tree |
| `WHERE col @> ?` (JSON/Array) | GIN |
| `WHERE col && ?` (overlap) | GIN |
| Full-text search | GIN/GiST |
| Geospatial | GiST |

---

### Unbounded Query

**Risk Level**: High
**Impact**: Memory exhaustion, timeout, client overload

#### Description

Queries without LIMIT can return millions of rows, overwhelming memory and network.

#### Detection

```sql
-- Look for queries without LIMIT
SELECT * FROM large_table WHERE status = 'active';
-- Could return millions of rows!
```

#### Bad Pattern

```python
# Returns ALL matching records
users = User.objects.filter(status='active')
# If there are 1M active users, this crashes
```

```javascript
// No limit on results
const orders = await Order.findAll({ where: { status: 'pending' } });
```

#### Good Pattern

```python
# Always paginate
from django.core.paginator import Paginator

users = User.objects.filter(status='active')
paginator = Paginator(users, 100)  # 100 per page
page = paginator.page(page_number)
```

```javascript
// Use limit and offset
const orders = await Order.findAll({
  where: { status: 'pending' },
  limit: 100,
  offset: (page - 1) * 100
});
```

```sql
-- Cursor-based pagination (better for large datasets)
SELECT * FROM orders
WHERE id > :last_seen_id
ORDER BY id
LIMIT 100;
```

---

### SELECT * Anti-Pattern

**Risk Level**: Low
**Impact**: Unnecessary data transfer, index bypass

#### Description

Fetching all columns when only specific ones are needed wastes bandwidth and may prevent index-only scans.

#### Bad Pattern

```sql
-- Fetches all 50 columns
SELECT * FROM users WHERE id = 1;
```

#### Good Pattern

```sql
-- Only fetch needed columns
SELECT id, email, name FROM users WHERE id = 1;
```

```python
# Django: Use values() or only()
users = User.objects.filter(active=True).values('id', 'email')

# SQLAlchemy: Specify columns
users = session.query(User.id, User.email).filter_by(active=True)
```

---

### Cross-Join (Cartesian Product)

**Risk Level**: High
**Impact**: Explosive row multiplication

#### Description

Missing or incorrect JOIN conditions create a Cartesian product where every row in table A is matched with every row in table B.

#### Detection

```sql
-- 1000 users × 1000 orders = 1,000,000 rows!
SELECT * FROM users, orders;  -- Missing JOIN condition
```

#### Bad Pattern

```sql
-- Implicit join without condition
SELECT * FROM users, orders WHERE users.name LIKE '%John%';
-- This is a cross-join filtered AFTER the cartesian product
```

#### Good Pattern

```sql
-- Explicit JOIN with condition
SELECT u.*, o.*
FROM users u
INNER JOIN orders o ON o.user_id = u.id
WHERE u.name LIKE '%John%';
```

---

## Network Anti-Patterns

### Sync I/O in Loop

**Risk Level**: High
**Impact**: Sequential waiting, wasted time

#### Description

Making synchronous network calls inside a loop causes each call to wait for the previous one.

#### Bad Pattern

```javascript
// Sequential API calls - 10 items = 10 × latency
for (const userId of userIds) {
  const user = await fetchUser(userId);  // Waits each time
  results.push(user);
}
```

```python
# Python sync I/O in loop
for url in urls:
    response = requests.get(url)  # Blocks on each
    results.append(response.json())
```

#### Good Pattern

```javascript
// Parallel API calls
const results = await Promise.all(
  userIds.map(userId => fetchUser(userId))
);

// With concurrency limit
import pLimit from 'p-limit';
const limit = pLimit(5);  // Max 5 concurrent
const results = await Promise.all(
  userIds.map(userId => limit(() => fetchUser(userId)))
);
```

```python
# Python async I/O
import asyncio
import aiohttp

async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        return await asyncio.gather(*tasks)
```

---

### No Connection Pooling

**Risk Level**: Medium
**Impact**: Connection overhead, resource exhaustion

#### Description

Creating new database connections for each request is expensive (TCP handshake, authentication, etc.).

#### Bad Pattern

```python
# New connection for each request
def get_user(user_id):
    conn = psycopg2.connect(...)  # Expensive!
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    conn.close()
    return result
```

#### Good Pattern

```python
# Use connection pool
from psycopg2 import pool

connection_pool = pool.ThreadedConnectionPool(
    minconn=5,
    maxconn=20,
    host='localhost',
    database='mydb'
)

def get_user(user_id):
    conn = connection_pool.getconn()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        return cursor.fetchone()
    finally:
        connection_pool.putconn(conn)
```

#### Pool Sizing Guidelines

| Metric | Formula |
|--------|---------|
| Min connections | Number of always-active workers |
| Max connections | CPU cores × 2 + disk spindles |
| Connection timeout | 30 seconds (for acquisition) |
| Idle timeout | 10 minutes (return unused) |

---

## Frontend Anti-Patterns

### Blocking Scripts

**Risk Level**: High
**Impact**: Delays page rendering, poor LCP/INP

#### Description

Scripts in `<head>` without `async` or `defer` block HTML parsing.

#### Bad Pattern

```html
<head>
  <script src="analytics.js"></script>  <!-- Blocks parsing -->
  <script src="chat-widget.js"></script>  <!-- Blocks parsing -->
</head>
```

#### Good Pattern

```html
<head>
  <!-- Defer scripts that need DOM -->
  <script src="app.js" defer></script>

  <!-- Async for independent scripts -->
  <script src="analytics.js" async></script>
</head>

<!-- Or load at end of body -->
<body>
  <!-- ... content ... -->
  <script src="chat-widget.js"></script>
</body>
```

| Attribute | Behavior |
|-----------|----------|
| None | Blocks parsing, executes immediately |
| `async` | Downloads in parallel, executes when ready (order not guaranteed) |
| `defer` | Downloads in parallel, executes after parsing (order preserved) |

---

### Unoptimized Images

**Risk Level**: Medium
**Impact**: Slow LCP, wasted bandwidth

#### Bad Pattern

```html
<!-- 5MB PNG when 50KB WebP would work -->
<img src="hero-image.png" alt="Hero">

<!-- Full-size image for thumbnail -->
<img src="product-2000x2000.jpg" width="200" height="200" alt="Product">
```

#### Good Pattern

```html
<!-- Modern formats with fallback -->
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero" width="1200" height="800">
</picture>

<!-- Responsive images -->
<img
  src="product-400.jpg"
  srcset="product-200.jpg 200w, product-400.jpg 400w, product-800.jpg 800w"
  sizes="(max-width: 600px) 200px, 400px"
  alt="Product"
  loading="lazy"
>
```

---

### Layout Thrashing

**Risk Level**: High
**Impact**: Janky animations, poor INP

#### Description

Reading and writing layout properties in alternating pattern forces the browser to recalculate layout multiple times.

#### Bad Pattern

```javascript
// Forces layout recalculation on each iteration
elements.forEach(el => {
  const height = el.offsetHeight;  // Read (triggers layout)
  el.style.height = height + 10 + 'px';  // Write (invalidates layout)
});
```

#### Good Pattern

```javascript
// Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight);  // All reads

elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px';  // All writes
});
```

#### Layout-Triggering Properties

**Reads that trigger layout**:
- `offsetTop/Left/Width/Height`
- `scrollTop/Left/Width/Height`
- `clientTop/Left/Width/Height`
- `getComputedStyle()`
- `getBoundingClientRect()`

**Writes that invalidate layout**:
- `width`, `height`, `margin`, `padding`
- `top`, `left`, `right`, `bottom`
- `font-size`, `font-family`
- Any property that affects element size/position

---

## Quick Reference Table

| Anti-Pattern | Detection | Fix |
|--------------|-----------|-----|
| N+1 Query | Query count grows with data | Eager/batch loading, JOINs |
| Missing Index | EXPLAIN shows Seq Scan | Add index on WHERE columns |
| Unbounded Query | No LIMIT clause | Add pagination |
| SELECT * | Fetching unused columns | Specify needed columns |
| Cross-Join | Cartesian product | Add proper JOIN condition |
| Sync I/O Loop | Sequential network calls | Promise.all, async gather |
| No Pooling | Connection per request | Use connection pool |
| Blocking Scripts | No defer/async | Add defer or async attribute |
| Unoptimized Images | Large file sizes | WebP/AVIF, responsive images |
| Layout Thrashing | Read-write alternation | Batch reads, then writes |
