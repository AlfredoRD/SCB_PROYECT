"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

interface DeleteCategoryButtonProps {
  id?: string
  categoryId: number
  categoryName: string
  onSuccess?: () => void
  variant?: "ghost" | "destructive" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function DeleteCategoryButton({
  id,
  categoryId,
  categoryName,
  onSuccess,
  variant = "destructive",
  size = "sm",
  className = "",
}: DeleteCategoryButtonProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      // Verificar si hay nominados asociados a esta categoría
      const { data: nominees, error: checkError } = await supabase
        .from("nominees")
        .select("id")
        .eq("category_id", categoryId)

      if (checkError) {
        throw new Error(`Error al verificar nominados: ${checkError.message}`)
      }

      if (nominees && nominees.length > 0) {
        throw new Error(`No se puede eliminar la categoría porque tiene ${nominees.length} nominados asociados.`)
      }

      // Eliminar la categoría
      const { error } = await supabase.from("categories").delete().eq("id", categoryId)

      if (error) {
        throw new Error(`Error al eliminar categoría: ${error.message}`)
      }

      toast({
        title: "Categoría eliminada",
        description: `La categoría "${categoryName}" ha sido eliminada correctamente.`,
      })

      // Llamar a la función onSuccess si existe
      if (onSuccess) {
        onSuccess()
      }

      setOpen(false)
    } catch (error) {
      console.error("Error al eliminar:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la categoría",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button id={id} variant={variant} size={size} className={className}>
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Categoría</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar la categoría "{categoryName}"? Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
