"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/spinner"
import { supabase } from "@/lib/supabase/client"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  slug: z
    .string()
    .min(2, {
      message: "El slug debe tener al menos 2 caracteres.",
    })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "El slug debe contener solo letras minúsculas, números y guiones.",
    }),
  description: z.string().optional(),
  icon: z.string().optional(),
})

interface AddGenreModalProps {
  isOpen: boolean
  onClose: () => void
  onGenreAdded: (genre: { id: number; name: string }) => void
}

export function AddGenreModal({ isOpen, onClose, onGenreAdded }: AddGenreModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
    },
  })

  const iconOptions = [
    { value: "Music", label: "Música" },
    { value: "Film", label: "Cine/Teatro" },
    { value: "Image", label: "Artes Visuales" },
    { value: "BookOpen", label: "Literatura" },
    { value: "Mic2", label: "Voz" },
    { value: "Palette", label: "Pintura" },
    { value: "Camera", label: "Fotografía" },
    { value: "Users", label: "Grupo" },
    { value: "Sparkles", label: "Otros" },
  ]

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Crear nuevo género
      const { data, error } = await supabase
        .from("artistic_genres")
        .insert({
          name: values.name,
          slug: values.slug,
          description: values.description || null,
          icon: values.icon || null,
        })
        .select()

      if (error) throw error

      toast({
        title: "Género creado",
        description: "El género artístico ha sido creado correctamente.",
      })

      // Obtener el ID del género recién creado
      const { data: newGenre, error: fetchError } = await supabase
        .from("artistic_genres")
        .select("id, name")
        .eq("slug", values.slug)
        .single()

      if (fetchError) throw fetchError

      // Notificar al componente padre
      onGenreAdded(newGenre)

      // Cerrar el modal y resetear el formulario
      form.reset()
      onClose()
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al guardar el género.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Género Artístico</DialogTitle>
        </DialogHeader>
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
                      placeholder="Ej: Danza Contemporánea"
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
                      <Input placeholder="ej: danza-contemporanea" {...field} />
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
                    <Textarea placeholder="Descripción del género artístico" {...field} value={field.value || ""} />
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
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner className="mr-2" />}
                Crear Género
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
