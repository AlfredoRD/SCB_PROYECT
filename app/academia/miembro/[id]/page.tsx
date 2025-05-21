import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Award, ExternalLink, Globe, Mail, MapPin, Phone } from "lucide-react"
import type { Database } from "@/lib/database.types"

interface MemberPageProps {
  params: {
    id: string
  }
}

export default async function MemberPage({ params }: MemberPageProps) {
  const { id } = params
  const supabase = createServerComponentClient<Database>({ cookies })

  // Verificar si las tablas existen
  const { error: tableCheckError } = await supabase.from("academy_members").select("count").limit(1)
  const tablesExist = !tableCheckError || !tableCheckError.message.includes("does not exist")

  // Si las tablas no existen, mostrar un mensaje
  if (!tablesExist) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Miembro de Academia</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            La información sobre este miembro no está disponible actualmente.
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

  // Obtener el miembro por ID
  const { data: member, error: memberError } = await supabase
    .from("academy_members")
    .select(`
      *,
      artistic_genres:genre_id (
        id,
        name,
        slug
      )
    `)
    .eq("id", id)
    .single()

  if (memberError) {
    console.error("Error al cargar miembro:", memberError)
    return notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button asChild variant="outline" className="mb-8">
        <Link href={`/academia/${member.artistic_genres?.slug}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a {member.artistic_genres?.name}
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-64 relative">
              {member.photo_url ? (
                <Image src={member.photo_url || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">{member.name}</h1>
              <div className="flex items-center text-gray-500 mb-4">
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                  {member.artistic_genres?.name}
                </span>
                {member.is_active && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-2">Activo</span>
                )}
              </div>

              {member.social_media && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Contacto</h3>
                  <ul className="space-y-2">
                    {member.social_media.website && (
                      <li className="flex items-center text-gray-600">
                        <Globe className="h-4 w-4 mr-2" />
                        <a
                          href={member.social_media.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          Sitio Web <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      </li>
                    )}
                    {member.social_media.email && (
                      <li className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <a href={`mailto:${member.social_media.email}`} className="hover:text-primary">
                          {member.social_media.email}
                        </a>
                      </li>
                    )}
                    {member.social_media.phone && (
                      <li className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <a href={`tel:${member.social_media.phone}`} className="hover:text-primary">
                          {member.social_media.phone}
                        </a>
                      </li>
                    )}
                    {member.social_media.location && (
                      <li className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{member.social_media.location}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Biografía</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700">{member.bio || "No hay información biográfica disponible."}</p>
            </div>
          </div>

          {member.achievements && member.achievements.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Logros y Reconocimientos</h2>
              <ul className="space-y-3">
                {member.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start">
                    <Award className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                    <span className="text-gray-700">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
