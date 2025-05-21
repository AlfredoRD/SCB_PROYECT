import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function VerificacionExitosa() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-lg shadow-lg text-center">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold">¡Verificación Exitosa!</h1>

        <p className="text-gray-400">
          Tu dirección de correo electrónico ha sido verificada correctamente. Ahora puedes iniciar sesión en tu cuenta.
        </p>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-block px-6 py-3 text-white bg-pink-600 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
