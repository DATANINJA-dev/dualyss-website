# Skill: Internationalization (i18n) Patterns

## Activación Semántica

Este skill se activa cuando se mencionan:
- Traducciones, idiomas, multiidioma
- Español, catalán, inglés
- next-intl, messages, locale
- Hreflang, SEO internacional

## Conocimiento Base

### Idiomas Soportados

| Código | Idioma | Default |
|--------|--------|---------|
| es | Español | ✓ |
| ca | Catalán | - |
| en | English | - |

### Estructura de Archivos

```
messages/
├── es.json      # Español (default)
├── ca.json      # Catalán
└── en.json      # English
```

### next-intl Configuration

```typescript
// i18n.ts
export const locales = ['es', 'ca', 'en'] as const;
export const defaultLocale = 'es';

export type Locale = (typeof locales)[number];
```

### Estructura de Traducciones

```json
// messages/es.json
{
  "common": {
    "freeClass": "Primera Clase Gratis",
    "viewSchedule": "Ver Horarios",
    "contact": "Contacto"
  },
  "hero": {
    "title": "Tu gimnasio de Artes Marciales en Viladecans",
    "subtitle": "Entrenamiento profesional en el Baix Llobregat"
  },
  "sports": {
    "kickBoxing": {
      "name": "Kick Boxing",
      "description": "Arte marcial que combina..."
    }
  },
  "meta": {
    "home": {
      "title": "Ryutai Viladecans | Gimnasio de Artes Marciales",
      "description": "Clases de Kick Boxing, MMA, BJJ..."
    }
  }
}
```

### Uso en Componentes

#### Server Components
```typescript
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('hero');

  return (
    <h1>{t('title')}</h1>
  );
}
```

#### Client Components
```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function Button() {
  const t = useTranslations('common');

  return (
    <button>{t('freeClass')}</button>
  );
}
```

#### Con Variables
```json
// messages/es.json
{
  "welcome": "Bienvenido, {name}",
  "classes": "{count, plural, =0 {Sin clases} one {# clase} other {# clases}}"
}
```

```typescript
t('welcome', { name: 'Juan' }); // "Bienvenido, Juan"
t('classes', { count: 5 }); // "5 clases"
```

### Metadata Multiidioma

```typescript
// app/[locale]/kick-boxing/page.tsx
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta.kickBoxing' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/kick-boxing`,
      languages: {
        'es': '/kick-boxing',
        'ca': '/ca/kick-boxing',
        'en': '/en/kickboxing'
      }
    }
  };
}
```

### URLs por Idioma

| Página | ES (default) | CA | EN |
|--------|--------------|-----|-----|
| Home | / | /ca | /en |
| Kick Boxing | /kick-boxing | /ca/kick-boxing | /en/kickboxing |
| Contacto | /contacto | /ca/contacte | /en/contact |

### Checklist i18n

- [ ] Todos los textos en archivos JSON
- [ ] No texto hardcodeado en componentes
- [ ] Metadata traducida
- [ ] URLs localizadas
- [ ] Hreflang configurado
- [ ] Consistencia entre idiomas
- [ ] Selector de idioma funcional
- [ ] Detectar idioma del navegador

### Errores Comunes

```typescript
// ❌ Texto hardcodeado
<h1>Kick Boxing en Viladecans</h1>

// ✓ Usar traducción
<h1>{t('hero.title')}</h1>

// ❌ Key no existe
t('nonExistent.key') // Error en desarrollo

// ✓ Verificar que la key existe
```
