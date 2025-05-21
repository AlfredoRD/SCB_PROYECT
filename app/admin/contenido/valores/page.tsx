import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ContentForm } from "@/components/content-form"

export default async function ValoresPage() {
  const supabase = createServerClient()

  // Verificar si el usuario está autenticado y es admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/admin/contenido/valores")
  }

  // Verificar si el usuario es admin
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

  if (userProfile?.role !== "admin") {
    redirect("/")
  }

  // Obtener la sección de contenido "values"
  let valuesContent = null
  try {
    const { data, error } = await supabase.from("content").select("*").eq("section", "values").single()

    if (error) {
      if (error.code !== "PGRST116") {
        console.error("Error al obtener contenido de valores:", error)
      }
    } else {
      valuesContent = data
      console.log("Contenido de valores encontrado:", data)
    }
  } catch (error) {
    console.error("Error al obtener contenido de valores:", error)
  }

  // Si no existe la sección "values", crear una nueva
  if (!valuesContent) {
    const defaultContent = {
      section: "values",
      title: "Nuestros Valores",
      content: {
        title: "Nuestros Valores",
        description: "Estos son los valores que guían nuestro trabajo y nuestra misión.",
        values: [
          {
            name: "Excelencia",
            description: "Buscamos y celebramos lo mejor en cada categoría.",
          },
          {
            name: "Integridad",
            description: "Mantenemos un proceso de selección transparente y justo.",
          },
          {
            name: "Diversidad",
            description: "Valoramos y reconocemos la diversidad de talentos y contribuciones.",
          },
          {
            name: "Impacto",
            description: "Priorizamos reconocer a quienes generan un impacto positivo en la sociedad.",
          },
          {
            name: "Innovación",
            description: "Celebramos el pensamiento innovador y las soluciones creativas.",
          },
        ],
      },
    }

    try {
      const { data, error } = await supabase.from("content").insert(defaultContent).select().single()

      if (error) {
        console.error("Error al crear contenido de valores:", error)
      } else {
        valuesContent = data
        console.log("Contenido de valores predeterminado creado:", data)
      }
    } catch (error) {
      console.error("Error al crear contenido de valores:", error)
    }
  }

  // Si no se pudo obtener o crear el contenido, mostrar 404
  if (!valuesContent) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Contenido: Nuestros Valores</h1>
      <p className="text-muted-foreground">
        Edita el contenido de la sección "Nuestros Valores". Puedes modificar el título, la descripción y cada uno de
        los valores.
      </p>
      <div className="bg-card border rounded-lg p-6">
        <ContentForm initialData={valuesContent} />
      </div>
    </div>
  )
}
