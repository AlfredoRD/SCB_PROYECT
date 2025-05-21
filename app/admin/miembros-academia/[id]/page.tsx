import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import type { Database } from "@/lib/database.types"
import AcademyMemberForm from "@/components/academy-member-form"

interface EditAcademyMemberPageProps {
  params: {
    id: string
  }
}

export default async function EditAcademyMemberPage({ params }: EditAcademyMemberPageProps) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: member, error } = await supabase.from("academy_members").select("*").eq("id", params.id).single()

  if (error || !member) {
    notFound()
  }

  // Asegurarse de que los datos no sean null
  const sanitizedMember = {
    ...member,
    bio: member.bio || "",
    photo_url: member.photo_url || "",
    social_media: member.social_media || {},
    achievements: member.achievements || [],
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Miembro de Academia</h1>
      <AcademyMemberForm initialData={sanitizedMember} />
    </div>
  )
}
