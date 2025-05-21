"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({ variant = "default", size = "default", className = "", children }: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleLogout = async () => {
    if (isLoggingOut) return

    try {
      setIsLoggingOut(true)

      // Mostrar toast de cierre de sesión
      toast({
        title: "Cerrando sesión",
        description: "Por favor espera...",
      })

      // Usar la API de logout
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al cerrar sesión")
      }

      // Mostrar confirmación
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })

      // Usar window.location para una redirección completa
      window.location.href = "/"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)

      // Mostrar error
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: "Ha ocurrido un error. Intenta recargar la página.",
      })

      // Forzar redirección incluso si hay error
      window.location.href = "/"
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleLogout} disabled={isLoggingOut} className={className}>
      {children || (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}</span>
        </>
      )}
    </Button>
  )
}
