/**
 * Script para obtener el SPOTIFY_REFRESH_TOKEN
 *
 * Instrucciones:
 * 1. Asegúrate de tener SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET configurados
 * 2. Ejecuta este script desde v0
 * 3. Se abrirá tu navegador para autorizar
 * 4. Copia el código de la URL después de autorizar
 * 5. Pégalo cuando el script te lo pida
 */

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

if (!clientId || !clientSecret) {
  console.error("❌ Error: SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET deben estar configurados")
  process.exit(1)
}

const redirectUri = "https://preview-setlist-to-spotify-kzmpxwrpjz4vz2cr16xh.vusercontent.net/setup/callback"
const scopes = "playlist-modify-public playlist-modify-private"

// URL de autorización
const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  response_type: "code",
  client_id: clientId,
  scope: scopes,
  redirect_uri: redirectUri,
  show_dialog: "true",
})}`

console.log("\n🎵 Obtener SPOTIFY_REFRESH_TOKEN\n")
console.log("📋 Pasos a seguir:\n")
console.log("1. Abre esta URL en tu navegador:")
console.log("\n" + authUrl + "\n")
console.log("2. Autoriza la aplicación en Spotify")
console.log("3. Serás redirigido a una página (puede dar error, no importa)")
console.log('4. Copia el CÓDIGO de la URL (después de "?code=")')
console.log("5. Pega el código aquí abajo y presiona Enter\n")

// Esperar input del usuario
const readline = require("readline")
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question("Pega el código aquí: ", async (code) => {
  rl.close()

  if (!code || code.trim() === "") {
    console.error("❌ No se proporcionó ningún código")
    process.exit(1)
  }

  console.log("\n⏳ Intercambiando código por tokens...\n")

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code.trim(),
        redirect_uri: redirectUri,
      }),
    })

    const data = await response.json()

    if (data.error) {
      console.error("❌ Error:", data.error_description || data.error)
      process.exit(1)
    }

    console.log("✅ ¡Éxito! Aquí está tu SPOTIFY_REFRESH_TOKEN:\n")
    console.log("━".repeat(60))
    console.log(data.refresh_token)
    console.log("━".repeat(60))
    console.log("\n📝 Copia este token y agrégalo como variable de entorno:")
    console.log("   SPOTIFY_REFRESH_TOKEN=" + data.refresh_token)
    console.log("\n💡 También recibiste un access_token (válido por 1 hora):")
    console.log("   " + data.access_token)
    console.log("\n✨ ¡Listo! Ya puedes usar la aplicación.\n")
  } catch (error) {
    console.error("❌ Error al obtener el token:", error.message)
    process.exit(1)
  }
})
