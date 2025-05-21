import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  // Verificar si el usuario está autenticado y es administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Verificar si el usuario es administrador
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("aboutHero") as File

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 })
    }

    // Convertir el archivo a base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // Verificar si ya existe un registro para la imagen de about
    const { data: existingImage } = await supabase.from("content").select("id").eq("section", "about_hero").limit(1)

    if (existingImage && existingImage.length > 0) {
      // Actualizar el registro existente
      const { error: updateError } = await supabase
        .from("content")
        .update({
          content: { url: dataUrl, type: file.type, name: file.name },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingImage[0].id)

      if (updateError) {
        console.error("Error al actualizar la imagen:", updateError)
        return NextResponse.json({ error: "Error al actualizar la imagen" }, { status: 500 })
      }
    } else {
      // Crear un nuevo registro
      const { error: insertError } = await supabase.from("content").insert({
        section: "about_hero",
        title: "Imagen de Acerca de",
        content: { url: dataUrl, type: file.type, name: file.name },
      })

      if (insertError) {
        console.error("Error al guardar la imagen:", insertError)
        return NextResponse.json({ error: "Error al guardar la imagen" }, { status: 500 })
      }
    }

    return NextResponse.redirect(new URL("/admin/contenido/imagenes", request.url))
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
