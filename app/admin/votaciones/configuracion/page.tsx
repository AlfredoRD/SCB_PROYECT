import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminError } from "@/components/admin-error"
import { VotingConfigForm } from "@/components/voting-config-form"

export default async function VotingConfigPage() {
  const supabase = createServerClient()

  try {
    // Obtener la configuración actual
    const { data: configData, error: configError } = await supabase
      .from("config")
      .select("*")
      .eq("key", "voting_settings")
      .single()

    if (configError && !configError.message.includes("No rows found")) {
      throw new Error(`Error al obtener configuración: ${configError.message}`)
    }

    // Configuración predeterminada
    const defaultConfig = {
      voting_enabled: true,
      max_votes_per_user: 5,
      max_votes_per_category: 1,
      show_results: false,
      voting_start_date: new Date().toISOString(),
      voting_end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    }

    // Usar la configuración de la base de datos o la predeterminada
    const config = configData?.value || defaultConfig

    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">Configuración de Votaciones</h2>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ajustes Generales</CardTitle>
            </CardHeader>
            <CardContent>
              <VotingConfigForm initialData={config} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error en la página de configuración de votaciones:", error)
    return (
      <AdminError
        title="Error al cargar configuración"
        message="No se pudo cargar la configuración de votaciones. Por favor, intenta nuevamente más tarde."
        showLogout={false}
      />
    )
  }
}
