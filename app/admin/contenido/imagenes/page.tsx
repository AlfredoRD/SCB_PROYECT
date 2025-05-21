import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUploadForm } from "@/components/image-upload-form"

export default async function ImagenesPage() {
  const supabase = createServerClient()

  // Verificar si el usuario está autenticado y es administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/admin/contenido/imagenes")
  }

  // Verificar si el usuario es administrador
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/admin")
  }

  // Obtener imágenes del sitio
  let logoId = null
  let aboutHeroId = null

  try {
    // Obtener logo
    const { data: logoData } = await supabase.from("content").select("id").eq("section", "site_logo").limit(1)

    if (logoData && logoData.length > 0) {
      logoId = logoData[0].id
    }

    // Obtener imagen de about
    const { data: aboutHeroData } = await supabase.from("content").select("id").eq("section", "about_hero").limit(1)

    if (aboutHeroData && aboutHeroData.length > 0) {
      aboutHeroId = aboutHeroData[0].id
    }
  } catch (error) {
    console.error("Error al obtener imágenes:", error)
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Gestión de Imágenes del Sitio</h1>

      <div className="mb-8">
        <p className="text-muted-foreground">
          Desde aquí puedes gestionar las imágenes principales del sitio, como el logo y la imagen de la página "Acerca
          de".
        </p>
      </div>

      <Tabs defaultValue="logo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logo">Logo del Sitio</TabsTrigger>
          <TabsTrigger value="about">Imagen de Acerca de</TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo del Sitio</CardTitle>
              <CardDescription>Este logo aparece junto al título principal en el encabezado del sitio.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploadForm
                section="site_logo"
                existingId={logoId}
                title="Logo del Sitio"
                description="Sube una imagen para el logo del sitio. Se recomienda un formato PNG o SVG con fondo transparente."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Imagen de Acerca de</CardTitle>
              <CardDescription>Esta imagen aparece en la parte superior de la página "Acerca de".</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploadForm
                section="about_hero"
                existingId={aboutHeroId}
                title="Imagen de Acerca de"
                description="Sube una imagen para la sección 'Acerca de'. Se recomienda una imagen de alta calidad con proporción 16:9."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
