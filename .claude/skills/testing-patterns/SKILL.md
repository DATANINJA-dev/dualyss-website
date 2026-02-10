# Skill: Testing Patterns

## Activación Semántica

Este skill se activa cuando se mencionan:
- Test, testing, tests
- Vitest, Playwright, Jest
- E2E, unit, integration
- Coverage, assertions
- Mock, stub, spy

## Conocimiento Base

### Stack de Testing

| Tipo | Herramienta | Uso |
|------|-------------|-----|
| Unit | Vitest | Funciones, utils |
| Component | Vitest + RTL | Componentes React |
| E2E | Playwright | Flujos completos |

### Estructura de Tests

```
__tests__/
├── unit/
│   ├── utils.test.ts
│   └── helpers.test.ts
├── components/
│   ├── Button.test.tsx
│   └── ContactForm.test.tsx
└── e2e/
    ├── navigation.spec.ts
    └── contact-form.spec.ts
```

### Unit Tests (Vitest)

```typescript
// __tests__/unit/formatPhone.test.ts
import { describe, it, expect } from 'vitest';
import { formatPhone } from '@/lib/utils';

describe('formatPhone', () => {
  it('formats Spanish phone numbers correctly', () => {
    expect(formatPhone('+34677714799')).toBe('677 71 47 99');
  });

  it('handles numbers without country code', () => {
    expect(formatPhone('677714799')).toBe('677 71 47 99');
  });

  it('returns empty string for invalid input', () => {
    expect(formatPhone('')).toBe('');
    expect(formatPhone('abc')).toBe('');
  });
});
```

### Component Tests (Vitest + RTL)

```typescript
// __tests__/components/ContactForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactForm } from '@/components/ContactForm';

describe('ContactForm', () => {
  it('renders all form fields', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<ContactForm />);

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<ContactForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Juan García' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'juan@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/mensaje/i), {
      target: { value: 'Quiero información sobre clases' }
    });

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Juan García',
        email: 'juan@example.com',
        message: 'Quiero información sobre clases'
      });
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// __tests__/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('can navigate to all main pages', async ({ page }) => {
    await page.goto('/');

    // Navigate to Kick Boxing
    await page.click('text=Kick Boxing');
    await expect(page).toHaveURL('/kick-boxing');
    await expect(page.locator('h1')).toContainText('Kick Boxing');

    // Navigate to Contact
    await page.click('text=Contacto');
    await expect(page).toHaveURL('/contacto');
  });

  test('language switcher works', async ({ page }) => {
    await page.goto('/');

    // Switch to Catalan
    await page.click('[data-testid="language-selector"]');
    await page.click('text=Català');
    await expect(page).toHaveURL('/ca');

    // Switch to English
    await page.click('[data-testid="language-selector"]');
    await page.click('text=English');
    await expect(page).toHaveURL('/en');
  });
});
```

### Mocking

```typescript
// Mock de fetch
vi.mock('global', () => ({
  fetch: vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  }))
}));

// Mock de módulo
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn()
}));
```

### Configuración Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', '.next/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    }
  }
});
```

### Checklist Testing

- [ ] Tests unitarios para utils
- [ ] Tests de componentes críticos
- [ ] E2E para flujos principales
- [ ] Coverage > 70%
- [ ] Tests pasan en CI
