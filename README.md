# Audio Diarizer - Aplicación de Escritorio

Aplicación de escritorio multiplataforma para el servicio de diarización de audio. Permite cargar archivos de audio, procesarlos utilizando un servidor remoto o local, y visualizar los resultados de la diarización (identificación de quién habla y cuándo).

![Captura de pantalla de la aplicación](screenshots/app-screenshot.png)

## Características

- **Interfaz intuitiva**: Diseño limpio y fácil de usar
- **Configuración flexible**: Soporte para conectarse a un servidor local o remoto
- **Configuración de diarización**: Personalización del número de hablantes y método de diarización
- **Multiformato**: Soporte para archivos MP3, WAV, OGG y FLAC
- **Guardado de transcripciones**: Exportación de resultados a archivos de texto
- **Multiplataforma**: Funciona en Windows, macOS y Linux
- **Integración con API REST**: Comunicación optimizada con el servidor de diarización
- **Persistencia de configuración**: Almacenamiento local de la configuración del usuario
- **Modo de desarrollo**: Herramientas de depuración integradas para desarrolladores

## Requisitos del Sistema

- **Sistema Operativo**: Windows 10+, macOS 10.13+, o Linux
- **Espacio en disco**: 150 MB
- **Conexión a Internet**: Para conectarse al servidor de diarización remoto
- **Servidor de diarización**: Acceso a un servidor de Audio Diarizer (local o remoto)

## Instalación

### Instalación desde binarios precompilados

