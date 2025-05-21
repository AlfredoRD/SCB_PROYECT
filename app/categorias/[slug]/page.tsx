import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import VoteButton from "@/components/vote-button"

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const supabase = createServerClient()

  // Obtener la categoría por su slug
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single()

  // Si hay un error o no se encuentra la categoría, mostrar la página 404
  if (categoryError || !category) {
    console.error("Error al obtener la categoría:", categoryError)
    notFound()
  }

  // Obtener los nominados de esta categoría
  const { data: nominees, error: nomineesError } = await supabase
    .from("nominees")
    .select("*")
    .eq("category", category.name)
    .order("name")

  if (nomineesError) {
    console.error("Error al obtener los nominados:", nomineesError)
  }

  return (
    <div className="container py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{category.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nominees && nominees.length > 0 ? (
          nominees.map((nominee) => (
            <Card key={nominee.id} className="overflow-hidden" id={`nominee-${nominee.id}`}>
              <div className="relative h-48 bg-muted">
                <img
                  src={nominee.image_url || `/placeholder.svg?height=200&width=400&query=nominee`}
                  alt={nominee.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={nominee.avatar_url || `/placeholder.svg?height=50&width=50&query=avatar`}
                      alt={nominee.name}
                    />
                    <AvatarFallback>{nominee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{nominee.name}</CardTitle>
                    <CardDescription>{nominee.title}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{nominee.description}</p>
                <div className="flex flex-wrap gap-2">
                  {nominee.tags?.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <VoteButton nomineeId={nominee.id} />
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium mb-2">No hay nominados en esta categoría</h3>
            <p className="text-muted-foreground">Pronto se añadirán nominados a esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  )
}
