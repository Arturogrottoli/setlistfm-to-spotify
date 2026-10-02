import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")

  const host = request.headers.get("host") ?? request.nextUrl.host
  const protocol = request.headers.get("x-forwarded-proto") ?? (host.startsWith("127.0.0.1") || host.startsWith("localhost") ? "http" : "https")
  const origin = `${protocol}://${host}`

  if (error) {
    return NextResponse.redirect(`${origin}?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}?error=No%20code%20received`)
  }

  return NextResponse.redirect(`${origin}?code=${encodeURIComponent(code)}`)
}
