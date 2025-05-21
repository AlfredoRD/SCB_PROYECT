"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { Spinner } from "@/components/spinner"

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          window.location.href = "/login?redirect=/perfil"
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error al obtener perfil:", profileError)
        }

        setUser({
          ...session.user,
          profile: profile || null,
        })
      } catch (err) {
        console.error("Error al cargar usuario:", err)
        setError("No se pudo cargar la información del usuario")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  if (loading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[50vh]">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="bg-red-500 bg-opacity-10 text-red-500 p-4 rounded-md">{error}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-10">
        <div className="bg-yellow-500 bg-opacity-10 text-yellow-500 p-4 rounded-md">
          Debes iniciar sesión para ver esta página.
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Información de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Nombre:</strong> {user.profile?.full_name || "No especificado"}
              </p>
              <p>
                <strong>Rol:</strong> {user.profile?.role || "usuario"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" asChild>
                <a href="/mis-votos">Ver mis votos</a>
              </Button>
              {(user.profile?.role === "admin" || user.email === "admin@premiossancristobal.com") && (
                <Button variant="outline" className="w-full" asChild>
                  <a href="/admin">Panel de administración</a>
                </Button>
              )}
              <Button
                variant="destructive"
                className="w-full"
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = "/"
                }}
              >
                Cerrar sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
