import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

const ADMIN_USER = {
  username: "police",
  password: "password123"
}

export function AdminLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        toast({ title: "Admin Login Success", description: "Welcome, Police Admin!" })
        onSuccess?.()
      } else {
        toast({ title: "Invalid Credentials", description: "Incorrect username or password.", variant: "destructive" })
      }
      setIsLoading(false)
    }, 700)
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Police/Admin access only</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isLoading}>Login</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
