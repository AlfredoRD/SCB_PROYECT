"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface UnvoteButtonProps {
  voteId: number
  onVoteRemoved?: (voteId: number) => void
}

export function UnvoteButton({ voteId, onVoteRemoved }: UnvoteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleUnvote = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este voto?")) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from("votes").delete().eq("id", voteId)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Voto eliminado",
        description: "Tu voto ha sido eliminado correctamente.",
      })

      // Notificar al componente padre si se proporciona la función
      if (onVoteRemoved) {
        onVoteRemoved(voteId)
      } else {
        // Si no hay función de callback, refrescar la página
        router.refresh()
      }
    } catch (error: any) {
      console.error("Error al eliminar voto:", error)
      toast({
        title: "Error",
        description: `No se pudo eliminar el voto: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleUnvote} disabled={isLoading}>
      {isLoading ? (
        "Eliminando..."
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
        </>
      )}
    </Button>
  )
}
