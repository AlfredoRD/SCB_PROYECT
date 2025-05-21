import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminError } from "@/components/admin-error"
import { DeleteNomineeButton } from "@/components/delete-nominee-button"

export default async function NomineeDetailsPage({ params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { id } = params

    // Verificar que el ID sea un número
    const nomineeId = Number.parseInt(id, 10)
    if (isNaN(nomineeId)) {
      notFound()
    }

    // Obtener detalles del nominado
    const { data: nominee, error } = await supabase.from("nominees").select("*").eq("id", nomineeId).single()

    if (error || !nominee) {
      console.error("Error al obtener nominado:", error)
      notFound()
    }

    // Obtener votos para este nominado
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("id, created_at")
      .eq("nominee_id", nomineeId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (votesError) {
      console.error("Error al obtener votos:", votesError)
    }

    return (
      <div>
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/admin/nominados">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a nominados
            </Link>
          </Button>
          <h2 className="text-3xl font-bold">{nominee.name}</h2>
          <p className="text-muted-foreground">{nominee.title}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Nominado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Categoría</h3>
                <Badge className="mt-1">{nominee.category}</Badge>
              </div>

              <div>
                <h3 className="font-medium">Descripción</h3>
                <p className="text-muted-foreground mt-1">{nominee.description || "Sin descripción"}</p>
              </div>

              <div>
                <h3 className="font-medium">Etiquetas</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {nominee.tags && nominee.tags.length > 0 ? (
                    nominee.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Sin etiquetas</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium">Fecha de creación</h3>
                <p className="text-muted-foreground mt-1">{new Date(nominee.created_at).toLocaleDateString("es-ES")}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Votos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Total de votos</h3>
                <p className="text-3xl font-bold">{nominee.votes_count || 0}</p>
              </div>

              <div>
                <h3 className="font-medium">Últimos votos</h3>
                {votes && votes.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {votes.map((vote) => (
                      <div key={vote.id} className="text-sm text-muted-foreground">
                        Voto registrado el {new Date(vote.created_at).toLocaleDateString("es-ES")}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-1">No hay votos registrados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex gap-4">
          <Button asChild>
            <Link href={`/admin/nominados/${nominee.id}/editar`}>Editar Nominado</Link>
          </Button>
          <DeleteNomineeButton nomineeId={nominee.id} nomineeName={nominee.name} variant="destructive" size="default" />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error en la página de detalles del nominado:", error)
    return (
      <AdminError
        title="Error al cargar detalles del nominado"
        message="No se pudieron cargar los detalles del nominado. Por favor, intenta recargar la página."
      />
    )
  }
}
