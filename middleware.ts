import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ req, res })
    const { data } = await supabase.auth.getSession()

    // Si el usuario no está autenticado y está intentando acceder a una ruta protegida
    if (!data.session) {
      const requestedPath = req.nextUrl.pathname

      // Solo redirigir a login si la ruta está en la lista de rutas protegidas
      if (requestedPath.startsWith("/admin") || requestedPath === "/perfil" || requestedPath === "/mis-votos") {
        // Guardar la ruta solicitada para redirigir después del inicio de sesión
        const redirectUrl = new URL("/login", req.url)
        redirectUrl.searchParams.set("redirect", requestedPath)
        return NextResponse.redirect(redirectUrl)
      }
    }
  } catch (error) {
    console.error("Error en middleware:", error)
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*", "/perfil", "/mis-votos"],
}
