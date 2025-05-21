"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/spinner"
import { supabase } from "@/lib/supabase/client"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ContactFormProps {
  initialData: {
    id?: string
    section: string
    title: string
    content: {
      info_title: string
      email: string
      phone: string
      address: string
      social_title: string
      facebook: string
      twitter: string
      instagram: string
    }
  }
}

export function ContactForm({ initialData }: ContactFormProps) {
  const [title, setTitle] = useState(initialData.title)
  const [infoTitle, setInfoTitle] = useState(initialData.content.info_title)
  const [email, setEmail] = useState(initialData.content.email)
  const [phone, setPhone] = useState(initialData.content.phone)
  const [address, setAddress] = useState(initialData.content.address)
  const [socialTitle, setSocialTitle] = useState(initialData.content.social_title)
  const [facebook, setFacebook] = useState(initialData.content.facebook)
  const [twitter, setTwitter] = useState(initialData.content.twitter)
  const [instagram, setInstagram] = useState(initialData.content.instagram)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const content = {
        info_title: infoTitle,
        email,
        phone,
        address,
        social_title: socialTitle,
        facebook,
        twitter,
        instagram,
      }

      if (initialData.id) {
        // Actualizar contenido existente
        const { error } = await supabase
          .from("content")
          .update({
            title,
            content,
          })
          .eq("id", initialData.id)

        if (error) throw error
      } else {
        // Crear nuevo contenido
        const { error } = await supabase.from("content").insert({
          section: initialData.section,
          title,
          content,
        })

        if (error) throw error
      }

      toast({
        title: "Contacto actualizado",
        description: "La información de contacto se ha actualizado correctamente",
      })

      router.refresh()
    } catch (error) {
      console.error("Error al guardar contacto:", error)
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: error.message || "Ha ocurrido un error inesperado",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Sección</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la sección"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="info-title">Título</Label>
            <Input
              id="info-title"
              value={infoTitle}
              onChange={(e) => setInfoTitle(e.target.value)}
              placeholder="Título de la información de contacto"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email de contacto"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Teléfono de contacto"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Dirección física"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redes Sociales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="social-title">Título</Label>
            <Input
              id="social-title"
              value={socialTitle}
              onChange={(e) => setSocialTitle(e.target.value)}
              placeholder="Título de redes sociales"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="Perfil de Facebook"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="Perfil de Twitter"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Perfil de Instagram"
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/contenido">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
