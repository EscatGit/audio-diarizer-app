/**
 * Módulo de configuración para la aplicación
 * Maneja las opciones y valores por defecto
 */

const DEFAULT_CONFIG = {
  // URL del servidor por defecto
  serverUrl: 'http://localhost:8000',
  
  // Opciones de diarización
  diarizerOptions: {
    // Número de hablantes predeterminado
    defaultSpeakers: 2,
    
    // Tipo de diarizador predeterminado
    defaultType: 'lightweight',
    
    // Opciones disponibles para el número de hablantes
    speakerOptions: [2, 3, 4, 5, 6],
    
    // Opciones disponibles para el tipo de diarizador
    typeOptions: [
      { id: 'lightweight', name: 'Ligera (rápida)' },
      { id: 'whisper', name: 'Whisper (completa)' }
    ]
  },
  
  // Configuración de la aplicación
  app: {
    // Nombre de la aplicación
    name: 'Audio Diarizer',
    
    // Tiempo de espera máximo para las solicitudes (en milisegundos)
    requestTimeout: 60000,
    
    // Intervalo de verificación del estado (en milisegundos)
    pollingInterval: 2000
  }
};

module.exports = {
  // Configuración predeterminada
  DEFAULT_CONFIG,
  
  // Función para fusionar la configuración del usuario con la predeterminada
  mergeConfig: function(userConfig) {
    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
      diarizerOptions: {
        ...DEFAULT_CONFIG.diarizerOptions,
        ...(userConfig?.diarizerOptions || {})
      },
      app: {
        ...DEFAULT_CONFIG.app,
        ...(userConfig?.app || {})
      }
    };
  },
  
  // Validación de URL
  isValidUrl: function(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
};
