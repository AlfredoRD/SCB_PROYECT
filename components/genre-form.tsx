"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GenreFormProps {
  initialData?: {
    id: string
    name: string
    slug: string
    description: string
    icon: string
  }
}

export function GenreForm({ initialData }: GenreFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [name, setName] = useState(initialData?.name || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [icon, setIcon] = useState(initialData?.icon || "")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!initialData

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

      if (isEditing) {
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

      // Redireccionar a la lista de géneros
      router.push("/admin/generos-artisticos")
      router.refresh()
    } catch (err) {
      console.error("Error al guardar género:", err)
      setError(err instanceof Error ? err.message : "Ha ocurrido un error al guardar el género")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          placeholder="Ej: Música"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Ej: musica (se generará automáticamente si se deja vacío)"
          disabled={loading}
        />
        <p className="text-sm text-muted-foreground">
          Identificador único para URLs. Se generará automáticamente si se deja vacío.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe este género artístico..."
          disabled={loading}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icono</Label>
        <Input
          id="icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="Ej: music"
          disabled={loading}
        />
        <p className="text-sm text-muted-foreground">Nombre del icono (se utilizan iconos de Lucide React)</p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? "Actualizar género" : "Crear género"}
      </Button>
    </form>
  )
}
