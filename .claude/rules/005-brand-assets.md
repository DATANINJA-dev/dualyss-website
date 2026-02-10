# Dualyss Brand Assets

## Logo Files

### Source
- **Original**: `docs/dualys_logo_300x300.png` - Square logo with dark background, white "dualys" text with blue "y"

### Production Assets (in `public/`)
| File | Size | Purpose |
|------|------|---------|
| `logo.png` | 300x300 | Main logo used in Header component |
| `favicon-16x16.png` | 16x16 | Browser tab favicon |
| `favicon-32x32.png` | 32x32 | Browser tab favicon |
| `favicon.ico` | 32x32 | Legacy favicon format |
| `apple-touch-icon.png` | 180x180 | iOS home screen icon |
| `og-image.png` | 1200x630 | Open Graph social sharing image |

## Implementation Details

### Header Component
- Location: `src/components/layout/Header.tsx`
- Uses Next.js `Image` component with `priority` loading
- Logo dimensions: `width={120} height={40}` with `className="h-8 w-auto"`

### Metadata Configuration
- Location: `src/lib/seo/metadata.ts`
- Icons configured in `generatePageMetadata()` function
- OG image defaults to `/og-image.png`

### Organization Schema
- Logo URL defined in `getOrganizationSchema()`: `${baseUrl}/logo.png`

## Brand Colors (from logo)
- Background: Dark charcoal (#191919 approximate)
- Primary text: White
- Accent: Blue "y" (#4A90D9 approximate)

## Regenerating Assets

If the logo needs to be updated:
1. Replace `docs/dualys_logo_300x300.png` with new logo
2. Install sharp: `npm install --save-dev sharp`
3. Run asset generation script (create from scratch or use image tools)
4. Uninstall sharp: `npm uninstall sharp`

## Verified Working
- Playwright tested: 2026-02-10
- All favicon sizes rendering correctly
- OG image meta tags present
- Logo displays in header across all 6 languages
