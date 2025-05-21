"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { CONTENT_UPDATED_EVENT } from "@/lib/hooks/use-content"

export default function Footer() {
  const [updateKey, setUpdateKey] = useState(0)
  const [footerContent, setFooterContent] = useState({
    title: "Premios San Cristóbal",
    tagline: "Honrando la Excelencia y el Legado desde 2023",
    links_title: "Enlaces",
    link_home: "Inicio",
    link_categories: "Categorías",
    link_nominees: "Nominados",
    link_event: "Evento",
    legal_title: "Legal",
    link_terms: "Términos y Condiciones",
    link_privacy: "Política de Privacidad",
    link_cookies: "Política de Cookies",
    contact_title: "Contacto",
    email: "Email: info@premiossancristobal.com",
    phone: "Teléfono: +123 456 7890",
    address: "Dirección: Av. Principal #123, Ciudad",
    copyright: `© ${new Date().getFullYear()} Premios San Cristóbal. Todos los derechos reservados.`,
  })

  useEffect(() => {
    // Cargar contenido del footer desde la base de datos
    const loadFooterContent = async () => {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from("content").select("content").eq("section", "footer").single()

      if (error) {
        console.error("Error al cargar el contenido del footer:", error)
        return
      }

      if (data && data.content) {
        setFooterContent((prev) => ({ ...prev, ...data.content }))
      }
    }

    loadFooterContent()

    // Escuchar el evento de actualización de contenido
    const handleContentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.section === "footer" || !customEvent.detail?.section) {
        setUpdateKey((prev) => prev + 1)
        loadFooterContent()
      }
    }

    window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated)

    return () => {
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated)
    }
  }, [])

  return (
    <footer className="w-full border-t bg-background" key={updateKey}>
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{footerContent.title}</h3>
            <p className="text-sm text-muted-foreground">{footerContent.tagline}</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{footerContent.links_title}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                  {footerContent.link_home}
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="text-sm text-muted-foreground hover:text-primary">
                  {footerContent.link_categories}
                </Link>
              </li>
              <li>
                <Link href="/nominados" className="text-sm text-muted-foreground hover:text-primary">
                  {footerContent.link_nominees}
                </Link>
              </li>
              <li>
                <Link href="/evento" className="text-sm text-muted-foreground hover:text-primary">
                  {footerContent.link_event}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{footerContent.legal_title}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terminos" className="text-sm text-muted-foreground hover:text-primary">
                  {footerContent.link_terms}
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-sm text-muted-foreground hover:text-primary">
                  {footerContent.link_privacy}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary">
                  {footerContent.link_cookies}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{footerContent.contact_title}</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">{footerContent.email}</li>
              <li className="text-sm text-muted-foreground">{footerContent.phone}</li>
              <li className="text-sm text-muted-foreground">{footerContent.address}</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">{footerContent.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
