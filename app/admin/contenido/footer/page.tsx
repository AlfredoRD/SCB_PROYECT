import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContentForm } from "@/components/content-form"

export default async function FooterPage() {
  const supabase = createServerClient()

  // Verificar si el usuario está autenticado y es administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/contenido/footer")
  }

  // Verificar si el usuario es administrador
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/admin")
  }

  // Intentar obtener el contenido existente
  let footerContent = null

  try {
    const { data, error } = await supabase.from("content").select("*").eq("section", "footer").single()

    if (error) {
      if (error.code !== "PGRST116") {
        // No data found
        console.error("Error al obtener contenido del footer:", error)
      }
    }

    if (data) {
      footerContent = data
      console.log("Contenido del footer encontrado:", data)
    } else {
      console.log("No se encontró contenido del footer")
    }
  } catch (error) {
    console.error("Error al obtener contenido del footer:", error)
  }

  // Si no existe contenido, crear uno predeterminado
  if (!footerContent) {
    const defaultContent = {
      section: "footer",
      title: "Pie de Página",
      content: {
        title: "Premios San Cristóbal",
        tagline: "Honrando la Excelencia y el Legado desde 2023",
        links_title: "Enlaces",
        link_home: "Inicio",
        link_categories: "Categorías",
        link_nominees: "Nominados",
        link_event: "Evento",
        legal_title: "Legal",
        link_terms: "Términos y Condiciones",
        link_privacy: "Política de Privacidad",
        link_cookies: "Política de Cookies",
        contact_title: "Contacto",
        email: "Email: info@premiossancristobal.com",
        phone: "Teléfono: +123 456 7890",
        address: "Dirección: Av. Principal #123, Ciudad",
        copyright: `© ${new Date().getFullYear()} Premios San Cristóbal. Todos los derechos reservados.`,
      },
    }

    try {
      const { data, error } = await supabase.from("content").insert(defaultContent).select().single()

      if (error) {
        console.error("Error al crear contenido predeterminado:", error)
      } else {
        footerContent = data
        console.log("Contenido predeterminado creado:", data)
      }
    } catch (error) {
      console.error("Error al crear contenido predeterminado:", error)
    }
  }

  // Definir los campos para el formulario
  const fields = [
    { name: "title", label: "Título", type: "text" as const },
    { name: "tagline", label: "Eslogan", type: "text" as const },
    { name: "links_title", label: "Título de Enlaces", type: "text" as const },
    { name: "link_home", label: "Enlace Inicio", type: "text" as const },
    { name: "link_categories", label: "Enlace Categorías", type: "text" as const },
    { name: "link_nominees", label: "Enlace Nominados", type: "text" as const },
    { name: "link_event", label: "Enlace Evento", type: "text" as const },
    { name: "legal_title", label: "Título Legal", type: "text" as const },
    { name: "link_terms", label: "Enlace Términos", type: "text" as const },
    { name: "link_privacy", label: "Enlace Privacidad", type: "text" as const },
    { name: "link_cookies", label: "Enlace Cookies", type: "text" as const },
    { name: "contact_title", label: "Título Contacto", type: "text" as const },
    { name: "email", label: "Email", type: "text" as const },
    { name: "phone", label: "Teléfono", type: "text" as const },
    { name: "address", label: "Dirección", type: "text" as const },
    { name: "copyright", label: "Copyright", type: "text" as const },
  ]

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Gestión de Contenido - Pie de Página</h1>

      <div className="mb-8">
        <p className="text-muted-foreground">
          Desde aquí puedes editar el contenido del pie de página que se muestra en todas las páginas del sitio.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        {footerContent ? (
          <ContentForm initialData={footerContent} fields={fields} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Error al cargar el contenido. Por favor, intenta recargar la página.
          </div>
        )}
      </div>
    </div>
  )
}
