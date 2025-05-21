import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminConfiguracion() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Configuración</h2>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
          <TabsTrigger value="votacion">Votación</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Sitio</CardTitle>
              <CardDescription>Configura la información básica del sitio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Nombre del Sitio</Label>
                <Input id="site-name" defaultValue="Premios San Cristóbal" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site-description">Descripción</Label>
                <Textarea id="site-description" defaultValue="Honrando la Excelencia y el Legado" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">Email de Contacto</Label>
                <Input id="contact-email" type="email" defaultValue="info@premiossancristobal.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-text">Texto del Pie de Página</Label>
                <Input id="footer-text" defaultValue="© 2023 Premios San Cristóbal. Todos los derechos reservados." />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Guardar Cambios</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>Configura los enlaces a tus redes sociales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  placeholder="URL de Facebook"
                  defaultValue="https://facebook.com/PremiosSanCristobal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input id="twitter" placeholder="URL de Twitter" defaultValue="https://twitter.com/PremiosSC" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  placeholder="URL de Instagram"
                  defaultValue="https://instagram.com/premiossancristobal"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="apariencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tema</CardTitle>
              <CardDescription>Personaliza la apariencia del sitio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema Predeterminado</Label>
                <Select defaultValue="dark">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Según el sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary-color">Color Primario</Label>
                <div className="flex items-center gap-2">
                  <Input id="primary-color" type="color" defaultValue="#E11D48" className="w-16 h-10" />
                  <Input defaultValue="#E11D48" className="flex-1" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font">Fuente Principal</Label>
                <Select defaultValue="inter">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una fuente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="opensans">Open Sans</SelectItem>
                    <SelectItem value="montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="allow-user-theme" defaultChecked />
                <Label htmlFor="allow-user-theme">Permitir a los usuarios cambiar el tema</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Guardar Cambios</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logotipo e Imágenes</CardTitle>
              <CardDescription>Configura las imágenes del sitio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logotipo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded border flex items-center justify-center bg-muted">Logo</div>
                  <Button variant="outline">Cambiar Logo</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon</Label>
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded border flex items-center justify-center bg-muted">Ico</div>
                  <Button variant="outline">Cambiar Favicon</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-image">Imagen de Portada</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-32 rounded border flex items-center justify-center bg-muted">Portada</div>
                  <Button variant="outline">Cambiar Imagen</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="votacion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Votación</CardTitle>
              <CardDescription>Configura las opciones de votación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="voting-enabled" defaultChecked />
                <Label htmlFor="voting-enabled">Habilitar votación</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="require-login" defaultChecked />
                <Label htmlFor="require-login">Requerir inicio de sesión para votar</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="one-vote-per-category" />
                <Label htmlFor="one-vote-per-category">Limitar a un voto por categoría</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="show-vote-count" defaultChecked />
                <Label htmlFor="show-vote-count">Mostrar conteo de votos públicamente</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voting-end-date">Fecha de cierre de votación</Label>
                <Input id="voting-end-date" type="datetime-local" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>Configura las notificaciones del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="email-notifications" defaultChecked />
                <Label htmlFor="email-notifications">Notificaciones por email</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Email para notificaciones administrativas</Label>
                <Input id="admin-email" type="email" defaultValue="admin@premiossancristobal.com" />
              </div>

              <div className="space-y-4 border rounded-md p-4">
                <h3 className="font-medium">Notificaciones para administradores</h3>

                <div className="flex items-center space-x-2">
                  <Switch id="notify-new-user" defaultChecked />
                  <Label htmlFor="notify-new-user">Nuevo usuario registrado</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notify-new-vote" defaultChecked />
                  <Label htmlFor="notify-new-vote">Nuevo voto registrado</Label>
                </div>
              </div>

              <div className="space-y-4 border rounded-md p-4">
                <h3 className="font-medium">Notificaciones para usuarios</h3>

                <div className="flex items-center space-x-2">
                  <Switch id="notify-welcome" defaultChecked />
                  <Label htmlFor="notify-welcome">Mensaje de bienvenida</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notify-vote-confirmation" defaultChecked />
                  <Label htmlFor="notify-vote-confirmation">Confirmación de voto</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>Configura las opciones de seguridad del sitio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="require-email-verification" defaultChecked />
                <Label htmlFor="require-email-verification">Requerir verificación de email</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="allow-social-login" defaultChecked />
                <Label htmlFor="allow-social-login">Permitir inicio de sesión con redes sociales</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-min-length">Longitud mínima de contraseña</Label>
                <Select defaultValue="8">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una longitud" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 caracteres</SelectItem>
                    <SelectItem value="8">8 caracteres</SelectItem>
                    <SelectItem value="10">10 caracteres</SelectItem>
                    <SelectItem value="12">12 caracteres</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="require-strong-password" defaultChecked />
                <Label htmlFor="require-strong-password">Requerir contraseñas fuertes</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Tiempo de expiración de sesión</Label>
                <Select defaultValue="24h">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tiempo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hora</SelectItem>
                    <SelectItem value="8h">8 horas</SelectItem>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="7d">7 días</SelectItem>
                    <SelectItem value="30d">30 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Guardar Cambios</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Copia de Seguridad</CardTitle>
              <CardDescription>Gestiona las copias de seguridad de la base de datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-backup" defaultChecked />
                <Label htmlFor="auto-backup">Copias de seguridad automáticas</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Frecuencia de copias de seguridad</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diaria</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-retention">Retención de copias de seguridad</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 días</SelectItem>
                    <SelectItem value="30">30 días</SelectItem>
                    <SelectItem value="90">90 días</SelectItem>
                    <SelectItem value="365">1 año</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="w-full">
                Crear Copia de Seguridad Manual
              </Button>
            </CardContent>
            <CardFooter>
              <Button>Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
