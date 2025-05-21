"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function ValuesForm({ initialData }) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(initialData.content?.title || "Nuestros Valores")
  const [values, setValues] = useState(
    initialData.content?.values || [
      { name: "Excelencia", description: "Buscamos y celebramos lo mejor en cada categoría." },
      { name: "Integridad", description: "Mantenemos un proceso de selección transparente y justo." },
    ],
  )

  const handleAddValue = () => {
    setValues([...values, { name: "", description: "" }])
  }

  const handleRemoveValue = (index) => {
    const newValues = [...values]
    newValues.splice(index, 1)
    setValues(newValues)
  }

  const handleValueChange = (index, field, value) => {
    const newValues = [...values]
    newValues[index][field] = value
    setValues(newValues)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("content")
        .update({
          title,
          content: {
            title,
            values,
          },
        })
        .eq("id", initialData.id)

      if (error) {
        throw error
      }

      toast({
        title: "Valores actualizados",
        description: "Los valores se han actualizado correctamente.",
      })

      // Disparar un evento personalizado para actualizar el contenido en tiempo real
      const updateEvent = new CustomEvent("content-updated", {
        detail: { section: "values" },
      })
      window.dispatchEvent(updateEvent)

      router.refresh()
    } catch (error) {
      console.error("Error al actualizar valores:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los valores. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título de la sección</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nuestros Valores"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-4">
          <Label>Valores</Label>
          {values.map((value, index) => (
            <Card key={index}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Valor {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveValue(index)}
                    disabled={isLoading || values.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`value-name-${index}`}>Nombre</Label>
                  <Input
                    id={`value-name-${index}`}
                    value={value.name}
                    onChange={(e) => handleValueChange(index, "name", e.target.value)}
                    placeholder="Nombre del valor"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`value-description-${index}`}>Descripción</Label>
                  <Textarea
                    id={`value-description-${index}`}
                    value={value.description}
                    onChange={(e) => handleValueChange(index, "description", e.target.value)}
                    placeholder="Descripción del valor"
                    disabled={isLoading}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={handleAddValue} disabled={isLoading}>
            Añadir valor
          </Button>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  )
}
