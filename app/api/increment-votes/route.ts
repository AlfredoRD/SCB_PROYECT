import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { nomineeId } = await request.json()

    if (!nomineeId) {
      return NextResponse.json({ error: "Nominee ID is required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Actualizar el contador de votos
    const { data, error } = await supabase
      .from("nominees")
      .update({ votes_count: supabase.rpc("increment", { x: 1, row_id: nomineeId }) })
      .eq("id", nomineeId)
      .select()

    if (error) {
      console.error("Error incrementando votos:", error)
      return NextResponse.json({ error: "Failed to increment vote count" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error en la ruta increment-votes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
