#!/usr/bin/env node
/**
 * Context Validator Hook Script
 *
 * Este script valida la estructura de los archivos JSON de contexto
 * para asegurar consistencia en los datos del producto/equipo.
 *
 * Uso (Claude Code hooks):
 *   El script recibe JSON via stdin con tool_input.file_path
 *
 * Uso manual:
 *   node context-validator.js [filepath]
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

console.log('============================================');
console.log('VALIDANDO CONTEXTO JSON');
console.log('============================================');
console.log('Archivo: ' + path.basename(filePath));
console.log('============================================\n');

// Leer y parsear contenido
let content;
try {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  content = JSON.parse(rawContent);
} catch (error) {
  console.error('ERROR: JSON invalido');
  console.error('  ' + error.message);
  console.log('\n============================================');
  console.log('RESULTADO: VALIDACION FALLIDA');
  console.log('============================================');
  process.exit(1);
}

const errors = [];
const warnings = [];
const fileName = path.basename(filePath);

// Validaciones especificas por tipo de archivo
if (fileName.includes('sprint')) {
  // Validar estructura de sprint
  if (!content.sprintId) errors.push('Falta campo "sprintId"');
  if (!content.name) errors.push('Falta campo "name"');
  if (!content.startDate) warnings.push('Falta campo "startDate"');
  if (!content.endDate) warnings.push('Falta campo "endDate"');
  if (!content.goals || !Array.isArray(content.goals)) {
    warnings.push('Falta campo "goals" (array)');
  }
}

if (fileName.includes('team')) {
  // Validar estructura de equipo
  if (!content.name) errors.push('Falta campo "name"');
  if (!content.members || !Array.isArray(content.members)) {
    errors.push('Falta campo "members" (array)');
  }
}

if (fileName.includes('product')) {
  // Validar estructura de producto
  if (!content.name) errors.push('Falta campo "name"');
  if (!content.version) warnings.push('Falta campo "version"');
  if (!content.description) warnings.push('Falta campo "description"');
}

if (fileName.includes('stakeholder')) {
  // Validar estructura de stakeholder
  if (!content.name) errors.push('Falta campo "name"');
  if (!content.role) warnings.push('Falta campo "role"');
  if (!content.email) warnings.push('Falta campo "email"');
}

// Mostrar resultados
if (errors.length > 0) {
  console.log('ERRORES:');
  errors.forEach(err => console.log('  - ' + err));
}

if (warnings.length > 0) {
  console.log('\nADVERTENCIAS:');
  warnings.forEach(warn => console.log('  - ' + warn));
}

console.log('\n============================================');
if (errors.length > 0) {
  console.log('RESULTADO: VALIDACION FALLIDA');
  console.log('Por favor corrige los errores');
  console.log('============================================');
  process.exit(1);
} else {
  console.log('RESULTADO: VALIDACION EXITOSA');
  if (warnings.length > 0) {
    console.log('(con ' + warnings.length + ' advertencias)');
  }
  console.log('============================================');
  process.exit(0);
}
