# Nirmal Simulation & Environmental Intelligence Methodology

## 1. CPCB National Air Quality Index (NAQI) Calculation

Nirmal implements the official methodology established by the **Central Pollution Control Board (CPCB)**, Ministry of Environment, Forest and Climate Change (MoEFCC), Government of India.

### Sub-Index Equation
For any pollutant concentration $C_p$, the sub-index $I_p$ is calculated using linear piecewise breakpoint interpolation:

$$I_p = I_{low} + \frac{I_{high} - I_{low}}{B_{high} - B_{low}} \times (C_p - B_{low})$$

Where:
- $B_{low}, B_{high}$: The lower and upper concentration breakpoints corresponding to the observed concentration bracket.
- $I_{low}, I_{high}$: The corresponding AQI sub-index boundaries.

### Breakpoint Table (CPCB Standard)
| Category | AQI Range | PM2.5 (24h) µg/m³ | PM10 (24h) µg/m³ | NO2 (24h) µg/m³ | SO2 (24h) µg/m³ | CO (8h) mg/m³ | O3 (8h) µg/m³ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Good** | 0 – 50 | 0 – 30 | 0 – 50 | 0 – 40 | 0 – 40 | 0.0 – 1.0 | 0 – 50 |
| **Satisfactory** | 51 – 100 | 31 – 60 | 51 – 100 | 41 – 80 | 41 – 80 | 1.1 – 2.0 | 51 – 100 |
| **Moderate** | 101 – 200 | 61 – 90 | 101 – 250 | 81 – 180 | 81 – 380 | 2.1 – 10.0 | 101 – 168 |
| **Poor** | 201 – 300 | 91 – 120 | 251 – 350 | 181 – 280 | 381 – 800 | 10.1 – 17.0 | 169 – 208 |
| **Very Poor** | 301 – 400 | 121 – 250 | 351 – 430 | 281 – 400 | 801 – 1600 | 17.1 – 34.0 | 209 – 748 |
| **Severe** | 401 – 500 | 250+ | 430+ | 400+ | 1600+ | 34.0+ | 748+ |

Overall NAQI is the maximum of the calculated sub-indices, provided at least one particulate matter indicator (PM2.5 or PM10) is monitored.

---

## 2. What-If Pollution Simulator Methodology

### Source Apportionment Baseline
Urban northern and central India airsheds (specifically the Indo-Gangetic Plains during winter) exhibit distinct source contributions (referenced from IIT Kanpur and SAFAR/TERI urban studies):
- **Vehicular Tailpipe & Wear**: ~28%
- **Road Dust & Construction Suspension**: ~25%
- **Open Solid Waste & Biomass Combustion**: ~17%
- **Industrial Point Sources & Brick Kilns**: ~20%
- **Domestic, DG Sets & Other Sources**: ~10%

### Why a 50% Vehicle Cut Does NOT Cut AQI by 50%
1. **Regional Background Load ($f_{bg}$)**:
   Between 30% and 40% of winter ambient PM2.5 consists of regional transboundary background (geogenic dust, regional biomass burning, secondary sulfate/nitrate particulates) that is physically independent of municipal-level actions within a single city ward.
2. **Atmospheric Inversion Physics**:
   During winter, shallow nocturnal planetary boundary layer heights (<200m) and near-zero surface wind speeds create an atmospheric lid that traps whatever pollutants remain.
3. **Non-Linear Sub-Index Breakpoints**:
   Because CPCB breakpoints are non-linear, a 40 µg/m³ drop in PM2.5 from 200 to 160 produces a different numerical shift than a 40 µg/m³ drop from 70 to 30.

### Mathematical Formulation
$$\text{Emission Reduction Ratio } R_{em} = \sum_{s \in \text{sectors}} w_s \cdot (1 - \text{red}_s)$$
$$\text{Ambient PM}_{2.5, \text{scenario}} = \text{PM}_{2.5, \text{base}} \times \left( f_{bg} + (1 - f_{bg}) \cdot R_{em} \right) \times (1 - \eta_{\text{green}})$$

Where:
- $w_s$: Sector weight in urban airshed
- $\text{red}_s$: Modeled reduction in sector $s$
- $f_{bg} = 0.35$: Assumed regional uncontrollable baseline fraction
- $\eta_{\text{green}}$: Vegetative canopy deposition capture rate (up to 9.5% for high coverage, based on Nowak et al., US Forest Service)

### Scientific Uncertainty Envelope
Because meteorological boundary layer heights fluctuate, the simulator calculates an empirical **±18% confidence envelope** representing optimistic (strong mixing winds) and pessimistic (severe thermal inversion) conditions.

---

## 3. Personal Inhaled Dose Exposure Formulation

Ambient air pollution concentration ($\mu g/m^3$) measures environmental density, whereas personal inhaled dose ($\mu g$) measures the actual particulate mass inhaled into the bronchial tract:

$$\text{Inhaled Dose } (\mu g) = C_p \times t \times \dot{V}_E$$

Where:
- $C_p$: Micro-environmental concentration ($\mu g/m^3$)
- $t$: Duration of exposure (hours)
- $\dot{V}_E$: Minute ventilation rate ($m^3/\text{hour}$):
  * **Sedentary / Resting**: $0.45\text{ m}^3/\text{h}$
  * **Light Activity / Slow Walk**: $0.75\text{ m}^3/\text{h}$
  * **Moderate Activity / Commute**: $1.80\text{ m}^3/\text{h}$
  * **Vigorous Cardio / Running**: $3.60\text{ m}^3/\text{h}$
