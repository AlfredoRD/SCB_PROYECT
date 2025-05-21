"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Database } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateEventsTableDirect() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const createTable = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/admin/create-events-table-direct", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear la tabla de eventos")
      }

      const data = await response.json()
      setSuccess(true)

      // Esperar un momento y luego refrescar la página
      setTimeout(() => {
        router.refresh()
        router.push("/admin/eventos")
      }, 2000)
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
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>La tabla de eventos ha sido creada correctamente.</AlertDescription>
        </Alert>
      )}

      <Button onClick={createTable} disabled={loading || success} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando tabla...
          </>
        ) : success ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Tabla creada
          </>
        ) : (
          <>
            <Database className="mr-2 h-4 w-4" />
            Crear tabla de eventos
          </>
        )}
      </Button>
    </div>
  )
}
