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

export function SelectionProcessForm({ initialData }) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(initialData.content?.title || "El Proceso de Selección")
  const [description, setDescription] = useState(
    initialData.content?.description ||
      "Nuestro riguroso proceso de selección comienza con una convocatoria abierta para nominaciones.",
  )
  const [steps, setSteps] = useState(
    initialData.content?.steps || [
      {
        title: "Convocatoria",
        description: "Abrimos la convocatoria para recibir nominaciones en todas las categorías.",
      },
      {
        title: "Evaluación",
        description: "Un jurado evalúa las nominaciones y selecciona a los ganadores.",
      },
    ],
  )
  const [conclusion, setConclusion] = useState(
    initialData.content?.conclusion ||
      "Este proceso garantiza que los Premios San Cristóbal mantengan su prestigio y que cada ganador sea verdaderamente merecedor del reconocimiento.",
  )

  const handleAddStep = () => {
    setSteps([...steps, { title: "", description: "" }])
  }

  const handleRemoveStep = (index) => {
    const newSteps = [...steps]
    newSteps.splice(index, 1)
    setSteps(newSteps)
  }

  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps]
    newSteps[index][field] = value
    setSteps(newSteps)
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
            description,
            steps,
            conclusion,
          },
        })
        .eq("id", initialData.id)

      if (error) {
        throw error
      }

      toast({
        title: "Proceso de selección actualizado",
        description: "La información del proceso de selección se ha actualizado correctamente.",
      })

      // Disparar un evento personalizado para actualizar el contenido en tiempo real
      const updateEvent = new CustomEvent("content-updated", {
        detail: { section: "selection_process" },
      })
      window.dispatchEvent(updateEvent)

      router.refresh()
    } catch (error) {
      console.error("Error al actualizar proceso de selección:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la información. Por favor, inténtalo de nuevo.",
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
            placeholder="El Proceso de Selección"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción general</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del proceso de selección"
            disabled={isLoading}
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <Label>Pasos del proceso</Label>
          {steps.map((step, index) => (
            <Card key={index}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Paso {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStep(index)}
                    disabled={isLoading || steps.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`step-title-${index}`}>Título</Label>
                  <Input
                    id={`step-title-${index}`}
                    value={step.title}
                    onChange={(e) => handleStepChange(index, "title", e.target.value)}
                    placeholder="Título del paso"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`step-description-${index}`}>Descripción</Label>
                  <Textarea
                    id={`step-description-${index}`}
                    value={step.description}
                    onChange={(e) => handleStepChange(index, "description", e.target.value)}
                    placeholder="Descripción del paso"
                    disabled={isLoading}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={handleAddStep} disabled={isLoading}>
            Añadir paso
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="conclusion">Conclusión</Label>
          <Textarea
            id="conclusion"
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            placeholder="Conclusión del proceso de selección"
            disabled={isLoading}
            rows={3}
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  )
}
