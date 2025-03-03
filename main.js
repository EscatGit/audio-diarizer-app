const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

// Configurar logging
console.log('Iniciando aplicación Audio Diarizer');

// Crear almacenamiento para configuración persistente
const store = new Store({
  name: 'audio-diarizer-config'
});

// Variable para mantener referencia global a la ventana
let mainWindow;

function createWindow() {
  console.log('Creando ventana principal');
    
// Crear la ventana del navegador
mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
    webSecurity: true
  },
  icon: path.join(__dirname, 'assets/icon.png')
});

// Configurar CSP (Content Security Policy) más permisiva
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self' http://localhost:* http://* https://*; " +
        "script-src 'self'; " +
        "connect-src 'self' http://localhost:* http://* https://*; " +
        "img-src 'self' data: http://localhost:* http://* https://*; " +
        "style-src 'self' 'unsafe-inline';"
      ]
    }
  });
});
  

  // Cargar la página HTML
  mainWindow.loadFile('index.html');

  // Herramientas de desarrollo en entorno de desarrollo
  mainWindow.webContents.openDevTools();
  
  console.log('Ventana principal creada');
}

// Crear ventana cuando la aplicación esté lista
app.whenReady().then(() => {
  console.log('Aplicación lista, creando ventana...');
  createWindow();

  app.on('activate', function () {
    // En macOS es común recrear una ventana cuando
    // se hace clic en el icono del dock y no hay otras ventanas abiertas
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  
  // Configurar manejadores de IPC
  setupIpcHandlers();
});

// Salir cuando todas las ventanas estén cerradas, excepto en macOS
app.on('window-all-closed', function () {
  console.log('Todas las ventanas cerradas, saliendo de la aplicación');
  if (process.platform !== 'darwin') app.quit();
});

// Manejador de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  // Mostrar diálogo de error en la aplicación
  if (mainWindow) {
    dialog.showErrorBox(
      'Error en la aplicación',
      `Ha ocurrido un error inesperado: ${error.message}\n\nLa aplicación intentará continuar, pero es posible que deba reiniciarla.`
    );
  }
});

// Configurar manejadores de eventos IPC
function setupIpcHandlers() {
  console.log('Configurando manejadores de eventos IPC');
  
  // Selección de archivo de audio
  ipcMain.handle('select-audio-file', async () => {
    console.log('Manejando evento select-audio-file');
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Archivos de Audio', extensions: ['mp3', 'wav', 'ogg', 'flac'] }
        ]
      });
      
      console.log('Resultado de diálogo:', { canceled, filePaths });
      
      if (canceled) {
        return null;
      } else {
        return filePaths[0];
      }
    } catch (error) {
      console.error('Error en select-audio-file:', error);
      throw error;
    }
  });

  // Obtener URL del servidor
  ipcMain.handle('get-server-url', () => {
    console.log('Manejando evento get-server-url');
    try {
      const url = store.get('serverUrl', 'http://localhost:8000');
      console.log('URL del servidor obtenida:', url);
      return url;
    } catch (error) {
      console.error('Error en get-server-url:', error);
      return 'http://localhost:8000';
    }
  });

  // Guardar URL del servidor
  ipcMain.handle('save-server-url', (event, url) => {
    console.log('Manejando evento save-server-url:', url);
    try {
      store.set('serverUrl', url);
      console.log('URL del servidor guardada correctamente');
      return true;
    } catch (error) {
      console.error('Error en save-server-url:', error);
      throw error;
    }
  });

  // Leer archivo para enviar al servidor
  ipcMain.handle('read-file', async (event, filePath) => {
    console.log('Manejando evento read-file:', filePath);
    try {
      const buffer = fs.readFileSync(filePath);
      console.log('Archivo leído correctamente, tamaño (bytes):', buffer.length);
      return buffer;
    } catch (error) {
      console.error('Error en read-file:', error);
      throw error;
    }
  });

  // Guardar transcripción
  ipcMain.handle('save-transcript', async (event, content) => {
    console.log('Manejando evento save-transcript');
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Guardar transcripción',
        defaultPath: path.join(app.getPath('documents'), 'transcripcion.txt'),
        filters: [
          { name: 'Archivos de texto', extensions: ['txt'] }
        ]
      });

      console.log('Resultado de diálogo de guardado:', { canceled, filePath });

      if (!canceled) {
        fs.writeFileSync(filePath, content);
        console.log('Transcripción guardada correctamente en:', filePath);
        return filePath;
      }
      return null;
    } catch (error) {
      console.error('Error en save-transcript:', error);
      throw error;
    }
  });
  
  console.log('Manejadores de eventos IPC configurados correctamente');
}
