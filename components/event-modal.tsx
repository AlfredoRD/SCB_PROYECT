"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    id: string | number
    title: string
    description: string | null
    location: string | null
    date: string
    image_url: string | null
  }
}

export function EventModal({ isOpen, onClose, initialData }: EventModalProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  // Cargar datos iniciales cuando se abre el modal para edición
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "")
      setDescription(initialData.description || "")
      setLocation(initialData.location || "")
      // Formatear la fecha para el input date
      if (initialData.date) {
        const date = new Date(initialData.date)
        const formattedDate = date.toISOString().split("T")[0]
        setEventDate(formattedDate)
      } else {
        setEventDate("")
      }
      setImageUrl(initialData.image_url || "")
    } else {
      // Resetear valores cuando se abre para crear nuevo
      setTitle("")
      setDescription("")
      setLocation("")
      setEventDate("")
      setImageUrl("")
    }

    // Resetear errores cuando se abre el modal
    setError(null)
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validación básica
      if (!title.trim()) {
        throw new Error("El título es obligatorio")
      }

      if (isEditing && initialData) {
        // Actualizar evento existente
        const { error: updateError } = await supabase
          .from("events")
          .update({
            title,
            description,
            location,
            date: eventDate,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id)

        if (updateError) {
          throw updateError
        }

        toast({
          title: "Evento actualizado",
          description: "El evento ha sido actualizado correctamente",
        })
      } else {
        // Crear nuevo evento
        const { error: insertError } = await supabase.from("events").insert({
          title,
          description,
          location,
          date: eventDate,
          image_url: imageUrl,
          is_featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (insertError) {
          throw insertError
        }

        toast({
          title: "Evento creado",
          description: "El evento ha sido creado correctamente",
        })
      }

      // Cerrar modal y refrescar la página
      onClose()
      router.refresh()
    } catch (err) {
      console.error("Error al guardar evento:", err)
      setError(err instanceof Error ? err.message : "Ha ocurrido un error al guardar el evento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica los detalles del evento" : "Completa el formulario para crear un nuevo evento"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del evento"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el evento..."
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lugar del evento"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate">Fecha del Evento</Label>
            <Input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de Imagen</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
