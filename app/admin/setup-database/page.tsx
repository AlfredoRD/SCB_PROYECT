import { CreateDatabaseTables } from "@/components/create-database-tables"
import { CreateEventsTableDirect } from "@/components/create-events-table-direct"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Database } from "lucide-react"
import Link from "next/link"

export default function SetupDatabasePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al panel
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Configuración de Base de Datos</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Tabla de Eventos
          </CardTitle>
          <CardDescription>
            Esta herramienta te permite crear o reparar la tabla necesaria para gestionar los eventos del sitio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Si estás experimentando problemas con la tabla de eventos, puedes recrearla utilizando el botón a
            continuación. Esto solucionará problemas de estructura pero{" "}
            <strong>eliminará todos los eventos existentes</strong>.
          </p>
          <CreateEventsTableDirect />
          <Button asChild variant="outline" className="w-full mt-2">
            <Link href="/admin/eventos">Ir a Gestión de Eventos</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Configuración Completa de Base de Datos
          </CardTitle>
          <CardDescription>
            Esta herramienta te permite crear todas las tablas necesarias para el funcionamiento del sitio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Si estás configurando el sitio por primera vez o necesitas recrear todas las tablas, utiliza esta opción.
              <strong className="text-amber-600 block mt-2">
                ⚠️ Advertencia: Esto eliminará todas las tablas existentes y sus datos.
              </strong>
            </p>
            <CreateDatabaseTables />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
