"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "lucide-react"
import { Spinner } from "@/components/spinner"

export function CreateDatabaseTables() {
  const [isCreating, setIsCreating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>("Iniciando")
  const { toast } = useToast()

  const createTables = async () => {
    setIsCreating(true)
    try {
      // Paso 1: Crear las tablas mediante la API
      setCurrentStep("Creando tablas mediante API")

      const response = await fetch("/api/admin/create-tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Error al crear tablas mediante API: ${errorData.error || response.statusText}`)
      }

      setCurrentStep("Tablas creadas correctamente")
      setIsSuccess(true)

      toast({
        title: "Tablas creadas correctamente",
        description: "Las tablas han sido creadas y configuradas con éxito.",
      })

      // Recargar la página después de 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Error:", error)
      toast({
        variant: "destructive",
        title: "Error al crear las tablas",
        description: error.message || "Ha ocurrido un error al crear las tablas en la base de datos.",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear tablas en la base de datos</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Es necesario crear las tablas en la base de datos. Haga clic en el botón para crear las tablas y configurar
          las políticas de seguridad necesarias.
        </p>
        {isCreating && (
          <div className="p-4 bg-muted rounded-md mb-4">
            <p className="text-sm font-medium">Estado: {currentStep}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={createTables} disabled={isCreating || isSuccess} className="w-full">
          {isCreating ? (
            <>
              <Spinner className="mr-2" />
              Creando tablas...
            </>
          ) : isSuccess ? (
            <>
              <Database className="mr-2 h-4 w-4" />
              Tablas creadas
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Crear tablas en la base de datos
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
