import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 })
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const redirectUri = `${request.nextUrl.origin}/api/spotify-auth-callback`

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

    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    })
  } catch (error) {
    console.error("[v0] Error in spotify-auth:", error)
    return NextResponse.json({ error: "Failed to exchange code for token" }, { status: 500 })
  }
}
