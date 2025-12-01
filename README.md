# Setlist to Spotify

Convierte setlists de conciertos en playlists de Spotify automáticamente.

## ¿Cómo funciona?

Esta aplicación permite convertir setlists de conciertos (ya sea desde setlist.fm o ingresados manualmente) en playlists de Spotify de forma automática. El flujo de trabajo es el siguiente:

### Flujo de la aplicación

1. **Importación de setlist**: 
   - Puedes pegar una URL de setlist.fm y la aplicación extraerá automáticamente todas las canciones del concierto
   - O puedes ingresar manualmente el nombre del artista y las canciones (una por línea)

2. **Procesamiento**:
   - Si usas una URL de setlist.fm, la aplicación hace una llamada a la API de setlist.fm para obtener los datos del concierto
   - Extrae el nombre del artista, las canciones, el lugar y la fecha del concierto
   - Genera un nombre sugerido para la playlist basado en esta información

3. **Búsqueda en Spotify**:
   - Para cada canción del setlist, la aplicación busca la canción en Spotify usando la API de búsqueda
   - Utiliza el nombre de la canción y el artista para encontrar la mejor coincidencia
   - Si encuentra la canción, la agrega a la lista de tracks para la playlist

4. **Creación de playlist**:
   - La aplicación crea una nueva playlist privada en tu cuenta de Spotify
   - Agrega todas las canciones encontradas a la playlist
   - Te proporciona un enlace directo para abrir la playlist en Spotify

### Arquitectura técnica

- **Frontend**: Next.js con React, usando componentes de UI modernos
- **Backend**: API Routes de Next.js que manejan:
  - Autenticación con Spotify (OAuth 2.0)
  - Parsing de setlists desde setlist.fm
  - Búsqueda de canciones en Spotify
  - Creación de playlists en Spotify
- **APIs externas**:
  - [setlist.fm API](https://www.setlist.fm/docs/api.html): Para obtener datos de setlists
  - [Spotify Web API](https://developer.spotify.com/documentation/web-api): Para búsqueda de canciones y creación de playlists

## Configuración para tu propio Spotify

Para usar esta aplicación con tu propia cuenta de Spotify, necesitas configurar las siguientes variables de entorno:

### 1. API Key de setlist.fm

1. Ve a [setlist.fm API](https://www.setlist.fm/settings/api)
2. Crea una cuenta si no tienes una
3. Solicita una API key
4. Agrega la variable de entorno: `SETLISTFM_API_KEY`

### 2. Credenciales de Spotify

1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crea una nueva aplicación (o usa una existente)
3. Obtén tu `Client ID` y `Client Secret` desde la página de tu aplicación
4. **Configura el Redirect URI**:
   - Si estás en desarrollo local: `http://localhost:3000/api/spotify-auth-callback`
   - Si estás en producción: `https://tu-dominio.com/api/spotify-auth-callback`
   - Agrega este URI en la configuración de tu aplicación en Spotify Dashboard
5. Agrega las siguientes variables de entorno:
   - `SPOTIFY_CLIENT_ID`: Tu Client ID de Spotify
   - `SPOTIFY_CLIENT_SECRET`: Tu Client Secret de Spotify
   - `SPOTIFY_REFRESH_TOKEN`: Token de refresco (ver sección siguiente)

### Obtener el Refresh Token de Spotify

El refresh token es necesario para que la aplicación pueda crear playlists en tu cuenta de Spotify sin que tengas que autenticarte cada vez. Para obtenerlo:

#### Opción 1: Usando la interfaz de la aplicación

1. Ejecuta la aplicación (`npm run dev`)
2. Si no tienes el refresh token configurado, verás una interfaz de configuración
3. Sigue los pasos para autorizar la aplicación con Spotify
4. Copia el refresh token que se te proporciona
5. Agrégalo como variable de entorno: `SPOTIFY_REFRESH_TOKEN`

#### Opción 2: Manualmente con OAuth

1. Visita esta URL (reemplaza `CLIENT_ID` y ajusta el `redirect_uri` si es necesario):
```
https://accounts.spotify.com/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/api/spotify-auth-callback&scope=playlist-modify-public%20playlist-modify-private
```

2. Autoriza la aplicación y serás redirigido a una URL con un código en los parámetros
3. Copia el código de la URL de redirección
4. Intercambia el código por un refresh token usando curl:
```bash
curl -X POST https://accounts.spotify.com/api/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=CODE&redirect_uri=http://localhost:3000/api/spotify-auth-callback&client_id=CLIENT_ID&client_secret=CLIENT_SECRET"
```

5. De la respuesta JSON, copia el valor de `refresh_token` y agrégalo como variable de entorno

### Variables de entorno necesarias

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
SETLISTFM_API_KEY=tu_api_key_de_setlist_fm
SPOTIFY_CLIENT_ID=tu_client_id_de_spotify
SPOTIFY_CLIENT_SECRET=tu_client_secret_de_spotify
SPOTIFY_REFRESH_TOKEN=tu_refresh_token_de_spotify
```

**Nota importante**: El refresh token permite que la aplicación acceda a tu cuenta de Spotify. Mantén estas credenciales seguras y nunca las subas a repositorios públicos.

## Uso

1. **Desde URL**: Pega el link de un setlist de setlist.fm
2. **Manual**: Ingresa el nombre del artista y las canciones (una por línea)
3. Haz clic en "Crear Playlist en Spotify"
4. ¡Disfruta tu playlist!

## Características

- ✅ Importa setlists desde setlist.fm
- ✅ Entrada manual de canciones
- ✅ Búsqueda automática en Spotify
- ✅ Creación de playlists privadas
- ✅ Interfaz moderna y responsive
