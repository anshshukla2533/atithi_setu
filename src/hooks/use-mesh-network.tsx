import { useState, useEffect, useCallback } from 'react'
import Peer from 'peerjs'
import { useToast } from "@/components/ui/use-toast"
import type { Message } from '@/types/friend-network'

interface PeerMessage {
  type: 'message' | 'location' | 'alert' | 'status';
  payload: any;
  timestamp: number;
  senderId: string;
}

export function useMeshNetwork(userId: string) {
  const [peer, setPeer] = useState<Peer | null>(null)
  const [connections, setConnections] = useState<Record<string, Peer.DataConnection>>({})
  const [isOnline, setIsOnline] = useState(true)
  const { toast } = useToast()

  // Initialize PeerJS
  useEffect(() => {
    const newPeer = new Peer(userId, {
      // Configure STUN/TURN servers for NAT traversal
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // Add your TURN servers here
        ]
      }
    })

    newPeer.on('open', () => {
      setPeer(newPeer)
      setIsOnline(true)
      toast({
        title: "Connected to Network",
        description: "You're now connected to the mesh network"
      })
    })

    newPeer.on('error', (error) => {
      console.error('PeerJS error:', error)
      setIsOnline(false)
      toast({
        title: "Network Error",
        description: "Falling back to offline mode",
        variant: "destructive"
      })
    })

    newPeer.on('connection', handleConnection)

    return () => {
      newPeer.destroy()
    }
  }, [userId])

  // Handle new peer connections
  const handleConnection = useCallback((conn: Peer.DataConnection) => {
    conn.on('open', () => {
      setConnections(prev => ({ ...prev, [conn.peer]: conn }))
      
      conn.on('data', (data: PeerMessage) => {
        handleIncomingMessage(data)
      })

      conn.on('close', () => {
        setConnections(prev => {
          const newConnections = { ...prev }
          delete newConnections[conn.peer]
          return newConnections
        })
      })
    })
  }, [])

  // Connect to a peer
  const connectToPeer = useCallback((peerId: string) => {
    if (!peer) return

    const conn = peer.connect(peerId)
    handleConnection(conn)
  }, [peer, handleConnection])

  // Handle incoming messages
  const handleIncomingMessage = useCallback((data: PeerMessage) => {
    switch (data.type) {
      case 'message':
        // Handle chat message
        break
      case 'location':
        // Handle location update
        break
      case 'alert':
        // Handle emergency alert
        toast({
          title: "Emergency Alert",
          description: data.payload.message,
          variant: "destructive"
        })
        break
      case 'status':
        // Handle status update
        break
    }
  }, [])

  // Broadcast message to all connected peers
  const broadcast = useCallback((type: PeerMessage['type'], payload: any) => {
    const message: PeerMessage = {
      type,
      payload,
      timestamp: Date.now(),
      senderId: userId
    }

    Object.values(connections).forEach(conn => {
      conn.send(message)
    })
  }, [connections, userId])

  // Send message to specific peer
  const sendToPeer = useCallback((peerId: string, type: PeerMessage['type'], payload: any) => {
    const conn = connections[peerId]
    if (!conn) return false

    const message: PeerMessage = {
      type,
      payload,
      timestamp: Date.now(),
      senderId: userId
    }

    conn.send(message)
    return true
  }, [connections, userId])

  // Send chat message
  const sendMessage = useCallback((message: Omit<Message, 'id' | 'timestamp' | 'deliveryStatus' | 'receivedBy'>) => {
    broadcast('message', message)
  }, [broadcast])

  // Send location update
  const sendLocation = useCallback((location: { latitude: number; longitude: number }) => {
    broadcast('location', location)
  }, [broadcast])

  // Send emergency alert
  const sendAlert = useCallback((alert: { type: string; message: string }) => {
    broadcast('alert', alert)
  }, [broadcast])

  return {
    isOnline,
    connectToPeer,
    sendMessage,
    sendLocation,
    sendAlert,
    connections: Object.keys(connections).length
  }
}