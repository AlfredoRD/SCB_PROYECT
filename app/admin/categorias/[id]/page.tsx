import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CategoryForm } from "@/components/category-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditCategoryPageProps {
  params: {
    id: string
  }
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const supabase = createServerClient()
  const categoryId = Number.parseInt(params.id)

  if (isNaN(categoryId)) {
    notFound()
  }

  // Obtener la categoría
  const { data: category, error } = await supabase.from("categories").select("*").eq("id", categoryId).single()

  if (error || !category) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/categorias">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a categorías
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Editar Categoría</h2>
      </div>

      <CategoryForm initialData={category} />
    </div>
  )
}
