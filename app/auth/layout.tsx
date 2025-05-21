import type React from "react"
import { Inter } from "next/font/google"
import SimpleHeader from "@/components/simple-header"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "../providers"
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Premios San Cristóbal - Autenticación",
  description: "Celebrando la excelencia y el talento local",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-black text-white`}>
        <Providers>
          <SimpleHeader />
          <main className="flex-1">{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
