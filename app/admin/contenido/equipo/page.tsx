import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { TeamMemberForm } from "@/components/team-member-form"

export default async function EquipoPage() {
  const supabase = createServerClient()

  // Verificar si el usuario está autenticado y es admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/admin/contenido/equipo")
  }

  // Verificar si el usuario es admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

  if (userProfile?.role !== "admin") {
    redirect("/")
  }

  // Obtener la sección de contenido "team_members"
  let teamContent = null
  try {
    const { data, error } = await supabase.from("content").select("*").eq("section", "team_members").single()

    if (error) {
      console.error("Error al obtener contenido del equipo:", error)
    } else {
      teamContent = data
    }
  } catch (error) {
    console.error("Error al obtener contenido del equipo:", error)
  }

  // Si no existe la sección "team_members", crear una nueva
  if (!teamContent) {
    try {
      const { data, error } = await supabase
        .from("content")
        .insert({
          section: "team_members",
          title: "Nuestro Equipo",
          content: {
            title: "Nuestro Equipo",
            members: [
              {
                name: "Carlos Rodríguez",
                role: "Director Ejecutivo",
                bio: "Con más de 15 años de experiencia en la organización de eventos culturales, Carlos lidera el equipo de los Premios San Cristóbal desde su fundación.",
                image: "/images/team-1.png",
              },
              {
                name: "Ana Martínez",
                role: "Directora de Comunicaciones",
                bio: "Especialista en relaciones públicas y comunicación estratégica, Ana es responsable de la imagen y presencia mediática de los Premios.",
                image: "/images/team-2.png",
              },
              {
                name: "Miguel Sánchez",
                role: "Coordinador de Eventos",
                bio: "Con una amplia experiencia en la producción de eventos de gran escala, Miguel asegura que cada ceremonia sea impecable y memorable.",
                image: "/images/team-3.png",
              },
            ],
          },
        })
        .select()
        .single()

      if (error) {
        console.error("Error al crear contenido del equipo:", error)
      } else {
        teamContent = data
      }
    } catch (error) {
      console.error("Error al crear contenido del equipo:", error)
    }
  }

  // Si no se pudo obtener o crear el contenido, mostrar 404
  if (!teamContent) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Equipo</h1>
      <p className="text-muted-foreground">
        Edita la información de los miembros del equipo que se muestra en la página "Acerca de".
      </p>
      <TeamMemberForm initialData={teamContent} />
    </div>
  )
}
