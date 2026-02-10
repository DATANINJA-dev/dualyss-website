# Tech Stack Mapping Patterns

Idiom translation guides for developers migrating between technology stacks. Each mapping provides concept translation, code examples, common pitfalls, and testing approaches.

## Overview

When migrating between tech stacks, understanding idiomatic patterns is as important as syntax translation. This guide covers three common migration paths:

1. **Java Spring Boot → Node.js Express** - Enterprise to lightweight
2. **SQL (PostgreSQL) → MongoDB** - Relational to document
3. **Python Flask → Node.js Express** - Python to JavaScript runtime

Each section follows a consistent structure: concept translation table, before/after code examples, common pitfalls with mitigations, and testing approach.

---

## Java Spring Boot → Node.js Express

### Overview & Use Cases

Spring Boot's annotation-driven architecture maps to Express's middleware and module patterns. The primary shift is from dependency injection containers to explicit module imports.

**Best for:**
- Teams wanting lighter deployment footprint
- Projects moving from monolith to microservices
- Organizations standardizing on Node.js ecosystem

### Concept Translation

| Java Spring Boot | Node.js Express | Notes |
|------------------|-----------------|-------|
| `@RestController` | Router + controller module | Organize by resource (users.router.js, users.controller.js) |
| `@Service` | Service module | Explicit require/import instead of DI |
| `@Repository` | Model/ORM module | Mongoose, TypeORM, Prisma, or pg |
| `@Autowired` | `require()` / `import` | No container, explicit dependencies |
| `@GetMapping("/path")` | `router.get('/path', handler)` | Similar routing semantics |
| `@RequestBody` | `req.body` (with body-parser) | Middleware parses JSON automatically |
| `@PathVariable` | `req.params.id` | URL parameters |
| `@RequestParam` | `req.query.key` | Query string parameters |
| `@Valid` + DTO | Joi, Zod, or class-validator | Manual validation middleware |
| Spring Security | Passport.js | OAuth, JWT, session strategies |
| Spring Data JPA | TypeORM / Prisma / Mongoose | ORM patterns transfer directly |
| `@Transactional` | Manual transaction handling | `prisma.$transaction()` or `knex.transaction()` |
| `application.properties` | `.env` + dotenv | Environment-based configuration |

### Code Examples

#### Before (Spring Boot Controller)

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody CreateUserDto dto) {
        User user = userService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
}
```

#### After (Express Router + Controller)

```javascript
// users.router.js
const express = require('express');
const router = express.Router();
const userController = require('./users.controller');
const { validateCreateUser } = require('./users.validation');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.post('/', validateCreateUser, userController.createUser);

module.exports = router;

// users.controller.js
const userService = require('./users.service');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUser, createUser };
```

#### Before (Spring Service)

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User create(CreateUserDto dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        return userRepository.save(user);
    }
}
```

#### After (Express Service with Prisma)

```javascript
// users.service.js
const prisma = require('../prisma/client');

const findAll = async () => {
  return prisma.user.findMany();
};

const findById = async (id) => {
  return prisma.user.findUnique({
    where: { id: parseInt(id, 10) }
  });
};

const create = async (data) => {
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name
    }
  });
};

module.exports = { findAll, findById, create };
```

### Common Pitfalls

1. **Missing Error Handling Middleware**
   - **Problem**: Spring has global exception handling via `@ControllerAdvice`. Express requires explicit middleware.
   - **Mitigation**: Create centralized error handler and register last:
     ```javascript
     // errorHandler.js
     const errorHandler = (err, req, res, next) => {
       console.error(err.stack);
       res.status(err.status || 500).json({
         error: err.message || 'Internal server error'
       });
     };
     app.use(errorHandler); // Must be last middleware
     ```

2. **Sync vs Async Mental Model**
   - **Problem**: Java methods block by default. Node.js is async by default.
   - **Mitigation**: Always use async/await, never block the event loop. Use `Promise.all()` for parallel operations.

3. **No Built-in Validation**
   - **Problem**: Spring's `@Valid` annotation is missing.
   - **Mitigation**: Use Zod or Joi for schema validation:
     ```javascript
     const { z } = require('zod');
     const createUserSchema = z.object({
       email: z.string().email(),
       name: z.string().min(1).max(100)
     });
     ```

4. **Transaction Handling**
   - **Problem**: `@Transactional` annotation doesn't exist.
   - **Mitigation**: Use ORM transaction APIs explicitly:
     ```javascript
     await prisma.$transaction(async (tx) => {
       await tx.user.create({ data: userData });
       await tx.auditLog.create({ data: logData });
     });
     ```

### Testing Approach

**JUnit → Jest Migration**:

