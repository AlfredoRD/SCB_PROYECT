import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  name?: string | null
  imageUrl?: string | null
  className?: string
}

export function UserAvatar({ name, imageUrl, className = "" }: UserAvatarProps) {
  // Función para generar iniciales a partir del nombre completo
  const getInitials = (fullName: string) => {
    const names = fullName.split(" ")

    if (names.length >= 2) {
      // Tomar las dos primeras letras del nombre y apellido
      const firstName = names[0]
      const lastName = names[1]
      return `${firstName.substring(0, 2)}${lastName.substring(0, 2)}`.toUpperCase()
    } else if (names.length === 1) {
      // Si solo hay un nombre, tomar las dos primeras letras
      return names[0].substring(0, 2).toUpperCase()
    }

    return "US" // Usuario por defecto
  }

  return (
    <Avatar className={className}>
      {imageUrl && <AvatarImage src={imageUrl || "/placeholder.svg"} alt={name || "Usuario"} />}
      <AvatarFallback>{name ? getInitials(name) : "US"}</AvatarFallback>
    </Avatar>
  )
}
