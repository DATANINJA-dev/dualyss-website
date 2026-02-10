---
name: security-patterns
description: |
  Security patterns for application development including OWASP Top 10 2025, framework-specific
  security patterns, vulnerability detection, and supply chain security. Auto-activates when
  tasks involve security, authentication, authorization, OWASP, vulnerabilities, XSS, CSRF,
  injection, cryptography, encryption, or supply chain security.
---

# security-patterns

## Type
passive

## Auto-Activation Triggers

- User mentions: "security", "auth", "authentication", "authorization", "OWASP", "vulnerability", "XSS", "CSRF", "injection", "SQL injection", "cryptography", "encryption", "supply chain", "SBOM", "DPoP"
- When implementing authentication or authorization flows
- During security audits or vulnerability assessments
- When reviewing code for security issues
- When configuring security headers or middleware
- When handling sensitive data (PII, credentials, tokens)

## Description

Provides comprehensive security patterns for application development, including OWASP Top 10 2025 checklists, framework-specific security patterns, vulnerability detection, supply chain security, and security testing guidance.

Use when:
- Implementing authentication/authorization systems
- Reviewing code for security vulnerabilities
- Setting up security middleware or headers
- Handling sensitive data or credentials
- Running security audits or assessments
- Configuring SAST/DAST tools

## Supporting Files

| File | Status | Description |
|------|--------|-------------|
| owasp-top-10.md | Active | OWASP Top 10 2025 comprehensive checklist with mitigations |
| framework-patterns.md | Active | React, Node.js/Express, Python/Django, FastAPI security patterns |
| vulnerability-patterns.md | Active | SQL injection, XSS, CSRF, SSRF detection patterns |
| security-testing.md | Active | SAST, DAST, SCA, secret scanning guidance |
| auth-patterns.md | Active | OAuth 2.0, JWT, session management, MFA patterns |

## Quick Reference

### OWASP Top 10 2025 Categories

| # | Category | Risk Level |
|---|----------|------------|
| A01 | Broken Access Control | Critical |
| A02 | Cryptographic Failures | Critical |
| A03 | Software Supply Chain Failures | High |
| A04 | Insecure Design | High |
| A05 | Security Misconfiguration | High |
| A06 | Vulnerable Components | Medium |
| A07 | Authentication Failures | High |
| A08 | Data Integrity Failures | Medium |
| A09 | Logging Failures | Medium |
| A10 | Mishandling of Exceptional Conditions | Medium |

### Common Security Keywords

When these keywords appear in task descriptions, this skill auto-activates:
- **Authentication**: login, logout, session, token, OAuth, JWT, MFA, 2FA
- **Authorization**: role, permission, access control, RBAC, policy
- **Vulnerabilities**: XSS, CSRF, SQLi, injection, SSRF, RCE, supply chain
- **Data Protection**: encryption, hashing, PII, GDPR, credentials, cryptography
- **Supply Chain**: SBOM, dependencies, build security, SLSA
- **Security Tools**: SAST, DAST, penetration test, security audit

## Integration Points

This skill is consumed by:
- `task-security.md` agent for security analysis during `/refine`
- Task skill discovery for security-related task detection
- `/audit` system for security pattern validation

## Research Sources

| Topic | Source | Notes |
|-------|--------|-------|
| OWASP Top 10 | [OWASP 2025](https://owasp.org/Top10/) | Current edition |
| Supply Chain | [SLSA Framework](https://slsa.dev/) | Supply chain security levels |
| SBOM Standards | [CycloneDX](https://cyclonedx.org/), [SPDX](https://spdx.dev/) | Bill of materials formats |
| OAuth DPoP | [RFC 9449](https://datatracker.ietf.org/doc/rfc9449/) | Token binding |
| Secure Coding | [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/) | Comprehensive guides |
| Framework Security | Official documentation | React, Node.js, Python docs |
