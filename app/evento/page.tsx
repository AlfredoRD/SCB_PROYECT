import type { Metadata } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { FilterDropdown } from "@/components/filter-dropdown"

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

export default async function EventosPage({ searchParams }) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener el filtro de los parámetros de búsqueda
  const filter = searchParams?.filter || "all"

  // Consulta base
  let query = supabase.from("events").select("*")

  // Aplicar filtros
  if (filter === "upcoming") {
    query = query.gte("date", new Date().toISOString())
  } else if (filter === "past") {
    query = query.lt("date", new Date().toISOString())
  } else if (filter === "featured") {
    query = query.eq("is_featured", true)
  }

  // Ordenar por fecha
  const { data: events, error } = await query.order("date", { ascending: true })

  // Agrupar eventos por mes
  const groupedEvents = groupEventsByMonth(events || [])

  return (
    <div>
      {/* Sección de encabezado */}
      <div className="w-full py-16 md:py-24 bg-black text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Calendario de Eventos</h1>
          <p className="text-xl max-w-3xl mx-auto">
            No te pierdas nuestros eventos especiales donde celebramos a los nominados y ganadores de los Premios San
            Cristóbal.
          </p>
        </div>
      </div>

      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold">Próximos Eventos</h2>
            <p className="text-muted-foreground mt-2">Todos los eventos relacionados con los Premios San Cristóbal</p>
          </div>

          <div className="flex items-center gap-2">
            <FilterDropdown />
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
    </div>
  )
}
