#!/usr/bin/env node
/**
 * Hook: brand-color-validator.js
 * Validates that TSX components only use on-brand Tailwind colors.
 *
 * Dualys Brand Colors:
 * - primary-* (black scale)
 * - accent-* (blue #4F61E7)
 * - neutral-* (grays)
 * - semantic: success, warning, destructive, info
 *
 * Banned colors: purple, violet, indigo, pink, rose, fuchsia, cyan, sky, lime, orange
 */

const fs = require('fs');
const path = require('path');

// Get file path from environment or arguments
const filePath = process.env.CLAUDE_FILE_PATH || process.argv[2];

if (!filePath) {
  console.log('brand-color-validator: No file path provided');
  process.exit(0);
}

// Only validate TSX/JSX files in src/
if (!filePath.match(/src\/.*\.(tsx|jsx)$/)) {
  process.exit(0);
}

// Read file content
let content;
try {
  content = fs.readFileSync(filePath, 'utf-8');
} catch (error) {
  console.error(`Error reading file: ${filePath}`);
  process.exit(1);
}

const violations = [];

// ============================================
// BANNED TAILWIND COLOR CLASSES
// ============================================

const bannedColors = [
  'purple', 'violet', 'indigo',
  'pink', 'rose', 'fuchsia',
  'cyan', 'sky', 'lime', 'orange',
  'teal', 'emerald'
];

// Pattern to match Tailwind color utilities: bg-purple-50, text-violet-600, etc.
const colorPrefixes = ['bg', 'text', 'border', 'from', 'to', 'via', 'ring', 'outline', 'fill', 'stroke', 'divide', 'placeholder'];

for (const color of bannedColors) {
  for (const prefix of colorPrefixes) {
    // Match patterns like: bg-purple-50, text-purple-600, etc.
    const pattern = new RegExp(`${prefix}-${color}-\\d+`, 'g');
    const matches = content.match(pattern);

    if (matches) {
      violations.push({
        type: 'OFF-BRAND',
        classes: [...new Set(matches)],
        suggestion: `Replace ${color}-* with accent-*, neutral-*, or primary-*`
      });
    }
  }
}

// ============================================
// BANNED RAW TAILWIND COLORS (without scale)
// ============================================

for (const color of bannedColors) {
  for (const prefix of colorPrefixes) {
    // Match patterns without scale: bg-purple, text-indigo (less common but possible)
    const patternNoScale = new RegExp(`\\b${prefix}-${color}\\b(?!-)`, 'g');
    const matchesNoScale = content.match(patternNoScale);

    if (matchesNoScale) {
      violations.push({
        type: 'OFF-BRAND',
        classes: [...new Set(matchesNoScale)],
        suggestion: `Replace ${color} with accent, neutral, or primary`
      });
    }
  }
}

// ============================================
// CHECK FOR HARDCODED HEX COLORS (excluding known brand)
// ============================================

const allowedHexColors = [
  '#000000', '#ffffff', '#fff', '#000',  // Black & White
  '#4f61e7', '#4F61E7',                  // Brand accent blue
  // Add hex colors from the accent scale if needed
];

const hexPattern = /#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])/g;
const hexMatches = content.match(hexPattern);

if (hexMatches) {
  const invalidHex = hexMatches.filter(hex =>
    !allowedHexColors.includes(hex.toLowerCase()) &&
    !allowedHexColors.includes(hex.toUpperCase())
  );

  if (invalidHex.length > 0) {
    violations.push({
      type: 'HARDCODED-COLOR',
      classes: [...new Set(invalidHex)],
      suggestion: 'Use Tailwind tokens: primary-*, accent-*, neutral-*'
    });
  }
}

// ============================================
// OUTPUT
// ============================================

const fileName = path.basename(filePath);

if (violations.length === 0) {
  console.log(`brand-color-validator: ${fileName} - All colors on-brand`);
  process.exit(0);
}

console.log(`\nBRAND COLOR VIOLATIONS: ${fileName}`);
console.log('─'.repeat(50));

let totalClasses = 0;
violations.forEach((v, i) => {
  console.log(`\n[${v.type}] Found off-brand colors:`);
  v.classes.forEach(cls => {
    console.log(`   - ${cls}`);
    totalClasses++;
  });
  console.log(`   Suggestion: ${v.suggestion}`);
});

console.log('─'.repeat(50));
console.log(`Total violations: ${totalClasses} classes in ${violations.length} categories`);
console.log('\nAllowed color families:');
console.log('   - primary-* (black scale)');
console.log('   - accent-* (blue #4F61E7)');
console.log('   - neutral-* (gray scale)');
console.log('   - success, warning, destructive, info (semantic)');

// Exit with error to flag the issue
process.exit(1);
