# Skill: Design System Ryutai

## Activación Semántica

Este skill se activa cuando se mencionan:
- Estilos, colores, diseño
- Componentes, UI, interfaz
- Tailwind, CSS
- Responsive, mobile, desktop
- Branding, visual

## Conocimiento Base

### Paleta de Colores

```css
/* Colores principales */
--primary: #dc2626;      /* Rojo Ryutai */
--primary-dark: #b91c1c;
--primary-light: #ef4444;

--dark: #0a0a0a;         /* Negro */
--dark-secondary: #171717;
--dark-tertiary: #262626;

--white: #ffffff;
--gray-100: #f5f5f5;
--gray-200: #e5e5e5;
--gray-400: #a3a3a3;
--gray-600: #525252;
```

### Tailwind Classes Principales

```jsx
// Botón primario
<button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
  Reserva tu Clase Gratis
</button>

// Botón secundario
<button className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors">
  Ver Horarios
</button>

// Card
<div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
  {/* contenido */}
</div>

// Heading con gradiente
<h1 className="text-4xl md:text-6xl font-bold">
  Tu gimnasio en{' '}
  <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
    Viladecans
  </span>
</h1>
```

### Tipografía

```jsx
// Heading 1 (Hero)
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">

// Heading 2 (Secciones)
<h2 className="text-3xl md:text-4xl font-bold">

// Heading 3 (Subsecciones)
<h3 className="text-xl md:text-2xl font-semibold">

// Body text
<p className="text-gray-300 text-lg leading-relaxed">

// Small text
<span className="text-sm text-gray-400">
```

### Espaciado

```jsx
// Secciones
<section className="py-16 md:py-24">

// Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Gaps
<div className="grid gap-6 md:gap-8">
<div className="flex gap-4">
```

### Componentes Comunes

#### Hero Section
```jsx
<section className="relative min-h-[80vh] flex items-center bg-gradient-to-b from-black to-neutral-900">
  <div className="max-w-7xl mx-auto px-4">
    <h1>...</h1>
    <p>...</p>
    <div className="flex gap-4">
      <Button variant="primary" />
      <Button variant="secondary" />
    </div>
  </div>
</section>
```

#### Card de Deporte
```jsx
<div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-red-600 transition-colors">
  <Image className="aspect-video object-cover" />
  <div className="p-6">
    <h3 className="text-xl font-bold mb-2">Kick Boxing</h3>
    <p className="text-gray-400 mb-4">Descripción...</p>
    <Button>Ver más</Button>
  </div>
</div>
```

### Responsive Breakpoints

```jsx
// Mobile first
className="text-base md:text-lg lg:text-xl"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="px-4 sm:px-6 lg:px-8"
className="py-12 md:py-16 lg:py-24"
```

### Iconos

- Usar Lucide React o Heroicons
- SVG inline para iconos críticos
- **NUNCA emojis** en UI

```jsx
import { Phone, MapPin, Clock } from 'lucide-react';

<Phone className="w-5 h-5 text-red-600" />
```

### Animaciones

```jsx
// Hover transitions
className="transition-colors duration-200"
className="transition-transform duration-300 hover:scale-105"

// Aparecer
className="animate-fade-in"
```
