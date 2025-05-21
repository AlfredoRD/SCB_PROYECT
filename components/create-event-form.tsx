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
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/spinner"

const formSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha y hora inválidas",
  }),
  location: z.string().min(3, { message: "La ubicación debe tener al menos 3 caracteres" }),
  capacity: z.string().refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
    message: "La capacidad debe ser un número positivo",
  }),
  image_url: z.string().optional(),
})

export function CreateEventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      capacity: "",
      image_url: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Convertir capacity a número
      const capacity = Number.parseInt(values.capacity)

      // Insertar evento en la base de datos
      const { error } = await supabase.from("events").insert({
        title: values.title,
        description: values.description,
        date: new Date(values.date).toISOString(),
        location: values.location,
        capacity: capacity,
        image_url: values.image_url || null,
      })

      if (error) {
        throw new Error(`Error al crear el evento: ${error.message}`)
      }

      toast({
        title: "Evento creado",
        description: "El evento ha sido creado exitosamente",
      })

      // Resetear el formulario
      form.reset()

      // Recargar la página para mostrar el nuevo evento
      router.refresh()
    } catch (error) {
      console.error("Error al crear evento:", error)
      toast({
        variant: "destructive",
        title: "Error al crear el evento",
        description: error.message || "Ha ocurrido un error inesperado",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título del evento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción del evento" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha y Hora</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Input placeholder="Ubicación del evento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidad</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Número de asistentes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de Imagen (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="URL de la imagen del evento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Guardando...
            </>
          ) : (
            "Guardar Evento"
          )}
        </Button>
      </form>
    </Form>
  )
}
