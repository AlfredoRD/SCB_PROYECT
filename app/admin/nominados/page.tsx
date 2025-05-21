"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Pencil, Plus, Trash2 } from "lucide-react"
import { NomineeModal } from "@/components/nominee-modal"
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

export default function NomineesPage() {
  const supabase = createClientComponentClient()
  const [nominees, setNominees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentNominee, setCurrentNominee] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [nomineeToDelete, setNomineeToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Obtener nominados
      const { data: nomineesData, error: nomineesError } = await supabase.from("nominees").select("*").order("name")

      if (nomineesError) throw nomineesError

      setNominees(nomineesData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los nominados",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (nominee?: any) => {
    setCurrentNominee(nominee || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentNominee(null)
    fetchData()
  }

  const handleDeleteClick = (nominee: any) => {
    setNomineeToDelete(nominee)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!nomineeToDelete) return

    setIsDeleting(true)
    try {
      // Primero eliminar los votos asociados a este nominado
      const { error: votesError } = await supabase.from("votes").delete().eq("nominee_id", nomineeToDelete.id)

      if (votesError && votesError.code !== "PGRST116") {
        // Ignorar error si la tabla no existe o no hay votos
        throw new Error(`Error al eliminar votos: ${votesError.message}`)
      }

      // Luego eliminar el nominado
      const { error } = await supabase.from("nominees").delete().eq("id", nomineeToDelete.id)

      if (error) {
        throw new Error(`Error al eliminar nominado: ${error.message}`)
      }

      toast({
        title: "Nominado eliminado",
        description: `El nominado "${nomineeToDelete.name}" ha sido eliminado correctamente.`,
      })

      fetchData()
    } catch (error) {
      console.error("Error al eliminar:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el nominado",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setNomineeToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Nominados</h2>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Nominado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total de Nominados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{nominees.length}</p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="h-8 w-8" />
        </div>
      ) : nominees.length === 0 ? (
        <EmptyState
          title="No hay nominados"
          description="No se han encontrado nominados. Crea un nuevo nominado para empezar."
          action={
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Nominado
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: "40%" }}>Nominado</TableHead>
                  <TableHead style={{ width: "20%" }}>Categoría</TableHead>
                  <TableHead style={{ width: "10%" }} className="text-center">
                    Votos
                  </TableHead>
                  <TableHead style={{ width: "30%" }} className="text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nominees.map((nominee) => (
                  <TableRow key={nominee.id}>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="font-medium">{nominee.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {nominee.description || "Sin descripción"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{nominee.category || "Sin categoría"}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{nominee.votes_count || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/nominados/${nominee.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(nominee)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(nominee)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <NomineeModal isOpen={isModalOpen} onClose={handleCloseModal} initialData={currentNominee} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al nominado "{nomineeToDelete?.name}" y todos sus votos asociados.
              Esta acción no se puede deshacer.
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
