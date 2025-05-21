-- Crear tabla de eventos si no existe
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  location TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar políticas de seguridad (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Política para permitir a los administradores hacer todo
CREATE POLICY admin_all_events ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Política para permitir a todos los usuarios leer eventos
CREATE POLICY read_events ON events
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insertar algunos eventos de ejemplo si la tabla está vacía
INSERT INTO events (title, description, date, location, image_url)
SELECT 
  'Ceremonia de Premiación', 
  'Ceremonia anual de entrega de premios a los mejores artistas del año.', 
  (CURRENT_DATE + INTERVAL '30 days')::DATE, 
  'Teatro Nacional', 
  'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=2070'
WHERE NOT EXISTS (SELECT 1 FROM events LIMIT 1);

INSERT INTO events (title, description, date, location, image_url)
SELECT 
  'Nominaciones Oficiales', 
  'Anuncio oficial de los nominados a las diferentes categorías de premios.', 
  (CURRENT_DATE + INTERVAL '15 days')::DATE, 
  'Centro Cultural', 
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070'
WHERE NOT EXISTS (SELECT 1 FROM events LIMIT 1);

INSERT INTO events (title, description, date, location, image_url)
SELECT 
  'Gala de Apertura', 
  'Evento de apertura de la temporada de premios con presentaciones especiales.', 
  (CURRENT_DATE + INTERVAL '7 days')::DATE, 
  'Auditorio Municipal', 
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070'
WHERE NOT EXISTS (SELECT 1 FROM events LIMIT 1);
