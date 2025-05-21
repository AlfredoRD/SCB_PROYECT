"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export function RefreshSchemaCache() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const refreshCache = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/admin/refresh-schema-cache", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al refrescar la caché del esquema")
      }

      setSuccess(true)

      // Esperar un momento y luego refrescar la página
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (err) {
      console.error("Error al refrescar la caché:", err)
      setError(err instanceof Error ? err.message : "Error al refrescar la caché del esquema")
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

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>La caché del esquema ha sido actualizada correctamente. Redirigiendo...</AlertDescription>
        </Alert>
      )}

      <Button onClick={refreshCache} disabled={loading || success} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Actualizando caché...
          </>
        ) : success ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Caché actualizada
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar caché del esquema
          </>
        )}
      </Button>
    </div>
  )
}
