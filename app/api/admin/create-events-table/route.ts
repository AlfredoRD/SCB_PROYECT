import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar si el usuario es administrador
    const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

    if (!userProfile || userProfile.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Leer el archivo SQL
    const sqlFilePath = path.join(process.cwd(), "lib", "supabase", "create-events-table.sql")
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8")

    // Ejecutar el SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sqlContent })

    if (error) {
      console.error("Error al ejecutar SQL:", error)

      // Si la función exec_sql no existe, intentar crear la tabla directamente
      if (error.message.includes("function") && error.message.includes("does not exist")) {
        // Dividir el SQL en sentencias individuales
        const statements = sqlContent
          .split(";")
          .map((stmt) => stmt.trim())
          .filter((stmt) => stmt.length > 0)

        // Ejecutar cada sentencia por separado
        for (const stmt of statements) {
          const { error: stmtError } = await supabase.rpc("exec_sql", { sql_query: stmt + ";" })
          if (stmtError && !stmtError.message.includes("already exists")) {
            return NextResponse.json(
              {
                success: false,
                error: `Error al ejecutar SQL: ${stmtError.message}`,
                details: "Intenta crear la función exec_sql primero o usa el método directo.",
              },
              { status: 500 },
            )
          }
        }
      } else {
        return NextResponse.json(
          {
            success: false,
            error: `Error al ejecutar SQL: ${error.message}`,
          },
          { status: 500 },
        )
      }
    }

    // Verificar que la tabla se creó correctamente
    const { error: checkError } = await supabase.from("events").select("id").limit(1)

    if (checkError) {
      return NextResponse.json(
        {
          success: false,
          error: `Error al verificar la tabla: ${checkError.message}`,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Tabla de eventos creada correctamente",
    })
  } catch (error) {
    console.error("Error al crear tabla de eventos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
