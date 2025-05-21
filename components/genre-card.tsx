import Link from "next/link"
import { Icons } from "@/components/icons"
import { CircleHelp } from "lucide-react"

interface Genre {
  id: number
  name: string
  slug: string
  description: string
  icon: string | null
}

interface GenreCardProps {
  genre: Genre
  memberCount: number
}

export function GenreCard({ genre, memberCount }: GenreCardProps) {
  // Usar un enfoque más seguro para obtener el icono
  let IconComponent = CircleHelp // Icono por defecto

  try {
    // Solo intentar usar el icono si existe y no es null
    if (genre.icon && typeof genre.icon === "string") {
      const iconName = genre.icon.trim()
      if (iconName && Icons[iconName]) {
        IconComponent = Icons[iconName]
      }
    }
  } catch (error) {
    console.error("Error al cargar el icono:", error)
    // Mantener el icono por defecto
  }

  return (
    <Link href={`/academia/${genre.slug}`}>
      <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">{genre.name}</h2>
        </div>
        <p className="text-muted-foreground mb-4">{genre.description || "Sin descripción"}</p>
        <div className="text-sm text-muted-foreground">
          {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
        </div>
      </div>
    </Link>
  )
}
