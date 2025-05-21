"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Database, CheckCircle2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateEventsTable() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleCreateTable = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/admin/create-events-table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la tabla de eventos")
      }

      setSuccess(true)
      toast({
        title: "Tabla creada",
        description: "La tabla de eventos ha sido creada correctamente.",
      })

      // Refrescar la página después de un breve retraso
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la tabla de eventos",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button size="lg" onClick={handleCreateTable} disabled={loading || success} className="w-full max-w-xs">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creando tabla...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Tabla creada
          </>
        ) : (
          <>
            <Database className="mr-2 h-4 w-4" />
            Crear tabla de eventos
          </>
        )}
      </Button>

      {error && (
        <div className="flex items-center text-destructive text-sm">
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center text-green-600 text-sm">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Tabla creada correctamente. Redirigiendo...
        </div>
      )}
    </div>
  )
}
