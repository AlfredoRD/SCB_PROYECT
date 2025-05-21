import { GenreForm } from "@/components/genre-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewGenrePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/generos-artisticos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a géneros artísticos
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Nuevo Género Artístico</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Género</CardTitle>
        </CardHeader>
        <CardContent>
          <GenreForm />
        </CardContent>
      </Card>
    </div>
  )
}
