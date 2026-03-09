# Dualys Brand Assets

## Logo Files

### Source
- **Original**: `C:\Users\user\Downloads\dualys_logo.png` - Wide logo with transparent background, black "dualys" text with blue "y"

### Production Assets (in `public/`)
| File | Size | Purpose |
|------|------|---------|
| `logo.png` | 3868x1591 | Main logo used in Header component |
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
- **Theme**: Light header (white background) for contrast with black logo text

### Metadata Configuration
- Location: `src/lib/seo/metadata.ts`
- Icons configured in `generatePageMetadata()` function
- OG image defaults to `/og-image.png`

### Organization Schema
- Logo URL defined in `getOrganizationSchema()`: `${baseUrl}/logo.png`

## Brand Colors (from logo)
- Logo text: Black (#000000)
- Logo background: Transparent (displays on white header)
- Accent: Blue "y" (#4F61E7 - PANTONE 2132 C)

## Regenerating Assets

If the logo needs to be updated:
1. Replace `public/logo.png` with new logo
2. Run: `node scripts/generate-favicons.mjs`
3. Script uses sharp (bundled with Next.js) to generate all sizes

## Verified Working
- Updated: 2026-03-06
- Light header theme with black logo text
- All favicon sizes rendering correctly
- OG image meta tags present
- Logo displays in header across all 6 languages
