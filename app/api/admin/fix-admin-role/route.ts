import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar si el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar si el email es el del administrador
    const adminEmail = "admin@premiossancristobal.com"
    if (session.user.email !== adminEmail) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Asignar rol de administrador
    const { error } = await supabase.from("user_profiles").upsert({
      id: session.user.id,
      role: "admin",
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error al asignar rol de administrador:", error)
      return NextResponse.json({ error: "Error al asignar rol de administrador" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Rol de administrador asignado correctamente" })
  } catch (error) {
    console.error("Error al asignar rol de administrador:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
