# Research Sources

> Curated authoritative sources for domain skill research

## Source Quality Criteria

| Score | Criteria |
|-------|----------|
| 10 | Official standard body (W3C, OWASP, NIST) |
| 9 | Major vendor documentation (Google, Microsoft, AWS) |
| 8 | Well-established industry resource (MDN, Auth0, Stripe) |
| 7 | Reputable technical publication (CSS-Tricks, Smashing Magazine) |
| 6 | Quality blog from recognized expert |
| 5 | General technical blog |
| < 5 | Avoid - not authoritative enough |

**Minimum threshold: 7.0**
**Minimum sources per recommendation: 3**

## Domain-Specific Sources

### Security & Authentication

| Source | URL Pattern | Quality | Topics |
|--------|-------------|---------|--------|
| OWASP Cheat Sheets | `cheatsheetseries.owasp.org` | 10 | Auth, XSS, CSRF, injection |
| NIST Guidelines | `pages.nist.gov/800-63-3` | 10 | Digital identity, passwords |
| Auth0 Docs | `auth0.com/docs` | 9 | OAuth, JWT, MFA |
| Okta Developer | `developer.okta.com` | 9 | Identity, SSO |
| CWE Database | `cwe.mitre.org` | 10 | Vulnerability patterns |

### Web Standards & Accessibility

| Source | URL Pattern | Quality | Topics |
|--------|-------------|---------|--------|
| W3C WCAG | `w3.org/WAI/WCAG21` | 10 | Accessibility standards |
| MDN Web Docs | `developer.mozilla.org` | 9 | HTML, CSS, JS, a11y |
| web.dev | `web.dev` | 9 | Performance, PWA, best practices |
| A11y Project | `a11yproject.com` | 8 | Accessibility patterns |
| Deque University | `dequeuniversity.com` | 9 | axe-core, ARIA |

### SEO & Performance

| Source | URL Pattern | Quality | Topics |
|--------|-------------|---------|--------|
| Google Search Central | `developers.google.com/search` | 10 | SEO, structured data |
| Schema.org | `schema.org` | 10 | Structured data schemas |
| Core Web Vitals | `web.dev/vitals` | 9 | Performance metrics |
| Lighthouse Docs | `developer.chrome.com/docs/lighthouse` | 9 | Auditing, metrics |
| Moz | `moz.com/learn` | 8 | SEO best practices |

### Payments & E-Commerce

| Source | URL Pattern | Quality | Topics |
|--------|-------------|---------|--------|
| Stripe Docs | `stripe.com/docs` | 9 | Payment integration |
| PCI Security Standards | `pcisecuritystandards.org` | 10 | PCI-DSS compliance |
| PayPal Developer | `developer.paypal.com` | 8 | PayPal integration |
| Shopify Partners | `shopify.dev` | 8 | E-commerce patterns |

### API Design & Backend

| Source | URL Pattern | Quality | Topics |
|--------|-------------|---------|--------|
| OpenAPI Spec | `spec.openapis.org` | 10 | API specification |
| JSON:API | `jsonapi.org` | 9 | API conventions |
| REST API Tutorial | `restfulapi.net` | 7 | REST patterns |
| GraphQL Spec | `spec.graphql.org` | 10 | GraphQL patterns |
| Twelve-Factor App | `12factor.net` | 9 | App architecture |

### Frontend & UX

| Source | URL Pattern | Quality | Topics |
|--------|-------------|---------|--------|
| React Docs | `react.dev` | 9 | React patterns |
| Vue.js Guide | `vuejs.org/guide` | 9 | Vue patterns |
| Tailwind CSS | `tailwindcss.com/docs` | 8 | Styling patterns |
| Nielsen Norman Group | `nngroup.com` | 9 | UX research, patterns |
| Smashing Magazine | `smashingmagazine.com` | 7 | Frontend best practices |

### Testing & Quality

