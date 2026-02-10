# Task Domain Patterns

> Mappings from task domains to validation skills and best practices

## Task Domain Detection

### Keywords → Task Domain Mapping

| Keywords | Domain | Confidence |
|----------|--------|------------|
| login, auth, password, session, JWT, OAuth | `authentication` | high |
| permission, role, RBAC, access, authorize | `authorization` | high |
| payment, checkout, Stripe, billing, invoice | `payments` | high |
| SEO, meta, sitemap, structured data, robots | `seo` | high |
| accessible, WCAG, aria, screen reader, a11y | `accessibility` | high |
| form, validation, input, submit, field | `forms` | medium |
| API, endpoint, REST, GraphQL, request | `api` | medium |
| test, spec, coverage, mock, assert | `testing` | medium |
| database, query, migration, schema, model | `database` | medium |
| cache, Redis, performance, optimize, CDN | `performance` | medium |
| upload, file, image, storage, S3 | `file_handling` | medium |
| email, notification, SMS, push, alert | `notifications` | medium |
| search, filter, sort, pagination, query | `search` | medium |
| chart, graph, dashboard, visualization | `visualization` | medium |
| mobile, responsive, touch, viewport | `mobile` | medium |
| i18n, localization, translation, locale | `internationalization` | high |
| security, XSS, CSRF, injection, sanitize | `security` | high |
| CI, CD, deploy, pipeline, release | `devops` | medium |

## Task Domain → Validation Skills

### Authentication Domain
```yaml
domain: authentication
skill_name: auth-patterns
type: active
priority: critical

checklist:
  - Secure password hashing (bcrypt, argon2)
  - Session management (httpOnly, secure cookies)
  - JWT best practices (short expiry, refresh tokens)
  - OAuth 2.0 / OIDC implementation
  - MFA support (TOTP, SMS, WebAuthn)
  - Account lockout after failed attempts
  - Password strength requirements
  - Secure password reset flow
  - Session invalidation on password change
  - Audit logging for auth events

testing:
  - Password hash timing attack prevention
  - Session fixation prevention
  - Token refresh edge cases
  - Concurrent session handling

research_queries:
  - "authentication best practices {year}"
  - "OWASP authentication cheat sheet"
  - "secure session management patterns"
```

### Authorization Domain
```yaml
domain: authorization
skill_name: rbac-patterns
type: active
priority: critical

checklist:
  - Role-based access control (RBAC)
  - Attribute-based access control (ABAC)
  - Permission inheritance
  - Resource-level permissions
  - API endpoint authorization
  - UI element visibility control
  - Audit trail for permission changes
  - Principle of least privilege

testing:
  - Horizontal privilege escalation
  - Vertical privilege escalation
  - Permission boundary testing
  - Role switching edge cases
```

### Payments Domain
```yaml
domain: payments
skill_name: payment-integration
type: active
priority: critical

checklist:
  - PCI-DSS compliance basics
  - Stripe/PayPal integration patterns
  - Idempotency keys for transactions
  - Webhook signature verification
  - Failed payment retry logic
  - Refund and chargeback handling
  - Invoice generation
  - Tax calculation integration
  - Multi-currency support

testing:
  - Test card scenarios (decline, 3DS, etc.)
  - Webhook replay protection
  - Concurrent transaction handling
  - Partial refund scenarios
```

### SEO Domain
```yaml
domain: seo
skill_name: seo-standards
type: active
priority: high

checklist:
  - Meta tags (title, description, og:*)
  - Structured data (JSON-LD schema)
  - XML sitemap generation
  - Robots.txt configuration
  - Canonical URLs
  - Open Graph / Twitter cards
  - Core Web Vitals optimization
  - Mobile-first indexing
  - Internal linking structure
  - URL slug best practices

testing:
  - Lighthouse SEO audit
  - Schema validation
  - Mobile-friendly test
  - Page speed insights

research_queries:
  - "SEO best practices {year}"
  - "Core Web Vitals optimization"
  - "structured data patterns"
```

### Accessibility Domain
```yaml
domain: accessibility
skill_name: accessibility-standards
type: active
priority: high

checklist:
  - WCAG 2.1 AA compliance
  - Semantic HTML structure
  - ARIA labels and roles
  - Keyboard navigation
  - Focus management
  - Color contrast (4.5:1 minimum)
  - Alt text for images
  - Form label associations
  - Error message accessibility
  - Screen reader testing

testing:
  - axe-core automated testing
  - VoiceOver/NVDA manual testing
  - Keyboard-only navigation
  - High contrast mode

research_queries:
  - "WCAG 2.1 guidelines"
  - "accessible form patterns"
  - "screen reader best practices"
```

