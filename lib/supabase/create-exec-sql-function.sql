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
