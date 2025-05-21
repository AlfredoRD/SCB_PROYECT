-- Tabla para géneros artísticos
CREATE TABLE IF NOT EXISTS artistic_genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para miembros de la academia
CREATE TABLE IF NOT EXISTS academy_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  genre_id INTEGER REFERENCES artistic_genres(id) ON DELETE CASCADE,
  bio TEXT,
  photo_url TEXT,
  social_media JSONB,
  achievements TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_academy_members_genre_id ON academy_members(genre_id);
CREATE INDEX IF NOT EXISTS idx_artistic_genres_slug ON artistic_genres(slug);

-- Trigger para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artistic_genres_updated_at
BEFORE UPDATE ON artistic_genres
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academy_members_updated_at
BEFORE UPDATE ON academy_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad
ALTER TABLE artistic_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_members ENABLE ROW LEVEL SECURITY;

-- Políticas para géneros artísticos
CREATE POLICY "Allow public read access to artistic_genres" ON artistic_genres FOR SELECT USING (true);
CREATE POLICY "Allow admin to manage artistic_genres" ON artistic_genres USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  )
);

-- Políticas para miembros de la academia
CREATE POLICY "Allow public read access to academy_members" ON academy_members FOR SELECT USING (true);
CREATE POLICY "Allow admin to manage academy_members" ON academy_members USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  )
);

-- Datos de ejemplo para géneros artísticos
INSERT INTO artistic_genres (name, slug, description, icon) VALUES
('Danza', 'danza', 'Bailarines y coreógrafos destacados en diferentes estilos de danza', 'Music'),
('Música', 'musica', 'Cantantes, compositores e intérpretes de diversos géneros musicales', 'Music'),
('Teatro', 'teatro', 'Actores, directores y dramaturgos de artes escénicas', 'Film'),
('Artes Visuales', 'artes-visuales', 'Pintores, escultores, fotógrafos y artistas visuales', 'Image'),
('Literatura', 'literatura', 'Escritores, poetas y narradores destacados', 'BookOpen');

-- Datos de ejemplo para miembros de la academia
INSERT INTO academy_members (name, genre_id, bio, achievements, is_active) VALUES
('María González', 1, 'Reconocida bailarina con más de 15 años de experiencia en ballet clásico y contemporáneo.', ARRAY['Premio Nacional de Danza 2019', 'Medalla de Oro en Festival Internacional'], true),
('Carlos Rodríguez', 1, 'Innovador coreógrafo especializado en fusión de estilos tradicionales y modernos.', ARRAY['Mejor Coreografía 2020', 'Director Artístico del Ballet Nacional'], true),
('Ana Martínez', 2, 'Soprano con trayectoria internacional en las principales casas de ópera.', ARRAY['Grammy Latino 2018', 'Reconocimiento a la Excelencia Musical'], false),
('Roberto Sánchez', 3, 'Versátil actor con experiencia en cine, televisión y teatro.', ARRAY['Premio al Mejor Actor 2021', 'Director de la Compañía Nacional de Teatro'], true);
