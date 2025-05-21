"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

// Tipos para el contenido
export interface ContentData {
  [key: string]: any
}

// Cache para almacenar el contenido y reducir las consultas a la base de datos
interface CacheItem {
  content: ContentData
  timestamp: number
}

const contentCache: Record<string, CacheItem> = {}
const CACHE_EXPIRATION = 30 * 1000 // 30 segundos en milisegundos
const MAX_RETRIES = 3
const RETRY_DELAY = 1500
const REQUEST_TIMEOUT = 30000

// Valores predeterminados para las secciones principales
const defaultContent: Record<string, ContentData> = {
  home: {
    hero_title: "Premios San Cristóbal",
    hero_subtitle: "Honrando la Excelencia y el Legado en nuestra comunidad",
    hero_description:
      "Celebrando a los individuos y organizaciones que han hecho contribuciones excepcionales a nuestra sociedad y cultura.",
    cta_primary: "Ver Nominados",
    cta_secondary: "Votar Ahora",
  },
  about: {
    title: "Acerca de los Premios San Cristóbal",
    history:
      "Los Premios San Cristóbal nacieron en 2018 con la visión de reconocer y celebrar la excelencia en diversos ámbitos de nuestra sociedad.",
    mission: "Nuestra misión es promover y celebrar el talento artístico en todas sus formas.",
    vision: "Buscamos ser el reconocimiento más prestigioso en el ámbito cultural y artístico.",
    team_title: "Nuestro Equipo",
    contact_title: "Contacto",
  },
  events: {
    main_title: "Gala de Premiación 2023",
    main_description: "La Gala de Premiación de los Premios San Cristóbal es el evento más esperado del año.",
    program_title: "Programa del Evento",
    details_title: "Detalles del Evento",
    date_label: "Fecha",
    date_value: "15 de Diciembre, 2023",
    time_label: "Hora",
    time_value: "19:00 - 23:00",
    location_label: "Ubicación",
    location_name: "Teatro Nacional",
    cta_button: "Reservar Entrada",
  },
  footer: {
    title: "Premios San Cristóbal",
    tagline: "Honrando la Excelencia y el Legado desde 2023",
    links_title: "Enlaces",
    legal_title: "Legal",
    contact_title: "Contacto",
    email: "Email: info@premiossancristobal.com",
    phone: "Teléfono: +123 456 7890",
    address: "Dirección: Av. Principal #123, Ciudad",
    copyright: "© 2023 Premios San Cristóbal. Todos los derechos reservados.",
  },
}

// Contador para forzar actualizaciones
let updateCounter = 0

// Evento personalizado para notificar actualizaciones de contenido
export const CONTENT_UPDATED_EVENT = "content-updated"

// Función para refrescar el contenido (útil para cuando se actualiza el contenido)
export function refreshContent(section?: string) {
  updateCounter++

  // Limpiar el cache
  if (section) {
    // Si se especifica una sección, solo limpiar esa sección
    if (contentCache[section]) {
      delete contentCache[section]
    }
  } else {
    // Si no se especifica sección, limpiar todo el cache
    Object.keys(contentCache).forEach((key) => {
      delete contentCache[key]
    })
  }

  // Disparar evento para notificar a los componentes
  if (typeof window !== "undefined") {
    const event = new CustomEvent(CONTENT_UPDATED_EVENT, {
      detail: { section, timestamp: Date.now() },
    })
    window.dispatchEvent(event)
  }
}

export function useContent(section: string) {
  const [content, setContent] = useState<ContentData>(defaultContent[section] || {})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateCount, setUpdateCount] = useState(updateCounter)

  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    let timeoutId: NodeJS.Timeout | null = null
    let abortController: AbortController | null = null

    const fetchContentWithRetry = async () => {
      // Verificar si hay contenido en caché y si no ha expirado
      const now = Date.now()
      if (contentCache[section] && now - contentCache[section].timestamp < CACHE_EXPIRATION) {
        if (isMounted) {
          setContent(contentCache[section].content)
          setIsLoading(false)
        }
        return
      }

      try {
        if (isMounted) {
          setIsLoading(true)
          setError(null)
        }

        // Limpiar el timeout anterior si existe
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        // Limpiar el AbortController anterior si existe
        if (abortController) {
          abortController.abort()
        }

        // Crear un nuevo AbortController para cada intento
        abortController = new AbortController()

        // Configurar timeout
        timeoutId = setTimeout(() => {
          if (abortController) {
            abortController.abort()
          }
          throw new Error("La solicitud ha excedido el tiempo de espera")
        }, REQUEST_TIMEOUT)

        // Usar valores predeterminados inmediatamente mientras se carga
        if (isMounted && defaultContent[section]) {
          setContent(defaultContent[section])
        }

        const { data, error: supabaseError } = await supabase
          .from("content")
          .select("content")
          .eq("section", section)
          .single()
          .abortSignal(abortController.signal)

        // Limpiar el timeout si la solicitud se completó
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        if (!isMounted) return

        if (supabaseError) {
          // Si no se encuentra el contenido, usar valores predeterminados
          if (supabaseError.code === "PGRST116") {
            console.warn(`No se encontró contenido para la sección ${section}, usando valores predeterminados`)
            if (isMounted) {
              const defaultData = defaultContent[section] || {}
              setContent(defaultData)
              // Guardar en caché
              contentCache[section] = {
                content: defaultData,
                timestamp: now,
              }
              setIsLoading(false)
            }
            return
          }
          throw supabaseError
        }

        if (isMounted) {
          const contentData = data?.content || defaultContent[section] || {}
          setContent(contentData)
          // Guardar en caché
          contentCache[section] = {
            content: contentData,
            timestamp: now,
          }
          setIsLoading(false)
        }
      } catch (err) {
        // Limpiar el timeout si hubo un error
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        // No mostrar errores de abort en la consola, son esperados
        if (err instanceof DOMException && err.name === "AbortError") {
          console.log("Solicitud abortada intencionalmente")
        } else {
          console.error(`Error al cargar contenido para sección ${section} (intento ${retryCount + 1}):`, err)
        }

        // Intentar nuevamente si no hemos alcanzado el número máximo de reintentos
        if (retryCount < MAX_RETRIES && isMounted) {
          retryCount++
          const delay = RETRY_DELAY * retryCount // Aumentar el retraso con cada reintento
          console.log(`Reintentando en ${delay}ms...`)

          // Esperar antes de reintentar
          await new Promise((resolve) => setTimeout(resolve, delay))

          // Solo reintentar si el componente sigue montado
          if (isMounted) {
            return fetchContentWithRetry() // Reintentar
          }
        } else if (isMounted) {
          // Si hemos agotado los reintentos o el error no es de timeout, mostrar el error y usar valores predeterminados
          setError(err instanceof Error ? err.message : String(err))

          // Siempre usar valores predeterminados en caso de error
          const defaultData = defaultContent[section] || {}
          setContent(defaultData)
          setIsLoading(false)

          // Guardar en caché los valores predeterminados para evitar solicitudes repetidas que fallan
          contentCache[section] = {
            content: defaultData,
            timestamp: now,
          }
        }
      }
    }

    fetchContentWithRetry()

    // Escuchar el evento de actualización de contenido
    const handleContentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.section === section || !customEvent.detail?.section) {
        setUpdateCount((prev) => prev + 1)
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated)
    }

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (abortController) {
        abortController.abort()
      }
      if (typeof window !== "undefined") {
        window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdated)
      }
    }
  }, [section, updateCount])

  return { content, isLoading, error }
}
