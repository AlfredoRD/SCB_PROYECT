import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ContentForm } from "@/components/content-form"

export default async function AcercaPage() {
  const supabase = createServerClient()

  // Verificar si el usuario está autenticado y es admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/admin/contenido/acerca")
  }

  // Verificar si el usuario es admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

  if (userProfile?.role !== "admin") {
    redirect("/")
  }

  // Obtener la sección de contenido "about"
  let aboutContent = null
  try {
    const { data, error } = await supabase.from("content").select("*").eq("section", "about").single()

    if (error) {
      console.error("Error al obtener contenido:", error)
    } else {
      aboutContent = data
    }
  } catch (error) {
    console.error("Error al obtener contenido:", error)
  }

  // Si no existe la sección "about", crear una nueva
  if (!aboutContent) {
    try {
      const { data, error } = await supabase
        .from("content")
        .insert({
          section: "about",
          title: "Acerca de los Premios San Cristóbal",
          content: {
            title: "Acerca de los Premios San Cristóbal",
            history:
              "Los Premios San Cristóbal nacieron en 2018 con la visión de reconocer y celebrar la excelencia en diversos ámbitos de nuestra sociedad.",
            history_additional:
              "A lo largo de los años, hemos tenido el honor de premiar a individuos y organizaciones excepcionales.",
            mission: "Nuestra misión es identificar, celebrar y promover la excelencia en todas sus formas.",
            value_excellence: "Buscamos y celebramos lo mejor en cada categoría.",
            value_integrity: "Mantenemos un proceso de selección transparente y justo.",
            value_diversity: "Valoramos y reconocemos la diversidad de talentos y contribuciones.",
            value_impact: "Priorizamos reconocer a quienes generan un impacto positivo en la sociedad.",
            value_innovation: "Celebramos el pensamiento innovador y las soluciones creativas.",
            selection_process:
              "Nuestro riguroso proceso de selección comienza con una convocatoria abierta para nominaciones.",
            selection_process_additional:
              "Este proceso garantiza que los Premios San Cristóbal mantengan su prestigio.",
          },
        })
        .select()
        .single()

      if (error) {
        console.error("Error al crear contenido:", error)
      } else {
        aboutContent = data
      }
    } catch (error) {
      console.error("Error al crear contenido:", error)
    }
  }

  // Si no se pudo obtener o crear el contenido, mostrar 404
  if (!aboutContent) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Contenido: Acerca de</h1>
      <p className="text-muted-foreground">Edita el contenido de la página "Acerca de los Premios San Cristóbal".</p>
      <ContentForm initialData={aboutContent} />
    </div>
  )
}
