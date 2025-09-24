import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import type { Alert as AlertType } from "@/types/alert"

// Mock data - replace with real data from your backend
const mockAlerts: AlertType[] = [
  {
    id: "1",
    type: "deviation",
    severity: "medium",
    title: "Route Deviation Detected",
    description: "You have deviated more than 1km from your planned route",
    timestamp: new Date(),
    userId: "user1",
    status: "active",
  },
  {
    id: "2",
    type: "danger-area",
    severity: "high",
    title: "Approaching High-Risk Area",
    description: "You are within 2km of a reported high-crime zone",
    timestamp: new Date(),
    userId: "user1",
    status: "active",
  },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts)

  const getAlertIcon = (type: AlertType["type"]) => {
    switch (type) {
      case "deviation":
        return <MapPin className="h-4 w-4" />
      case "danger-area":
        return <AlertTriangle className="h-4 w-4" />
      case "sos":
        return <ShieldAlert className="h-4 w-4" />
      case "safety-check":
        return <Clock className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: AlertType["severity"]) => {
    switch (severity) {
      case "low":
        return "bg-blue-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-orange-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleAcknowledge = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: "acknowledged" as const } 
        : alert
    ))
  }

  const handleResolve = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: "resolved" as const } 
        : alert
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Safety Alerts</CardTitle>
            <CardDescription>
              Monitor and manage safety alerts for your current trip
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <Alert
                  key={alert.id}
                  variant={alert.severity === "critical" ? "destructive" : "default"}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getAlertIcon(alert.type)}
                      <div>
                        <AlertTitle className="flex items-center gap-2">
                          {alert.title}
                          <Badge
                            variant="outline"
                            className={`${getSeverityColor(alert.severity)} text-white`}
                          >
                            {alert.severity}
                          </Badge>
                        </AlertTitle>
                        <AlertDescription>
                          <p className="mt-1">{alert.description}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {alert.timestamp.toLocaleString()}
                          </p>
                        </AlertDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {alert.status === "active" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Acknowledge
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        </>
                      )}
                      {alert.status === "acknowledged" && (
                        <Badge variant="outline" className="bg-yellow-100">
                          Acknowledged
                        </Badge>
                      )}
                      {alert.status === "resolved" && (
                        <Badge variant="outline" className="bg-green-100">
                          Resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}

              {alerts.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-2 text-sm font-semibold">All Clear</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No active alerts at the moment
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety Settings</CardTitle>
            <CardDescription>
              Configure your alert preferences and notification settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Alert Radius</AlertTitle>
                <AlertDescription>
                  You'll be notified of dangers within 5km of your location
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  Adjust Sensitivity
                </Button>
                <Button variant="outline" className="w-full">
                  Notification Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}