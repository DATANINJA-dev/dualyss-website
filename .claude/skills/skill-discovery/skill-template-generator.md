# Skill Template Generator

> Templates for generating new domain skills

## Skill Structure

All skills follow this directory structure:

```
.claude/skills/{skill-name}/
├── SKILL.md              # Required: Main skill file
├── best-practices.md     # Optional: Domain best practices
├── checklists.md         # Optional: Validation checklists
├── patterns.md           # Optional: Implementation patterns
└── research-sources.md   # Optional: Curated sources
```

## SKILL.md Template

```markdown
# {Skill Name}

> {One-line description of what this skill enables}

## Purpose

{2-3 sentences explaining when and why to use this skill}

## Activation Triggers

This skill activates when:
- Task domain matches: `{domain_keywords}`
- Command context: `/set-up`, `/develop-task`
- Referenced explicitly

## Checklist

### Critical
- [ ] {Critical requirement 1}
- [ ] {Critical requirement 2}

### Required
- [ ] {Required item 1}
- [ ] {Required item 2}
- [ ] {Required item 3}

### Recommended
- [ ] {Recommended item 1}
- [ ] {Recommended item 2}

## Implementation Patterns

### Pattern 1: {Pattern Name}
```{language}
{Code example}
```

### Pattern 2: {Pattern Name}
```{language}
{Code example}
```

## Testing Requirements

| Test Type | Tool | Criteria |
|-----------|------|----------|
| {Type 1} | {Tool} | {Pass criteria} |
| {Type 2} | {Tool} | {Pass criteria} |

## Research Sources

| Source | Quality | Last Verified |
|--------|---------|---------------|
| {Source 1} | {score}/10 | {date} |
| {Source 2} | {score}/10 | {date} |

## Related Skills

- `{related-skill-1}` - {relationship}
- `{related-skill-2}` - {relationship}
```

## Active vs Passive Skills

### Active Skill (Knowledge + Workflows)

Active skills include:
- **Checklists**: Validation requirements
- **Patterns**: Implementation code examples
- **Testing**: Specific test requirements
- **Tools**: Recommended tooling

Use for domains with:
- Security implications
- Compliance requirements
- Complex implementation patterns
- Testable outcomes

### Passive Skill (Knowledge Only)

Passive skills include:
- **Best practices**: Guidelines and principles
- **Patterns**: Conceptual patterns (not code)
- **References**: Documentation links

Use for domains with:
- Conceptual knowledge
- Design principles
- Non-testable guidelines

## Generation Process

### Step 1: Domain Analysis
```
1. Identify domain keywords
2. Map to existing patterns (project-type-patterns.md, task-domain-patterns.md)
3. Determine skill type (active/passive)
4. List critical vs recommended requirements
```

### Step 2: Research Phase
```
1. Query authoritative sources (research-sources.md)
2. Gather minimum 3 sources with quality >= 7.0
3. Extract checklists and patterns
4. Verify recency (prefer sources < 2 years old)
```

### Step 3: Content Generation
```
1. Create SKILL.md using template above
2. Populate checklist from research
3. Add code patterns if active skill
4. Document testing requirements
5. Include research sources with scores
```

### Step 4: Validation
```
1. Verify all checklist items are actionable
2. Verify code patterns are syntactically correct
3. Verify testing requirements are measurable
4. Verify sources are accessible
```

## Example: Generated auth-patterns Skill

```markdown
# Authentication Patterns

> Secure authentication implementation patterns for web applications

## Purpose

This skill provides checklists and patterns for implementing secure authentication,
including password handling, session management, and multi-factor authentication.

## Activation Triggers

This skill activates when:
- Task domain matches: `login`, `auth`, `password`, `session`, `JWT`, `OAuth`
- Command context: `/set-up`, `/develop-task`
- Referenced explicitly

## Checklist

### Critical
- [ ] Passwords hashed with bcrypt (cost >= 10) or argon2
- [ ] Sessions use httpOnly, secure, sameSite cookies
- [ ] JWT tokens have short expiry (< 15 min for access tokens)
- [ ] Account lockout after 5 failed attempts

### Required
- [ ] Password minimum 8 characters with complexity
- [ ] Session invalidation on password change
- [ ] Secure password reset with expiring tokens
- [ ] Rate limiting on auth endpoints

### Recommended
- [ ] MFA support (TOTP preferred)
- [ ] WebAuthn/passkey support
- [ ] Device/location-based risk assessment
- [ ] Audit logging for all auth events

## Implementation Patterns

### Pattern 1: Password Hashing
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Pattern 2: Session Cookie
```typescript
const sessionOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};
```

## Testing Requirements

| Test Type | Tool | Criteria |
|-----------|------|----------|
| Password hash timing | custom | Constant time comparison |
| Session fixation | OWASP ZAP | No vulnerabilities found |
| Brute force protection | custom | Lockout after 5 attempts |
| JWT validation | jest | Expired tokens rejected |

## Research Sources

| Source | Quality | Last Verified |
|--------|---------|---------------|
| OWASP Authentication Cheat Sheet | 10/10 | 2025-01 |
| Auth0 Best Practices Guide | 9/10 | 2025-01 |
| NIST Digital Identity Guidelines | 10/10 | 2024-12 |
```

## Output to User

When recommending a skill, present:

```
## Skill Recommendation

**Domain**: {domain}
**Skill**: {skill-name}
**Type**: {active/passive}
**Priority**: {critical/high/medium/low/info}
**Enhancement**: {new/update/expand}

### Rationale
{Why this skill is needed for this task/project}

### Suggested Content
{Key checklist items from research}

### Research Sources
1. {Source 1} (Quality: {score}/10)
2. {Source 2} (Quality: {score}/10)
3. {Source 3} (Quality: {score}/10)

### Action
[C]reate skill | [S]elect existing | [L]ater | [N]one
```
