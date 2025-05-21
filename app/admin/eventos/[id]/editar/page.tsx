"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Spinner } from "@/components/spinner"

export default function EditarEventoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    image_url: "",
  })

  useEffect(() => {
    const fetchEvent = async () => {
      setFetchLoading(true)
      try {
        const { data, error } = await supabase.from("events").select("*").eq("id", params.id).single()

        if (error) {
          throw error
        }

        if (!data) {
          throw new Error("Evento no encontrado")
        }

        // Formatear la fecha para el input date
        let formattedDate = ""
        if (data.date) {
          const date = new Date(data.date)
          formattedDate = date.toISOString().split("T")[0]
        }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          date: formattedDate,
          location: data.location || "",
          image_url: data.image_url || "",
        })
      } catch (error) {
        console.error("Error al cargar evento:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el evento. Por favor, inténtalo de nuevo.",
        })
        router.push("/admin/eventos")
      } finally {
        setFetchLoading(false)
      }
    }

    fetchEvent()
  }, [params.id, supabase, toast, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validación básica
      if (!formData.title.trim()) {
        throw new Error("El título es obligatorio")
      }

      // Actualizar evento
      const { error } = await supabase
        .from("events")
        .update({
          title: formData.title,
          description: formData.description || null,
          date: formData.date || null,
          location: formData.location || null,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (error) {
        // Si hay un error específico con la columna title
        if (error.message.includes("column") && error.message.includes("title")) {
          throw new Error("Error con la estructura de la tabla. Por favor, actualiza la caché del esquema.")
        }
        throw error
      }

      toast({
        title: "Evento actualizado",
        description: "El evento ha sido actualizado exitosamente.",
      })

      router.push("/admin/eventos")
    } catch (error) {
      console.error("Error al actualizar evento:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al actualizar el evento.",
      })

      // Si es un error de caché de esquema, redirigir a la página de eventos para mostrar la solución
      if (error instanceof Error && error.message.includes("caché del esquema")) {
        router.push("/admin/eventos")
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Editar Evento</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/eventos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título del evento"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción del evento"
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ubicación del evento"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de imagen</Label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/eventos")} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Actualizar Evento
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
