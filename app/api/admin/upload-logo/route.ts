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
    const file = formData.get("logo") as File

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 })
    }

    // Convertir el archivo a base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // Verificar si ya existe un registro para el logo
    const { data: existingLogo } = await supabase.from("content").select("id").eq("section", "site_logo").limit(1)

    if (existingLogo && existingLogo.length > 0) {
      // Actualizar el registro existente
      const { error: updateError } = await supabase
        .from("content")
        .update({
          content: { url: dataUrl, type: file.type, name: file.name },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingLogo[0].id)

      if (updateError) {
        console.error("Error al actualizar el logo:", updateError)
        return NextResponse.json({ error: "Error al actualizar el logo" }, { status: 500 })
      }
    } else {
      // Crear un nuevo registro
      const { error: insertError } = await supabase.from("content").insert({
        section: "site_logo",
        title: "Logo del Sitio",
        content: { url: dataUrl, type: file.type, name: file.name },
      })

      if (insertError) {
        console.error("Error al guardar el logo:", insertError)
        return NextResponse.json({ error: "Error al guardar el logo" }, { status: 500 })
      }
    }

    return NextResponse.redirect(new URL("/admin/contenido/imagenes", request.url))
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
