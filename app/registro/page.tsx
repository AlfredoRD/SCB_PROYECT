"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/spinner"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    // Validaciones básicas
    if (!email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      setMessage("¡Registro exitoso! Por favor revisa tu correo electrónico para verificar tu cuenta.")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error al registrarse:", error)
      if (error.message === "User already registered") {
        setError("Este correo electrónico ya está registrado")
      } else {
        setError(error.message || "Error al registrarse. Por favor intenta de nuevo.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Crear una cuenta</h1>
          <p className="mt-2 text-gray-400">Regístrate para participar en los Premios San Cristóbal</p>
        </div>

        {message && <div className="p-3 text-sm text-green-800 bg-green-100 rounded-md">{message}</div>}

        {error && <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@ejemplo.com"
              required
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirmar contraseña
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu contraseña"
              required
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>

          <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" /> Procesando...
              </>
            ) : (
              "Registrarse"
            )}
          </Button>
        </form>

        <div className="text-center text-gray-400">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-pink-500 hover:text-pink-400">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
