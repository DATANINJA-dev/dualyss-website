#!/usr/bin/env node
/**
 * Hook: quality-gate.js
 * Se ejecuta al finalizar una sesión de Claude Code
 *
 * Funciones:
 * - Recordar páginas modificadas recientemente
 * - Sugerir auditorías pendientes
 * - Verificar bugs críticos
 * - Generar resumen de cambios
 */

const fs = require('fs');
const path = require('path');

// Directorios del proyecto
const projectRoot = process.cwd();
const backlogDir = path.join(projectRoot, '.claude', 'backlog', 'features');
const reportsDir = path.join(projectRoot, '.claude', 'reports');

// Crear directorio de reports si no existe
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

console.log('\n🔔 Quality Gate - Session End Check');
console.log('═'.repeat(50));

// ============================================
// 1. VERIFICAR BUGS CRÍTICOS PENDIENTES
// ============================================
function checkCriticalBugs() {
  const criticalBugs = [];

  if (fs.existsSync(backlogDir)) {
    const files = fs.readdirSync(backlogDir);

    for (const file of files) {
      if (file.startsWith('BUG-')) {
        const content = fs.readFileSync(path.join(backlogDir, file), 'utf-8');

        // Buscar bugs P0 o P1 pendientes
        if (content.includes('Prioridad: P0') || content.includes('**Prioridad** | P0')) {
          if (content.includes('pending') || content.includes('in_progress')) {
            criticalBugs.push({
              id: file.replace('.md', ''),
              priority: 'P0'
            });
          }
        } else if (content.includes('Prioridad: P1') || content.includes('**Prioridad** | P1')) {
          if (content.includes('pending')) {
            criticalBugs.push({
              id: file.replace('.md', ''),
              priority: 'P1'
            });
          }
        }
      }
    }
  }

  return criticalBugs;
}

// ============================================
// 2. VERIFICAR ARCHIVOS MODIFICADOS RECIENTEMENTE
// ============================================
function getRecentlyModifiedFiles() {
  const recentFiles = [];
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000); // 1 hora

  const dirsToCheck = [
    'app',
    'components',
    'messages'
  ];

  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      } else if (stat.isFile() && stat.mtimeMs > oneHourAgo) {
        if (file.match(/\.(tsx?|jsx?|json)$/)) {
          recentFiles.push({
            path: filePath.replace(projectRoot, ''),
            modified: new Date(stat.mtimeMs).toLocaleTimeString()
          });
        }
      }
    }
  }

  for (const dir of dirsToCheck) {
    walkDir(path.join(projectRoot, dir));
  }

  return recentFiles;
}

// ============================================
// 3. SUGERIR AUDITORÍAS
// ============================================
function suggestAudits(recentFiles) {
  const suggestions = [];

  // Si hay archivos de página modificados, sugerir SEO audit
  const pageFiles = recentFiles.filter(f => f.path.includes('page.tsx'));
  if (pageFiles.length > 0) {
    suggestions.push({
      audit: '/seo-audit',
      reason: `${pageFiles.length} page.tsx file(s) modified`,
      files: pageFiles.map(f => f.path)
    });
  }

  // Si hay componentes de formulario modificados, sugerir security audit
  const formFiles = recentFiles.filter(f =>
    f.path.toLowerCase().includes('form') ||
    f.path.toLowerCase().includes('contact')
  );
  if (formFiles.length > 0) {
    suggestions.push({
      audit: '/security-audit',
      reason: 'Form component(s) modified',
      files: formFiles.map(f => f.path)
    });
  }

  // Si hay traducciones modificadas, sugerir spell audit
  const i18nFiles = recentFiles.filter(f => f.path.includes('messages/'));
  if (i18nFiles.length > 0) {
    suggestions.push({
      audit: '/spell-audit',
      reason: `${i18nFiles.length} translation file(s) modified`,
      files: i18nFiles.map(f => f.path)
    });
  }

  return suggestions;
}

// ============================================
// EJECUTAR CHECKS
// ============================================

// 1. Bugs críticos
const criticalBugs = checkCriticalBugs();
if (criticalBugs.length > 0) {
  console.log('\n🚨 CRITICAL BUGS PENDING:');
  criticalBugs.forEach(bug => {
    console.log(`   ❗ ${bug.id} (${bug.priority})`);
  });
  console.log('\n   💡 Run /fix-bug to resolve before deploying');
}

// 2. Archivos modificados
const recentFiles = getRecentlyModifiedFiles();
if (recentFiles.length > 0) {
  console.log('\n📝 RECENTLY MODIFIED FILES (last hour):');
  recentFiles.slice(0, 10).forEach(file => {
    console.log(`   • ${file.path} (${file.modified})`);
  });
  if (recentFiles.length > 10) {
    console.log(`   ... and ${recentFiles.length - 10} more`);
  }
}

// 3. Sugerencias de auditoría
const auditSuggestions = suggestAudits(recentFiles);
if (auditSuggestions.length > 0) {
  console.log('\n💡 SUGGESTED AUDITS:');
  auditSuggestions.forEach(suggestion => {
    console.log(`   • ${suggestion.audit}`);
    console.log(`     Reason: ${suggestion.reason}`);
  });
}

// 4. Recordatorio de pre-deploy
if (recentFiles.length > 5) {
  console.log('\n📋 REMINDER:');
  console.log('   Run /pre-deploy before committing significant changes');
}

// 5. Resumen final
console.log('\n' + '═'.repeat(50));
console.log('Session Summary:');
console.log(`   • Files modified: ${recentFiles.length}`);
console.log(`   • Critical bugs: ${criticalBugs.length}`);
console.log(`   • Audits suggested: ${auditSuggestions.length}`);

// Guardar log de sesión
const sessionLog = {
  timestamp: new Date().toISOString(),
  filesModified: recentFiles.length,
  criticalBugs: criticalBugs.length,
  auditsSuggested: auditSuggestions.length,
  files: recentFiles.map(f => f.path)
};

const logPath = path.join(reportsDir, `session-${Date.now()}.json`);
fs.writeFileSync(logPath, JSON.stringify(sessionLog, null, 2));

console.log(`\n📁 Session log saved: ${logPath.replace(projectRoot, '')}`);

process.exit(0);
