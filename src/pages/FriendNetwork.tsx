import { GoogleLiveMap } from "@/components/map/GoogleLiveMap";
import { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"
import React from "react"
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

// Mock data types
interface Member {
  id: string;
  userId: string;
  name: string;
  role: string;
  status: "active" | "inactive";
  lastSeen: Date;
  notificationPreferences: {
    alerts: boolean;
    locationUpdates: boolean;
    checkIns: boolean;
    emergencyOnly: boolean;
  };
}

interface FriendCircle {
  id: string;
  name: string;
  description: string;
  members: Member[];
  createdBy: string;
  createdAt: Date;
  isEmergencyCircle: boolean;
}

interface Message {
  id: string;
  circleId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: "check-in" | "message";
  timestamp: Date;
  metadata?: {
    location?: {
      latitude: number;
      longitude: number;
    };
    checkInType?: string;
  };
  deliveryStatus: "delivered" | "pending" | "failed";
  receivedBy: string[];
}

// Mock data
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
      {
        id: "2",
        userId: "user2",
        name: "Jane Smith",
        role: "member",
        status: "active",
        lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        notificationPreferences: {
          alerts: true,
          locationUpdates: true,
          checkIns: true,
          emergencyOnly: false,
        },
      },
      {
        id: "3",
        userId: "user3",
        name: "Mike Johnson",
        role: "member",
        status: "inactive",
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        notificationPreferences: {
          alerts: false,
          locationUpdates: true,
          checkIns: true,
          emergencyOnly: true,
        },
      },
    ],
    createdBy: "user1",
    createdAt: new Date(),
    isEmergencyCircle: false,
  },
  {
    id: "2",
    name: "Emergency Contacts",
    description: "Family and close friends for emergencies",
    members: [
      {
        id: "4",
        userId: "user4",
        name: "Sarah Wilson",
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
    ],
    createdBy: "user1",
    createdAt: new Date(),
    isEmergencyCircle: true,
  },
]

const SOCKET_SERVER_URL = "http://localhost:4100"; // Updated to match backend port

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
  {
    id: "2",
    circleId: "1",
    senderId: "user2",
    senderName: "Jane Smith",
    content: "Great! I'm about 10 minutes away",
    type: "message",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    deliveryStatus: "delivered",
    receivedBy: ["user1", "user3"],
  },
  {
    id: "3",
    circleId: "1",
    senderId: "user3",
    senderName: "Mike Johnson",
    content: "Running late, will be there in 30 mins",
    type: "message",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    deliveryStatus: "pending",
    receivedBy: ["user1"],
  },
]

// Map Dialog Component
function MapDialog({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);
  
  // Dummy data for demo
  const presentLoc = { lat: 17.385, lng: 78.4867 }; // Hyderabad
  const gunturLoc = { lat: 16.3067, lng: 80.4428 };
  const friendLoc = { lat: presentLoc.lat + 0.01, lng: presentLoc.lng + 0.01 };

  // Simple straight line route
  const polyline = [
    presentLoc,
    { lat: 17.0, lng: 79.5 }, // mid point
    gunturLoc
  ];

  // Dummy danger area (for future: add support for circles in GoogleLiveMap)
  // const dangerAreas = [
  //   { center: { lat: 16.8, lng: 80.0 }, radius: 20000 } // 20km radius
  // ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MapPin className="h-4 w-4 mr-2" />
          View Location
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Location View</DialogTitle>
          <DialogDescription>
            Your location and {member.name}'s location
          </DialogDescription>
        </DialogHeader>
        <div style={{ height: 400, width: '100%' }}>
          <GoogleLiveMap
            center={presentLoc}
            zoom={7}
            polyline={polyline}
            markers={[
              { id: 'me', ...presentLoc, name: 'You', status: 'Present Location' },
              { id: 'guntur', ...gunturLoc, name: 'Guntur', status: 'Destination' },
              { id: 'friend', ...friendLoc, name: member.name, status: 'Dummy Friend' }
            ]}
            // circles={dangerAreas} // If you add support for circles in GoogleLiveMap
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}


