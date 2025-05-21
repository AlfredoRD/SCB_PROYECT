"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, X } from "lucide-react"
import { useSession } from "@/lib/hooks/use-session"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface VoteButtonProps {
  nomineeId: number
}

export default function VoteButton({ nomineeId }: VoteButtonProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [isUnvoting, setIsUnvoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [voteId, setVoteId] = useState<number | null>(null)
  const [voteTime, setVoteTime] = useState<Date | null>(null)
  const [canUnvote, setCanUnvote] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  // Verificar si el usuario ha votado y si puede desvotar
  useEffect(() => {
    async function checkIfVoted() {
      if (!session) return

      try {
        const { data, error } = await supabase
          .from("votes")
          .select("id, created_at")
          .eq("user_id", session.user.id)
          .eq("nominee_id", nomineeId)

        if (error) {
          console.error("Error al verificar votos:", error)
          return
        }

        if (data && data.length > 0) {
          setHasVoted(true)
          setVoteId(data[0].id)

          // Verificar si el voto fue realizado hace menos de 2 horas
          const voteDate = new Date(data[0].created_at)
          setVoteTime(voteDate)

          const now = new Date()
          const timeDiff = now.getTime() - voteDate.getTime()
          const hoursDiff = timeDiff / (1000 * 60 * 60)

          setCanUnvote(hoursDiff < 2)
        }
      } catch (err) {
        console.error("Error inesperado al verificar votos:", err)
      }
    }

    if (session) {
      checkIfVoted()
    }
  }, [session, nomineeId])

  // Formatear tiempo restante para desvotar
  const getRemainingTime = () => {
    if (!voteTime) return ""

    const now = new Date()
    const timeDiff = now.getTime() - voteTime.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)

    if (hoursDiff >= 2) return "Tiempo expirado"

    const minutesRemaining = Math.floor((2 - hoursDiff) * 60)
    return `${minutesRemaining} minutos restantes`
  }

  // Manejar el voto
  async function handleVote() {
    if (!session) {
      toast({
        title: "Inicia sesión para votar",
        description: "Debes iniciar sesión para poder votar por los nominados",
      })

      // Guardar la URL actual para redirigir después del inicio de sesión
      const currentPath = window.location.pathname + window.location.hash
      localStorage.setItem("redirectAfterLogin", currentPath)

      // Usar parámetros de URL para redirigir después del login
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    setIsVoting(true)
    try {
      // Verificar si el usuario ya ha votado por este nominado
      const { data: existingVotes, error: checkError } = await supabase
        .from("votes")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("nominee_id", nomineeId)

      if (checkError) {
        console.error("Error al verificar voto existente:", checkError)
        toast({
          title: "Error al verificar voto",
          description: "No se pudo verificar si ya has votado. Por favor, intenta de nuevo.",
          variant: "destructive",
        })
        setIsVoting(false)
        return
      }

      if (existingVotes && existingVotes.length > 0) {
        toast({
          title: "Ya has votado",
          description: "Ya has votado por este nominado anteriormente",
        })
        setHasVoted(true)
        setVoteId(existingVotes[0].id)
        setVoteTime(new Date(existingVotes[0].created_at))
        setIsVoting(false)
        return
      }

      // Insertar nuevo voto - el trigger se encargará de incrementar el contador
      const { data, error: insertError } = await supabase
        .from("votes")
        .insert({
          user_id: session.user.id,
          nominee_id: nomineeId,
        })
        .select()

      if (insertError) {
        console.error("Error al insertar voto:", insertError)

        let errorMessage = "Ha ocurrido un error al registrar tu voto. Por favor, intenta de nuevo."

        if (insertError.code === "23505") {
          errorMessage = "Ya has votado por este nominado anteriormente."
          setHasVoted(true)
        }

        toast({
          title: "Error al votar",
          description: errorMessage,
          variant: "destructive",
        })
        setIsVoting(false)
        return
      }

      if (data && data.length > 0) {
        setVoteId(data[0].id)
        setVoteTime(new Date(data[0].created_at))
        setCanUnvote(true)
      }

      toast({
        title: "Voto registrado",
        description: "Tu voto ha sido registrado correctamente",
      })
      setHasVoted(true)
      router.refresh()
    } catch (error) {
      console.error("Error inesperado al votar:", error)
      toast({
        title: "Error al votar",
        description: "Ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  // Manejar el desvoto
  async function handleUnvote() {
    if (!session || !voteId || !canUnvote) return

    setIsUnvoting(true)
    try {
      const { error } = await supabase.from("votes").delete().eq("id", voteId).eq("user_id", session.user.id)

      if (error) {
        console.error("Error al eliminar voto:", error)

        let errorMessage = "Ha ocurrido un error al eliminar tu voto. Por favor, intenta de nuevo."

        if (error.message.includes("policy")) {
          errorMessage = "No puedes eliminar este voto porque han pasado más de 2 horas."
          setCanUnvote(false)
        }

        toast({
          title: "Error al eliminar voto",
          description: errorMessage,
          variant: "destructive",
        })
        setIsUnvoting(false)
        return
      }

      toast({
        title: "Voto eliminado",
        description: "Tu voto ha sido eliminado correctamente",
      })

      setHasVoted(false)
      setVoteId(null)
      setVoteTime(null)
      setCanUnvote(false)
      router.refresh()
    } catch (error) {
      console.error("Error inesperado al eliminar voto:", error)
      toast({
        title: "Error al eliminar voto",
        description: "Ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsUnvoting(false)
      setShowConfirmDialog(false)
    }
  }

  // Si el usuario ha votado y puede desvotar, mostrar botón de desvotar
  if (hasVoted && canUnvote) {
    return (
      <>
        <Button
          onClick={() => setShowConfirmDialog(true)}
          disabled={isUnvoting}
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
        >
          <X className="mr-2 h-4 w-4" />
          {isUnvoting ? "Eliminando..." : "Eliminar voto"}
          <span className="ml-2 text-xs text-muted-foreground">({getRemainingTime()})</span>
        </Button>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará tu voto para este nominado. Solo puedes eliminar votos dentro de las 2 horas
                después de votar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnvote}>Eliminar voto</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // Si el usuario ha votado pero no puede desvotar
  if (hasVoted) {
    return (
      <Button disabled={true} variant="secondary" className="w-full">
        <ThumbsUp className="mr-2 h-4 w-4" />
        Votado
      </Button>
    )
  }

  // Si el usuario no ha votado
  return (
    <Button onClick={handleVote} disabled={isVoting} className="w-full">
      <ThumbsUp className="mr-2 h-4 w-4" />
      {isVoting ? "Procesando..." : "Votar"}
    </Button>
  )
}
