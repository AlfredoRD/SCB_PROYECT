"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"
import { Spinner } from "@/components/spinner"
import { useToast } from "@/components/ui/use-toast"

export function CreateVotesTable() {
  const [isCreating, setIsCreating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleCreateTables = async () => {
    setIsCreating(true)
    setIsSuccess(false)

    try {
      const response = await fetch("/api/admin/create-tables", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al crear las tablas")
      }

      setIsSuccess(true)
      toast({
        title: "Tablas creadas correctamente",
        description: "Las tablas necesarias para gestionar votaciones han sido creadas.",
      })

      // Recargar la página después de 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Error al crear tablas:", error)
      toast({
        variant: "destructive",
        title: "Error al crear tablas",
        description: error.message || "Ha ocurrido un error inesperado",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Button onClick={handleCreateTables} disabled={isCreating || isSuccess} className="w-full max-w-md">
        {isCreating ? (
          <>
            <Spinner className="mr-2" />
            Creando tablas...
          </>
        ) : isSuccess ? (
          <>
            <Database className="mr-2 h-4 w-4" />
            Tablas creadas correctamente
          </>
        ) : (
          <>
            <Database className="mr-2 h-4 w-4" />
            Crear tablas de votaciones
          </>
        )}
      </Button>
      {isSuccess && <p className="text-sm text-muted-foreground mt-2">Recargando página...</p>}
    </div>
  )
}
