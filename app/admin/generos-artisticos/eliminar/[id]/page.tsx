"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/spinner"
import { supabase } from "@/lib/supabase/client"

interface DeleteGenrePageProps {
  params: {
    id: string
  }
}

export default function DeleteGenrePage({ params }: DeleteGenrePageProps) {
  const router = useRouter()
  const [genre, setGenre] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchGenre() {
      try {
        const { data, error } = await supabase.from("artistic_genres").select("*").eq("id", params.id).single()

        if (error) throw error

        setGenre(data)
      } catch (error) {
        console.error("Error al cargar el género:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el género artístico.",
          variant: "destructive",
        })
        router.push("/admin/generos-artisticos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGenre()
  }, [params.id, router])

  async function handleDelete() {
    setIsDeleting(true)

    try {
      // Verificar si hay miembros asociados a este género
      const { data: members, error: membersError } = await supabase
        .from("academy_members")
        .select("id")
        .eq("genre_id", params.id)

      if (membersError) throw membersError

      if (members && members.length > 0) {
        toast({
          title: "No se puede eliminar",
          description: `Hay ${members.length} miembros asociados a este género. Debes reasignarlos o eliminarlos primero.`,
          variant: "destructive",
        })
        setIsDeleting(false)
        return
      }

      // Eliminar el género
      const { error } = await supabase.from("artistic_genres").delete().eq("id", params.id)

      if (error) throw error

      toast({
        title: "Género eliminado",
        description: "El género artístico ha sido eliminado correctamente.",
      })

      router.push("/admin/generos-artisticos")
      router.refresh()
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al eliminar el género.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!genre) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Género no encontrado</h1>
        <p>El género artístico que intentas eliminar no existe.</p>
        <Button onClick={() => router.push("/admin/generos-artisticos")} className="mt-4">
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Eliminar Género Artístico</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Confirmar eliminación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            ¿Estás seguro de que deseas eliminar el género artístico <strong>{genre.name}</strong>?
          </p>
          <p className="text-gray-500">
            Esta acción no se puede deshacer. Todos los datos asociados a este género serán eliminados permanentemente.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/admin/generos-artisticos")} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Spinner className="mr-2" />}
            Eliminar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
