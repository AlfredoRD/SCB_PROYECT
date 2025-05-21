"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Clock, Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function UpcomingEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)

        // Usar la API pública para obtener eventos sin requerir autenticación
        const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true }).limit(3)

        if (error) throw error

        // Si no hay datos o hay un error, mostrar mensaje de error
        if (!data || data.length === 0) {
          console.log("No se encontraron eventos")
        } else {
          console.log("Eventos cargados:", data.length)
        }

        setEvents(data || [])
      } catch (error) {
        console.error("Error fetching events:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [supabase])

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Función para formatear la hora
  const formatTime = (timeString) => {
    if (!timeString) return ""
    return timeString
  }

  // Determinar el layout basado en la cantidad de eventos
  const getGridClass = () => {
    if (events.length === 1) return "grid-cols-1"
    if (events.length === 2) return "grid-cols-1 md:grid-cols-2"
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  }

  // Renderizar un solo evento en formato grande
  const renderSingleEvent = (event) => {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <Card className="overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 h-80 md:h-auto bg-gray-200 flex items-center justify-center">
            {event.image_url ? (
              <img
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <CalendarDays className="h-24 w-24 text-gray-400" />
            )}
          </div>
          <div className="md:w-1/2 flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="text-3xl">{event.title || "Evento sin título"}</CardTitle>
              <CardDescription className="text-lg mt-2">{event.description || "Sin descripción"}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <span className="text-base">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-base">{formatTime(event.time) || "Horario por confirmar"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-base">{event.location || "Ubicación por confirmar"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/evento/${event.id}`}>
                <Button variant="default" size="lg" className="px-8">
                  Más Información
                </Button>
              </Link>
            </CardFooter>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <section className="container mx-auto py-8 bg-muted/30 rounded-lg">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Próximos Eventos</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          No te pierdas nuestros eventos especiales donde celebramos a los nominados y ganadores de los Premios San
          Cristóbal.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">Error al cargar eventos: {error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Próximamente</h3>
          <p className="text-muted-foreground">
            Estamos preparando nuevos eventos. ¡Vuelve pronto para más información!
          </p>
        </div>
      ) : events.length === 1 ? (
        // Renderizar un solo evento en formato grande
        renderSingleEvent(events[0])
      ) : (
        <>
          <div className={`grid ${getGridClass()} gap-8`}>
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="relative h-64 bg-gray-200 flex items-center justify-center">
                  {event.image_url ? (
                    <img
                      src={event.image_url || "/placeholder.svg"}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CalendarDays className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{event.title || "Evento sin título"}</CardTitle>
                  <CardDescription>{event.description || "Sin descripción"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span className="text-sm">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">{formatTime(event.time) || "Horario por confirmar"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">{event.location || "Ubicación por confirmar"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/evento/${event.id}`}>
                    <Button variant="default">Más Información</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link href="/evento">
              <Button variant="outline" className="group">
                Ver todos los eventos
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
