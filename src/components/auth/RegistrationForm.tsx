import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"


export function RegistrationForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  // Send OTP via backend
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await axios.post("/api/user/send-otp", { mobile })
      if (res.data.ok) {
        toast({ title: "OTP Sent", description: "Check your SMS for the OTP." })
        setSentOtp("sent")
      } else {
        toast({ title: "Error", description: res.data.error || "Failed to send OTP", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to send OTP", variant: "destructive" })
    }
    setIsLoading(false)
  }

  // Verify OTP via backend
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await axios.post("/api/user/verify-registration-otp", { mobile, otp })
      if (res.data.ok) {
        toast({ title: "Verified", description: "Mobile number verified." })
        setMobileVerified(true)
        setStep(2) // Advance to next step after OTP verification
      } else {
        toast({ title: "Invalid OTP", description: res.data.error || "Please try again.", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Invalid OTP", description: err.response?.data?.error || "Please try again.", variant: "destructive" })
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" })
      return
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please re-enter your password.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      toast({
        title: "Verification initiated",
        description: "We'll review your documents and get back to you shortly.",
      })
      setStep(2)
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Register for SafeTour</CardTitle>
          <CardDescription>
            Create your account with secure document verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="As per official documents" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+91..." required value={mobile} onChange={e => setMobile(e.target.value)} disabled={mobileVerified} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="document-type">ID Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="document-type">
                    <SelectValue placeholder="Select verification document" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="document-number">Document Number</Label>
                <Input 
                  id="document-number" 
                  placeholder="Enter your Aadhaar/Passport number" 
                  required 
                  value={documentNumber}
                  onChange={e => setDocumentNumber(e.target.value)}
                />
              </div>
            </div>
            <CardFooter className="flex flex-col gap-4 items-stretch">
              <Button className="w-full" type="submit" disabled={isLoading || !mobileVerified}>Continue to Emergency Contacts</Button>
              <div className="border-t pt-4 mt-4">
                <div className="font-semibold mb-2">Verify Mobile <span className="text-red-500">(Required)</span></div>
                <form onSubmit={handleSendOtp} className="flex gap-2 mb-2">
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="+91..."
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    disabled={mobileVerified}
                  />
                  <Button type="submit" disabled={isLoading || mobileVerified}>Send OTP</Button>
                </form>
                {sentOtp && !mobileVerified && (
                  <form onSubmit={handleVerifyOtp} className="flex gap-2">
                    <Input
                      id="otp"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                    />
                    <Button type="submit" disabled={isLoading}>Verify OTP</Button>
                  </form>
                )}
                {mobileVerified && <div className="text-green-600 text-sm mt-1">Mobile verified!</div>}
                {!mobileVerified && <div className="text-red-500 text-xs mt-1">You must verify your mobile to continue.</div>}
              </div>
            </CardFooter>
          </form>
        </CardContent>
        {step === 2 && (
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Emergency Contact 1</Label>
                  <Input placeholder="Contact Name" required />
                  <Input type="tel" placeholder="Contact Phone Number" required />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Emergency Contact 2</Label>
                  <Input placeholder="Contact Name" required />
                  <Input type="tel" placeholder="Contact Phone Number" required />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardFooter>
                <div className="flex w-full gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading}>Back</Button>
                  <Button className="flex-1" type="submit" disabled={isLoading}>Complete Registration</Button>
                </div>
              </CardFooter>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  )
}