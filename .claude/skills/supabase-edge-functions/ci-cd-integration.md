# CI/CD Integration

Automating Supabase Edge Function deployment with GitHub Actions and GitLab CI.

## Problem Statement

Manual deployment is error-prone and inconsistent. CI/CD automation provides:
- Consistent deployment process
- Automatic testing before deploy
- Rollback capability
- Environment-specific deployments
- Audit trail of changes

## Prerequisites

### Required Secrets

| Secret | Purpose | Where to Get |
|--------|---------|--------------|
| `SUPABASE_ACCESS_TOKEN` | CLI authentication | Dashboard > Account > Access Tokens |
| `SUPABASE_PROJECT_REF` | Project identifier | Dashboard URL: `app.supabase.com/project/<ref>` |
| `SUPABASE_DB_PASSWORD` | Database password (for migrations) | Dashboard > Settings > Database |

### Supabase CLI Setup

```bash
# Install globally
npm install -g supabase

# Or use in CI via npx
npx supabase --version

# Login (interactive, for local development)
supabase login

# Login with token (for CI)
export SUPABASE_ACCESS_TOKEN=your-token
```

## GitHub Actions

### Basic Deploy Workflow

```yaml
# .github/workflows/deploy-functions.yml
name: Deploy Edge Functions

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'
      - '.github/workflows/deploy-functions.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Deploy functions
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
```

### Complete Workflow with Testing

```yaml
# .github/workflows/deploy-functions.yml
name: Deploy Edge Functions

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'
  pull_request:
    branches: [main]
    paths:
      - 'supabase/functions/**'

env:
  SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Lint
        run: deno lint supabase/functions/

      - name: Format check
        run: deno fmt --check supabase/functions/

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Run tests
        run: deno test --allow-env --allow-net --allow-read supabase/functions/

      - name: Generate coverage
        run: |
          deno test --allow-env --allow-net --allow-read --coverage=coverage supabase/functions/
          deno coverage coverage --lcov --output=coverage.lcov

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: coverage.lcov
          fail_ci_if_error: false

  type-check:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x

      - name: Type check
        run: deno check supabase/functions/**/index.ts

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: [lint, test, type-check]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

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
            SENDGRID_API_KEY=${{ secrets.SENDGRID_API_KEY }} \
            --project-ref ${{ env.SUPABASE_PROJECT_REF }}

      - name: Deploy functions
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          supabase functions deploy --project-ref ${{ env.SUPABASE_PROJECT_REF }}

      - name: Verify deployment
        run: |
          # Simple health check
          curl -f https://${{ env.SUPABASE_PROJECT_REF }}.supabase.co/functions/v1/health || exit 1
```

### Deploy Specific Functions

```yaml
# Deploy only changed functions
deploy-changed:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 2

    - uses: supabase/setup-cli@v1

    - name: Get changed functions
      id: changed
      run: |
        CHANGED=$(git diff --name-only HEAD~1 HEAD -- supabase/functions/ | \
          grep -oP 'supabase/functions/\K[^/]+' | \
          sort -u | \
          tr '\n' ' ')
        echo "functions=$CHANGED" >> $GITHUB_OUTPUT

    - name: Deploy changed functions
      if: steps.changed.outputs.functions != ''
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      run: |
        for func in ${{ steps.changed.outputs.functions }}; do
          echo "Deploying $func..."
          supabase functions deploy $func --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        done
```

### Preview Deployments (Branch-Based)

```yaml
# .github/workflows/preview-functions.yml
name: Preview Functions

on:
  pull_request:
    branches: [main]
    paths:
      - 'supabase/functions/**'

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1

      # Deploy to a preview/staging project
      - name: Deploy to preview
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          supabase functions deploy \
            --project-ref ${{ secrets.SUPABASE_PREVIEW_PROJECT_REF }}

      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Functions deployed to preview!\n\nTest at: https://${{ secrets.SUPABASE_PREVIEW_PROJECT_REF }}.supabase.co/functions/v1/'
            })
```

## GitLab CI

### Basic Pipeline

```yaml
# .gitlab-ci.yml
image: denoland/deno:latest

stages:
  - test
  - deploy

variables:
  SUPABASE_PROJECT_REF: $SUPABASE_PROJECT_REF

lint:
  stage: test
  script:
    - deno lint supabase/functions/
    - deno fmt --check supabase/functions/

test:
  stage: test
  script:
    - deno test --allow-env --allow-net --allow-read supabase/functions/
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

deploy:
  stage: deploy
  image: node:20
  before_script:
    - npm install -g supabase
  script:
    - supabase functions deploy --project-ref $SUPABASE_PROJECT_REF
  environment:
    name: production
  only:
    - main
  variables:
    SUPABASE_ACCESS_TOKEN: $SUPABASE_ACCESS_TOKEN
```

### Multi-Environment Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - test
  - deploy-staging
  - deploy-production

.deploy-template: &deploy-template
  image: node:20
  before_script:
    - npm install -g supabase

test:
  stage: test
  image: denoland/deno:latest
  script:
    - deno test --allow-env --allow-net --allow-read supabase/functions/

