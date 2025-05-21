import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  // Simplemente redirigir a la página principal
  return NextResponse.redirect(new URL("/", request.nextUrl.origin))
}
