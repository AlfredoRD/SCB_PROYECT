import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createServerClient } from "@/lib/supabase/server"

export default async function AcercaPage() {
  const supabase = createServerClient()

  // Obtener información de la página "about"
  let aboutData = null
  try {
    const { data, error } = await supabase.from("content").select("content").eq("section", "about").single()
    if (!error && data) {
      aboutData = data.content
      console.log("Datos obtenidos de about:", aboutData)
    }
  } catch (error) {
    console.error("Error al obtener información de about:", error)
  }

  // Obtener información de valores
  let valuesData = null
  try {
    const { data, error } = await supabase.from("content").select("content").eq("section", "values").single()
    if (!error && data) {
      valuesData = data.content
      console.log("Datos obtenidos de valores:", valuesData)
    }
  } catch (error) {
    console.error("Error al obtener información de valores:", error)
  }

  // Obtener información del proceso de selección
  let processData = null
  try {
    const { data, error } = await supabase.from("content").select("content").eq("section", "selection_process").single()
    if (!error && data) {
      processData = data.content
      console.log("Datos obtenidos del proceso de selección:", processData)
    }
  } catch (error) {
    console.error("Error al obtener información del proceso de selección:", error)
  }

  // Obtener información del equipo
  let teamData = null
  try {
    const { data, error } = await supabase.from("content").select("content").eq("section", "team_members").single()
    if (!error && data) {
      teamData = data.content
      console.log("Datos obtenidos del equipo:", teamData)
    }
  } catch (error) {
    console.error("Error al obtener información del equipo:", error)
  }

  // Obtener información de contacto
  let contactData = null
  try {
    const { data, error } = await supabase.from("content").select("content").eq("section", "contact").single()
    if (!error && data) {
      contactData = data.content
      console.log("Datos obtenidos de contacto:", contactData)
    }
  } catch (error) {
    console.error("Error al obtener información de contacto:", error)
  }

  // Valores predeterminados para about
  const defaultAbout = {
    title: "Acerca de los Premios San Cristóbal",
    history:
      "Los Premios San Cristóbal nacieron en 2018 con la visión de reconocer y celebrar la excelencia en diversos ámbitos de nuestra sociedad.",
    history_additional:
      "A lo largo de los años, hemos tenido el honor de premiar a individuos y organizaciones excepcionales.",
    mission: "Nuestra misión es identificar, celebrar y promover la excelencia en todas sus formas.",
    vision:
      "Ser el reconocimiento más prestigioso y respetado en nuestra comunidad, inspirando a las nuevas generaciones a buscar la excelencia en sus respectivos campos.",
  }

  // Valores predeterminados para valores
  const defaultValues = {
    title: "Nuestros Valores",
    description: "Estos son los valores que guían nuestro trabajo y nuestra misión.",
    values: [
      {
        name: "Excelencia",
        description: "Buscamos y celebramos lo mejor en cada categoría.",
      },
      {
        name: "Integridad",
        description: "Mantenemos un proceso de selección transparente y justo.",
      },
      {
        name: "Diversidad",
        description: "Valoramos y reconocemos la diversidad de talentos y contribuciones.",
      },
      {
        name: "Impacto",
        description: "Priorizamos reconocer a quienes generan un impacto positivo en la sociedad.",
      },
      {
        name: "Innovación",
        description: "Celebramos el pensamiento innovador y las soluciones creativas.",
      },
    ],
  }

  // Valores predeterminados para proceso de selección
  const defaultProcess = {
    title: "El Proceso de Selección",
    description:
      "Nuestro riguroso proceso de selección comienza con una convocatoria abierta para nominaciones. Un comité de preselección evalúa todas las nominaciones recibidas y crea una lista de finalistas en cada categoría.",
    steps: [
      {
        title: "Convocatoria",
        description: "Abrimos la convocatoria para recibir nominaciones en todas las categorías.",
      },
      {
        title: "Preselección",
        description: "Un comité especializado evalúa las nominaciones y selecciona a los finalistas.",
      },
      {
        title: "Evaluación final",
        description: "El jurado evalúa a los finalistas y selecciona a los ganadores.",
      },
      {
        title: "Ceremonia",
        description: "Los ganadores son anunciados en una ceremonia de premiación.",
      },
    ],
    conclusion:
      "Este proceso garantiza que los Premios San Cristóbal mantengan su prestigio y que cada ganador sea verdaderamente merecedor del reconocimiento.",
  }

  // Valores predeterminados para el equipo
  const defaultTeam = {
    title: "Nuestro Equipo",
    members: [
      {
        name: "Carlos Rodríguez",
        role: "Director Ejecutivo",
        bio: "Con más de 15 años de experiencia en la organización de eventos culturales, Carlos lidera el equipo de los Premios San Cristóbal desde su fundación.",
        image: "/images/team-1.png",
      },
      {
        name: "Ana Martínez",
        role: "Directora de Comunicaciones",
        bio: "Especialista en relaciones públicas y comunicación estratégica, Ana es responsable de la imagen y presencia mediática de los Premios.",
        image: "/images/team-2.png",
      },
      {
        name: "Miguel Sánchez",
        role: "Coordinador de Eventos",
        bio: "Con una amplia experiencia en la producción de eventos de gran escala, Miguel asegura que cada ceremonia sea impecable y memorable.",
        image: "/images/team-3.png",
      },
      {
        name: "Laura Gómez",
        role: "Directora de Relaciones Institucionales",
        bio: "Laura trabaja estrechamente con instituciones y patrocinadores para fortalecer las alianzas que hacen posible los Premios San Cristóbal.",
        image: "/images/team-4.png",
      },
    ],
  }

  // Valores predeterminados para contacto
  const defaultContact = {
    info_title: "Información de Contacto",
    email: "contacto@premiossancristobal.com",
    phone: "+1 234 567 890",
    address: "Av. Principal #123, Ciudad",
    social_title: "Redes Sociales",
    facebook: "Facebook: /PremiosSanCristobal",
    twitter: "Twitter: @PremiosSC",
    instagram: "Instagram: @premiossancristobal",
  }

  // Combinar datos obtenidos con valores predeterminados
  const about = { ...defaultAbout, ...aboutData }
  const values = { ...defaultValues, ...valuesData }
  const process = { ...defaultProcess, ...processData }
  const team = { ...defaultTeam, ...teamData }
  const contact = { ...defaultContact, ...contactData }

  // Obtener imagen de hero personalizada
  let heroImageUrl = "/images/about-hero.png"
  try {
    const { data, error } = await supabase.from("content").select("content").eq("section", "about_hero").limit(1)
    if (!error && data && data.length > 0) {
      // Si estamos usando base64
      if (data[0].content?.imageData) {
        heroImageUrl = data[0].content.imageData
      }
      // Si estamos usando URL
      else if (data[0].content?.url) {
        heroImageUrl = data[0].content.url
      }
    }
  } catch (error) {
    console.error("Error al obtener imagen hero:", error)
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">{about.title || "Acerca de los Premios San Cristóbal"}</h1>

        <div className="relative h-80 rounded-lg overflow-hidden mb-8">
          <img
            src={heroImageUrl || "/placeholder.svg"}
            alt="Premios San Cristóbal"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <h2>Nuestra Historia</h2>
          <p>{about.history}</p>
          {about.history_additional && <p>{about.history_additional}</p>}

          <h2>Nuestra Misión</h2>
          <p>{about.mission}</p>

          <h2>Nuestra Visión</h2>
          <p>{about.vision}</p>

          <h2>{values.title}</h2>
          {values.description && <p>{values.description}</p>}
          <ul>
            {values.values &&
              Array.isArray(values.values) &&
              values.values.map((value, index) => (
                <li key={index}>
                  <strong>{value.name}:</strong> {value.description}
                </li>
              ))}
          </ul>

          <h2>{process.title}</h2>
          <p>{process.description}</p>
          <ul>
            {process.steps &&
              Array.isArray(process.steps) &&
              process.steps.map((step, index) => (
                <li key={index}>
                  <strong>{step.title}:</strong> {step.description}
                </li>
              ))}
          </ul>
          <p>{process.conclusion}</p>
        </div>

        <h2 className="text-2xl font-bold mb-6">{team.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {team.members &&
            Array.isArray(team.members) &&
            team.members.map((member, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.image || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
        </div>

        <h2 className="text-2xl font-bold mb-6">{contact.info_title || "Contacto"}</h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">{contact.info_title || "Información de Contacto"}</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>{contact.email}</p>
                  <p>{contact.phone}</p>
                  <p>{contact.address}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">{contact.social_title || "Redes Sociales"}</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>{contact.facebook}</p>
                  <p>{contact.twitter}</p>
                  <p>{contact.instagram}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
