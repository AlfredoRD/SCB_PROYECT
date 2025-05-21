"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateEventsTableSimple() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const createTable = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/create-events-table-simple", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear la tabla de eventos")
      }

      // Esperar un momento y luego refrescar la página
      setTimeout(() => {
        router.refresh()
        router.push("/admin/eventos")
      }, 1000)
    } catch (err) {
      console.error("Error al crear la tabla:", err)
      setError(err instanceof Error ? err.message : "Error al crear la tabla de eventos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={createTable} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando tabla...
          </>
        ) : (
          "Crear tabla de eventos"
        )}
      </Button>
    </div>
  )
}
