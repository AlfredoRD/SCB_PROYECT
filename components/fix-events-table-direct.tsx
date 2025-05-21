"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, Database } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function FixEventsTableDirect() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)
  const router = useRouter()

  const fixTable = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    setNeedsSetup(false)

    try {
      const response = await fetch("/api/admin/fix-events-table-direct", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needsSetup) {
          setNeedsSetup(true)
        }
        throw new Error(data.error || "Error al reparar la tabla de eventos")
      }

      setSuccess(true)

      // Esperar un momento y luego refrescar la página
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (err) {
      console.error("Error al reparar la tabla de eventos:", err)
      setError(err instanceof Error ? err.message : "Error al reparar la tabla de eventos")
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
          <AlertDescription>La tabla de eventos ha sido reparada correctamente. Redirigiendo...</AlertDescription>
        </Alert>
      )}

      {needsSetup ? (
        <div className="space-y-4">
          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
            <Database className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              Se requiere configuración adicional de la base de datos. Por favor, ve a la página de configuración.
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link href="/admin/setup-database">
              <Database className="mr-2 h-4 w-4" />
              Ir a Configuración de Base de Datos
            </Link>
          </Button>
        </div>
      ) : (
        <Button onClick={fixTable} disabled={loading || success} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {success ? "Tabla reparada" : "Reparar tabla de eventos"}
        </Button>
      )}
    </div>
  )
}
