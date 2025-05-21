import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Users, ThumbsUp, BarChart } from "lucide-react"
import { AdminError } from "@/components/admin-error"

export default async function AdminDashboard() {
  try {
    const supabase = createServerClient()

    // Función para realizar consultas con timeout
    const fetchWithTimeout = async (promise, timeoutMs = 5000, fallbackValue = null) => {
      let timeoutId

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
        clearTimeout(timeoutId)
        console.error("Error en consulta:", error)
        return fallbackValue
      }
    }

    // Realizar consultas independientes con timeout
    const nomineesPromise = fetchWithTimeout(
      supabase.from("nominees").select("*", { count: "exact", head: true }),
      5000,
      { count: 0, error: null },
    )

    const usersPromise = fetchWithTimeout(
      supabase.from("user_profiles").select("*", { count: "exact", head: true }),
      5000,
      { count: 0, error: null },
    )

    const votesPromise = fetchWithTimeout(supabase.from("votes").select("*", { count: "exact", head: true }), 5000, {
      count: 0,
      error: null,
    })

    const categoriesPromise = fetchWithTimeout(supabase.from("categories").select("name"), 5000, {
      data: [],
      error: null,
    })

    // Ejecutar todas las consultas en paralelo
    const [nomineesResult, usersResult, votesResult, categoriesResult] = await Promise.all([
      nomineesPromise,
      usersPromise,
      votesPromise,
      categoriesPromise,
    ])

    // Manejar errores de cada consulta individualmente
    const nomineesCount = nomineesResult.error ? 0 : nomineesResult.count || 0
    const usersCount = usersResult.error ? 0 : usersResult.count || 0
    const votesCount = votesResult.error ? 0 : votesResult.count || 0
    const categoriesCount = categoriesResult.error ? 0 : categoriesResult.data?.length || 0

    // Obtener los 5 nominados más votados (consulta separada con timeout)
    const topNomineesResult = await fetchWithTimeout(
      supabase
        .from("nominees")
        .select("name, category, votes_count")
        .order("votes_count", { ascending: false })
        .limit(5),
      5000,
      { data: [], error: null },
    )

    // Obtener los votos más recientes (consulta separada con timeout)
    const recentVotesResult = await fetchWithTimeout(
      supabase
        .from("votes")
        .select(`
          id,
          created_at,
          user_id,
          nominee_id
        `)
        .order("created_at", { ascending: false })
        .limit(5),
      5000,
      { data: [], error: null },
    )

    const topNominees = topNomineesResult.data || []
    const recentVotes = recentVotesResult.data || []

    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold">Panel de Administración</h2>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nominados</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nomineesCount}</div>
              <p className="text-xs text-muted-foreground">Total de nominados registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersCount}</div>
              <p className="text-xs text-muted-foreground">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoriesCount}</div>
              <p className="text-xs text-muted-foreground">Categorías disponibles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Votos</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{votesCount}</div>
              <p className="text-xs text-muted-foreground">Votos registrados</p>
            </CardContent>
          </Card>
        </div>

        {/* Nominados más votados */}
        <Card>
          <CardHeader>
            <CardTitle>Nominados más votados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topNominees.length > 0 ? (
                topNominees.map((nominee, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{nominee.name}</p>
                      <p className="text-sm text-muted-foreground">{nominee.category}</p>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 text-primary mr-2" />
                      <span>{nominee.votes_count || 0} votos</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No hay nominados con votos</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Votos recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Votos recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVotes.length > 0 ? (
                recentVotes.map((vote) => (
                  <div key={vote.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Usuario {vote.user_id.substring(0, 6)}...</p>
                      <p className="text-sm text-muted-foreground">{new Date(vote.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-right font-medium">Nominado #{vote.nominee_id}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No hay votos recientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error en el dashboard:", error)
    return (
      <AdminError
        title="Error al cargar el dashboard"
        message="Ha ocurrido un error al cargar los datos del dashboard. Por favor, intenta recargar la página."
      />
    )
  }
}
