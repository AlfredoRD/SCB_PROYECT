"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Trash2 } from "lucide-react"

interface DeleteNomineeButtonProps {
  id?: string
  nomineeId: number
  nomineeName: string
  onSuccess?: () => void
  variant?: "ghost" | "destructive" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function DeleteNomineeButton({
  id,
  nomineeId,
  nomineeName,
  onSuccess,
  variant = "ghost",
  size = "icon",
  className = "",
  children,
}: DeleteNomineeButtonProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleDelete = async (id: number | string) => {
    const numericId = typeof id === "string" ? Number.parseInt(id) : id

    // Primero eliminar los votos asociados a este nominado
    const { error: votesError } = await supabase.from("votes").delete().eq("nominee_id", numericId)

    if (votesError) {
      throw new Error(`Error al eliminar votos: ${votesError.message}`)
    }

    // Luego eliminar el nominado
    const { error } = await supabase.from("nominees").delete().eq("id", numericId)

    if (error) {
      throw new Error(`Error al eliminar nominado: ${error.message}`)
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
      itemId={nomineeId}
      title="Eliminar Nominado"
      description={`Esta acción eliminará permanentemente al nominado "${nomineeName}" y todos sus votos asociados. Esta acción no se puede deshacer.`}
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
