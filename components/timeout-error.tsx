"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Clock } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface TimeoutErrorProps {
  title?: string
  message?: string
  retryHref?: string
}

export function TimeoutError({
  title = "Error de tiempo de espera",
  message = "La operación ha excedido el tiempo máximo de espera. Esto puede deberse a problemas de conexión o a una carga elevada en el servidor.",
  retryHref,
}: TimeoutErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = () => {
    setIsRetrying(true)
    window.location.reload()
  }

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-red-500" />
          <CardTitle className="text-red-700 dark:text-red-400">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-red-600 dark:text-red-300 mb-4">{message}</p>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-red-100 dark:border-red-800">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Posibles soluciones:</span>
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Recargar la página e intentarlo de nuevo</li>
            <li>Verificar tu conexión a internet</li>
            <li>Intentar acceder más tarde cuando el servidor tenga menos carga</li>
            <li>Usar el modo simple del panel de administración</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex gap-4 justify-end">
        <Button variant="outline" asChild>
          <Link href="/admin/simple">Modo Simple</Link>
        </Button>
        {retryHref ? (
          <Button asChild>
            <Link href={retryHref}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Link>
          </Button>
        ) : (
          <Button onClick={handleRetry} disabled={isRetrying}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Recargando..." : "Reintentar"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
