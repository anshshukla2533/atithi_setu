import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu"
import { UserCircle, Map, Bell, Shield, Users, PlaneLanding } from "lucide-react"
import React from "react"

export function Navbar() {
  const [mobileMode, setMobileMode] = React.useState(false);
  // You can use mobileMode to conditionally render mobile-specific UI elsewhere
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
          SafeTour
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 items-center ml-6">
          <NavigationMenu>
            <NavigationMenuList>
              {/* ...existing code for NavigationMenuItems... */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Travel Planning</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[300px] md:w-[400px]">
                    <Link to="/register" className="flex items-center space-x-2 hover:bg-accent rounded-md p-2">
                      <UserCircle className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Register</div>
                        <div className="text-sm text-muted-foreground">Secure registration with Aadhaar/Passport</div>
                      </div>
                    </Link>
                    <Link to="/trip-planner" className="flex items-center space-x-2 hover:bg-accent rounded-md p-2">
                      <PlaneLanding className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Trip Planning</div>
                        <div className="text-sm text-muted-foreground">Create and manage your travel itinerary</div>
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Safety</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[300px] md:w-[400px]">
                    <Link to="/live-tracking" className="flex items-center space-x-2 hover:bg-accent rounded-md p-2">
                      <Map className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Live Tracking</div>
                        <div className="text-sm text-muted-foreground">Real-time location monitoring</div>
                      </div>
                    </Link>
                    <Link to="/alerts" className="flex items-center space-x-2 hover:bg-accent rounded-md p-2">
                      <Bell className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Alerts</div>
                        <div className="text-sm text-muted-foreground">Deviation & danger-area notifications</div>
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Network</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[300px] md:w-[400px]">
                    <Link to="/friend-network" className="flex items-center space-x-2 hover:bg-accent rounded-md p-2">
                      <Users className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Friend Circle</div>
                        <div className="text-sm text-muted-foreground">Offline mesh networking for messaging</div>
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          <Link to="/register">
            <Button variant="default" size="sm">Get Started</Button>
          </Link>
          <Link to="/admin">
            <Button variant="outline" size="sm">Admin Login</Button>
          </Link>
          <Button variant="ghost" size="icon">
            <ModeToggle />
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <MobileMenu />
        </div>
      </div>
    </header>

  )
}

// MobileMenu component
function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} aria-label="Open menu">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </Button>
      {open && (
        <div className="absolute top-14 left-0 w-full bg-background shadow-lg z-50 flex flex-col px-4 py-6 space-y-4 md:hidden animate-slide-down">
          <Link to="/register" className="w-full">
            <Button variant="default" size="lg" className="w-full mb-2">Get Started</Button>
          </Link>
          <Link to="/admin" className="w-full">
            <Button variant="outline" size="lg" className="w-full mb-2">Admin Login</Button>
          </Link>
          <Link to="/live-tracking" className="w-full">
            <Button variant="ghost" size="lg" className="w-full mb-2">Live Tracking</Button>
          </Link>
          <Link to="/alerts" className="w-full">
            <Button variant="ghost" size="lg" className="w-full mb-2">Alerts</Button>
          </Link>
          <Link to="/friend-network" className="w-full">
            <Button variant="ghost" size="lg" className="w-full mb-2">Friend Network</Button>
          </Link>
          <Button variant="ghost" size="icon" className="self-end" onClick={() => setOpen(false)} aria-label="Close menu">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </Button>
        </div>
      )}
    </>
  );
}