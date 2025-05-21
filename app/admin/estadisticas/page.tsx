import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from "react"

// Componente para mostrar estadísticas básicas
function BasicStats({
  nomineesCount,
  usersCount,
  votesCount,
}: {
  nomineesCount: number
  usersCount: number
  votesCount: number
}) {
  return (
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
  )
}

// Componente para mostrar los nominados más votados
function TopNominees({ nominees }: { nominees: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nominados más votados</CardTitle>
        <CardDescription>Los 5 nominados con más votos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nominees && nominees.length > 0 ? (
            nominees.map((nominee, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{nominee.name}</p>
                  <p className="text-sm text-muted-foreground">{nominee.category}</p>
                </div>
                <div className="font-bold">{nominee.votes_count || 0} votos</div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No hay nominados con votos</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para mostrar estadísticas por categoría
function CategoryStats({ categoriesStats }: { categoriesStats: Record<string, { nominees: number; votes: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas por Categoría</CardTitle>
        <CardDescription>Distribución de nominados y votos por categoría</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(categoriesStats).length > 0 ? (
            Object.entries(categoriesStats).map(([category, stats], index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">{category}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nominados</p>
                    <p className="text-xl font-bold">{stats.nominees}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Votos</p>
                    <p className="text-xl font-bold">{stats.votes}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No hay datos disponibles</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para mostrar votos por día
function VotesByDay({ votesPerDay }: { votesPerDay: Record<string, number> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Votos por Día</CardTitle>
        <CardDescription>Últimos 7 días</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(votesPerDay).length > 0 ? (
            Object.entries(votesPerDay).map(([date, count], index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="font-medium">{new Date(date).toLocaleDateString("es-ES")}</p>
                <p className="font-bold">{count} votos</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No hay votos registrados en los últimos 7 días</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para mostrar la distribución de nominados
function NomineeDistribution({
  categoriesStats,
}: { categoriesStats: Record<string, { nominees: number; votes: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Nominados</CardTitle>
        <CardDescription>Nominados por categoría</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(categoriesStats).length > 0 ? (
            Object.entries(categoriesStats).map(([category, stats], index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="font-medium">{category}</p>
                <p className="font-bold">{stats.nominees} nominados</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No hay datos disponibles</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para cargar datos básicos
async function BasicStatsLoader() {
  try {
    const supabase = createServerClient()

    // Función para realizar consultas con timeout y manejo de errores mejorado
    const fetchWithTimeout = async (promise: Promise<any>, timeoutMs = 5000, fallbackValue: any = null) => {
      // Usar AbortController para cancelar la solicitud si tarda demasiado
      const controller = new AbortController()
      const signal = controller.signal

      // Configurar el timeout
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, timeoutMs)

      try {
        // Añadir la señal de aborto a la consulta si es posible
        const modifiedPromise = typeof promise.abortSignal === "function" ? promise.abortSignal(signal) : promise

        const result = await modifiedPromise
        clearTimeout(timeoutId)
        return result
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name === "AbortError") {
          console.error("La consulta fue abortada por timeout")
        } else {
          console.error("Error en consulta:", error)
        }
        return fallbackValue
      }
    }

    // Obtener estadísticas básicas con manejo de errores - consultas más simples y rápidas
    const [nomineesResult, usersResult, votesResult] = await Promise.all([
      // Nominados - consulta simplificada
      fetchWithTimeout(supabase.from("nominees").select("id", { count: "exact", head: true }).limit(1), 5000, {
        count: 0,
      }),
      // Usuarios - consulta simplificada
      fetchWithTimeout(supabase.from("user_profiles").select("id", { count: "exact", head: true }).limit(1), 5000, {
        count: 0,
      }),
      // Votos - consulta simplificada
      fetchWithTimeout(supabase.from("votes").select("id", { count: "exact", head: true }).limit(1), 5000, {
        count: 0,
      }),
    ])

    // Extraer conteos con valores por defecto en caso de error
    const nomineesCount = nomineesResult?.count || 0
    const usersCount = usersResult?.count || 0
    const votesCount = votesResult?.count || 0

    return <BasicStats nomineesCount={nomineesCount} usersCount={usersCount} votesCount={votesCount} />
  } catch (error) {
    console.error("Error al cargar estadísticas básicas:", error)
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No se pudieron cargar las estadísticas básicas</p>
        </CardContent>
      </Card>
    )
  }
}

// Componente para cargar los nominados más votados
async function TopNomineesLoader() {
  try {
    const supabase = createServerClient()

    // Obtener los 5 nominados más votados con timeout
    const { data: topNominees } = await supabase
      .from("nominees")
      .select("name, category, votes_count")
      .order("votes_count", { ascending: false })
      .limit(5)
      .abortSignal(AbortSignal.timeout(5000))
      .throwOnError()

    return <TopNominees nominees={topNominees || []} />
  } catch (error) {
    console.error("Error al cargar nominados más votados:", error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nominados más votados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No se pudieron cargar los nominados más votados</p>
        </CardContent>
      </Card>
    )
  }
}

// Componente para cargar estadísticas por categoría
async function CategoryStatsLoader() {
  try {
    const supabase = createServerClient()

    // Obtener nominados por categoría con timeout
    const { data: nomineesData } = await supabase
      .from("nominees")
      .select("category, votes_count")
      .abortSignal(AbortSignal.timeout(5000))
      .throwOnError()

    // Crear un objeto para almacenar el conteo de nominados y votos por categoría
    const categoriesStats: Record<string, { nominees: number; votes: number }> = {}

    if (nomineesData) {
      nomineesData.forEach((nominee) => {
        if (nominee.category) {
          if (!categoriesStats[nominee.category]) {
            categoriesStats[nominee.category] = { nominees: 0, votes: 0 }
          }
          categoriesStats[nominee.category].nominees += 1
          categoriesStats[nominee.category].votes += nominee.votes_count || 0
        }
      })
    }

    return <CategoryStats categoriesStats={categoriesStats} />
  } catch (error) {
    console.error("Error al cargar estadísticas por categoría:", error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No se pudieron cargar las estadísticas por categoría</p>
        </CardContent>
      </Card>
    )
  }
}

// Componente para cargar la distribución de nominados
async function NomineeDistributionLoader() {
  try {
    const supabase = createServerClient()

    // Obtener nominados por categoría con timeout
    const { data: nomineesData } = await supabase
      .from("nominees")
      .select("category")
      .abortSignal(AbortSignal.timeout(5000))
      .throwOnError()

    // Crear un objeto para almacenar el conteo de nominados por categoría
    const categoriesStats: Record<string, { nominees: number; votes: number }> = {}

    if (nomineesData) {
      nomineesData.forEach((nominee) => {
        if (nominee.category) {
          if (!categoriesStats[nominee.category]) {
            categoriesStats[nominee.category] = { nominees: 0, votes: 0 }
          }
          categoriesStats[nominee.category].nominees += 1
        }
      })
    }

    return <NomineeDistribution categoriesStats={categoriesStats} />
  } catch (error) {
    console.error("Error al cargar distribución de nominados:", error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Nominados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No se pudo cargar la distribución de nominados</p>
        </CardContent>
      </Card>
    )
  }
}

// Componente para cargar votos por día
async function VotesByDayLoader() {
  try {
    const supabase = createServerClient()

    // Obtener estadísticas de votos por día (últimos 7 días) con timeout
    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)

    const { data: votesByDay } = await supabase
      .from("votes")
      .select("created_at")
      .gte("created_at", last7Days.toISOString())
      .order("created_at")
      .abortSignal(AbortSignal.timeout(5000))
      .throwOnError()

    // Agrupar votos por día
    const votesPerDay: Record<string, number> = {}

    if (votesByDay) {
      votesByDay.forEach((vote) => {
        const date = new Date(vote.created_at).toISOString().split("T")[0]
        votesPerDay[date] = (votesPerDay[date] || 0) + 1
      })
    }

    return <VotesByDay votesPerDay={votesPerDay} />
  } catch (error) {
    console.error("Error al cargar votos por día:", error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Votos por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No se pudieron cargar los votos por día</p>
        </CardContent>
      </Card>
    )
  }
}

// Componente principal
export default function AdminEstadisticas() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Estadísticas</h2>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
          <TabsTrigger value="nominados">Nominados</TabsTrigger>
          <TabsTrigger value="votos">Votos</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <BasicStatsLoader />
          </Suspense>

          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <TopNomineesLoader />
          </Suspense>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <CategoryStatsLoader />
          </Suspense>
        </TabsContent>

        <TabsContent value="nominados" className="space-y-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <NomineeDistributionLoader />
          </Suspense>
        </TabsContent>

        <TabsContent value="votos" className="space-y-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <VotesByDayLoader />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
