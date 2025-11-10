import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`${request.nextUrl.origin}?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${request.nextUrl.origin}?error=No%20code%20received`)
  }

  return NextResponse.redirect(`${request.nextUrl.origin}?code=${encodeURIComponent(code)}`)
}
