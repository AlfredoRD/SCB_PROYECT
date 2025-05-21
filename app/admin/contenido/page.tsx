import Link from "next/link"
import { Users, Phone, Info, Home, FileText, ImageIcon, Award, ListChecks } from "lucide-react"

import { Button } from "@/components/ui/button"

const ContenidoPage = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Tarjeta para Equipo */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Nuestro Equipo</h3>
              <p className="text-sm text-muted-foreground">Edita la información de los miembros del equipo</p>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link href="/admin/contenido/equipo">Gestionar Equipo</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjeta para Contacto */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Contacto</h3>
              <p className="text-sm text-muted-foreground">Gestiona la información de contacto</p>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link href="/admin/contenido/contacto">Gestionar Contacto</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjeta para Sobre Nosotros */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Sobre Nosotros</h3>
              <p className="text-sm text-muted-foreground">Gestiona la información general sobre la organización</p>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link href="/admin/contenido/sobre-nosotros">Gestionar Sobre Nosotros</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjeta para Valores */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Nuestros Valores</h3>
              <p className="text-sm text-muted-foreground">Edita los valores de la organización</p>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link href="/admin/contenido/valores">Gestionar Valores</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjeta para Proceso de Selección */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <ListChecks className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Proceso de Selección</h3>
              <p className="text-sm text-muted-foreground">Edita la información sobre el proceso de selección</p>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link href="/admin/contenido/proceso-seleccion">Gestionar Proceso</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjeta para Página Principal */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Página Principal</h3>
              <p className="text-sm text-muted-foreground">Gestiona la información de la página principal</p>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link href="/admin/contenido/inicio">Gestionar Página Principal</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjeta para Pie de Página */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Pie de Página</h3>
              <p className="text-sm text-muted-foreground">Gestiona la información del pie de página</p>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link href="/admin/contenido/footer">Gestionar Pie de Página</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjeta para Imágenes del Sitio */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Imágenes del Sitio</h3>
              <p className="text-sm text-muted-foreground">Gestiona el logo y las imágenes principales del sitio</p>
            </div>
          </div>
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link href="/admin/contenido/imagenes">Gestionar Imágenes</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContenidoPage
