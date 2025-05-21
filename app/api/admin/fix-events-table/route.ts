import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar si el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar si el usuario es administrador
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || !userProfile || userProfile.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Leer el archivo SQL
    const sqlFilePath = path.join(process.cwd(), "lib", "supabase", "fix-events-table.sql")
    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")

    // Ejecutar el SQL
    const { error: sqlError } = await supabase.rpc("exec_sql", { sql_query: sqlQuery })

    if (sqlError) {
      console.error("Error al ejecutar SQL:", sqlError)
      return NextResponse.json({ error: sqlError.message }, { status: 500 })
    }

    // Refrescar la caché del esquema
    const { error: refreshError } = await supabase.rpc("exec_sql", {
      sql_query: "SELECT * FROM events LIMIT 0",
    })

    if (refreshError) {
      console.error("Error al refrescar caché:", refreshError)
      return NextResponse.json({ error: "Tabla creada pero hubo un error al refrescar la caché" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Tabla de eventos reparada correctamente" })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
  }
}
