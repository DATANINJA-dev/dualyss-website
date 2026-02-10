# Stack-to-Component Mappings

Centralized mapping rules for recommending skills and agents based on detected technology stack.

## Usage

This file is referenced by the `stack-skill-recommender` agent to translate detected tech stacks into actionable skill and agent recommendations.

## Mapping Structure

Each mapping entry contains:
- **triggers**: Regex patterns or keywords that activate this mapping
- **skills**: Recommended skills with rationale
- **agents**: Recommended agents with rationale
- **priority**: Ordering when multiple mappings match (lower = higher priority)

## Frontend Stack Mappings

### React / React Ecosystem

```yaml
mapping: frontend-react
triggers:
  - "react"
  - "next.js"
  - "nextjs"
  - "gatsby"
  - "remix"
skills:
  - name: react-best-practices
    reason: "React-specific optimization patterns from Vercel Labs"
    priority: high
  - name: ux-standards
    reason: "React frontend - accessibility and usability patterns"
    priority: high
  - name: tdd-workflow
    reason: "Component testing with React Testing Library"
    priority: high
  - name: security-patterns
    reason: "Frontend security (XSS, CSRF protection)"
    priority: medium
  - name: performance-patterns
    reason: "Core Web Vitals optimization"
    priority: medium
agents:
  - name: task-ux
    reason: "UX analysis for React components"
    priority: high
  - name: task-design-system
    reason: "Component consistency and design tokens"
    priority: high
  - name: task-test-planning
    reason: "Component and integration testing"
    priority: medium
  - name: journey-validator
    reason: "Navigation flow validation"
    priority: medium
```

### Vue / Vue Ecosystem

```yaml
mapping: frontend-vue
triggers:
  - "vue"
  - "nuxt"
  - "vuex"
  - "pinia"
skills:
  - name: ux-standards
    reason: "Vue frontend - accessibility patterns"
    priority: high
  - name: tdd-workflow
    reason: "Vue Test Utils testing"
    priority: high
  - name: security-patterns
    reason: "Frontend security patterns"
    priority: medium
agents:
  - name: task-ux
    reason: "UX analysis for Vue components"
    priority: high
  - name: task-design-system
    reason: "Component library patterns"
    priority: high
  - name: journey-validator
    reason: "Route validation"
    priority: medium
```

### Angular

```yaml
mapping: frontend-angular
triggers:
  - "angular"
  - "@angular"
skills:
  - name: ux-standards
    reason: "Angular accessibility patterns"
    priority: high
  - name: tdd-workflow
    reason: "Angular testing with Jasmine/Jest"
    priority: high
  - name: security-patterns
    reason: "Angular security (sanitization, guards)"
    priority: medium
agents:
  - name: task-ux
    reason: "UX analysis for Angular components"
    priority: high
  - name: task-test-planning
    reason: "Unit and e2e testing strategy"
    priority: high
  - name: journey-validator
    reason: "Router validation"
    priority: medium
```

### Svelte / SvelteKit

```yaml
mapping: frontend-svelte
triggers:
  - "svelte"
  - "sveltekit"
skills:
  - name: ux-standards
    reason: "Svelte accessibility patterns"
    priority: high
  - name: tdd-workflow
    reason: "Svelte component testing"
    priority: high
  - name: performance-patterns
    reason: "Svelte's compile-time optimization"
    priority: medium
agents:
  - name: task-ux
    reason: "UX analysis for Svelte components"
    priority: high
  - name: task-design-system
    reason: "Component patterns"
    priority: high
```

## Backend Stack Mappings

### Node.js / Express / Fastify

```yaml
mapping: backend-node
triggers:
  - "express"
  - "fastify"
  - "koa"
  - "hapi"
  - "nest"
  - "nestjs"
skills:
  - name: security-patterns
    reason: "API security (auth, input validation, OWASP)"
    priority: high
  - name: tdd-workflow
    reason: "API testing with Jest/Mocha"
    priority: high
  - name: performance-patterns
    reason: "Node.js performance optimization"
    priority: medium
agents:
  - name: task-security
    reason: "Security analysis for APIs"
    priority: high
  - name: task-api-integration
    reason: "API contract analysis"
    priority: high
  - name: task-test-planning
    reason: "Integration testing strategy"
    priority: medium
  - name: task-performance
    reason: "Performance analysis"
    priority: medium
```

