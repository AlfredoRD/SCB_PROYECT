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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GenreModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    id: string
    name: string
    slug: string
    description: string
    icon: string
  }
}

export function GenreModal({ isOpen, onClose, initialData }: GenreModalProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  // Cargar datos iniciales cuando se abre el modal para edición
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setSlug(initialData.slug || "")
      setDescription(initialData.description || "")
      setIcon(initialData.icon || "")
    } else {
      // Resetear valores cuando se abre para crear nuevo
      setName("")
      setSlug("")
      setDescription("")
      setIcon("")
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
        // Actualizar género existente
        const { error: updateError } = await supabase
          .from("artistic_genres")
          .update({
            name,
            slug: finalSlug,
            description,
            icon,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id)

        if (updateError) throw updateError
      } else {
        // Crear nuevo género
        const { error: insertError } = await supabase.from("artistic_genres").insert({
          name,
          slug: finalSlug,
          description,
          icon,
        })

        if (insertError) throw insertError
      }

      // Cerrar modal y refrescar la página
      onClose()
      router.refresh()
    } catch (err) {
      console.error("Error al guardar género:", err)
      setError(err instanceof Error ? err.message : "Ha ocurrido un error al guardar el género")
    } finally {
      setLoading(false)
    }
  }

  const iconOptions = [
    { value: "Music", label: "Música" },
    { value: "Film", label: "Cine/Teatro" },
    { value: "Image", label: "Artes Visuales" },
    { value: "BookOpen", label: "Literatura" },
    { value: "Mic2", label: "Voz" },
    { value: "Palette", label: "Pintura" },
    { value: "Camera", label: "Fotografía" },
    { value: "Users", label: "Grupo" },
    { value: "Sparkles", label: "Otros" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Género Artístico" : "Nuevo Género Artístico"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los detalles del género artístico"
              : "Completa el formulario para crear un nuevo género artístico"}
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
              placeholder="Ej: Música"
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
                placeholder="Ej: musica"
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
              placeholder="Describe este género artístico..."
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icono</Label>
            <Select value={icon} onValueChange={setIcon} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un icono" />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
