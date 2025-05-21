"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Pencil, Plus, Trash2 } from "lucide-react"
import { AcademyMemberModal } from "@/components/academy-member-modal"
import { EmptyState } from "@/components/empty-state"
import { Spinner } from "@/components/spinner"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AcademyMembersPage() {
  const supabase = createClientComponentClient()
  const [members, setMembers] = useState<any[]>([])
  const [genres, setGenres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Obtener miembros
      const { data: membersData, error: membersError } = await supabase
        .from("academy_members")
        .select("*")
        .order("name")

      if (membersError) throw membersError

      // Obtener géneros
      const { data: genresData, error: genresError } = await supabase.from("artistic_genres").select("id, name")

      if (genresError) throw genresError

      setMembers(membersData || [])
      setGenres(genresData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los miembros",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (member?: any) => {
    setCurrentMember(member || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentMember(null)
    fetchData()
  }

  const handleDeleteClick = (member: any) => {
    setMemberToDelete(member)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return

    setIsDeleting(true)
    try {
      // Eliminar el miembro
      const { error } = await supabase.from("academy_members").delete().eq("id", memberToDelete.id)

      if (error) {
        throw new Error(`Error al eliminar miembro: ${error.message}`)
      }

      toast({
        title: "Miembro eliminado",
        description: `El miembro "${memberToDelete.name}" ha sido eliminado correctamente.`,
      })

      fetchData()
    } catch (error) {
      console.error("Error al eliminar:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el miembro",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setMemberToDelete(null)
    }
  }

  const getGenreName = (genreId: number) => {
    const genre = genres.find((g) => g.id === genreId)
    return genre ? genre.name : "Género desconocido"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Miembros de Academia</h2>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Miembro
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total de Miembros</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{members.length}</p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-8 w-8" />
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          title="No hay miembros"
          description="No se han encontrado miembros de la academia. Crea un nuevo miembro para empezar."
          action={
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Miembro
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url || "/placeholder.svg"}
                        alt={member.name}
                        className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="flex h-12 w-12 rounded-full bg-muted items-center justify-center flex-shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-1">
                      <h3 className="font-medium text-base">{member.name}</h3>
                      {member.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">{member.bio}</p>
                      )}
                      <Badge variant="outline" className="mt-1">
                        {getGenreName(member.genre_id)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/miembros-academia/${member.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(member)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(member)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AcademyMemberModal isOpen={isModalOpen} onClose={handleCloseModal} initialData={currentMember} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al miembro "{memberToDelete?.name}" de la academia. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
