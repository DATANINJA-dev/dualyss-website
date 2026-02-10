#!/usr/bin/env node
/**
 * Validate Requirement Hook Script
 *
 * Este script valida que los documentos de requisitos contengan
 * todas las secciones necesarias segun el estandar del equipo.
 *
 * Uso (Claude Code hooks):
 *   El script recibe JSON via stdin con tool_input.file_path
 *
 * Uso manual:
 *   node validate-requirement.js [filepath]
 */

const fs = require('fs');
const path = require('path');

/**
 * Lee JSON desde stdin de forma sincrona
 */
function readStdin() {
  try {
    const fd = fs.openSync(0, 'r');
    const buffer = Buffer.alloc(10240);
    let data = '';
    let bytesRead;

    try {
      while ((bytesRead = fs.readSync(fd, buffer, 0, buffer.length, null)) > 0) {
        data += buffer.toString('utf8', 0, bytesRead);
      }
    } catch (e) {
      // EAGAIN means no data available (non-blocking)
      if (e.code !== 'EAGAIN' && e.code !== 'EOF') {
        // Ignore read errors for empty stdin
      }
    }

    return data.trim();
  } catch (e) {
    return '';
  }
}

/**
 * Obtiene la ruta del archivo desde stdin JSON o argumentos
 */
function getFilePath() {
  // Intentar leer de stdin primero (formato Claude Code hooks)
  const stdinData = readStdin();

  if (stdinData) {
    try {
      const hookData = JSON.parse(stdinData);
      if (hookData.tool_input && hookData.tool_input.file_path) {
        return hookData.tool_input.file_path;
      }
    } catch (e) {
      // No es JSON valido, continuar con otros metodos
    }
  }

  // Fallback: variable de entorno o argumento de linea de comandos
  return process.env.CLAUDE_FILE_PATH || process.argv[2];
}

// Obtener ruta del archivo
const filePath = getFilePath();

if (!filePath) {
  console.error('No file path provided');
  process.exit(1);
}

// Verificar que el archivo existe
if (!fs.existsSync(filePath)) {
  console.error('File not found: ' + filePath);
  process.exit(1);
}

// Leer contenido
const content = fs.readFileSync(filePath, 'utf-8');

// Secciones requeridas para un requisito completo
const requiredSections = [
  'User Story',
  'Acceptance Criteria',
  'Story Points'
];

// Secciones opcionales pero recomendadas
const recommendedSections = [
  'Dependencies',
  'Technical Notes',
  'Priority'
];

console.log('============================================');
console.log('VALIDANDO REQUISITO');
console.log('============================================');
console.log('Archivo: ' + path.basename(filePath));
console.log('============================================\n');

// Verificar secciones requeridas
const missingSections = requiredSections.filter(section =>
  !content.toLowerCase().includes(section.toLowerCase())
);

// Verificar secciones recomendadas
const missingRecommended = recommendedSections.filter(section =>
  !content.toLowerCase().includes(section.toLowerCase())
);

let hasErrors = false;

if (missingSections.length > 0) {
  console.log('ERROR: Secciones requeridas faltantes:');
  missingSections.forEach(section => {
    console.log('  - ' + section);
  });
  hasErrors = true;
}

if (missingRecommended.length > 0) {
  console.log('\nADVERTENCIA: Secciones recomendadas faltantes:');
  missingRecommended.forEach(section => {
    console.log('  - ' + section);
  });
}

console.log('\n============================================');
if (hasErrors) {
  console.log('RESULTADO: VALIDACION FALLIDA');
  console.log('Por favor agrega las secciones requeridas');
  console.log('============================================');
  process.exit(1);
} else {
  console.log('RESULTADO: VALIDACION EXITOSA');
  console.log('============================================');
  process.exit(0);
}
