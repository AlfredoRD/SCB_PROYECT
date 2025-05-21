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

interface AcademyMemberModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    id: string | number
    name: string
    bio: string
    photo_url: string
    genre_id: string | number
  }
}

export function AcademyMemberModal({ isOpen, onClose, initialData }: AcademyMemberModalProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [genreId, setGenreId] = useState("")
  const [genres, setGenres] = useState<any[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

  // Cargar géneros al montar el componente
  useEffect(() => {
    async function fetchGenres() {
      const { data } = await supabase.from("artistic_genres").select("id, name").order("name")
      setGenres(data || [])
    }

    if (isOpen) {
      fetchGenres()
    }
  }, [supabase, isOpen])

  // Cargar datos iniciales cuando se abre el modal para edición
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setBio(initialData.bio || "")
      setPhotoUrl(initialData.photo_url || "")
      setGenreId(initialData.genre_id ? String(initialData.genre_id) : "")
    } else {
      // Resetear valores cuando se abre para crear nuevo
      setName("")
      setBio("")
      setPhotoUrl("")
      setGenreId("")
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
      if (!genreId) {
        throw new Error("Debes seleccionar un género artístico")
      }

      if (isEditing && initialData) {
        // Actualizar miembro existente
        const { error: updateError } = await supabase
          .from("academy_members")
          .update({
            name,
            bio,
            photo_url: photoUrl,
            genre_id: genreId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id)

        if (updateError) throw updateError
      } else {
        // Crear nuevo miembro
        const { error: insertError } = await supabase.from("academy_members").insert({
          name,
          bio,
          photo_url: photoUrl,
          genre_id: genreId,
        })

        if (insertError) throw insertError
      }

      // Cerrar modal y refrescar la página
      onClose()
      router.refresh()
    } catch (err) {
      console.error("Error al guardar miembro:", err)
      setError(err instanceof Error ? err.message : "Ha ocurrido un error al guardar el miembro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Miembro" : "Nuevo Miembro"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los detalles del miembro de la academia"
              : "Completa el formulario para crear un nuevo miembro"}
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
              placeholder="Nombre completo"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Género Artístico</Label>
            <Select value={genreId} onValueChange={setGenreId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un género artístico" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre.id} value={String(genre.id)}>
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Biografía del miembro..."
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoUrl">URL de Imagen</Label>
            <Input
              id="photoUrl"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
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
