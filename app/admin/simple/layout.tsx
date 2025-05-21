import type React from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"

export default async function SimpleAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = createServerClient()

    // Verificación simplificada de sesión
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login?redirect=/admin/simple")
    }

    // Verificación simplificada de rol
    let isAdmin = false

    // Primero verificar en metadatos (más rápido)
    if (session.user.user_metadata?.role === "admin") {
      isAdmin = true
    } else {
      // Intentar verificar en la base de datos con timeout corto
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000)

        const { data } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .abortSignal(controller.signal)

        clearTimeout(timeoutId)

        if (data?.role === "admin") {
          isAdmin = true
        }
      } catch (error) {
        console.warn("Error al verificar rol en modo simple:", error)
        // Si hay error, asumimos que no es admin
      }
    }

    if (!isAdmin) {
      redirect("/")
    }

    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Panel de Administración (Modo Simple)</h1>
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md mb-8">
          <p className="text-yellow-800 dark:text-yellow-400">
            Estás viendo el panel de administración en modo simple. Algunas funcionalidades pueden estar limitadas.
          </p>
        </div>
        {children}
      </div>
    )
  } catch (error) {
    console.error("Error en simple layout:", error)
    redirect("/login?error=admin_access")
  }
}
