"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export function FixEventsTableStructure() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fixTableStructure = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    setMessage("")

    try {
      const response = await fetch("/api/admin/fix-events-table-structure", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al corregir la estructura de la tabla")
      }

      const data = await response.json()
      setSuccess(true)
      setMessage(data.message)

      // Esperar un momento y luego refrescar la página
      setTimeout(() => {
        router.refresh()

        // Si estamos en la página de crear evento, redirigir a la página de eventos
        if (window.location.pathname.includes("/crear-nuevo")) {
          router.push("/admin/eventos")
        }
      }, 2000)
    } catch (err) {
      console.error("Error al corregir la estructura:", err)
      setError(err instanceof Error ? err.message : "Error al corregir la estructura de la tabla")
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
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Button onClick={fixTableStructure} disabled={loading || success} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Corrigiendo estructura...
          </>
        ) : success ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Estructura corregida
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Corregir estructura de tabla
          </>
        )}
      </Button>
    </div>
  )
}
