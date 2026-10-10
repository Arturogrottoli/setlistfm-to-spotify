import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Sólo disponible durante el setup inicial: con el token ya configurado la UI no usa esta ruta
  // y no debe quedar expuesto un canje de códigos que usa el CLIENT_SECRET.
  if (process.env.SPOTIFY_REFRESH_TOKEN) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 })
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const host = request.headers.get("host") ?? request.nextUrl.host
    const protocol = request.headers.get("x-forwarded-proto") ?? (host.startsWith("127.0.0.1") || host.startsWith("localhost") ? "http" : "https")
    const redirectUri = `${protocol}://${host}/api/spotify-callback`

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    const data = await response.json()

    if (data.error) {
      console.error("[v0] Spotify token error:", data.error_description || data.error)
      return NextResponse.json({ error: data.error_description || data.error }, { status: 400 })
    }

    // La UI de setup sólo necesita el refresh token.
    return NextResponse.json({
      refresh_token: data.refresh_token,
    })
  } catch (error) {
    console.error("[v0] Error in spotify-auth:", error)
    return NextResponse.json({ error: "Failed to exchange code for token" }, { status: 500 })
  }
}
