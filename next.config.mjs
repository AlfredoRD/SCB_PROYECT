/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
  // Ignorar errores de ESLint durante la compilación
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignorar errores de TypeScript durante la compilación
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuración de webpack para ignorar ciertos errores
  webpack: (config, { isServer }) => {
    // Evitar que webpack se detenga en errores
    config.optimization = {
      ...config.optimization,
      emitOnErrors: false,
    }
    
    return config
  },
}

export default nextConfig
