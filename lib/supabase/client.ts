"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Crear el cliente de Supabase
export const supabase = createClientComponentClient<Database>()

export async function checkUserRole() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return null

    const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

    return profile?.role || "user"
  } catch (error) {
    console.error("Error al verificar el rol del usuario:", error)
    return "user"
  }
}

export async function isAdmin() {
  try {
    const role = await checkUserRole()
    return role === "admin"
  } catch (error) {
    console.error("Error al verificar si es admin:", error)
    return false
  }
}
