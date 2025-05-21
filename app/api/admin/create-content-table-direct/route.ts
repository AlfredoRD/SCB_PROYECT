import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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

    // 1. Crear la tabla content directamente
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
    const { error: createIndexError } = await supabase.query(`
      CREATE INDEX IF NOT EXISTS idx_content_section ON content(section);
    `)

    if (createIndexError) {
      console.error("Error al crear índice:", createIndexError)
    }

    // 3. Crear función para actualizar el timestamp
    const { error: createFunctionError } = await supabase.query(`
      CREATE OR REPLACE FUNCTION update_modified_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    if (createFunctionError) {
      console.error("Error al crear función:", createFunctionError)
    }

    // 4. Crear trigger
    const { error: createTriggerError } = await supabase.query(`
      DROP TRIGGER IF EXISTS set_content_updated_at ON content;
      CREATE TRIGGER set_content_updated_at
      BEFORE UPDATE ON content
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
    `)

    if (createTriggerError) {
      console.error("Error al crear trigger:", createTriggerError)
    }

    // 5. Configurar RLS
    const { error: enableRlsError } = await supabase.query(`
      ALTER TABLE content ENABLE ROW LEVEL SECURITY;
    `)

    if (enableRlsError) {
      console.error("Error al habilitar RLS:", enableRlsError)
    }

    // 6. Crear políticas
    const { error: createPoliciesError } = await supabase.query(`
      DROP POLICY IF EXISTS admin_all ON content;
      CREATE POLICY admin_all ON content
        FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
          )
        );

      DROP POLICY IF EXISTS read_all ON content;
      CREATE POLICY read_all ON content
        FOR SELECT
        TO anon, authenticated
        USING (true);
    `)

    if (createPoliciesError) {
      console.error("Error al crear políticas:", createPoliciesError)
    }

    // 7. Insertar datos iniciales
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
    console.error("Error en la ruta de creación de tabla de contenido:", error)
    return NextResponse.json(
      { error: "Error al crear tabla de contenido: " + (error.message || "Error desconocido") },
      { status: 500 },
    )
  }
}
