import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  MessageCircle,
  MapPin,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react"
import type { FriendCircle, Message } from "@/types/friend-network"

// Mock data - replace with real data from your backend
const mockCircles: FriendCircle[] = [
  {
    id: "1",
    name: "Travel Buddies",
    description: "Friends from the Europe trip",
    members: [
      {
        id: "1",
        userId: "user1",
        name: "John Doe",
        role: "admin",
        status: "active",
        lastSeen: new Date(),
        notificationPreferences: {
          alerts: true,
          locationUpdates: true,
          checkIns: true,
          emergencyOnly: false,
        },
      },
      // Add more members...
    ],
    createdBy: "user1",
    createdAt: new Date(),
    isEmergencyCircle: false,
  },
]

const mockMessages: Message[] = [
  {
    id: "1",
    circleId: "1",
    senderId: "user1",
    senderName: "John Doe",
    content: "Just checked in at the hotel",
    type: "check-in",
    timestamp: new Date(),
    metadata: {
      location: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      checkInType: "manual",
    },
    deliveryStatus: "delivered",
    receivedBy: ["user2", "user3"],
  },
  // Add more messages...
]


export default function FriendNetworkPage() {
  const [circles, setCircles] = useState<FriendCircle[]>(mockCircles)
  const [messages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    // TODO: Implement message sending
    setNewMessage("")
  }

  const handleCreateCircle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem('circleName') as HTMLInputElement)?.value.trim()
    const description = (form.elements.namedItem('circleDescription') as HTMLInputElement)?.value.trim()
    if (!name) return
    setCircles(prev => [
      ...prev,
      {
        id: (Date.now() + Math.random()).toString(),
        name,
        description,
        members: [],
        createdBy: 'me',
        createdAt: new Date(),
        isEmergencyCircle: false,
      }
    ])
    setDialogOpen(false)
    form.reset()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        {/* Online Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span>Offline - Mesh Network Active</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-yellow-500" />
                    <span>Offline - Using Peer-to-Peer Network</span>
                  </>
                )}
              </div>
              <Badge variant="outline" className="bg-blue-100">
                5 Peers Connected
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="circles">
          <TabsList>
            <TabsTrigger value="circles">
              <Users className="h-4 w-4 mr-2" />
              Friend Circles
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="circles">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Circles</CardTitle>
                    <CardDescription>
                      Manage your friend circles and emergency contacts
                    </CardDescription>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Circle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Circle</DialogTitle>
                        <DialogDescription>
                          Create a new circle of friends for trip sharing and safety monitoring
                        </DialogDescription>
                      </DialogHeader>
                      <form id="create-circle-form" onSubmit={handleCreateCircle}>
                        <div className="space-y-4 py-2">
                          <Input
                            id="circle-name"
                            name="circleName"
                            placeholder="Circle Name"
                            required
                          />
                          <Input
                            id="circle-description"
                            name="circleDescription"
                            placeholder="Description (optional)"
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit">Create Circle</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {circles.map((circle) => (
                    <Card key={circle.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{circle.name}</CardTitle>
                            <CardDescription>{circle.description}</CardDescription>
                          </div>
                          {circle.isEmergencyCircle && (
                            <Badge variant="destructive">Emergency Circle</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {circle.members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-2 bg-secondary p-2 rounded-lg"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>
                                  {member.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{member.name}</span>
                              {member.status === "active" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          View on Map
                        </Button>
                        <Button variant="outline" size="sm">
                          Manage Members
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Circle Messages</CardTitle>
                <CardDescription>
                  Chat and share updates with your circles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid gap-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-secondary"
                      >
                        <Avatar>
                          <AvatarFallback>
                            {message.senderName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {message.senderName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="mt-1">{message.content}</p>
                          {message.type === "check-in" && (
                            <div className="mt-2 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm text-muted-foreground">
                                Location shared
                              </span>
                            </div>
                          )}
                        </div>
                        {message.deliveryStatus === "delivered" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : message.deliveryStatus === "failed" ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <div className="flex w-full gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSendMessage()
                    }}
                  />
                  <Button onClick={handleSendMessage}>Send</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}