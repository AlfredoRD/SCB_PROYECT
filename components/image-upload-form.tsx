"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"

interface ImageUploadFormProps {
  section: string
  existingId?: string | null
  title?: string
  description?: string
}

export function ImageUploadForm({ section, existingId, title, description }: ImageUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [availableBuckets, setAvailableBuckets] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Verificar buckets disponibles al cargar el componente
  useEffect(() => {
    async function checkBuckets() {
      try {
        const { data, error } = await supabase.storage.listBuckets()

        if (error) {
          console.error("Error al listar buckets:", error)
          return
        }

        if (data && data.length > 0) {
          setAvailableBuckets(data.map((bucket) => bucket.name))
        }
      } catch (error) {
        console.error("Error al verificar buckets:", error)
      }
    }

    checkBuckets()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Validar tipo de archivo
      if (!selectedFile.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido.",
          variant: "destructive",
        })
        return
      }

      // Validar tamaño (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen es demasiado grande. El tamaño máximo es 5MB.",
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)

      // Crear preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]

      // Validar tipo de archivo
      if (!droppedFile.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Por favor arrastra un archivo de imagen válido.",
          variant: "destructive",
        })
        return
      }

      // Validar tamaño (máximo 5MB)
      if (droppedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen es demasiado grande. El tamaño máximo es 5MB.",
          variant: "destructive",
        })
        return
      }

      setFile(droppedFile)

      // Crear preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(droppedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen primero.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Convertir la imagen a base64 para almacenarla directamente en la base de datos
      const reader = new FileReader()

      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result)
          } else {
            reject(new Error("No se pudo convertir la imagen a base64"))
          }
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const base64Image = await base64Promise

      // Guardar o actualizar en la tabla content
      const contentData = {
        imageData: base64Image,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        alt: `${section} image`,
        updated_at: new Date().toISOString(),
      }

      let dbError

      if (existingId) {
        // Actualizar registro existente
        const { error } = await supabase
          .from("content")
          .update({
            content: contentData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingId)

        dbError = error
      } else {
        // Crear nuevo registro
        const { error } = await supabase.from("content").insert([
          {
            section: section,
            title: section === "site_logo" ? "Logo del Sitio" : "Imagen de Acerca De",
            content: contentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        dbError = error
      }

      if (dbError) {
        throw new Error(`Error al guardar en la base de datos: ${dbError.message}`)
      }

      toast({
        title: "¡Éxito!",
        description: "La imagen se ha subido correctamente.",
      })

      // Limpiar el formulario
      setFile(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Refrescar la página para mostrar la nueva imagen
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al subir la imagen.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      {description && <p className="text-sm text-gray-500">{description}</p>}

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="space-y-4">
            <img src={preview || "/placeholder.svg"} alt="Vista previa" className="mx-auto max-h-48 object-contain" />
            <p className="text-sm text-gray-500">Haz clic para cambiar la imagen</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-medium">Haz clic para seleccionar</span> o arrastra y suelta
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
          </div>
        )}

        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subiendo...
          </>
        ) : (
          "Guardar imagen"
        )}
      </Button>
    </div>
  )
}
