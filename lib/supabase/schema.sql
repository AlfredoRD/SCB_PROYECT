-- Create tables for the Premios San Cristóbal database

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Nominees table
CREATE TABLE nominees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(255) NOT NULL,
  image_url TEXT,
  avatar_url TEXT,
  tags TEXT[] DEFAULT '{}',
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nominee_id INTEGER REFERENCES nominees(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, nominee_id)
);

-- Events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  image_url TEXT,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for categories
INSERT INTO categories (name, slug, description, icon) VALUES
('Excelencia Académica', 'excelencia-academica', 'Reconociendo logros sobresalientes en educación e investigación', 'Lightbulb'),
('Servicio Comunitario', 'servicio-comunitario', 'Honrando a quienes dedican su tiempo a mejorar la comunidad', 'Heart'),
('Liderazgo', 'liderazgo', 'Celebrando a líderes visionarios que inspiran cambios positivos', 'Landmark'),
('Artes y Cultura', 'artes-cultura', 'Reconociendo contribuciones excepcionales a las artes y la cultura', 'Music'),
('Innovación', 'innovacion', 'Premiando ideas revolucionarias y soluciones creativas', 'Lightbulb'),
('Trayectoria', 'trayectoria', 'Honrando carreras distinguidas y contribuciones duraderas', 'Award'),
('Emprendimiento', 'emprendimiento', 'Reconociendo a emprendedores que transforman ideas en realidades', 'Briefcase'),
('Impacto Social', 'impacto-social', 'Celebrando iniciativas que generan un cambio social positivo', 'Globe');

-- Insert sample data for nominees
INSERT INTO nominees (name, title, description, category, tags) VALUES
('María Rodríguez', 'Investigadora en Neurociencia', 'Pionera en investigaciones sobre el Alzheimer con importantes descubrimientos que han abierto nuevas vías de tratamiento.', 'Excelencia Académica', ARRAY['Neurociencia', 'Investigación', 'Medicina']),
('Juan Pérez', 'Profesor Universitario', 'Reconocido por su innovador método de enseñanza que ha mejorado significativamente el rendimiento académico de sus estudiantes.', 'Excelencia Académica', ARRAY['Educación', 'Innovación', 'Universidad']),
('Fundación Esperanza', 'ONG de Ayuda Comunitaria', 'Organización dedicada a mejorar la calidad de vida en comunidades vulnerables a través de programas educativos y de salud.', 'Servicio Comunitario', ARRAY['ONG', 'Educación', 'Salud']),
('Carlos Gómez', 'Activista Ambiental', 'Líder en iniciativas de conservación ambiental y promotor de políticas sostenibles en la región.', 'Liderazgo', ARRAY['Medio Ambiente', 'Sostenibilidad', 'Activismo']),
('Ana Martínez', 'Directora de Orquesta', 'Reconocida por su extraordinaria contribución a la música clásica y su labor en la promoción de jóvenes talentos.', 'Artes y Cultura', ARRAY['Música', 'Dirección', 'Cultura']),
('TechSolutions', 'Startup Tecnológica', 'Empresa innovadora que ha desarrollado soluciones tecnológicas para mejorar la accesibilidad digital en zonas rurales.', 'Innovación', ARRAY['Tecnología', 'Accesibilidad', 'Rural']),
('Roberto Sánchez', 'Empresario Social', 'Fundador de múltiples iniciativas que combinan el éxito empresarial con un impacto social positivo.', 'Emprendimiento', ARRAY['Negocios', 'Impacto Social', 'Sostenibilidad']),
('Proyecto Futuro', 'Iniciativa Educativa', 'Programa que ha transformado la educación en zonas desfavorecidas, mejorando significativamente las oportunidades de los jóvenes.', 'Impacto Social', ARRAY['Educación', 'Juventud', 'Oportunidades']);

-- Insert sample data for events
INSERT INTO events (title, description, date, location, capacity) VALUES
('Gala de Premiación 2023', 'La ceremonia anual donde se reconoce a los ganadores de los Premios San Cristóbal.', '2023-12-15 19:00:00+00', 'Teatro Nacional, Ciudad', 500),
('Recepción de Nominados', 'Evento exclusivo para los nominados de este año.', '2023-12-01 18:00:00+00', 'Hotel Excelsior, Ciudad', 100),
('Conferencia de Prensa', 'Anuncio oficial de los nominados para los Premios San Cristóbal 2023.', '2023-12-10 11:00:00+00', 'Centro de Convenciones, Ciudad', 50);

-- Create RLS policies
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Nominees policies
CREATE POLICY "Allow public read access to nominees" ON nominees FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert nominees" ON nominees FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Votes policies
CREATE POLICY "Allow authenticated users to vote" ON votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow users to see their own votes" ON votes FOR SELECT USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);

-- Events policies
CREATE POLICY "Allow public read access to events" ON events FOR SELECT USING (true);

-- Create function to update nominee vote count
CREATE OR REPLACE FUNCTION update_nominee_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE nominees SET votes_count = votes_count + 1 WHERE id = NEW.nominee_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE nominees SET votes_count = votes_count - 1 WHERE id = OLD.nominee_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update nominee vote count
CREATE TRIGGER update_nominee_votes_count_trigger
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_nominee_votes_count();
