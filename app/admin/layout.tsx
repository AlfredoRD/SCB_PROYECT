import type React from "react"
import { createServerClient } from "@/lib/supabase/server"
import AdminNav from "@/components/admin-nav"
import { Suspense } from "react"
import { AdminError } from "@/components/admin-error"
import { cookies } from "next/headers"

// Reemplazar toda la función por esta versión mejorada:
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Crear cliente de Supabase
    const cookieStore = cookies()
    const supabase = createServerClient()

    // Verificar sesión
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      // Si no hay sesión, mostrar mensaje de error en lugar de redirigir
      return (
        <div className="container py-10">
          <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
          <AdminError
            title="Acceso denegado"
            message="Debes iniciar sesión para acceder al panel de administración."
            actionText="Iniciar sesión"
            actionHref="/login?redirect=/admin"
          />
        </div>
      )
    }

    // Verificar si el usuario es administrador
    let isAdmin = false

    // Primero intentamos verificar en los metadatos del usuario (más rápido)
    if (session.user.user_metadata?.role === "admin") {
      isAdmin = true
    } else {
      // Si no está en los metadatos, consultamos la base de datos
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .abortSignal(AbortSignal.timeout(5000))

        if (!error && data?.role === "admin") {
          isAdmin = true
        }
      } catch (error) {
        console.warn("Error al verificar rol de administrador:", error)
      }
    }

    if (!isAdmin) {
      // Si no es administrador, mostrar mensaje de error en lugar de redirigir
      return (
        <div className="container py-10">
          <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
          <AdminError
            title="Acceso denegado"
            message="No tienes permisos de administrador para acceder a esta sección."
            actionText="Volver al inicio"
            actionHref="/"
          />
        </div>
      )
    }

    // Si llegamos aquí, el usuario es administrador
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="sticky top-20">
              <AdminNav />
            </div>
          </div>
          <div className="md:col-span-3">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error en el layout de administración:", error)

    // En caso de error, mostrar un mensaje amigable
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
        <AdminError
          title="Error al cargar el panel de administración"
          message="Ha ocurrido un error al verificar tus permisos o cargar el panel. Por favor, intenta recargar la página o vuelve a iniciar sesión."
          actionText="Volver al inicio"
          actionHref="/"
        />
      </div>
    )
  }
}