| JUnit | Jest | Notes |
|-------|------|-------|
| `@Test` | `test()` or `it()` | Function-based |
| `@BeforeEach` | `beforeEach()` | Setup hooks |
| `@MockBean` | `jest.mock()` | Module mocking |
| `MockMvc` | supertest | HTTP testing |
| `assertThat()` | `expect()` | Assertions |

**Example Test Migration**:

```javascript
// users.controller.test.js
const request = require('supertest');
const app = require('../app');

describe('GET /api/users', () => {
  it('should return all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('POST /api/users', () => {
  it('should create a user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' })
      .expect(201);

    expect(response.body.email).toBe('test@example.com');
  });

  it('should return 400 for invalid email', async () => {
    await request(app)
      .post('/api/users')
      .send({ email: 'invalid', name: 'Test' })
      .expect(400);
  });
});
```

---

## SQL (PostgreSQL) → MongoDB

### Overview & Use Cases

Relational to document database migration requires rethinking data modeling. The key shift is from normalized tables with JOINs to denormalized documents with embedded data.

**Best for:**
- Flexible schema requirements
- Hierarchical data (nested objects)
- High write throughput
- Horizontal scaling needs

### Concept Translation

| SQL (PostgreSQL) | MongoDB | Notes |
|------------------|---------|-------|
| Database | Database | Same concept |
| Table | Collection | Schema-less by default |
| Row | Document | JSON-like BSON |
| Column | Field | Can be nested |
| Primary Key | `_id` field | Auto-generated ObjectId |
| Foreign Key | Referenced `_id` or embedded | Manual consistency |
| `JOIN` | `$lookup` or embedded docs | Prefer embedding for 1:few |
| `INDEX` | `createIndex()` | Similar syntax |
| `TRANSACTION` | Transaction (4.0+) | Limited to single replica set |
| `SELECT *` | `find({})` | Returns cursor |
| `WHERE` | `find({ field: value })` | Query filter |
| `ORDER BY` | `.sort({ field: 1 })` | 1 = asc, -1 = desc |
| `LIMIT` | `.limit(n)` | Same concept |
| `GROUP BY` | `$group` aggregation | Aggregation pipeline |
| `COUNT(*)` | `countDocuments()` | Or `estimatedDocumentCount()` |
| Stored Procedure | None (application logic) | Move logic to application |

### Schema Design Translation

**Rule of thumb**: Embed for 1:few, reference for 1:many, avoid 1:zillions.

#### Before (PostgreSQL Schema)

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table with foreign key
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items (many-to-many through table)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);
```

#### After (MongoDB Schema - Embedded)

```javascript
// users collection - with embedded orders (if few orders per user)
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": ISODate("2024-01-15T10:00:00Z"),
  "orders": [
    {
      "orderId": ObjectId("..."),
      "totalAmount": 99.99,
      "status": "completed",
      "items": [
        { "productId": ObjectId("..."), "quantity": 2, "price": 49.99 }
      ],
      "createdAt": ISODate("2024-01-20T14:30:00Z")
    }
  ]
}
```

#### After (MongoDB Schema - Referenced)

```javascript
// users collection
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": ISODate("2024-01-15T10:00:00Z")
}

// orders collection - with reference to user
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),  // Reference
  "totalAmount": 99.99,
  "status": "completed",
  "items": [
    { "productId": ObjectId("..."), "quantity": 2, "price": 49.99 }
  ],
  "createdAt": ISODate("2024-01-20T14:30:00Z")
}
```

### Code Examples

#### Before (PostgreSQL Query with JOIN)

```sql
-- Get user with their orders
SELECT u.id, u.name, u.email,
       o.id as order_id, o.total_amount, o.status
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.id = 123;

-- Get orders with items
SELECT o.id, o.total_amount, o.status,
       oi.product_id, oi.quantity, oi.price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 123
ORDER BY o.created_at DESC;
```

#### After (MongoDB Aggregation with $lookup)

```javascript
// Get user with their orders (referenced model)
db.users.aggregate([
  { $match: { _id: ObjectId("...") } },
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "userId",
      as: "orders"
    }
  }
]);

// Using Mongoose with populate
const user = await User.findById(userId).populate('orders');

// Get orders for a user (direct query if using references)
const orders = await Order.find({ userId: userId })
  .sort({ createdAt: -1 })
  .lean();
```

#### Before (PostgreSQL Transaction)

```sql
BEGIN;
  INSERT INTO orders (user_id, total_amount, status)
  VALUES (123, 99.99, 'pending') RETURNING id;

  INSERT INTO order_items (order_id, product_id, quantity, price)
  VALUES (currval('orders_id_seq'), 456, 2, 49.99);

  UPDATE products SET stock = stock - 2 WHERE id = 456;
