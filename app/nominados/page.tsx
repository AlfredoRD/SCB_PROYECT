import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import VoteButton from "@/components/vote-button"

export default async function NominadosPage() {
  const supabase = createServerClient()

  // Fetch nominees from database
  const { data: nominees } = await supabase.from("nominees").select("*").order("category")

  // Group nominees by category
  const nomineesByCategory: Record<string, any[]> = {}

  nominees?.forEach((nominee) => {
    if (!nomineesByCategory[nominee.category]) {
      nomineesByCategory[nominee.category] = []
    }
    nomineesByCategory[nominee.category].push(nominee)
  })

  return (
    <div className="container py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Nominados</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Conoce a los destacados individuos y organizaciones nominados para los Premios San Cristóbal de este año.
        </p>
      </div>

      {Object.entries(nomineesByCategory).map(([category, categoryNominees]) => (
        <div key={category} className="mb-16">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryNominees.map((nominee) => (
              <Card key={nominee.id} className="overflow-hidden" id={`nominee-${nominee.id}`}>
                <div className="relative h-48 bg-muted">
                  <img
                    src={nominee.image_url || `/images/nominee-${nominee.id}.jpg`}
                    alt={nominee.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={nominee.avatar_url || `/images/avatar-${nominee.id}.jpg`} alt={nominee.name} />
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
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
