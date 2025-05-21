"use client"

import { Button } from "@/components/ui/button"
import { refreshContent } from "@/lib/hooks/use-content"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

export default function ClearContentCacheButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleClearCache = () => {
    setIsLoading(true)
    try {
      refreshContent()
      toast({
        title: "Caché limpiada",
        description: "El contenido se actualizará en la próxima carga.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error al limpiar caché:", error)
      toast({
        title: "Error",
        description: "No se pudo limpiar la caché. Intente nuevamente.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleClearCache} disabled={isLoading} variant="outline" className="ml-2">
      {isLoading ? (
        <>
          <span className="animate-spin mr-2">⟳</span> Actualizando...
        </>
      ) : (
        "Actualizar contenido"
      )}
    </Button>
  )
}
