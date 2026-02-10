# Environment Variables

Managing secrets and configuration for Supabase Edge Functions across development and production environments.

## Problem Statement

Edge Functions need access to:
- API keys for external services
- Database connection strings
- Feature flags and configuration
- Environment-specific settings

Proper management ensures security and consistent behavior across environments.

## Deno.env.get() Pattern

### Basic Usage

```typescript
// Read environment variable
const apiKey = Deno.env.get('API_KEY')

// With fallback
const environment = Deno.env.get('ENVIRONMENT') ?? 'development'

// Check if exists
if (!Deno.env.get('REQUIRED_KEY')) {
  throw new Error('REQUIRED_KEY environment variable is not set')
}
```

### Required vs Optional Pattern

```typescript
// supabase/functions/_shared/env.ts

/**
 * Get a required environment variable.
 * Throws if not set - use for critical config.
 */
export function requiredEnv(name: string): string {
  const value = Deno.env.get(name)
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * Get an optional environment variable with default.
 * Use for config that has sensible defaults.
 */
export function optionalEnv(name: string, defaultValue: string): string {
  return Deno.env.get(name) ?? defaultValue
}

/**
 * Get a boolean environment variable.
 * Returns true for "true", "1", "yes" (case insensitive).
 */
export function boolEnv(name: string, defaultValue = false): boolean {
  const value = Deno.env.get(name)
  if (!value) return defaultValue
  return ['true', '1', 'yes'].includes(value.toLowerCase())
}

/**
 * Get a numeric environment variable.
 * Returns default if not set or not a valid number.
 */
export function numericEnv(name: string, defaultValue: number): number {
  const value = Deno.env.get(name)
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}
```

### Usage

```typescript
import { requiredEnv, optionalEnv, boolEnv, numericEnv } from '../_shared/env.ts'

Deno.serve(async (req) => {
  // These will throw if missing
  const supabaseUrl = requiredEnv('SUPABASE_URL')
  const supabaseKey = requiredEnv('SUPABASE_ANON_KEY')

  // These have defaults
  const environment = optionalEnv('ENVIRONMENT', 'development')
  const debugMode = boolEnv('DEBUG', false)
  const maxRetries = numericEnv('MAX_RETRIES', 3)

  // ...
})
```

## Supabase Built-in Variables

### Automatically Available

These are automatically injected by Supabase in deployed functions:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Your project's API URL |
| `SUPABASE_ANON_KEY` | Public anon key (for RLS-protected access) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (bypasses RLS) |
| `SUPABASE_DB_URL` | Direct database connection string |

### Using Built-in Variables

```typescript
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  // These are always available in deployed functions
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!

  const supabase = createClient(supabaseUrl, supabaseKey)

  // ...
})
```

## Supabase Secrets CLI

### Setting Secrets

```bash
# Set a single secret
supabase secrets set MY_API_KEY=sk-abc123

# Set multiple secrets
supabase secrets set \
  STRIPE_SECRET_KEY=sk_live_xxx \
  STRIPE_WEBHOOK_SECRET=whsec_xxx \
  SENDGRID_API_KEY=SG.xxx

# Set from file (each line is KEY=VALUE)
supabase secrets set --env-file .env.production
```

### Listing Secrets

```bash
# List all secret names (values not shown for security)
supabase secrets list

# Output:
# NAME                    DIGEST
# STRIPE_SECRET_KEY       abc123...
# STRIPE_WEBHOOK_SECRET   def456...
# SENDGRID_API_KEY        ghi789...
```

### Removing Secrets

```bash
# Remove a single secret
supabase secrets unset MY_API_KEY

# Remove multiple secrets
supabase secrets unset STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET
```

## Local Development

### Using .env.local

Create a local environment file (never commit this):

```bash
# .env.local (add to .gitignore!)

# Supabase (from supabase status)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# External services (use test keys!)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxx

# Feature flags
DEBUG=true
ENVIRONMENT=development
```

### Running with Environment File

```bash
# Serve all functions with env file
supabase functions serve --env-file .env.local

# Serve specific function
supabase functions serve my-function --env-file .env.local

# With debug logging
supabase functions serve --env-file .env.local --debug
```

### Getting Local Supabase Credentials

```bash
# Start local Supabase
supabase start

# Get credentials
supabase status

# Output includes:
# API URL: http://localhost:54321
# anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Environment File Structure

### Recommended File Organization

```
project/
├── .env.local           # Local development (gitignored)
├── .env.example         # Template for developers (committed)
├── .env.test            # Test environment (gitignored)
└── supabase/
    └── functions/
        └── ...
```

### .env.example Template

```bash
# .env.example - Template for local development
# Copy to .env.local and fill in values

# Supabase (from `supabase status`)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (use test keys for development)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email service
SENDGRID_API_KEY=

# Configuration
ENVIRONMENT=development
DEBUG=true
```

### .gitignore Entries

```gitignore
# Environment files with secrets
.env.local
.env.*.local
.env.development
.env.production

