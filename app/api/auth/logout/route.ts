import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Cerrar sesión
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error al cerrar sesión:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Redirigir a la página principal
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 })
  }
}
