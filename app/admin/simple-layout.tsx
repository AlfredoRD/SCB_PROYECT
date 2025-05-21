import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SimpleAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container py-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Panel de Administración (Modo Simple)</h1>
      </div>

      <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md mb-8">
        <p className="text-yellow-800 dark:text-yellow-400">
          Estás viendo el panel de administración en modo simple debido a problemas de rendimiento. Algunas
          funcionalidades pueden estar limitadas.
        </p>
      </div>

      <div>{children}</div>
    </div>
  )
}
