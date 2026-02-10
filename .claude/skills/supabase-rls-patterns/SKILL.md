# Supabase RLS Patterns

```yaml
name: supabase-rls-patterns
description: Production-ready Row-Level Security patterns for Supabase applications
```

## Overview

Comprehensive patterns for implementing Supabase Row-Level Security (RLS) in production applications. This skill bridges the gap between "RLS exists" and "secure multi-tenant SaaS" with battle-tested patterns informed by real-world vulnerabilities (CVE-2025-48757).

**Type**: passive (auto-activates on trigger keywords)

## Auto-Activation Triggers

This skill activates automatically when:

### Keywords
- "RLS"
- "Row Level Security"
- "Supabase policies"
- "auth.uid()"
- "rls policy"
- "postgres policy"
- "database security"
- "USING clause"
- "WITH CHECK"
- "service role"
- "anon key"

### File Patterns
- `**/*.sql`
- `**/migrations/**`
- `**/supabase/**`
- `**/*policy*.sql`

### Task Contexts
- Supabase project implementations
- Multi-tenant SaaS applications
- Database security reviews
- Authentication/authorization implementations

## Supporting Files

| File | Purpose |
|------|---------|
| [rls-policy-patterns.md](./rls-policy-patterns.md) | CRUD policy templates for all operations |
| [multi-tenant-rls.md](./multi-tenant-rls.md) | Organization/team access isolation patterns |
| [service-role-patterns.md](./service-role-patterns.md) | When/how to safely bypass RLS |
| [rls-testing.md](./rls-testing.md) | Local testing strategies with pgTAP |
| [rls-performance.md](./rls-performance.md) | Query optimization with RLS enabled |
| [common-pitfalls.md](./common-pitfalls.md) | Security anti-patterns and CVE analysis |

## Quick Reference

### Pattern Categories

| Category | Use When |
|----------|----------|
| **User-Owned Data** | Each user owns their own records |
| **Organization Access** | Team members share access to org data |
| **Role-Based Access** | Different permissions by role (admin, member, viewer) |
| **Public + Authenticated** | Some data public, writes require auth |
| **Hierarchical Access** | Nested teams with inherited permissions |

### Policy Types

| Policy Type | Clause | Purpose |
|-------------|--------|---------|
| SELECT | `USING` | Filter which rows can be read |
| INSERT | `WITH CHECK` | Validate new rows before insert |
| UPDATE | `USING` + `WITH CHECK` | Filter readable + validate changes |
| DELETE | `USING` | Filter which rows can be deleted |

### Security Priority

1. **Enable RLS** on all user-facing tables
2. **Deny by default** - explicit grants only
3. **Never trust client data** - validate server-side
4. **Test policies** before production deployment
5. **Audit bypass operations** when using service role

## Integration Points

### Consumed By
- `task-security` - Security analysis during task refinement
- `task-code-impact` - Code impact assessment for Supabase changes
- `stack-skill-recommender` - Recommended for Supabase projects
- `develop-task` - Referenced during implementation

### Works With
- `security-patterns` - General application security
- `typescript-advanced-patterns` - Type-safe Supabase clients

## Security Warning

> **CVE-2025-48757**: Analysis of 170+ applications found common RLS misconfigurations leading to data exposure. This skill documents these patterns to help you avoid them.

Key vulnerabilities addressed:
- Using `user_metadata` in policies (user-controllable)
- Missing `SECURITY INVOKER` on policy functions
- Overly permissive default policies
- Forgetting DELETE policies

## Research Sources

- Supabase official RLS documentation (2026)
- CVE-2025-48757 security analysis
- Production patterns from enterprise implementations
- Community patterns from GitHub and Supabase Discord
- pgTAP testing best practices

## Related Skills

- [security-patterns](../security-patterns/SKILL.md) - OWASP and general security
- [typescript-advanced-patterns](../typescript-advanced-patterns/SKILL.md) - Type-safe implementations
