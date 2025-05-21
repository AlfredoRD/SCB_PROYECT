"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Film, BookOpen, Users, CircleHelp } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function FeaturedGenres() {
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const supabase = createClientComponentClient()

  // Mapa de iconos disponibles
  const iconMap = {
    music: <Music className="h-8 w-8 text-primary" />,
    film: <Film className="h-8 w-8 text-primary" />,
    bookopen: <BookOpen className="h-8 w-8 text-primary" />,
    users: <Users className="h-8 w-8 text-primary" />,
  }

  useEffect(() => {
    async function fetchGenres() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("artistic_genres").select("*").limit(3)

        if (error) throw error
        setGenres(data || [])
      } catch (error) {
        console.error("Error fetching genres:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGenres()
  }, [supabase])

  // Función para obtener el icono según el nombre
  const getIcon = (iconName) => {
    return iconMap[iconName?.toLowerCase()] || <CircleHelp className="h-8 w-8 text-primary" />
  }

  return (
    <section className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Géneros Artísticos</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explora los diferentes géneros artísticos representados en nuestra academia y descubre a sus miembros
          destacados.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">Error al cargar géneros: {error}</p>
        </div>
      ) : genres.length === 0 ? (
        <div className="text-center py-12">
          <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Próximamente</h3>
          <p className="text-muted-foreground">
            Estamos preparando información sobre los géneros artísticos. ¡Vuelve pronto!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {genres.map((genre) => (
              <Link key={genre.id} href={`/academia/${genre.slug}`} className="block">
                <Card className="h-full genre-card hover:border-primary">
                  <CardHeader className="pb-2">
                    <div className="mb-2">{getIcon(genre.icon)}</div>
                    <CardTitle>{genre.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">{genre.description || "Sin descripción"}</p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-primary">Ver miembros →</p>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link href="/academia">
              <Button variant="outline" size="lg">
                Ver todos los géneros
              </Button>
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
