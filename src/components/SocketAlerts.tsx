import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { io, Socket } from 'socket.io-client'

type Alert = {
  userId: string
  lat: number
  lng: number
  timestamp: number
  type: string
  distance?: number
}

export default function SocketAlerts() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const socketRef = useRef<Socket | null>(null)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4100'

  useEffect(() => {
    let mounted = true

    function ensureSocket() {
      if (!mounted) return
      try {
  const socket = io(BACKEND_URL)
        socketRef.current = socket
        socket.on('connect', () => console.log('socket connected', socket.id))
        socket.on('alert', (a: Alert) => {
          // Log full alert and coordinates for quick inspection in the browser console
          console.log('[SocketAlerts] received alert:', a)
          console.log('[SocketAlerts] coords:', { lat: a.lat, lng: a.lng, userId: a.userId, distance: a.distance })
          setAlerts((s) => [a, ...s].slice(0, 20))
          toast({ title: 'Realtime Alert', description: `${a.type} for ${a.userId} (~${Math.round(a.distance||0)}m)`, variant: 'destructive' })
        })
      } catch (err) {
        console.warn('Socket connect error', err)
      }
    }

    ensureSocket()

    return () => {
      mounted = false
      try {
        socketRef.current?.off('alert')
        socketRef.current?.disconnect()
      } catch (e) {}
      socketRef.current = null
    }
  }, [toast])

  if (alerts.length === 0) return null

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Live Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {alerts.map((a, idx) => (
            <li key={idx} className="text-sm">
              <strong>{a.type}</strong> — {a.userId} @ {a.lat.toFixed(4)}, {a.lng.toFixed(4)} ({Math.round(a.distance||0)}m)
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
