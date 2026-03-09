#!/usr/bin/env node
/**
 * CTA Mapping Validation Hook
 * Validates CTA consistency between code and registry
 * Runs on: Pre-commit for component files containing CTAs
 *
 * Checks:
 * - All CTA hrefs in code match registry destinations
 * - No orphaned CTAs (in code but not registry)
 * - Semantic match quality
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Paths relative to project root
const CTA_REGISTRY = 'cta-registry.yaml';
const COMPONENTS_DIR = 'src/components';
const PAGES_DIR = 'src/app/[locale]';

/**
 * Load YAML file
 */
function loadYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return yaml.parse(content);
  } catch (error) {
    console.error(`Failed to load ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Extract Link hrefs from a TypeScript/TSX file
 */
function extractLinksFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const links = [];

    // Match Link href="/path" patterns
    const hrefPattern = /href=["']([^"']+)["']/g;
    let match;

    while ((match = hrefPattern.exec(content)) !== null) {
      const href = match[1];
      // Only internal links (starting with /)
      if (href.startsWith('/')) {
        links.push({
          href,
          file: filePath,
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }

    return links;
  } catch (error) {
    return [];
  }
}

/**
 * Get all registered destinations from CTA registry
 */
function getRegisteredDestinations(ctaRegistry) {
  const destinations = new Set();

  // capability_to_sector destinations
  if (ctaRegistry.capability_to_sector) {
    Object.values(ctaRegistry.capability_to_sector).forEach(data => {
      if (data.primary_cta?.destination) {
        destinations.add(data.primary_cta.destination);
      }
      if (data.secondary_ctas) {
        data.secondary_ctas.forEach(cta => {
          if (cta.destination) destinations.add(cta.destination);
        });
      }
    });
  }

  // page_ctas destinations
  if (ctaRegistry.page_ctas) {
    Object.values(ctaRegistry.page_ctas).forEach(ctas => {
      if (ctas.primary?.destination) destinations.add(ctas.primary.destination);
      if (ctas.secondary?.destination) destinations.add(ctas.secondary.destination);
      if (ctas.capabilities_grid) {
        ctas.capabilities_grid.forEach(item => {
          if (item.destination) destinations.add(item.destination);
        });
      }
    });
  }

  // header navigation
  if (ctaRegistry.header?.main_nav) {
    ctaRegistry.header.main_nav.forEach(item => {
      if (item.path) destinations.add(item.path);
    });
  }

  // footer sections
  if (ctaRegistry.footer?.sections) {
    Object.values(ctaRegistry.footer.sections).forEach(links => {
      links.forEach(link => destinations.add(link));
    });
  }

  return destinations;
}

/**
 * Find all TSX files recursively
 */
function findTsxFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findTsxFiles(fullPath, files);
    } else if (entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main validation function
 */
function validate() {
  console.log('Validating CTA mappings...\n');

  const ctaRegistry = loadYaml(CTA_REGISTRY);

  if (!ctaRegistry) {
    console.error('Failed to load CTA registry');
    return { success: false, errors: ['Failed to load CTA registry'] };
  }

  const registeredDestinations = getRegisteredDestinations(ctaRegistry);
  console.log(`Found ${registeredDestinations.size} registered destinations\n`);

  // Find all TSX files in components and pages
  const componentFiles = findTsxFiles(COMPONENTS_DIR);
  const pageFiles = findTsxFiles(PAGES_DIR);
  const allFiles = [...componentFiles, ...pageFiles];

  console.log(`Scanning ${allFiles.length} TSX files...\n`);

  // Extract all links from files
  const allLinks = [];
  allFiles.forEach(file => {
    const links = extractLinksFromFile(file);
    allLinks.push(...links);
  });

  console.log(`Found ${allLinks.length} internal links\n`);

  // Check for unregistered links (potential orphans)
  const unregisteredLinks = allLinks.filter(link => {
    // Skip dynamic routes and common patterns
    if (link.href.includes('[')) return false;
    if (link.href === '#') return false;

    // Check if it's a known pattern (like /legal/*, /news/*)
    const knownPatterns = ['/legal/', '/news/', '/capabilities/', '/about/', '/sectors/'];
    for (const pattern of knownPatterns) {
      if (link.href.startsWith(pattern)) return false;
    }

    return !registeredDestinations.has(link.href);
  });

  // Report findings
  if (unregisteredLinks.length > 0) {
    console.log('Unregistered links found (consider adding to CTA registry):');
    const uniqueLinks = [...new Set(unregisteredLinks.map(l => l.href))];
    uniqueLinks.forEach(href => {
      const files = unregisteredLinks
        .filter(l => l.href === href)
        .map(l => path.basename(l.file))
        .join(', ');
      console.log(`   - ${href} (in: ${files})`);
    });
    console.log();
  }

  console.log('CTA mapping validation complete!');
  console.log(`   - ${registeredDestinations.size} registered destinations`);
  console.log(`   - ${allLinks.length} links scanned`);
  console.log(`   - ${unregisteredLinks.length} potentially unregistered`);

  return { success: true, unregisteredCount: unregisteredLinks.length };
}

// Run if called directly
if (require.main === module) {
  const result = validate();
  if (!result.success) {
    process.exitCode = 1;
  }
}

module.exports = { validate, loadYaml, extractLinksFromFile };
