"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Database } from "lucide-react"
import { CreateEventsTable } from "@/components/create-events-table"
import { useRouter } from "next/navigation"

export function CheckEventsTable() {
  const [showCreateTable, setShowCreateTable] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    // Refrescar la página después de crear la tabla
    setTimeout(() => {
      router.refresh()
    }, 1500)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Tabla de Eventos no encontrada
        </CardTitle>
        <CardDescription>
          La tabla de eventos no existe en la base de datos o no tiene la estructura correcta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para gestionar eventos, primero necesitas crear la tabla correspondiente en la base de datos.
          </AlertDescription>
        </Alert>

        {showCreateTable ? (
          <CreateEventsTable onSuccess={handleSuccess} />
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Al crear la tabla de eventos, podrás:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Añadir nuevos eventos</li>
              <li>Editar eventos existentes</li>
              <li>Eliminar eventos</li>
              <li>Mostrar eventos en la página principal</li>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Volver al Dashboard
        </Button>
        {!showCreateTable && <Button onClick={() => setShowCreateTable(true)}>Crear Tabla de Eventos</Button>}
      </CardFooter>
    </Card>
  )
}
