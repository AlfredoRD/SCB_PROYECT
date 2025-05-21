-- Verificar si la tabla events existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
        -- La tabla existe, verificar si tiene la columna title
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'title') THEN
            -- La columna title no existe, agregarla
            ALTER TABLE events ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Evento sin título';
        END IF;
        
        -- Verificar otras columnas necesarias
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'description') THEN
            ALTER TABLE events ADD COLUMN description TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'date') THEN
            ALTER TABLE events ADD COLUMN date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location') THEN
            ALTER TABLE events ADD COLUMN location VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'image_url') THEN
            ALTER TABLE events ADD COLUMN image_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'created_at') THEN
            ALTER TABLE events ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
    ELSE
        -- La tabla no existe, crearla
        CREATE TABLE events (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            date TIMESTAMP WITH TIME ZONE NOT NULL,
            location VARCHAR(255),
            image_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Configurar RLS para eventos
        ALTER TABLE events ENABLE ROW LEVEL SECURITY;
        
        -- Crear políticas de seguridad
        CREATE POLICY "Allow public read access to events" ON events FOR SELECT USING (true);
        CREATE POLICY "Allow admins to insert/update/delete events" ON events FOR ALL USING (
            (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
        );
        
        -- Insertar un evento de ejemplo
        INSERT INTO events (title, description, date, location)
        VALUES (
            'Gala de Premiación 2024',
            'Ceremonia oficial de entrega de los Premios San Cristóbal 2024',
            '2024-12-15 19:00:00+00',
            'Teatro Nacional, San Cristóbal'
        );
    END IF;
END $$;