1. Descarga la última versión desde la sección de [Releases](https://github.com/tu-usuario/audio-diarizer-app/releases)
2. Instala la aplicación:
   - **Windows**: Ejecuta el instalador `.exe`
   - **macOS**: Arrastra la aplicación `.app` a tu carpeta de Aplicaciones
   - **Linux**: Extrae y ejecuta el archivo `.AppImage` o instala el paquete `.deb` según tu distribución

### Instalación desde el código fuente

Para desarrolladores que desean modificar o contribuir a la aplicación:

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/audio-diarizer-app.git
cd audio-diarizer-app
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia la aplicación en modo desarrollo:
```bash
npm start
```

4. Para compilar la aplicación:
```bash
# Para Windows
npm run build:win

# Para macOS
npm run build:mac

# Para Linux
npm run build:linux
```

## Uso

### Configuración Inicial

La primera vez que abras la aplicación, necesitarás configurar la URL del servidor:

1. Haz clic en el botón "⚙️ Configuración" en la parte inferior
2. Introduce la URL del servidor de diarización:
   - Para servidor local: `http://localhost:8000`
   - Para servidor remoto: `http://dirección-del-servidor:8000` o `http://dirección-ip:8000`
3. Haz clic en "Guardar"

### Comunicación con la API del Servidor

La aplicación de escritorio se comunica con el servidor a través de su API REST:

1. **Subir archivo** (`POST /api/upload`):
   - La aplicación envía el archivo de audio al servidor
   - También envía el número de hablantes y el tipo de diarización seleccionados
   - El servidor responde con un ID de trabajo único

2. **Verificar estado** (`GET /api/status/{job_id}`):
   - La aplicación verifica periódicamente el estado del trabajo
   - Este proceso continúa hasta que el estado sea "completed" o "error"

3. **Obtener resultados** (`GET /api/transcript/{job_id}`):
   - Una vez completado el procesamiento, la aplicación descarga la transcripción
   - Esta transcripción se muestra en la interfaz y puede guardarse localmente

### Procesamiento de Audio

1. Haz clic en "Seleccionar archivo" para elegir un archivo de audio
2. Configura el número de hablantes esperados en la grabación
3. Selecciona el tipo de diarización:
   - "Ligera (rápida)" para análisis básico - ideal para pruebas y desarrollo
   - "Whisper (completa)" para análisis detallado (requiere un servidor con GPU) - recomendado para producción
4. Haz clic en "Procesar"
5. Espera a que se complete el procesamiento (la versión completa puede tardar significativamente más tiempo)
6. Visualiza los resultados de la diarización

**Nota sobre los tiempos de procesamiento**:
- Con la versión ligera: El procesamiento típico toma entre 2-10 segundos dependiendo del tamaño del archivo
- Con la versión completa (Whisper): El procesamiento puede tomar entre 1-5 minutos para un archivo de 5 minutos, dependiendo de la potencia del GPU del servidor

### Guardado de Resultados

1. Una vez completado el procesamiento, haz clic en "Guardar transcripción"
2. Selecciona la ubicación donde deseas guardar el archivo de texto
3. El archivo guardado incluirá información sobre quién habla y cuándo

## Estructura del Proyecto

```
/audio-diarizer-app/
├── package.json         # Configuración y dependencias
├── main.js              # Proceso principal de Electron
├── preload.js           # Script de precarga para seguridad
├── renderer.js          # Lógica de la interfaz de usuario
├── index.html           # Interfaz de usuario principal
├── styles.css           # Estilos CSS
└── src/
    ├── api.js           # Funciones para comunicarse con el servidor
    ├── config.js        # Configuración de la aplicación
    └── utils.js         # Utilidades generales
```

## Tecnologías Utilizadas

- **Electron**: Framework para aplicaciones de escritorio multiplataforma
- **HTML/CSS/JavaScript**: Frontend de la aplicación
- **Fetch API**: Comunicación con el servidor de diarización
- **Electron Store**: Almacenamiento persistente de configuraciones
- **IPC (Inter-Process Communication)**: Comunicación segura entre procesos de Electron
- **Context Isolation**: Patrón de seguridad para separar el código de la aplicación

## Integración con la API del Servidor

La aplicación se comunica con el servidor de diarización a través de su API REST. A continuación se detallan las interacciones principales:

### Endpoints Utilizados

1. **Subir Archivo para Procesamiento**
   ```
   POST /api/upload
   ```
   - La aplicación envía un archivo de audio mediante una solicitud `multipart/form-data`
   - Parámetros adicionales: `num_speakers` y `diarizer_type`
   - Respuesta esperada: Un objeto JSON con el ID del trabajo (`job_id`)

2. **Verificar Estado del Procesamiento**
   ```
   GET /api/status/{job_id}
   ```
   - La aplicación consulta periódicamente el estado del procesamiento
   - Respuesta esperada: Un objeto JSON con el estado (`status`) y, si está completado, los segmentos resultantes

3. **Obtener la Transcripción**
   ```
   GET /api/transcript/{job_id}
   ```
   - Una vez completado el procesamiento, la aplicación descarga la transcripción en formato texto
   - Respuesta esperada: Un archivo de texto plano con la transcripción formateada

4. **Verificar Configuración del Servidor**
   ```
   GET /api/config
   ```
   - La aplicación puede consultar la configuración actual del servidor
   - Respuesta esperada: Un objeto JSON con información sobre el tipo de diarizador activo

### Cambios al Migrar entre Versiones del Diarizador

La aplicación no requiere modificaciones para funcionar con ambas versiones del diarizador (ligero o Whisper) ya que la API del servidor permanece sin cambios. Sin embargo, hay consideraciones importantes:

- **Tiempo de espera**: La versión con Whisper tarda significativamente más en procesar los archivos, por lo que la aplicación está diseñada para seguir verificando el estado durante periodos más largos.
  
- **Calidad de resultados**: Cuando se utiliza el modo Whisper, los resultados mostrados tendrán mayor precisión en la transcripción y en la identificación de los hablantes.

- **Recursos del servidor**: El modo Whisper requiere un servidor con GPU, por lo que es importante configurar correctamente la dirección del servidor según el entorno (desarrollo o producción).

La aplicación está diseñada para manejar estas diferencias de forma transparente para el usuario final.

## Resolución de Problemas

### No se puede conectar al servidor

- Verifica que la URL del servidor sea correcta en la configuración
- Comprueba que el servidor esté en funcionamiento (prueba accediendo a `http://url-servidor:8000/health`)
- Asegúrate de que no haya cortafuegos bloqueando la conexión
- Verifica que el CORS esté correctamente configurado en el servidor

### Errores al cargar archivos

- Verifica que el formato del archivo sea compatible (MP3, WAV, OGG, FLAC)
- Comprueba que el archivo no esté dañado intentando reproducirlo en otro programa
- Intenta con un archivo de menor tamaño (menos de 25 MB)
- Consulta los logs del servidor para obtener más detalles sobre el error

### Errores con el modelo Whisper

- Asegúrate de que el servidor tenga una GPU compatible con CUDA
- Verifica que hayas descomentado correctamente todas las secciones en `whisper_diarizer.py`
- Comprueba que todas las dependencias de Whisper estén instaladas correctamente
- Verifica que haya suficiente memoria GPU disponible (al menos 8 GB VRAM)

### Tiempos de procesamiento muy largos

- Con el modelo ligero: No debería tardar más de 30 segundos incluso para archivos grandes
- Con el modelo Whisper: Es normal que tarde varios minutos para archivos de más de 5 minutos
- Si tarda excesivamente, verifica la carga del servidor y los recursos disponibles

### La aplicación se cierra inesperadamente

- Reinstala la aplicación
- Verifica que tu sistema cumpla con los requisitos mínimos
- Comprueba los logs de la aplicación:
  1. Abre el menú de Ayuda
  2. Selecciona "Abrir DevTools"
  3. Ve a la pestaña "Console" para ver los mensajes de error
- Si la aplicación sigue cerrándose, prueba a ejecutarla desde la línea de comandos para ver mensajes de error adicionales

## Desarrollo y Personalización

### Personalización de la Interfaz

Para modificar el aspecto de la aplicación:

1. Edita `styles.css` para cambiar colores, fuentes, etc.
2. Modifica `index.html` para cambiar la estructura de la interfaz

### Agregar Nuevas Funcionalidades

1. Amplía la API en `src/api.js` para comunicarte con nuevos endpoints
2. Modifica `renderer.js` para agregar nuevas interacciones de usuario
3. Actualiza `main.js` para agregar funcionalidades nativas del sistema

## Licencia

[MIT](LICENSE)

## Agradecimientos

- Proyecto basado en [Electron](https://www.electronjs.org/)
- Inspirado en el trabajo de OpenAI (Whisper) y PyAnnote

---

Para más información sobre el servidor backend, visita el [repositorio del servidor de Audio Diarizer](https://github.com/EscatGit/audio-diarizer/tree/main).
