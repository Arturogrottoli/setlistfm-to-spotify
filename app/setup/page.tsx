"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Check, ExternalLink } from "lucide-react"

export default function SetupPage() {
  const [refreshToken, setRefreshToken] = useState<string>("")
  const [copied, setCopied] = useState(false)

  const handleSpotifyAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const redirectUri = `${window.location.origin}/setup/callback`
    const scopes = "playlist-modify-public playlist-modify-private"

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`

    window.location.href = authUrl
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refreshToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Configuración de Spotify
            </h1>
            <p className="text-muted-foreground">Obtén tu Refresh Token para conectar con Spotify</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Paso 1: Configurar Redirect URI</CardTitle>
              <CardDescription>
                Antes de continuar, asegúrate de agregar esta URL en tu Spotify App Dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription className="flex items-center justify-between gap-2">
                  <code className="text-sm flex-1 break-all">
                    {typeof window !== "undefined" ? `${window.location.origin}/setup/callback` : "Cargando..."}
                  </code>
                </AlertDescription>
              </Alert>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  1. Ve a tu{" "}
                  <a
                    href="https://developer.spotify.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Spotify Dashboard <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
                <p>2. Selecciona tu aplicación</p>
                <p>3. Haz clic en "Settings"</p>
                <p>4. En "Redirect URIs", agrega la URL de arriba</p>
                <p>5. Guarda los cambios</p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Paso 2: Autorizar con Spotify</CardTitle>
              <CardDescription>Conecta tu cuenta de Spotify para obtener el Refresh Token</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSpotifyAuth} className="w-full" size="lg">
                Conectar con Spotify
              </Button>
            </CardContent>
          </Card>

          {refreshToken && (
            <Card>
              <CardHeader>
                <CardTitle>Paso 3: Guarda tu Refresh Token</CardTitle>
                <CardDescription>
                  Copia este token y agrégalo como variable de entorno SPOTIFY_REFRESH_TOKEN
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription className="flex items-center justify-between gap-2">
                    <code className="text-sm flex-1 break-all">{refreshToken}</code>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </AlertDescription>
                </Alert>
                <div className="text-sm text-muted-foreground">
                  <p>Agrega esta variable de entorno en tu proyecto:</p>
                  <code className="block mt-2 p-2 bg-muted rounded">SPOTIFY_REFRESH_TOKEN={refreshToken}</code>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
