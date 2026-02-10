---
name: analytics-patterns
description: |
  Provides analytics implementation patterns, event taxonomy design, user property
  tracking, and conversion funnel analysis. Auto-activates for analytics, tracking,
  metrics, conversion, funnel, and engagement keywords.
---

# Analytics Patterns Skill

This skill provides comprehensive patterns for implementing product analytics, including event tracking design, user property management, conversion funnels, and metrics dashboards. It covers both technical implementation and strategic measurement design.

## When This Skill Activates

- Tasks involving analytics implementation or event tracking
- Product feature planning that requires measurement
- User behavior analysis or funnel optimization
- Metrics dashboard design
- A/B testing infrastructure

### Activation Keywords

| Keyword Pattern | Confidence |
|-----------------|------------|
| analytics, tracking, metrics | High |
| conversion, funnel, cohort | High |
| event, user property, segment | High |
| PostHog, Mixpanel, Amplitude, Segment | High |
| DAU, MAU, retention, engagement | Medium |
| A/B test, experiment, variant | Medium |

### Activation File Patterns

| Pattern | Trigger |
|---------|---------|
| `lib/analytics.*`, `utils/tracking.*` | Analytics library files |
| `**/events.*`, `**/tracking.*` | Event definition files |
| `**/posthog.*`, `**/mixpanel.*`, `**/amplitude.*` | Provider-specific files |

## Core Principles

### The Analytics Pyramid

```
                    /\
                   /  \
                  / KPIs \        <- Business outcomes (few)
                 /________\
                /          \
               / Key Metrics \    <- Product health (moderate)
              /______________\
             /                \
            /  Feature Events  \  <- User actions (many)
           /____________________\
          /                      \
         /   Page Views & Sessions \  <- Foundation (automatic)
        /__________________________\
```

### Event Naming Convention

```
Pattern: [object]_[action]
Case: snake_case
Tense: past tense (completed actions)

Good:
- button_clicked
- form_submitted
- user_signed_up
- feature_used

Bad:
- click_button (wrong order)
- ButtonClick (wrong case)
- sign_up (ambiguous tense)
- userAction (too generic)
```

### Event Properties Best Practices

```typescript
// Standard event structure
interface AnalyticsEvent {
  event: string;           // Event name
  timestamp: string;       // ISO 8601
  user_id?: string;        // Anonymous or identified
  session_id: string;      // Current session
  properties: {
    // Event-specific properties
    [key: string]: string | number | boolean | null;
  };
  context: {
    // Standard context (auto-captured)
    page_url: string;
    referrer: string;
    device_type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
  };
}
```

## Event Categories

### 1. Lifecycle Events

Track user journey through the product:

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `signup_started` | Signup form shown | `source`, `method` |
| `signup_completed` | Account created | `method`, `utm_*` |
| `onboarding_started` | Onboarding begins | `signup_to_start_seconds` |
| `onboarding_step_completed` | Step finished | `step_number`, `step_name` |
| `onboarding_completed` | Onboarding done | `total_duration_seconds` |
| `activation_achieved` | First value moment | `feature`, `time_to_value` |
| `upgrade_started` | Upgrade flow begins | `current_plan`, `target_plan` |
| `subscription_activated` | Payment successful | `plan`, `billing_period` |

### 2. Feature Events

Track feature engagement:

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `feature_discovered` | Feature first seen | `feature_name`, `discovery_method` |
| `feature_clicked` | Feature clicked | `feature_name`, `location` |
| `feature_used` | Feature action complete | `feature_name`, `is_first_use` |
| `feature_error` | Feature failed | `feature_name`, `error_type` |

### 3. Engagement Events

Track ongoing engagement:

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `session_started` | User opens app | `referrer`, `return_days` |
| `session_ended` | User leaves | `duration_seconds`, `pages_viewed` |
| `content_viewed` | Content consumed | `content_type`, `content_id` |
| `search_performed` | User searches | `query`, `results_count` |
| `filter_applied` | Filter changed | `filter_type`, `filter_value` |

