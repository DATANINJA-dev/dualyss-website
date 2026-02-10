#!/usr/bin/env node
/**
 * Hook: validate-file.js
 * Se ejecuta después de Write/Edit en archivos .tsx/.ts
 *
 * Validaciones:
 * - SEO: Metadata en page.tsx
 * - A11y: Alt text en imágenes, botones accesibles
 * - Security: No eval, no dangerouslySetInnerHTML sin sanitizar
 * - Quality: No console.log, no colores hardcodeados
 */

const fs = require('fs');
const path = require('path');

// Obtener archivo modificado del entorno (Claude Code pasa esto)
const filePath = process.env.CLAUDE_FILE_PATH || process.argv[2];

if (!filePath) {
  console.log('ℹ️ validate-file: No file path provided');
  process.exit(0);
}

// Solo validar archivos TypeScript/React
if (!filePath.match(/\.(tsx?|jsx?)$/)) {
  process.exit(0);
}

// Leer contenido del archivo
let content;
try {
  content = fs.readFileSync(filePath, 'utf-8');
} catch (error) {
  console.error(`❌ Error reading file: ${filePath}`);
  process.exit(1);
}

const warnings = [];
const errors = [];
const info = [];

// ============================================
// VALIDACIONES SEO (solo para page.tsx)
// ============================================
if (filePath.includes('page.tsx')) {
  // Metadata debe existir
  if (!content.includes('export const metadata') && !content.includes('generateMetadata')) {
    warnings.push({
      type: 'SEO',
      message: 'Missing metadata export in page.tsx',
      suggestion: 'Add: export const metadata: Metadata = { title: "...", description: "..." }'
    });
  }

  // Schema JSON-LD recomendado
  if (!content.includes('application/ld+json')) {
    info.push({
      type: 'SEO',
      message: 'No Schema JSON-LD found',
      suggestion: 'Consider adding structured data for rich snippets'
    });
  }
}

// ============================================
// VALIDACIONES ACCESIBILIDAD
// ============================================

// Imágenes sin alt (regex corregido con negative lookahead correcto)
const imgWithoutAlt = content.match(/<img(?![^>]*\balt=)[^>]*>/g);
if (imgWithoutAlt) {
  warnings.push({
    type: 'A11Y',
    message: `Found ${imgWithoutAlt.length} <img> without alt attribute`,
    suggestion: 'Add descriptive alt text to all images'
  });
}

// next/image sin alt (regex corregido)
const nextImageWithoutAlt = content.match(/<Image(?![^>]*\balt=)[^>]*>/g);
if (nextImageWithoutAlt) {
  warnings.push({
    type: 'A11Y',
    message: `Found ${nextImageWithoutAlt.length} <Image> without alt attribute`,
    suggestion: 'Add descriptive alt text to all Image components'
  });
}

// div con onClick (debería ser button)
const divOnClick = content.match(/<div[^>]*onClick/g);
if (divOnClick) {
  warnings.push({
    type: 'A11Y',
    message: `Found ${divOnClick.length} <div> with onClick`,
    suggestion: 'Use <button> instead of <div> for clickable elements'
  });
}

// ============================================
// VALIDACIONES SEGURIDAD
// ============================================

// dangerouslySetInnerHTML
if (content.includes('dangerouslySetInnerHTML')) {
  errors.push({
    type: 'SECURITY',
    message: 'Found dangerouslySetInnerHTML - potential XSS risk',
    suggestion: 'Ensure content is properly sanitized or use alternative approach'
  });
}

// eval()
if (content.match(/\beval\s*\(/)) {
  errors.push({
    type: 'SECURITY',
    message: 'Found eval() - CRITICAL security risk',
    suggestion: 'Never use eval() with user input. Find alternative approach.'
  });
}

// new Function()
if (content.match(/new\s+Function\s*\(/)) {
  errors.push({
    type: 'SECURITY',
    message: 'Found new Function() - potential security risk',
    suggestion: 'Avoid dynamic function creation with user input'
  });
}

// Hardcoded secrets
const secretPatterns = [
  /apiKey\s*[:=]\s*['"][^'"]+['"]/,
  /password\s*[:=]\s*['"][^'"]+['"]/,
  /secret\s*[:=]\s*['"][^'"]+['"]/,
  /token\s*[:=]\s*['"][^'"]+['"]/
];

for (const pattern of secretPatterns) {
  if (content.match(pattern)) {
    errors.push({
      type: 'SECURITY',
      message: 'Possible hardcoded secret detected',
      suggestion: 'Use environment variables for sensitive data'
    });
    break;
  }
}

// ============================================
// VALIDACIONES CALIDAD
// ============================================

// console.log
const consoleLogs = content.match(/console\.(log|debug|info)\(/g);
if (consoleLogs) {
  warnings.push({
    type: 'QUALITY',
    message: `Found ${consoleLogs.length} console.log statements`,
    suggestion: 'Remove console.log before committing to production'
  });
}

// Hardcoded colors (hex)
const hardcodedColors = content.match(/#[0-9a-fA-F]{3,6}(?!\w)/g);
if (hardcodedColors && hardcodedColors.length > 0) {
  // Filtrar colores permitidos (del design system)
  const allowedColors = ['#dc2626', '#0a0a0a', '#ffffff', '#000000'];
  const invalidColors = hardcodedColors.filter(c => !allowedColors.includes(c.toLowerCase()));

  if (invalidColors.length > 0) {
    warnings.push({
      type: 'QUALITY',
      message: `Found ${invalidColors.length} hardcoded colors not in design system`,
      suggestion: 'Use Tailwind classes instead: bg-red-600, text-gray-900, etc.'
    });
  }
}

// ============================================
// OUTPUT
// ============================================

const fileName = path.basename(filePath);

if (errors.length === 0 && warnings.length === 0 && info.length === 0) {
  console.log(`✅ ${fileName}: All validations passed`);
  process.exit(0);
}

console.log(`\n📋 Validation Results: ${fileName}`);
console.log('─'.repeat(50));

if (errors.length > 0) {
  console.log('\n❌ ERRORS (must fix):');
  errors.forEach((e, i) => {
    console.log(`   ${i + 1}. [${e.type}] ${e.message}`);
    console.log(`      💡 ${e.suggestion}`);
  });
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS (should fix):');
  warnings.forEach((w, i) => {
    console.log(`   ${i + 1}. [${w.type}] ${w.message}`);
    console.log(`      💡 ${w.suggestion}`);
  });
}

if (info.length > 0) {
  console.log('\nℹ️  INFO (consider):');
  info.forEach((inf, i) => {
    console.log(`   ${i + 1}. [${inf.type}] ${inf.message}`);
    console.log(`      💡 ${inf.suggestion}`);
  });
}

console.log('─'.repeat(50));
console.log(`Summary: ${errors.length} errors, ${warnings.length} warnings, ${info.length} info`);

// Exit con error si hay errores críticos
if (errors.length > 0) {
  process.exit(1);
}

process.exit(0);
