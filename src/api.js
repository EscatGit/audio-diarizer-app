// Este módulo maneja todas las comunicaciones con el servidor
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class ApiClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
  }

  // Establecer URL del servidor
  setServerUrl(url) {
    this.serverUrl = url;
  }

  // Obtener URL del servidor
  getServerUrl() {
    return this.serverUrl;
  }

  // Verificar conexión con el servidor
  async checkConnection() {
    try {
      const response = await axios.get(`${this.serverUrl}/health`);
      return response.status === 200;
    } catch (error) {
      console.error('Error al verificar la conexión:', error);
      return false;
    }
  }

  // Subir archivo de audio para procesamiento
  async uploadAudio(filePath, numSpeakers, diarizerType) {
    try {
      const formData = new FormData();
      
      // Crear un stream de lectura para el archivo
      const fileStream = fs.createReadStream(filePath);
      
      // Añadir el archivo al formulario
      formData.append('file', fileStream, {
        filename: path.basename(filePath)
      });
      
      // Añadir los parámetros adicionales
      formData.append('num_speakers', numSpeakers);
      formData.append('diarizer_type', diarizerType);
      
      // Realizar la solicitud POST
      const response = await axios.post(
        `${this.serverUrl}/api/upload`, 
        formData, 
        {
          headers: formData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw error;
    }
  }

  // Verificar el estado de un trabajo de procesamiento
  async checkStatus(jobId) {
    try {
      const response = await axios.get(`${this.serverUrl}/api/status/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error al verificar el estado:', error);
      throw error;
    }
  }

  // Obtener la transcripción de un trabajo completado
  async getTranscript(jobId) {
    try {
      const response = await axios.get(`${this.serverUrl}/api/transcript/${jobId}`, {
        responseType: 'text'
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener la transcripción:', error);
      throw error;
    }
  }

  // Obtener la configuración del servidor
  async getConfig() {
    try {
      const response = await axios.get(`${this.serverUrl}/api/config`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener la configuración:', error);
      throw error;
    }
  }
}

module.exports = ApiClient;
