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

    // 1. Verificar si la tabla events existe usando SQL directo
    const { data: tablesData, error: tablesError } = await supabase.rpc("exec_sql", {
      sql_query: "SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'events' AND schemaname = 'public')",
    })

    if (tablesError) {
      // Si la función exec_sql no existe, intentamos una consulta directa
      const { data: tableCheck, error: tableCheckError } = await supabase.from("events").select("id").limit(1)

      // Si hay un error que no sea "relation does not exist", es un error diferente
      if (tableCheckError && !tableCheckError.message.includes("does not exist")) {
        return NextResponse.json({ error: `Error al verificar tabla: ${tableCheckError.message}` }, { status: 500 })
      }

      // Si el error es "relation does not exist", la tabla no existe
      const tableExists = !tableCheckError || !tableCheckError.message.includes("does not exist")

      // Si la tabla no existe, la creamos
      if (!tableExists) {
        const createTableSQL = `
          CREATE TABLE events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            title TEXT NOT NULL,
            description TEXT,
            date TIMESTAMP WITH TIME ZONE,
            location TEXT,
            image_url TEXT,
            is_featured BOOLEAN DEFAULT false
          );

          -- Configurar políticas de seguridad
          ALTER TABLE events ENABLE ROW LEVEL SECURITY;
          
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

        const { error: createError } = await supabase.rpc("exec_sql", { sql_query: createTableSQL })

        if (createError) {
          // Si la función exec_sql no existe, intentamos crear la tabla directamente
          const { error: directCreateError } = await supabase.query(createTableSQL)

          if (directCreateError) {
            return NextResponse.json({ error: `Error al crear tabla: ${directCreateError.message}` }, { status: 500 })
          }
        }

        return NextResponse.json({
          success: true,
          message: "Tabla de eventos creada correctamente",
          action: "created",
        })
      }
    } else {
      // Si la función exec_sql existe y devuelve datos, verificamos si la tabla existe
      const tableExists = tablesData && tablesData.length > 0 && tablesData[0].exists

      // Si la tabla no existe, la creamos
      if (!tableExists) {
        const createTableSQL = `
          CREATE TABLE events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            title TEXT NOT NULL,
            description TEXT,
            date TIMESTAMP WITH TIME ZONE,
            location TEXT,
            image_url TEXT,
            is_featured BOOLEAN DEFAULT false
          );

          -- Configurar políticas de seguridad
          ALTER TABLE events ENABLE ROW LEVEL SECURITY;
          
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

        const { error: createError } = await supabase.rpc("exec_sql", { sql_query: createTableSQL })

        if (createError) {
          // Si la función exec_sql no existe, intentamos crear la tabla directamente
          const { error: directCreateError } = await supabase.query(createTableSQL)

          if (directCreateError) {
            return NextResponse.json({ error: `Error al crear tabla: ${directCreateError.message}` }, { status: 500 })
          }
        }

        return NextResponse.json({
          success: true,
          message: "Tabla de eventos creada correctamente",
          action: "created",
        })
      }
    }

    // 2. Si la tabla existe, verificamos si tiene la columna title
    try {
      const { data: titleCheck, error: titleCheckError } = await supabase.from("events").select("title").limit(1)

      // Si no hay error, la columna title existe
      if (!titleCheckError) {
        return NextResponse.json({
          success: true,
          message: "La estructura de la tabla es correcta",
          action: "verified",
        })
      }

      // Si el error menciona la columna title, necesitamos añadirla
      if (titleCheckError && titleCheckError.message.includes("title")) {
        const alterSQL = `ALTER TABLE events ADD COLUMN title TEXT NOT NULL DEFAULT 'Evento sin título';`

        const { error: alterError } = await supabase.rpc("exec_sql", { sql_query: alterSQL })

        if (alterError) {
          // Si la función exec_sql no existe, intentamos alterar la tabla directamente
          const { error: directAlterError } = await supabase.query(alterSQL)

          if (directAlterError) {
            return NextResponse.json(
              { error: `Error al añadir columna title: ${directAlterError.message}` },
              { status: 500 },
            )
          }
        }

        return NextResponse.json({
          success: true,
          message: "Columna title añadida correctamente",
          action: "updated",
          columnsAdded: ["title"],
        })
      }

      // Si hay otro tipo de error, recreamos la tabla
      const recreateSQL = `
        -- Guardar datos existentes
        CREATE TEMP TABLE events_backup AS SELECT * FROM events;
        
        -- Eliminar tabla existente
        DROP TABLE events;
        
        -- Crear tabla con estructura correcta
        CREATE TABLE events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          title TEXT NOT NULL DEFAULT 'Evento sin título',
          description TEXT,
          date TIMESTAMP WITH TIME ZONE,
          location TEXT,
          image_url TEXT,
          is_featured BOOLEAN DEFAULT false
        );
        
        -- Restaurar datos (ignorando errores)
        INSERT INTO events (id, created_at, updated_at, description, date, location, image_url, is_featured)
        SELECT id, created_at, updated_at, description, date, location, image_url, is_featured
        FROM events_backup
        ON CONFLICT DO NOTHING;
        
        -- Configurar políticas de seguridad
        ALTER TABLE events ENABLE ROW LEVEL SECURITY;
        
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
          
        -- Eliminar tabla temporal
        DROP TABLE events_backup;
      `

      const { error: recreateError } = await supabase.rpc("exec_sql", { sql_query: recreateSQL })

      if (recreateError) {
        // Si la función exec_sql no existe o hay otro error, creamos la tabla desde cero
        const dropSQL = `DROP TABLE IF EXISTS events;`
        await supabase.query(dropSQL)

        const createSQL = `
          CREATE TABLE events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            title TEXT NOT NULL,
            description TEXT,
            date TIMESTAMP WITH TIME ZONE,
            location TEXT,
            image_url TEXT,
            is_featured BOOLEAN DEFAULT false
          );

          -- Configurar políticas de seguridad
          ALTER TABLE events ENABLE ROW LEVEL SECURITY;
          
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

        const { error: createError } = await supabase.query(createSQL)

        if (createError) {
          return NextResponse.json({ error: `Error al recrear tabla: ${createError.message}` }, { status: 500 })
        }
      }

      return NextResponse.json({
        success: true,
        message: "Tabla de eventos recreada correctamente",
        action: "recreated",
      })
    } catch (error) {
      return NextResponse.json({ error: `Error al verificar columna title: ${error.message}` }, { status: 500 })
    }
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json(
      { error: "Error al corregir estructura: " + (error.message || "Error desconocido") },
      { status: 500 },
    )
  }
}