COMMIT;
```

#### After (MongoDB Transaction with Mongoose)

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  const order = await Order.create([{
    userId: userId,
    totalAmount: 99.99,
    status: 'pending',
    items: [{ productId: productId, quantity: 2, price: 49.99 }]
  }], { session });

  await Product.updateOne(
    { _id: productId },
    { $inc: { stock: -2 } },
    { session }
  );

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Common Pitfalls

1. **Over-Normalizing in MongoDB**
   - **Problem**: Creating many collections with references like SQL tables.
   - **Mitigation**: Embrace denormalization. Embed related data when:
     - Data is read together frequently
     - Embedded data is 1:few relationship
     - Embedded data doesn't change independently

2. **Unbounded Array Growth**
   - **Problem**: Embedding arrays that grow without limit (e.g., all user comments on a post).
   - **Mitigation**: Reference when 1:many could become 1:zillions. MongoDB has 16MB document limit.

3. **Missing Indexes**
   - **Problem**: Queries slow without indexes (same as SQL but easier to forget).
   - **Mitigation**: Create indexes on frequently queried fields:
     ```javascript
     db.orders.createIndex({ userId: 1, createdAt: -1 });
     ```

4. **Treating $lookup as JOIN**
   - **Problem**: `$lookup` is expensive. Over-using it defeats MongoDB's purpose.
   - **Mitigation**: Design for access patterns. Denormalize data that's read together.

5. **Expecting ACID Everywhere**
   - **Problem**: MongoDB transactions have limitations (single replica set, overhead).
   - **Mitigation**: Design documents to be self-contained. Use transactions only when truly necessary.

### Testing Approach

**SQL Test Fixtures → MongoDB Test Fixtures**:

```javascript
// Test setup with mongodb-memory-server
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Test data integrity after migration
describe('Data Migration Validation', () => {
  it('should preserve user count', async () => {
    const mongoCount = await User.countDocuments();
    expect(mongoCount).toBe(expectedSqlCount);
  });

  it('should preserve order relationships', async () => {
    const user = await User.findOne({ email: 'test@example.com' })
      .populate('orders');
    expect(user.orders.length).toBe(expectedOrderCount);
  });
});
```

---

## Python Flask → Node.js Express

### Overview & Use Cases

Flask and Express share similar philosophies as minimal, flexible web frameworks. The migration is primarily about language idioms rather than architectural patterns.

**Best for:**
- Standardizing on JavaScript/TypeScript across stack
- Teams already familiar with Node.js
- Projects needing npm ecosystem access

### Concept Translation

| Python Flask | Node.js Express | Notes |
|--------------|-----------------|-------|
| `@app.route('/path')` | `router.get('/path', handler)` | Similar decorator vs method |
| `request.args` | `req.query` | Query parameters |
| `request.form` | `req.body` (with middleware) | Form data |
| `request.json` | `req.body` (with `express.json()`) | JSON body |
| `session['key']` | `req.session.key` (with express-session) | Session handling |
| `@login_required` | Middleware function | Custom middleware |
| `Blueprint` | `express.Router()` | Modular routing |
| `Flask-Login` | Passport.js | Authentication |
| `Flask-SQLAlchemy` | Prisma / TypeORM / Sequelize | ORM |
| `Flask-WTF` | Zod / Joi | Form/schema validation |
| `abort(404)` | `res.status(404).json({})` | Error responses |
| `render_template()` | `res.render()` (with view engine) | Template rendering |
| `jsonify()` | `res.json()` | JSON responses |
| `url_for()` | Manual path construction | URL generation |
| `g` object | `res.locals` or `req.app.locals` | Request/app context |
| WSGI | HTTP server (built-in) | Different server model |

### Code Examples

#### Before (Flask Application)

```python
# app.py
from flask import Flask, request, jsonify, abort
from flask_login import LoginManager, login_required, current_user
from functools import wraps

app = Flask(__name__)
login_manager = LoginManager(app)

# Custom decorator for role checking
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin:
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/users', methods=['GET'])
@login_required
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    users = User.query.paginate(page=page, per_page=per_page)
    return jsonify({
        'users': [u.to_dict() for u in users.items],
        'total': users.total,
        'page': page
    })

@app.route('/api/users/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@app.route('/api/users', methods=['POST'])
@login_required
@admin_required
def create_user():
    data = request.json
    if not data.get('email') or not data.get('name'):
        abort(400, description='Email and name are required')

    user = User(email=data['email'], name=data['name'])
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': str(error.description)}), 400
```

#### After (Express Application)

```javascript
// app.js
const express = require('express');
const app = express();

app.use(express.json());

// Routes
app.use('/api/users', require('./routes/users'));

// Error handlers
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

module.exports = app;

// middleware/auth.js
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };

