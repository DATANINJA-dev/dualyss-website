# Project Type Patterns

> Mappings from project types to recommended domain skills

## Project Type Detection

### Keywords → Project Type Mapping

| Keywords | Project Type | Confidence |
|----------|--------------|------------|
| SaaS, subscription, monthly, tenant, multi-tenant | `saas` | high |
| e-commerce, shop, cart, checkout, products, orders | `ecommerce` | high |
| educational, learning, courses, students, lessons | `educational` | high |
| report, analytics, dashboard, metrics, data | `reporting` | high |
| blog, content, articles, posts, cms | `content` | medium |
| social, feed, posts, followers, messaging | `social` | high |
| fintech, banking, payments, transactions, ledger | `fintech` | high |
| healthcare, patients, appointments, medical, HIPAA | `healthcare` | high |
| real estate, properties, listings, agents | `realestate` | medium |
| marketplace, buyers, sellers, listings | `marketplace` | high |
| booking, reservations, scheduling, appointments | `booking` | high |
| gaming, players, scores, achievements, levels | `gaming` | medium |
| API, endpoints, integration, SDK | `api_platform` | medium |

## Project Type → Domain Skills

### SaaS Projects
```yaml
type: saas
priority_skills:
  critical:
    - security-patterns      # EXISTS - use for auth, security
    - auth-patterns          # (planned) → use security-patterns
    - multi-tenancy          # (planned)
  high:
    - subscription-billing   # (planned)
    - onboarding-ux          # (planned) → use ux-standards
    - analytics-tracking     # (planned)
    - performance-patterns   # EXISTS
  medium:
    - email-transactional    # (planned)
    - rate-limiting          # (planned) → see security-patterns
  low:
    - white-labeling         # (planned)
```

### E-Commerce Projects
```yaml
type: ecommerce
priority_skills:
  critical:
    - security-patterns      # EXISTS - payment security, PCI basics
    - payment-integration    # (planned)
    - inventory-management   # (planned)
  high:
    - cart-patterns          # (planned) → use ux-standards for cart UX
    - product-catalog        # (planned)
    - order-management       # (planned)
    - seo-validation         # EXISTS - product schema
    - performance-patterns   # EXISTS
  medium:
    - seo-ecommerce          # (planned) → use seo-validation
    - recommendation-engine  # (planned)
  low:
    - loyalty-programs       # (planned)
```

### Educational Projects
```yaml
type: educational
priority_skills:
  critical:
    - content-delivery       # (planned)
    - progress-tracking      # (planned)
    - ux-standards           # EXISTS - learning UX
  high:
    - assessment-patterns    # (planned)
    - learning-paths         # (planned)
    - accessibility-education # (planned) → use ux-standards (WCAG)
  medium:
    - gamification           # (planned)
    - discussion-forums      # (planned)
  low:
    - live-sessions          # (planned)
```

### Reporting/Analytics Projects
```yaml
type: reporting
priority_skills:
  critical:
    - data-visualization     # (planned)
    - query-optimization     # (planned) → see performance-patterns
    - performance-patterns   # EXISTS
  high:
    - export-formats         # (planned)
    - scheduled-reports      # (planned)
    - filtering-patterns     # (planned)
  medium:
    - data-caching           # (planned) → see performance-patterns
    - access-control-reports # (planned) → see security-patterns
  low:
    - custom-report-builder  # (planned)
```

### FinTech Projects
```yaml
type: fintech
priority_skills:
  critical:
    - security-patterns      # EXISTS - PCI-DSS, encryption, key management
    - financial-compliance   # (planned) → see security-patterns
    - transaction-patterns   # (planned)
  high:
    - payment-processing     # (planned)
    - fraud-detection        # (planned)
    - audit-logging          # (planned) → see security-patterns
    - performance-patterns   # EXISTS - transaction performance
  medium:
    - currency-handling      # (planned)
    - notification-fintech   # (planned)
  low:
    - regulatory-reporting   # (planned)
```

### Healthcare Projects
```yaml
type: healthcare
priority_skills:
  critical:
    - security-patterns      # EXISTS - PHI handling, encryption, audit
    - hipaa-compliance       # (planned) → see security-patterns
    - patient-data-security  # (planned) → see security-patterns
  high:
    - appointment-scheduling # (planned)
    - medical-records        # (planned)
    - ux-standards           # EXISTS - WCAG, assistive tech
    - accessibility-healthcare # (planned) → use ux-standards
  medium:
    - telehealth-patterns    # (planned)
    - insurance-integration  # (planned)
  low:
    - prescription-management # (planned)
```

### Marketplace Projects
```yaml
type: marketplace
priority_skills:
  critical:
    - security-patterns      # EXISTS - dual-sided auth, payment security
    - dual-sided-auth        # (planned) → see security-patterns
    - escrow-payments        # (planned)
  high:
    - listing-management     # (planned)
    - search-marketplace     # (planned)
    - dispute-resolution     # (planned)
    - ux-standards           # EXISTS - marketplace UX patterns
  medium:
    - rating-reviews         # (planned)
    - messaging-marketplace  # (planned)
  low:
    - featured-listings      # (planned)
```

### Booking/Scheduling Projects
```yaml
type: booking
priority_skills:
  critical:
    - availability-management # (planned)
    - reservation-patterns   # (planned)
    - user-journey-validation # EXISTS - booking flow validation
  high:
    - reminder-notifications # (planned)
    - resource-allocation    # (planned)
    - timezone-handling      # (planned) → see multi-language-seo-patterns
    - ux-standards           # EXISTS - booking UX
  medium:
    - waitlist-patterns      # (planned)
    - recurring-bookings     # (planned)
  low:
    - capacity-optimization  # (planned)
```

## Research Queries

When project type is detected, research with these queries:

```
"{project_type} application best practices {year}"
"{project_type} architecture patterns"
"{project_type} security requirements"
"{project_type} UX patterns"
"{project_type} compliance requirements"
```

### General/Unknown Projects
```yaml
type: general
priority_skills:
  high:
    - security-patterns      # EXISTS - All projects need security
    - performance-patterns   # EXISTS - All projects benefit from performance
  medium:
    - ux-standards          # EXISTS - User experience applies broadly
    - tdd-workflow          # EXISTS - Testing is universal
  low:
    - error-handling        # EXISTS - Consistent error patterns
```

**Note**: When no specific project type is detected with high confidence:
1. Return `type: general` with `confidence: low`
2. Recommend foundational skills from the general category
3. Ask user: "I couldn't determine your project type. Is it one of [list detected possibilities]?"

## Enhancement Mode

When skills already exist for a project type:
1. Check skill creation date vs current date
2. If > 6 months old: Research for updated standards
3. Compare existing content to research findings
4. Suggest `update` or `expand` if gaps found

## Skill Existence Validation

**IMPORTANT**: Before recommending any skill, verify it exists in `skill-registry.json`.

Skills marked `# (planned)` in this file are NOT yet created:
- `auth-patterns` → Use `security-patterns` instead
- `multi-tenancy` → No replacement, research needed
- `subscription-billing` → No replacement, research needed
- `payment-integration` → No replacement, research needed
- `onboarding-ux` → Use `ux-standards` instead
- All other unlisted skills → Check registry or research

**Fallback behavior**:
1. If recommended skill doesn't exist in registry
2. Check if domain_mapping provides an alternative
3. If no alternative, recommend research with research-methodology skill
4. Never recommend non-existent skills without marking as "requires creation"
