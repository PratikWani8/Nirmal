# Nirmal - Urban Air Quality Assistant
### Complete AI-Powered Environmental Intelligence Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-forest.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![CPCB NAQI Compliant](https://img.shields.io/badge/AQI%20Standard-CPCB%20NAQI-green.svg)](https://cpcb.nic.in/)

**Nirmal** is a production-grade, GenAI-powered environmental decision-support platform designed to help citizens, families, and municipalities monitor, predict, understand, and reduce their exposure to severe urban air pollution and winter smog.

Inspired by the clean, minimal, data-driven aesthetic of the **AeuxGlobal SaaS** product design, Nirmal bridges atmospheric physics and daily habit transformation turning raw environmental measurements into actionable clean air decisions.

---

## 🌿 Key Platform Capabilities

1. **Official CPCB National Air Quality Index (NAQI)**:
   - Full mathematical implementation of official Indian CPCB sub-index equations across all 6 criteria pollutants (PM2.5, PM10, NO2, SO2, CO, O3).
   - Real-time concentration retrieval via **Open-Meteo Air Quality API** with transparent sub-index breakdown and health statements.

2. **What-If Pollution Simulator (Signature Feature)**:
   - Interactive policy and community intervention modeling workspace.
   - 6 parameter sliders: Private Vehicle Reduction, Public Transport Adoption, Carpooling Shift, Construction Dust Suppression, Open Waste Burning Elimination, and Urban Green Canopy Sinks.
   - Scientifically grounded source-apportionment model (Transport 28%, Dust 25%, Waste 17%, Industry 20%, Domestic 10%) combined with an atmospheric roll-back dispersion approximation and empirical ±18% uncertainty bounds.
   - Preset scenarios (`Green Neighborhood`, `Public Transport Revolution`, `Zero Waste Burning`, `Low-Traffic City`, `Community Action Plan`).
   - Side-by-side scenario comparison matrix (up to 4 scenarios) and PDF report export.
   - GenAI Scenario Explainer and structured **Community Action Plan Generator** (actionable responsibilities for Individuals, Families, Schools, Housing Societies, Businesses, and Local Authorities).

3. **Multilingual GenAI Assistant (English, हिन्दी, मराठी)**:
   - Context-aware conversational assistant synchronized with real-time local air quality, diurnal boundary layer height, and user lifestyle.
   - Native support for English, Hindi, and Marathi.
   - Rule-based deterministic environmental intelligence fallback ensuring zero downtime even without external LLM API keys.

4. **Pollution Escape Routes (Clean Commute Navigator)**:
   - Evaluates alternative commute routes using **OSRM (Open Source Routing Machine)**.
   - Compares fastest arterial highway routes against lower-exposure green buffer corridors.
   - Quantifies personal inhaled PM2.5 dose ($\mu g$) based on minute ventilation rates ($m^3/\text{hr}$).

5. **AI Personalized Daily Clean Air Routine**:
   - 4-phase day scheduling (Morning, Afternoon, Evening, Night).
   - Actionable exposure-minimizing advice synchronized with nocturnal inversion layers, peak traffic hours, and solar ventilation windows.

6. **Smart Indoor Air Coach**:
   - Calculates room volume, air purifier clean air delivery rate (CADR), and air changes per hour (ACH).
   - Determines the safest 15-20 minute midday window for room cross-ventilation.
   - Provides honest, peer-reviewed advice (debunking houseplant myths while emphasizing HEPA filtration and kitchen exhaust).

7. **Smog Forecasting & Early Warning System**:
   - 7-day CPCB air quality forecast and 48-hour high-resolution diurnal trajectory.
   - Thermal inversion risk indicator tracking temperature drops and surface wind stagnation (<6 km/h).

8. **Citizen Clean Air Community & Gamified Challenges**:
   - Hotspot incident reporting (garbage burning, construction dust, industrial smoke) with geo-coordinates, photos, and verification workflows.
   - Gamified challenges (Metro Commute Week, Zero Waste Watch, Active Mobility 20K) with eco-points, badges, and community leaderboard.

9. **Transparent Impact Analytics**:
   - Rigorously distinguishes avoided greenhouse gases (kg CO2e) from local toxic particulate elimination (grams PM2.5).

---

## 🎨 Visual Design Architecture (AeuxGlobal Inspired)

Nirmal adopts a sophisticated, serene environmental SaaS palette:
- **Deep Forest Green**: `#163D32` (Primary brand accent)
- **Dark Green**: `#214F40` (Interactive elements & navigation)
- **Fresh Green**: `#79A88C` (Progress indicators & highlights)
- **Soft Mint**: `#DDECE3` (Delicate borders & background accents)
- **Warm Off-White**: `#F7F8F3` (Light theme surface canvas)
- **Charcoal Surface**: `#252D2A` & `#1D2421` (Crisp readable typography & dark theme cards)

