/**
 * Módulo de utilidades para la aplicación
 * Contiene funciones auxiliares comunes
 */

const fs = require('fs');
const path = require('path');

/**
 * Formatea segundos en formato HH:MM:SS
 * @param {number} seconds - Tiempo en segundos
 * @returns {string} - Tiempo formateado
 */
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  return [
    h,
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0')
  ].filter((v, i) => v > 0 || i > 0).join(':');
}

/**
 * Obtiene la extensión de un archivo
 * @param {string} filePath - Ruta del archivo
 * @returns {string} - Extensión del archivo (sin el punto)
 */
function getFileExtension(filePath) {
  return path.extname(filePath).substring(1).toLowerCase();
}

/**
 * Verifica si un archivo es un formato de audio soportado
 * @param {string} filePath - Ruta del archivo
 * @returns {boolean} - True si es un formato soportado
 */
function isSupportedAudioFormat(filePath) {
  const supportedFormats = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
  const extension = getFileExtension(filePath);
  return supportedFormats.includes(extension);
}

/**
 * Obtiene el tamaño de un archivo en formato legible
 * @param {string} filePath - Ruta del archivo
 * @returns {string} - Tamaño formateado (ej: "4.2 MB")
 */
function getReadableFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  if (bytes === 0) return '0 Byte';
  
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

/**
 * Crea un nombre de archivo único basado en la fecha y hora
 * @param {string} prefix - Prefijo para el nombre del archivo
 * @param {string} extension - Extensión del archivo (sin el punto)
 * @returns {string} - Nombre de archivo único
 */
function generateUniqueFilename(prefix = 'file', extension = 'txt') {
  const date = new Date();
  const timestamp = date.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .substring(0, 19);
  
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Obtiene el directorio de usuario según el sistema operativo
 * @returns {string} - Ruta al directorio de usuario
 */
function getUserDirectory() {
  return process.env.HOME || process.env.USERPROFILE;
}

module.exports = {
  formatTime,
  getFileExtension,
  isSupportedAudioFormat,
  getReadableFileSize,
  generateUniqueFilename,
  getUserDirectory
};
