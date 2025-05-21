-- Crear tabla de eventos si no existe
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear trigger para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Crear políticas RLS para permitir lectura pública
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Allow public read access to events" ON events;
DROP POLICY IF EXISTS "Allow admins to insert/update/delete events" ON events;

-- Crear nuevas políticas
CREATE POLICY "Allow public read access to events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow admins to insert/update/delete events" ON events 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  )
);

-- Insertar datos de ejemplo
INSERT INTO events (title, description, date, location, is_featured) VALUES
('Gala de Premiación 2023', 'La ceremonia anual donde se reconoce a los ganadores de los Premios San Cristóbal.', '2023-12-15 19:00:00+00', 'Teatro Nacional, Ciudad', true),
('Recepción de Nominados', 'Evento exclusivo para los nominados de este año.', '2023-12-01 18:00:00+00', 'Hotel Excelsior, Ciudad', false),
('Conferencia de Prensa', 'Anuncio oficial de los nominados para los Premios San Cristóbal 2023.', '2023-12-10 11:00:00+00', 'Centro de Convenciones, Ciudad', false);
