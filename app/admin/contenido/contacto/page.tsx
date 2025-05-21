import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContactForm } from "@/components/contact-form"

export default async function ContactPage() {
  const supabase = createServerClient()

  // Verificar si el usuario está autenticado y es administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/contenido/contacto")
  }

  // Verificar si el usuario es administrador
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/admin")
  }

  // Obtener la información de contacto
  const { data: contactInfo } = await supabase.from("content").select("*").eq("section", "contact").single()

  // Si no existe la sección, crear un objeto vacío
  const initialData = contactInfo
    ? contactInfo
    : {
        section: "contact",
        title: "Contacto",
        content: {
          info_title: "Información de Contacto",
          email: "contacto@premiossancristobal.com",
          phone: "+1 234 567 890",
          address: "Av. Principal #123, Ciudad",
          social_title: "Redes Sociales",
          facebook: "Facebook: /PremiosSanCristobal",
          twitter: "Twitter: @PremiosSC",
          instagram: "Instagram: @premiossancristobal",
        },
      }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Contacto</h1>
      </div>

      <p className="text-muted-foreground mb-8">
        Aquí puedes gestionar la información de contacto que se muestra en la página "Acerca de".
      </p>

      <ContactForm initialData={initialData} />
    </div>
  )
}
