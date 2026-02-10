# TDD Functional Parity Patterns

TDD strategies specifically for migration scenarios, focusing on functional parity validation between source and target systems. Extends standard TDD with a CAPTURE phase for recording baseline behavior.

## Overview

**Purpose**: Ensure target system behavior matches source system during migrations.

**Core Concept**: Record existing behavior as "golden files" before migration, then use those recordings to validate the new implementation.

**Relationship to tdd-workflow**: This skill extends the patterns in `tdd-workflow/SKILL.md` for migration-specific scenarios. For core TDD principles (RED-GREEN-REFACTOR), refer to that skill.

---

## Migration TDD Workflow

### Standard vs Migration TDD

| Standard TDD | Migration TDD |
|-------------|---------------|
| RED → GREEN → REFACTOR | CAPTURE → RED → GREEN → COMPARE |
| Tests define expected behavior | Captured behavior defines expected behavior |
| Write tests from requirements | Generate tests from source system |
| Focus: New functionality | Focus: Parity with existing |

### Phase Definitions

| Phase | Purpose | Output | Duration |
|-------|---------|--------|----------|
| **CAPTURE** | Record source system behavior | Golden files, API snapshots, data samples | 1-2 days |
| **RED** | Write tests that compare against golden files | Failing tests for target system | Hours |
| **GREEN** | Implement target to match captured behavior | Passing tests | Days-weeks |
| **COMPARE** | Validate parity under realistic conditions | Performance + behavior validation | Hours-days |

### When to Use Migration TDD

| Use Migration TDD When | Use Standard TDD When |
|------------------------|----------------------|
| Replacing existing system | Building new features |
| Behavior is the specification | Requirements are documented |
| Source system is authoritative | Source system is deprecated |
| Risk tolerance is low | Innovation is expected |

### Workflow Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                   MIGRATION TDD WORKFLOW                       │
│                                                               │
│  1. CAPTURE: Record source system                             │
│     ├─ API responses → golden/*.json                         │
│     ├─ Database state → snapshots/*.sql                      │
│     └─ Side effects → event-logs/*.json                      │
│                        ↓                                      │
│  2. RED: Write tests against golden files                     │
│     ├─ Import golden file expectations                       │
│     ├─ Call target system                                    │
│     └─ Assert structural match (ignore dynamic fields)       │
│                        ↓                                      │
│  3. GREEN: Implement target to match                          │
│     ├─ Minimal implementation first                          │
│     ├─ Run tests frequently                                  │
│     └─ Fix mismatches iteratively                            │
│                        ↓                                      │
│  4. COMPARE: Validate under load                              │
│     ├─ Run both systems in parallel                          │
│     ├─ Compare responses in real-time                        │
│     └─ Measure performance delta                             │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## API Response Comparison Patterns

### Golden File Capture

Record source system responses for later comparison:

```javascript
// golden-capture.js - Run against source system BEFORE migration

const fs = require('fs').promises;
const path = require('path');

/**
 * Capture API responses as golden files for parity testing
 */
async function captureGoldenFile(sourceAPI, endpoint, params, name) {
  const response = await sourceAPI.request(endpoint, params);

  const golden = {
    captured_at: new Date().toISOString(),
    endpoint,
    params,
    response: response.data,
    status: response.status,
    headers: filterHeaders(response.headers)
  };

  const goldenPath = path.join('golden', `${name}.json`);
  await fs.writeFile(goldenPath, JSON.stringify(golden, null, 2));

  console.log(`Captured: ${goldenPath}`);
  return golden;
}

/**
 * Filter headers to remove dynamic values
 */
function filterHeaders(headers) {
  const keep = ['content-type', 'cache-control', 'x-rate-limit'];
  return Object.fromEntries(
    Object.entries(headers).filter(([k]) => keep.includes(k.toLowerCase()))
  );
}

