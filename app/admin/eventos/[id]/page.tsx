"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Calendar, Edit, MapPin, Trash2 } from "lucide-react"
import Link from "next/link"
import { Spinner } from "@/components/spinner"
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

// Función para verificar si un string es un UUID válido
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export default function VerEventoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirigir si el ID no es un UUID válido
  useEffect(() => {
    if (params.id === "nuevo" || !isValidUUID(params.id)) {
      router.push("/admin/eventos")
      return
    }
  }, [params.id, router])

  useEffect(() => {
    // No cargar si el ID no es válido
    if (params.id === "nuevo" || !isValidUUID(params.id)) {
      return
    }

    const fetchEvent = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("events").select("*").eq("id", params.id).single()

        if (error) {
          throw error
        }

        if (!data) {
          throw new Error("Evento no encontrado")
        }

        setEvent(data)
        setError(null)
      } catch (error) {
        console.error("Error al cargar evento:", error)
        setError(error instanceof Error ? error.message : "Error al cargar el evento")
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el evento. Por favor, inténtalo de nuevo.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.id, supabase, toast])

  // Si el ID no es válido, mostrar un spinner mientras redirige
  if (params.id === "nuevo" || !isValidUUID(params.id)) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Redirigiendo...</span>
      </div>
    )
  }

  const handleDeleteConfirm = async () => {
    if (!event) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("events").delete().eq("id", params.id)

      if (error) {
        throw error
      }

      toast({
        title: "Evento eliminado",
        description: "El evento ha sido eliminado exitosamente.",
      })

      router.push("/admin/eventos")
    } catch (error) {
      console.error("Error al eliminar evento:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el evento. Por favor, inténtalo de nuevo.",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Sin fecha"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Error</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/eventos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a eventos
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">No se pudo cargar el evento</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "El evento no existe o no se pudo cargar"}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/admin/eventos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a eventos
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Detalles del Evento</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/eventos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          {event.date && (
            <CardDescription className="flex items-center text-base">
              <Calendar className="mr-2 h-4 w-4" />
              {formatDate(event.date)}
            </CardDescription>
          )}
          {event.location && (
            <CardDescription className="flex items-center text-base">
              <MapPin className="mr-2 h-4 w-4" />
              {event.location}
            </CardDescription>
          )}
        </CardHeader>
        {event.image_url && (
          <div className="px-6">
            <img
              src={event.image_url || "/placeholder.svg"}
              alt={event.title}
              className="w-full h-64 object-cover rounded-md"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
                e.currentTarget.alt = "Imagen no disponible"
              }}
            />
          </div>
        )}
        <CardContent className="pt-6">
          <div className="prose max-w-none">
            <p>{event.description || "Sin descripción"}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/admin/eventos/${params.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el evento "{event?.title}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