| Source | URL Pattern | Quality | Topics |
|--------|-------------|---------|--------|
| Testing Library | `testing-library.com` | 9 | Component testing |
| Jest Docs | `jestjs.io/docs` | 9 | Unit testing |
| Playwright Docs | `playwright.dev` | 9 | E2E testing |
| Cypress Docs | `docs.cypress.io` | 9 | E2E testing |
| Martin Fowler | `martinfowler.com` | 9 | Testing patterns |

### Database & Data

| Source | URL Pattern | Quality | Topics |
|--------|-------------|---------|--------|
| PostgreSQL Docs | `postgresql.org/docs` | 10 | PostgreSQL patterns |
| MongoDB Manual | `docs.mongodb.com` | 9 | MongoDB patterns |
| Redis Docs | `redis.io/docs` | 9 | Caching patterns |
| Prisma Docs | `prisma.io/docs` | 8 | ORM patterns |

### DevOps & Infrastructure

| Source | URL Pattern | Quality | Topics |
|--------|-------------|---------|--------|
| AWS Docs | `docs.aws.amazon.com` | 9 | AWS services |
| GCP Docs | `cloud.google.com/docs` | 9 | GCP services |
| Docker Docs | `docs.docker.com` | 9 | Containerization |
| Kubernetes Docs | `kubernetes.io/docs` | 10 | Orchestration |
| GitHub Actions | `docs.github.com/actions` | 9 | CI/CD |

### Healthcare & Compliance

| Source | URL Pattern | Quality | Topics |
|--------|-------------|---------|--------|
| HHS HIPAA | `hhs.gov/hipaa` | 10 | HIPAA compliance |
| GDPR.eu | `gdpr.eu` | 9 | GDPR compliance |
| SOC 2 Academy | `secureframe.com/hub/soc-2` | 8 | SOC 2 compliance |

## Research Query Patterns

### General Domain Research
```
"{domain} best practices {current_year}"
"{domain} security checklist"
"{domain} implementation patterns"
"OWASP {domain} cheat sheet"
"{domain} testing strategies"
```

### Technology-Specific Research
```
"{framework} {domain} best practices"
"{language} {domain} patterns"
"{platform} {domain} implementation"
```

### Compliance Research
```
"{domain} compliance requirements"
"{domain} audit checklist"
"{regulation} {domain} requirements"
```

## Cache Strategy

### Memory MCP Caching
- **Key format**: `skill-research:{domain}:{query_hash}`
- **TTL**: 30 days
- **Freshness threshold**: 7 days (re-research if older)

### Cache Behavior
- Cache **accelerates** but **never suppresses**
- Always produce output, even if using cached data
- Include cache age in output metadata

### Cache Invalidation
- Invalidate when source version changes
- Invalidate on explicit user request
- Partial invalidation per domain

## Source Evaluation Process

### Step 1: Authority Check
```
1. Is the source an official standard body?
2. Is it from a major vendor's official docs?
3. Is the author a recognized expert in the field?
4. Is it cited by other authoritative sources?
```

### Step 2: Recency Check
```
1. When was the content last updated?
2. Does it reference current standards/versions?
3. Are code examples using current syntax?
4. Is the content still relevant to modern practices?
```

### Step 3: Accuracy Check
```
1. Does it align with official documentation?
2. Are claims backed by evidence or references?
3. Is the technical content correct?
4. Are there factual errors or outdated information?
```

### Step 4: Completeness Check
```
1. Does it cover the topic comprehensively?
2. Are edge cases addressed?
3. Are limitations and trade-offs mentioned?
4. Are alternatives discussed?
```

## Output Format

When including sources in recommendations:

```markdown
### Research Sources

| Source | Quality | Verified | Key Findings |
|--------|---------|----------|--------------|
| OWASP Auth Cheat Sheet | 10/10 | 2025-01 | {1-2 key points} |
| Auth0 Best Practices | 9/10 | 2025-01 | {1-2 key points} |
| NIST SP 800-63B | 10/10 | 2024-12 | {1-2 key points} |

**Average Quality**: 9.7/10
**Recommendation Confidence**: High
```
