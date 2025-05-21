-- Eliminar la tabla si existe para recrearla correctamente
DROP TABLE IF EXISTS events;

-- Crear la tabla events con la estructura correcta
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar políticas de seguridad
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Política para administradores (CRUD completo)
DROP POLICY IF EXISTS "Admins can do anything with events" ON events;
CREATE POLICY "Admins can do anything with events"
  ON events
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- Política para usuarios (solo lectura)
DROP POLICY IF EXISTS "Users can view events" ON events;
CREATE POLICY "Users can view events"
  ON events
  FOR SELECT
  USING (true);

-- Insertar algunos eventos de ejemplo
INSERT INTO events (title, description, date, location, image_url, is_featured)
VALUES 
('Ceremonia de Premiación', 'Ceremonia anual de entrega de premios San Cristóbal', '2023-12-15 19:00:00', 'Teatro Nacional', 'https://example.com/images/ceremonia.jpg', true),
('Rueda de Prensa', 'Anuncio de nominados a los premios de este año', '2023-11-01 10:00:00', 'Hotel Sheraton', 'https://example.com/images/prensa.jpg', false),
('Taller de Actuación', 'Taller impartido por reconocidos actores', '2023-10-20 15:00:00', 'Centro Cultural', 'https://example.com/images/taller.jpg', false);
