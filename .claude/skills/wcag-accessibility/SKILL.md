# Skill: WCAG 2.2 Accessibility

## Activación Semántica

Este skill se activa cuando se mencionan:
- Accesibilidad, a11y, WCAG
- Screen reader, lector de pantalla
- Alt text, contraste
- Teclado, focus, navegación
- ARIA, roles, labels

## Conocimiento Base

### WCAG 2.2 Niveles

| Nivel | Descripción | Objetivo |
|-------|-------------|----------|
| A | Mínimo | Funcionalidad básica |
| AA | Recomendado | Cumplimiento legal |
| AAA | Óptimo | Máxima accesibilidad |

**Ryutai target**: Nivel AA

### Criterios Clave

> **IMPORTANTE**: WCAG 2.2 eliminó el criterio 4.1.1 Parsing. Ya no es necesario validarlo.

### Nuevos Criterios WCAG 2.2 (Octubre 2023)

#### 2.4.11 Focus Not Obscured (Minimum) - AA
El elemento con foco de teclado no debe estar completamente oculto por contenido
fijo (sticky headers, modals, footers sticky, etc.).

```jsx
// ✓ Correcto: scroll-margin para evitar que sticky header oculte el foco
.focusable-element {
  scroll-margin-top: 80px; /* Altura del sticky header */
}
```

#### 2.5.7 Dragging Movements - AA
Cualquier funcionalidad de arrastre debe tener alternativa single-pointer.

```jsx
// ✓ Si hay slider drag, debe haber también botones +/-
<Slider onChange={handleChange} />
<button onClick={() => setValue(v => v - 1)}>-</button>
<button onClick={() => setValue(v => v + 1)}>+</button>
```

#### 2.5.8 Target Size (Minimum) - AA
Targets interactivos mínimo **24x24 CSS pixels** (excepto links en texto corrido).

```jsx
// ✓ Correcto: Botón con tamaño mínimo
<button className="min-w-6 min-h-6 p-2">Click</button>

// Nota: 44x44px es RECOMENDADO, 24x24px es el MÍNIMO legal
```

#### 3.2.6 Consistent Help - A
Mecanismos de ayuda (chat, FAQ, contacto) deben estar en ubicación consistente
en todas las páginas.

```jsx
// ✓ El botón de WhatsApp flotante cumple este criterio
// Debe estar en la misma posición en todas las páginas
<WhatsAppFloat position="bottom-right" />
```

#### 3.3.7 Redundant Entry - A
No solicitar información que el usuario ya proporcionó en el mismo proceso.

```jsx
// ❌ Incorrecto: Pedir email dos veces
<input name="email" />
...
<input name="confirm_email" />

// ✓ Correcto: Auto-rellenar o no pedir de nuevo
```

#### 3.3.8 Accessible Authentication (Minimum) - AA
No requerir tests cognitivos (CAPTCHA, puzzles) sin alternativa.

```jsx
// ✓ Alternativas aceptables:
// - Honeypot fields (invisible para usuarios)
// - Rate limiting
// - Email verification link
// - Passkeys/WebAuthn
```

### Criterios Anteriores Relevantes

#### 1.1 Alternativas de Texto

```jsx
// ✓ Correcto
<Image src="/hero.jpg" alt="Clase de Kick Boxing en Ryutai Viladecans" />

// ❌ Incorrecto
<Image src="/hero.jpg" alt="imagen" />
<Image src="/hero.jpg" alt="" /> // Solo OK para decorativas
```

#### 1.4.3 Contraste Mínimo

| Tipo | Ratio Mínimo |
|------|--------------|
| Texto normal | 4.5:1 |
| Texto grande (18px+) | 3:1 |
| UI components | 3:1 |

```jsx
// ✓ Ryutai: #dc2626 sobre #0a0a0a = 5.2:1
<p className="text-red-600 bg-neutral-950">Texto accesible</p>
```

#### 2.1.1 Teclado

```jsx
// ✓ Correcto: <button> es accesible por defecto
<button onClick={handleClick}>Click me</button>

// ❌ Incorrecto: <div> no es accesible
<div onClick={handleClick}>Click me</div>

// Si NECESITAS div clickeable:
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

#### 2.4.1 Skip Links

```jsx
// En Header
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-red-600 text-white px-4 py-2 rounded"
>
  Saltar al contenido principal
</a>

// En main
<main id="main-content">
```

#### 2.4.6 Encabezados Descriptivos

```jsx
// ✓ Jerarquía correcta
<h1>Kick Boxing en Viladecans</h1>
<h2>Beneficios del Kick Boxing</h2>
<h3>Mejora física</h3>
<h3>Defensa personal</h3>
<h2>Horarios de clases</h2>

// ❌ Jerarquía incorrecta
<h1>Título</h1>
<h3>Subtítulo</h3> // Saltó h2
```

#### 2.4.7 Focus Visible

```jsx
// ✓ Focus visible
<button className="focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2">

// ❌ Focus oculto (nunca hacer)
<button className="focus:outline-none">
```

#### 3.3.2 Labels en Formularios

```jsx
// ✓ Label asociado
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✓ Label envolvente
<label>
  Email
  <input type="email" />
</label>

// ❌ Sin label
<input type="email" placeholder="Email" />
```

### Componentes ARIA

```jsx
// Navegación
<nav aria-label="Navegación principal">

// Botón toggle
<button aria-expanded={isOpen} aria-controls="menu">
  Menú
</button>
<div id="menu" hidden={!isOpen}>...</div>

// Loading state
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Enviando...' : 'Enviar'}
</button>

// Icono solo
<button aria-label="Cerrar menú">
  <XIcon aria-hidden="true" />
</button>
```

### Checklist de Accesibilidad WCAG 2.2 AA

#### Criterios Existentes
- [ ] Alt text en todas las imágenes (1.1.1)
- [ ] Contraste >= 4.5:1 (1.4.3)
- [ ] Navegación por teclado (2.1.1)
- [ ] Focus visible (2.4.7)
- [ ] Skip links (2.4.1)
- [ ] Jerarquía de encabezados (2.4.6)
- [ ] Labels en formularios (3.3.2)
- [ ] ARIA cuando necesario (4.1.2)
- [ ] No autoplay en videos (1.4.2)

#### Nuevos Criterios WCAG 2.2 (Nivel AA)
- [ ] Focus no oculto por sticky content (2.4.11)
- [ ] Alternativas a drag gestures (2.5.7)
- [ ] Target size mínimo 24x24px (2.5.8)
- [ ] Help en ubicación consistente (3.2.6) - Nivel A
- [ ] No redundant entry en formularios (3.3.7) - Nivel A
- [ ] Alternativa a CAPTCHA/memory tests (3.3.8)
