"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarDays } from 'lucide-react'
import { UnvoteButton } from "@/components/unvote-button"
import { Spinner } from "@/components/spinner"

export default function MisVotosPage() {
  const router = useRouter()
  const [votes, setVotes] = useState<any[]>([])
  const [nominees, setNominees] = useState<Record<number, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVotes() {
      try {
        // Verificar si el usuario está autenticado
        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData.session) {
          router.push("/login")
          return
        }

        // Obtener los votos del usuario
        const { data: userVotes, error: votesError } = await supabase
          .from("votes")
          .select("id, created_at, nominee_id, user_id")
          .eq("user_id", sessionData.session.user.id)
          .order("created_at", { ascending: false })

        if (votesError) {
          throw new Error(`Error al obtener votos: ${votesError.message}`)
        }

        if (!userVotes || userVotes.length === 0) {
          setVotes([])
          setLoading(false)
          return
        }

        // Obtener los IDs de los nominados
        const nomineeIds = userVotes.map((vote) => vote.nominee_id)

        // Obtener los detalles de los nominados
        const { data: nomineesData, error: nomineesError } = await supabase
          .from("nominees")
          .select("id, name, category, image_url, avatar_url, title")
          .in("id", nomineeIds)

        if (nomineesError) {
          throw new Error(`Error al obtener nominados: ${nomineesError.message}`)
        }

        // Crear un mapa de nominados por ID para fácil acceso
        const nomineesMap: Record<number, any> = {}
        nomineesData?.forEach((nominee) => {
          nomineesMap[nominee.id] = nominee
        })

        setNominees(nomineesMap)
        setVotes(userVotes)
      } catch (err: any) {
        console.error("Error:", err)
        setError(err.message || "Ha ocurrido un error al cargar tus votos")
      } finally {
        setLoading(false)
      }
    }

    fetchVotes()
  }, [router])

  // Función para verificar si un voto puede ser eliminado (menos de 2 horas)
  const canUnvote = (voteTime: string) => {
    const voteDate = new Date(voteTime)
    const now = new Date()
    const timeDiff = now.getTime() - voteDate.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    return hoursDiff < 2
  }

  // Función para formatear el tiempo restante
  const getRemainingTime = (voteTime: string) => {
    const voteDate = new Date(voteTime)
    const now = new Date()
    const timeDiff = now.getTime() - voteDate.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)

    if (hoursDiff >= 2) return null

    const minutesRemaining = Math.floor((2 - hoursDiff) * 60)
    return `${minutesRemaining} minutos restantes`
  }

  // Manejar la eliminación de un voto
  const handleVoteRemoved = (voteId: number) => {
    setVotes((prevVotes) => prevVotes.filter((vote) => vote.id !== voteId))
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="max-w-4xl mx-auto text-center">
          <Spinner />
          <p className="mt-4">Cargando tus votos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Mis Votos</h1>
          <p className="text-muted-foreground">Aquí puedes ver todos los nominados por los que has votado.</p>
        </div>

        {error ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <h3 className="text-xl font-medium mb-2 text-destructive">Error al cargar tus votos</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        ) : votes.length > 0 ? (
          <div className="space-y-6">
            {votes.map((vote) => {
              const nominee = nominees[vote.nominee_id]

              // Si no tenemos datos del nominado, mostrar un mensaje de error
              if (!nominee) {
                return (
                  <Card key={vote.id} className="bg-muted/10">
                    <CardHeader>
                      <CardTitle>Nominado no disponible</CardTitle>
                      <CardDescription>No se pudo cargar la información de este nominado</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarDays className="mr-1 h-4 w-4" />
                          <span>
                            Votado el{" "}
                            {new Date(vote.created_at).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        {canUnvote(vote.created_at) && (
                          <UnvoteButton voteId={vote.id} onVoteRemoved={handleVoteRemoved} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              }

              return (
                <Card key={vote.id}>
                  <CardHeader className="flex flex-row items-start space-y-0 pb-2">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={nominee.avatar_url || `/images/avatar-${Math.floor(Math.random() * 3) + 1}.png`}
                          alt={nominee.name}
                        />
                        <AvatarFallback>{nominee.name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{nominee.name}</CardTitle>
                        <CardDescription>
                          {nominee.category} - {nominee.title || "Sin título"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarDays className="mr-1 h-4 w-4" />
                        <span>
                          Votado el{" "}
                          {new Date(vote.created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>

                        {canUnvote(vote.created_at) && (
                          <span className="ml-2 text-xs">({getRemainingTime(vote.created_at)})</span>
                        )}
                      </div>

                      <div>
                        {canUnvote(vote.created_at) && (
                          <UnvoteButton voteId={vote.id} onVoteRemoved={handleVoteRemoved} />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <h3 className="text-xl font-medium mb-2">Aún no has votado</h3>
            <p className="text-muted-foreground mb-6">Explora los nominados y vota por tus favoritos.</p>
            <Button asChild>
              <a href="/nominados">Ver Nominados</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
