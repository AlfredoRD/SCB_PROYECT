"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/spinner"
import { toast } from "@/components/ui/use-toast"

export function CreateAcademyTables() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleCreateTables() {
    setIsLoading(true)
    setIsSuccess(false)

    try {
      const response = await fetch("/api/admin/create-academy-tables", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Error al crear las tablas")
      }

      setIsSuccess(true)
      toast({
        title: "Tablas creadas",
        description: "Las tablas de la academia han sido creadas correctamente.",
      })
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al crear las tablas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Tablas de Academia</CardTitle>
        <CardDescription>
          Crea las tablas necesarias para gestionar los géneros artísticos y miembros de la academia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Este proceso creará las siguientes tablas:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <li>artistic_genres: Para almacenar los diferentes géneros artísticos</li>
          <li>academy_members: Para almacenar los miembros de la academia</li>
        </ul>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          También se crearán las políticas de seguridad necesarias y se insertarán algunos datos de ejemplo.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateTables} disabled={isLoading || isSuccess} className="w-full">
          {isLoading && <Spinner className="mr-2" />}
          {isSuccess ? "Tablas Creadas" : "Crear Tablas"}
        </Button>
      </CardFooter>
    </Card>
  )
}
