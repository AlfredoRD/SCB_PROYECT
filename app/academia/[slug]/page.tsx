import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Database } from "@/lib/database.types"

interface GenrePageProps {
  params: {
    slug: string
  }
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { slug } = params
  const supabase = createServerComponentClient<Database>({ cookies })

  // Verificar si las tablas existen
  const { error: tableCheckError } = await supabase.from("artistic_genres").select("count").limit(1)
  const tablesExist = !tableCheckError || !tableCheckError.message.includes("does not exist")

  // Si las tablas no existen, redirigir a la página principal de academia
  if (!tablesExist) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Género Artístico</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            La información sobre este género artístico no está disponible actualmente.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 max-w-2xl mx-auto">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3 text-left">
                <h3 className="text-lg font-medium text-yellow-800">Sección en construcción</h3>
                <div className="mt-2 text-yellow-700">
                  <p className="text-base">
                    La sección de Academia está en proceso de configuración. El administrador debe crear las tablas
                    necesarias desde el panel de administración.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button asChild variant="outline">
              <Link href="/academia">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Academia
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Obtener el género por slug
  const { data: genre, error: genreError } = await supabase
    .from("artistic_genres")
    .select("*")
    .eq("slug", slug)
    .single()

  if (genreError) {
    console.error("Error al cargar género:", genreError)
    return notFound()
  }

  // Obtener los miembros del género
  const { data: members, error: membersError } = await supabase
    .from("academy_members")
    .select("*")
    .eq("genre_id", genre.id)
    .order("name")

  if (membersError) {
    console.error("Error al cargar miembros:", membersError)
    return <div className="container mx-auto px-4 py-8">Error al cargar los miembros.</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button asChild variant="outline" className="mb-6">
          <Link href="/academia">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Academia
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-4">{genre.name}</h1>
        <p className="text-xl text-gray-600 mb-2">{genre.description}</p>
        <p className="text-gray-500">
          {members.length} miembro{members.length !== 1 ? "s" : ""}
        </p>
      </div>

      {members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="h-48 relative">
                  {member.photo_url ? (
                    <Image
                      src={member.photo_url || "/placeholder.svg"}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{member.name}</h2>
                  <p className="text-gray-600 line-clamp-3 mb-4">{member.bio}</p>
                  <Button asChild>
                    <Link href={`/academia/miembro/${member.id}`}>Ver Perfil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No hay miembros registrados en este género.</p>
        </div>
      )}
    </div>
  )
}
