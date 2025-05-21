"use client"

import { supabase } from "@/lib/supabase/client"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface DeleteVoteButtonProps {
  voteId: number
  nomineeInfo: string
  variant?: "ghost" | "destructive" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function DeleteVoteButton({
  voteId,
  nomineeInfo,
  variant = "ghost",
  size = "icon",
  className = "",
}: DeleteVoteButtonProps) {
  const handleDelete = async (id: number | string) => {
    const numericId = typeof id === "string" ? Number.parseInt(id) : id

    // Eliminar el voto
    const { error } = await supabase.from("votes").delete().eq("id", numericId)

    if (error) {
      throw new Error(`Error al eliminar voto: ${error.message}`)
    }
  }

  return (
    <DeleteConfirmationDialog
      id={voteId}
      title="Eliminar Voto"
      description={`Esta acción eliminará permanentemente el voto para "${nomineeInfo}". Esta acción no se puede deshacer.`}
      onDelete={handleDelete}
      variant={variant}
      size={size}
      className={className}
    />
  )
}
