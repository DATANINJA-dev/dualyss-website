# Skill: Web Security (OWASP Top 10)

## Activación Semántica

Este skill se activa cuando se mencionan:
- Seguridad, security, OWASP
- XSS, injection, CSRF
- Validación, sanitización
- Headers, HTTPS
- Vulnerabilidades

## Conocimiento Base

### OWASP Top 10 - 2025

**Fuente**: [OWASP Top 10:2025 Official](https://owasp.org/Top10/2025/)

| # | Categoría | Relevancia Ryutai |
|---|-----------|-------------------|
| A01 | Broken Access Control | Media |
| A02 | Cryptographic Failures | Baja |
| A03 | Injection | Alta |
| A04 | Insecure Design | Media |
| A05 | Security Misconfiguration | Media |
| A06 | Vulnerable Components | Media |
| A07 | Identification & Auth Failures | Baja (sin auth) |
| A08 | Data Integrity Failures | Media |
| A09 | Security Logging Failures | Baja (frontend) |
| A10 | **Mishandling of Exceptional Conditions** | Media - NUEVO 2025 |

### A10:2025 - Mishandling of Exceptional Conditions (NUEVO)

Categoría nueva en 2025 que cubre:
- Manejo inadecuado de errores
- Failing open (permitir acceso cuando hay error)
- Errores lógicos
- Condiciones de carrera

```tsx
// ❌ Failing open - INSEGURO
try {
  const isAuthorized = await checkAuth();
  if (isAuthorized) showContent();
} catch (error) {
  showContent(); // ❌ Si falla auth, muestra contenido igual
}

// ✓ Failing closed - SEGURO
try {
  const isAuthorized = await checkAuth();
  if (isAuthorized) showContent();
} catch (error) {
  showError('No se pudo verificar autorización');
  // No mostrar contenido si hay error
}
```

### Patrones Seguros

#### XSS Prevention

```tsx
// ❌ NUNCA usar
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✓ React escapa automáticamente
<div>{userContent}</div>

// ✓ Si necesitas HTML, sanitizar primero
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

#### Form Validation

```tsx
// ✓ Validación client-side + server-side
const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/),
  message: z.string().min(10).max(1000)
});

// Server Action
export async function submitContact(formData: FormData) {
  const result = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message')
  });

  if (!result.success) {
    return { error: 'Datos inválidos' };
  }

  // Procesar datos validados
}
```

#### Environment Variables

```bash
# .env.local (NUNCA en git)
API_KEY=secret_key
DATABASE_URL=postgres://...

# .env.example (en git)
API_KEY=your_api_key_here
DATABASE_URL=your_database_url
```

```tsx
// Acceso seguro
const apiKey = process.env.API_KEY;

// ❌ NUNCA exponer al cliente
// NEXT_PUBLIC_API_KEY=secret // NO!
```

### Security Headers (next.config.js)

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Checklist Seguridad

#### Código
- [ ] No eval() ni new Function()
- [ ] No dangerouslySetInnerHTML sin sanitizar
- [ ] Validación de inputs
- [ ] No secretos hardcodeados

#### Dependencias
- [ ] npm audit sin critical/high
- [ ] Dependencias actualizadas
- [ ] Lock file en git

#### Configuración
- [ ] HTTPS forzado
- [ ] Headers de seguridad
- [ ] CORS configurado
- [ ] Rate limiting (API)

#### Formularios
- [ ] Validación client + server
- [ ] CSRF protection (si aplica)
- [ ] Honeypot para spam
