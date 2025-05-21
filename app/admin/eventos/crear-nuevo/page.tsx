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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { CreateEventsTableDirect } from "@/components/create-events-table-direct"

export default function CrearNuevoEventoPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [tableError, setTableError] = useState<string | null>(null)
  const [checkingTable, setCheckingTable] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    image_url: "",
  })

  // Verificar la estructura de la tabla al cargar la página
  useEffect(() => {
    const checkTableStructure = async () => {
      try {
        // Intentar una consulta simple para verificar si la tabla existe y tiene la estructura correcta
        const { error } = await supabase.from("events").select("title").limit(1)

        if (error) {
          if (
            error.message.includes("does not exist") ||
            error.message.includes("column") ||
            error.message.includes("schema cache")
          ) {
            setTableError("La tabla de eventos no existe o tiene una estructura incorrecta.")
          } else {
            console.error("Error al verificar tabla:", error)
          }
        }
      } catch (err) {
        console.error("Error al verificar tabla:", err)
      } finally {
        setCheckingTable(false)
      }
    }

    checkTableStructure()
  }, [supabase])

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

      // Crear evento
      const { error } = await supabase.from("events").insert({
        title: formData.title,
        description: formData.description || null,
        date: formData.date || null,
        location: formData.location || null,
        image_url: formData.image_url || null,
      })

      if (error) {
        // Si hay un error específico con la columna title o la estructura de la tabla
        if (
          error.message.includes("column") ||
          error.message.includes("does not exist") ||
          error.message.includes("schema cache")
        ) {
          setTableError("Error con la estructura de la tabla. Por favor, corrige la estructura antes de continuar.")
          throw new Error("Error con la estructura de la tabla. Por favor, corrige la estructura antes de continuar.")
        }
        throw error
      }

      toast({
        title: "Evento creado",
        description: "El evento ha sido creado exitosamente.",
      })

      router.push("/admin/eventos")
    } catch (error) {
      console.error("Error al crear evento:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al crear el evento.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Si estamos verificando la tabla, mostrar un indicador de carga
  if (checkingTable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verificando estructura de la tabla...</p>
      </div>
    )
  }

  // Si hay un error con la tabla, mostrar la interfaz de corrección
  if (tableError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Nuevo Evento</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/eventos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error con la tabla de eventos</AlertTitle>
          <AlertDescription>
            {tableError} Para resolver este problema, haz clic en el botón a continuación para crear la tabla de eventos
            con la estructura correcta.
          </AlertDescription>
        </Alert>

        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Crear tabla de eventos</h3>
            <p className="text-muted-foreground">
              Esta operación creará la tabla de eventos con la estructura correcta. Si la tabla ya existe, será
              reemplazada.
            </p>
            <CreateEventsTableDirect />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Nuevo Evento</h2>
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
              Crear Evento
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