### Python / Django / Flask / FastAPI

```yaml
mapping: backend-python
triggers:
  - "django"
  - "flask"
  - "fastapi"
  - "pyramid"
  - "tornado"
skills:
  - name: security-patterns
    reason: "Python security patterns"
    priority: high
  - name: tdd-workflow
    reason: "pytest testing patterns"
    priority: high
  - name: performance-patterns
    reason: "Python performance optimization"
    priority: medium
agents:
  - name: task-security
    reason: "Security analysis"
    priority: high
  - name: task-api-integration
    reason: "API analysis for Python frameworks"
    priority: high
  - name: task-test-planning
    reason: "pytest test planning"
    priority: medium
```

### Go

```yaml
mapping: backend-go
triggers:
  - "go.mod"
  - "gin"
  - "echo"
  - "fiber"
  - "chi"
skills:
  - name: security-patterns
    reason: "Go security best practices"
    priority: high
  - name: tdd-workflow
    reason: "Go testing patterns"
    priority: high
  - name: performance-patterns
    reason: "Go concurrency patterns"
    priority: medium
agents:
  - name: task-security
    reason: "Security analysis"
    priority: high
  - name: task-test-planning
    reason: "Go test planning"
    priority: medium
  - name: task-performance
    reason: "Goroutine and memory analysis"
    priority: medium
```

### Rust

```yaml
mapping: backend-rust
triggers:
  - "cargo.toml"
  - "actix"
  - "axum"
  - "rocket"
skills:
  - name: security-patterns
    reason: "Rust memory safety patterns"
    priority: medium
  - name: tdd-workflow
    reason: "Rust testing patterns"
    priority: high
  - name: performance-patterns
    reason: "Rust performance optimization"
    priority: high
agents:
  - name: task-test-planning
    reason: "Rust test planning"
    priority: high
  - name: task-performance
    reason: "Performance analysis"
    priority: high
```

### Supabase

```yaml
mapping: backend-supabase
triggers:
  - "supabase"
  - "@supabase/supabase-js"
  - "@supabase/ssr"
  - "supabase/functions"
  - "SUPABASE_URL"
  - "SUPABASE_ANON_KEY"
skills:
  - name: supabase-rls-patterns
    reason: "Row Level Security policy patterns and testing"
    priority: high
  - name: supabase-edge-functions
    reason: "Edge Function patterns and Deno testing"
    priority: high
  - name: supabase-nextjs-integration
    reason: "Next.js Server Components and Server Actions with Supabase"
    priority: high
  - name: typescript-advanced-patterns
    reason: "Type-safe Supabase client patterns"
    priority: medium
  - name: security-patterns
    reason: "Supabase auth and RLS security"
    priority: high
  - name: tdd-workflow
    reason: "Testing Edge Functions and RLS policies"
    priority: high
agents:
  - name: task-security
    reason: "RLS policy security analysis"
    priority: high
  - name: task-test-planning
    reason: "Edge Function and RLS testing strategy"
    priority: high
  - name: task-api-integration
    reason: "Edge Function API analysis"
    priority: medium
```

## Full-Stack Mappings

### Next.js (Full-Stack)

```yaml
mapping: fullstack-nextjs
triggers:
  - "next.js"
  - "nextjs"
  - "app router"
  - "pages router"
skills:
  - name: react-best-practices
    reason: "React/Next.js optimization patterns from Vercel Labs"
    priority: high
  - name: ux-standards
    reason: "Next.js accessibility patterns"
    priority: high
  - name: security-patterns
    reason: "Full-stack security (API routes, auth)"
    priority: high
  - name: tdd-workflow
    reason: "Next.js testing patterns"
    priority: high
  - name: performance-patterns
    reason: "SSR/SSG optimization, Core Web Vitals"
    priority: high
  - name: seo-validation
    reason: "SEO for server-rendered apps"
    priority: medium
agents:
  - name: task-ux
    reason: "UX analysis"
    priority: high
  - name: task-security
    reason: "API route security"
    priority: high
  - name: task-api-integration
    reason: "API analysis"
    priority: medium
  - name: set-up-seo
    reason: "SEO setup for Next.js"
    priority: medium
```

