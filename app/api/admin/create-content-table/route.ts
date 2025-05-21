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

    // Intentar crear la tabla directamente sin usar exec_sql
    try {
      // Leer el archivo SQL
      const sqlFilePath = path.join(process.cwd(), "lib", "supabase", "content-schema.sql")
      const sqlQuery = fs.readFileSync(sqlFilePath, "utf8")

      // Dividir el script SQL en comandos individuales
      const commands = sqlQuery
        .split(";")
        .map((cmd) => cmd.trim())
        .filter((cmd) => cmd.length > 0)

      // Ejecutar cada comando por separado
      for (const command of commands) {
        const { error: cmdError } = await supabase.rpc("exec_sql", { sql_query: command + ";" })

        if (cmdError) {
          // Si el error es que la función no existe, intentamos un enfoque alternativo
          if (cmdError.message.includes("function") && cmdError.message.includes("does not exist")) {
            console.log("La función exec_sql no existe, intentando enfoque alternativo...")
            return await createTableAlternative(supabase)
          }

          console.error("Error al ejecutar comando SQL:", cmdError)
          return NextResponse.json({ error: cmdError.message }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true, message: "Tabla de contenido creada correctamente" })
    } catch (error) {
      console.error("Error al crear tabla de contenido:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error en la ruta de creación de tabla de contenido:", error)
    return NextResponse.json(
      { error: "Error al crear tabla de contenido: " + (error.message || "Error desconocido") },
      { status: 500 },
    )
  }
}

// Función alternativa para crear la tabla sin usar exec_sql
async function createTableAlternative(supabase) {
  try {
    // 1. Crear la tabla content
    const { error: createTableError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS content (
        id SERIAL PRIMARY KEY,
        section VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        content JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    if (createTableError) {
      console.error("Error al crear tabla content:", createTableError)
      return NextResponse.json({ error: createTableError.message }, { status: 500 })
    }

    // 2. Crear índice
    await supabase.query(`
      CREATE INDEX IF NOT EXISTS idx_content_section ON content(section);
    `)

    // 3. Insertar datos iniciales
    const initialSections = [
      {
        section: "home",
        title: "Página Principal",
        content: {
          hero_title: "Premios San Cristóbal",
          hero_subtitle: "Celebrando la excelencia artística",
          hero_description: "Los Premios San Cristóbal reconocen y celebran el talento y la creatividad en las artes.",
          cta_button: "Conoce a los nominados",
        },
      },
      {
        section: "about",
        title: "Acerca De",
        content: {
          title: "Acerca de los Premios",
          description:
            "Los Premios San Cristóbal fueron creados para reconocer la excelencia en las artes y la cultura.",
          mission: "Nuestra misión es promover y celebrar el talento artístico en todas sus formas.",
          vision: "Buscamos ser el reconocimiento más prestigioso en el ámbito cultural y artístico.",
        },
      },
      {
        section: "events",
        title: "Eventos",
        content: {
          title: "Próximos Eventos",
          description: "Calendario de eventos relacionados con los Premios San Cristóbal.",
          upcoming_title: "Gala de Premiación",
          upcoming_description: "Ceremonia de entrega de los Premios San Cristóbal.",
        },
      },
      {
        section: "footer",
        title: "Pie de Página",
        content: {
          copyright: "© 2023 Premios San Cristóbal. Todos los derechos reservados.",
          address: "Av. Principal #123, Ciudad",
          phone: "+1 234 567 890",
          email: "contacto@premiossancristobal.com",
        },
      },
    ]

    // Insertar cada sección
    for (const section of initialSections) {
      const { error: insertError } = await supabase.from("content").upsert(section, { onConflict: "section" })

      if (insertError) {
        console.error(`Error al insertar sección ${section.section}:`, insertError)
      }
    }

    return NextResponse.json({ success: true, message: "Tabla de contenido creada correctamente" })
  } catch (error) {
    console.error("Error en el enfoque alternativo:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
