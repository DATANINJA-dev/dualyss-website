---
name: devops-patterns
description: |
  Provides CI/CD patterns, deployment strategies, environment management, and
  infrastructure patterns for modern web applications. Auto-activates for
  deployment, CI/CD, Vercel, Docker, and infrastructure keywords.
---

# DevOps Patterns Skill

This skill provides comprehensive patterns for deployment, continuous integration, environment management, and infrastructure for modern web applications. Focused on Next.js + Vercel stack but applicable to other platforms.

## When This Skill Activates

- Tasks involving deployment or CI/CD setup
- Infrastructure configuration or environment management
- Docker/container configuration
- Monitoring and observability setup
- Database backup and disaster recovery

### Activation Keywords

| Keyword Pattern | Confidence |
|-----------------|------------|
| deploy, deployment, release | High |
| CI/CD, GitHub Actions, pipeline | High |
| Vercel, Netlify, Render, AWS | High |
| Docker, container, Kubernetes | High |
| environment, staging, production | Medium |
| monitoring, logging, alerting | Medium |

### Activation File Patterns

| Pattern | Trigger |
|---------|---------|
| `.github/workflows/*` | GitHub Actions files |
| `vercel.json`, `netlify.toml` | Platform config |
| `Dockerfile`, `docker-compose.*` | Container files |
| `.env*` | Environment files |

## Core Principles

### The Deployment Pipeline

```
Code Push -> Lint/Format -> Build -> Test -> Preview -> Production
     |          |          |       |        |          |
  trigger    quality     bundle   verify   review   release
```

### Environment Strategy

```
+-------------+  +-------------+  +-------------+
| Development |  |   Staging   |  | Production  |
|             |  |             |  |             |
| Local dev   |  | Preview env |  | Live users  |
| Hot reload  |  | Full stack  |  | Protected   |
| Debug mode  |  | Test data   |  | Real data   |
+-------------+  +-------------+  +-------------+
      ^               ^               ^
   feature          PR merge       main merge
   branch           preview        + manual
```

## Vercel Deployment Patterns

### Project Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

### Environment Variables

```bash
# .env.local (development - never commit)
DATABASE_URL="postgresql://localhost:5432/dev"
NEXTAUTH_SECRET="dev-secret-change-in-prod"
NEXTAUTH_URL="http://localhost:3000"

# .env.example (template - commit this)
DATABASE_URL="postgresql://user:pass@host:5432/db"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-domain.com"

# Vercel Environment Variables (in dashboard)
# Production: Real values
# Preview: Staging values
# Development: Local-like values
```

### Preview Deployments

```yaml
# Automatic preview for every PR
# Access at: https://[branch]-[project]-[org].vercel.app

# Protect preview with password
# vercel.json
{
  "password": {
    "enabled": true,
    "rules": [
      {
        "match": "preview",
        "password": "$PREVIEW_PASSWORD"
      }
    ]
  }
}
```

## GitHub Actions Patterns

### Standard CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next
          retention-days: 7
```

### E2E Testing Workflow

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Build
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

### Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        uses: orhun/git-cliff-action@v3
        with:
          config: cliff.toml
          args: --latest --strip all

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.content }}
          draft: false
          prerelease: ${{ contains(github.ref, 'alpha') || contains(github.ref, 'beta') }}
```

## Docker Patterns

### Next.js Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose for Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      target: deps
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## Environment Management

### Environment File Structure

```
.
├── .env                    # Default values (git ignored)
├── .env.example           # Template (committed)
├── .env.local             # Local overrides (git ignored)
├── .env.development       # Development defaults
├── .env.production        # Production defaults (no secrets!)
├── .env.test              # Test environment
└── .env.*.local           # Environment-specific local (git ignored)
```

### Secret Management

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Public (exposed to client)
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),

  // Server-only (never exposed to client)
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment variables:', result.error.format());
  throw new Error('Invalid environment variables');
}

export const env = result.data;
```

## Monitoring & Observability

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    checks: {
      database: 'unknown',
      memory: 'unknown',
    },
  };

  try {
    // Database check
    await db.$queryRaw`SELECT 1`;
    health.checks.database = 'healthy';
  } catch (error) {
    health.checks.database = 'unhealthy';
    health.status = 'degraded';
  }

  // Memory check
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  health.checks.memory = heapUsedMB < 450 ? 'healthy' : 'warning';

  const status = health.status === 'healthy' ? 200 : 503;
  return NextResponse.json(health, { status });
}
```

### Error Tracking Setup (Sentry)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Performance monitoring
  tracesSampleRate: 0.1,

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filter out noisy errors
  ignoreErrors: [
    'ResizeObserver loop',
    'Non-Error promise rejection',
  ],
});
```

### Logging Pattern

```typescript
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'development',
    ...context,
  };

  if (process.env.NODE_ENV === 'production') {
    // Structured JSON for log aggregation
    console[level](JSON.stringify(entry));
  } else {
    // Pretty print for development
    console[level](`[${level.toUpperCase()}] ${message}`, context);
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => log('debug', msg, ctx),
  info: (msg: string, ctx?: LogContext) => log('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => log('error', msg, ctx),
};
```

## Database Operations

### Migration Workflow

```bash
# Generate migration from schema changes
npx prisma migrate dev --name descriptive_name

# Apply migrations to production (in CI/CD)
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset
```

### Backup Strategy (Supabase)

```bash
# Manual backup
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql

# Restore
psql "$DATABASE_URL" < backup-20240101.sql
```

### Database Connection Pooling

```typescript
// For serverless (Vercel)
// Use connection pooler (PgBouncer) or Prisma Data Proxy

// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] TypeScript builds without errors
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Dependencies up to date
- [ ] Security scan clean
- [ ] Bundle size acceptable

### Deployment

- [ ] Preview deployment reviewed
- [ ] Database migrations applied
- [ ] Feature flags configured
- [ ] Monitoring alerts set up
- [ ] Rollback plan documented

### Post-Deployment

- [ ] Health check passing
- [ ] Core user flows working
- [ ] Error rates normal
- [ ] Performance metrics acceptable
- [ ] Team notified

## Security Patterns

### Secure Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
];
```

### Dependency Scanning

```yaml
# .github/workflows/security.yml
name: Security

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --production
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## Constraints

- Always use environment variables for secrets
- Never commit .env files with real values
- Use preview deployments for all PRs
- Implement health checks for production
- Set up monitoring before launch
- Document rollback procedures
- Test migrations in staging first
- Keep Docker images minimal and secure
