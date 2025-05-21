"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

export default function AcademyMemberFormSimple() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [genres, setGenres] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [genreId, setGenreId] = useState("")

  useEffect(() => {
    const fetchGenres = async () => {
      const { data, error } = await supabase.from("artistic_genres").select("*")
      if (error) {
        console.error("Error fetching genres:", error)
        return
      }
      setGenres(data || [])
      if (data && data.length > 0) {
        setGenreId(data[0].id.toString())
      }
    }

    fetchGenres()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("academy_members").insert({
        name,
        genre_id: Number.parseInt(genreId),
        is_active: true,
      })

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Miembro creado correctamente",
      })

      // Limpiar el formulario
      setName("")

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Miembro de Academia (Simplificado)</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          {genres.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="genre_id">Género Artístico</Label>
              <Select value={genreId} onValueChange={setGenreId}>
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
          )}
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
