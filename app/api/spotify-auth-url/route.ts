import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID

  if (!clientId) {
    return NextResponse.json({ error: "SPOTIFY_CLIENT_ID not configured" }, { status: 500 })
  }

  const host = request.headers.get("host") ?? request.nextUrl.host
  const protocol = request.headers.get("x-forwarded-proto") ?? (host.startsWith("127.0.0.1") || host.startsWith("localhost") ? "http" : "https")
  const redirectUri = `${protocol}://${host}/api/spotify-callback`

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=playlist-modify-public%20playlist-modify-private`

  return NextResponse.json({
    authUrl,
    redirectUri,
  })
}
