export default function ErrorAutenticacionPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold">Error de Autenticación</h1>
        <p className="text-gray-300">
          Ha ocurrido un error durante el proceso de autenticación. Por favor, intenta de nuevo más tarde.
        </p>
        <div className="pt-4">
          <a
            href="/"
            className="inline-block px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-colors"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  )
}
