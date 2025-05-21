"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface EventFormProps {
  event?: {
    id: string
    title: string
    description: string
    date: string
    location: string
    image_url: string | null
  }
  onSubmit: (formData: FormData) => Promise<void>
  loading: boolean
}

export function EventForm({ event, onSubmit, loading }: EventFormProps) {
  // Formatear la fecha para el input date si existe
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  const [title, setTitle] = useState(event?.title || "")
  const [description, setDescription] = useState(event?.description || "")
  const [date, setDate] = useState(formatDate(event?.date))
  const [location, setLocation] = useState(event?.location || "")
  const [imageUrl, setImageUrl] = useState(event?.image_url || "")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("date", date)
    formData.append("location", location)
    formData.append("image_url", imageUrl)
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="date">Fecha del Evento</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={loading}
          required
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
        <Label htmlFor="imageUrl">URL de Imagen</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
          disabled={loading}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {event ? "Actualizar Evento" : "Crear Evento"}
        </Button>
      </div>
    </form>
  )
}
