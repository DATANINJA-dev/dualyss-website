# Builder.io CMS Setup Guide

This guide explains how to set up Builder.io as the CMS for the Dualys website.

## Why Builder.io?

- **Free tier**: Up to 10 users at no cost
- **Visual editing**: Drag-and-drop interface similar to WordPress
- **No infrastructure needed**: Builder.io hosts the CMS
- **Multi-language support**: Native support for 6 languages

## Quick Start

### 1. Create a Builder.io Account

1. Go to [builder.io](https://builder.io) and sign up (free)
2. Create a new Space for "Dualys"
3. Note your **Public API Key** from Settings > API Keys

### 2. Configure Environment

Add to your `.env.local`:

```bash
NEXT_PUBLIC_BUILDER_API_KEY=your_builder_public_api_key
```

### 3. Create Data Models in Builder.io

Go to **Models** in Builder.io and create:

#### Team Member Model
- **Name**: `team-member`
- **Fields**:
  - `name` (Text, required, localized)
  - `role` (Text, required, localized)
  - `description` (Long Text, localized)
  - `image` (File)
  - `linkedin` (URL)
  - `email` (Email)

#### Partner Model
- **Name**: `partner`
- **Fields**:
  - `name` (Text, required)
  - `logo` (File)
  - `category` (Enum: industrial, academic, research, institutional)
  - `website` (URL)
  - `description` (Long Text, localized)

#### News Article Model
- **Name**: `news-article`
- **Fields**:
  - `title` (Text, required, localized)
  - `slug` (Text, required)
  - `excerpt` (Long Text, localized)
  - `content` (Rich Text, localized)
  - `category` (Enum: announcement, partnership, technology, event)
  - `publishDate` (Date)
  - `featuredImage` (File)

### 4. Configure Locales

In Builder.io Settings > Locales:

1. Enable multi-language content
2. Add locales:
   - `en` (English - default)
   - `es` (Spanish)
   - `ca` (Catalan)
   - `fr` (French)
   - `de` (German)
   - `it` (Italian)

### 5. Add Content

1. Go to **Content** in Builder.io
2. Click **+ New** and select the model (Team Member, Partner, etc.)
3. Fill in the fields
4. Click **Publish**

## How It Works

### Fallback Pattern

The integration uses a fallback pattern:

1. If Builder.io is configured (`NEXT_PUBLIC_BUILDER_API_KEY` is set):
   - Fetch content from Builder.io
   - If content exists, use it

2. If no Builder.io content:
   - Fall back to hardcoded translations
   - Website works without CMS

This means:
- **Development**: Works without Builder.io setup
- **Production**: Can gradually migrate content to CMS

### Registered Components

These components are available in Builder.io's visual editor:

| Component | Description |
|-----------|-------------|
| `HeroSection` | Main hero banner with CTAs |
| `TeamCard` | Individual team member card |
| `TeamGrid` | Grid of team members |
| `PartnerCard` | Individual partner card |
| `NewsCard` | News article card |
| `NewsGrid` | Grid of news articles |
| `CTASection` | Call-to-action banner |
| `CapabilityCard` | Capability/service card |

### Pages Using Builder.io

| Page | Content Type | Fallback |
|------|--------------|----------|
| `/about/team` | Team Members | Translation keys |
| `/about/partners` | Partners | Placeholder data |
| `/news` | News Articles | Translation keys |

## Visual Editing (Optional)

To enable visual editing on the actual website:

1. Go to Builder.io > Settings > Advanced
2. Add your site URL (e.g., `https://dualys.eu`)
3. Use the visual editor to edit content inline

## File Structure

```
src/
  lib/
    builder/
      config.ts      # API key and settings
      client.ts      # Data fetching functions
      components.ts  # Component registration
      index.ts       # Module exports
  components/
    builder/
      BuilderContent.tsx    # Content renderer
      BuilderHero.tsx       # Hero component
      BuilderTeamCard.tsx   # Team card
      BuilderTeamGrid.tsx   # Team grid
      BuilderPartnerCard.tsx
      BuilderNewsCard.tsx
      BuilderNewsGrid.tsx
      BuilderCTA.tsx
      BuilderCapabilityCard.tsx
```

## Troubleshooting

### Content not showing

1. Check API key is correct in `.env.local`
2. Verify content is **Published** (not Draft)
3. Check locale matches the URL

### Visual editor not working

1. Ensure site is accessible from Builder.io servers
2. Check for CSP (Content Security Policy) blocking Builder.io

### Multi-language content missing

1. Verify locale is added in Builder.io Settings
2. Content must be created/translated for each locale

## Cost Summary

| Tier | Cost | Users | Notes |
|------|------|-------|-------|
| Free | $0/month | Up to 10 | Recommended |
| Growth | $49/month | Unlimited | For larger teams |

## Support

- [Builder.io Documentation](https://www.builder.io/c/docs)
- [Builder.io + Next.js Guide](https://www.builder.io/m/nextjs-cms)
- [Builder.io Discord](https://discord.gg/builder)
