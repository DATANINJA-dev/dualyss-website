# Skill: Performance Optimization

## Activación Semántica

Este skill se activa cuando se mencionan:
- Performance, rendimiento, velocidad
- Core Web Vitals, LCP, CLS, INP
- Bundle size, optimización
- Lighthouse, PageSpeed
- Carga, loading, lazy

## Conocimiento Base

### Core Web Vitals 2025

| Métrica | Bueno | Medio | Malo |
|---------|-------|-------|------|
| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| INP | ≤ 200ms | ≤ 500ms | > 500ms |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |

### Optimización de Imágenes

```tsx
// ✓ Siempre usar next/image
import Image from 'next/image';

// Hero image (above fold)
<Image
  src="/hero.webp"
  alt="Descripción"
  width={1920}
  height={1080}
  priority // Preload para LCP
  sizes="100vw"
  className="object-cover"
/>

// Below fold images
<Image
  src="/foto.webp"
  alt="Descripción"
  width={800}
  height={600}
  loading="lazy" // Default
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Bundle Optimization

```tsx
// ✓ Dynamic imports para componentes pesados
import dynamic from 'next/dynamic';

const HeavyMap = dynamic(() => import('@/components/Map'), {
  loading: () => <MapSkeleton />,
  ssr: false // Si no necesita SSR
});

// ✓ Lazy loading de librerías
const handleClick = async () => {
  const { format } = await import('date-fns');
  // usar format
};
```

### Font Optimization

```tsx
// ✓ Usar next/font
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

// En layout
<body className={inter.variable}>
```

### Skeleton Loading

```tsx
// Evitar CLS con placeholders
function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-neutral-800 h-48 rounded-t-xl" />
      <div className="p-6 space-y-3">
        <div className="bg-neutral-800 h-6 rounded w-3/4" />
        <div className="bg-neutral-800 h-4 rounded" />
        <div className="bg-neutral-800 h-4 rounded w-5/6" />
      </div>
    </div>
  );
}
```

### Prefetching

```tsx
// next/link prefetch automático
<Link href="/kick-boxing">Kick Boxing</Link>

// Prefetch manual para rutas críticas
import { useRouter } from 'next/navigation';

const router = useRouter();
router.prefetch('/contacto');
```

### Optimización de Third-Party

```tsx
// ✓ Cargar scripts después del hydration
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_ID"
  strategy="afterInteractive"
/>

// ✓ Lazy loading de embeds
const YouTubeEmbed = dynamic(() => import('@/components/YouTubeEmbed'), {
  ssr: false,
  loading: () => <VideoPlaceholder />
});
```

### Checklist Performance

#### Imágenes
- [ ] Formato WebP/AVIF
- [ ] next/image en todas
- [ ] priority en hero/LCP
- [ ] Dimensiones especificadas
- [ ] Alt text presente

#### JavaScript
- [ ] Bundle < 200KB (gzip)
- [ ] Dynamic imports
- [ ] No third-party blocking
- [ ] Tree shaking activo

#### CSS
- [ ] Tailwind purge
- [ ] No CSS bloqueante
- [ ] Critical inline

#### Fonts
- [ ] next/font
- [ ] display: swap
- [ ] Subset de caracteres
