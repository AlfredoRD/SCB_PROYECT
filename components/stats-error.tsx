"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, BarChart } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface StatsErrorProps {
  title?: string
  message?: string
}

export function StatsError({
  title = "Error al cargar estadísticas",
  message = "Ha ocurrido un error al cargar las estadísticas. Por favor, intenta recargar la página o ver las estadísticas básicas.",
}: StatsErrorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRefresh = () => {
    setIsLoading(true)
    window.location.reload()
  }

  const handleSimpleStats = () => {
    setIsLoading(true)
    router.push("/admin/estadisticas/simple")
  }

  return (
    <div className="bg-destructive/10 p-6 rounded-md text-destructive flex flex-col items-center justify-center space-y-4">
      <AlertCircle className="h-12 w-12" />
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-center">{message}</p>
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Recargar página
        </Button>
        <Button variant="default" onClick={handleSimpleStats} disabled={isLoading}>
          <BarChart className="mr-2 h-4 w-4" />
          Ver estadísticas básicas
        </Button>
      </div>
    </div>
  )
}
