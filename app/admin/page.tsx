import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Gestión de usuarios registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Accede a la sección de usuarios para administrar las cuentas registradas.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nominaciones</CardTitle>
            <CardDescription>Gestión de nominaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Administra las nominaciones para los premios.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
            <CardDescription>Gestión de categorías</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Configura las categorías para los premios.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Votaciones</CardTitle>
            <CardDescription>Gestión de votaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Administra el proceso de votación.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
