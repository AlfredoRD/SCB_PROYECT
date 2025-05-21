"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface DeleteEventButtonProps {
  eventId: number
  onDeleted: () => void
}

export function DeleteEventButton({ eventId, onDeleted }: DeleteEventButtonProps) {
  const supabase = createClientComponentClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase.from("events").delete().eq("id", eventId)

      if (deleteError) {
        if (deleteError.message.includes("does not exist")) {
          throw new Error("La tabla de eventos no existe. Por favor, cree la tabla primero.")
        }
        throw deleteError
      }

      onDeleted()
    } catch (err) {
      console.error("Error al eliminar evento:", err)
      setError(err instanceof Error ? err.message : "Error al eliminar el evento")
    } finally {
      setIsDeleting(false)
      setIsDialogOpen(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
        <Trash className="h-4 w-4" />
      </Button>

      <DeleteConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Evento"
        description="¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer."
        isDeleting={isDeleting}
        error={error}
      />
    </>
  )
}
