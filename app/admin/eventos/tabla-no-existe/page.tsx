import { CreateEventsTable } from "@/components/create-events-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TablaNoExistePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/eventos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Configuración de Eventos</h2>
      </div>

      <div className="max-w-md mx-auto">
        <CreateEventsTable />
      </div>
    </div>
  )
}
