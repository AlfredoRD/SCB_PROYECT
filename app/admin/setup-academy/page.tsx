import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import type { Database } from "@/lib/database.types"
import { CreateAcademyTables } from "@/components/create-academy-tables"

export default async function SetupAcademyPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Verificar si el usuario es administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p>Debes iniciar sesión como administrador para acceder a esta página.</p>
        <Link href="/login" className="text-blue-500 hover:underline">
          Iniciar Sesión
        </Link>
      </div>
    )
  }

  // Obtener el rol del usuario
  const { data: userProfile } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

  if (userProfile?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p>Solo los administradores pueden acceder a esta página.</p>
        <Link href="/" className="text-blue-500 hover:underline">
          Volver al Inicio
        </Link>
      </div>
    )
  }

  // Verificar si las tablas ya existen
  const { error: tableCheckError } = await supabase.from("artistic_genres").select("count").limit(1)
  const tablesExist = !tableCheckError || !tableCheckError.message.includes("does not exist")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configuración de Academia</h1>
        <Link href="/admin" className="text-blue-500 hover:underline">
          ← Volver al Panel de Administración
        </Link>
      </div>

      {tablesExist ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Tablas ya configuradas</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Las tablas de la Academia ya están configuradas en la base de datos.</p>
              </div>
              <div className="mt-4">
                <div className="flex space-x-4">
                  <Link
                    href="/admin/generos-artisticos"
                    className="text-sm font-medium text-green-600 hover:text-green-500"
                  >
                    Administrar Géneros
                  </Link>
                  <Link
                    href="/admin/miembros-academia"
                    className="text-sm font-medium text-green-600 hover:text-green-500"
                  >
                    Administrar Miembros
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <CreateAcademyTables />
          </div>
        </div>
      )}
    </div>
  )
}
