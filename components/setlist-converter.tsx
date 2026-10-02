"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, Link2, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Song {
  name: string
  artist?: string
}

export function SetlistConverter() {
  const [setlistUrl, setSetlistUrl] = useState("")
  const [manualSongs, setManualSongs] = useState("")
  const [artistName, setArtistName] = useState("")
  const [playlistName, setPlaylistName] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [songs, setSongs] = useState<Song[]>([])

  const handleUrlSubmit = async () => {
    if (!setlistUrl.trim()) {
      setError("Por favor ingresa un URL de setlist.fm")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/parse-setlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: setlistUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el setlist")
      }

      if (!data.songs || data.songs.length === 0) {
        setError("No se encontraron canciones en este setlist")
        return
      }

      setSongs(data.songs)
      setArtistName(data.artist || "")
      setPlaylistName(data.playlistName || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el setlist")
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = () => {
    if (!manualSongs.trim() || !artistName.trim()) {
      setError("Por favor ingresa las canciones y el nombre del artista")
      return
    }

    const songList = manualSongs
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => ({
        name: line.trim(),
        artist: artistName.trim(),
      }))

    setSongs(songList)
    if (!playlistName) {
      setPlaylistName(`${artistName} - Setlist`)
    }
  }

  const createSpotifyPlaylist = async () => {
    if (songs.length === 0) {
      setError("No hay canciones para crear la playlist")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/create-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songs,
          playlistName: playlistName || "Mi Setlist",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la playlist")
      }

      setSuccess(true)
      window.open(data.playlistUrl, "_blank")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la playlist en Spotify")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-2xl border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-6 w-6 text-primary" />
          Crear Playlist
        </CardTitle>
        <CardDescription>Elige cómo quieres importar tu setlist</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Desde URL
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="setlist-url">URL de setlist.fm</Label>
              <Input
                id="setlist-url"
                placeholder="https://www.setlist.fm/setlist/..."
                value={setlistUrl}
                onChange={(e) => setSetlistUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">Pega el link completo del setlist desde setlist.fm</p>
            </div>

            <Button onClick={handleUrlSubmit} disabled={loading || !setlistUrl.trim()} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Importar Setlist"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="artist-name">Nombre del Artista</Label>
              <Input
                id="artist-name"
                placeholder="Ej: Radiohead"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="songs">Canciones (una por línea)</Label>
              <Textarea
                id="songs"
                placeholder="Creep&#10;Karma Police&#10;No Surprises&#10;..."
                value={manualSongs}
                onChange={(e) => setManualSongs(e.target.value)}
                disabled={loading}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">Escribe cada canción en una línea nueva</p>
            </div>

            <Button
              onClick={handleManualSubmit}
              disabled={loading || !manualSongs.trim() || !artistName.trim()}
              className="w-full"
            >
              Cargar Canciones
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4 border-primary bg-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">¡Playlist creada exitosamente en Spotify!</AlertDescription>
          </Alert>
        )}

        {songs.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playlist-name">Nombre de la Playlist</Label>
              <Input
                id="playlist-name"
                placeholder="Mi Setlist Favorito"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                disabled={loading}
              />
            </div>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Canciones encontradas ({songs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {songs.map((song, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-background/50">
                      <span className="text-sm text-muted-foreground w-8">{index + 1}.</span>
                      <span className="text-sm font-medium">{song.name}</span>
                      {song.artist && <span className="text-sm text-muted-foreground ml-auto">{song.artist}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={createSpotifyPlaylist} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando Playlist...
                </>
              ) : (
                <>
                  <Music className="mr-2 h-5 w-5" />
                  Crear Playlist en Spotify
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