### Nuxt (Full-Stack)

```yaml
mapping: fullstack-nuxt
triggers:
  - "nuxt"
skills:
  - name: ux-standards
    reason: "Nuxt accessibility"
    priority: high
  - name: security-patterns
    reason: "Full-stack security"
    priority: high
  - name: tdd-workflow
    reason: "Nuxt testing"
    priority: high
  - name: seo-validation
    reason: "SEO for Nuxt apps"
    priority: medium
agents:
  - name: task-ux
    reason: "UX analysis"
    priority: high
  - name: task-security
    reason: "Security analysis"
    priority: high
  - name: set-up-seo
    reason: "SEO setup"
    priority: medium
```

## Language Mappings

### TypeScript

```yaml
mapping: lang-typescript
triggers:
  - "typescript"
  - "tsconfig"
  - ".ts"
  - ".tsx"
skills:
  - name: tdd-workflow
    reason: "Type-safe testing patterns"
    priority: high
agents:
  - name: task-code-impact
    reason: "Type system impact analysis"
    priority: high
  - name: task-test-planning
    reason: "TypeScript testing strategy"
    priority: medium
```

### Python

```yaml
mapping: lang-python
triggers:
  - "python"
  - "pyproject.toml"
  - "requirements.txt"
  - ".py"
skills:
  - name: tdd-workflow
    reason: "pytest patterns"
    priority: high
agents:
  - name: task-code-impact
    reason: "Python code analysis"
    priority: high
  - name: task-test-planning
    reason: "Python testing"
    priority: medium
```

## Testing Framework Mappings

### Jest

```yaml
mapping: testing-jest
triggers:
  - "jest"
  - "jest.config"
skills:
  - name: tdd-workflow
    reason: "Jest testing patterns and mocking"
    priority: high
agents:
  - name: task-test-planning
    reason: "Jest test strategy"
    priority: high
```

### Pytest

```yaml
mapping: testing-pytest
triggers:
  - "pytest"
  - "conftest.py"
skills:
  - name: tdd-workflow
    reason: "pytest fixtures and patterns"
    priority: high
agents:
  - name: task-test-planning
    reason: "pytest strategy"
    priority: high
```

### Playwright / Cypress

```yaml
mapping: testing-e2e
triggers:
  - "playwright"
  - "cypress"
skills:
  - name: tdd-workflow
    reason: "E2E testing patterns"
    priority: high
  - name: user-journey-validation
    reason: "User flow testing"
    priority: high
agents:
  - name: task-test-planning
    reason: "E2E test strategy"
    priority: high
  - name: journey-validator
    reason: "Journey validation"
    priority: high
```

## Database Mappings

### PostgreSQL / MySQL / SQL Databases

```yaml
mapping: db-sql
triggers:
  - "postgres"
  - "postgresql"
  - "mysql"
  - "mariadb"
  - "prisma"
  - "drizzle"
  - "typeorm"
  - "sequelize"
skills:
  - name: security-patterns
    reason: "SQL injection prevention"
    priority: high
  - name: performance-patterns
    reason: "Query optimization patterns"
    priority: medium
agents:
  - name: task-security
    reason: "Database security"
    priority: high
  - name: task-performance
    reason: "Query performance"
    priority: medium
  - name: task-migration
    reason: "Schema migration planning"
    priority: medium
```

### MongoDB / NoSQL

```yaml
mapping: db-nosql
triggers:
  - "mongodb"
  - "mongoose"
  - "dynamodb"
  - "firestore"
skills:
  - name: security-patterns
    reason: "NoSQL injection prevention"
    priority: high
  - name: performance-patterns
    reason: "NoSQL optimization"
    priority: medium
agents:
  - name: task-security
    reason: "NoSQL security"
    priority: high
  - name: task-performance
    reason: "Query optimization"
    priority: medium
```

## API/Integration Mappings

### GraphQL