// Usage
await captureGoldenFile(sourceAPI, '/users', { page: 1 }, 'users-list');
await captureGoldenFile(sourceAPI, '/users/123', {}, 'user-detail');
await captureGoldenFile(sourceAPI, '/users/123/orders', {}, 'user-orders');
```

### Structural Matching with Dynamic Field Ignoring

Compare responses while ignoring fields that naturally differ:

```javascript
// structural-matcher.js

/**
 * Compare two objects structurally, ignoring specified fields
 * @param {Object} actual - Response from target system
 * @param {Object} expected - Golden file response
 * @param {Object} options - Comparison options
 * @returns {Object} - Match result with details
 */
function structuralMatch(actual, expected, options = {}) {
  const {
    ignoreFields = ['id', 'createdAt', 'updatedAt', 'timestamp'],
    ignorePaths = [],
    tolerances = {} // { 'price': 0.01 } for numeric tolerance
  } = options;

  const differences = [];

  function compare(a, b, path = '') {
    // Check if path should be ignored
    if (ignorePaths.includes(path)) return;

    // Check if field should be ignored
    const fieldName = path.split('.').pop();
    if (ignoreFields.includes(fieldName)) return;

    // Handle null/undefined
    if (a === null || a === undefined || b === null || b === undefined) {
      if (a !== b) {
        differences.push({ path, actual: a, expected: b, type: 'null_mismatch' });
      }
      return;
    }

    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        differences.push({
          path,
          actual: a.length,
          expected: b.length,
          type: 'array_length'
        });
      }
      const minLen = Math.min(a.length, b.length);
      for (let i = 0; i < minLen; i++) {
        compare(a[i], b[i], `${path}[${i}]`);
      }
      return;
    }

    // Handle objects
    if (typeof a === 'object' && typeof b === 'object') {
      const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
      for (const key of allKeys) {
        compare(a[key], b[key], path ? `${path}.${key}` : key);
      }
      return;
    }

    // Handle numbers with tolerance
    if (typeof a === 'number' && typeof b === 'number') {
      const tolerance = tolerances[fieldName] || 0;
      if (Math.abs(a - b) > tolerance) {
        differences.push({ path, actual: a, expected: b, type: 'number_mismatch' });
      }
      return;
    }

    // Direct comparison
    if (a !== b) {
      differences.push({ path, actual: a, expected: b, type: 'value_mismatch' });
    }
  }

  compare(actual, expected);

  return {
    matches: differences.length === 0,
    differences,
    summary: differences.length === 0
      ? 'Perfect match'
      : `${differences.length} difference(s) found`
  };
}

module.exports = { structuralMatch };
```

### Parity Test Example

```javascript
// api-parity.test.js

const { structuralMatch } = require('./structural-matcher');
const fs = require('fs').promises;

describe('API Parity Tests', () => {
  let targetAPI;

  beforeAll(async () => {
    targetAPI = await createTargetAPIClient();
  });

  describe('User Endpoints', () => {
    it('GET /users should match golden file structure', async () => {
      // Load golden file (captured from source system)
      const golden = JSON.parse(
        await fs.readFile('golden/users-list.json', 'utf-8')
      );

      // Call target system with same params
      const actual = await targetAPI.get('/users', { params: golden.params });

      // Structural comparison
      const result = structuralMatch(actual.data, golden.response, {
        ignoreFields: ['id', 'createdAt', 'updatedAt', 'lastLoginAt'],
        ignorePaths: ['metadata.requestId', 'pagination.cursor'],
        tolerances: { 'balance': 0.01 }
      });

      expect(result.matches).toBe(true);
      if (!result.matches) {
        console.log('Differences:', JSON.stringify(result.differences, null, 2));
      }
    });

    it('GET /users/:id should return same user structure', async () => {
      const golden = JSON.parse(
        await fs.readFile('golden/user-detail.json', 'utf-8')
      );

      const actual = await targetAPI.get(`/users/${golden.params.id || 123}`);

      const result = structuralMatch(actual.data, golden.response, {
        ignoreFields: ['id', 'createdAt', 'updatedAt']
      });

      expect(result.matches).toBe(true);
    });
  });
});
```

---

## Data Validation Patterns

### Count Reconciliation

Verify record counts match between source and target:

```javascript
// data-reconciliation.test.js

