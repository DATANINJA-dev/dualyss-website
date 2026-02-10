---
name: api-design
description: Comprehensive knowledge about REST API design, best practices, documentation standards, and implementation patterns. Use when designing endpoints, route handlers, or API contracts.
---

# API Design Skill

## Overview
This skill provides comprehensive knowledge about REST API design, best practices, documentation standards, and implementation patterns for building robust backend services.

---

## REST API Fundamentals

### Core Principles
1. **Stateless**: Each request contains all information needed
2. **Client-Server**: Clear separation of concerns
3. **Cacheable**: Responses must define cacheability
4. **Uniform Interface**: Consistent resource identification
5. **Layered System**: Support for intermediary layers

### HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace resource | Yes | No |
| PATCH | Partial update | No | No |
| DELETE | Remove resource | Yes | No |

---

## URL Design

### Resource Naming Conventions

```
# Good Examples
GET    /api/v1/products              # List products
GET    /api/v1/products/123          # Get single product
POST   /api/v1/products              # Create product
PUT    /api/v1/products/123          # Update product
DELETE /api/v1/products/123          # Delete product

# Nested Resources
GET    /api/v1/products/123/reviews  # Reviews for product
POST   /api/v1/products/123/reviews  # Add review to product

# Filtering and Pagination
GET    /api/v1/products?status=active&limit=10&offset=20
GET    /api/v1/products?sort=created_at:desc
GET    /api/v1/products?fields=id,name,price
```

### Anti-Patterns to Avoid

```
# BAD - Using verbs in URLs
GET /api/getProducts
POST /api/createProduct
GET /api/deleteProduct/123

# BAD - Inconsistent naming
GET /api/product          # singular
GET /api/users            # plural
GET /api/orderItems       # camelCase

# BAD - Action in query params
GET /api/products?action=delete&id=123
```

---

## Response Structure

### Success Responses

```json
// Single Resource (200 OK)
{
  "data": {
    "id": "123",
    "type": "product",
    "attributes": {
      "name": "Widget Pro",
      "price": 99.99,
      "status": "active"
    },
    "relationships": {
      "category": {
        "id": "456",
        "type": "category"
      }
    }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}

// Collection (200 OK)
{
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "has_more": true
  },
  "links": {
    "self": "/api/v1/products?limit=10&offset=0",
    "next": "/api/v1/products?limit=10&offset=10",
    "last": "/api/v1/products?limit=10&offset=140"
  }
}

// Created (201 Created)
{
  "data": { ... },
  "meta": {
    "message": "Product created successfully"
  }
}
```

### Error Responses

```json
// Client Error (4xx)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "price",
        "message": "Price must be positive"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "request_id": "req_abc123"
  }
}

// Server Error (5xx)
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "request_id": "req_abc123"
  }
}
```

---

## Status Codes

### Success Codes (2xx)
| Code | Name | Usage |
|------|------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE |

### Client Error Codes (4xx)
| Code | Name | Usage |
|------|------|-------|
| 400 | Bad Request | Malformed request syntax |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource state conflict |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |

### Server Error Codes (5xx)
| Code | Name | Usage |
|------|------|-------|
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Server overloaded or maintenance |

---

## Authentication & Authorization

### Authentication Methods

#### Bearer Token (JWT)
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### API Key
```http
X-API-Key: your-api-key-here
# OR as query param (less secure)
GET /api/products?api_key=your-key
```

### Authorization Patterns

```javascript
// Role-Based Access Control (RBAC)
const permissions = {
  admin: ['read', 'write', 'delete', 'admin'],
  editor: ['read', 'write'],
  viewer: ['read']
};

// Resource-Based Access Control
// User can only access their own resources
GET /api/v1/users/:userId/products
// Middleware checks: req.user.id === req.params.userId
```

---

## Versioning Strategies

### URL Path Versioning (Recommended)
```
GET /api/v1/products
GET /api/v2/products
```

### Header Versioning
```http
Accept: application/vnd.myapi.v1+json
```

### Query Parameter Versioning
```
GET /api/products?version=1
```

---

## Pagination Patterns

### Offset-Based (Simple)
```
GET /api/products?limit=10&offset=20

Response:
{
  "data": [...],
  "meta": {
    "total": 150,
    "limit": 10,
    "offset": 20
  }
}
```

### Cursor-Based (Performant)
```
GET /api/products?limit=10&cursor=eyJpZCI6MTIzfQ==

Response:
{
  "data": [...],
  "meta": {
    "has_more": true,
    "next_cursor": "eyJpZCI6MTMzfQ=="
  }
}
```

---

## Rate Limiting

### Response Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 60
```

### Rate Limit Response
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please retry after 60 seconds.",
    "retry_after": 60
  }
}
```

---

## OpenAPI Specification

### Basic Structure
```yaml
openapi: 3.0.0
info:
  title: Manager Assistant API
  version: 1.0.0
  description: API for product management assistant

servers:
  - url: https://api.example.com/v1
    description: Production
  - url: https://api-staging.example.com/v1
    description: Staging

paths:
  /products:
    get:
      summary: List all products
      tags:
        - Products
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
        - name: status
          in: query
          schema:
            type: string
            enum: [active, archived]
      responses:
        '200':
          description: List of products
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductList'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  schemas:
    Product:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        price:
          type: number
      required:
        - id
        - name

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---

## Next.js API Routes

### Route Handler Pattern
```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data,
    meta: { total: count, limit, offset }
  });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  // Validate input
  const validation = validateProduct(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', details: validation.errors } },
      { status: 422 }
    );
  }

  const { data, error } = await supabase
    .from('products')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
```

### Dynamic Route Handler
```typescript
// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // Fetch product by id
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  // Update product
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // Delete product
}
```

---

## Error Handling Patterns

### Centralized Error Handler
```typescript
// lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
  }
}

export const errorHandler = (error: unknown) => {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.status }
    );
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    { status: 500 }
  );
};
```

---

## Validation with Zod

```typescript
import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
});

export const ProductUpdateSchema = ProductSchema.partial();

// Usage in API route
const result = ProductSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    {
      error: {
        code: 'VALIDATION_ERROR',
        details: result.error.flatten().fieldErrors
      }
    },
    { status: 422 }
  );
}
```

---

## API Security Checklist

- [ ] Use HTTPS only
- [ ] Validate all inputs
- [ ] Sanitize outputs
- [ ] Implement rate limiting
- [ ] Use proper authentication
- [ ] Implement authorization checks
- [ ] Log security events
- [ ] Handle errors gracefully (no stack traces in production)
- [ ] Use security headers (CORS, CSP, etc.)
- [ ] Validate content types
- [ ] Protect against CSRF for state-changing requests
- [ ] Implement request size limits

---

## Quick Reference

### Common Patterns
```
# CRUD Operations
GET    /resources          # List
POST   /resources          # Create
GET    /resources/:id      # Read
PUT    /resources/:id      # Update (full)
PATCH  /resources/:id      # Update (partial)
DELETE /resources/:id      # Delete

# Actions on Resources
POST   /resources/:id/publish
POST   /resources/:id/archive
POST   /resources/:id/clone

# Relationships
GET    /resources/:id/related
POST   /resources/:id/related/:relatedId
DELETE /resources/:id/related/:relatedId

# Search/Filter
GET    /resources?q=search&status=active&sort=-created_at
```

### Response Template
```json
{
  "data": {},
  "meta": {
    "timestamp": "",
    "request_id": ""
  },
  "links": {
    "self": ""
  }
}
```
