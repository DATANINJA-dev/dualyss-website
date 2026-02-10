# Authentication & Authorization Patterns

Secure patterns for implementing authentication and authorization. Covers OAuth 2.0, JWT, session management, and MFA.

---

## OAuth 2.0

### Grant Types

| Grant Type | Use Case | Security Level |
|------------|----------|----------------|
| Authorization Code + PKCE | Web apps, SPAs, mobile | High |
| Client Credentials | Server-to-server | High |
| Device Code | IoT, CLI tools | Medium |
| Implicit (deprecated) | Legacy SPAs | Low - avoid |
| Password (deprecated) | Legacy apps | Low - avoid |

### Authorization Code Flow with PKCE

**Required for all public clients (SPAs, mobile apps).**

1. Generate code_verifier (random 43-128 chars)
2. Create code_challenge = BASE64URL(SHA256(code_verifier))
3. Include code_challenge in authorization request
4. Exchange code with code_verifier at token endpoint

### Security Checklist

- [ ] Use PKCE for all public clients
- [ ] Validate redirect_uri exactly (no wildcards)
- [ ] Use state parameter to prevent CSRF
- [ ] Short-lived authorization codes (< 10 min)
- [ ] Rotate refresh tokens on use
- [ ] Validate token audience (aud claim)

---

## OAuth 2.0 DPoP (RFC 9449)

**Demonstrating Proof of Possession** binds access tokens to a specific client key pair, preventing token theft and replay attacks.

> **RFC 9449** (April 2023) defines how clients can prove possession of a private key when using access tokens.

### Why DPoP?

| Problem | DPoP Solution |
|---------|---------------|
| Bearer tokens can be stolen | Token bound to client's key |
| Token replay attacks | Each request needs fresh proof |
| Token forwarding | Cannot use token with different key |
| Exfiltration from logs | Token useless without private key |

### DPoP Flow

1. Client generates asymmetric key pair (stored securely)
2. For each request, client creates DPoP proof JWT
3. Proof includes HTTP method, URL, and timestamp
4. Server validates proof matches request and token binding

### DPoP Proof JWT Structure

**Header**:
```json
{
  "typ": "dpop+jwt",
  "alg": "ES256",
  "jwk": {
    "kty": "EC",
    "crv": "P-256",
    "x": "...",
    "y": "..."
  }
}
```

**Payload**:
```json
{
  "jti": "unique-identifier-for-this-proof",
  "htm": "POST",
  "htu": "https://server.example.com/token",
  "iat": 1704067200,
  "ath": "fUHyO2r2Z3DZ53EsNrWBb0xWXoaNy59IiKCAqksmQEo"
}
```

| Claim | Description | Validation |
|-------|-------------|------------|
| `jti` | Unique identifier | Check for replay (store/cache) |
| `htm` | HTTP method | Must match actual request method |
| `htu` | HTTP URI | Must match request URL (scheme + host + path) |
| `iat` | Issued at time | Within acceptable window (e.g., ±5 min) |
| `ath` | Access token hash | SHA-256 of token (when using with access token) |

### Server Validation Checklist

- [ ] Verify DPoP proof signature using embedded JWK
- [ ] Check `typ` is `dpop+jwt`
- [ ] Check `alg` is in allowed list (ES256, ES384, EdDSA)
- [ ] Validate `htm` matches HTTP request method
- [ ] Validate `htu` matches request URL exactly
- [ ] Check `iat` is within acceptable time window
- [ ] Store `jti` to prevent replay attacks
- [ ] Bind token to JWK thumbprint at issuance
- [ ] Verify `ath` matches access token hash (if present)

### Token Request with DPoP

```http
POST /token HTTP/1.1
Host: auth.example.com
Content-Type: application/x-www-form-urlencoded
DPoP: eyJ0eXAiOiJkcG9wK2p3dCIsImFsZyI6IkVTMjU2IiwiandrIjp7fX0...

grant_type=authorization_code&
code=SplxlOBeZQQYbYS6WxSbIA&
redirect_uri=https%3A%2F%2Fclient.example.org%2Fcallback&
code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

### Resource Request with DPoP

```http
GET /resource HTTP/1.1
Host: api.example.com
Authorization: DPoP eyJhbGciOiJFUzI1NiJ9...
DPoP: eyJ0eXAiOiJkcG9wK2p3dCIsImFsZyI6IkVTMjU2In0...
```

> **Note**: Use `Authorization: DPoP` scheme, not `Bearer`, when using DPoP-bound tokens.

### Code Example: DPoP Proof Generation

```javascript
import { SignJWT, generateKeyPair, calculateJwkThumbprint } from 'jose';