export default function FriendNetworkPage() {
  const [circles, setCircles] = useState<FriendCircle[]>(mockCircles)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isOnline, setIsOnline] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [circleFormData, setCircleFormData] = useState({ name: "", description: "" })
  const socketRef = useRef<Socket | null>(null)
  const userId = "user1"; // TODO: Replace with actual logged-in user id
  const userName = "John Doe"; // TODO: Replace with actual logged-in user name

  useEffect(() => {
    // Connect to socket.io server
    const socket = io(SOCKET_SERVER_URL, { transports: ["websocket"] })
    socketRef.current = socket

    // Join all circles (for demo, join all mock circles)
    mockCircles.forEach(circle => {
      socket.emit("join_circle", { circleId: circle.id, userId, userName })
    })

    // Listen for incoming messages
    socket.on("circle_message", (msg: Message) => {
      setMessages(prev => [...prev, msg])
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    const activeCircle = circles[0] // For demo, send to first circle
    const msg: Message = {
      id: Date.now().toString(),
      circleId: activeCircle.id,
      senderId: userId,
      senderName: userName,
      content: newMessage,
      type: "message",
      timestamp: new Date(),
      deliveryStatus: "pending",
      receivedBy: [],
    }
    setMessages(prev => [...prev, msg]) // Optimistic update
    setNewMessage("")
    if (socketRef.current) {
      socketRef.current.emit("circle_message", msg)
    }
  }

  const handleCreateCircle = () => {
    if (!circleFormData.name.trim()) return
    
    const newCircle: FriendCircle = {
      id: (Date.now() + Math.random()).toString(),
      name: circleFormData.name,
      description: circleFormData.description || "",
      members: [],
      createdBy: 'me',
      createdAt: new Date(),
      isEmergencyCircle: false,
    }
    
    setCircles(prev => [...prev, newCircle])
    setDialogOpen(false)
    setCircleFormData({ name: "", description: "" })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Friend Network</h1>
          <p className="text-muted-foreground">Stay connected with your circles, even offline</p>
        </div>

        {/* Online Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span>Online - Internet Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-yellow-500" />
                    <span>Offline - Using Mesh Network</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100">
                  5 Peers Connected
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsOnline(!isOnline)}
                >
                  Toggle Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="circles">
          <TabsList className="grid w-full grid-cols-2">
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
                      <div className="space-y-4 py-4">
                        <Input
                          id="circle-name"
                          placeholder="Circle Name"
                          value={circleFormData.name}
                          onChange={(e) => setCircleFormData(prev => ({...prev, name: e.target.value}))}
                        />
                        <Input
                          id="circle-description"
                          placeholder="Description (optional)"
                          value={circleFormData.description}
                          onChange={(e) => setCircleFormData(prev => ({...prev, description: e.target.value}))}
                        />
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateCircle}>Create Circle</Button>
                      </DialogFooter>
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
                            <CardTitle className="flex items-center gap-2">
                              {circle.name}
                              <Badge variant="secondary">
                                {circle.members.length} member{circle.members.length !== 1 ? 's' : ''}
                              </Badge>
                            </CardTitle>
                            <CardDescription>{circle.description}</CardDescription>
                          </div>
                          {circle.isEmergencyCircle && (
                            <Badge variant="destructive">Emergency Circle</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {circle.members.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No members yet</p>
                          ) : (
                            circle.members.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center justify-between gap-2 bg-secondary p-3 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {member.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <span className="text-sm font-medium">{member.name}</span>
                                    <div className="flex items-center gap-1">
                                      {member.status === "active" ? (
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                      ) : (
                                        <Clock className="h-3 w-3 text-yellow-500" />
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        {member.status === "active" ? "Active" : "Last seen " + member.lastSeen.toLocaleTimeString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <MapDialog member={member} />
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm">
                          Manage Members
                        </Button>
                        <Button variant="outline" size="sm">
                          Circle Settings
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
                  <div className="space-y-4">
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
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-muted-foreground">
                                Location shared
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          {message.deliveryStatus === "delivered" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : message.deliveryStatus === "failed" ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-xs text-muted-foreground capitalize">
                            {message.deliveryStatus}
                          </span>
                        </div>
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