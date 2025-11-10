import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url || !url.includes("setlist.fm")) {
      return NextResponse.json({ error: "URL inválida. Debe ser de setlist.fm" }, { status: 400 })
    }

    const setlistIdMatch = url.match(/setlist\.fm\/setlist\/.*\.html$/)
    if (!setlistIdMatch) {
      console.log("[v0] URL:", url)
      console.log("[v0] Regex match failed")
      return NextResponse.json(
        { error: "URL inválida. Asegúrate de pegar la URL completa del setlist" },
        { status: 400 },
      )
    }

    const idMatch = url.match(/([a-f0-9]{8})\.html$/)
    if (!idMatch) {
      return NextResponse.json({ error: "No se pudo extraer el ID del setlist" }, { status: 400 })
    }

    const setlistId = idMatch[1]
    console.log("[v0] Extracted setlist ID:", setlistId)

    // Call setlist.fm API
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
      throw new Error("Error al obtener datos de setlist.fm")
    }

    const data = await response.json()

    // Parse songs from setlist
    const songs: { name: string; artist: string }[] = []
    const artist = data.artist?.name || "Unknown Artist"

    if (data.sets?.set) {
      for (const set of data.sets.set) {
        if (set.song) {
          for (const song of set.song) {
            songs.push({
              name: song.name,
              artist: song.cover?.name || artist,
            })
          }
        }
      }
    }

    const venue = data.venue?.name || ""
    const city = data.venue?.city?.name || ""
    const date = data.eventDate || ""
    const playlistName = `${artist} - ${venue || city} ${date}`

    return NextResponse.json({
      songs,
      artist,
      playlistName,
    })
  } catch (error) {
    console.error("Error parsing setlist:", error)
    return NextResponse.json({ error: "Error al procesar el setlist" }, { status: 500 })
  }
}
