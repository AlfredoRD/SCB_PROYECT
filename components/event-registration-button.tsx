"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/hooks/use-session"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"

interface EventRegistrationButtonProps {
  eventId: number
  className?: string
}

export default function EventRegistrationButton({ eventId, className = "" }: EventRegistrationButtonProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const { session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  // Verificar si el usuario ya está registrado para este evento
  const checkRegistration = async () => {
    if (!session) return

    try {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("event_id", eventId)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error al verificar registro:", error)
        return
      }

      setIsRegistered(!!data)
    } catch (err) {
      console.error("Error inesperado al verificar registro:", err)
    }
  }

  // Llamar a checkRegistration cuando el componente se monta y cuando cambia la sesión
  useState(() => {
    checkRegistration()
  })

  const handleRegistration = async () => {
    // Si el usuario no está logueado, redirigir a la página de login
    if (!session) {
      // Guardar la URL actual para redirigir después del inicio de sesión
      const currentPath = window.location.pathname
      localStorage.setItem("redirectAfterLogin", currentPath)

      toast({
        title: "Inicia sesión para registrarte",
        description: "Debes iniciar sesión para poder registrarte en este evento",
      })

      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    setIsRegistering(true)

    try {
      // Verificar si ya está registrado
      const { data: existingReg, error: checkError } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("event_id", eventId)

      if (checkError) {
        console.error("Error al verificar registro existente:", checkError)
        toast({
          title: "Error al verificar registro",
          description: "No se pudo verificar si ya estás registrado. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
        setIsRegistering(false)
        return
      }

      if (existingReg && existingReg.length > 0) {
        toast({
          title: "Ya estás registrado",
          description: "Ya te has registrado para este evento anteriormente",
        })
        setIsRegistered(true)
        setIsRegistering(false)
        return
      }

      // Insertar nuevo registro
      const { error: insertError } = await supabase.from("event_registrations").insert({
        user_id: session.user.id,
        event_id: eventId,
        status: "confirmed",
      })

      if (insertError) {
        console.error("Error al registrarse:", insertError)
        toast({
          title: "Error al registrarse",
          description: "Ha ocurrido un error al registrarte para este evento. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
        setIsRegistering(false)
        return
      }

      toast({
        title: "¡Registro exitoso!",
        description: "Te has registrado correctamente para este evento",
      })
      setIsRegistered(true)
      router.refresh()
    } catch (error) {
      console.error("Error inesperado al registrarse:", error)
      toast({
        title: "Error al registrarse",
        description: "Ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  if (isRegistered) {
    return (
      <Button disabled variant="secondary" size="lg" className={className}>
        Ya estás registrado
      </Button>
    )
  }

  return (
    <Button onClick={handleRegistration} disabled={isRegistering} size="lg" className={className}>
      {isRegistering ? "Procesando..." : "Registrarse al evento"}
    </Button>
  )
}
