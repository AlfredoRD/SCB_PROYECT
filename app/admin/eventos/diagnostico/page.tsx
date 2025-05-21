"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Database, Info, Loader2, RefreshCw, Terminal } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DiagnosticoEventosPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [tableInfo, setTableInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [sqlQuery, setSqlQuery] = useState<string>(`
-- Eliminar la tabla events si existe
DROP TABLE IF EXISTS events;

-- Crear tabla de eventos
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

-- Configurar RLS para eventos
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
DROP POLICY IF EXISTS "Allow public read access to events" ON events;
CREATE POLICY "Allow public read access to events" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admins to insert/update/delete events" ON events;
CREATE POLICY "Allow admins to insert/update/delete events" ON events FOR ALL USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Insertar un evento de ejemplo
INSERT INTO events (title, description, date, location, capacity)
VALUES (
  'Gala de Premiación 2024',
  'Ceremonia oficial de entrega de los Premios San Cristóbal 2024',
  '2024-12-15 19:00:00+00',
  'Teatro Nacional, San Cristóbal',
  500
);
  `)

  useEffect(() => {
    checkTable()
  }, [])

  const checkTable = async () => {
    setLoading(true)
    setError(null)

    try {
      // Intentar obtener información sobre la tabla events
      const { data, error: tableError } = await supabase.from("events").select("*").limit(1)

      if (tableError) {
        if (tableError.message.includes("does not exist")) {
          setTableInfo({ exists: false, message: 'La tabla "events" no existe en la base de datos.' })
        } else {
          setTableInfo({
            exists: true,
            error: tableError.message,
            message: "La tabla existe pero hay un error al acceder a ella.",
          })
        }
      } else {
        // La tabla existe, obtener información sobre su estructura
        const { data: columnsData, error: columnsError } = await supabase.rpc("exec_sql", {
          sql_query: `
              SELECT column_name, data_type, is_nullable 
              FROM information_schema.columns 
              WHERE table_name = 'events' 
              ORDER BY ordinal_position;
            `,
        })

        if (columnsError) {
          setTableInfo({
            exists: true,
            error: columnsError.message,
            message: "No se pudo obtener información sobre las columnas de la tabla.",
          })
        } else {
          setTableInfo({
            exists: true,
            columns: columnsData,
            rows: data?.length || 0,
            message: 'La tabla "events" existe en la base de datos.',
          })
        }
      }
    } catch (err) {
      console.error("Error al verificar la tabla:", err)
      setError("Error al verificar la tabla: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  const executeSQL = async () => {
    setExecuting(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: sqlError } = await supabase.rpc("exec_sql", { sql_query: sqlQuery })

      if (sqlError) {
        throw new Error(`Error al ejecutar SQL: ${sqlError.message}`)
      }

      setSuccess("SQL ejecutado correctamente. La tabla ha sido recreada.")

      // Esperar un momento y luego verificar la tabla nuevamente
      setTimeout(() => {
        checkTable()
      }, 1000)
    } catch (err) {
      console.error("Error al ejecutar SQL:", err)
      setError("Error al ejecutar SQL: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Diagnóstico de Tabla de Eventos</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/eventos">Volver a Eventos</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estado de la Tabla
            </CardTitle>
            <CardDescription>
              Información sobre el estado actual de la tabla "events" en la base de datos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <p>Verificando tabla...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : tableInfo ? (
              <div className="space-y-4">
                <Alert variant={tableInfo.exists && !tableInfo.error ? "default" : "warning"}>
                  <Info className="h-4 w-4" />
                  <AlertDescription>{tableInfo.message}</AlertDescription>
                </Alert>

                {tableInfo.exists && tableInfo.columns && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Estructura de la tabla:</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Columna</th>
                            <th className="text-left p-2">Tipo</th>
                            <th className="text-left p-2">Nullable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableInfo.columns.map((column: any, index: number) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{column.column_name}</td>
                              <td className="p-2">{column.data_type}</td>
                              <td className="p-2">{column.is_nullable === "YES" ? "Sí" : "No"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tableInfo.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error en la tabla</AlertTitle>
                    <AlertDescription>{tableInfo.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button onClick={checkTable} variant="outline" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" /> Actualizar
            </Button>
          </CardFooter>
        </Card>

        <Tabs defaultValue="recreate">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recreate">Recrear Tabla</TabsTrigger>
            <TabsTrigger value="custom">SQL Personalizado</TabsTrigger>
          </TabsList>

          <TabsContent value="recreate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Recrear Tabla de Eventos
                </CardTitle>
                <CardDescription>
                  Esta acción eliminará la tabla "events" existente y creará una nueva con la estructura correcta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="warning" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Advertencia</AlertTitle>
                  <AlertDescription>
                    Esta acción eliminará todos los datos existentes en la tabla "events". Esta operación no se puede
                    deshacer.
                  </AlertDescription>
                </Alert>

                <Textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="font-mono text-sm"
                  rows={15}
                />

                {success && (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={executeSQL} disabled={executing || loading} className="flex items-center gap-1">
                  {executing && <Loader2 className="h-4 w-4 animate-spin" />}
                  {executing ? "Ejecutando..." : "Ejecutar SQL"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  SQL Personalizado
                </CardTitle>
                <CardDescription>Ejecuta comandos SQL personalizados para modificar la tabla "events".</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Usa esta opción si necesitas realizar cambios específicos en la estructura de la tabla.
                  </AlertDescription>
                </Alert>

                <Textarea
                  placeholder="-- Escribe tu SQL personalizado aquí"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="font-mono text-sm"
                  rows={15}
                />

                {success && (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={executeSQL} disabled={executing || loading} className="flex items-center gap-1">
                  {executing && <Loader2 className="h-4 w-4 animate-spin" />}
                  {executing ? "Ejecutando..." : "Ejecutar SQL"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
