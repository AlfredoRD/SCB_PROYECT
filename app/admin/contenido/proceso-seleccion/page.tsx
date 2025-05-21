import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContentForm } from "@/components/content-form"

export default async function ProcesoSeleccionPage() {
  const supabase = createServerClient()

  // Verificar si el usuario está autenticado y es administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/contenido/proceso-seleccion")
  }

  // Verificar si el usuario es administrador
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/admin")
  }

  // Intentar obtener el contenido existente
  let processData = null

  try {
    const { data, error } = await supabase.from("content").select("*").eq("section", "selection_process").single()

    if (error) {
      if (error.code !== "PGRST116") {
        // No data found
        console.error("Error al obtener contenido del proceso de selección:", error)
      }
    }

    if (data) {
      processData = data
      console.log("Contenido del proceso de selección encontrado:", data)
    } else {
      console.log("No se encontró contenido del proceso de selección")
    }
  } catch (error) {
    console.error("Error al obtener contenido del proceso de selección:", error)
  }

  // Si no existe contenido, crear uno predeterminado
  if (!processData) {
    const defaultContent = {
      section: "selection_process",
      title: "Proceso de Selección",
      content: {
        title: "El Proceso de Selección",
        description:
          "Nuestro riguroso proceso de selección comienza con una convocatoria abierta para nominaciones. Un comité de preselección evalúa todas las nominaciones recibidas y crea una lista de finalistas en cada categoría.",
        steps: [
          {
            title: "Convocatoria",
            description: "Abrimos la convocatoria para recibir nominaciones en todas las categorías.",
          },
          {
            title: "Preselección",
            description: "Un comité especializado evalúa las nominaciones y selecciona a los finalistas.",
          },
          {
            title: "Evaluación final",
            description: "El jurado evalúa a los finalistas y selecciona a los ganadores.",
          },
          {
            title: "Ceremonia",
            description: "Los ganadores son anunciados en una ceremonia de premiación.",
          },
        ],
        conclusion:
          "Este proceso garantiza que los Premios San Cristóbal mantengan su prestigio y que cada ganador sea verdaderamente merecedor del reconocimiento.",
      },
    }

    try {
      const { data, error } = await supabase.from("content").insert(defaultContent).select().single()

      if (error) {
        console.error("Error al crear contenido predeterminado:", error)
      } else {
        processData = data
        console.log("Contenido predeterminado creado:", data)
      }
    } catch (error) {
      console.error("Error al crear contenido predeterminado:", error)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Gestión de Contenido - Proceso de Selección</h1>

      <div className="mb-8">
        <p className="text-muted-foreground">
          Desde aquí puedes editar la información sobre el proceso de selección que se muestra en la página "Acerca de".
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        {processData ? (
          <ContentForm initialData={processData} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Error al cargar el contenido. Por favor, intenta recargar la página.
          </div>
        )}
      </div>
    </div>
  )
}
