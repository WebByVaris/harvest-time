import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const error = request.nextUrl.searchParams.get("error")

  if (error) {
    const redirectResponse = NextResponse.redirect(new URL(`/auth/auth-error?error=${encodeURIComponent(error)}`, request.url))
    return redirectResponse
  }

  if (!code) {
    const redirectResponse = NextResponse.redirect(new URL("/auth/auth-error?error=No code provided", request.url))
    return redirectResponse
  }

  const clientId = process.env.HARVEST_CLIENT_ID
  const redirectUri = process.env.HARVEST_REDIRECT_URI
  const clientSecret = process.env.HARVEST_CLIENT_SECRET

  if (!clientId || !redirectUri || !clientSecret) {
    const redirectResponse = NextResponse.redirect(new URL("/auth/auth-error?error=Missing OAuth configuration", request.url))
    return redirectResponse
  }

  const response = await fetch("https://id.getharvest.com/api/v2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  if (!response.ok) {
    const redirectResponse = NextResponse.redirect(new URL(`/auth/auth-error?error=Failed to get token`, request.url))
    return redirectResponse
  }

  const data = await response.json()

  const redirectResponse = NextResponse.redirect(new URL("/auth/auth-success", request.url))
  redirectResponse.cookies.set("harvest_token", data.access_token, {
    httpOnly: true,
    secure: true, // Required for SameSite=None, works on localhost
    sameSite: "none",
    path: "/",
  })

  return redirectResponse
}
