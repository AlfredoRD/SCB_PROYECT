"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/spinner"
import { Code } from "lucide-react"

export function CreateExecSqlFunction() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleCreateFunction = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/admin/create-exec-sql-function", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const text = await response.text()
        let errorMessage = "Error al crear la función exec_sql"

        try {
          if (text.trim().startsWith("{")) {
            const data = JSON.parse(text)
            errorMessage = data.error || data.details || errorMessage
          }
        } catch (parseError) {
          console.error("Error al parsear respuesta:", parseError)
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()

      setIsSuccess(true)
      toast({
        title: "Función creada exitosamente",
        description: "La función exec_sql ha sido creada correctamente.",
      })
    } catch (error) {
      console.error("Error al crear función:", error)
      toast({
        variant: "destructive",
        title: "Error al crear función",
        description: error.message || "Ha ocurrido un error inesperado",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCreateFunction} disabled={isLoading || isSuccess} className="w-full">
      {isLoading ? (
        <>
          <Spinner className="mr-2" />
          Creando función...
        </>
      ) : isSuccess ? (
        <>
          <Code className="mr-2 h-4 w-4" />
          Función creada correctamente
        </>
      ) : (
        <>
          <Code className="mr-2 h-4 w-4" />
          Crear función exec_sql
        </>
      )}
    </Button>
  )
}
