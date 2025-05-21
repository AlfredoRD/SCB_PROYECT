import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Trash } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Eliminar Contenido | Premios San Cristóbal",
  description: "Eliminar sección de contenido",
}

async function deleteContent(id: string) {
  "use server"

  const supabase = createServerClient()

  // Verificar si es una sección predefinida
  const { data: content } = await supabase.from("content").select("section").eq("id", id).single()

  // No permitir eliminar secciones predefinidas
  const predefinedSections = ["home", "about", "events", "footer"]
  if (content && predefinedSections.includes(content.section)) {
    return {
      success: false,
      error: "No se pueden eliminar secciones predefinidas",
    }
  }

  // Eliminar la sección
  const { error } = await supabase.from("content").delete().eq("id", id)

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  redirect("/admin/contenido")
}

export default async function DeleteContentPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  // Obtener la sección de contenido por ID
  const { data: content, error } = await supabase.from("content").select("*").eq("id", params.id).single()

  // Si no se encuentra la sección, mostrar 404
  if (error || !content) {
    console.error("Error al obtener contenido:", error)
    notFound()
  }

  // Verificar si es una sección predefinida
  const predefinedSections = ["home", "about", "events", "footer"]
  const isPredefined = predefinedSections.includes(content.section)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Eliminar Contenido</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">¿Eliminar esta sección de contenido?</CardTitle>
          <CardDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la sección "{content.title}".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Título:</p>
              <p className="text-muted-foreground">{content.title}</p>
            </div>
            <div>
              <p className="font-medium">Sección:</p>
              <p className="text-muted-foreground">{content.section}</p>
            </div>

            {isPredefined && (
              <div className="bg-destructive/10 p-4 rounded-md border border-destructive">
                <p className="text-destructive font-medium">
                  No se puede eliminar esta sección porque es una sección predefinida del sistema.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/admin/contenido">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Link>
          </Button>

          <form action={deleteContent.bind(null, content.id)}>
            <Button type="submit" variant="destructive" disabled={isPredefined}>
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
