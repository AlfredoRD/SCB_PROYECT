"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"

export function useSession() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Función para obtener la sesión actual
    async function getSession() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error al obtener la sesión:", error)
          setSession(null)
        } else {
          setSession(data.session)
        }
      } catch (error) {
        console.error("Error inesperado al obtener la sesión:", error)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    // Obtener la sesión inicial
    getSession()

    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Evento de autenticación:", event)
      setSession(session)
      setLoading(false)
    })

    // Limpiar la suscripción al desmontar
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}
