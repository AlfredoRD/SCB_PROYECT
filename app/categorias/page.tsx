import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AwardIcon, LightbulbIcon, HeartIcon, LandmarkIcon, MusicIcon, BriefcaseIcon, GlobeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"

export default async function CategoriasPage() {
  const supabase = createServerClient()

  // Obtener categorías de la base de datos
  const { data: categories, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error al obtener categorías:", error)
  }

  // Función para obtener el icono correspondiente
  const getIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "lightbulb":
        return <LightbulbIcon className="h-10 w-10 text-primary" />
      case "heart":
        return <HeartIcon className="h-10 w-10 text-primary" />
      case "landmark":
        return <LandmarkIcon className="h-10 w-10 text-primary" />
      case "music":
        return <MusicIcon className="h-10 w-10 text-primary" />
      case "award":
        return <AwardIcon className="h-10 w-10 text-primary" />
      case "briefcase":
        return <BriefcaseIcon className="h-10 w-10 text-primary" />
      case "globe":
        return <GlobeIcon className="h-10 w-10 text-primary" />
      default:
        return <AwardIcon className="h-10 w-10 text-primary" />
    }
  }

  // Obtener conteo de nominados por categoría
  const { data: nominees } = await supabase.from("nominees").select("category")

  // Crear un objeto con el conteo de nominados por categoría
  const nomineesCountByCategory: Record<string, number> = {}

  if (nominees) {
    nominees.forEach((nominee) => {
      if (nominee.category) {
        nomineesCountByCategory[nominee.category] = (nomineesCountByCategory[nominee.category] || 0) + 1
      }
    })
  }

  return (
    <div className="container py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Categorías</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explora las diferentes categorías de los Premios San Cristóbal y conoce a los nominados en cada una de ellas.
        </p>
      </div>

      {!categories || categories.length === 0 ? (
        <EmptyState
          icon={<AwardIcon className="h-16 w-16 text-muted-foreground" />}
          title="No hay categorías disponibles"
          description="Actualmente no hay categorías disponibles. Por favor, vuelve más tarde."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <div className="mb-4 flex justify-center">{getIcon(category.icon)}</div>
                <CardTitle className="text-center">{category.name}</CardTitle>
                <CardDescription className="text-center">{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-sm text-muted-foreground">
                  <p>{nomineesCountByCategory[category.name] || 0} nominados en esta categoría</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pb-6">
                <Button asChild>
                  <Link href={`/categorias/${category.slug}`}>Ver Nominados</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
