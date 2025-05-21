import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Calendar, Award, Tag, Users, Settings } from "lucide-react"

export default function SimpleAdminPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Panel de Administración Simplificado</h2>
      <p className="text-muted-foreground">
        Este es un panel simplificado para administrar el sitio cuando hay problemas de rendimiento. Selecciona una de
        las opciones a continuación:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Ver estadísticas generales del sitio</p>
            <Button asChild className="w-full">
              <Link href="/admin/dashboard">Acceder</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Gestionar eventos del sitio</p>
            <Button asChild className="w-full">
              <Link href="/admin/eventos">Acceder</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Nominados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Gestionar nominados</p>
            <Button asChild className="w-full">
              <Link href="/admin/nominados">Acceder</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Gestionar categorías</p>
            <Button asChild className="w-full">
              <Link href="/admin/categorias">Acceder</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Gestionar usuarios</p>
            <Button asChild className="w-full">
              <Link href="/admin/usuarios">Acceder</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Configurar el sitio</p>
            <Button asChild className="w-full">
              <Link href="/admin/configuracion">Acceder</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button variant="outline" asChild className="w-full">
          <Link href="/admin">Volver al Panel Completo</Link>
        </Button>
      </div>
    </div>
  )
}
