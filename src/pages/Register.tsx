import { RegistrationForm } from "@/components/auth/RegistrationForm"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Join SafeTour</h1>
          <p className="text-muted-foreground">
            Secure registration with official ID verification for a safer travel experience
          </p>
        </div>
        <RegistrationForm />
      </div>
    </div>
  )
}