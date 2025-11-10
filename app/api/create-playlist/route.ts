import { NextResponse } from "next/server"

interface Song {
  name: string
  artist?: string
}

export async function POST(request: Request) {
  try {
    const { songs, playlistName } = await request.json()

    if (!songs || songs.length === 0) {
      return NextResponse.json({ error: "No hay canciones para crear la playlist" }, { status: 400 })
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json({ error: "Credenciales de Spotify no configuradas" }, { status: 500 })
    }

    // Get access token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error("[v0] Spotify token error:", errorData)
      console.error("[v0] Refresh token value:", refreshToken ? `${refreshToken.substring(0, 10)}...` : "MISSING")
      throw new Error(`Spotify token error: ${errorData.error_description || "Unknown error"}`)
    }

    const { access_token } = await tokenResponse.json()

    // Get user ID
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Error al obtener información del usuario")
    }

    const userData = await userResponse.json()
    const userId = userData.id

    // Create playlist
    const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistName || "Mi Setlist",
        description: "Creada con Setlist to Spotify",
        public: false,
      }),
    })

    if (!playlistResponse.ok) {
      throw new Error("Error al crear la playlist")
    }

    const playlistData = await playlistResponse.json()
    const playlistId = playlistData.id

    // Search for tracks and add to playlist
    const trackUris: string[] = []

    for (const song of songs as Song[]) {
      const query = song.artist ? `track:${song.name} artist:${song.artist}` : `track:${song.name}`

      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?${new URLSearchParams({
          q: query,
          type: "track",
          limit: "1",
        })}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData.tracks?.items?.[0]) {
          trackUris.push(searchData.tracks.items[0].uri)
        }
      }
    }

    // Add tracks to playlist
    if (trackUris.length > 0) {
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: trackUris,
        }),
      })
    }

    return NextResponse.json({
      playlistUrl: playlistData.external_urls.spotify,
      tracksAdded: trackUris.length,
      totalSongs: songs.length,
    })
  } catch (error) {
    console.error("Error creating playlist:", error)
    return NextResponse.json({ error: "Error al crear la playlist en Spotify" }, { status: 500 })
  }
}
