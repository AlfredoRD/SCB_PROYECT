import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateContentTable } from "@/components/create-content-table"
import { CreateExecSqlFunction } from "@/components/create-exec-sql-function"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Database, Code } from "lucide-react"

export default async function SetupContentPage() {
  const supabase = createServerClient()

  // Verificar si la tabla de contenido existe
  let tableExists = false
  try {
    const { data, error } = await supabase.from("content").select("id").limit(1)
    tableExists = !error
  } catch (error) {
    console.error("Error al verificar tabla content:", error)
  }

  // Verificar si la función exec_sql existe
  let functionExists = false
  try {
    const { error } = await supabase.rpc("exec_sql", { sql_query: "SELECT 1" })
    functionExists = !error || !error.message.includes("function") || !error.message.includes("does not exist")
  } catch (error) {
    console.error("Error al verificar función exec_sql:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Configuración de Contenido</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Panel
          </Link>
        </Button>
      </div>

      {!functionExists && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="mr-2 h-5 w-5" />
              Paso 1: Crear Función SQL
            </CardTitle>
            <CardDescription>
              Primero necesitamos crear una función especial en la base de datos para poder ejecutar comandos SQL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Esta función es necesaria para crear y gestionar la tabla de contenido. Solo se necesita crear una vez.
              </p>
              <CreateExecSqlFunction />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            {functionExists ? "Crear Tabla de Contenido" : "Paso 2: Crear Tabla de Contenido"}
          </CardTitle>
          <CardDescription>
            {functionExists
              ? "Esta herramienta te permite crear la tabla necesaria para gestionar el contenido dinámico del sitio."
              : "Una vez creada la función SQL, podrás crear la tabla de contenido."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tableExists ? (
            <div className="space-y-4">
              <p className="text-green-600 dark:text-green-400">
                ✓ La tabla de contenido ya existe en la base de datos.
              </p>
              <Button asChild>
                <Link href="/admin/contenido">Ir a Gestión de Contenido</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                La tabla de contenido almacenará textos, descripciones y otros elementos del sitio que podrás editar
                desde el panel de administración.
              </p>
              <CreateContentTable />
              {!functionExists && (
                <p className="text-amber-600 text-sm">
                  ⚠️ Primero debes crear la función SQL (Paso 1) antes de poder crear la tabla de contenido.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
