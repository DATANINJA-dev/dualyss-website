---
id: TASK-009
title: Add contact form backend API route
type: feature
status: backlog
priority: P1
created: 2026-03-01
---

# TASK-009: Add contact form backend API route

## Description

Create a Next.js API route to handle contact form submissions. Send emails via SMTP or integrate with a service like Resend/SendGrid.

## Acceptance Criteria

- [ ] Create `/api/contact` route handler
- [ ] Validate form data server-side (Zod schema)
- [ ] Send notification email to configured address
- [ ] Send confirmation email to user (optional)
- [ ] Rate limiting to prevent spam
- [ ] CSRF protection
- [ ] Return appropriate error messages
- [ ] Log submissions for audit

## Environment Variables

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CONTACT_EMAIL=contact@dualys.eu
```

## Technical Notes

- Use react-hook-form + zod on client (already configured)
- Server-side validation with same Zod schema
- Consider using Resend for simpler setup vs raw SMTP
- Add honeypot field for spam prevention

## Notes

Contact form UI exists, needs backend implementation.
