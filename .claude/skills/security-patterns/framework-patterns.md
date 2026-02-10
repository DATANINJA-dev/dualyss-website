# Framework Security Patterns

Security patterns and checklists for common frameworks. Use when implementing features in React, Node.js/Express, Python/Django, or FastAPI projects.

> **Note**: This document describes security patterns for educational purposes. Code examples show safe patterns to follow.

---

## React / Next.js

### XSS Prevention

React auto-escapes by default, but be careful with these patterns:

| Risk Pattern | Safe Alternative |
|--------------|------------------|
| Raw HTML insertion | Use sanitization library (DOMPurify) |
| Dynamic code execution | Avoid eval-like patterns entirely |
| document.write() | Use React state/refs |
| URL interpolation | Validate and sanitize URLs |

### Safe HTML Rendering

When you must render user-provided HTML, always sanitize it first with DOMPurify.

### CSRF Protection

Use next-auth getCsrfToken() and include X-CSRF-Token header on state-changing requests.

### Secure Cookie Settings

```javascript
// next.config.js or API route
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 60 // 1 hour
}
```

### Content Security Policy

Configure CSP headers in next.config.js with restrictive default-src and script-src policies.

### React Security Checklist

- [ ] No secrets in client-side code
- [ ] Raw HTML rendering uses DOMPurify sanitization
- [ ] External URLs validated before rendering
- [ ] CSRF tokens on state-changing requests
- [ ] Secure cookie settings (httpOnly, secure, sameSite)
- [ ] Content Security Policy headers configured
- [ ] No sensitive data in localStorage

---

## Node.js / Express

### Security Middleware

Use helmet() for security headers, cors() with restrictive origin, and express-rate-limit for rate limiting.

### Input Validation

Use express-validator or Zod for all endpoint inputs. Validate email, password length, and escape special characters.

### Parameterized Queries

Always use parameterized queries or ORM methods - never concatenate user input into SQL strings.

### Session Security

Configure express-session with secure cookie settings (httpOnly, secure, sameSite: strict).

### Node.js/Express Security Checklist

- [ ] Helmet.js for security headers
- [ ] Rate limiting configured
- [ ] CORS configured restrictively
- [ ] Input validation on all endpoints
- [ ] Parameterized database queries
- [ ] Secure session configuration
- [ ] Environment variables for secrets
- [ ] Error messages do not expose stack traces
- [ ] Dependencies scanned for vulnerabilities

---

## Python / Django

### Security Settings

Configure in settings.py: SECRET_KEY from env, DEBUG=False in prod, ALLOWED_HOSTS, security headers, HTTPS settings, and secure cookies.

### CSRF Protection

CSRF is enabled by default. Use csrf_protect decorator and include csrf_token in templates.

### SQL Injection Prevention

Use ORM (User.objects.filter()) or parameterized queries. Never use f-strings for SQL.

### Password Hashing

Upgrade to Argon2PasswordHasher in PASSWORD_HASHERS setting.

### Django Security Checklist

- [ ] DEBUG = False in production
- [ ] SECRET_KEY in environment variable
- [ ] ALLOWED_HOSTS configured
- [ ] CSRF middleware enabled
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Session cookies secure
- [ ] ORM used for queries
- [ ] Template auto-escaping enabled
- [ ] Admin URL changed from /admin/

---

## Python / FastAPI

### Input Validation

Use Pydantic models with validators for all request bodies. Define EmailStr, password validators, and name sanitizers.

### Authentication with OAuth2

Use OAuth2PasswordBearer with JWT validation including signature, expiry, and claims verification.

### CORS Configuration

Configure CORSMiddleware with specific origins - never use allow_origins=["*"] in production.

### Rate Limiting

Use slowapi for rate limiting endpoints.

### FastAPI Security Checklist

- [ ] Pydantic validation on all inputs
- [ ] OAuth2/JWT with proper signing algorithm
- [ ] CORS configured restrictively
- [ ] Rate limiting implemented
- [ ] Dependency injection for security
- [ ] Environment variables for secrets
- [ ] SQL injection prevention via ORM
- [ ] Response models defined
- [ ] Background tasks secure

---

## Version-Specific Notes

| Framework | Version | Notes |
|-----------|---------|-------|
| React | 18+ | Automatic batching, Strict Mode |
| Next.js | 13+ | App Router, Server Components |
| Node.js | 20+ | LTS, native fetch |
| Express | 4.18+ | Latest security patches |
| Django | 4.2+ | LTS, improved security |
| FastAPI | 0.100+ | Pydantic v2 compatible |

## References

- React Security Best Practices
- Next.js Security Headers
- Express Security Best Practices
- Django Security Checklist
- FastAPI Security
