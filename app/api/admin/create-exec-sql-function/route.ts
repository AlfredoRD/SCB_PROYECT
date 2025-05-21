import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    const supabase = createServerClient()

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
      return NextResponse.json({ error: "No autorizado. Se requieren permisos de administrador." }, { status: 403 })
    }

    // Leer el archivo SQL
    const sqlFilePath = path.join(process.cwd(), "lib", "supabase", "create-exec-sql-function.sql")
    const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")

    // Ejecutar el script SQL directamente
    const { error } = await supabase.query(sqlQuery)

    if (error) {
      console.error("Error al crear función exec_sql:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Función exec_sql creada correctamente" })
  } catch (error) {
    console.error("Error al crear función exec_sql:", error)
    return NextResponse.json(
      { error: "Error al crear función exec_sql: " + (error.message || "Error desconocido") },
      { status: 500 },
    )
  }
}
