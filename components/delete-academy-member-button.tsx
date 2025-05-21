"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Trash2 } from "lucide-react"

interface DeleteAcademyMemberButtonProps {
  id?: string
  memberId: number
  memberName: string
  onSuccess?: () => void
  variant?: "ghost" | "destructive" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function DeleteAcademyMemberButton({
  id,
  memberId,
  memberName,
  onSuccess,
  variant = "ghost",
  size = "icon",
  className = "",
  children,
}: DeleteAcademyMemberButtonProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleDelete = async (id: number | string) => {
    const numericId = typeof id === "string" ? Number.parseInt(id) : id

    // Eliminar el miembro
    const { error } = await supabase.from("academy_members").delete().eq("id", numericId)

    if (error) {
      throw new Error(`Error al eliminar miembro: ${error.message}`)
    }

    // Llamar a la función onSuccess si existe
    if (onSuccess) {
      onSuccess()
    }

    // Refrescar la página para actualizar la tabla
    router.refresh()
  }

  return (
    <DeleteConfirmationDialog
      id={id}
      itemId={memberId}
      title="Eliminar Miembro"
      description={`Esta acción eliminará permanentemente al miembro "${memberName}" de la academia. Esta acción no se puede deshacer.`}
      onDelete={handleDelete}
      variant={variant}
      size={size}
      className={className}
    >
      {children || (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </>
      )}
    </DeleteConfirmationDialog>
  )
}
