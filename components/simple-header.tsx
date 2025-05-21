import Link from "next/link"
import Image from "next/image"

export default function SimpleHeader() {
  return (
    <header className="bg-black text-white border-b border-gray-800 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <Image src="/abstract-logo.png" alt="Logo" fill style={{ objectFit: "contain" }} priority />
            </div>
            <h1 className="text-xl font-bold">Premios San Cristóbal</h1>
          </Link>

          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/registro" className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-md transition-colors">
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
