import { useState } from "react"
import { AdminLoginForm } from "@/components/auth/AdminLoginForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  MapPin,
  ShieldAlert,
  Users,
} from "lucide-react"
import { Map } from "@/components/map/Map"
import { GoogleLiveMap, LiveUserMarker } from "@/components/map/GoogleLiveMap"
import type { IncidentReport, AlertStatistics, AreaStatistics } from "@/types/admin"
import SocketAlerts from '@/components/SocketAlerts'
export default function AdminDashboardPage() {
// Mock data - replace with real data from your backend
const mockAlertStats: AlertStatistics = {
  total: 150,
  byType: {
    deviation: 45,
    "danger-area": 30,
    sos: 15,
    "safety-check": 60,
  },
  bySeverity: {
    low: 70,
    medium: 45,
    high: 25,
    critical: 10,
  },
  responseTime: {
    average: 8.5,
    min: 2,
    max: 30,
  },
  resolution: {
    resolved: 100,
    pending: 35,
    investigating: 15,
  },
};

const mockIncidents: IncidentReport[] = [
  {
    id: "1",
    type: "crime",
    severity: "high",
    status: "investigating",
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: "Manhattan, NY",
    },
    timestamp: new Date(),
    description: "Suspicious activity reported near tourist area",
    reportedBy: {
      id: "user1",
      name: "John Doe",
      role: "traveler",
    },
    actions: [
      {
        timestamp: new Date(),
        action: "Report received",
        by: "system",
      },
    ],
  },
];

const mockAreaStats: AreaStatistics[] = [
  {
    id: "1",
    area: {
      name: "Downtown",
      coordinates: [-74.006, 40.7128],
      radius: 2,
    },
    timeframe: "daily",
    metrics: {
      activeUsers: 250,
      incidents: 5,
      alertsGenerated: 15,
      averageResponseTime: 7.5,
      riskScore: 65,
    },
    trends: {
      incidentTrend: "decreasing",
      riskTrend: "stable",
      userTrend: "increasing",
    },
  },
];
  const [selectedArea, setSelectedArea] = useState<AreaStatistics>(mockAreaStats[0]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  if (!isAdminLoggedIn) {
    return <AdminLoginForm onSuccess={() => setIsAdminLoggedIn(true)} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SocketAlerts />
      <div className="grid gap-6">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAlertStats.total}</div>
              <div className="flex items-center space-x-2">
                <Badge variant="destructive">
                  {mockAlertStats.bySeverity.critical} Critical
                </Badge>
                <Badge variant="outline">
                  {mockAlertStats.resolution.pending} Pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Travelers
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <p className="text-xs text-muted-foreground">
                In monitored areas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAlertStats.responseTime.average}m
              </div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Risk Level
              </CardTitle>
              <Activity className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Medium</div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-yellow-100">
                  Elevated
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Map View */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Area Overview</CardTitle>
              <CardDescription>
                Real-time monitoring of active travelers and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleLiveMap
                center={{ lat: 40.7128, lng: -74.006 }}
                zoom={12}
                markers={[
                  { id: '1', lat: 40.7128, lng: -74.006, name: 'John Doe', status: 'deviating' },
                  { id: '2', lat: 40.7138, lng: -74.002, name: 'Jane Smith', status: 'danger-area' },
                  { id: '3', lat: 40.715, lng: -74.01, name: 'Alice', status: 'safe' }
                ]}
              />
            </CardContent>
          </Card>

          {/* Area Statistics */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Area Statistics</CardTitle>
              <CardDescription>
                Metrics and trends for {selectedArea.area.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Risk Score</p>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-2xl font-bold">
                        {selectedArea.metrics.riskScore}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Active Users</p>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span className="text-2xl font-bold">
                        {selectedArea.metrics.activeUsers}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Today's Activity</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Card>
                      <CardHeader className="p-2">
                        <CardDescription>Incidents</CardDescription>
                      </CardHeader>
                      <CardContent className="p-2 pt-0">
                        <p className="text-xl font-bold">{selectedArea.metrics.incidents}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-2">
                        <CardDescription>Alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="p-2 pt-0">
                        <p className="text-xl font-bold">{selectedArea.metrics.alertsGenerated}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-2">
                        <CardDescription>Response</CardDescription>
                      </CardHeader>
                      <CardContent className="p-2 pt-0">
                        <p className="text-xl font-bold">{selectedArea.metrics.averageResponseTime}m</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Incidents & Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>
              Latest reported incidents and alerts requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <ShieldAlert className="h-4 w-4 text-red-500" />
                          <span className="font-medium">{incident.type}</span>
                          <Badge variant={
                            incident.severity === 'critical' ? 'destructive' :
                            incident.severity === 'high' ? 'default' :
                            'secondary'
                          }>
                            {incident.severity}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{incident.location.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{incident.timestamp.toLocaleTimeString()}</span>
                          <span className="text-sm text-muted-foreground">
                            by {incident.reportedBy.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Investigate
                          </Button>
                          <Button variant="outline" size="sm">
                            Resolve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
