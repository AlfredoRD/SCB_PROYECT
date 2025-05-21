"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/spinner"
import { supabase } from "@/lib/supabase/client"
import { ArrowLeft, Save, Plus, Trash, RefreshCw } from "lucide-react"
import Link from "next/link"
import { refreshContent } from "@/lib/hooks/use-content"

interface ContentFormProps {
  initialData?: {
    id: string
    section: string
    title: string
    content: Record<string, any>
  }
}

export function ContentForm({ initialData }: ContentFormProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [section, setSection] = useState(initialData?.section || "")
  const [content, setContent] = useState(JSON.stringify(initialData?.content || {}, null, 2))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [contentFields, setContentFields] = useState<{ key: string; value: string }[]>(
    Object.entries(initialData?.content || {}).map(([key, value]) => ({
      key,
      value: typeof value === "string" ? value : JSON.stringify(value),
    })),
  )

  const router = useRouter()
  const { toast } = useToast()

  const isEditing = !!initialData

  useEffect(() => {
    // Asegurarse de que contentFields se inicialice correctamente con los datos existentes
    if (initialData?.content) {
      setContentFields(
        Object.entries(initialData.content).map(([key, value]) => ({
          key,
          value: typeof value === "string" ? value : JSON.stringify(value),
        })),
      )
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar que los campos requeridos estén completos
      if (!title.trim() || (!isEditing && !section.trim())) {
        throw new Error("El título y la sección son obligatorios")
      }

      // Validar que el JSON sea válido
      let contentObj: Record<string, any>
      try {
        contentObj = JSON.parse(content)
      } catch (error) {
        throw new Error("El contenido JSON no es válido")
      }

      if (isEditing) {
        // Actualizar contenido existente
        const { error } = await supabase
          .from("content")
          .update({
            title,
            content: contentObj,
          })
          .eq("id", initialData.id)

        if (error) throw error

        toast({
          title: "Contenido actualizado",
          description: "El contenido se ha actualizado correctamente",
        })

        // Refrescar el contenido para que se actualice inmediatamente
        refreshContent(initialData.section)
      } else {
        // Crear nuevo contenido
        const { error } = await supabase.from("content").insert({
          section: section.toLowerCase().trim(),
          title,
          content: contentObj,
        })

        if (error) {
          if (error.code === "23505") {
            throw new Error("Ya existe una sección con ese nombre")
          }
          throw error
        }

        toast({
          title: "Contenido creado",
          description: "El contenido se ha creado correctamente",
        })

        // Refrescar el contenido para que se actualice inmediatamente
        refreshContent(section.toLowerCase().trim())
      }

      // Redirigir a la página de gestión de contenido
      router.push("/admin/contenido")
      router.refresh()
    } catch (error) {
      console.error("Error al guardar contenido:", error)
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message || "Ha ocurrido un error inesperado",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddField = () => {
    setContentFields([...contentFields, { key: "", value: "" }])
  }

  const handleRemoveField = (index: number) => {
    const newFields = [...contentFields]
    newFields.splice(index, 1)
    setContentFields(newFields)
    updateJSONFromFields(newFields)
  }

  const handleFieldChange = (index: number, field: "key" | "value", value: string) => {
    const newFields = [...contentFields]
    newFields[index][field] = value
    setContentFields(newFields)
    updateJSONFromFields(newFields)
  }

  const updateJSONFromFields = (fields: { key: string; value: string }[]) => {
    const obj: Record<string, any> = {}
    fields.forEach(({ key, value }) => {
      if (key) {
        try {
          // Intentar parsear el valor como JSON si parece ser un objeto o array
          if ((value.startsWith("{") && value.endsWith("}")) || (value.startsWith("[") && value.endsWith("]"))) {
            obj[key] = JSON.parse(value)
          } else {
            obj[key] = value
          }
        } catch (e) {
          obj[key] = value
        }
      }
    })
    setContent(JSON.stringify(obj, null, 2))
  }

  const updateFieldsFromJSON = () => {
    try {
      const obj = JSON.parse(content)
      setContentFields(
        Object.entries(obj).map(([key, value]) => ({
          key,
          value: typeof value === "string" ? value : JSON.stringify(value),
        })),
      )
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error al parsear JSON",
        description: "El contenido JSON no es válido",
      })
    }
  }

  const handleRefreshContent = async () => {
    setIsRefreshing(true)
    try {
      refreshContent(initialData?.section || section)
      toast({
        title: "Contenido actualizado",
        description: "El contenido se ha actualizado correctamente en la página",
      })
    } catch (error) {
      console.error("Error al actualizar contenido:", error)
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: "No se pudo actualizar el contenido en la página",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la sección"
                required
              />
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="section">
                  Identificador de sección
                  <span className="text-xs text-muted-foreground ml-2">(único, sin espacios)</span>
                </Label>
                <Input
                  id="section"
                  value={section}
                  onChange={(e) => setSection(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  placeholder="identificador_seccion"
                  required
                  disabled={isEditing}
                />
              </div>
            )}
          </div>

          <Tabs defaultValue="visual" className="w-full">
            <TabsList>
              <TabsTrigger value="visual">Editor Visual</TabsTrigger>
              <TabsTrigger value="json">Editor JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="space-y-4 pt-4">
              {contentFields.map((field, index) => (
                <div key={index} className="flex gap-4 mb-4 items-start">
                  <div className="flex-1">
                    <Label htmlFor={`key-${index}`} className="text-xs">
                      Clave
                    </Label>
                    <Input
                      id={`key-${index}`}
                      value={field.key}
                      onChange={(e) => handleFieldChange(index, "key", e.target.value)}
                      placeholder="clave"
                    />
                  </div>
                  <div className="flex-[2]">
                    <Label htmlFor={`value-${index}`} className="text-xs">
                      Valor
                    </Label>
                    <Textarea
                      id={`value-${index}`}
                      value={field.value}
                      onChange={(e) => handleFieldChange(index, "value", e.target.value)}
                      placeholder="valor"
                      rows={3}
                    />
                  </div>
                  <div className="pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveField(index)}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={handleAddField} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Campo
              </Button>
            </TabsContent>

            <TabsContent value="json" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="content">Contenido (JSON)</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="{}"
                  className="font-mono h-[300px]"
                />
              </div>
              <Button type="button" variant="outline" onClick={updateFieldsFromJSON} className="mt-4">
                Actualizar campos visuales
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/contenido">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>

          {isEditing && (
            <Button type="button" variant="outline" onClick={handleRefreshContent} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <Spinner className="mr-2" />
                  Actualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar contenido
                </>
              )}
            </Button>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Actualizar" : "Guardar"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
