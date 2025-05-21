import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { isServerAdmin } from "@/lib/supabase/server"
import * as XLSX from "xlsx"

export async function GET(request: Request) {
  try {
    // Verificar si el usuario es administrador
    const isAdmin = await isServerAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const date = searchParams.get("date")

    // Crear cliente de Supabase
    const supabase = createRouteHandlerClient({ cookies })

    // Obtener votos con una consulta simple
    let query = supabase
      .from("votes")
      .select("id, created_at, user_id, nominee_id")
      .order("created_at", { ascending: false })
      .limit(500) // Aumentamos el límite para la exportación

    // Aplicar filtro de fecha si existe
    if (date) {
      try {
        const startDate = new Date(date)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(date)
        endDate.setHours(23, 59, 59, 999)
        query = query.gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString())
      } catch (error) {
        console.error("Error al procesar fecha:", error)
        // Continuamos sin aplicar el filtro de fecha
      }
    }

    const { data: votes, error } = await query

    if (error) {
      console.error("Error al obtener votos para exportar:", error)
      return NextResponse.json({ error: "Error al obtener votos" }, { status: 500 })
    }

    // Si no hay votos, devolvemos un Excel vacío con encabezados
    if (!votes || votes.length === 0) {
      const worksheet = XLSX.utils.json_to_sheet([
        {
          "ID de Voto": "",
          "ID de Usuario": "",
          Nominado: "",
          Categoría: "",
          Fecha: "",
        },
      ])
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Votos")
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Disposition": `attachment; filename="votos_${new Date().toISOString().split("T")[0]}.xlsx"`,
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      })
    }

    // Obtener información de los nominados para los votos encontrados
    const nomineesMap: Record<number, any> = {}
    try {
      if (votes.length > 0) {
        const nomineeIds = votes.map((vote) => vote.nominee_id)
        const { data: nominees } = await supabase.from("nominees").select("id, name, category").in("id", nomineeIds)

        if (nominees) {
          // Crear un mapa de nominados para acceso rápido
          nominees.forEach((nominee) => {
            nomineesMap[nominee.id] = nominee
          })
        }
      }
    } catch (error) {
      console.error("Error al obtener nominados:", error)
      // Continuamos con la ejecución aunque falle esta consulta
    }

    // Filtrar por categoría si es necesario
    let filteredVotes = [...votes]
    if (category && category !== "all") {
      filteredVotes = filteredVotes.filter((vote) => {
        const nominee = nomineesMap[vote.nominee_id]
        return nominee && nominee.category === category
      })
    }

    // Preparar datos para Excel
    const excelData = filteredVotes.map((vote) => ({
      "ID de Voto": vote.id,
      "ID de Usuario": vote.user_id,
      Nominado: nomineesMap[vote.nominee_id]?.name || `Nominado #${vote.nominee_id}`,
      Categoría: nomineesMap[vote.nominee_id]?.category || "Sin categoría",
      Fecha: new Date(vote.created_at).toLocaleString("es-ES"),
    }))

    // Crear libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Votos")

    // Generar buffer
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

    // Devolver archivo Excel
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="votos_${new Date().toISOString().split("T")[0]}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    })
  } catch (error) {
    console.error("Error al exportar votos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
