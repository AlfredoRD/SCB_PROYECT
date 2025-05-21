"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "@/lib/hooks/use-session"
import { supabase } from "@/lib/supabase/client"
import { LogoutButton } from "./logout-button"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoError, setLogoError] = useState(false)
  const pathname = usePathname()
  const { session, loading } = useSession()

  useEffect(() => {
    let isMounted = true

    // Obtener el rol del usuario
    if (session?.user?.id) {
      const fetchUserRole = async () => {
        try {
          const { data } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()
          if (isMounted) {
            setUserRole(data?.role || "user")
          }
        } catch (error) {
          console.error("Error al obtener el rol:", error)
          if (isMounted) {
            setUserRole("user")
          }
        }
      }
      fetchUserRole()
    }

    // Obtener el logo del sitio
    const fetchLogo = async () => {
      try {
        if (!isMounted) return

        const { data, error } = await supabase.from("content").select("content").eq("section", "site_logo").limit(1)

        if (!isMounted) return

        if (error) {
          console.error("Error al obtener el logo:", error)
          setLogoError(true)
          return
        }

        // Verificar si hay datos y si tienen la propiedad url o imageData
        let url = null
        if (data && data.length > 0 && data[0].content) {
          // Asegurarse de que content es un objeto y no una cadena
          const contentObj = typeof data[0].content === "string" ? JSON.parse(data[0].content) : data[0].content

          if (contentObj.imageData) {
            url = contentObj.imageData
          } else if (contentObj.url) {
            url = contentObj.url
          }
        }

        if (isMounted) {
          setLogoUrl(url)
        }
      } catch (error) {
        if (!isMounted) return
        console.error("Error al obtener el logo:", error)
        setLogoError(true)
      }
    }

    fetchLogo()

    // Función de limpieza para evitar actualizaciones de estado después de desmontar
    return () => {
      isMounted = false
    }
  }, [session])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-black text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          {!logoError && logoUrl ? (
            <>
              <img
                src={logoUrl || "/placeholder.svg"}
                alt="Logo Premios San Cristóbal"
                className="h-10 w-auto"
                onError={() => setLogoError(true)}
              />
              <span className="text-xl font-bold">Premios San Cristóbal</span>
            </>
          ) : (
            <span className="text-xl font-bold">Premios San Cristóbal</span>
          )}
        </Link>

        {/* Navegación para escritorio */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-pink-500 transition-colors">
            Inicio
          </Link>
          <Link href="/categorias" className="hover:text-pink-500 transition-colors">
            Categorías
          </Link>
          <Link href="/nominados" className="hover:text-pink-500 transition-colors">
            Nominados
          </Link>
          <Link href="/academia" className="hover:text-pink-500 transition-colors">
            Academia
          </Link>
          <Link href="/evento" className="hover:text-pink-500 transition-colors">
            Evento
          </Link>
          <Link href="/acerca" className="hover:text-pink-500 transition-colors">
            Acerca
          </Link>
        </nav>

        {/* Botones de autenticación para escritorio */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <span className="text-sm">Cargando...</span>
          ) : session ? (
            <div className="flex items-center space-x-4">
              {userRole === "admin" && (
                <Link href="/admin" className="text-white hover:text-pink-500 transition-colors">
                  Panel Admin
                </Link>
              )}
              <Link href="/perfil" className="text-white hover:text-pink-500 transition-colors">
                Mi Perfil
              </Link>
              <Link href="/mis-votos" className="text-white hover:text-pink-500 transition-colors">
                Mis Votos
              </Link>
              <LogoutButton
                variant="default"
                className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg transition-colors"
              />
            </div>
          ) : (
            <>
              <Link href="/login" className="text-white hover:text-pink-500 transition-colors">
                Iniciar Sesión
              </Link>
              <Link href="/registro" className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg transition-colors">
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Botón de menú móvil */}
        <button className="md:hidden text-white" onClick={toggleMenu}>
          {isMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <Link href="/" className="text-white hover:text-pink-500 transition-colors" onClick={toggleMenu}>
              Inicio
            </Link>
            <Link href="/categorias" className="text-white hover:text-pink-500 transition-colors" onClick={toggleMenu}>
              Categorías
            </Link>
            <Link href="/nominados" className="text-white hover:text-pink-500 transition-colors" onClick={toggleMenu}>
              Nominados
            </Link>
            <Link href="/academia" className="text-white hover:text-pink-500 transition-colors" onClick={toggleMenu}>
              Academia
            </Link>
            <Link href="/evento" className="text-white hover:text-pink-500 transition-colors" onClick={toggleMenu}>
              Evento
            </Link>
            <Link href="/acerca" className="text-white hover:text-pink-500 transition-colors" onClick={toggleMenu}>
              Acerca
            </Link>
            {!loading && (
              <div className="pt-4 border-t border-gray-800">
                {session ? (
                  <div className="flex flex-col space-y-2">
                    {userRole === "admin" && (
                      <Link
                        href="/admin"
                        className="text-white hover:text-pink-500 transition-colors"
                        onClick={toggleMenu}
                      >
                        Panel Admin
                      </Link>
                    )}
                    <Link
                      href="/perfil"
                      className="text-white hover:text-pink-500 transition-colors"
                      onClick={toggleMenu}
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      href="/mis-votos"
                      className="text-white hover:text-pink-500 transition-colors"
                      onClick={toggleMenu}
                    >
                      Mis Votos
                    </Link>
                    <LogoutButton
                      variant="default"
                      className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg text-white text-center transition-colors"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/login"
                      className="text-white hover:text-pink-500 transition-colors"
                      onClick={toggleMenu}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/registro"
                      className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg text-center transition-colors"
                      onClick={toggleMenu}
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