describe('Data Migration Reconciliation', () => {
  let sourceDB, targetDB;

  beforeAll(async () => {
    sourceDB = await connectSourceDB();
    targetDB = await connectTargetDB();
  });

  describe('Record Counts', () => {
    it('should have same user count', async () => {
      const sourceCount = await sourceDB.query(
        'SELECT COUNT(*) as count FROM users'
      );
      const targetCount = await targetDB.collection('users').countDocuments();

      expect(targetCount).toBe(sourceCount[0].count);
    });

    it('should have same order count', async () => {
      const sourceCount = await sourceDB.query(
        'SELECT COUNT(*) as count FROM orders WHERE status != "deleted"'
      );
      const targetCount = await targetDB.collection('orders').countDocuments({
        status: { $ne: 'deleted' }
      });

      expect(targetCount).toBe(sourceCount[0].count);
    });

    it('should have same active subscription count', async () => {
      const sourceCount = await sourceDB.query(
        'SELECT COUNT(*) as count FROM subscriptions WHERE active = true'
      );
      const targetCount = await targetDB.collection('subscriptions').countDocuments({
        active: true
      });

      expect(targetCount).toBe(sourceCount[0].count);
    });
  });
});
```

### Schema Transformation Validation

Verify field mappings are correct after transformation:

```javascript
// schema-transformation.test.js

describe('Schema Transformation', () => {
  const testUserIds = ['user-001', 'user-002', 'user-003'];

  describe('User Schema Mapping', () => {
    test.each(testUserIds)('user %s fields should map correctly', async (userId) => {
      // Get from source (SQL)
      const sourceUser = await sourceDB.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      // Get from target (MongoDB)
      const targetUser = await targetDB.collection('users').findOne({
        legacy_id: userId
      });

      // Verify direct mappings
      expect(targetUser.email).toBe(sourceUser.email);
      expect(targetUser.username).toBe(sourceUser.username);
      expect(targetUser.status).toBe(sourceUser.status);

      // Verify transformed mappings (snake_case → camelCase)
      expect(targetUser.firstName).toBe(sourceUser.first_name);
      expect(targetUser.lastName).toBe(sourceUser.last_name);
      expect(targetUser.phoneNumber).toBe(sourceUser.phone_number);

      // Verify nested object transformation
      expect(targetUser.profile.bio).toBe(sourceUser.bio);
      expect(targetUser.profile.avatarUrl).toBe(sourceUser.avatar_url);

      // Verify JSON field expansion
      const sourcePrefs = JSON.parse(sourceUser.preferences || '{}');
      expect(targetUser.preferences.theme).toBe(sourcePrefs.theme);
      expect(targetUser.preferences.notifications).toBe(sourcePrefs.notifications);
    });
  });
});
```

### Data Integrity Checksums

Verify data integrity across migration:

```javascript
// data-integrity.test.js

const crypto = require('crypto');

describe('Data Integrity', () => {
  it('should preserve financial data integrity', async () => {
    // Sample 1000 random orders
    const sampleIds = await sourceDB.query(
      'SELECT id FROM orders ORDER BY RANDOM() LIMIT 1000'
    );

    for (const { id } of sampleIds) {
      const sourceOrder = await sourceDB.query(
        'SELECT total, tax, discount, subtotal FROM orders WHERE id = ?',
        [id]
      );

      const targetOrder = await targetDB.collection('orders').findOne({
        legacy_id: id
      });

      // Financial fields must match exactly (use string comparison for decimals)
      expect(targetOrder.total.toString()).toBe(sourceOrder.total.toString());
      expect(targetOrder.tax.toString()).toBe(sourceOrder.tax.toString());
      expect(targetOrder.discount.toString()).toBe(sourceOrder.discount.toString());

      // Verify calculated field integrity
      const expectedSubtotal =
        parseFloat(targetOrder.total) -
        parseFloat(targetOrder.tax) +
        parseFloat(targetOrder.discount);

      expect(Math.abs(parseFloat(targetOrder.subtotal) - expectedSubtotal)).toBeLessThan(0.01);
    }
  });

  it('should preserve content hash integrity', async () => {
    const sampleDocs = await sourceDB.query(
      'SELECT id, content FROM documents LIMIT 100'
    );

    for (const { id, content } of sampleDocs) {
      const targetDoc = await targetDB.collection('documents').findOne({
        legacy_id: id
      });

      const sourceHash = crypto.createHash('sha256').update(content).digest('hex');
      const targetHash = crypto.createHash('sha256').update(targetDoc.content).digest('hex');

      expect(targetHash).toBe(sourceHash);
    }
  });
});
```

---

## Behavioral Testing Patterns

### Side Effect Verification

Ensure the target system produces the same side effects as the source:

```javascript
// side-effects.test.js