### 4. Commerce Events (if applicable)

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `product_viewed` | Product page load | `product_id`, `category` |
| `cart_updated` | Item add/remove | `action`, `item_id`, `quantity` |
| `checkout_started` | Checkout begins | `cart_value`, `item_count` |
| `purchase_completed` | Order confirmed | `order_id`, `revenue` |

## User Properties

### Identity Properties (Set Once)

```typescript
interface UserIdentity {
  user_id: string;              // Internal ID
  created_at: string;           // Signup date
  signup_method: string;        // email, google, github
  initial_utm_source: string;   // First touch
  initial_utm_medium: string;
  initial_utm_campaign: string;
  initial_referrer: string;
}
```

### Profile Properties (Update Occasionally)

```typescript
interface UserProfile {
  email?: string;               // If consented
  plan_tier: string;            // Current plan
  company_size?: string;        // B2B segmentation
  industry?: string;            // B2B segmentation
  timezone: string;
  locale: string;
}
```

### Behavior Properties (Update Frequently)

```typescript
interface UserBehavior {
  session_count: number;
  total_events: number;
  features_used: string[];
  last_active_at: string;
  lifecycle_stage: 'new' | 'activated' | 'engaged' | 'power_user' | 'churned';
  days_since_last_active: number;
}
```

## Conversion Funnels

### Standard Funnels

#### Signup Funnel
```
landing_page_viewed -> signup_started -> signup_completed -> email_verified -> onboarding_completed
```

#### Activation Funnel
```
signup_completed -> first_login -> profile_created -> core_feature_used -> return_visit
```

#### Upgrade Funnel
```
upgrade_prompt_viewed -> pricing_page_viewed -> upgrade_started -> payment_entered -> subscription_activated
```

### Funnel Analysis Patterns

```typescript
// Calculate funnel conversion
function calculateFunnelConversion(
  steps: string[],
  events: Event[],
  window: number = 7 * 24 * 60 * 60 * 1000 // 7 days
): FunnelResult {
  const result: FunnelResult = {
    steps: [],
    overall_conversion: 0,
  };

  let currentUsers = new Set(events.map(e => e.user_id));

  for (let i = 0; i < steps.length; i++) {
    const stepEvents = events.filter(e => e.event === steps[i]);
    const usersAtStep = new Set(stepEvents.map(e => e.user_id));

    const converted = i === 0
      ? usersAtStep
      : new Set([...usersAtStep].filter(u => currentUsers.has(u)));

    result.steps.push({
      name: steps[i],
      users: converted.size,
      conversion_from_previous: i === 0 ? 1 : converted.size / currentUsers.size,
    });

    currentUsers = converted;
  }

  result.overall_conversion = result.steps[steps.length - 1].users / result.steps[0].users;
  return result;
}
```

## Implementation Patterns

### Analytics Wrapper

```typescript
// lib/analytics.ts
import posthog from 'posthog-js';

const isProduction = process.env.NODE_ENV === 'production';
const isEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';

export const analytics = {
  init: () => {
    if (isProduction && isEnabled) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // Manual pageviews
        capture_pageleave: true,
        autocapture: false, // Explicit events only
      });
    }
  },

  identify: (userId: string, properties?: Record<string, any>) => {
    if (isProduction && isEnabled) {
      posthog.identify(userId, properties);
    }
    console.debug('[Analytics] identify:', userId, properties);
  },

  track: (event: string, properties?: Record<string, any>) => {
    if (isProduction && isEnabled) {
      posthog.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    }
    console.debug('[Analytics] track:', event, properties);
  },

  page: (path: string) => {
    if (isProduction && isEnabled) {
      posthog.capture('$pageview', { $current_url: path });
    }
    console.debug('[Analytics] page:', path);
  },

  reset: () => {
    if (isProduction && isEnabled) {
      posthog.reset();
    }
  },
};
```

### React Hook Pattern