```yaml
mapping: api-graphql
triggers:
  - "graphql"
  - "apollo"
  - "urql"
skills:
  - name: security-patterns
    reason: "GraphQL security (depth limiting, introspection)"
    priority: high
  - name: performance-patterns
    reason: "Query optimization, N+1 prevention"
    priority: medium
agents:
  - name: task-api-integration
    reason: "GraphQL schema analysis"
    priority: high
  - name: task-security
    reason: "GraphQL security"
    priority: high
```

### REST API

```yaml
mapping: api-rest
triggers:
  - "openapi"
  - "swagger"
  - "rest"
skills:
  - name: security-patterns
    reason: "REST API security"
    priority: high
agents:
  - name: task-api-integration
    reason: "REST API analysis"
    priority: high
  - name: task-security
    reason: "API security"
    priority: medium
```

## Infrastructure Mappings

### Docker / Containers

```yaml
mapping: infra-docker
triggers:
  - "docker"
  - "dockerfile"
  - "docker-compose"
  - "containerfile"
skills:
  - name: security-patterns
    reason: "Container security"
    priority: high
agents:
  - name: task-security
    reason: "Container security analysis"
    priority: high
```

### Kubernetes

```yaml
mapping: infra-k8s
triggers:
  - "kubernetes"
  - "k8s"
  - "helm"
skills:
  - name: security-patterns
    reason: "Kubernetes security"
    priority: high
  - name: performance-patterns
    reason: "Scaling patterns"
    priority: medium
agents:
  - name: task-security
    reason: "K8s security"
    priority: high
  - name: task-performance
    reason: "Scaling analysis"
    priority: medium
```

### CI/CD

```yaml
mapping: infra-cicd
triggers:
  - "github actions"
  - ".github/workflows"
  - "gitlab-ci"
  - "jenkins"
  - "circleci"
skills:
  - name: cicd-seo-integration
    reason: "CI/CD SEO validation"
    priority: low
  - name: tdd-workflow
    reason: "CI test integration"
    priority: medium
agents:
  - name: task-test-planning
    reason: "CI test strategy"
    priority: medium
```

## SEO/Marketing Mappings

### Content Sites / Marketing

```yaml
mapping: content-marketing
triggers:
  - "cms"
  - "contentful"
  - "sanity"
  - "strapi"
  - "wordpress"
  - "blog"
  - "marketing"
skills:
  - name: seo-validation
    reason: "SEO validation patterns"
    priority: high
  - name: seo-content-quality-scoring
    reason: "Content quality scoring"
    priority: high
  - name: multi-language-seo-patterns
    reason: "International SEO (if i18n detected)"
    priority: medium
  - name: geo-optimization-patterns
    reason: "AI search optimization"
    priority: medium
agents:
  - name: set-up-seo
    reason: "SEO setup"
    priority: high
```

## Documentation Mappings

### Documentation Projects

```yaml
mapping: project-documentation
triggers:
  - "docusaurus"
  - "mkdocs"
  - "vitepress"
  - "gitbook"
  - "documentation"
skills:
  - name: document-creation
    reason: "Documentation patterns"
    priority: high
  - name: research-methodology
    reason: "Research patterns"
    priority: medium
agents:
  - name: task-documentation
    reason: "Documentation analysis"
    priority: high
```

## Mapping Priority Rules

When multiple mappings match, apply in this order:

1. **Full-stack mappings** (most specific)
2. **Framework-specific mappings**
3. **Language mappings**
4. **Testing framework mappings**
5. **Database mappings**
6. **Infrastructure mappings**
7. **Generic mappings**

## Deduplication

When consolidating recommendations:
1. Keep the highest priority instance of each skill/agent
2. Concatenate reasons from all matching sources
3. Cap at 5 skills and 5 agents maximum
4. Prioritize security and testing for any code project

## Default Recommendations

If no specific stack is detected but project has code:

```yaml
mapping: default-code
triggers:
  - "code_web"
  - "code_python"
  - "hybrid"
skills:
  - name: tdd-workflow
    reason: "Default testing patterns"
    priority: medium
  - name: security-patterns
    reason: "Default security awareness"
    priority: medium
agents:
  - name: task-code-impact
    reason: "Code impact analysis"
    priority: medium
  - name: task-test-planning
    reason: "Test planning"
    priority: medium
```
