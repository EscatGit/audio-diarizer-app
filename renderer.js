// Las APIs están expuestas por preload.js en window.api
console.log("Iniciando renderer.js");

// Variables globales
let selectedFilePath = null;
let currentJobId = null;
let currentTranscriptText = null;

// Elementos del DOM
const elements = {
  selectFileBtn: document.getElementById('select-file-btn'),
  fileNameDisplay: document.getElementById('file-name'),
  numSpeakersSelect: document.getElementById('num-speakers'),
  diarizerTypeSelect: document.getElementById('diarizer-type'),
  submitButton: document.getElementById('submit-button'),
  uploadSection: document.getElementById('upload-section'),
  processingSection: document.getElementById('processing'),
  resultsSection: document.getElementById('results'),
  errorSection: document.getElementById('error'),
  errorMessage: document.getElementById('error-message'),
  transcript: document.getElementById('transcript'),
  saveBtn: document.getElementById('save-btn'),
  newFileBtn: document.getElementById('new-file-btn'),
  tryAgainBtn: document.getElementById('try-again-btn'),
  settingsBtn: document.getElementById('settings-btn'),
  settingsModal: document.getElementById('settings-modal'),
  closeModal: document.getElementById('close-modal'),
  serverUrlInput: document.getElementById('server-url'),
  saveSettingsBtn: document.getElementById('save-settings'),
  appVersion: document.getElementById('app-version')
};

// Imprimir para depuración
console.log("Elementos cargados:", elements);

// Inicialización
async function init() {
  try {
    // Mostrar versión de la aplicación
    if (elements.appVersion) {
      elements.appVersion.textContent = `v${window.api.appVersion}`;
    }
    
    // Cargar la URL del servidor
    const serverUrl = await window.api.getServerUrl();
    if (elements.serverUrlInput) {
      elements.serverUrlInput.value = serverUrl;
    }
    
    // Añadir event listeners
    addEventListeners();
    
    console.log("Inicialización completada con éxito");
  } catch (error) {
    console.error("Error durante la inicialización:", error);
  }
}

// Añadir todos los event listeners
function addEventListeners() {
  console.log("Agregando event listeners...");
  
  // Selección de archivo
  if (elements.selectFileBtn) {
    console.log("Agregando evento para botón de selección de archivo");
    elements.selectFileBtn.addEventListener('click', handleFileSelection);
  } else {
    console.error("No se encontró el botón de selección de archivo");
  }
  
  // Envío del formulario
  if (elements.submitButton) {
    elements.submitButton.addEventListener('click', handleFormSubmit);
  }
  
  // Botones de resultados
  if (elements.saveBtn) {
    elements.saveBtn.addEventListener('click', saveTranscript);
  }
  if (elements.newFileBtn) {
    elements.newFileBtn.addEventListener('click', resetForm);
  }
  
  // Botón de reintentar en caso de error
  if (elements.tryAgainBtn) {
    elements.tryAgainBtn.addEventListener('click', resetForm);
  }
  
  // Controles de configuración
  if (elements.settingsBtn) {
    console.log("Agregando evento para botón de configuración");
    elements.settingsBtn.addEventListener('click', openSettings);
  } else {
    console.error("No se encontró el botón de configuración");
  }
  
  if (elements.closeModal) {
    elements.closeModal.addEventListener('click', closeSettings);
  }
  
  if (elements.saveSettingsBtn) {
    elements.saveSettingsBtn.addEventListener('click', saveSettings);
  }
  
  // Cerrar modal al hacer clic fuera
  window.addEventListener('click', (e) => {
    if (elements.settingsModal && e.target === elements.settingsModal) {
      closeSettings();
    }
  });
  
  console.log("Event listeners agregados correctamente");
}

// Manejar la selección de archivo
async function handleFileSelection() {
  console.log("Invocando selección de archivo...");
  try {
    const filePath = await window.api.selectAudioFile();
    console.log("Archivo seleccionado:", filePath);
    
    if (filePath) {
      selectedFilePath = filePath;
      elements.fileNameDisplay.textContent = filePath.split(/[\\/]/).pop(); // Solo mostrar el nombre del archivo
      elements.submitButton.disabled = false;
      console.log("Selección de archivo completada con éxito");
    }
  } catch (error) {
    console.error("Error al seleccionar archivo:", error);
  }
}

