const { contextBridge, ipcRenderer } = require('electron');

// Registrar mensajes de depuración
console.log('Preload script iniciado');

// Funciones que serán expuestas al proceso de renderizado
const exposedAPIs = {
  // Funciones para la comunicación con el proceso principal
  selectAudioFile: async () => {
    console.log('Solicitando selección de archivo de audio desde preload');
    try {
      const result = await ipcRenderer.invoke('select-audio-file');
      console.log('Resultado de la selección de archivo:', result);
      return result;
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
      throw error;
    }
  },
  
  getServerUrl: async () => {
    console.log('Solicitando URL del servidor desde preload');
    try {
      const result = await ipcRenderer.invoke('get-server-url');
      console.log('URL del servidor obtenida:', result);
      return result;
    } catch (error) {
      console.error('Error al obtener URL del servidor:', error);
      throw error;
    }
  },
  
  saveServerUrl: async (url) => {
    console.log('Guardando URL del servidor desde preload:', url);
    try {
      const result = await ipcRenderer.invoke('save-server-url', url);
      console.log('Resultado al guardar URL del servidor:', result);
      return result;
    } catch (error) {
      console.error('Error al guardar URL del servidor:', error);
      throw error;
    }
  },
  
  readFile: async (filePath) => {
    console.log('Solicitando lectura de archivo desde preload:', filePath);
    try {
      const result = await ipcRenderer.invoke('read-file', filePath);
      console.log('Archivo leído con éxito, tamaño (bytes):', result.length);
      return result;
    } catch (error) {
      console.error('Error al leer archivo:', error);
      throw error;
    }
  },
  
  saveTranscript: async (content) => {
    console.log('Solicitando guardar transcripción desde preload');
    try {
      const result = await ipcRenderer.invoke('save-transcript', content);
      console.log('Transcripción guardada en:', result);
      return result;
    } catch (error) {
      console.error('Error al guardar transcripción:', error);
      throw error;
    }
  },
  
  // Información de la aplicación
  appVersion: process.env.npm_package_version || '1.0.0'
};

// Exponer las funcionalidades a la ventana del navegador
contextBridge.exposeInMainWorld('api', exposedAPIs);

console.log('APIs expuestas con éxito:', Object.keys(exposedAPIs));
