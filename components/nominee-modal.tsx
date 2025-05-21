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

interface NomineeModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    id: string | number
    name: string
    description: string
    image_url: string
    category: string
  }
}

export function NomineeModal({ isOpen, onClose, initialData }: NomineeModalProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<any[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  // Cargar categorías al montar el componente
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("id, name").order("name")
      setCategories(data || [])
    }

    if (isOpen) {
      fetchCategories()
    }
  }, [supabase, isOpen])

  // Cargar datos iniciales cuando se abre el modal para edición
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setDescription(initialData.description || "")
      setImageUrl(initialData.image_url || "")
      setCategory(initialData.category || "")
    } else {
      // Resetear valores cuando se abre para crear nuevo
      setName("")
      setDescription("")
      setImageUrl("")
      setCategory("")
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validación básica
      if (!name.trim()) {
        throw new Error("El nombre es obligatorio")
      }
      if (!category) {
        throw new Error("Debes seleccionar una categoría")
      }

      if (isEditing && initialData) {
        // Actualizar nominado existente
        const { error: updateError } = await supabase
          .from("nominees")
          .update({
            name,
            description,
            image_url: imageUrl,
            category,
            // Eliminamos updated_at ya que no existe en el esquema
          })
          .eq("id", initialData.id)

        if (updateError) throw updateError
      } else {
        // Crear nuevo nominado
        const { error: insertError } = await supabase.from("nominees").insert({
          name,
          description,
          image_url: imageUrl,
          category,
        })

        if (insertError) throw insertError
      }

      // Cerrar modal y refrescar la página
      onClose()
      router.refresh()
    } catch (err) {
      console.error("Error al guardar nominado:", err)
      setError(err instanceof Error ? err.message : "Ha ocurrido un error al guardar el nominado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Nominado" : "Nuevo Nominado"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica los detalles del nominado" : "Completa el formulario para crear un nuevo nominado"}
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
              placeholder="Nombre del nominado"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe al nominado..."
              disabled={loading}
              rows={3}
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
