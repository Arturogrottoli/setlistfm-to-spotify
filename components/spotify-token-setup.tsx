"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, CheckCircle2, ExternalLink } from "lucide-react"

export function SpotifyTokenSetup() {
  const [step, setStep] = useState(1)
  const [authCode, setAuthCode] = useState("")
  const [refreshToken, setRefreshToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [spotifyUrl, setSpotifyUrl] = useState("")
  const [redirectUri, setRedirectUri] = useState("")
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false)

  useEffect(() => {
    fetch("/api/spotify-auth-url")
      .then((res) => res.json())
      .then((data) => {
        setRedirectUri(data.redirectUri)
        setSpotifyUrl(data.authUrl)
      })
      .catch((err) => {
        console.log("[v0] Error fetching auth URL:", err)
        setError("Error al cargar la configuración de Spotify")
      })

    // Check if we have a code in the URL params
    const params = new URLSearchParams(window.location.search)
    if (params.has("code")) {
      setAuthCode(params.get("code") || "")
      setStep(3)
    }
  }, [])

  const handleGetToken = async () => {
    if (!authCode.trim()) {
      setError("Por favor ingresa el código de autorización")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/spotify-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener el token")
      }

      setRefreshToken(data.refresh_token)
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener el token")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyRedirectUri = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedRedirectUri(true)
    setTimeout(() => setCopiedRedirectUri(false), 2000)
  }

  return (
    <Card className="border-accent/20 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Obtener Token de Spotify</CardTitle>
        <CardDescription>Solo 3 pasos para conectar tu cuenta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 0 - Setup Redirect URI */}
        <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-600 text-white">
              0
            </div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Primero: Configura la Redirect URI en Spotify
            </h3>
          </div>
          <div className="ml-10 space-y-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Copia esta URL exacta y agrégala en tu Spotify Dashboard:
            </p>
            {redirectUri ? (
              <div className="bg-background p-3 rounded-md font-mono text-xs break-all flex items-center justify-between gap-2 border border-blue-200 dark:border-blue-800">
                <span>{redirectUri}</span>
                <Button size="sm" variant="ghost" onClick={() => copyRedirectUri(redirectUri)}>
                  {copiedRedirectUri ? (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-background p-3 rounded-md animate-pulse">Cargando...</div>
            )}
            <ol className="text-sm text-blue-800 dark:text-blue-200 list-decimal list-inside space-y-1">
              <li>
                Ve a{" "}
                <a
                  href="https://developer.spotify.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  Spotify Developer Dashboard
                </a>
              </li>
              <li>Haz clic en "Edit Settings"</li>
              <li>
                En "Redirect URIs", pega exactamente:{" "}
                <code className="bg-white dark:bg-black px-1 rounded text-xs">{redirectUri || "cargando..."}</code>
              </li>
              <li>Guarda los cambios</li>
            </ol>
          </div>
        </div>

        {/* Step 1 */}
        <div className="space-y-3 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground">
              1
            </div>
            <h3 className="font-semibold">Haz clic para autorizar</h3>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            Se abrirá Spotify en una pestaña nueva. Solo autoriza la aplicación.
          </p>
          <div className="ml-10">
            {spotifyUrl ? (
              <Button asChild size="lg" className="gap-2">
                <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">
                  Abrir Spotify
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button disabled>Cargando...</Button>
            )}
          </div>
        </div>

        {/* Step 2 */}
        {step >= 2 && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="font-semibold">Después de autorizar</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              Vuelve a esta pestaña. El código debería aparecer automáticamente.
            </p>
          </div>
        )}

        {/* Step 3 - Code Input */}
        {authCode && !refreshToken && (
          <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-green-600 text-white">
                ✓
              </div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Código detectado</h3>
            </div>
            <div className="ml-10 space-y-3">
              <div className="bg-background p-3 rounded-md font-mono text-xs break-all border border-green-200 dark:border-green-800">
                {authCode.substring(0, 30)}...
              </div>
              <Button onClick={handleGetToken} disabled={loading} className="w-full" size="lg">
                {loading ? "Obteniendo token..." : "Obtener Token de Refresh"}
              </Button>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}

        {/* Step 4 - Success */}
        {refreshToken && (
          <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-green-600 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">¡Éxito! Token obtenido</h3>
            </div>
            <div className="ml-10 space-y-3">
              <p className="text-sm text-green-800 dark:text-green-200">
                Copia este token y agrégalo en la sección "Vars" de v0 como{" "}
                <code className="font-mono bg-background px-1 py-0.5 rounded">SPOTIFY_REFRESH_TOKEN</code>
              </p>
              <div className="bg-background p-3 rounded-md font-mono text-xs break-all flex items-center justify-between gap-2 border border-green-200 dark:border-green-800">
                <span>{refreshToken}</span>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(refreshToken)}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Code Input */}
        {!authCode && !refreshToken && (
          <div className="space-y-3 p-4 border border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">
              ¿No se detectó el código automáticamente? Puedes pegarlo manualmente aquí:
            </p>
            <textarea
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="Pega el código de la URL de Spotify aquí"
              className="w-full p-2 border rounded-md font-mono text-sm bg-background"
              rows={3}
            />
            {authCode && (
              <Button onClick={handleGetToken} disabled={loading} className="w-full">
                {loading ? "Obteniendo token..." : "Obtener Token de Refresh"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