### Forms Domain
```yaml
domain: forms
skill_name: form-patterns
type: active
priority: medium

checklist:
  - Client-side validation
  - Server-side validation
  - Error message placement
  - Inline validation feedback
  - Field-level help text
  - Required field indication
  - Input masking (phone, date)
  - Multi-step form patterns
  - Form state persistence
  - Submission error recovery

testing:
  - Validation bypass attempts
  - Edge case inputs
  - Form abandonment tracking
```

### API Domain
```yaml
domain: api
skill_name: api-design
type: active
priority: high

checklist:
  - RESTful conventions (or GraphQL)
  - Consistent error responses
  - API versioning strategy
  - Rate limiting headers
  - Pagination patterns
  - Filtering and sorting
  - OpenAPI/Swagger documentation
  - Authentication headers
  - CORS configuration
  - Request/response logging

testing:
  - Contract testing
  - Load testing
  - Error response validation
```

### Security Domain
```yaml
domain: security
skill_name: security-patterns
type: active
priority: critical

checklist:
  - Input sanitization
  - Output encoding (XSS prevention)
  - CSRF token implementation
  - SQL injection prevention
  - Secure headers (CSP, HSTS, etc.)
  - Dependency vulnerability scanning
  - Secrets management
  - Rate limiting
  - File upload validation
  - Error message sanitization

testing:
  - OWASP Top 10 testing
  - Penetration testing patterns
  - Security header validation

research_queries:
  - "OWASP security cheat sheets"
  - "web application security {year}"
  - "secure coding practices"
```

### Performance Domain
```yaml
domain: performance
skill_name: performance-patterns
type: active
priority: medium

checklist:
  - Database query optimization
  - N+1 query prevention
  - Caching strategies (Redis, CDN)
  - Image optimization
  - Code splitting / lazy loading
  - Bundle size optimization
  - Database indexing
  - Connection pooling
  - Background job processing

testing:
  - Lighthouse performance audit
  - Database query profiling
  - Load testing with k6 or similar
```

### Internationalization Domain
```yaml
domain: internationalization
skill_name: i18n-patterns
type: active
priority: medium

checklist:
  - String externalization
  - ICU message format
  - Pluralization rules
  - Date/time formatting
  - Number/currency formatting
  - RTL layout support
  - Language detection
  - Locale switching
  - Translation workflow

testing:
  - Pseudo-localization testing
  - RTL layout verification
  - Date format edge cases
```

### General Domain (Fallback)
```yaml
domain: general
skill_name: null  # No specific skill, use foundational patterns
type: passive
priority: medium

checklist:
  - Review task requirements thoroughly
  - Apply relevant patterns from existing skills
  - Consider security implications (security-patterns)
  - Consider performance implications (performance-patterns)
  - Consider UX implications (ux-standards)
  - Write tests first (tdd-workflow)

testing:
  - Unit tests for core functionality
  - Integration tests for external boundaries
  - Edge case coverage

research_queries:
  - "{task_description} best practices {year}"
  - "{task_description} common pitfalls"
```

**Note**: When no specific domain is detected:
1. Return `domain: general` with `confidence: low`
2. Apply foundational checklist from general domain
3. Recommend research with research-methodology skill
4. Ask user for domain clarification if needed

## Skill Existence Mapping

The following maps domains to EXISTING skills in `skill-registry.json`:

| Domain | Existing Skill | Notes |
|--------|---------------|-------|
| authentication | `security-patterns` | Covers auth security basics |
| authorization | `security-patterns` | RBAC/ABAC patterns included |
| payments | *none* | Research needed |
| seo | `seo-validation`, `seo-content-quality-scoring`, `multi-language-seo-patterns` | Multiple skills |
| accessibility | `ux-standards` | WCAG patterns included |
| forms | *none* | Research needed |
| api | *none* | Research needed |
| security | `security-patterns` | Full coverage |
| performance | `performance-patterns` | Full coverage |
| internationalization | `multi-language-seo-patterns` | i18n SEO focus |
| testing | `tdd-workflow` | TDD patterns |
| general | *foundational* | Use security + performance + ux |

**Skills referenced but NOT existing** (marked `# (planned)` above):
- `auth-patterns` → Use `security-patterns`
- `rbac-patterns` → Use `security-patterns`
- `payment-integration` → Research needed
- `seo-standards` → Use `seo-validation`
- `accessibility-standards` → Use `ux-standards`
- `form-patterns` → Research needed
- `api-design` → Research needed
- `i18n-patterns` → Use `multi-language-seo-patterns`

## Enhancement Mode

When skill exists for a task domain:
1. Check if task introduces NEW aspects not covered
2. Research latest standards (may have updated since skill creation)
3. Suggest `update` with specific content additions
4. Priority: high if security-related, medium otherwise
