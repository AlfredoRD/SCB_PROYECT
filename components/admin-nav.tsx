"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const adminRoutes = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/nominados", label: "Nominados" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/votos", label: "Votos" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/estadisticas", label: "Estadísticas" },
  { href: "/admin/generos-artisticos", label: "Géneros Artísticos" },
  { href: "/admin/miembros-academia", label: "Miembros Academia" },
  { href: "/admin/contenido", label: "Contenido" },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {adminRoutes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
            pathname === route.href || pathname.startsWith(`${route.href}/`)
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted",
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
