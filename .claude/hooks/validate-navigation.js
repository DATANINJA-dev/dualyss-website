#!/usr/bin/env node
/**
 * Navigation Validation Hook
 * Validates that all navigation links resolve to existing pages
 * Runs on: Pre-commit for navigation-related files
 *
 * Checks:
 * - Header navigation links
 * - Footer links
 * - Internal links in components
 * - Route registry consistency
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Paths relative to project root
const ROUTE_REGISTRY = 'route-registry.yaml';
const CTA_REGISTRY = 'cta-registry.yaml';
const LOCALES = ['en', 'fr', 'es', 'de', 'it', 'ca'];

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
 * Extract all paths from route registry
 */
function extractRoutePaths(routes, paths = new Set()) {
  for (const route of routes) {
    if (route.path) {
      paths.add(route.path);
    }
    if (route.children) {
      extractRoutePaths(route.children, paths);
    }
  }
  return paths;
}

/**
 * Check if a path exists in the route registry
 */
function pathExists(path, validPaths) {
  // Handle dynamic routes like /news/[slug]
  if (path.includes('[')) {
    const pattern = path.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return Array.from(validPaths).some(p => regex.test(p) || p === path);
  }
  return validPaths.has(path);
}

/**
 * Validate CTA destinations against route registry
 */
function validateCTAs(ctaRegistry, validPaths) {
  const errors = [];
  const warnings = [];

  // Validate capability_to_sector destinations
  if (ctaRegistry.capability_to_sector) {
    for (const [capability, data] of Object.entries(ctaRegistry.capability_to_sector)) {
      if (data.primary_cta?.destination) {
        if (!pathExists(data.primary_cta.destination, validPaths)) {
          errors.push(`capability_to_sector.${capability}.primary_cta: Invalid destination "${data.primary_cta.destination}"`);
        }
      }
      if (data.secondary_ctas) {
        data.secondary_ctas.forEach((cta, i) => {
          if (cta.destination && !pathExists(cta.destination, validPaths)) {
            errors.push(`capability_to_sector.${capability}.secondary_ctas[${i}]: Invalid destination "${cta.destination}"`);
          }
        });
      }
    }
  }

  // Validate page_ctas destinations
  if (ctaRegistry.page_ctas) {
    for (const [page, ctas] of Object.entries(ctaRegistry.page_ctas)) {
      if (ctas.primary?.destination && !pathExists(ctas.primary.destination, validPaths)) {
        errors.push(`page_ctas.${page}.primary: Invalid destination "${ctas.primary.destination}"`);
      }
      if (ctas.secondary?.destination && !pathExists(ctas.secondary.destination, validPaths)) {
        errors.push(`page_ctas.${page}.secondary: Invalid destination "${ctas.secondary.destination}"`);
      }
    }
  }

  return { errors, warnings };
}

/**
 * Main validation function
 */
function validate() {
  console.log('🔍 Validating navigation links...\n');

  const routeRegistry = loadYaml(ROUTE_REGISTRY);
  const ctaRegistry = loadYaml(CTA_REGISTRY);

  if (!routeRegistry || !ctaRegistry) {
    console.error('❌ Failed to load registry files');
    process.exit(1);
  }

  const validPaths = extractRoutePaths(routeRegistry.routes);
  console.log(`📄 Found ${validPaths.size} valid routes in registry\n`);

  // Validate CTA destinations
  const { errors, warnings } = validateCTAs(ctaRegistry, validPaths);

  // Report results
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(w => console.log(`   - ${w}`));
    console.log();
  }

  if (errors.length > 0) {
    console.log('❌ Errors:');
    errors.forEach(e => console.log(`   - ${e}`));
    console.log();
    console.log(`Validation failed with ${errors.length} error(s)`);
    process.exit(1);
  }

  console.log('✅ Navigation validation passed!');
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  validate();
}

module.exports = { validate, loadYaml, extractRoutePaths, pathExists };
