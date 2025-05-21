"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  title: z.string().min(2, { message: "El título debe tener al menos 2 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  category: z.string().min(1, { message: "Debes seleccionar una categoría" }),
  image_url: z.string().optional(),
  avatar_url: z.string().optional(),
  tags: z.string().optional(),
})

export default function NewNominee() {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([
    "Excelencia Académica",
    "Servicio Comunitario",
    "Liderazgo",
    "Artes y Cultura",
    "Innovación",
    "Trayectoria",
    "Emprendimiento",
    "Impacto Social",
  ])
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      title: "",
      description: "",
      category: "",
      image_url: "",
      avatar_url: "",
      tags: "",
    },
  })

  // Cargar categorías desde la base de datos
  useState(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase.from("categories").select("name").order("name")
        if (error) {
          console.error("Error al cargar categorías:", error)
          return
        }
        if (data && data.length > 0) {
          setCategories(data.map((cat) => cat.name))
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error)
      }
    }
    loadCategories()
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Convertir tags de string a array
      const tagsArray = values.tags ? values.tags.split(",").map((tag) => tag.trim()) : []

      const { error } = await supabase.from("nominees").insert({
        name: values.name,
        title: values.title,
        description: values.description,
        category: values.category,
        image_url: values.image_url || null,
        avatar_url: values.avatar_url || null,
        tags: tagsArray,
      })

      if (error) {
        console.error("Error al crear nominado:", error)
        toast({
          variant: "destructive",
          title: "Error al crear el nominado",
          description: error.message,
        })
        setIsLoading(false)
        return
      }

      toast({
        title: "Nominado creado",
        description: "El nominado ha sido creado exitosamente",
      })
      router.push("/admin/nominados")
      router.refresh()
    } catch (error) {
      console.error("Error inesperado:", error)
      toast({
        variant: "destructive",
        title: "Error al crear el nominado",
        description: "Ha ocurrido un error inesperado",
      })
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button variant="outline" asChild className="mb-4">
        <Link href="/admin/nominados">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a nominados
        </Link>
      </Button>

      <h2 className="text-2xl font-bold mb-6">Nuevo Nominado</h2>

      <Card>
        <CardHeader>
          <CardTitle>Información del Nominado</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del nominado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título o cargo" {...field} />
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
                      <Textarea placeholder="Descripción del nominado" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Imagen</FormLabel>
                    <FormControl>
                      <Input placeholder="URL de la imagen principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Avatar</FormLabel>
                    <FormControl>
                      <Input placeholder="URL del avatar o logo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiquetas</FormLabel>
                    <FormControl>
                      <Input placeholder="Etiquetas separadas por comas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Nominado"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
