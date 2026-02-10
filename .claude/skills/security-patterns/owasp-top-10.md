# OWASP Top 10 2025

Comprehensive checklist for the OWASP Top 10 2025 security risks. Use during security reviews, code audits, and when implementing security controls.

## Overview

The OWASP Top 10 represents the most critical security risks to web applications. This is the **2025 edition**, reflecting current threat landscape and new categories for supply chain and exception handling.

| # | Category | CWE Mapped | Notes |
|---|----------|------------|-------|
| A01 | Broken Access Control | 34+ CWEs | Includes SSRF (formerly A10:2021) |
| A02 | Cryptographic Failures | 29 CWEs | Unchanged |
| A03 | Software Supply Chain Failures | 15+ CWEs | **New in 2025** - replaces Injection |
| A04 | Insecure Design | 40 CWEs | Unchanged |
| A05 | Security Misconfiguration | 20 CWEs | Unchanged |
| A06 | Vulnerable Components | 3 CWEs | Unchanged |
| A07 | Authentication Failures | 22 CWEs | Unchanged |
| A08 | Data Integrity Failures | 8 CWEs | Unchanged |
| A09 | Logging Failures | 4 CWEs | Unchanged |
| A10 | Mishandling of Exceptional Conditions | 10+ CWEs | **New in 2025** |

> **Note**: A03:2021 Injection is now covered under A03:2025 as part of supply chain (malicious dependencies can inject code) and remains a concern in input validation across all categories.

---

## A01: Broken Access Control

**Risk**: Users acting outside their intended permissions.

### Common Vulnerabilities
- Bypassing access controls by modifying URLs or parameters
- Viewing/editing someone else's data via IDOR
- Missing function-level access control
- CORS misconfiguration allowing unauthorized API access
- Metadata manipulation (JWT, cookies, hidden fields)

### Mitigations

| Control | Implementation |
|---------|----------------|
| Deny by default | Deny access unless explicitly granted |
| Centralize access control | Single mechanism, reused throughout app |
| Minimize CORS | Restrictive CORS policies |
| Server-side enforcement | Never rely on client-side checks |
| Audit logging | Log all access control failures |
| Rate limiting | Prevent automated attacks |

### Code Review Checklist
- [ ] All endpoints check authorization before processing
- [ ] Direct object references are validated against user context
- [ ] Function-level access control is enforced server-side
- [ ] CORS is configured restrictively
- [ ] JWT tokens are validated properly (signature, expiry, claims)

### Server-Side Request Forgery (SSRF)

> **Consolidated from A10:2021**: SSRF is now part of Broken Access Control as it represents unauthorized server-side access to resources.

**Risk**: Server making requests to unintended destinations based on user-controlled input.

| Attack Vector | Impact | Mitigation |
|---------------|--------|------------|
| URL parameter injection | Internal network access | Allowlist validation |
| DNS rebinding | Bypass IP restrictions | Validate resolved IPs |
| Cloud metadata access | Credential theft | Block 169.254.x.x, 100.100.x.x |
| Protocol smuggling | Port scanning | Restrict URL schemes (HTTP/HTTPS only) |

**SSRF Bypass Patterns to Block**:
```
# Internal IPs
127.0.0.1, localhost, 0.0.0.0
10.x.x.x, 172.16-31.x.x, 192.168.x.x

# IP encoding tricks
2130706433 (decimal for 127.0.0.1)
0x7f000001 (hex)
017700000001 (octal)

# Cloud metadata endpoints
169.254.169.254 (AWS, GCP, Azure)
100.100.100.200 (Alibaba Cloud)
```

