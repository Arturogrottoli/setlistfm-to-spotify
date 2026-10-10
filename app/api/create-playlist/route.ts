import { NextResponse } from "next/server"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

interface Song {
  name: string
  artist?: string
}

// Spotify acepta como máximo 100 URIs por request al agregar tracks.
const MAX_SONGS = 100
const MAX_TEXT_LENGTH = 200
const MAX_PLAYLIST_NAME_LENGTH = 100

// Por IP: 5 playlists por hora. Global: 50 por día, para proteger la cuenta aunque se roten IPs.
const PER_IP_LIMIT = 5
const PER_IP_WINDOW_SECONDS = 60 * 60
const GLOBAL_LIMIT = 50
const GLOBAL_WINDOW_SECONDS = 24 * 60 * 60

function isValidText(value: unknown, required: boolean) {
  if (value === undefined || value === null) return !required
  return typeof value === "string" && value.length <= MAX_TEXT_LENGTH && (!required || value.trim().length > 0)
}

export async function POST(request: Request) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
    }

    const { songs, playlistName } = (body ?? {}) as { songs?: unknown; playlistName?: unknown }

    if (!Array.isArray(songs) || songs.length === 0) {
      return NextResponse.json({ error: "No hay canciones para crear la playlist" }, { status: 400 })
    }

    if (songs.length > MAX_SONGS) {
      return NextResponse.json(
        { error: `La playlist puede tener como máximo ${MAX_SONGS} canciones` },
        { status: 400 },
      )
    }

    const songsAreValid = songs.every(
      (song) => song && typeof song === "object" && isValidText(song.name, true) && isValidText(song.artist, false),
    )
    if (!songsAreValid) {
      return NextResponse.json({ error: "Lista de canciones inválida" }, { status: 400 })
    }

    if (
      playlistName !== undefined &&
      (typeof playlistName !== "string" || playlistName.length > MAX_PLAYLIST_NAME_LENGTH)
    ) {
      return NextResponse.json(
        { error: `El nombre de la playlist puede tener como máximo ${MAX_PLAYLIST_NAME_LENGTH} caracteres` },
        { status: 400 },
      )
    }

    const rateLimit = await checkRateLimit([
      { key: `create-playlist:ip:${getClientIp(request)}`, limit: PER_IP_LIMIT, windowSeconds: PER_IP_WINDOW_SECONDS },
      { key: "create-playlist:global", limit: GLOBAL_LIMIT, windowSeconds: GLOBAL_WINDOW_SECONDS },
    ])
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Se alcanzó el límite de playlists. Intentá de nuevo más tarde." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      )
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
      // Sólo se loguea el código de error de Spotify; nunca el token ni el cuerpo completo.
      let spotifyError = "unknown"
      try {
        const errorData = await tokenResponse.json()
        spotifyError = errorData.error || spotifyError
      } catch {}
      console.error("Spotify token error:", tokenResponse.status, spotifyError)
      return NextResponse.json({ error: "Error al autenticar con Spotify" }, { status: 502 })
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
      let errorMessage = "Error al crear la playlist"
      try {
        const errorData = await playlistResponse.json()
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        const errorText = await playlistResponse.text()
        errorMessage = `Error ${playlistResponse.status}: ${errorText.substring(0, 100)}`
      }
      throw new Error(errorMessage)
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
      const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: trackUris,
        }),
      })

      if (!addTracksResponse.ok) {
        console.error("[v0] Error adding tracks to playlist:", await addTracksResponse.text())
      }
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
