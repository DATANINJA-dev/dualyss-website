/**
 * JSON-LD structured data component for SEO.
 * The dangerouslySetInnerHTML is intentionally used here as the data
 * is constructed server-side from trusted sources (not user input).
 * This is the standard Next.js pattern for embedding JSON-LD.
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  // Data is constructed from trusted internal sources, not user input
  const jsonString = JSON.stringify(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