### Accessible CPCB Status Colors:
- **Good (0–50)**: `#10B981` (Emerald)
- **Satisfactory (51–100)**: `#84CC16` (Lime)
- **Moderate (101–200)**: `#F59E0B` (Amber)
- **Poor (201–300)**: `#F97316` (Orange)
- **Very Poor (301–400)**: `#EF4444` (Red)
- **Severe (401–500)**: `#7F1D1D` (Maroon)

---

## 🛠️ Technology Stack

### Frontend
- **React.js (v18)** & **Vite (v6)**
- **Tailwind CSS (v3)** with custom AeuxGlobal tokens
- **Leaflet & React-Leaflet** for geospatial monitoring and route mapping
- **Recharts** for diurnal area charts and sector bar visualizations
- **Framer Motion** for smooth page and card transitions
- **Lucide React** for minimal, modern UI iconography
- **Axios** with Bearer token interceptors
- **React Router (v6)** supporting all 16 complete views

### Backend
- **Node.js** & **Express.js** REST API
- **Socket.IO** for real-time smog warnings and community incident broadcasts
- **JWT (JSON Web Tokens)** & **bcryptjs** password hashing
- **Express Rate Limiting** & Centralized Error Handling

### Database
- **MongoDB** & **Mongoose**
- Supports external **MongoDB Atlas** / local instances, and includes an automatic **in-memory MongoDB fallback** for zero-setup execution!

### External Real-Time APIs
1. **Open-Meteo Air Quality API**: Live PM2.5, PM10, NO2, SO2, CO, O3, European AQI, US AQI, 7-day forecast.
2. **Open-Meteo Weather API**: Temperature, relative humidity, wind speed, wind direction, surface pressure.
3. **OpenStreetMap / Nominatim Geocoding**: Search resolution and coordinate reverse-geocoding.
4. **OSRM (Open Source Routing Machine)**: Real-time road geometry and routing calculation.
5. **Gemini / Groq LLM API**: Context-aware recommendations and action plans (with full local deterministic fallback).

---

## 📂 Project Directory Structure

```
Nirmal/
│
├── client/                     # Frontend React + Vite Application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # AqiBadge, Button, Card, LanguagePicker
│   │   │   ├── dashboard/      # AqiGauge, PollutantCard, WeatherCard, HourlyTrendChart
│   │   │   ├── layout/         # AppLayout, Sidebar, TopNav
│   │   │   ├── maps/           # AirMap (Leaflet Map)
│   │   │   └── simulator/      # SimulatorWorkspace (Signature Feature)
│   │   ├── context/            # AuthContext, AqiContext, LanguageContext, ThemeContext
│   │   ├── pages/              # 16 Complete Application Pages
│   │   ├── services/           # Axios REST API definitions
│   │   ├── styles/             # Tailwind directives & CSS custom scrollbars
│   │   ├── utils/              # Translations (en, hi, mr) & CPCB formatters
│   │   ├── App.jsx             # React Router routing table
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend Node.js + Express API
│   ├── config/                 # Database connection & environment configuration
│   ├── controllers/            # Auth, AQI, Simulator, Routes, Community, AI controllers
│   ├── middleware/             # Auth JWT guard & Centralized Error Handler
│   ├── models/                 # Mongoose models (User, AirQualityRecord, Simulation, etc.)
│   ├── routes/                 # REST API endpoints
│   ├── services/
│   │   ├── airQuality/         # Open-Meteo service, CPCB NAQI algorithm, Geocoding
│   │   ├── weather/            # Open-Meteo weather & thermal inversion risk index
│   │   ├── simulator/          # Sector source apportionment rollback engine
│   │   ├── routing/            # OSRM route comparison & exposure calculator
│   │   ├── analytics/          # Inhaled dose & avoided emissions calculator
│   │   └── ai/                 # Gemini/Groq LLM & Local Environmental Engine
│   ├── tests/                  # Unit tests (CPCB sub-indices, simulator, exposure)
│   ├── app.js                  # Express app setup
│   ├── server.js               # HTTP + Socket.IO server entry
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── API.md                  # Comprehensive REST endpoint documentation
│   ├── DATABASE.md             # Mongoose schemas & collection specifications
│   └── SIMULATION_METHODOLOGY.md # Mathematical & scientific derivations
│
├── package.json                # Root package with workspace scripts
└── README.md
```

---

## ⚡ Quick Start & Running Locally

### Prerequisites
- **Node.js**: v18 or higher (`node -v`)
- **NPM**: v9 or higher (`npm -v`)

### 1. Install Dependencies
From the project root:
```bash
npm run install:all
```
*(Or navigate to `/server` and `/client` and run `npm install` in each)*

### 2. Run Backend Server
```bash
npm run server
```
*The server will start on `http://localhost:5000` (auto-connecting to local MongoDB or starting MongoMemoryServer seamlessly).*

### 3. Run Frontend Development Server
In a separate terminal:
```bash
npm run client
```
*The client will start on `http://localhost:5173`.*

### 4. Run Backend Unit Tests
To verify the scientific accuracy of CPCB sub-index math, simulator rollback, and inhaled dose calculations:
```bash
npm test
```

---