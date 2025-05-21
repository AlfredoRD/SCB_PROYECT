"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/spinner"

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  slug: z
    .string()
    .min(2, { message: "El slug debe tener al menos 2 caracteres" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "El slug debe contener solo letras minúsculas, números y guiones",
    }),
  description: z.string().optional(),
  icon: z.string().optional(),
})

interface CategoryFormProps {
  initialData?: {
    id: number
    name: string
    slug: string
    description: string | null
    icon: string | null
  }
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!initialData

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      icon: initialData?.icon || "",
    },
  })

  // Iconos disponibles
  const availableIcons = [
    "Award",
    "Lightbulb",
    "Heart",
    "Landmark",
    "Music",
    "Briefcase",
    "Globe",
    "Star",
    "Trophy",
    "Film",
    "Book",
    "Camera",
    "Palette",
  ]

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      if (isEditing) {
        // Actualizar categoría existente
        const { error } = await supabase
          .from("categories")
          .update({
            name: values.name,
            slug: values.slug,
            description: values.description || null,
            icon: values.icon || null,
          })
          .eq("id", initialData.id)

        if (error) {
          throw new Error(`Error al actualizar categoría: ${error.message}`)
        }

        toast({
          title: "Categoría actualizada",
          description: "La categoría ha sido actualizada exitosamente",
        })
      } else {
        // Insertar nueva categoría
        const { error } = await supabase.from("categories").insert({
          name: values.name,
          slug: values.slug,
          description: values.description || null,
          icon: values.icon || null,
        })

        if (error) {
          throw new Error(`Error al crear categoría: ${error.message}`)
        }

        toast({
          title: "Categoría creada",
          description: "La categoría ha sido creada exitosamente",
        })

        // Resetear el formulario
        form.reset()
      }

      // Recargar la página para mostrar la nueva categoría
      setTimeout(() => {
        router.push("/admin/categorias")
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error al guardar categoría:", error)
      toast({
        variant: "destructive",
        title: "Error al guardar la categoría",
        description: error.message || "Ha ocurrido un error inesperado",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function generateSlug() {
    const name = form.getValues("name")
    if (!name) return

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    form.setValue("slug", slug)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre de la categoría"
                  {...field}
                  onBlur={() => {
                    if (!form.getValues("slug")) {
                      generateSlug()
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="slug-de-la-categoria" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" variant="outline" onClick={generateSlug} className="mb-[2px]">
            Generar
          </Button>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción de la categoría" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icono</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un icono" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableIcons.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/categorias")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                {isEditing ? "Actualizando..." : "Guardando..."}
              </>
            ) : isEditing ? (
              "Actualizar Categoría"
            ) : (
              "Crear Categoría"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
