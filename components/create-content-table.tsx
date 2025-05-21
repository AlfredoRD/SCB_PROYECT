"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/spinner"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"

export function CreateContentTable() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleCreateTable = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/admin/create-content-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Verificar si la respuesta es válida antes de intentar parsearla
      if (!response.ok) {
        const text = await response.text()
        let errorMessage = "Error al crear la tabla de contenido"

        try {
          // Intentar parsear como JSON solo si parece ser JSON
          if (text.trim().startsWith("{")) {
            const data = JSON.parse(text)
            errorMessage = data.error || data.details || errorMessage
          } else {
            console.error("Respuesta no JSON:", text)
          }
        } catch (parseError) {
          console.error("Error al parsear respuesta:", parseError, "Texto:", text)
        }

        throw new Error(errorMessage)
      }

      // Solo parsear como JSON si la respuesta es exitosa
      const data = await response.json()

      toast({
        title: "Tabla creada exitosamente",
        description: "La tabla de contenido ha sido creada correctamente.",
      })

      // Recargar la página después de un breve retraso
      setTimeout(() => {
        router.refresh()
        window.location.href = "/admin/contenido"
      }, 1000)
    } catch (error) {
      console.error("Error al crear tabla de contenido:", error)
      toast({
        variant: "destructive",
        title: "Error al crear tabla",
        description: error.message || "Ha ocurrido un error inesperado",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCreateTable} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Spinner className="mr-2" />
          Creando tabla...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Crear tabla de contenido
        </>
      )}
    </Button>
  )
}
