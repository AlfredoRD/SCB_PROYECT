export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded"></div>
        ))}
      </div>
      <div className="h-64 bg-muted animate-pulse rounded mt-4"></div>
    </div>
  )
}
