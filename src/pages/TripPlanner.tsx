import { TripPlannerForm } from "@/components/trips/TripPlannerForm"

export default function TripPlannerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Plan Your Trip</h1>
        <p className="text-muted-foreground">
          Create a detailed itinerary with safety checkpoints and monitoring
        </p>
      </div>
      <TripPlannerForm />
    </div>
  )
}