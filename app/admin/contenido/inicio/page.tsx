import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContentForm } from "@/components/content-form"

export default async function InicioPage() {
  const supabase = createServerClient()

  // Verificar si el usuario está autenticado y es administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/contenido/inicio")
  }

  // Verificar si el usuario es administrador
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/admin")
  }

  // Intentar obtener el contenido existente
  let homeContent = null

  try {
    const { data, error } = await supabase.from("content").select("*").eq("section", "home").single()

    if (error) {
      if (error.code !== "PGRST116") {
        // No data found
        console.error("Error al obtener contenido de inicio:", error)
      }
    }

    if (data) {
      homeContent = data
      console.log("Contenido de inicio encontrado:", data)
    } else {
      console.log("No se encontró contenido de inicio")
    }
  } catch (error) {
    console.error("Error al obtener contenido de inicio:", error)
  }

  // Si no existe contenido, crear uno predeterminado
  if (!homeContent) {
    const defaultContent = {
      section: "home",
      title: "Contenido de la Página Principal",
      content: {
        hero_title: "Premios San Cristóbal",
        hero_subtitle: "Honrando la Excelencia y el Legado en nuestra comunidad",
        hero_description:
          "Celebrando a los individuos y organizaciones que han hecho contribuciones excepcionales a nuestra sociedad y cultura.",
        cta_primary: "Ver Nominados",
        cta_secondary: "Votar Ahora",
      },
    }

    try {
      const { data, error } = await supabase.from("content").insert(defaultContent).select().single()

      if (error) {
        console.error("Error al crear contenido predeterminado:", error)
      } else {
        homeContent = data
        console.log("Contenido predeterminado creado:", data)
      }
    } catch (error) {
      console.error("Error al crear contenido predeterminado:", error)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Gestión de Contenido - Página Principal</h1>

      <div className="mb-8">
        <p className="text-muted-foreground">
          Desde aquí puedes editar el contenido de la página principal del sitio web, como títulos, descripciones y
          textos de los botones.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        {homeContent ? (
          <ContentForm initialData={homeContent} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Error al cargar el contenido. Por favor, intenta recargar la página.
          </div>
        )}
      </div>
    </div>
  )
}
