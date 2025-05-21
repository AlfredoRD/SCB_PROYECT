import type { Metadata } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, MapPin, Users, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import EventRegistrationButton from "@/components/event-registration-button"

export async function generateMetadata({ params }): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  const { data: event } = await supabase.from("events").select("*").eq("id", params.id).single()

  if (!event) {
    return {
      title: "Evento no encontrado | Premios San Cristóbal",
      description: "El evento solicitado no existe o ha sido eliminado.",
    }
  }

  return {
    title: `${event.title || "Evento"} | Premios San Cristóbal`,
    description: event.description || "Detalles del evento de los Premios San Cristóbal",
  }
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

export default async function EventoPage({ params }) {
  const supabase = createServerComponentClient({ cookies })

  // Obtener el evento actual
  const { data: event, error } = await supabase.from("events").select("*").eq("id", params.id).single()

  // Obtener eventos relacionados (excluyendo el actual)
  const { data: relatedEvents } = await supabase
    .from("events")
    .select("*")
    .neq("id", params.id)
    .order("date", { ascending: true })
    .limit(3)

  if (error || !event) {
    notFound()
  }

  return (
    <div className="container py-10">
      <Link href="/evento" className="flex items-center text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a eventos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl font-bold">{event.title || "Evento sin título"}</h1>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="relative h-80 md:h-96 rounded-lg overflow-hidden mb-8">
            {event.image_url ? (
              <img
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <CalendarDays className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed">
              {event.description || "No hay descripción disponible para este evento."}
            </p>

            {event.content && <div dangerouslySetInnerHTML={{ __html: event.content }} />}

            <h2>Detalles del Evento</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-8">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">Fecha</h4>
                  <p className="text-muted-foreground">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">Hora</h4>
                  <p className="text-muted-foreground">{formatTime(event.time) || "Horario por confirmar"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">Ubicación</h4>
                  <p className="text-muted-foreground">{event.location || "Ubicación por confirmar"}</p>
                </div>
              </div>

              {event.capacity && (
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-lg">Capacidad</h4>
                    <p className="text-muted-foreground">{event.capacity} asistentes</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <EventRegistrationButton eventId={event.id} className="mr-4" />
              <Button variant="outline" size="lg">
                Añadir al calendario
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-6">Eventos Relacionados</h3>

              {relatedEvents && relatedEvents.length > 0 ? (
                <div className="space-y-6">
                  {relatedEvents.map((relEvent) => (
                    <Link href={`/evento/${relEvent.id}`} key={relEvent.id} className="block group">
                      <div className="flex gap-4">
                        <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                          {relEvent.image_url ? (
                            <img
                              src={relEvent.image_url || "/placeholder.svg"}
                              alt={relEvent.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <CalendarDays className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium group-hover:text-primary transition-colors">
                            {relEvent.title || "Evento sin título"}
                          </h4>
                          <p className="text-sm text-muted-foreground">{formatDate(relEvent.date)}</p>
                          <p className="text-sm text-muted-foreground">
                            {relEvent.location || "Ubicación por confirmar"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}

                  <div className="pt-4 border-t">
                    <Link href="/evento">
                      <Button variant="link" className="p-0 h-auto font-medium">
                        Ver todos los eventos
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay eventos relacionados disponibles</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
