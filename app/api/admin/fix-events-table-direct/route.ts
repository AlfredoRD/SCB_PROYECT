import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

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

    // Verificar si la tabla events existe
    const { error: tableCheckError } = await supabase.from("events").select("id").limit(1)

    // Si la tabla no existe, crearla desde cero
    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      // Crear la tabla events
      const { error: createTableError } = await supabase.rpc("create_events_table")

      if (createTableError) {
        // Si falla la función RPC, es posible que no exista
        return NextResponse.json(
          {
            error:
              "No se pudo crear la tabla de eventos. Por favor, ve a /admin/setup-database para configurar la base de datos.",
            needsSetup: true,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Tabla de eventos creada correctamente",
        created: true,
      })
    }

    // Si la tabla existe pero falta la columna title, intentar añadirla directamente
    // Nota: Esto es un enfoque alternativo que no usa exec_sql
    try {
      // Intentar insertar un registro de prueba para verificar la estructura
      const { error: insertError } = await supabase
        .from("events")
        .insert({
          title: "Test Event",
          description: "Test Description",
          date: new Date().toISOString(),
          location: "Test Location",
          image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (insertError) {
        if (insertError.message.includes("title")) {
          // Redirigir al usuario a la página de configuración de la base de datos
          return NextResponse.json(
            {
              error:
                "La tabla events existe pero le falta la columna 'title'. Por favor, ve a /admin/setup-database para reconfigurar la base de datos.",
              needsSetup: true,
            },
            { status: 500 },
          )
        } else {
          // Otro tipo de error
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }
      }

      // Si llegamos aquí, la inserción fue exitosa, lo que significa que la tabla tiene la estructura correcta
      // Eliminar el registro de prueba
      await supabase.from("events").delete().eq("title", "Test Event")

      return NextResponse.json({
        success: true,
        message: "La tabla de eventos tiene la estructura correcta",
        fixed: true,
      })
    } catch (error) {
      return NextResponse.json(
        {
          error: "Error al verificar la estructura de la tabla: " + (error.message || "Error desconocido"),
          needsSetup: true,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
  }
}
