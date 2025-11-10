# Setlist to Spotify

Convierte setlists de conciertos en playlists de Spotify automáticamente.

## Configuración

Para que la aplicación funcione, necesitas configurar las siguientes variables de entorno:

### 1. API Key de setlist.fm

1. Ve a [setlist.fm API](https://www.setlist.fm/settings/api)
2. Crea una cuenta si no tienes una
3. Solicita una API key
4. Agrega la variable: `SETLISTFM_API_KEY`

### 2. Credenciales de Spotify

1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crea una nueva aplicación
3. Obtén tu `Client ID` y `Client Secret`
4. Configura el Redirect URI: `http://localhost:3000/api/auth/callback`
5. Agrega las variables:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN` (necesitas obtenerlo mediante OAuth flow)

### Obtener el Refresh Token de Spotify

Para obtener el refresh token, puedes usar este flujo:

1. Visita esta URL (reemplaza CLIENT_ID):
\`\`\`
https://accounts.spotify.com/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/api/auth/callback&scope=playlist-modify-public%20playlist-modify-private
\`\`\`

2. Autoriza la aplicación y copia el código de la URL de redirección

3. Intercambia el código por un refresh token usando curl:
\`\`\`bash
curl -X POST https://accounts.spotify.com/api/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=CODE&redirect_uri=http://localhost:3000/api/auth/callback&client_id=CLIENT_ID&client_secret=CLIENT_SECRET"
\`\`\`

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
