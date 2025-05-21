import type { Metadata } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Clock, Calendar, ArrowLeft, Filter } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Eventos | Premios San Cristóbal",
  description: "Calendario de eventos de los Premios San Cristóbal",
}

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

// Función para agrupar eventos por mes y año
const groupEventsByMonth = (events) => {
  const grouped = {}

  events.forEach((event) => {
    if (!event.date) return

    const date = new Date(event.date)
    const monthYear = date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })

    if (!grouped[monthYear]) {
      grouped[monthYear] = []
    }

    grouped[monthYear].push(event)
  })

  return grouped
}

export default async function EventosPage() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener todos los eventos ordenados por fecha
  const { data: events, error } = await supabase.from("events").select("*").order("date", { ascending: true })

  // Agrupar eventos por mes
  const groupedEvents = groupEventsByMonth(events || [])

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link href="/" className="flex items-center text-muted-foreground hover:text-primary mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold">Calendario de Eventos</h1>
          <p className="text-muted-foreground mt-2">Todos los eventos relacionados con los Premios San Cristóbal</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500">Error al cargar eventos: {error.message}</p>
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No hay eventos programados</h3>
          <p className="text-muted-foreground">
            Estamos preparando nuevos eventos. ¡Vuelve pronto para más información!
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
            <div key={monthYear} className="space-y-6">
              <h2 className="text-2xl font-bold capitalize border-b pb-2">{monthYear}</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {monthEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden flex flex-col md:flex-row h-full">
                    <div className="md:w-2/5 h-64 md:h-auto bg-gray-200 flex items-center justify-center">
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
                    <div className="md:w-3/5 flex flex-col">
                      <CardHeader>
                        <CardTitle>{event.title || "Evento sin título"}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {event.description || "Sin descripción"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-3">
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
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