// Generate DPoP key pair (store securely, reuse across requests)
const { publicKey, privateKey } = await generateKeyPair('ES256');

async function createDPoPProof(method, url, accessToken = null) {
  const jwk = await exportJWK(publicKey);

  let payload = {
    jti: crypto.randomUUID(),
    htm: method,
    htu: url,
    iat: Math.floor(Date.now() / 1000)
  };

  // Include access token hash if using with access token
  if (accessToken) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(accessToken));
    payload.ath = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  }

  return new SignJWT(payload)
    .setProtectedHeader({ typ: 'dpop+jwt', alg: 'ES256', jwk })
    .sign(privateKey);
}
```

---

## Audience Injection Prevention

Prevent tokens from being used at unintended resource servers.

### The Problem

Without audience validation:
1. Attacker obtains token for Service A
2. Attacker uses same token at Service B
3. Service B accepts token (same issuer, valid signature)
4. Attacker gains unauthorized access

### Mitigations

| Control | Implementation |
|---------|----------------|
| Audience claim | Include `aud` in tokens, validate strictly |
| Resource indicators | Use RFC 8707 resource parameter |
| Token binding | Use DPoP (above) to bind tokens |
| Short lifetimes | Reduce window for token misuse |

### Audience Validation Checklist

- [ ] Token contains `aud` claim
- [ ] `aud` matches this resource server's identifier exactly
- [ ] Multiple audiences only if intentionally authorized
- [ ] Reject tokens without `aud` claim

### Multi-Authorization Server Validation

When accepting tokens from multiple authorization servers:

| Check | Why |
|-------|-----|
| Validate `iss` against allowlist | Prevent token from unknown issuer |
| Fetch JWKS from correct issuer | Prevent key confusion attacks |
| Validate `alg` against allowlist | Prevent algorithm confusion |
| Check `aud` includes this server | Prevent cross-tenant access |

```javascript
// Example: Multi-issuer validation
const TRUSTED_ISSUERS = {
  'https://auth.tenant-a.com': { audience: 'api.tenant-a.com' },
  'https://auth.tenant-b.com': { audience: 'api.tenant-b.com' }
};

