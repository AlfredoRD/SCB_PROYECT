"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Lightbulb, Heart, Landmark, Music, CircleHelp } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function FeaturedCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const supabase = createClientComponentClient()

  // Mapa de iconos disponibles
  const iconMap = {
    award: <Award className="h-8 w-8 text-primary" />,
    lightbulb: <Lightbulb className="h-8 w-8 text-primary" />,
    heart: <Heart className="h-8 w-8 text-primary" />,
    landmark: <Landmark className="h-8 w-8 text-primary" />,
    music: <Music className="h-8 w-8 text-primary" />,
  }

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("categories").select("*").limit(6)

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [supabase])

  // Función para obtener el icono según el nombre
  const getIcon = (iconName) => {
    return iconMap[iconName?.toLowerCase()] || <CircleHelp className="h-8 w-8 text-primary" />
  }

  return (
    <section className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Categorías Destacadas</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Descubre las diferentes categorías en las que reconocemos la excelencia y el talento excepcional en nuestra
          comunidad.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">Error al cargar categorías: {error}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Próximamente</h3>
          <p className="text-muted-foreground">
            Estamos preparando las categorías para los próximos premios. ¡Vuelve pronto!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/categorias/${category.slug}`} className="block">
              <Card className="h-full category-card hover:border-primary">
                <CardHeader className="pb-2">
                  <div className="mb-2">{getIcon(category.icon)}</div>
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{category.description || "Sin descripción"}</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-primary">Ver nominados →</p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
