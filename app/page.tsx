import Hero from "@/components/hero"
import FeaturedCategories from "@/components/featured-categories"
import UpcomingEvents from "@/components/upcoming-events"
import FeaturedGenres from "@/components/featured-genres"

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-8">
      <Hero />
      <FeaturedCategories />
      <UpcomingEvents />
      <FeaturedGenres />
    </div>
  )
}
