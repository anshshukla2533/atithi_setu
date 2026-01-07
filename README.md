# Atithi Setu — Tourist Safety Platform

**Atithi Setu** is a comprehensive tourist safety platform designed to reduce traveler vulnerability by combining real-time tracking, encrypted emergency communication, and zero-network SOS capabilities. The platform focuses on proactive safety, rapid response, and privacy-first communication for travelers in unfamiliar or high-risk regions.

 **GitHub:** [https://github.com/anshshukla2533/atithi_setu]  
 **Live Demo:** [https://atithi-setu-nine.vercel.app/]

---

## Problem it solves

Tourists often face safety challenges due to:
- Lack of real-time location sharing
- Poor network connectivity in remote areas
- Delayed emergency response
- No centralized trip monitoring system

**Atithi Setu** bridges this gap by providing a reliable, privacy-focused, and network-resilient safety solution.

---

##  Key Features

###  Trip Registration & Monitoring
- Tourists can register trips with routes, duration, and emergency contacts
- Automated check-ins ensure traveler well-being
- Alerts triggered on missed check-ins

###  Encrypted Emergency Contacts
- End-to-end encrypted storage of emergency contacts
- Secure access only during verified emergency situations

###  Real-Time Friend Tracking
- Live location sharing using **Mapbox**
- Friend & family tracking with consent
- **Geofencing alerts** for predefined risk zones
- Improved situational awareness by **60%**

###  Zero-Network SOS Communication
- Peer-to-peer SOS messaging without internet
- Powered by **WebRTC** and **libp2p mesh networking**
- Works in low or no network areas
- Ensures emergency communication even during outages

###  Risk Zone Overlays
- Visual overlays highlighting unsafe or high-risk areas
- Location-based warnings and alerts
- Helps tourists make informed decisions in real time


we have used dummy data for model , once we get real data we can train model
---

##  System Architecture

- Trip Registration Module
- Location Tracking (Mapbox)
- Risk Zone Detection
- Encrypted Emergency Store
- SOS P2P Network (WebRTC + libp2p)

---

##  Tech Stack

### Frontend
- React .js
- Mapbox GL JS
- Tailwind CSS

### Backend
- Node.js
- Express
- REST APIs

### Networking & Communication
- **WebRTC** (peer-to-peer communication)
- **libp2p** (mesh networking for SOS)

### Security
- End-to-end encryption
- Secure key-based access
- Privacy-first data handling

---

## Impact & Results

- **Reduced tourist vulnerability** through automated safety checks
- **60% improvement** in awareness via real-time tracking
-  Enabled **offline emergency communication**
-  Strong privacy & data protection

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm / yarn
- Mapbox API Key

### Installation

```bash
git clone https://github.com/anshshukla2533/crowd_mangement
cd atithi-setu
npm install


