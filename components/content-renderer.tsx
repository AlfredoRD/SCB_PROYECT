"use client"

import { useContent } from "@/lib/hooks/use-content"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import type { JSX } from "react/jsx-runtime"

interface ContentRendererProps {
  section: string
  field: string
  fallback?: string
  as?: keyof JSX.IntrinsicElements
  className?: string
}

export function ContentRenderer({
  section,
  field,
  fallback = "",
  as: Component = "span",
  className = "",
}: ContentRendererProps) {
  const { content, isLoading, error } = useContent(section)
  const [retryCount, setRetryCount] = useState(0)
  const [showFallback, setShowFallback] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(true)

  // Efecto para actualizar el estado de showSkeleton basado en isLoading
  useEffect(() => {
    setShowSkeleton(isLoading)
  }, [isLoading])

  // Efecto para mostrar el fallback después de un breve retraso si hay un error
  useEffect(() => {
    if (error && !showFallback) {
      const timer = setTimeout(() => {
        setShowFallback(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [error, showFallback])

  // Efecto para incrementar el contador de reintentos después de un tiempo
  useEffect(() => {
    if (showSkeleton) {
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [retryCount, showSkeleton])

  // Determinar qué renderizar
  if ((error && showFallback) || (showSkeleton && retryCount > 2)) {
    return <Component className={className}>{fallback}</Component>
  }

  if (showSkeleton) {
    return <Skeleton className={`h-6 w-full ${className}`} />
  }

  // Mostrar el contenido o el fallback si no existe
  const value = content[field] || fallback

  return <Component className={className}>{value}</Component>
}
