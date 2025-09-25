import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the preferred language from the cookie
  const language = request.cookies.get("language")?.value || "en"

  // Clone the response
  const response = NextResponse.next()

  // Set the Content-Language header
  response.headers.set("Content-Language", language)

  // If there's no language cookie, set the default one
  if (!language) {
    response.cookies.set("language", "en")
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