// routes/users.js
const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateCreateUser } = require('../middleware/validation');
const userService = require('../services/users');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.per_page, 10) || 10;

    const result = await userService.findPaginated(page, perPage);
    res.json({
      users: result.users,
      total: result.total,
      page: page
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, requireAdmin, validateCreateUser, async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

#### Before (Flask Blueprint)

```python
# blueprints/api.py
from flask import Blueprint

api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/health')
def health():
    return {'status': 'ok'}

# In app.py
app.register_blueprint(api)
```

#### After (Express Router)

```javascript
// routes/api.js
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;

// In app.js
app.use('/api', require('./routes/api'));
```

### Common Pitfalls

1. **Synchronous vs Asynchronous**
   - **Problem**: Python (without async) is synchronous. Node.js is async by default.
   - **Mitigation**: Always use async/await. Never use synchronous file or database operations:
     ```javascript
     // BAD - blocks event loop
     const data = fs.readFileSync('file.txt');

     // GOOD - non-blocking
     const data = await fs.promises.readFile('file.txt');
     ```

2. **Missing Global Error Handler**
   - **Problem**: Flask's `@app.errorhandler` decorators are centralized. Express needs explicit middleware.
   - **Mitigation**: Add error middleware LAST in middleware chain. Always call `next(error)` in catch blocks.

3. **Decorator to Middleware Translation**
   - **Problem**: Python decorators stack differently than Express middleware.
   - **Mitigation**: Express middleware runs left-to-right in array:
     ```javascript
     // Equivalent to @login_required then @admin_required
     router.post('/', requireAuth, requireAdmin, handler);
     ```

4. **Context Globals (`g`, `current_user`)**
   - **Problem**: Flask's `g` and `current_user` are magic globals.
   - **Mitigation**: Use `req.user` (set by auth middleware) and `res.locals` or `req.app.locals`:
     ```javascript
     // Middleware sets req.user
     req.user = await getUserFromToken(token);

     // Controller accesses it
     const userId = req.user.id;
     ```

5. **Import vs Require**
   - **Problem**: Python imports are different from Node.js module system.
   - **Mitigation**: Use ES modules (`import`) or CommonJS (`require`) consistently. Don't mix without configuration.

### Testing Approach

**pytest → Jest Migration**:

| pytest | Jest | Notes |
|--------|------|-------|
| `def test_*()` | `test()` or `it()` | Function-based |
| `@pytest.fixture` | `beforeEach()` / `beforeAll()` | Setup fixtures |
| `pytest.raises()` | `expect().toThrow()` | Exception testing |
| `conftest.py` | `jest.setup.js` | Shared fixtures |
| `mocker.patch()` | `jest.mock()` | Mocking |
| `client.get()` | `request(app).get()` | HTTP testing |

**Example Test Migration**:

```python
# Python (pytest)
def test_get_users(client, auth_headers):
    response = client.get('/api/users', headers=auth_headers)
    assert response.status_code == 200
    assert 'users' in response.json

def test_create_user_unauthorized(client):
    response = client.post('/api/users', json={'email': 'test@test.com'})
    assert response.status_code == 401
```

```javascript
// JavaScript (Jest + supertest)
describe('GET /api/users', () => {
  it('should return users when authenticated', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('users');
  });
});

describe('POST /api/users', () => {
  it('should return 401 when unauthorized', async () => {
    await request(app)
      .post('/api/users')
      .send({ email: 'test@test.com' })
      .expect(401);
  });
});
```

---

## Related Patterns

- **Migration Strategies** (`migration-strategies.md`): Choose Strangler Fig, Big Bang, or Parallel Run
- **Risk Assessment** (`risk-assessment-framework.md`): Score migration risk before starting
- **Task Decomposition** (`task-decomposition.md`): Break migration into sprint-sized tasks
- **TDD Functional Parity** (`tdd-functional-parity.md`): Validate migration correctness

---

## Sources

### Java Spring Boot → Node.js Express

1. **Express.js Guide** - https://expressjs.com/en/guide/routing.html
2. **Prisma Documentation** - https://www.prisma.io/docs/
3. **TypeORM Documentation** - https://typeorm.io/
4. **Passport.js Documentation** - http://www.passportjs.org/
5. **Jest Documentation** - https://jestjs.io/docs/getting-started

### SQL → MongoDB

1. **MongoDB Manual** - https://www.mongodb.com/docs/manual/
2. **MongoDB Schema Design Patterns** - https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design
3. **Mongoose Documentation** - https://mongoosejs.com/docs/
4. **MongoDB University** - Schema design courses
5. **Martin Fowler** - "NoSQL Distilled" (book)

### Python Flask → Node.js Express

1. **Flask Documentation** - https://flask.palletsprojects.com/
2. **Express.js Documentation** - https://expressjs.com/
3. **Supertest** - https://github.com/visionmedia/supertest
4. **Zod Documentation** - https://zod.dev/
5. **Node.js Best Practices** - https://github.com/goldbergyoni/nodebestpractices
