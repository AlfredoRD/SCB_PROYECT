"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/spinner"
import { supabase } from "@/lib/supabase/client"

interface DeleteMemberPageProps {
  params: {
    id: string
  }
}

export default function DeleteMemberPage({ params }: DeleteMemberPageProps) {
  const router = useRouter()
  const [member, setMember] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchMember() {
      try {
        const { data, error } = await supabase
          .from("academy_members")
          .select(`
            *,
            artistic_genres:genre_id (
              name
            )
          `)
          .eq("id", params.id)
          .single()

        if (error) throw error

        setMember(data)
      } catch (error) {
        console.error("Error al cargar el miembro:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el miembro de la academia.",
          variant: "destructive",
        })
        router.push("/admin/miembros-academia")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMember()
  }, [params.id, router])

  async function handleDelete() {
    setIsDeleting(true)

    try {
      const { error } = await supabase.from("academy_members").delete().eq("id", params.id)

      if (error) throw error

      toast({
        title: "Miembro eliminado",
        description: "El miembro de la academia ha sido eliminado correctamente.",
      })

      router.push("/admin/miembros-academia")
      router.refresh()
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al eliminar el miembro.",
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

  if (!member) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Miembro no encontrado</h1>
        <p>El miembro de la academia que intentas eliminar no existe.</p>
        <Button onClick={() => router.push("/admin/miembros-academia")} className="mt-4">
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Eliminar Miembro de Academia</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Confirmar eliminación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            ¿Estás seguro de que deseas eliminar a <strong>{member.name}</strong> ({member.title}) de la academia?
          </p>
          <p className="text-gray-500 mb-2">Género: {member.artistic_genres?.name}</p>
          <p className="text-gray-500">
            Esta acción no se puede deshacer. Todos los datos asociados a este miembro serán eliminados permanentemente.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/admin/miembros-academia")} disabled={isDeleting}>
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
