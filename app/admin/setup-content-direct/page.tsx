import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateContentTableDirect } from "@/components/create-content-table-direct"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Database } from "lucide-react"

export default async function SetupContentDirectPage() {
  const supabase = createServerClient()

  // Verificar si la tabla de contenido existe
  let tableExists = false
  try {
    const { data, error } = await supabase.from("content").select("id").limit(1)
    tableExists = !error
  } catch (error) {
    console.error("Error al verificar tabla content:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Configuración de Contenido (Método Directo)</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Panel
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Crear Tabla de Contenido
          </CardTitle>
          <CardDescription>
            Esta herramienta te permite crear la tabla necesaria para gestionar el contenido dinámico del sitio.
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
                Este método crea la tabla de contenido directamente, sin necesidad de la función exec_sql.
              </p>
              <CreateContentTableDirect />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
