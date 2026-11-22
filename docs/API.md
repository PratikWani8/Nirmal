# Nirmal API Reference Documentation

Base URL: `http://localhost:5000/api`

All responses follow standard JSON envelopes:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Register a new user account.
- **Body**:
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "password": "password123",
    "preferredLanguage": "en",
    "location": { "city": "New Delhi", "coordinates": [77.2090, 28.6139] }
  }
  ```
- **Response**: `201 Created` with JWT token and user profile.

### `POST /api/auth/login`
Authenticate with email and password.
- **Body**:
  ```json
  {
    "email": "demo@nirmal.eco",
    "password": "password123"
  }
  ```
- **Response**: `200 OK` with JWT token.

### `GET /api/auth/me`
Retrieve authenticated user profile. (Requires `Authorization: Bearer <token>`)

### `PATCH /api/auth/profile`
Update user preferences, language, lifestyle, or location.

### `POST /api/auth/onboarding`
Save onboarding lifestyle parameters (commute, exercise, purifiers, sensitivities).

---

## 2. Air Quality (`/api/air-quality`)

### `GET /api/air-quality/current`
Get live air quality data calculated via CPCB NAQI formula and Open-Meteo.
- **Query Params**:
  * `lat` (optional): Latitude (e.g. `28.6139`)
  * `lng` (optional): Longitude (e.g. `77.2090`)
  * `city` (optional): City name to geocode (e.g. `Delhi`)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "location": { "city": "New Delhi", "coordinates": [77.2090, 28.6139] },
      "airQuality": {
        "cpcbAqi": 284,
        "category": "Poor",
        "primaryPollutant": "PM2.5",
        "pollutants": { "pm25": 115, "pm10": 210, "no2": 45, "so2": 12, "co": 1.2, "o3": 35 },
        "subIndices": { "pm25": 284, "pm10": 173, "no2": 56, ... }
      },
      "weather": {
        "temperature": 18.5,
        "humidity": 68,
        "windSpeed": 6.2,
        "inversionRisk": { "level": "High", "explanation": "..." }
      },
      "nearbyStations": [ ... ]
    }
  }
  ```

### `GET /api/air-quality/history`
Get hourly pollutant trends for the past 24-48 hours.

### `GET /api/air-quality/forecast`
Get 7-day daily forecast with estimated CPCB AQI and smog warnings.

### `GET /api/air-quality/nearby`
Get nearby continuous ambient air quality stations in vicinity.

### `GET /api/air-quality/search?q={query}`
Geocode location string to geographic coordinates via Nominatim.

---

## 3. What-If Pollution Simulator (`/api/simulator`)

### `GET /api/simulator/presets`
Retrieve preset municipal scenarios (`baseline`, `greenNeighborhood`, `publicTransportRevolution`, `zeroWasteBurning`, `lowTrafficCity`, `communityActionPlan`).

### `POST /api/simulator/run`
Execute source-apportioned rollback simulation with non-linear dispersion.
- **Body**:
  ```json
  {
    "baseline": { "aqi": 320, "pm25": 150, "pm10": 250 },
    "parameters": {
      "vehicleReduction": 35,
      "publicTransportAdoption": 40,
      "carpoolingAdoption: 30,
      "constructionDustReduction": 50,
      "wasteBurningReduction": 85,
      "greenSpaceImprovement": 60
    },
    "language": "en"
  }
  ```
- **Response**: Returns modeled emission index reduction, estimated ambient PM2.5, projected CPCB AQI, confidence bounds (±18%), and GenAI scientific explanation.

### `POST /api/simulator/save`
Save simulation scenario to MongoDB for user account.

### `POST /api/simulator/compare`
Compare up to 4 scenarios side-by-side.

### `POST /api/simulator/action-plan`
Generate structured GenAI Community Action Plan for multi-stakeholder execution (Individuals, Families, Schools, Housing Societies, Businesses, Local Authorities).

---

## 4. Escape Routes (`/api/routes`)

### `POST /api/routes/compare`
Compare direct arterial highway route with clean-air secondary corridor.
- **Body**:
  ```json
  {
    "origin": [77.2197, 28.6328],
    "destination": [77.0878, 28.4950],
    "transportMode": "car"
  }
  ```
- **Response**: Returns waypoint coordinates, distance, duration, estimated inhaled PM2.5 dose (µg), and exposure reduction percentage.

---

## 5. Indoor Air Coach (`/api/indoor`)

### `POST /api/indoor/analyze`
Analyze indoor room volume, air purifier CADR, air changes per hour (ACH), and safe ventilation windows.

---

## 6. Community & Gamification (`/api/community`)

### `GET /api/community/reports`
Retrieve community pollution incident reports with optional filtering by category and verification status.

### `POST /api/community/reports`
Submit citizen pollution hotspot (garbage burning, construction dust, industrial smoke).

### `POST /api/community/reports/:id/upvote`
Upvote a community report.

### `GET /api/community/challenges`
List clean air gamified challenges (Metro Commute, Zero Waste Watch, Active 20K).

### `POST /api/community/challenges/:id/join`
Join a clean air challenge.

### `PATCH /api/community/challenges/:id/complete`
Mark challenge completed to earn points and badge.

### `GET /api/community/leaderboard`
Retrieve community clean air leaderboard.

---

## 7. AI Assistant (`/api/ai`)

### `POST /api/ai/chat`
Conversational clean air assistant supporting English, Hindi (हिन्दी), and Marathi (मराठी).
- **Body**:
  ```json
  {
    "messages": [{ "role": "user", "content": "खिडक्या उघडू का?" }],
    "language": "mr",
    "coordinates": [77.2090, 28.6139]
  }
  ```