// Manejar el envío del formulario
async function handleFormSubmit() {
  if (!selectedFilePath) {
    console.error("No hay archivo seleccionado");
    return;
  }
  
  console.log("Enviando formulario con archivo:", selectedFilePath);
  
  // Mostrar sección de procesamiento
  elements.uploadSection.classList.add('hidden');
  elements.processingSection.classList.remove('hidden');
  
  try {
    // Obtener la URL del servidor
    const serverUrl = await window.api.getServerUrl();
    console.log("URL del servidor:", serverUrl);
    
    // Crear una instancia del cliente API usando axios directamente
    // Esta parte es experimental y quizás deba ajustarse
    const formData = new FormData();
    formData.append('file', await readFileAsBlob(selectedFilePath));
    formData.append('num_speakers', elements.numSpeakersSelect.value);
    formData.append('diarizer_type', elements.diarizerTypeSelect.value);
    
    console.log("Enviando solicitud al servidor...");
    
    // Usar fetch para enviar la solicitud
    const response = await fetch(`${serverUrl}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log("Respuesta del servidor:", responseData);
    
    currentJobId = responseData.job_id;
    
    // Comenzar a verificar el estado
    pollJobStatus(serverUrl, currentJobId);
  } catch (error) {
    console.error('Error al enviar el archivo:', error);
    showError(error.message || 'Error al conectar con el servidor');
  }
}

// Función auxiliar para leer el archivo como Blob
async function readFileAsBlob(filePath) {
  console.log("Leyendo archivo como Blob:", filePath);
  try {
    const buffer = await window.api.readFile(filePath);
    return new Blob([buffer]);
  } catch (error) {
    console.error("Error al leer archivo:", error);
    throw error;
  }
}

// Verificar periódicamente el estado del trabajo
async function pollJobStatus(serverUrl, jobId) {
  if (!jobId) {
    console.error("No hay ID de trabajo para verificar estado");
    return;
  }
  
  console.log("Verificando estado del trabajo:", jobId);
  
  try {
    // Verificar estado usando fetch
    const response = await fetch(`${serverUrl}/api/status/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`Error al verificar estado: ${response.status} ${response.statusText}`);
    }
    
    const statusData = await response.json();
    console.log("Estado del trabajo:", statusData);
    
    if (statusData.status === 'completed') {
      // Trabajo completado con éxito
      console.log("Trabajo completado, obteniendo transcripción");
      
      const transcriptResponse = await fetch(`${serverUrl}/api/transcript/${jobId}`);
      if (!transcriptResponse.ok) {
        throw new Error("No se pudo obtener la transcripción");
      }
      
      const transcriptData = await transcriptResponse.text();
      showResults(statusData, transcriptData);
    } else if (statusData.status === 'error') {
      // Ocurrió un error durante el procesamiento
      console.error("Error en el procesamiento:", statusData.error);
      showError(statusData.error || 'Error durante el procesamiento');
    } else {
      // Trabajo aún en proceso, verificar nuevamente en 2 segundos
      console.log("Trabajo en progreso, verificando nuevamente en 2 segundos");
      setTimeout(() => pollJobStatus(serverUrl, jobId), 2000);
    }
  } catch (error) {
    console.error('Error al verificar estado:', error);
    showError(error.message || 'Error al comunicarse con el servidor');
  }
}

// Mostrar resultados
function showResults(statusData, transcriptText) {
  console.log("Mostrando resultados");
  
  // Ocultar sección de procesamiento
  elements.processingSection.classList.add('hidden');
  
  // Mostrar sección de resultados
  elements.resultsSection.classList.remove('hidden');
  
  // Guardar el texto de la transcripción para uso posterior
  currentTranscriptText = transcriptText;
  
  // Mostrar transcripción en la interfaz
  elements.transcript.textContent = transcriptText;
  
  console.log("Resultados mostrados con éxito");
}

// Mostrar error
function showError(message) {
  console.error("Mostrando error:", message);
  
  // Ocultar sección de procesamiento
  elements.processingSection.classList.add('hidden');
  
  // Mostrar sección de error
  elements.errorSection.classList.remove('hidden');
  
  // Mostrar mensaje de error
  elements.errorMessage.textContent = message;
}

// Guardar transcripción
async function saveTranscript() {
  if (!currentTranscriptText) {
    console.error("No hay transcripción para guardar");
    return;
  }
  
  console.log("Guardando transcripción...");
  
  try {
    const savedPath = await window.api.saveTranscript(currentTranscriptText);
    if (savedPath) {
      console.log("Transcripción guardada en:", savedPath);
      alert(`Transcripción guardada en: ${savedPath}`);
    }
  } catch (error) {
    console.error('Error al guardar la transcripción:', error);
    alert('Error al guardar la transcripción');
  }
}

// Reiniciar el formulario
function resetForm() {
  console.log("Reiniciando formulario");
  
  // Limpiar variables
  selectedFilePath = null;
  currentJobId = null;
  currentTranscriptText = null;
  
  // Reiniciar interfaz
  elements.fileNameDisplay.textContent = 'Ningún archivo seleccionado';
  elements.submitButton.disabled = true;
  
  // Mostrar sección de carga
  elements.uploadSection.classList.remove('hidden');
  elements.processingSection.classList.add('hidden');
  elements.resultsSection.classList.add('hidden');
  elements.errorSection.classList.add('hidden');
  
  console.log("Formulario reiniciado con éxito");
}

// Abrir modal de configuración
function openSettings() {
  console.log("Abriendo modal de configuración");
  
  if (elements.settingsModal) {
    elements.settingsModal.classList.remove('hidden');
    console.log("Modal de configuración abierto");
  } else {
    console.error("No se encontró el modal de configuración");
  }
}

// Cerrar modal de configuración
function closeSettings() {
  console.log("Cerrando modal de configuración");
  
  if (elements.settingsModal) {
    elements.settingsModal.classList.add('hidden');
    console.log("Modal de configuración cerrado");
  }
}

// Guardar configuración
async function saveSettings() {
  console.log("Guardando configuración");
  
  if (!elements.serverUrlInput) {
    console.error("No se encontró el input de URL del servidor");
    return;
  }
  
  const serverUrl = elements.serverUrlInput.value.trim();
  
  if (!serverUrl) {
    console.error("La URL del servidor no puede estar vacía");
    alert('La URL del servidor no puede estar vacía');
    return;
  }
  
  try {
    console.log("Guardando URL del servidor:", serverUrl);
    await window.api.saveServerUrl(serverUrl);
    closeSettings();
    console.log("Configuración guardada con éxito");
  } catch (error) {
    console.error('Error al guardar la configuración:', error);
    alert('Error al guardar la configuración');
  }
}

// Formato de tiempo HH:MM:SS
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

// Iniciar aplicación
console.log("Iniciando aplicación...");
init();
