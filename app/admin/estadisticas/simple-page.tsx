import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminError } from "@/components/admin-error"

export default async function SimpleStatsPage() {
  try {
    const supabase = createServerClient()

    // Función para realizar consultas con timeout y manejo de errores
    const fetchWithTimeout = async (promise: Promise<any>, timeoutMs = 2000, fallbackValue: any = null) => {
      let timeoutId: NodeJS.Timeout

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("La consulta ha excedido el tiempo límite"))
        }, timeoutMs)
      })

      try {
        // Usar Promise.race para competir entre la consulta original y el timeout
        const result = await Promise.race([promise, timeoutPromise])
        clearTimeout(timeoutId)
        return result
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId)
        console.error("Error en consulta con timeout:", error)
        return fallbackValue
      }
    }

    // Obtener estadísticas básicas con manejo de errores
    const [nomineesResult, usersResult, votesResult] = await Promise.all([
      // Nominados - consulta simplificada
      fetchWithTimeout(supabase.from("nominees").select("id", { count: "exact", head: true }), 2000, { count: 0 }),
      // Usuarios - consulta simplificada
      fetchWithTimeout(supabase.from("user_profiles").select("id", { count: "exact", head: true }), 2000, { count: 0 }),
      // Votos - consulta simplificada
      fetchWithTimeout(supabase.from("votes").select("id", { count: "exact", head: true }), 2000, { count: 0 }),
    ])

    // Extraer conteos con valores por defecto en caso de error
    const nomineesCount = nomineesResult?.count || 0
    const usersCount = usersResult?.count || 0
    const votesCount = votesResult?.count || 0

    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">Estadísticas Básicas</h2>
        <p className="text-muted-foreground mb-6">
          Mostrando estadísticas básicas. Para ver estadísticas detalladas, intenta recargar la página.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total de Nominados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{nomineesCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{usersCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total de Votos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{votesCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error en la página de estadísticas simplificada:", error)
    return (
      <AdminError
        title="Error al cargar estadísticas"
        message="No se pudieron cargar las estadísticas debido a un problema de conexión. Por favor, intenta recargar la página."
        showLogout={false}
      />
    )
  }
}