describe('Side Effect Parity', () => {
  let eventCapture;

  beforeEach(() => {
    eventCapture = [];
    // Hook into event system
    targetEventBus.on('*', (event) => eventCapture.push(event));
  });

  describe('Order Creation Side Effects', () => {
    it('should emit same events as source system', async () => {
      // Golden file contains expected events from source system
      const golden = JSON.parse(
        await fs.readFile('golden/order-create-events.json', 'utf-8')
      );

      // Perform action on target system
      await targetAPI.post('/orders', golden.request);

      // Wait for async events
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify event types match
      const actualEventTypes = eventCapture.map(e => e.type);
      const expectedEventTypes = golden.events.map(e => e.type);

      expect(actualEventTypes).toEqual(expectedEventTypes);

      // Verify event payloads (with ignored fields)
      for (let i = 0; i < golden.events.length; i++) {
        const result = structuralMatch(
          eventCapture[i].payload,
          golden.events[i].payload,
          { ignoreFields: ['id', 'timestamp', 'eventId'] }
        );
        expect(result.matches).toBe(true);
      }
    });
  });

  describe('Notification Side Effects', () => {
    it('should send same notifications as source', async () => {
      const notificationCapture = [];
      notificationService.onSend((notification) => {
        notificationCapture.push(notification);
      });

      const golden = JSON.parse(
        await fs.readFile('golden/user-signup-notifications.json', 'utf-8')
      );

      await targetAPI.post('/users/signup', golden.request);
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(notificationCapture.length).toBe(golden.notifications.length);

      for (let i = 0; i < golden.notifications.length; i++) {
        expect(notificationCapture[i].type).toBe(golden.notifications[i].type);
        expect(notificationCapture[i].recipient).toBe(golden.notifications[i].recipient);
        expect(notificationCapture[i].template).toBe(golden.notifications[i].template);
      }
    });
  });
});
```

### State Change Tracking

Verify state transitions match between systems:

```javascript
// state-tracking.test.js

describe('State Machine Parity', () => {
  describe('Order Status Transitions', () => {
    it('should follow same state machine as source', async () => {
      const golden = JSON.parse(
        await fs.readFile('golden/order-state-transitions.json', 'utf-8')
      );

      // Create order
      const order = await targetAPI.post('/orders', golden.initialOrder);
      const orderId = order.data.id;

      // Apply each transition and verify state
      for (const transition of golden.transitions) {
        await targetAPI.post(`/orders/${orderId}/${transition.action}`, transition.payload);

        const updatedOrder = await targetAPI.get(`/orders/${orderId}`);
        expect(updatedOrder.data.status).toBe(transition.expectedState);
      }
    });

    it('should reject invalid transitions', async () => {
      const golden = JSON.parse(
        await fs.readFile('golden/order-invalid-transitions.json', 'utf-8')
      );

      for (const scenario of golden.scenarios) {
        const order = await targetAPI.post('/orders', scenario.order);

        // Attempt invalid transition
        try {
          await targetAPI.post(`/orders/${order.data.id}/${scenario.invalidAction}`);
          fail('Should have rejected invalid transition');
        } catch (error) {
          expect(error.response.status).toBe(scenario.expectedStatus);
          expect(error.response.data.error).toMatch(scenario.expectedError);
        }
      }
    });
  });
});
```

### Event Sequence Validation

Ensure events occur in the correct order:

```javascript
// event-sequence.test.js

