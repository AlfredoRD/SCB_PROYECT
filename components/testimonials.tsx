import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Quote } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      content:
        "Ganar el Premio San Cristóbal ha sido uno de los momentos más significativos de mi carrera. El reconocimiento ha abierto muchas puertas y me ha permitido conectar con personas increíbles.",
      author: "María González",
      role: "Ganadora 2022 - Categoría Liderazgo",
    },
    {
      id: 2,
      content:
        "Los Premios San Cristóbal representan la excelencia en nuestra comunidad. Como jurado, he sido testigo del riguroso proceso de selección y la calidad de los nominados.",
      author: "Carlos Rodríguez",
      role: "Miembro del Jurado",
    },
    {
      id: 3,
      content:
        "Participar en la gala de los Premios San Cristóbal fue una experiencia inolvidable. La organización, el ambiente y la celebración de los logros de nuestra comunidad fueron excepcionales.",
      author: "Ana Martínez",
      role: "Nominada 2022 - Categoría Innovación",
    },
  ]

  return (
    <section className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Testimonios</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Conoce las experiencias de ganadores, nominados y participantes de ediciones anteriores de los Premios San
          Cristóbal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="h-full flex flex-col">
            <CardContent className="pt-6 flex-grow">
              <Quote className="h-8 w-8 text-primary mb-4 opacity-50" />
              <p className="italic text-muted-foreground">{testimonial.content}</p>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
