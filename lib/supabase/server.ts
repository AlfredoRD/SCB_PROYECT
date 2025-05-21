import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export function createServerClient() {
  return createServerComponentClient<Database>({
    cookies,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    options: {
      global: {
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(5000), // 5 segundos de timeout para todas las peticiones
          })
        },
      },
      db: {
        schema: "public",
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  })
}

export async function checkServerUserRole() {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return null

    // Intentar obtener el rol con un timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    try {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()
        .abortSignal(controller.signal)

      clearTimeout(timeoutId)
      return profile?.role || "user"
    } catch (error) {
      clearTimeout(timeoutId)
      console.error("Error al obtener rol del usuario:", error)

      // Verificar si el rol está en los metadatos del usuario
      const userRole = session.user.user_metadata?.role
      return userRole || "user"
    }
  } catch (error) {
    console.error("Error en checkServerUserRole:", error)
    return "user" // Valor por defecto en caso de error
  }
}

export async function isServerAdmin() {
  try {
    const role = await checkServerUserRole()
    return role === "admin"
  } catch (error) {
    console.error("Error en isServerAdmin:", error)
    return false // Por defecto, no es admin en caso de error
  }
}