**SSRF Checklist**:
- [ ] URL destinations use strict allowlist
- [ ] Internal IPs and localhost blocked
- [ ] DNS resolution validated before request
- [ ] HTTP redirects handled safely (don't follow to internal)
- [ ] Response data sanitized before returning

---

## A02: Cryptographic Failures

**Risk**: Exposure of sensitive data due to weak or absent cryptography.

### Common Vulnerabilities
- Transmitting data in clear text (HTTP, SMTP, FTP)
- Using deprecated algorithms (MD5, SHA1, DES)
- Weak or default cryptographic keys
- Not enforcing encryption (missing HSTS)
- Improper certificate validation

### Mitigations

| Control | Implementation |
|---------|----------------|
| Data classification | Identify sensitive data, apply controls |
| Encryption at rest | AES-256 for stored data |
| Encryption in transit | TLS 1.2+ for all connections |
| Strong hashing | bcrypt/argon2 for passwords (cost 12+) |
| Key management | Rotate keys, use HSM/KMS |

### Recommended Algorithms

| Purpose | Algorithm | Key Size |
|---------|-----------|----------|
| Symmetric encryption | AES-GCM | 256-bit |
| Password hashing | Argon2id, bcrypt | N/A (use cost factor) |
| General hashing | SHA-256, SHA-3 | 256-bit |
| Asymmetric | RSA, ECDSA | 2048+ / P-256+ |
| Key derivation | PBKDF2, scrypt | 100k+ iterations |

### Code Review Checklist
- [ ] No sensitive data transmitted over HTTP
- [ ] HSTS header present with appropriate max-age
- [ ] Passwords hashed with bcrypt/argon2 (not MD5/SHA1)
- [ ] Encryption keys not hardcoded
- [ ] TLS certificates validated properly

---

## A03: Software Supply Chain Failures

**Risk**: Vulnerabilities introduced through compromised dependencies, insecure build processes, or untrusted software components.

> **New in 2025**: This category addresses the growing threat of supply chain attacks, which have caused major incidents like SolarWinds, Log4Shell, and event-stream.

### Common Vulnerabilities
- **Malicious packages**: Typosquatting, dependency confusion attacks
- **Compromised dependencies**: Legitimate packages taken over by attackers
- **Build pipeline attacks**: CI/CD credential theft, build artifact tampering
- **Missing integrity verification**: No lockfiles, unsigned artifacts
- **Outdated dependencies**: Known CVEs in production code
- **Transitive dependencies**: Vulnerabilities in dependencies of dependencies

### Risk Factors

| Factor | Impact | Likelihood |
|--------|--------|------------|
| No SBOM | Cannot track components | High |
| No lockfiles | Unpredictable builds | High |
| Unsigned artifacts | Tampering possible | Medium |
| No dependency scanning | Unknown vulnerabilities | High |
| Public CI/CD secrets | Build compromise | Critical |

### Mitigations

| Control | Implementation |
|---------|----------------|
| SBOM generation | CycloneDX, SPDX for every release |
| Lockfile enforcement | package-lock.json, requirements.txt, Cargo.lock |
| Dependency scanning | npm audit, pip-audit, Snyk, Trivy |
| Signature verification | GPG, Sigstore for artifacts |
| Build reproducibility | Deterministic builds, SLSA compliance |
| Minimal dependencies | Remove unused, audit new additions |

### SBOM (Software Bill of Materials)

Generate and maintain SBOM for all software releases:

| Format | Tool | Command |
|--------|------|---------|
| SPDX | syft | `syft . -o spdx-json > sbom.spdx.json` |
| CycloneDX | cdxgen | `cdxgen -o bom.json` |
| CycloneDX | npm | `npx @cyclonedx/cyclonedx-npm --output-file bom.json` |

### SLSA Framework (Supply-chain Levels for Software Artifacts)

| Level | Requirements |
|-------|--------------|
| SLSA 1 | Build process documented |
| SLSA 2 | Hosted build, signed provenance |
| SLSA 3 | Hardened build, non-falsifiable provenance |
| SLSA 4 | Two-person review, hermetic builds |

### Dependency Integrity Checklist

- [ ] Lockfiles committed to repository
- [ ] `npm ci` / `pip install --require-hashes` in CI
- [ ] Dependency checksums verified
- [ ] New dependencies reviewed before adding
- [ ] Automated CVE scanning in CI/CD
- [ ] SBOM generated for releases

### Build Security Checklist

- [ ] Build secrets not exposed in logs
- [ ] CI/CD pipelines require code review
- [ ] Build artifacts signed with Sigstore/GPG
- [ ] Reproducible builds verified
- [ ] Supply chain provenance documented

### Code Review Checklist
- [ ] No `npm install` without `--save-exact` or lockfile
- [ ] Dependencies from trusted registries only
- [ ] No private package name squatting risks
- [ ] Build scripts reviewed for secret exposure
- [ ] SBOM updated with dependency changes

---

## A03 (Legacy): Injection

> **Note**: Traditional injection attacks (SQL, Command, etc.) are still critical. See [vulnerability-patterns.md](./vulnerability-patterns.md) for injection detection patterns.

**Key Mitigations** (unchanged from 2021):
- Parameterized queries / prepared statements
- Input validation with allowlists
- Context-aware escaping
- Least privilege database permissions

---

## A04: Insecure Design

**Risk**: Missing or ineffective security controls due to design flaws.

### Common Vulnerabilities
- Missing threat modeling
- No security requirements in design phase
- Insufficient rate limiting
- Missing business logic validation
- Over-reliance on client-side security

### Mitigations

| Control | Implementation |
|---------|----------------|
| Threat modeling | STRIDE, DREAD during design |
| Secure design patterns | Defense in depth, least privilege |
| Security requirements | Include in user stories |
| Reference architectures | Use proven secure patterns |
| Unit/integration tests | Include security tests |

### Secure Design Principles
1. **Defense in depth**: Multiple layers of security
2. **Least privilege**: Minimum necessary permissions
3. **Fail securely**: Errors don't compromise security
4. **Separation of duties**: No single point of failure
5. **Trust boundaries**: Clear delineation of trust levels

### Code Review Checklist
- [ ] Threat model exists and is current
- [ ] Business logic has rate limiting
- [ ] Security controls don't rely on client-side only
- [ ] Error handling doesn't expose sensitive info
- [ ] Multi-step operations are atomic and validated

---

## A05: Security Misconfiguration

**Risk**: Insecure default configurations or incomplete setup.

### Common Vulnerabilities
- Unnecessary features enabled
- Default accounts unchanged
- Overly verbose error messages
- Missing security headers
- Outdated software

### Mitigations

| Control | Implementation |
|---------|----------------|
| Hardening | Remove unnecessary features |
| Patching | Automated update process |
| Configuration review | Regular audits |
| Security headers | CSP, HSTS, X-Frame-Options |
| Environments | Consistent config across envs |

### Required Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | `default-src 'self'` | XSS prevention |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | Clickjacking prevention |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing prevention |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer leakage |
| `Permissions-Policy` | `geolocation=(), camera=()` | Feature restriction |

### Code Review Checklist
- [ ] All security headers present
- [ ] Debug mode disabled in production
- [ ] Default credentials changed
- [ ] Directory listing disabled
- [ ] Stack traces not exposed to users

---

## A06: Vulnerable and Outdated Components

**Risk**: Using components with known vulnerabilities.

### Common Vulnerabilities
- Outdated libraries with known CVEs
- Unmaintained dependencies
- Unnecessary dependencies
- Components running with excessive privileges

### Mitigations

| Control | Implementation |
|---------|----------------|
| Inventory | Maintain SBOM (Software Bill of Materials) |
| Monitoring | Subscribe to security advisories |
| Scanning | Automated dependency scanning |
| Updates | Regular patching schedule |
| Removal | Remove unused dependencies |

### Recommended Tools

| Tool | Type | Integration |
|------|------|-------------|
| Snyk | SCA | CI/CD, IDE |
| Dependabot | SCA | GitHub native |
| npm audit | SCA | npm CLI |
| OWASP Dependency-Check | SCA | CI/CD |
| Trivy | Container scanning | CI/CD |

### Code Review Checklist
- [ ] Dependencies regularly updated
- [ ] No known CVEs in production dependencies
- [ ] Dependency lock files committed
- [ ] Automated vulnerability scanning in CI
- [ ] Unused dependencies removed

---

## A07: Identification and Authentication Failures

**Risk**: Compromise of user identity through authentication weaknesses.

### Common Vulnerabilities
- Credential stuffing (weak password policies)
- Missing brute force protection
- Session fixation
- Insecure session management
- Missing or weak MFA

### Mitigations

| Control | Implementation |
|---------|----------------|
| Strong passwords | 12+ chars, complexity, breach check |
| MFA | TOTP, WebAuthn, push notification |
| Rate limiting | Account lockout, CAPTCHA |
| Session security | Secure, HttpOnly, SameSite cookies |
| Credential storage | bcrypt/argon2 with unique salt |

### Session Security Settings

```javascript
// Secure cookie configuration
{
  httpOnly: true,      // Prevent XSS access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 3600000,     // 1 hour
  path: '/',
  domain: '.example.com'
}
```

### Code Review Checklist
- [ ] Password policy enforced (length, complexity)
- [ ] Brute force protection implemented
- [ ] Sessions invalidated on logout
- [ ] Session IDs regenerated after login
- [ ] MFA available for sensitive operations

---

## A08: Software and Data Integrity Failures

**Risk**: Code and infrastructure without integrity verification.

### Common Vulnerabilities
- Untrusted deserialization
- Unsigned software updates
- CI/CD pipeline compromise
- Unverified data from external sources

### Mitigations

| Control | Implementation |
|---------|----------------|
| Integrity verification | Signatures, checksums |
| Secure deserialization | Avoid native serialization |
| CI/CD security | Code review, signed commits |
| Dependency integrity | Subresource integrity (SRI) |

### Subresource Integrity Example

```html
<script src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>
```

### Code Review Checklist
- [ ] Deserialization uses safe libraries
- [ ] External scripts have SRI hashes
- [ ] CI/CD requires code review
- [ ] Updates are signed and verified
- [ ] Data from external sources validated

---

## A09: Security Logging and Monitoring Failures

**Risk**: Insufficient logging to detect, escalate, and respond to attacks.

### Common Vulnerabilities
- Insufficient logging of security events
- Logs not monitored
- No alerting for suspicious activity
- Logs stored insecurely

### Mitigations

| Control | Implementation |
|---------|----------------|
| Log security events | Auth, access control, input validation |
| Centralized logging | SIEM, log aggregation |
| Alerting | Real-time alerts for suspicious patterns |
| Log protection | Append-only, encrypted, retained |
| Audit trail | Tamper-evident logging |

### Events to Log

| Event | Priority | Data to Include |
|-------|----------|-----------------|
| Login success/failure | High | User, IP, timestamp, user-agent |
| Access control failure | High | User, resource, action attempted |
| Input validation failure | Medium | Input pattern, endpoint |
| Admin actions | High | User, action, target |
| Password changes | High | User, success/failure |
| MFA events | High | User, method, success/failure |

### Code Review Checklist
- [ ] All auth events logged
- [ ] Access control failures logged
- [ ] Logs don't contain sensitive data
- [ ] Logs have timestamps and context
- [ ] Log injection prevented (sanitized input)

---

## A10: Mishandling of Exceptional Conditions

**Risk**: Improper handling of errors, exceptions, and edge cases leading to security vulnerabilities, information disclosure, or system compromise.

> **New in 2025**: This category addresses how applications respond to unexpected conditions, including errors, exceptions, resource exhaustion, and edge cases.

### Common Vulnerabilities
- **Stack trace exposure**: Detailed error messages revealing internal structure
- **Fail-open behavior**: Authentication/authorization failing to "allow" on error
- **Information leakage**: Error messages revealing database, filesystem, or network details
- **Resource exhaustion**: Unhandled OOM, file descriptor exhaustion
- **Business logic bypass**: Errors allowing skipped validation steps
- **Denial of service**: Exceptions causing application crash or hang

### Risk Factors

| Issue | Impact | Example |
|-------|--------|---------|
| Stack trace in production | Information disclosure | Database connection strings exposed |
| Fail-open authentication | Authorization bypass | Auth service timeout → allow access |
| Verbose error messages | Reconnaissance | "Table users doesn't exist" |
| Uncaught exceptions | DoS | Unhandled promise rejection crashes app |
| Resource cleanup failure | Resource leak | File handles not closed on error |

### Mitigations

| Control | Implementation |
|---------|----------------|
| Custom error pages | Generic messages without technical details |
| Fail-secure defaults | Errors default to "deny" access |
| Centralized error handling | Single error handler with logging |
| Circuit breakers | Graceful degradation for external services |
| Resource cleanup | finally blocks, context managers, RAII |
| Error monitoring | Alert on error rate spikes |

### Secure Error Handling Patterns

**Fail-Secure Example**:
```javascript
// BAD - Fail-open
try {
  const isAuthorized = await checkPermission(user);
  if (isAuthorized) return next();
} catch (error) {
  return next(); // ❌ Allows access on error!
}

// GOOD - Fail-secure
try {
  const isAuthorized = await checkPermission(user);
  if (isAuthorized) return next();
} catch (error) {
  logger.error('Authorization check failed', { error, user });
  return res.status(503).json({ error: 'Service unavailable' }); // ✓ Deny on error
}
```

**Generic Error Response**:
```javascript
// Production error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });

  // Never expose stack traces in production
  res.status(500).json({
    error: 'An unexpected error occurred',
    requestId: req.id // For support correlation
  });
});
```

### Error Message Guidelines

| Environment | Stack Trace | Details | User Message |
|-------------|-------------|---------|--------------|
| Development | Yes | Full | Technical |
| Staging | Logged only | Logged only | Generic + request ID |
| Production | Logged only | Logged only | Generic + request ID |

### Code Review Checklist
- [ ] No stack traces exposed to users in production
- [ ] Error handling defaults to "deny" (fail-secure)
- [ ] Centralized error handler catches all exceptions
- [ ] External service failures handled gracefully (circuit breakers)
- [ ] Resources cleaned up in error paths (finally/defer/RAII)
- [ ] Error messages don't reveal internal structure
- [ ] Error rate monitoring and alerting configured
- [ ] Business logic validates state even after partial failures

---

## Version History

| Version | Year | Notable Changes |
|---------|------|-----------------|
| 2025 | 2025 | A03 Supply Chain, A10 Exception Handling; SSRF consolidated into A01 |
| 2021 | 2021 | Added A04, A08, A10 (SSRF); merged/renamed others |
| 2017 | 2017 | Added A10 (Insufficient Logging) |
| 2013 | 2013 | Added A09 (Using Known Vulnerable Components) |

## References

- [OWASP Top 10 2025](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [SLSA Framework](https://slsa.dev/) - Supply chain security
- [CycloneDX SBOM](https://cyclonedx.org/) - Bill of materials standard
- [Sigstore](https://www.sigstore.dev/) - Artifact signing