# Keep the example
!.env.example
```

## CI/CD Secrets

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Edge Functions

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Set secrets
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          supabase secrets set \
            STRIPE_SECRET_KEY=${{ secrets.STRIPE_SECRET_KEY }} \
            STRIPE_WEBHOOK_SECRET=${{ secrets.STRIPE_WEBHOOK_SECRET }} \
            --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}

      - name: Deploy functions
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
deploy_functions:
  stage: deploy
  image: supabase/cli:latest
  script:
    - supabase secrets set
        STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
        STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET
        --project-ref $SUPABASE_PROJECT_REF
    - supabase functions deploy --project-ref $SUPABASE_PROJECT_REF
  variables:
    SUPABASE_ACCESS_TOKEN: $SUPABASE_ACCESS_TOKEN
  only:
    - main
```

### Required CI Secrets

| Secret | Purpose | Where to Get |
|--------|---------|--------------|
| `SUPABASE_ACCESS_TOKEN` | CLI authentication | Dashboard > Account > Access Tokens |
| `SUPABASE_PROJECT_REF` | Project identifier | Dashboard URL or `supabase projects list` |
| Service-specific keys | API keys for external services | Each service's dashboard |

## Environment-Specific Configuration

### Configuration Module Pattern

```typescript
// supabase/functions/_shared/config.ts

import { requiredEnv, optionalEnv, boolEnv } from './env.ts'

type Environment = 'development' | 'staging' | 'production'

interface Config {
  environment: Environment
  debug: boolean
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey: string
  }
  stripe: {
    secretKey: string
    webhookSecret: string
  }
  features: {
    newCheckoutFlow: boolean
    betaFeatures: boolean
  }
}

function getEnvironment(): Environment {
  const env = optionalEnv('ENVIRONMENT', 'development')
  if (['development', 'staging', 'production'].includes(env)) {
    return env as Environment
  }
  return 'development'
}

export function getConfig(): Config {
  const environment = getEnvironment()

  return {
    environment,
    debug: boolEnv('DEBUG', environment !== 'production'),

    supabase: {
      url: requiredEnv('SUPABASE_URL'),
      anonKey: requiredEnv('SUPABASE_ANON_KEY'),
      serviceRoleKey: requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    },

    stripe: {
      secretKey: requiredEnv('STRIPE_SECRET_KEY'),
      webhookSecret: requiredEnv('STRIPE_WEBHOOK_SECRET'),
    },

    features: {
      // Feature flags - can be environment-specific
      newCheckoutFlow: boolEnv('FEATURE_NEW_CHECKOUT', environment === 'production'),
      betaFeatures: boolEnv('FEATURE_BETA', environment !== 'production'),
    },
  }
}

// Singleton pattern for reuse
let _config: Config | null = null

export function config(): Config {
  if (!_config) {
    _config = getConfig()
  }
  return _config
}
```

### Usage

```typescript
import { config } from '../_shared/config.ts'

Deno.serve(async (req) => {
  const cfg = config()

  if (cfg.debug) {
    console.log('Debug mode enabled')
  }

  const stripe = new Stripe(cfg.stripe.secretKey, { apiVersion: '2023-10-16' })

  if (cfg.features.newCheckoutFlow) {
    // New checkout logic
  }

  // ...
})
```

## Security Best Practices

### Never Log Secrets

```typescript
// ❌ NEVER log secrets
console.log('API Key:', Deno.env.get('API_KEY'))
console.log('Config:', JSON.stringify(config))

// ✅ Log only non-sensitive info
console.log('Environment:', Deno.env.get('ENVIRONMENT'))
console.log('Debug mode:', config().debug)
```

### Never Return Secrets in Response

```typescript
// ❌ NEVER return secrets
return new Response(JSON.stringify({
  config: {
    apiKey: Deno.env.get('API_KEY'),  // NEVER!
  }
}))

// ✅ Only return necessary data
return new Response(JSON.stringify({
  environment: Deno.env.get('ENVIRONMENT'),
  version: '1.0.0',
}))
```

### Validate Early

```typescript
Deno.serve(async (req) => {
  // ✅ Validate all required env vars at start
  try {
    const cfg = config()  // Throws if required vars missing
  } catch (error) {
    console.error('Configuration error:', error.message)
    return new Response('Server configuration error', { status: 500 })
  }

  // Now safe to proceed
})
```

## Common Issues

### Issue 1: Variables Not Available Locally

**Symptom**: `Deno.env.get()` returns `undefined` locally.

**Fix**: Use `--env-file` flag:
```bash
supabase functions serve --env-file .env.local
```

### Issue 2: Secrets Not Set in Production

**Symptom**: Function fails with "missing environment variable" in production.

**Fix**: Set secrets with CLI:
```bash
supabase secrets set API_KEY=value --project-ref your-project-ref
```

### Issue 3: Wrong Values in Different Environments

**Symptom**: Using production keys in development or vice versa.

**Fix**: Use separate env files and verify:
```bash
# Development
supabase functions serve --env-file .env.local

# Check production secrets
supabase secrets list --project-ref your-project-ref
```

## Related Resources

- [edge-function-structure.md](./edge-function-structure.md) - Function setup
- [ci-cd-integration.md](./ci-cd-integration.md) - Deployment automation
- [Supabase Secrets Documentation](https://supabase.com/docs/guides/functions/secrets)
