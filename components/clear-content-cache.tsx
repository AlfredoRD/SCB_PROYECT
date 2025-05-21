"use client"

import { Button } from "@/components/ui/button"
import { refreshContent } from "@/lib/hooks/use-content"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { RefreshCw } from "lucide-react"

export function ClearContentCache({ section }: { section?: string }) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleClearCache = () => {
    setIsRefreshing(true)

    try {
      refreshContent(section)
      toast({
        title: "Caché limpiada",
        description: "El contenido se actualizará inmediatamente en todas las páginas.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error al limpiar la caché:", error)
      toast({
        title: "Error",
        description: "No se pudo limpiar la caché. Intenta de nuevo.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setTimeout(() => {
        setIsRefreshing(false)
      }, 500)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClearCache}
      disabled={isRefreshing}
      className="ml-auto flex items-center gap-1"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      Actualizar contenido
    </Button>
  )
}
