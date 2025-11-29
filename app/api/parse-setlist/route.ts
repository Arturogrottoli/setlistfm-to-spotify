import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url || !url.includes("setlist.fm")) {
      return NextResponse.json({ error: "URL inválida. Debe ser de setlist.fm" }, { status: 400 })
    }

    let setlistId: string | null = null

    const idMatch1 = url.match(/-([a-f0-9]{6,8})\.html$/)
    if (idMatch1) {
      setlistId = idMatch1[1]
    } else {
      const idMatch2 = url.match(/([a-f0-9]{6,8})\.html$/)
      if (idMatch2) {
        setlistId = idMatch2[1]
      } else {
        const idMatch3 = url.match(/-([a-f0-9]{6,8})(?:\.html|$)/)
        if (idMatch3) {
          setlistId = idMatch3[1]
        }
      }
    }

    if (!setlistId) {
      console.log("[v0] URL:", url)
      console.log("[v0] Regex match failed")
      return NextResponse.json(
        { error: "URL inválida. Asegúrate de pegar la URL completa del setlist de setlist.fm" },
        { status: 400 },
      )
    }

    console.log("[v0] Extracted setlist ID:", setlistId)

    const apiKey = process.env.SETLISTFM_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key de setlist.fm no configurada" }, { status: 500 })
    }

    const response = await fetch(`https://api.setlist.fm/rest/1.0/setlist/${setlistId}`, {
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] setlist.fm API error:", response.status, errorText)
      let errorMessage = "Error al obtener datos de setlist.fm"
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = `Error ${response.status}: ${errorText.substring(0, 100)}`
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data = await response.json()

    const songs: { name: string; artist: string }[] = []
    const artist = data.artist?.name || "Unknown Artist"

    if (data.sets?.set) {
      const sets = Array.isArray(data.sets.set) ? data.sets.set : [data.sets.set]
      
      for (const set of sets) {
        if (set.song) {
          const songsInSet = Array.isArray(set.song) ? set.song : [set.song]
          for (const song of songsInSet) {
            if (song.name) {
              songs.push({
                name: song.name,
                artist: song.cover?.name || artist,
              })
            }
          }
        }
      }
    }

    if (songs.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron canciones en este setlist" },
        { status: 400 },
      )
    }

    const venue = data.venue?.name || ""
    const city = data.venue?.city?.name || ""
    const date = data.eventDate || ""
    const playlistName = `${artist} - ${venue || city} ${date}`.trim()

    return NextResponse.json({
      songs,
      artist,
      playlistName,
    })
  } catch (error) {
    console.error("Error parsing setlist:", error)
    const errorMessage = error instanceof Error ? error.message : "Error al procesar el setlist"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
