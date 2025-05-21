"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/spinner"

const formSchema = z.object({
  voting_enabled: z.boolean().default(true),
  max_votes_per_user: z.string().refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
    message: "Debe ser un número positivo",
  }),
  max_votes_per_category: z.string().refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
    message: "Debe ser un número positivo",
  }),
  show_results: z.boolean().default(false),
  voting_start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
  voting_end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha inválida",
  }),
})

interface VotingConfigFormProps {
  initialData: any
}

export function VotingConfigForm({ initialData }: VotingConfigFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voting_enabled: initialData?.voting_enabled || true,
      max_votes_per_user: initialData?.max_votes_per_user?.toString() || "5",
      max_votes_per_category: initialData?.max_votes_per_category?.toString() || "1",
      show_results: initialData?.show_results || false,
      voting_start_date: initialData?.voting_start_date
        ? new Date(initialData.voting_start_date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      voting_end_date: initialData?.voting_end_date
        ? new Date(initialData.voting_end_date).toISOString().slice(0, 16)
        : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 16),
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Convertir valores a números
      const configData = {
        voting_enabled: values.voting_enabled,
        max_votes_per_user: Number.parseInt(values.max_votes_per_user),
        max_votes_per_category: Number.parseInt(values.max_votes_per_category),
        show_results: values.show_results,
        voting_start_date: new Date(values.voting_start_date).toISOString(),
        voting_end_date: new Date(values.voting_end_date).toISOString(),
      }

      // Verificar si ya existe la configuración
      const { data: existingConfig, error: checkError } = await supabase
        .from("config")
        .select("id")
        .eq("key", "voting_settings")
        .single()

      if (checkError && !checkError.message.includes("No rows found")) {
        throw new Error(`Error al verificar configuración: ${checkError.message}`)
      }

      if (existingConfig) {
        // Actualizar configuración existente
        const { error } = await supabase.from("config").update({ value: configData }).eq("key", "voting_settings")

        if (error) {
          throw new Error(`Error al actualizar configuración: ${error.message}`)
        }
      } else {
        // Insertar nueva configuración
        const { error } = await supabase.from("config").insert({
          key: "voting_settings",
          value: configData,
        })

        if (error) {
          throw new Error(`Error al guardar configuración: ${error.message}`)
        }
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración de votaciones ha sido guardada exitosamente",
      })

      // Recargar la página para mostrar los cambios
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      toast({
        variant: "destructive",
        title: "Error al guardar configuración",
        description: error.message || "Ha ocurrido un error inesperado",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="voting_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Habilitar Votaciones</FormLabel>
                <FormDescription>Activa o desactiva el sistema de votaciones en todo el sitio</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="max_votes_per_user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Votos Máximos por Usuario</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>Número máximo de votos que un usuario puede emitir en total</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_votes_per_category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Votos Máximos por Categoría</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>Número máximo de votos que un usuario puede emitir en cada categoría</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="show_results"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Mostrar Resultados</FormLabel>
                <FormDescription>
                  Permite que los usuarios vean los resultados actuales de las votaciones
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="voting_start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Inicio</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>Fecha y hora en que inician las votaciones</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="voting_end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Finalización</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>Fecha y hora en que finalizan las votaciones</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Guardando...
            </>
          ) : (
            "Guardar Configuración"
          )}
        </Button>
      </form>
    </Form>
  )
}
