-- Crear tabla de registros de eventos
CREATE TABLE IF NOT EXISTS event_registrations (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id)
);

-- Crear trigger para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_event_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_event_registrations_updated_at'
  ) THEN
    CREATE TRIGGER update_event_registrations_updated_at
    BEFORE UPDATE ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Configurar políticas de seguridad
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Allow users to view their own registrations" ON event_registrations;
DROP POLICY IF EXISTS "Allow admins to view all registrations" ON event_registrations;
DROP POLICY IF EXISTS "Allow users to register for events" ON event_registrations;
DROP POLICY IF EXISTS "Allow admins to manage all registrations" ON event_registrations;

-- Crear nuevas políticas
CREATE POLICY "Allow users to view their own registrations" ON event_registrations 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to view all registrations" ON event_registrations 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Allow users to register for events" ON event_registrations 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins to manage all registrations" ON event_registrations 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  )
);
