import { CategoryForm } from "@/components/category-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/categorias">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a categorías
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Nueva Categoría</h2>
      </div>

      <CategoryForm />
    </div>
  )
}
