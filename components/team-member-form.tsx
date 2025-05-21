"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/spinner"
import { supabase } from "@/lib/supabase/client"
import { Plus, Trash, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TeamMember {
  name: string
  role: string
  bio: string
  image: string
}

interface TeamMemberFormProps {
  initialData: {
    id?: string
    section: string
    title: string
    content: {
      members: TeamMember[]
    }
  }
}

export function TeamMemberForm({ initialData }: TeamMemberFormProps) {
  const [title, setTitle] = useState(initialData.title)
  const [members, setMembers] = useState<TeamMember[]>(initialData.content.members || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleAddMember = () => {
    setMembers([
      ...members,
      {
        name: "",
        role: "",
        bio: "",
        image: "/placeholder.svg",
      },
    ])
  }

  const handleRemoveMember = (index: number) => {
    const newMembers = [...members]
    newMembers.splice(index, 1)
    setMembers(newMembers)
  }

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...members]
    newMembers[index][field] = value
    setMembers(newMembers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const content = {
        members,
      }

      if (initialData.id) {
        // Actualizar contenido existente
        const { error } = await supabase
          .from("content")
          .update({
            title,
            content,
          })
          .eq("id", initialData.id)

        if (error) throw error
      } else {
        // Crear nuevo contenido
        const { error } = await supabase.from("content").insert({
          section: initialData.section,
          title,
          content,
        })

        if (error) throw error
      }

      toast({
        title: "Equipo actualizado",
        description: "La información del equipo se ha actualizado correctamente",
      })

      router.refresh()
    } catch (error) {
      console.error("Error al guardar equipo:", error)
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message || "Ha ocurrido un error inesperado",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Sección</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la sección"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Miembros del Equipo</h2>
          <Button type="button" onClick={handleAddMember} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Miembro
          </Button>
        </div>

        {members.map((member, index) => (
          <Card key={index}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Miembro {index + 1}</CardTitle>
                <Button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>Nombre</Label>
                  <Input
                    id={`name-${index}`}
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                    placeholder="Nombre del miembro"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`role-${index}`}>Cargo</Label>
                  <Input
                    id={`role-${index}`}
                    value={member.role}
                    onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                    placeholder="Cargo del miembro"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`bio-${index}`}>Biografía</Label>
                <Textarea
                  id={`bio-${index}`}
                  value={member.bio}
                  onChange={(e) => handleMemberChange(index, "bio", e.target.value)}
                  placeholder="Biografía del miembro"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`image-${index}`}>URL de la Imagen</Label>
                <Input
                  id={`image-${index}`}
                  value={member.image}
                  onChange={(e) => handleMemberChange(index, "image", e.target.value)}
                  placeholder="URL de la imagen"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Ingresa la URL de la imagen o usa "/placeholder.svg" para una imagen predeterminada.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/contenido">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
