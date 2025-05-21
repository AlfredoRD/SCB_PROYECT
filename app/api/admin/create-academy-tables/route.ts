import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import academySchema from "@/lib/supabase/academy-members-schema.sql"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar si el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ message: "No autorizado. Debes iniciar sesión." }, { status: 401 })
    }

    // Verificar si el usuario es administrador
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || userProfile?.role !== "admin") {
      return NextResponse.json(
        { message: "No autorizado. Solo los administradores pueden realizar esta acción." },
        { status: 403 },
      )
    }

    // Ejecutar el script SQL para crear las tablas
    const { error: sqlError } = await supabase.rpc("exec_sql", {
      sql_query: academySchema,
    })

    if (sqlError) {
      console.error("Error al ejecutar SQL:", sqlError)
      return NextResponse.json({ message: "Error al crear las tablas: " + sqlError.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Tablas creadas correctamente" })
  } catch (error: any) {
    console.error("Error:", error)
    return NextResponse.json({ message: "Error al crear las tablas: " + error.message }, { status: 500 })
  }
}
