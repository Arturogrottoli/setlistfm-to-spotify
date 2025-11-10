"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Copy, Check, Loader2 } from "lucide-react"

export default function CallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [refreshToken, setRefreshToken] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const code = searchParams.get("code")
    const errorParam = searchParams.get("error")

    if (errorParam) {
      setError("Autenticación cancelada o fallida")
      setLoading(false)
      return
    }

    if (code) {
      exchangeCodeForToken(code)
    } else {
      setError("No se recibió código de autorización")
      setLoading(false)
    }
  }, [searchParams])

  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await fetch("/api/spotify-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setRefreshToken(data.refresh_token)
      }
    } catch (err) {
      setError("Error al obtener el token")
    } finally {
      setLoading(false)
    }
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
          </div>

          {loading && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Obteniendo token...</span>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={() => router.push("/setup")} className="mt-4 w-full">
                  Volver a intentar
                </Button>
              </CardContent>
            </Card>
          )}

          {refreshToken && (
            <Card>
              <CardHeader>
                <CardTitle>Refresh Token Obtenido</CardTitle>
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
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-semibold">Agrega esta variable de entorno:</p>
                  <code className="block p-3 bg-muted rounded">SPOTIFY_REFRESH_TOKEN={refreshToken}</code>
                  <p className="mt-4">En Vercel:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Ve a tu proyecto en Vercel</li>
                    <li>Settings → Environment Variables</li>
                    <li>Agrega SPOTIFY_REFRESH_TOKEN con el valor de arriba</li>
                    <li>Redeploy tu aplicación</li>
                  </ol>
                </div>
                <Button onClick={() => router.push("/")} className="w-full mt-4">
                  Ir a la aplicación
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
