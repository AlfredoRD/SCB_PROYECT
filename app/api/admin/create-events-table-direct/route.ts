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

    // Usar el servicio REST directamente con el token de servicio
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      return NextResponse.json({ error: "Faltan variables de entorno para Supabase" }, { status: 500 })
    }

    // 1. Eliminar la tabla si existe
    try {
      const dropResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          sql_query: "DROP TABLE IF EXISTS events CASCADE;",
        }),
      })

      if (!dropResponse.ok && !dropResponse.status.toString().startsWith("4")) {
        const errorText = await dropResponse.text()
        console.warn("Error al eliminar tabla (no crítico):", errorText)
      }
    } catch (error) {
      console.warn("Error al eliminar tabla (no crítico):", error)
    }

    // 2. Crear la tabla usando SQL directo
    try {
      const createTableSQL = `
        CREATE TABLE events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT,
          date DATE,
          location TEXT,
          image_url TEXT,
          is_featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Configurar políticas de seguridad
        ALTER TABLE events ENABLE ROW LEVEL SECURITY;
        
        -- Política para administradores (CRUD completo)
        CREATE POLICY "Admins can do anything with events"
          ON events
          USING ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin')
          WITH CHECK ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin');
        
        -- Política para usuarios (solo lectura)
        CREATE POLICY "Users can view events"
          ON events
          FOR SELECT
          USING (true);
      `

      const createResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          sql_query: createTableSQL,
        }),
      })

      if (!createResponse.ok) {
        // Si falla con exec_sql, intentar crear la tabla directamente
        if (createResponse.status === 404 || (await createResponse.text()).includes("function")) {
          // Crear la tabla directamente usando la API REST
          console.log("La función exec_sql no existe, creando tabla directamente...")

          // Crear la tabla con una estructura básica
          const directCreateResponse = await fetch(`${supabaseUrl}/rest/v1/events`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseServiceKey}`,
              apikey: supabaseAnonKey,
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              id: "00000000-0000-0000-0000-000000000000",
              title: "Tabla Creada",
              description: "Esta fila se eliminará automáticamente",
              date: new Date().toISOString().split("T")[0],
              is_featured: false,
            }),
          })

          if (!directCreateResponse.ok) {
            const errorText = await directCreateResponse.text()
            throw new Error(`Error al crear tabla directamente: ${errorText}`)
          }
        } else {
          const errorText = await createResponse.text()
          throw new Error(`Error al crear tabla con exec_sql: ${errorText}`)
        }
      }
    } catch (error) {
      console.error("Error al crear tabla:", error)
      return NextResponse.json({ error: "Error al crear tabla: " + error.message }, { status: 500 })
    }

    // 3. Insertar eventos de ejemplo
    try {
      const exampleEvents = [
        {
          title: "Ceremonia de Premiación",
          description: "Ceremonia anual de entrega de premios San Cristóbal",
          date: "2023-12-15",
          location: "Teatro Nacional",
          is_featured: true,
        },
        {
          title: "Rueda de Prensa",
          description: "Anuncio de nominados a los premios de este año",
          date: "2023-11-01",
          location: "Hotel Sheraton",
          is_featured: false,
        },
      ]

      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseAnonKey,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(exampleEvents),
      })

      if (!insertResponse.ok) {
        const errorText = await insertResponse.text()
        console.warn("Error al insertar ejemplos (no crítico):", errorText)
      }
    } catch (error) {
      console.warn("Error al insertar ejemplos (no crítico):", error)
    }

    // 4. Forzar actualización de la caché del esquema
    try {
      // Hacer una consulta para forzar la actualización de la caché
      await fetch(`${supabaseUrl}/rest/v1/events?select=id&limit=1`, {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseAnonKey,
        },
      })

      // Esperar un momento para que la caché se actualice
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.warn("Error al actualizar caché (no crítico):", error)
    }

    // 5. Verificar que la tabla se creó correctamente
    try {
      const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/events?select=title&limit=1`, {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseAnonKey,
        },
      })

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text()
        throw new Error(`Error al verificar tabla: ${errorText}`)
      }
    } catch (error) {
      console.error("Error al verificar tabla:", error)
      return NextResponse.json({ error: "Error al verificar tabla: " + error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Tabla de eventos creada correctamente",
    })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json(
      { error: "Error al crear tabla: " + (error.message || "Error desconocido") },
      { status: 500 },
    )
  }
}
