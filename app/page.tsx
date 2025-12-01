import { SetlistConverter } from "@/components/setlist-converter"
import { SpotifyTokenSetup } from "@/components/spotify-token-setup"

export default function Home() {
  const hasRefreshToken = !!process.env.SPOTIFY_REFRESH_TOKEN

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex flex-col">
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Setlist to Spotify
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance">
              Convierte cualquier setlist de concierto en una playlist de Spotify al instante
            </p>
          </div>

          {!hasRefreshToken ? <SpotifyTokenSetup /> : <SetlistConverter />}

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Powered by{" "}
              <a
                href="https://www.setlist.fm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                setlist.fm
              </a>{" "}
              y{" "}
              <a
                href="https://www.spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Spotify
              </a>
            </p>
          </div>
        </div>
      </div>
      <footer className="py-6 text-center">
        <p className="text-xs text-black">
          Sitio web desarrollado por Arturo Grottoli®
        </p>
      </footer>
    </main>
  )
}
