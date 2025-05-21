import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { GenreForm } from "@/components/genre-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditGenrePageProps {
  params: {
    id: string
  }
}

export default async function EditGenrePage({ params }: EditGenrePageProps) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener el género por ID
  const { data: genre, error } = await supabase.from("artistic_genres").select("*").eq("id", params.id).single()

  if (error || !genre) {
    console.error("Error al obtener género:", error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/generos-artisticos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a géneros artísticos
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Editar Género Artístico</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Género</CardTitle>
        </CardHeader>
        <CardContent>
          <GenreForm initialData={genre} />
        </CardContent>
      </Card>
    </div>
  )
}
