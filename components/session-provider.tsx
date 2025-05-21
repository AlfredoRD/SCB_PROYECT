"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"

type SessionContextType = {
  session: Session | null
  user: User | null
  isLoading: boolean
  refreshSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  isLoading: true,
  refreshSession: async () => {},
})

export const useSession = () => useContext(SessionContext)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error al obtener la sesión:", error)
        return
      }

      setSession(data.session)
      setUser(data.session?.user || null)
    } catch (error) {
      console.error("Error inesperado al obtener la sesión:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return (
    <SessionContext.Provider value={{ session, user, isLoading, refreshSession }}>{children}</SessionContext.Provider>
  )
}