deploy-staging:
  <<: *deploy-template
  stage: deploy-staging
  script:
    - supabase secrets set
        STRIPE_SECRET_KEY=$STRIPE_TEST_SECRET_KEY
        --project-ref $SUPABASE_STAGING_REF
    - supabase functions deploy --project-ref $SUPABASE_STAGING_REF
  environment:
    name: staging
  only:
    - develop
  variables:
    SUPABASE_ACCESS_TOKEN: $SUPABASE_ACCESS_TOKEN

deploy-production:
  <<: *deploy-template
  stage: deploy-production
  script:
    - supabase secrets set
        STRIPE_SECRET_KEY=$STRIPE_LIVE_SECRET_KEY
        --project-ref $SUPABASE_PRODUCTION_REF
    - supabase functions deploy --project-ref $SUPABASE_PRODUCTION_REF
  environment:
    name: production
  only:
    - main
  when: manual  # Require manual approval
  variables:
    SUPABASE_ACCESS_TOKEN: $SUPABASE_ACCESS_TOKEN
```

## Deployment Verification

### Health Check Function

Create a simple function for deployment verification:

```typescript
// supabase/functions/health/index.ts
Deno.serve(() => {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: Deno.env.get('FUNCTION_VERSION') ?? 'unknown',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
```

### Smoke Test in CI

```yaml
verify-deployment:
  runs-on: ubuntu-latest
  needs: [deploy]
  steps:
    - name: Wait for deployment
      run: sleep 30

    - name: Health check
      run: |
        response=$(curl -s -w "\n%{http_code}" \
          "https://${{ secrets.SUPABASE_PROJECT_REF }}.supabase.co/functions/v1/health")

        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)

        if [ "$http_code" != "200" ]; then
          echo "Health check failed with status $http_code"
          echo "$body"
          exit 1
        fi

        echo "Health check passed: $body"

    - name: Functional test
      run: |
        response=$(curl -s -X POST \
          "https://${{ secrets.SUPABASE_PROJECT_REF }}.supabase.co/functions/v1/my-function" \
          -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
          -H "Content-Type: application/json" \
          -d '{"test": true}')

        echo "Function response: $response"
        # Add assertions as needed
```

## Rollback Strategies

### Manual Rollback

```bash
# List recent deployments (not directly available, use git)
git log --oneline supabase/functions/

# Rollback to specific commit
git checkout <commit-hash> -- supabase/functions/
supabase functions deploy --project-ref your-project-ref
git checkout HEAD -- supabase/functions/  # Restore local files
```

### Automated Rollback on Failure

```yaml
deploy:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 2

    - uses: supabase/setup-cli@v1

    - name: Store current commit
      id: current
      run: echo "sha=$(git rev-parse HEAD~1)" >> $GITHUB_OUTPUT

    - name: Deploy
      id: deploy
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      run: |
        supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}

    - name: Verify deployment
      id: verify
      continue-on-error: true
      run: |
        sleep 30
        curl -f https://${{ secrets.SUPABASE_PROJECT_REF }}.supabase.co/functions/v1/health

    - name: Rollback on failure
      if: steps.verify.outcome == 'failure'
      env:
        SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      run: |
        echo "Deployment verification failed, rolling back..."
        git checkout ${{ steps.current.outputs.sha }} -- supabase/functions/
        supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        exit 1  # Fail the workflow
```

## Database Migrations with Functions

### Combined Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
    paths:
      - 'supabase/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1

      - name: Link project
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}

      # Run migrations first
      - name: Run migrations
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        run: |
          supabase db push

      # Then deploy functions (they may depend on new tables/columns)
      - name: Deploy functions
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          supabase functions deploy
```

## Secrets Rotation

### Automated Secret Update

```yaml
# .github/workflows/rotate-secrets.yml
name: Rotate Secrets

on:
  schedule:
    - cron: '0 0 1 * *'  # Monthly
  workflow_dispatch:

jobs:
  rotate:
    runs-on: ubuntu-latest
    steps:
      - uses: supabase/setup-cli@v1

      - name: Update secrets
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          # Fetch new secrets from secret manager (e.g., AWS Secrets Manager, HashiCorp Vault)
          # This is an example - adapt to your secret management solution

          supabase secrets set \
            STRIPE_SECRET_KEY=${{ secrets.STRIPE_SECRET_KEY }} \
            --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
```

## Best Practices

### 1. Use Environment-Specific Projects

```yaml
# Different Supabase projects for different environments
env:
  STAGING_REF: ${{ secrets.SUPABASE_STAGING_REF }}
  PRODUCTION_REF: ${{ secrets.SUPABASE_PRODUCTION_REF }}
```

### 2. Version Your Deployments

```yaml
- name: Set version
  run: |
    VERSION=$(git rev-parse --short HEAD)
    supabase secrets set FUNCTION_VERSION=$VERSION --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
```

### 3. Use Branch Protection

- Require PR reviews before merging to main
- Require CI checks to pass
- Prevent direct pushes to main

### 4. Monitor Deployments

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Edge Functions deployed: ${{ github.sha }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Related Resources

- [environment-variables.md](./environment-variables.md) - Secret management
- [deno-testing.md](./deno-testing.md) - Testing in CI
- [Supabase CI/CD Documentation](https://supabase.com/docs/guides/cli/cicd-workflow)
