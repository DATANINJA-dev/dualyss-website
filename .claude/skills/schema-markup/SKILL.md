# Skill: Schema.org Markup

## Activación Semántica

Este skill se activa cuando se mencionan:
- Schema, JSON-LD, structured data
- Rich snippets, rich results
- Google Search, SERP
- LocalBusiness, Organization
- FAQ, BreadcrumbList

## Conocimiento Base

### Schemas Requeridos para Ryutai

#### 1. Organization / SportsOrganization

```json
{
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  "@id": "https://ryutaiteamcalderon.es/#organization",
  "name": "Ryutai Viladecans",
  "alternateName": "Ryutai Team Calderon",
  "url": "https://ryutaiteamcalderon.es",
  "logo": "https://ryutaiteamcalderon.es/logo_ryutai.png",
  "image": "https://ryutaiteamcalderon.es/og-image.jpg",
  "description": "Gimnasio de artes marciales en Viladecans, Barcelona",
  "foundingDate": "2016",
  "sport": ["Kickboxing", "K1", "Mixed Martial Arts", "Brazilian Jiu-Jitsu", "Boxing", "Grappling"],
  "telephone": "+34677714799",
  "email": "info.ryutai@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Carrer de Miguel Hernández, 22",
    "addressLocality": "Viladecans",
    "addressRegion": "Barcelona",
    "postalCode": "08840",
    "addressCountry": "ES"
  },
  "sameAs": [
    "https://www.instagram.com/ryutai_viladecans/"
  ]
}
```

#### 2. LocalBusiness / SportsActivityLocation / ExerciseGym

> **Nota**: Para gimnasios, Schema.org recomienda usar `ExerciseGym` (subtipo de `SportsActivityLocation`).
> Usar `@type": ["ExerciseGym", "SportsActivityLocation"]` para máxima compatibilidad.

```json
{
  "@context": "https://schema.org",
  "@type": ["ExerciseGym", "SportsActivityLocation"],
  "@id": "https://ryutaiteamcalderon.es/#location-1",
  "name": "Ryutai I - Kick Boxing & K1",
  "parentOrganization": {
    "@id": "https://ryutaiteamcalderon.es/#organization"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Carrer de Miguel Hernández, 22",
    "addressLocality": "Viladecans",
    "addressRegion": "Barcelona",
    "postalCode": "08840",
    "addressCountry": "ES"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.3163,
    "longitude": 2.0086
  },
  "telephone": "+34677714799",
  "priceRange": "€€",
  "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
  "currenciesAccepted": "EUR",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "22:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "14:00"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "50"
  }
}
```

#### 3. BreadcrumbList

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://ryutaiteamcalderon.es"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Kick Boxing",
      "item": "https://ryutaiteamcalderon.es/kick-boxing"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Sant Boi",
      "item": "https://ryutaiteamcalderon.es/kick-boxing/sant-boi"
    }
  ]
}
```

#### 4. FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Necesito experiencia previa para empezar?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, ofrecemos clases para todos los niveles, desde principiantes hasta competidores."
      }
    },
    {
      "@type": "Question",
      "name": "¿La primera clase es gratis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, ofrecemos la primera clase totalmente gratis para que puedas probar sin compromiso."
      }
    }
  ]
}
```

### Implementación en Next.js

```tsx
// app/[locale]/kick-boxing/page.tsx

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  // ... schema completo
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Contenido de la página */}
    </>
  );
}
```

### Validación

1. **Google Rich Results Test**
   https://search.google.com/test/rich-results

2. **Schema Markup Validator**
   https://validator.schema.org/

### Checklist Schema

- [ ] Organization en homepage
- [ ] LocalBusiness para cada sede
- [ ] BreadcrumbList en páginas internas
- [ ] FAQPage donde haya FAQs
- [ ] Article/BlogPosting en blog
- [ ] JSON-LD válido (sin errores)
- [ ] Datos consistentes con contenido visible