describe('Event Sequence Parity', () => {
  it('checkout flow should emit events in correct order', async () => {
    const golden = JSON.parse(
      await fs.readFile('golden/checkout-event-sequence.json', 'utf-8')
    );

    const events = [];
    const timestampedCapture = (event) => {
      events.push({
        type: event.type,
        timestamp: Date.now(),
        index: events.length
      });
    };

    targetEventBus.on('*', timestampedCapture);

    // Execute checkout flow
    await targetAPI.post('/cart/checkout', golden.checkoutRequest);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verify sequence order
    const actualSequence = events.map(e => e.type);
    const expectedSequence = golden.expectedSequence;

    expect(actualSequence).toEqual(expectedSequence);

    // Verify timing constraints
    for (let i = 1; i < events.length; i++) {
      const gap = events[i].timestamp - events[i-1].timestamp;
      const expectedGap = golden.timingConstraints[i-1];

      if (expectedGap.maxGap) {
        expect(gap).toBeLessThan(expectedGap.maxGap);
      }
      if (expectedGap.minGap) {
        expect(gap).toBeGreaterThan(expectedGap.minGap);
      }
    }
  });
});
```

---

## Golden File Management

### Directory Structure

```
project/
├── golden/
│   ├── api/
│   │   ├── users-list.json
│   │   ├── user-detail.json
│   │   └── orders-list.json
│   ├── events/
│   │   ├── order-create-events.json
│   │   └── user-signup-events.json
│   ├── data/
│   │   ├── user-sample.json
│   │   └── order-sample.json
│   └── README.md              # Documents capture date and version
├── tests/
│   └── parity/
│       ├── api-parity.test.js
│       ├── data-parity.test.js
│       └── event-parity.test.js
└── scripts/
    ├── capture-golden.js      # Run against source before migration
    └── update-golden.js       # Intentional update after review
```

### Golden File Metadata

Include capture context in each golden file:

```json
{
  "_golden_metadata": {
    "captured_at": "2026-01-15T10:30:00Z",
    "source_version": "v2.3.1",
    "source_environment": "production-replica",
    "captured_by": "migration-team",
    "purpose": "API parity validation for Java→Node.js migration",
    "review_status": "approved",
    "last_reviewed": "2026-01-14T16:00:00Z"
  },
  "endpoint": "/api/v1/users",
  "params": { "page": 1, "limit": 20 },
  "response": {
    "users": [...],
    "pagination": {...}
  }
}
```

### Update Workflow

```bash
# 1. Capture initial golden files (BEFORE migration starts)
npm run capture:golden -- --env production-replica --output golden/

# 2. Review captured files
git diff golden/

# 3. Commit as baseline
git add golden/
git commit -m "Capture golden files for v2.3.1 migration baseline"

# 4. Run parity tests during migration
npm run test:parity

# 5. If intentional changes are expected, update with review
npm run golden:update -- --file golden/api/users-list.json --reason "Added new field"
git diff golden/api/users-list.json
# Review changes before committing

# 6. After migration complete, archive golden files
git mv golden/ golden-v2.3.1-migration/
git commit -m "Archive golden files after successful migration"
```

### CI Integration

```yaml
# .github/workflows/parity-tests.yml
name: Parity Tests

