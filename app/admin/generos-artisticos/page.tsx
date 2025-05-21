"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, AlertTriangle } from "lucide-react"
import { GenreModal } from "@/components/genre-modal"
import { DeleteGenreButton } from "@/components/delete-genre-button"
import { EmptyState } from "@/components/empty-state"
import { Spinner } from "@/components/spinner"

export default function ArtisticGenresPage() {
  const supabase = createClientComponentClient()
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState(null)

  useEffect(() => {
    fetchGenres()
  }, [])

  async function fetchGenres() {
    setLoading(true)
    try {
      // Verificar si la tabla existe
      const { error: tableCheckError } = await supabase.from("artistic_genres").select("count").limit(1)

      if (tableCheckError && tableCheckError.message.includes("does not exist")) {
        setError("La tabla de géneros artísticos no existe")
        setLoading(false)
        return
      }

      // Obtener todos los géneros artísticos
      const { data, error } = await supabase.from("artistic_genres").select("*").order("name")

      if (error) throw error

      setGenres(data || [])
    } catch (err) {
      console.error("Error al cargar géneros:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGenre = () => {
    setSelectedGenre(null)
    setIsModalOpen(true)
  }

  const handleEditGenre = (genre) => {
    setSelectedGenre(genre)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedGenre(null)
    fetchGenres() // Refrescar la lista después de cerrar el modal
  }

  if (error && error.includes("no existe")) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Géneros Artísticos</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Tabla no encontrada</h3>
              <p className="text-muted-foreground mb-4">
                La tabla de géneros artísticos no existe en la base de datos. Es necesario configurar la Academia
                primero.
              </p>
              <Button asChild>
                <Link href="/admin/setup-academy">Configurar Academia</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Géneros Artísticos</h2>
        <Button onClick={handleAddGenre}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Género
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Géneros Artísticos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : genres.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Icono</TableHead>
                  <TableHead className="w-[150px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {genres.map((genre) => (
                  <TableRow key={genre.id}>
                    <TableCell className="font-medium">{genre.name}</TableCell>
                    <TableCell>{genre.slug}</TableCell>
                    <TableCell>
                      {genre.description
                        ? genre.description.length > 100
                          ? `${genre.description.substring(0, 100)}...`
                          : genre.description
                        : "Sin descripción"}
                    </TableCell>
                    <TableCell>{genre.icon || "—"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditGenre(genre)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <DeleteGenreButton genreId={genre.id} genreName={genre.name} onSuccess={fetchGenres} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No hay géneros artísticos"
              description="No se encontraron géneros artísticos. Crea uno nuevo para empezar."
              action={
                <Button onClick={handleAddGenre}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Género
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <GenreModal isOpen={isModalOpen} onClose={handleCloseModal} initialData={selectedGenre} />
    </div>
  )
}