```typescript
// hooks/use-analytics.ts
import { useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics';

export function useAnalytics() {
  const pathname = usePathname();

  // Track page views
  useEffect(() => {
    analytics.page(pathname);
  }, [pathname]);

  const track = useCallback((event: string, properties?: Record<string, any>) => {
    analytics.track(event, properties);
  }, []);

  return { track };
}

// Usage
function SignupForm() {
  const { track } = useAnalytics();

  const handleSubmit = async (data: FormData) => {
    track('signup_started', { method: 'email' });

    const result = await signup(data);

    if (result.success) {
      track('signup_completed', {
        method: 'email',
        source: utm_source,
      });
    } else {
      track('signup_failed', {
        error: result.error,
      });
    }
  };
}
```

### Server-Side Tracking

```typescript
// For server actions / API routes
import { PostHog } from 'posthog-node';

const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST,
});

export async function trackServerEvent(
  userId: string,
  event: string,
  properties?: Record<string, any>
) {
  await posthog.capture({
    distinctId: userId,
    event,
    properties: {
      ...properties,
      $lib: 'server',
      timestamp: new Date().toISOString(),
    },
  });
}

// Flush on serverless function end
export async function flushAnalytics() {
  await posthog.shutdown();
}
```

## Privacy Compliance

### Consent Management

```typescript
// hooks/use-consent.ts
export function useConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('analytics_consent');
    setConsent(stored === 'true');
  }, []);

  const acceptConsent = () => {
    localStorage.setItem('analytics_consent', 'true');
    setConsent(true);
    analytics.init();
  };

  const denyConsent = () => {
    localStorage.setItem('analytics_consent', 'false');
    setConsent(false);
  };

  return { consent, acceptConsent, denyConsent };
}
```

### Data to Avoid Tracking

| Data Type | Risk | Alternative |
|-----------|------|-------------|
| Email | PII | Track user_id only |
| Full name | PII | Track anonymous segments |
| Phone | PII | Never track |
| IP address | PII (some laws) | Let analytics tool anonymize |
| Location (precise) | Privacy | Use country/region only |
| Financial details | Sensitive | Track amounts, not card numbers |

## A/B Testing Patterns

### Feature Flag Integration

```typescript
// Using PostHog feature flags
import { useFeatureFlagEnabled } from 'posthog-js/react';

function PricingPage() {
  const showNewPricing = useFeatureFlagEnabled('new-pricing-page');

  useEffect(() => {
    analytics.track('pricing_page_viewed', {
      variant: showNewPricing ? 'new' : 'control',
    });
  }, [showNewPricing]);

  return showNewPricing ? <NewPricingPage /> : <OldPricingPage />;
}
```

### Experiment Events

```typescript
// Standard experiment tracking
analytics.track('experiment_viewed', {
  experiment_id: 'pricing-test-2024',
  variant: 'new-pricing',
  user_segment: 'free_users',
});

analytics.track('experiment_converted', {
  experiment_id: 'pricing-test-2024',
  variant: 'new-pricing',
  conversion_event: 'upgrade_completed',
});
```

## Key Metrics Reference

| Metric | Formula | Good Benchmark |
|--------|---------|----------------|
| **DAU** | Unique users/day | Growing |
| **MAU** | Unique users/month | Growing |
| **DAU/MAU** | Stickiness | > 20% |
| **Activation Rate** | Activated/Signups | > 40% |
| **D1 Retention** | Return day 1 | > 40% |
| **D7 Retention** | Return day 7 | > 20% |
| **D30 Retention** | Return day 30 | > 10% |
| **Conversion Rate** | Paid/Total | > 5% (B2C), > 10% (B2B) |
| **ARPU** | Revenue/Users | Industry dependent |
| **LTV** | Total user value | > 3x CAC |

## Constraints

- Never track PII without explicit consent
- Prefer server-side tracking for sensitive events
- Always test tracking in development first
- Document every event in a tracking plan
- Review analytics quarterly for relevance
- Remove unused events to reduce noise