on:
  push:
    branches: [migration/*]
  pull_request:
    branches: [main]

jobs:
  parity:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Start target system
        run: docker-compose up -d target-api target-db

      - name: Wait for services
        run: npm run wait-for-services

      - name: Run parity tests
        run: npm run test:parity -- --ci --coverage

      - name: Upload parity report
        uses: actions/upload-artifact@v3
        with:
          name: parity-report
          path: coverage/parity-report.html
```

---

## Performance Parity Testing

### Latency Comparison

```javascript
// performance-parity.test.js

describe('Performance Parity', () => {
  const LATENCY_TOLERANCE = 1.2; // Target can be up to 20% slower
  const SAMPLE_SIZE = 100;

  it('GET /users latency should be within tolerance', async () => {
    const golden = JSON.parse(
      await fs.readFile('golden/performance/users-list-latency.json', 'utf-8')
    );

    const measurements = [];

    for (let i = 0; i < SAMPLE_SIZE; i++) {
      const start = process.hrtime.bigint();
      await targetAPI.get('/users');
      const end = process.hrtime.bigint();

      measurements.push(Number(end - start) / 1_000_000); // Convert to ms
    }

    const avgLatency = measurements.reduce((a, b) => a + b) / measurements.length;
    const p99Latency = measurements.sort((a, b) => a - b)[Math.floor(SAMPLE_SIZE * 0.99)];

    // Compare against golden baseline
    expect(avgLatency).toBeLessThan(golden.avgLatency * LATENCY_TOLERANCE);
    expect(p99Latency).toBeLessThan(golden.p99Latency * LATENCY_TOLERANCE);

    console.log(`Latency comparison:
      Source avg: ${golden.avgLatency}ms, Target avg: ${avgLatency.toFixed(2)}ms
      Source p99: ${golden.p99Latency}ms, Target p99: ${p99Latency.toFixed(2)}ms`);
  });
});
```

### Load Testing Comparison

```javascript
// load-parity.test.js

describe('Load Parity', () => {
  it('should handle same concurrent load as source', async () => {
    const golden = JSON.parse(
      await fs.readFile('golden/performance/load-test-results.json', 'utf-8')
    );

    const concurrency = golden.concurrency; // e.g., 100
    const duration = golden.duration; // e.g., 60 seconds

    const results = await runLoadTest({
      target: 'http://target-api/users',
      concurrency,
      duration,
      rampUp: 10
    });

    // Throughput should be at least 90% of source
    expect(results.requestsPerSecond).toBeGreaterThan(golden.requestsPerSecond * 0.9);

    // Error rate should not exceed source
    expect(results.errorRate).toBeLessThanOrEqual(golden.errorRate * 1.1);

    // P99 latency within tolerance
    expect(results.p99Latency).toBeLessThan(golden.p99Latency * 1.2);
  });
});
```

---

## Integration with tdd-workflow

This skill extends the patterns in the core `tdd-workflow` skill:

### Relationship

| tdd-workflow | tdd-functional-parity |
|-------------|----------------------|
| Standard RED-GREEN-REFACTOR | CAPTURE-RED-GREEN-COMPARE |
| Tests from requirements | Tests from captured behavior |
| New feature development | Migration validation |
| Unit/integration focus | Parity/comparison focus |

### When to Use Each

**Use tdd-workflow for**:
- New feature development
- Bug fixes with known expected behavior
- Refactoring existing code
- Standard test-driven development

**Use tdd-functional-parity for**:
- System migrations (tech stack changes)
- Database migrations (SQL → NoSQL, schema changes)
- API versioning (v1 → v2)
- Service consolidation/splitting

### Combining Workflows

For migrations that include new features:

1. **CAPTURE** existing behavior using tdd-functional-parity
2. **Migrate** using CAPTURE-RED-GREEN-COMPARE
3. **Add new features** using standard RED-GREEN-REFACTOR from tdd-workflow
4. **COMPARE** to ensure migration didn't break parity

### Cross-References

- **Core TDD principles**: See `tdd-workflow/SKILL.md`
- **TDD cycle workflow**: See `tdd-workflow/workflows/cycle.md`
- **Test verification**: See `develop-test-verifier.md`
- **Migration strategies**: See `application-migration-patterns/migration-strategies.md`
- **Task decomposition**: See `application-migration-patterns/task-decomposition.md`

---

## Related Patterns

- `migration-strategies.md` - Choose Strangler Fig, Big Bang, or Parallel Run
- `task-decomposition.md` - Break migration epics into tasks
- `risk-assessment-framework.md` - Score migration risk
- `tdd-workflow/SKILL.md` - Core TDD principles
