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

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    id: string | number
    name: string
    slug: string
    description: string
  }
}

export function CategoryModal({ isOpen, onClose, initialData }: CategoryModalProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  // Cargar datos iniciales cuando se abre el modal para edición
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setSlug(initialData.slug || "")
      setDescription(initialData.description || "")
    } else {
      // Resetear valores cuando se abre para crear nuevo
      setName("")
      setSlug("")
      setDescription("")
    }
  }, [initialData, isOpen])

  const generateSlug = () => {
    if (!name) return
    const newSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setSlug(newSlug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validación básica
      if (!name.trim()) {
        throw new Error("El nombre es obligatorio")
      }

      // Generar slug si está vacío
      const finalSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, "-")

      if (isEditing && initialData) {
        // Actualizar categoría existente
        const { error: updateError } = await supabase
          .from("categories")
          .update({
            name,
            slug: finalSlug,
            description,
            // Eliminamos updated_at ya que no existe en el esquema
          })
          .eq("id", initialData.id)

        if (updateError) throw updateError
      } else {
        // Crear nueva categoría
        const { error: insertError } = await supabase.from("categories").insert({
          name,
          slug: finalSlug,
          description,
        })

        if (insertError) throw insertError
      }

      // Cerrar modal y refrescar la página
      onClose()
      router.refresh()
    } catch (err) {
      console.error("Error al guardar categoría:", err)
      setError(err instanceof Error ? err.message : "Ha ocurrido un error al guardar la categoría")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los detalles de la categoría"
              : "Completa el formulario para crear una nueva categoría"}
          </DialogDescription>
          {/* Eliminamos el botón X personalizado y dejamos solo el DialogClose por defecto */}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => !slug && generateSlug()}
              placeholder="Ej: Mejor Actor"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Ej: mejor-actor"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={generateSlug} variant="outline" className="w-full" disabled={loading}>
                Generar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe esta categoría..."
              disabled={loading}
              rows={3}
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
