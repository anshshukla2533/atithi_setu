import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Dashboard from '@/components/Dashboard';
import SafeTourMap from '@/components/SafeTourMap';
import GoogleMapDanger from '@/components/GoogleMapDanger';
import { 
  Shield, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Navigation, 
  Phone, 
  Clock,
  CheckCircle,
  Globe,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

type UserRole = 'traveler' | 'admin' | 'friend' | null;

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const { user } = useAuth();

  // Get emergency contact number (first one if exists)
  const emergencyNumber = user?.emergencyContacts?.[0]?.phoneNumber || '112'; // 112 is India police emergency

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    setCurrentView('dashboard');
  };

  if (currentView === 'dashboard' && userRole) {
    return <Dashboard userRole={userRole} />;
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30" style={{ fontSize: '1rem' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-info/5 to-safe/5" />
        <div className="container mx-auto px-6 pt-20 pb-16 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-info/10 rounded-full">
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-info to-safe bg-clip-text text-transparent">
              SafeTour
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Real-time safety monitoring and location tracking for travelers, 
              with comprehensive dashboards for friends and authorities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="xl"
                variant="hero"
                onClick={() => handleRoleSelect('traveler')}
              >
                <MapPin className="w-5 h-5 mr-2" />
                Start as Traveler
              </Button>
              <Button 
                size="xl"
                variant="outline"
                onClick={() => handleRoleSelect('admin')}
              >
                <Shield className="w-5 h-5 mr-2" />
                Admin Dashboard
              </Button>
              <Button 
                size="xl"
                variant="outline"
                onClick={() => handleRoleSelect('friend')}
              >
                <Users className="w-5 h-5 mr-2" />
                Friend Network
              </Button>
            </div>
          </div>

          {/* Google Map with Danger Zones */}
          <div className="max-w-5xl mx-auto my-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Live Area Map (Demo)</h2>
            <GoogleMapDanger />
            <div className="text-center text-muted-foreground mt-2 text-sm">Red circles show dummy dangerous zones</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-muted/20 to-background">
        <div className="container mx-auto px-4" style={{ maxWidth: '90rem' }}>
          <div className="text-center mb-12" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
              Complete Safety Ecosystem
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--muted-foreground)', maxWidth: '40em', margin: '0 auto' }}>
              Monitor, track, and respond to travel situations with real-time maps, alerts, and peer-to-peer networking
            </p>
          </div>

          <div
            className="grid mb-16"
            style={{
              gridTemplateColumns: '1fr',
              gap: '2rem',
              marginBottom: '4rem',
            }}
          >
            {/* Responsive grid for cards */}
            {/* Use media queries for breakpoints */}
            <style>{`
              @media (min-width: 40em) {
                .responsive-grid {
                  grid-template-columns: repeat(2, 1fr);
                }
              }
              @media (min-width: 64em) {
                .responsive-grid {
                  grid-template-columns: repeat(3, 1fr);
                }
              }
            `}</style>
            <div className="responsive-grid grid" style={{ gap: '2rem' }}>
              {/* Real-Time Tracking: Go to /live-tracking */}
              <a href="/live-tracking" style={{ textDecoration: 'none' }}>
                <Card className="cursor-pointer bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ fontSize: '1em', padding: '1.5em' }}>
                  <CardHeader style={{ paddingBottom: '1em' }}>
                    <div style={{ padding: '1em', background: 'var(--primary-10)', borderRadius: '50%', width: 'fit-content', margin: '0 auto' }}>
                      <Navigation style={{ width: '2em', height: '2em', color: 'var(--primary)' }} />
                    </div>
                    <CardTitle style={{ fontSize: '1.25em', fontWeight: 600, marginTop: '0.5em' }}>Real-Time Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1em' }}>
                      Live location updates with route comparison between planned vs actual paths. Instant alerts for deviations from safe routes.
                    </p>
                  </CardContent>
                </Card>
              </a>
              {/* Smart Alerts: Go to /alerts */}
              <a href="/alerts" style={{ textDecoration: 'none' }}>
                <Card className="cursor-pointer bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ fontSize: '1em', padding: '1.5em' }}>
                  <CardHeader style={{ paddingBottom: '1em' }}>
                    <div style={{ padding: '1em', background: 'var(--danger-10)', borderRadius: '50%', width: 'fit-content', margin: '0 auto' }}>
                      <AlertTriangle style={{ width: '2em', height: '2em', color: 'var(--danger)' }} />
                    </div>
                    <CardTitle style={{ fontSize: '1.25em', fontWeight: 600, marginTop: '0.5em' }}>Smart Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1em' }}>
                      Color-coded risk zones with automated alerts for high-risk areas. Instant notifications to friends and authorities when needed.
                    </p>
                  </CardContent>
                </Card>
              </a>
              {/* Friend Network: Go to /friend-network */}
              <a href="/friend-network" style={{ textDecoration: 'none' }}>
                <Card className="cursor-pointer bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ fontSize: '1em', padding: '1.5em' }}>
                  <CardHeader style={{ paddingBottom: '1em' }}>
                    <div style={{ padding: '1em', background: 'var(--safe-10)', borderRadius: '50%', width: 'fit-content', margin: '0 auto' }}>
                      <Users style={{ width: '2em', height: '2em', color: 'var(--safe)' }} />
                    </div>
                    <CardTitle style={{ fontSize: '1.25em', fontWeight: 600, marginTop: '0.5em' }}>Friend Network</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1em' }}>
                      Mesh network for peer-to-peer location sharing. Stay connected with your travel circle both online and offline.
                    </p>
                  </CardContent>
                </Card>
              </a>
              {/* Offline Support: Go to /friend-network (mesh network) */}
              <a href="/friend-network" style={{ textDecoration: 'none' }}>
                <Card className="cursor-pointer bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ fontSize: '1em', padding: '1.5em' }}>
                  <CardHeader style={{ paddingBottom: '1em' }}>
                    <div style={{ padding: '1em', background: 'var(--info-10)', borderRadius: '50%', width: 'fit-content', margin: '0 auto' }}>
                      <Globe style={{ width: '2em', height: '2em', color: 'var(--info)' }} />
                    </div>
                    <CardTitle style={{ fontSize: '1.25em', fontWeight: 600, marginTop: '0.5em' }}>Offline Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1em' }}>
                      Cached map tiles and queued updates ensure functionality even without internet connection. Critical for remote areas.
                    </p>
                  </CardContent>
                </Card>
              </a>
              {/* Admin Dashboard: Go to /admin */}
              <a href="/admin" style={{ textDecoration: 'none' }}>
                <Card className="cursor-pointer bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{ fontSize: '1em', padding: '1.5em' }}>
                  <CardHeader style={{ paddingBottom: '1em' }}>
                    <div style={{ padding: '1em', background: 'var(--caution-10)', borderRadius: '50%', width: 'fit-content', margin: '0 auto' }}>
                      <Shield style={{ width: '2em', height: '2em', color: 'var(--caution)' }} />
                    </div>
                    <CardTitle style={{ fontSize: '1.25em', fontWeight: 600, marginTop: '0.5em' }}>Admin Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1em' }}>
                      Comprehensive monitoring for authorities with all active travelers, unacknowledged alerts, and response coordination.
                    </p>
                  </CardContent>
                </Card>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-info/5 to-safe/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Travel Safer?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the SafeTour network and experience peace of mind with real-time 
            safety monitoring and instant emergency response.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="xl"
              variant="hero"
              onClick={() => handleRoleSelect('traveler')}
            >
              <MapPin className="w-5 h-5 mr-2" />
              Get Started Now
            </Button>
            <a 
              href={`tel:${emergencyNumber}`}
              style={{ textDecoration: 'none' }}
            >
              <Button 
                size="xl"
                variant="emergency"
                className="w-full"
              >
                <Phone className="w-5 h-5 mr-2" />
                Emergency Hotline
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/20 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">SafeTour</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Real-time Safety Monitoring</span>
              <span>•</span>
              <span>End-to-End Encrypted</span>
              <span>•</span>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;