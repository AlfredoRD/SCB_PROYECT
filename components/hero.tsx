"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ContentRenderer } from "@/components/content-renderer"
import { useEffect, useState } from "react"
import { CONTENT_UPDATED_EVENT } from "@/lib/hooks/use-content"

export default function Hero() {
  const [updateKey, setUpdateKey] = useState(0)

  useEffect(() => {
    // Escuchar el evento de actualización de contenido
    const handleContentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.section === "home" || !customEvent.detail?.section) {
        setUpdateKey((prev) => prev + 1)
      }
    }

    window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated)

    return () => {
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated)
    }
  }, [])

  return (
    <div className="w-full py-20 md:py-32 text-white bg-black" key={updateKey}>
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <ContentRenderer section="home" field="hero_title" fallback="Premios San Cristóbal" />
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          <ContentRenderer
            section="home"
            field="hero_subtitle"
            fallback="Honrando la Excelencia y el Legado en nuestra comunidad"
          />
        </p>
        <p className="text-lg mb-10 max-w-3xl mx-auto">
          <ContentRenderer
            section="home"
            field="hero_description"
            fallback="Celebrando a los individuos y organizaciones que han hecho contribuciones excepcionales a nuestra sociedad y cultura."
          />
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/nominados">
              <ContentRenderer section="home" field="cta_primary" fallback="Ver Nominados" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/votar">
              <ContentRenderer section="home" field="cta_secondary" fallback="Votar Ahora" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
