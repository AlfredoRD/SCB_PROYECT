import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ContentForm } from "@/components/content-form"

export default async function EditContentPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  // Obtener la sección de contenido por ID
  const { data: content, error } = await supabase.from("content").select("*").eq("id", params.id).single()

  // Si no se encuentra la sección, mostrar 404
  if (error || !content) {
    console.error("Error al obtener contenido:", error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Contenido: {content.title}</h1>
      <ContentForm initialData={content} />
    </div>
  )
}
