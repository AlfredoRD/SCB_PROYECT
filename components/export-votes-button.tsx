"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ExportVotesButtonProps {
  searchParams?: {
    category?: string
    date?: string
    search?: string
  }
}

export function ExportVotesButton({ searchParams = {} }: ExportVotesButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Construir URL con parámetros de búsqueda
      const queryParams = new URLSearchParams()

      if (searchParams.category && searchParams.category !== "all") {
        queryParams.append("category", searchParams.category)
      }

      if (searchParams.date) {
        queryParams.append("date", searchParams.date)
      }

      if (searchParams.search) {
        queryParams.append("search", searchParams.search)
      }

      const url = `/api/admin/export-votes?${queryParams.toString()}`

      // Descargar el archivo
      const response = await fetch(url)

      if (!response.ok) {
        let errorMessage = "Error al exportar votos"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // Si no podemos parsear la respuesta como JSON, usamos el mensaje por defecto
        }
        throw new Error(errorMessage)
      }

      // Crear un blob con la respuesta
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `votos_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      toast({
        title: "Exportación completada",
        description: "Los votos han sido exportados exitosamente",
      })
    } catch (error) {
      console.error("Error al exportar:", error)
      toast({
        variant: "destructive",
        title: "Error al exportar",
        description: error.message || "No se pudo exportar los votos. Inténtalo de nuevo.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      <Download className="mr-2 h-4 w-4" />
      {isExporting ? "Exportando..." : "Exportar"}
    </Button>
  )
}
