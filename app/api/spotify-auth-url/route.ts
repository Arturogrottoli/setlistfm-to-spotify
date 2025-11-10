import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID

  if (!clientId) {
    return NextResponse.json({ error: "SPOTIFY_CLIENT_ID not configured" }, { status: 500 })
  }

  const redirectUri = `${request.nextUrl.origin}/api/spotify-auth-callback`

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=playlist-modify-public%20playlist-modify-private`

  return NextResponse.json({
    authUrl,
    redirectUri,
  })
}
