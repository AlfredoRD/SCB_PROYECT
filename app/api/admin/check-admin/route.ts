import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar sesión
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ isAdmin: false, reason: "no_session" })
    }

    // Verificar si el rol está en los metadatos del usuario
    if (session.user.user_metadata?.role === "admin") {
      return NextResponse.json({ isAdmin: true, source: "metadata" })
    }

    // Verificar en la base de datos
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (error) {
      console.error("Error al verificar rol:", error)
      return NextResponse.json({ isAdmin: false, reason: "db_error", error: error.message })
    }

    return NextResponse.json({
      isAdmin: profile?.role === "admin",
      source: "database",
    })
  } catch (error) {
    console.error("Error en check-admin:", error)
    return NextResponse.json({ isAdmin: false, reason: "server_error" }, { status: 500 })
  }
}
