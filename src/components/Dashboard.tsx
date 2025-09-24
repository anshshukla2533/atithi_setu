import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import GoogleMapDashboard from './GoogleMapDashboard';
import { GoogleLiveMap } from './map/GoogleLiveMap';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle,
  XCircle,
  Navigation,
  Phone,
  MessageSquare,
  Settings
} from 'lucide-react';

interface DashboardProps {
  userRole?: 'traveler' | 'admin' | 'friend';
}

const Dashboard: React.FC<DashboardProps> = ({ userRole = 'traveler' }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const mockData = {
    activeTravelers: 24,
    activeAlerts: 3,
    safeTravelers: 21,
    friendsOnline: 8,
    recentAlerts: [
      {
        id: '1',
        type: 'deviation',
        traveler: 'John Doe',
        location: 'Times Square, NYC',
        time: '2 min ago',
        severity: 'caution'
      },
      {
        id: '2',
        type: 'risk-area',
        traveler: 'Sarah Wilson',
        location: 'Construction Zone, Brooklyn',
        time: '5 min ago',
        severity: 'danger'
      },
      {
        id: '3',
        type: 'offline',
        traveler: 'Mike Johnson',
        location: 'Last seen: JFK Airport',
        time: '15 min ago',
        severity: 'caution'
      }
    ]
  };

  const StatCard = ({ title, value, icon: Icon, variant = 'default', change }: any) => (
    <Card className="bg-gradient-to-br from-card to-card/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {change && (
              <p className={`text-sm ${change > 0 ? 'text-safe' : 'text-danger'}`}>
                {change > 0 ? '+' : ''}{change}% from last hour
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${
            variant === 'safe' ? 'bg-safe/10 text-safe' :
            variant === 'danger' ? 'bg-danger/10 text-danger' :
            variant === 'caution' ? 'bg-caution/10 text-caution' :
            'bg-primary/10 text-primary'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AlertItem = ({ alert }: any) => (
    <div className="flex items-center justify-between p-4 border-l-4 border-l-caution bg-card rounded-r-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${
          alert.severity === 'danger' ? 'bg-danger/10 text-danger' :
          'bg-caution/10 text-caution'
        }`}>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <p className="font-medium">{alert.traveler}</p>
          <p className="text-sm text-muted-foreground">{alert.location}</p>
          <p className="text-xs text-muted-foreground">{alert.time}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={alert.severity === 'danger' ? 'destructive' : 'secondary'}>
          {alert.type.replace('-', ' ').toUpperCase()}
        </Badge>
        <Button size="sm" variant="outline">
          Respond
        </Button>
      </div>
    </div>
  );

  // Geolocation state for Google Maps
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 28.6139, lng: 77.2090 }) // fallback: Delhi
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              Atithi Setu {userRole === 'admin' ? 'Command Center' : userRole === 'friend' ? 'Network' : 'Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {userRole === 'admin' 
                ? 'Monitor all travelers and respond to alerts' 
                : userRole === 'friend'
                ? 'Stay connected with your travel network'
                : 'Track your journey and stay safe'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-gradient-to-r from-primary to-info hover:from-primary/90 hover:to-info/90">
              <Phone className="w-4 h-4 mr-2" />
              Emergency
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Travelers"
            value={mockData.activeTravelers}
            icon={Users}
            variant="primary"
            change={5}
          />
          <StatCard
            title="Active Alerts"
            value={mockData.activeAlerts}
            icon={AlertTriangle}
            variant="caution"
            change={-2}
          />
          <StatCard
            title="Safe Travelers"
            value={mockData.safeTravelers}
            icon={Shield}
            variant="safe"
            change={3}
          />
          <StatCard
            title="Friends Online"
            value={mockData.friendsOnline}
            icon={Users}
            variant="primary"
            change={1}
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="map">Live Map</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Real-Time Location Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GoogleMapDashboard userLocation={userLocation} />
                  <div className="text-center text-muted-foreground mt-2 text-sm">Red circles/markers show dummy dangerous zones</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Interactive Safety Map
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Monitor all travelers, routes, and safety zones in real-time
                </p>
              </CardHeader>
              <CardContent>
                <div style={{ height: 400 }}>
                  <GoogleLiveMap
                    center={{ lat: 17.385, lng: 78.4867 }} // Hyderabad
                    zoom={7}
                    polyline={[
                      { lat: 17.385, lng: 78.4867 },
                      { lat: 17.0, lng: 79.5 },
                      { lat: 16.3067, lng: 80.4428 }
                    ]}
                    markers={[
                      { id: 'me', lat: 17.385, lng: 78.4867, name: 'You', status: 'Present Location' },
                      { id: 'guntur', lat: 16.3067, lng: 80.4428, name: 'Guntur', status: 'Destination' },
                      { id: 'friend', lat: 17.395, lng: 78.4967, name: 'Dummy Friend', status: 'Dummy Friend' }
                    ]}
                  />
                </div>
                <div className="text-center text-muted-foreground mt-2 text-sm">Red circles show dummy dangerous zones (feature coming soon)</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockData.recentAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Friend Network
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-safe/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-safe" />
                      </div>
                      <div>
                        <p className="font-medium">Sarah Wilson</p>
                        <p className="text-sm text-muted-foreground">Online • NYC</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted/10 rounded-full flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Mike Johnson</p>
                        <p className="text-sm text-muted-foreground">Offline • Last seen 15m ago</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" disabled>
                      Offline
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm border-l-2 border-l-safe pl-3 py-2">
                    <p className="font-medium">Sarah checked in safely</p>
                    <p className="text-muted-foreground">Central Park • 5 min ago</p>
                  </div>
                  <div className="text-sm border-l-2 border-l-caution pl-3 py-2">
                    <p className="font-medium">Route deviation detected</p>
                    <p className="text-muted-foreground">John Doe • 8 min ago</p>
                  </div>
                  <div className="text-sm border-l-2 border-l-primary pl-3 py-2">
                    <p className="font-medium">Emergency contact updated</p>
                    <p className="text-muted-foreground">Mike Johnson • 12 min ago</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Dashboard;