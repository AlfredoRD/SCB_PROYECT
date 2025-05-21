import { createServerClient } from "@/lib/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminError } from "@/components/admin-error"
import { ExportVotesButton } from "@/components/export-votes-button"
import { DeleteVoteButton } from "@/components/delete-vote-button"

export default async function AdminVotos() {
  try {
    const supabase = createServerClient()

    // Obtener todos los votos
    const { data: votesData, error: votesError } = await supabase
      .from("votes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (votesError) {
      throw new Error(`Error al obtener votos: ${votesError.message}`)
    }

    // Obtener todos los nominados para relacionarlos con los votos
    const { data: nomineesData, error: nomineesError } = await supabase.from("nominees").select("id, name, category")

    if (nomineesError) {
      throw new Error(`Error al obtener nominados: ${nomineesError.message}`)
    }

    // Crear un mapa de nominados por ID para acceso rápido
    const nomineesMap = new Map()
    nomineesData.forEach((nominee) => {
      nomineesMap.set(nominee.id, nominee)
    })

    // Enriquecer los votos con información del nominado
    const votes = votesData.map((vote) => {
      const nominee = nomineesMap.get(vote.nominee_id)
      return {
        ...vote,
        nominee: nominee || { name: "Nominado desconocido", category: "Categoría desconocida" },
      }
    })

    // Obtener estadísticas
    const totalVotes = votes.length
    const uniqueVoters = new Set(votes.map((vote) => vote.user_id)).size
    const votesByCategory = votes.reduce((acc, vote) => {
      const category = vote.nominee?.category || "Desconocida"
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    // Encontrar la categoría más votada
    let topCategory = "Ninguna"
    let topCount = 0
    Object.entries(votesByCategory).forEach(([category, count]) => {
      if (count > topCount) {
        topCategory = category
        topCount = count
      }
    })

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Gestión de Votos</h2>
          <ExportVotesButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Votos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-muted-foreground">Total de Votos</h3>
                  <p className="text-3xl font-bold mt-2">{totalVotes}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-muted-foreground">Votantes Únicos</h3>
                  <p className="text-3xl font-bold mt-2">{uniqueVoters}</p>
                </div>
                <div className="border rounded-lg p-4 col-span-2">
                  <h3 className="font-medium text-muted-foreground">Categoría Más Votada</h3>
                  <p className="text-xl font-bold mt-2">{topCategory}</p>
                  <p className="text-sm text-muted-foreground">{topCount} votos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimos Votos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {votes.slice(0, 5).map((vote) => (
                  <div key={vote.id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{vote.nominee.name}</h3>
                        <p className="text-sm text-muted-foreground">{vote.nominee.category}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(vote.created_at).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nominado</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {votes.length > 0 ? (
                votes.map((vote) => (
                  <TableRow key={vote.id}>
                    <TableCell>{vote.id}</TableCell>
                    <TableCell className="font-medium">{vote.nominee.name}</TableCell>
                    <TableCell>{vote.nominee.category}</TableCell>
                    <TableCell>{vote.user_id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      {new Date(vote.created_at).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteVoteButton voteId={vote.id} nomineeInfo={vote.nominee.name} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No hay votos registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error en la página de votos:", error)
    return <AdminError title="Error al cargar votos" message={`No se pudieron cargar los votos. ${error.message}`} />
  }
}