function validateToken(token) {
  const claims = decodeToken(token);

  // 1. Check issuer is trusted
  const issuerConfig = TRUSTED_ISSUERS[claims.iss];
  if (!issuerConfig) {
    throw new Error('Unknown token issuer');
  }

  // 2. Fetch JWKS from this specific issuer
  const jwks = await fetchJWKS(claims.iss + '/.well-known/jwks.json');

  // 3. Verify signature with issuer's keys
  await verifySignature(token, jwks);

  // 4. Validate audience matches expected for this issuer
  if (claims.aud !== issuerConfig.audience) {
    throw new Error('Invalid audience for issuer');
  }
}
```

---

## JWT (JSON Web Tokens)

### Token Structure

| Part | Contains | Encoded |
|------|----------|---------|
| Header | Algorithm, token type | Base64URL |
| Payload | Claims (sub, exp, iat, etc.) | Base64URL |
| Signature | HMAC or RSA signature | Base64URL |

### Recommended Algorithms

| Algorithm | Type | Key Size | Recommendation |
|-----------|------|----------|----------------|
| RS256 | Asymmetric | 2048+ bit | Recommended for APIs |
| ES256 | Asymmetric | P-256 curve | Recommended, smaller |
| HS256 | Symmetric | 256+ bit | Internal services only |
| none | None | N/A | Never use |

### Validation Checklist

- [ ] Verify signature with correct algorithm
- [ ] Check exp (expiration) claim
- [ ] Check iat (issued at) is not in future
- [ ] Validate iss (issuer) matches expected
- [ ] Validate aud (audience) includes your service
- [ ] Check nbf (not before) if present

### Common Vulnerabilities

| Vulnerability | Description | Prevention |
|---------------|-------------|------------|
| Algorithm confusion | Accepting none or HS256 when RS256 expected | Explicitly specify algorithm |
| Key confusion | Using public key as HMAC secret | Validate key type |
| Missing validation | Not checking exp, iss, aud | Always validate all claims |
| Token leakage | Storing in localStorage | Use httpOnly cookies |

### Token Lifetimes

| Token Type | Recommended Lifetime |
|------------|---------------------|
| Access token | 15-60 minutes |
| Refresh token | 7-30 days |
| ID token | 5-15 minutes |

---

## Session Management

### Secure Session Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| httpOnly | true | Prevent XSS access |
| secure | true | HTTPS only |
| sameSite | Strict or Lax | CSRF protection |
| path | / | Scope to domain |
| maxAge | 3600 (1h) | Auto-expiration |

### Session Security Checklist

- [ ] Regenerate session ID on login
- [ ] Invalidate session on logout (server-side)
- [ ] Set absolute timeout (max session length)
- [ ] Set idle timeout (inactivity)
- [ ] Store minimal data in session
- [ ] Use secure random session IDs (128+ bits)

### Session Storage Options

| Storage | Pros | Cons |
|---------|------|------|
| Server memory | Fast | Not scalable |
| Redis/Memcached | Fast, scalable | Additional infrastructure |
| Database | Persistent | Slower |
| JWT (stateless) | No server storage | Cannot revoke |

### Session Fixation Prevention

1. Generate new session ID after authentication
2. Invalidate old session ID
3. Bind session to user-agent/IP (optional, may cause issues)

---

## Multi-Factor Authentication (MFA)

### Factor Types

| Type | Examples | Security |
|------|----------|----------|
| Knowledge | Password, PIN | Low (phishable) |
| Possession | TOTP, hardware key, SMS | Medium-High |
| Inherence | Biometrics | High |

### Recommended Methods

| Method | Security | UX | Recommendation |
|--------|----------|-----|----------------|
| WebAuthn/FIDO2 | Excellent | Good | Recommended |
| TOTP (Authenticator) | High | Good | Recommended |
| Push notification | High | Excellent | Good alternative |
| SMS OTP | Medium | Good | Fallback only |
| Email OTP | Low | Fair | Avoid if possible |

### TOTP Implementation

| Parameter | Recommended Value |
|-----------|-------------------|
| Algorithm | SHA-1 or SHA-256 |
| Digits | 6 |
| Period | 30 seconds |
| Window | +/- 1 period (for clock skew) |

### MFA Security Checklist

- [ ] Require MFA for sensitive operations
- [ ] Provide backup codes for recovery
- [ ] Rate limit MFA attempts
- [ ] Allow multiple MFA methods
- [ ] Log all MFA events
- [ ] Re-verify MFA for security settings

---

## Password Security

### Password Policy

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Length | 8 chars | 12+ chars |
| Complexity | Not required | Optional |
| Breach check | Required | Required |
| History | 5 passwords | 10 passwords |

### Password Hashing

| Algorithm | Recommended | Parameters |
|-----------|-------------|------------|
| Argon2id | Yes | memory=64MB, iterations=3, parallelism=4 |
| bcrypt | Yes | cost=12+ |
| scrypt | Yes | N=2^14, r=8, p=1 |
| PBKDF2 | Acceptable | iterations=310000+, SHA-256 |
| MD5/SHA1 | Never | N/A |

### Password Security Checklist

- [ ] Hash with Argon2id or bcrypt
- [ ] Use unique salt per password
- [ ] Check against breach databases
- [ ] Enforce minimum length (12+)
- [ ] No periodic rotation requirement
- [ ] Support paste in password fields

---

## Authorization Patterns

### RBAC (Role-Based Access Control)

| Component | Description |
|-----------|-------------|
| User | Identity (person or service) |
| Role | Collection of permissions |
| Permission | Allowed action on resource |

### ABAC (Attribute-Based Access Control)

| Component | Description |
|-----------|-------------|
| Subject | User attributes (role, dept, clearance) |
| Resource | Resource attributes (type, owner, sensitivity) |
| Action | Requested operation |
| Environment | Context (time, location, device) |

### Authorization Checklist

- [ ] Deny by default
- [ ] Validate on every request
- [ ] Server-side enforcement (not client)
- [ ] Log authorization failures
- [ ] Regular permission audits
- [ ] Principle of least privilege

---

## Token Storage

### Browser Storage Comparison

| Storage | XSS Safe | CSRF Safe | Recommendation |
|---------|----------|-----------|----------------|
| httpOnly cookie | Yes | No* | Best with SameSite |
| localStorage | No | Yes | Avoid for tokens |
| sessionStorage | No | Yes | Avoid for tokens |
| Memory | Yes | Yes | Good but lost on refresh |

*Use SameSite=Strict or CSRF tokens

### Recommendations by App Type

| App Type | Token Storage | Refresh Strategy |
|----------|---------------|------------------|
| SPA | httpOnly cookie or memory + refresh | Silent refresh |
| Mobile | Secure storage (Keychain/Keystore) | Background refresh |
| Server-side | Session with httpOnly cookie | Server-side refresh |

---

## References

- [OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [RFC 9449 - OAuth 2.0 DPoP](https://datatracker.ietf.org/doc/rfc9449/) - Token binding
- [RFC 8707 - Resource Indicators](https://datatracker.ietf.org/doc/rfc8707/) - Audience control
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST SP 800-63B Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [JWT Best Current Practices](https://datatracker.ietf.org/doc/html/rfc8725)
