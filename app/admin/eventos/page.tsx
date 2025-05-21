"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Eye, Pencil, Plus, Trash2 } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { Spinner } from "@/components/spinner"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { EventModal } from "@/components/event-modal"

export default function EventsPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showNewEventModal, setShowNewEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true })

      if (error) {
        throw error
      }

      setEvents(data || [])
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los eventos",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNewEvent = () => {
    setEditingEvent(null)
    setShowNewEventModal(true)
  }

  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setShowNewEventModal(true)
  }

  const handleDeleteClick = (event: any) => {
    setEventToDelete(event)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return

    setIsDeleting(true)
    try {
      // Eliminar el evento
      const { error } = await supabase.from("events").delete().eq("id", eventToDelete.id)

      if (error) {
        throw new Error(`Error al eliminar evento: ${error.message}`)
      }

      toast({
        title: "Evento eliminado",
        description: `El evento "${eventToDelete.title}" ha sido eliminado correctamente.`,
      })

      fetchEvents()
    } catch (error) {
      console.error("Error al eliminar:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el evento",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Sin fecha"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Eventos</h2>
        <Button onClick={handleNewEvent}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{events.length}</p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-8 w-8" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No hay eventos"
          description="No se han encontrado eventos. Crea un nuevo evento para empezar."
          action={
            <Button onClick={handleNewEvent}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {event.image_url ? (
                        <img
                          src={event.image_url || "/placeholder.svg"}
                          alt={event.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 rounded bg-muted items-center justify-center">
                          <Calendar className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.description?.substring(0, 50)}
                          {event.description?.length > 50 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/eventos/${event.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(event)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showNewEventModal && (
        <EventModal
          isOpen={showNewEventModal}
          onClose={() => {
            setShowNewEventModal(false)
            setEditingEvent(null)
            fetchEvents()
          }}
          initialData={editingEvent}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el evento "{eventToDelete?.title}". Esta acción no se puede
              deshacer.
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
