"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface AcademyMemberFormProps {
  initialData?: any
}

export default function AcademyMemberForm({ initialData }: AcademyMemberFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [genres, setGenres] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    genre_id: "",
    bio: "",
    photo_url: "",
    social_media: {
      twitter: "",
      instagram: "",
      facebook: "",
    },
    achievements: [] as string[],
    is_active: true,
  })

  useEffect(() => {
    const fetchGenres = async () => {
      const { data, error } = await supabase.from("artistic_genres").select("*")
      if (error) {
        console.error("Error fetching genres:", error)
        return
      }
      setGenres(data || [])
    }

    const fetchMember = async () => {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          genre_id: initialData.genre_id ? initialData.genre_id.toString() : "",
          bio: initialData.bio || "",
          photo_url: initialData.photo_url || "",
          social_media: initialData.social_media || {
            twitter: "",
            instagram: "",
            facebook: "",
          },
          achievements: initialData.achievements || [],
          is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        })
      }
    }

    fetchGenres()
    fetchMember()
  }, [initialData, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [name]: value,
      },
    }))
  }

  const handleAchievementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const achievements = e.target.value
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "")
    setFormData((prev) => ({ ...prev, achievements }))
  }

  const handleSwitchChange = (checked: boolean, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSend = {
        name: formData.name,
        genre_id: Number.parseInt(formData.genre_id as string),
        bio: formData.bio || null,
        photo_url: formData.photo_url || null,
        social_media: formData.social_media,
        achievements: formData.achievements.length > 0 ? formData.achievements : null,
        is_active: formData.is_active,
      }

      let error

      if (initialData) {
        const { error: updateError } = await supabase
          .from("academy_members")
          .update(dataToSend)
          .eq("id", initialData.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase.from("academy_members").insert(dataToSend)
        error = insertError
      }

      if (error) throw error

      toast({
        title: "Éxito",
        description: initialData ? "Miembro actualizado correctamente" : "Miembro creado correctamente",
      })

      // Limpiar el formulario si es nuevo
      if (!initialData) {
        setFormData({
          name: "",
          genre_id: "",
          bio: "",
          photo_url: "",
          social_media: {
            twitter: "",
            instagram: "",
            facebook: "",
          },
          achievements: [],
          is_active: true,
        })
      }

      // Redireccionar después de un breve retraso
      setTimeout(() => {
        router.push("/admin/miembros-academia")
        router.refresh()
      }, 1500)
    } catch (error: any) {
      console.error("Error al guardar miembro:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el miembro",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Asegurarse de que los valores nunca sean null para los textareas
  const achievementsText = Array.isArray(formData.achievements) ? formData.achievements.join("\n") : ""

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar" : "Nuevo"} Miembro de Academia</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" value={formData.name || ""} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre_id">Género Artístico</Label>
            <Select
              value={formData.genre_id.toString() || ""}
              onValueChange={(value) => handleSelectChange(value, "genre_id")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre.id} value={genre.id.toString()}>
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea id="bio" name="bio" value={formData.bio || ""} onChange={handleChange} rows={4} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo_url">URL de Foto</Label>
            <Input id="photo_url" name="photo_url" value={formData.photo_url || ""} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label>Redes Sociales</Label>
            <div className="space-y-2">
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.social_media?.twitter || ""}
                  onChange={handleSocialMediaChange}
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.social_media?.instagram || ""}
                  onChange={handleSocialMediaChange}
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  name="facebook"
                  value={formData.social_media?.facebook || ""}
                  onChange={handleSocialMediaChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">Logros</Label>
            <Textarea
              id="achievements"
              value={achievementsText}
              onChange={handleAchievementsChange}
              placeholder="Ingresa un logro por línea"
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleSwitchChange(checked, "is_active")}
            />
            <Label htmlFor="is_active">Activo</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/miembros-academia")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export { AcademyMemberForm }
