"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Filter } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function FilterDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentFilter = searchParams.get("filter") || "all"

  const filters = [
    { id: "all", label: "Todos los eventos" },
    { id: "upcoming", label: "Próximos eventos" },
    { id: "past", label: "Eventos pasados" },
    { id: "featured", label: "Eventos destacados" },
  ]

  const currentFilterLabel = filters.find((f) => f.id === currentFilter)?.label || "Filtrar"

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleFilterChange = (filterId) => {
    const params = new URLSearchParams(searchParams)
    if (filterId === "all") {
      params.delete("filter")
    } else {
      params.set("filter", filterId)
    }
    router.push(`/evento?${params.toString()}`)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        {currentFilterLabel}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-background border z-10">
          <div className="py-1">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`
                  w-full text-left px-4 py-2 text-sm flex items-center justify-between
                  ${currentFilter === filter.id ? "bg-muted text-primary" : "hover:bg-muted"}
                `}
                onClick={() => handleFilterChange(filter.id)}
              >
                {filter.label}
                {currentFilter === filter.id && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
