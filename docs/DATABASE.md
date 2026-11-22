# Nirmal Database Architecture & Schemas

The application uses **MongoDB** with **Mongoose ODM**. It supports standalone production databases (e.g. MongoDB Atlas) as well as an automatic embedded `mongodb-memory-server` fallback for zero-configuration local runs.

---

## Collections & Schemas

### 1. `users`
Stores user profile, authentication credentials, preferred language, and lifestyle attributes.
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, bcrypt hashed)
- `preferredLanguage` (Enum: `en`, `hi`, `mr`)
- `location` (Object: `{ city, state, country, coordinates: [lng, lat] }`)
- `lifestyle`:
  * `wakeupTime` (String)
  * `workSchedule` (String)
  * `commuteMode` (Enum: `metro_train`, `bus`, `two_wheeler`, `car_single`, `carpool`, `cycling`, `walking`, `remote`)
  * `outdoorExercise` (Enum: `none`, `morning_walk`, `morning_run`, `evening_sports`, `gym_indoor`)
  * `householdSize` (Number)
  * `indoorVentilation` (Enum: `intermittent`, `natural_open`, `closed_ac`, `cross_ventilation`)
  * `hasAirPurifier` (Boolean)
  * `cookingFuel` (Enum: `lpg`, `piped_gas`, `electric_induction`, `biomass_wood`)
  * `sensitivities` (Array of Strings: `asthma`, `elderly`, `children`, `cardiac`, etc.)
- `points` (Number, default 120)
- `badges` (Array of Strings)
- `onboardingCompleted` (Boolean)

---

### 2. `airqualityrecords`
Stores historical and cached environmental readings from Open-Meteo & CPCB calculations.
- `location` (`{ city, state, country, address }`)
- `coordinates` (`[longitude, latitude]`, 2dsphere index)
- `aqi` (Number, CPCB NAQI formula)
- `aqiEuropean` (Number)
- `aqiUs` (Number)
- `category` (Enum: `Good`, `Satisfactory`, `Moderate`, `Poor`, `Very Poor`, `Severe`)
- `primaryPollutant` (String, e.g. `PM2.5`)
- `pollutants` (`{ pm25, pm10, no2, so2, co, o3 }`)
- `cpcbSubIndices` (`{ pm25, pm10, no2, so2, co, o3 }`)
- `weather` (`{ temperature, humidity, windSpeed, windDirection, inversionPotential }`)
- `source` (Enum: `open-meteo`, `cpcb-station`, `interpolated`)
- `recordedAt` (Date, indexed)

---

### 3. `simulations`
Stores saved What-If pollution reduction scenarios.
- `userId` (ObjectId ref to User)
- `scenarioName` (String)
- `isPreset` (Boolean)
- `baseline` (`{ aqi, pm25, pm10, sectorEmissionsPercent }`)
- `scenarioParameters`:
  * `vehicleReduction` (Number: 0-100)
  * `publicTransportAdoption` (Number: 0-100)
  * `carpoolingAdoption` (Number: 0-100)
  * `constructionDustReduction` (Number: 0-100)
  * `wasteBurningReduction` (Number: 0-100)
  * `greenSpaceImprovement` (Number: 0-100)
- `estimatedResults`:
  * `baselineEmissionsIndex` (Number)
  * `scenarioEmissionsIndex` (Number)
  * `emissionReductionPercent` (Number)
  * `estimatedPm25ReductionPercent` (Number)
  * `estimatedScenarioPm25` (Number)
  * `estimatedScenarioAqi` (Number)
  * `uncertaintyRange` (`{ minPm25, maxPm25, confidenceScore }`)
  * `sectorReductions` (Object)
- `assumptions` (Array of Strings)
- `aiExplanation` (Object)
- `aiActionPlan` (Object)

---

### 4. `communityreports`
Stores citizen pollution reports.
- `userId` (ObjectId ref to User)
- `userName` (String)
- `category` (Enum: `garbage_burning`, `construction_dust`, `industrial_smoke`, `heavy_traffic`, `other`)
- `description` (String)
- `location` (`{ address, city, coordinates: [lng, lat] }`)
- `verificationStatus` (Enum: `unverified`, `investigating`, `verified`, `resolved`)
- `verifiedBy` (String)
- `upvotes` (Number)
- `upvotedBy` (Array of ObjectIds)

---

### 5. `userimpacts`
Tracks personal environmental metrics.
- `userId` (ObjectId ref to User)
- `date` (Date)
- `transportEmissionAvoidedKgCO2` (Number) — Climate impact
- `particulateAvoidedGramsPM25` (Number) — Local toxic air impact
- `sustainableTripsCount` (Number)
- `distanceKm` (Number)
- `commuteModeUsed` (String)

---

### 6. `challenges`
Clean air gamification challenges.
- `title` (String)
- `description` (String)
- `points` (Number)
- `badge` (String)
- `targetValue` (Number)
- `targetUnit` (String)
- `participants` (`[{ userId, currentProgress, completed, joinedAt }]`)

---

### 7. `notifications`
Smog alerts and system updates.
- `userId` (ObjectId ref to User)
- `type` (Enum: `smog_warning`, `poor_aqi`, `routine_reminder`, `community_report`, `system`)
- `title` (String)
- `message` (String)
- `severity` (Enum: `info`, `warning`, `critical`)
- `read` (Boolean)
