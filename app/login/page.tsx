"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/"

  // Guardar la ruta de redirección en localStorage para usarla después del callback de autenticación
  useEffect(() => {
    if (redirectPath && redirectPath !== "/") {
      localStorage.setItem("redirectAfterLogin", redirectPath)
    }
  }, [redirectPath])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("Iniciando sesión con:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error de inicio de sesión:", error.message)
        setError(error.message)
        setLoading(false)
        return
      }

      if (data?.session) {
        console.log("Sesión iniciada correctamente:", data.session.user.email)

        // Obtener la ruta de redirección guardada
        const savedRedirect = localStorage.getItem("redirectAfterLogin")

        // Redirigir al usuario a la página solicitada o a la página principal
        if (redirectPath && redirectPath !== "/") {
          router.push(redirectPath)
        } else if (savedRedirect && savedRedirect !== "/") {
          router.push(savedRedirect)
          localStorage.removeItem("redirectAfterLogin") // Limpiar después de usar
        } else {
          router.push("/")
        }
      } else {
        console.error("No se pudo iniciar sesión: No hay datos de sesión")
        setError("No se pudo iniciar sesión. Inténtalo de nuevo.")
        setLoading(false)
      }
    } catch (err) {
      console.error("Error inesperado:", err)
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
          <p className="mt-2 text-gray-400">Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>

        {error && <div className="p-4 mb-4 text-sm text-red-500 bg-red-100 bg-opacity-10 rounded-lg">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="tu@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            ¿No tienes una cuenta?{" "}
            <Link href="/registro" className="text-pink-500 hover:text-pink-400">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
