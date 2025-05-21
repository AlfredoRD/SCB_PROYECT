import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { GenreCard } from "@/components/genre-card"
import { EmptyState } from "@/components/empty-state"

export const dynamic = "force-dynamic"

export default async function AcademiaPage() {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Obtener todos los géneros artísticos
    const { data: genres, error: genresError } = await supabase.from("artistic_genres").select("*")

    if (genresError) {
      console.error("Error fetching genres:", genresError)
      return <EmptyState title="Error" description="No se pudieron cargar los géneros artísticos." />
    }

    // Si no hay géneros, mostrar un estado vacío
    if (!genres || genres.length === 0) {
      return (
        <EmptyState
          title="No hay géneros artísticos"
          description="Aún no se han agregado géneros artísticos a la base de datos."
        />
      )
    }

    // Obtener el conteo de miembros por género usando una consulta separada para cada género
    const genresWithCounts = await Promise.all(
      genres.map(async (genre) => {
        const { count, error } = await supabase
          .from("academy_members")
          .select("*", { count: "exact", head: true })
          .eq("genre_id", genre.id)

        return {
          ...genre,
          memberCount: error ? 0 : count || 0,
        }
      }),
    )

    // Imprimir los géneros para depuración
    console.log(
      "Géneros cargados:",
      genresWithCounts.map((g) => ({ id: g.id, name: g.name, icon: g.icon })),
    )

    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Academia de Artes y Ciencias</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {genresWithCounts.map((genre) => (
            <GenreCard key={genre.id} genre={genre} memberCount={genre.memberCount} />
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error en la página de academia:", error)
    return (
      <EmptyState
        title="Error"
        description="Ocurrió un error al cargar la página. Por favor, inténtelo de nuevo más tarde."
      />
    )
  }
}
