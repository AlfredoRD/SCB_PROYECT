import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn("h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent", className)}
      aria-label="Cargando"
    />
  )
}
