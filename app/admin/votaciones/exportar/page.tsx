import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminError } from "@/components/admin-error"
import { ExportVotesButton } from "@/components/export-votes-button"

export default async function ExportVotesPage() {
  const supabase = createServerClient()

  try {
    // Obtener estadísticas de votos
    const { data: votesCount, error: votesError } = await supabase
      .from("votes")
      .select("id", { count: "exact", head: true })

    if (votesError) {
      throw new Error(`Error al obtener votos: ${votesError.message}`)
    }

    // Obtener categorías
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name", { ascending: true })

    if (categoriesError) {
      throw new Error(`Error al obtener categorías: ${categoriesError.message}`)
    }

    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">Exportar Votos</h2>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Exportar Datos de Votaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Desde aquí puedes exportar los datos de votaciones en formato CSV para su análisis o respaldo.
                  Actualmente hay <strong>{votesCount?.count || 0}</strong> votos registrados en el sistema.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Exportar Todos los Votos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ExportVotesButton type="all" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Exportar Resultados por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ExportVotesButton type="results" />
                    </CardContent>
                  </Card>
                </div>

                {categories && categories.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Exportar por Categoría</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <Card key={category.id}>
                          <CardContent className="pt-4">
                            <h4 className="font-medium mb-2">{category.name}</h4>
                            <ExportVotesButton type="category" category={category.slug} />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error en la página de exportación de votos:", error)
    return (
      <AdminError
        title="Error al cargar datos"
        message="No se pudieron cargar los datos para exportar votos. Por favor, intenta nuevamente más tarde."
        showLogout={false}
      />
    )
  }
}
