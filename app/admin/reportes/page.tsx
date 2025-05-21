import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, BarChart, PieChart, Calendar } from "lucide-react"

export default async function AdminReportes() {
  const supabase = createServerClient()

  // Obtener categorías para filtros
  const { data: categories } = await supabase.from("categories").select("name").order("name")

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Reportes</h2>

      <Tabs defaultValue="votos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="votos">Reporte de Votos</TabsTrigger>
          <TabsTrigger value="nominados">Reporte de Nominados</TabsTrigger>
          <TabsTrigger value="usuarios">Reporte de Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="votos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Votos</CardTitle>
              <CardDescription>Genera un reporte detallado de los votos registrados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoría</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Período</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo el tiempo</SelectItem>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Formato</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Tipo de gráfico</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Barras</SelectItem>
                      <SelectItem value="pie">Circular</SelectItem>
                      <SelectItem value="line">Líneas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generar Reporte
              </Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reportes Recientes</CardTitle>
                <CardDescription>Últimos reportes generados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Reporte de Votos - Todas las categorías</p>
                        <p className="text-sm text-muted-foreground">Generado el 15/05/2023</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Reporte de Votos - Excelencia Académica</p>
                        <p className="text-sm text-muted-foreground">Generado el 10/05/2023</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visualizaciones Disponibles</CardTitle>
                <CardDescription>Tipos de gráficos para tus reportes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <BarChart className="h-10 w-10 mr-4 text-primary" />
                    <div>
                      <p className="font-medium">Gráfico de Barras</p>
                      <p className="text-sm text-muted-foreground">Ideal para comparar cantidades entre categorías</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <PieChart className="h-10 w-10 mr-4 text-primary" />
                    <div>
                      <p className="font-medium">Gráfico Circular</p>
                      <p className="text-sm text-muted-foreground">Perfecto para mostrar proporciones y porcentajes</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="h-10 w-10 mr-4 text-primary" />
                    <div>
                      <p className="font-medium">Gráfico Temporal</p>
                      <p className="text-sm text-muted-foreground">
                        Muestra la evolución de datos a lo largo del tiempo
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nominados" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Nominados</CardTitle>
              <CardDescription>Genera un reporte detallado de los nominados registrados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoría</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ordenar por</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un orden" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nombre</SelectItem>
                      <SelectItem value="votes">Votos (mayor a menor)</SelectItem>
                      <SelectItem value="votes_asc">Votos (menor a mayor)</SelectItem>
                      <SelectItem value="category">Categoría</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Formato</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Incluir detalles</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona opciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Información básica</SelectItem>
                      <SelectItem value="detailed">Información detallada</SelectItem>
                      <SelectItem value="complete">Información completa con votos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generar Reporte
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Usuarios</CardTitle>
              <CardDescription>Genera un reporte detallado de los usuarios registrados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rol</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="admin">Administradores</SelectItem>
                      <SelectItem value="user">Usuarios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Período de registro</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo el tiempo</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mes</SelectItem>
                      <SelectItem value="year">Último año</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Formato</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Incluir información</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona opciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Información básica</SelectItem>
                      <SelectItem value="votes">Incluir votos realizados</SelectItem>
                      <SelectItem value="complete">Información completa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generar Reporte
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
