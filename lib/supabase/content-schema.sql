-- Crear la tabla de contenido si no existe
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  section VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas por sección
CREATE INDEX IF NOT EXISTS idx_content_section ON content(section);

-- Crear trigger para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger a la tabla content
DROP TRIGGER IF EXISTS set_content_updated_at ON content;
CREATE TRIGGER set_content_updated_at
BEFORE UPDATE ON content
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insertar contenido inicial para las secciones principales si no existen
INSERT INTO content (section, title, content)
VALUES 
  ('home', 'Página Principal', '{"hero_title":"Premios San Cristóbal","hero_subtitle":"Celebrando la excelencia artística","hero_description":"Los Premios San Cristóbal reconocen y celebran el talento y la creatividad en las artes.","cta_button":"Conoce a los nominados"}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO content (section, title, content)
VALUES 
  ('about', 'Acerca De', '{"title":"Acerca de los Premios","description":"Los Premios San Cristóbal fueron creados para reconocer la excelencia en las artes y la cultura.","mission":"Nuestra misión es promover y celebrar el talento artístico en todas sus formas.","vision":"Buscamos ser el reconocimiento más prestigioso en el ámbito cultural y artístico."}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO content (section, title, content)
VALUES 
  ('events', 'Eventos', '{"title":"Próximos Eventos","description":"Calendario de eventos relacionados con los Premios San Cristóbal.","upcoming_title":"Gala de Premiación","upcoming_description":"Ceremonia de entrega de los Premios San Cristóbal."}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO content (section, title, content)
VALUES 
  ('footer', 'Pie de Página', '{"copyright":"© 2023 Premios San Cristóbal. Todos los derechos reservados.","address":"Av. Principal #123, Ciudad","phone":"+1 234 567 890","email":"contacto@premiossancristobal.com"}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- Configurar políticas de seguridad (RLS)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Política para permitir a los administradores hacer cualquier operación
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

-- Política para permitir a todos los usuarios leer el contenido
DROP POLICY IF EXISTS read_all ON content;
CREATE POLICY read_all ON content
  FOR SELECT
  TO anon, authenticated
  USING (true);
