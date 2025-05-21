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

    // Ejecutar una consulta para refrescar la caché del esquema
    const { error } = await supabase.rpc("refresh_schema_cache")

    if (error) {
      // Si la función RPC no existe, intentamos crear la función
      if (error.message.includes("does not exist")) {
        // Crear la función refresh_schema_cache
        const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION refresh_schema_cache()
          RETURNS boolean
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            -- Esta función no hace nada realmente, solo sirve para forzar una actualización de la caché
            RETURN true;
          END;
          $$;
        `

        const { error: createError } = await supabase.query(createFunctionSQL)

        if (createError) {
          return NextResponse.json({ error: `Error al crear función: ${createError.message}` }, { status: 500 })
        }

        // Intentar llamar a la función recién creada
        const { error: retryError } = await supabase.rpc("refresh_schema_cache")

        if (retryError) {
          return NextResponse.json({ error: `Error al refrescar caché: ${retryError.message}` }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: `Error al refrescar caché: ${error.message}` }, { status: 500 })
      }
    }

    // Verificar que la tabla events existe y tiene la columna title
    const { error: checkError } = await supabase.from("events").select("title").limit(1)

    if (checkError) {
      // Si la tabla no existe o falta la columna, la creamos
      if (checkError.message.includes("does not exist") || checkError.message.includes("column")) {
        // SQL para crear o modificar la tabla events
        const createTableSQL = `
          -- Crear la tabla si no existe
          CREATE TABLE IF NOT EXISTS events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Añadir columnas si no existen
          DO $$
          BEGIN
            -- Añadir columna title si no existe
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'events' AND column_name = 'title'
            ) THEN
              ALTER TABLE events ADD COLUMN title TEXT NOT NULL DEFAULT 'Evento sin título';
            END IF;
            
            -- Añadir columna description si no existe
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'events' AND column_name = 'description'
            ) THEN
              ALTER TABLE events ADD COLUMN description TEXT;
            END IF;
            
            -- Añadir columna date si no existe
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'events' AND column_name = 'date'
            ) THEN
              ALTER TABLE events ADD COLUMN date TIMESTAMP WITH TIME ZONE;
            END IF;
            
            -- Añadir columna location si no existe
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'events' AND column_name = 'location'
            ) THEN
              ALTER TABLE events ADD COLUMN location TEXT;
            END IF;
            
            -- Añadir columna image_url si no existe
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'events' AND column_name = 'image_url'
            ) THEN
              ALTER TABLE events ADD COLUMN image_url TEXT;
            END IF;
            
            -- Añadir columna is_featured si no existe
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'events' AND column_name = 'is_featured'
            ) THEN
              ALTER TABLE events ADD COLUMN is_featured BOOLEAN DEFAULT false;
            END IF;
          END $$;
          
          -- Configurar políticas de seguridad
          ALTER TABLE events ENABLE ROW LEVEL SECURITY;
          
          -- Eliminar políticas existentes para evitar duplicados
          DROP POLICY IF EXISTS "Admins can do anything with events" ON events;
          DROP POLICY IF EXISTS "Users can view events" ON events;
          
          -- Política para administradores (CRUD completo)
          CREATE POLICY "Admins can do anything with events"
            ON events
            USING (
              (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
            )
            WITH CHECK (
              (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
            );
          
          -- Política para usuarios (solo lectura)
          CREATE POLICY "Users can view events"
            ON events
            FOR SELECT
            USING (true);
        `

        // Ejecutar el SQL para crear/modificar la tabla
        const { error: createTableError } = await supabase.query(createTableSQL)

        if (createTableError) {
          return NextResponse.json({ error: `Error al crear tabla: ${createTableError.message}` }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: `Error al verificar tabla: ${checkError.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Caché de esquema actualizada y estructura de tabla verificada",
    })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json(
      { error: "Error al refrescar caché: " + (error.message || "Error desconocido") },
      { status: 500 },
    )
  }
}
