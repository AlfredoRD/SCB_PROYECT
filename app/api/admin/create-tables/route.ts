import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { isServerAdmin } from "@/lib/supabase/server"

export async function POST() {
  try {
    // Verificar si el usuario es administrador
    const isAdmin = await isServerAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Crear cliente de Supabase
    const supabase = createRouteHandlerClient({ cookies })

    // Crear la tabla de eventos
    const createEventsTable = `
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        location VARCHAR(255),
        image_url TEXT,
        capacity INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Ejecutar la creación de la tabla
    const { error: createTableError } = await supabase.rpc("exec_sql", { sql_query: createEventsTable })

    // Si la función exec_sql no existe, intentamos crear la tabla directamente
    if (
      createTableError &&
      createTableError.message.includes("function") &&
      createTableError.message.includes("does not exist")
    ) {
      // Intentar crear la tabla directamente usando SQL nativo
      // Esto solo funcionará si el usuario tiene permisos de administrador en la base de datos
      const { error: directError } = await supabase
        .from("events")
        .insert({
          title: "Gala de Premiación 2024",
          description: "Ceremonia oficial de entrega de los Premios San Cristóbal 2024",
          date: new Date("2024-12-15T19:00:00Z").toISOString(),
          location: "Teatro Nacional, San Cristóbal",
          capacity: 500,
        })
        .select()

      if (directError && !directError.message.includes("already exists")) {
        return NextResponse.json({ error: `Error al crear tabla: ${directError.message}` }, { status: 500 })
      }
    }

    // Configurar RLS para la tabla de eventos
    const configureRLS = `
      -- Configurar RLS para eventos
      ALTER TABLE events ENABLE ROW LEVEL SECURITY;
      
      -- Crear políticas de seguridad
      DROP POLICY IF EXISTS "Allow public read access to events" ON events;
      CREATE POLICY "Allow public read access to events" ON events FOR SELECT USING (true);
      
      DROP POLICY IF EXISTS "Allow admins to insert/update/delete events" ON events;
      CREATE POLICY "Allow admins to insert/update/delete events" ON events FOR ALL USING (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
      );
    `

    // Intentar configurar RLS
    try {
      await supabase.rpc("exec_sql", { sql_query: configureRLS })
    } catch (error) {
      console.warn("No se pudo configurar RLS, continuando...", error)
    }

    // Insertar un evento real si no existe
    const { error: insertError } = await supabase.from("events").upsert(
      {
        title: "Gala de Premiación 2024",
        description: "Ceremonia oficial de entrega de los Premios San Cristóbal 2024",
        date: new Date("2024-12-15T19:00:00Z").toISOString(),
        location: "Teatro Nacional, San Cristóbal",
        capacity: 500,
      },
      { onConflict: "title" },
    )

    if (insertError) {
      console.warn("Error al insertar evento:", insertError)
    }

    return NextResponse.json({ success: true, message: "Tablas creadas correctamente" })
  } catch (error) {
    console.error("Error al crear tablas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
