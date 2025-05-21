"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface UserRoleFormProps {
  userId: string
  currentRole: string
}

export function UserRoleForm({ userId, currentRole }: UserRoleFormProps) {
  const [role, setRole] = useState(currentRole)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleRoleChange(newRole: string) {
    setRole(newRole)
  }

  async function handleSave() {
    if (role === currentRole) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        id: userId,
        role: role as "admin" | "user",
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Error al actualizar el rol",
          description: error.message,
        })
        return
      }

      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado exitosamente",
      })
      router.refresh()
    } catch (error) {
      console.error("Error al actualizar rol:", error)
      toast({
        variant: "destructive",
        title: "Error al actualizar el rol",
        description: "Ha ocurrido un error inesperado",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Select value={role} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Seleccionar rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">Usuario</SelectItem>
          <SelectItem value="admin">Administrador</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={handleSave} disabled={isLoading || role === currentRole}>
        {isLoading ? "Guardando..." : "Guardar"}
      </Button>
    </div>
  )
}
