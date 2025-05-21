-- Función para ejecutar SQL dinámico (solo para administradores)
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si el usuario es administrador
  IF (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin' THEN
    EXECUTE sql_query;
  ELSE
    RAISE EXCEPTION 'Permiso denegado: Solo los administradores pueden ejecutar SQL dinámico';
  END IF;
END;
$$;

-- Establecer permisos para la función
REVOKE ALL ON FUNCTION exec_sql FROM PUBLIC;
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;

-- Crear tabla de eventos
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  image_url TEXT,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Configurar RLS para eventos
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to events" ON events;
DROP POLICY IF EXISTS "Allow admins to insert/update/delete events" ON events;
CREATE POLICY "Allow public read access to events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow admins to insert/update/delete events" ON events FOR ALL USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Insertar un evento real
INSERT INTO events (title, description, date, location, capacity)
VALUES (
  'Gala de Premiación 2024',
  'Ceremonia oficial de entrega de los Premios San Cristóbal 2024',
  '2024-12-15 19:00:00+00',
  'Teatro Nacional, San Cristóbal',
  500
)
ON CONFLICT DO NOTHING;

-- Actualizar la tabla de votos para incluir un campo de timestamp
ALTER TABLE votes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Crear una función para verificar si un voto puede ser eliminado (dentro de las 2 horas)
CREATE OR REPLACE FUNCTION can_delete_vote(vote_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  vote_time TIMESTAMP WITH TIME ZONE;
  time_diff INTERVAL;
BEGIN
  -- Obtener el timestamp del voto
  SELECT created_at INTO vote_time FROM votes WHERE id = vote_id;
  
  -- Calcular la diferencia de tiempo
  time_diff := NOW() - vote_time;
  
  -- Verificar si han pasado menos de 2 horas
  RETURN EXTRACT(EPOCH FROM time_diff) < 7200; -- 7200 segundos = 2 horas
END;
$$ LANGUAGE plpgsql;

-- Crear una política RLS para permitir eliminar votos solo dentro de las 2 horas
DROP POLICY IF EXISTS "Allow users to delete their own votes within 2 hours" ON votes;
CREATE POLICY "Allow users to delete their own votes within 2 hours" 
ON votes FOR DELETE 
USING (
  auth.uid() = user_id AND can_delete_vote(id)
);

-- Actualizar el trigger para manejar la eliminación de votos
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

-- Asegurarse de que el trigger existe
DROP TRIGGER IF EXISTS update_nominee_votes_count_trigger ON votes;
CREATE TRIGGER update_nominee_votes_count_trigger
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_nominee_votes_count();
