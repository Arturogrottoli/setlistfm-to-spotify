import * as https from "https"

const clientId = process.env.SPOTIFY_CLIENT_ID
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

if (!clientId || !clientSecret) {
  console.error("❌ Error: Falta SPOTIFY_CLIENT_ID o SPOTIFY_CLIENT_SECRET")
  console.error("Agrega estas variables de entorno antes de ejecutar este script")
  process.exit(1)
}

const redirectUri = "http://localhost:3000/callback"
const authorizationUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  client_id: clientId,
  response_type: "code",
  redirect_uri: redirectUri,
  scope: "playlist-modify-public playlist-modify-private",
}).toString()}`

console.log("\n🎵 SPOTIFY REFRESH TOKEN GENERATOR\n")
console.log("Paso 1: Abre esta URL en tu navegador:")
console.log(`\n🔗 ${authorizationUrl}\n`)
console.log("Paso 2: Autoriza la aplicación")
console.log("Paso 3: Serás redirigido a http://localhost:3000/callback?code=XXX")
console.log('Paso 4: Copia el código (la parte después de "code=") y pégalo aquí\n')

const readline = await import("readline")
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question("Pega el código aquí: ", async (authCode) => {
  rl.close()

  if (!authCode) {
    console.error("❌ Error: Código vacío")
    process.exit(1)
  }

  try {
    console.log("\n⏳ Intercambiando código por token...\n")

    const postData = new URLSearchParams({
      grant_type: "authorization_code",
      code: authCode.trim(),
      redirect_uri: redirectUri,
    }).toString()

    const options = {
      hostname: "accounts.spotify.com",
      path: "/api/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
    }

    const req = https.request(options, (res) => {
      let data = ""

      res.on("data", (chunk) => {
        data += chunk
      })

      res.on("end", () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data)
          console.log("✅ ¡Éxito! Aquí está tu SPOTIFY_REFRESH_TOKEN:\n")
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
          console.log(response.refresh_token)
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
          console.log("📋 Copia este token y agrégalo como variable de entorno SPOTIFY_REFRESH_TOKEN\n")
        } else {
          const error = JSON.parse(data)
          console.error("❌ Error de Spotify:", error.error_description || error.error)
        }
      })
    })

    req.on("error", (error) => {
      console.error("❌ Error:", error.message)
    })

    req.write(postData)
    req.end()
  } catch (error) {
    console.error("❌ Error:", error.message)
  }
})
