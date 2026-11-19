const mongoose = require('mongoose');

const airQualityRecordSchema = new mongoose.Schema({
  location: {
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, default: 'India' },
    address: { type: String },
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    index: '2dsphere',
  },
  aqi: { type: Number, required: true }, // Indian CPCB AQI
  aqiEuropean: { type: Number },
  aqiUs: { type: Number },
  category: {
    type: String,
    enum: ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'],
    required: true,
  },
  primaryPollutant: { type: String, default: 'PM2.5' },
  pollutants: {
    pm25: { type: Number, required: true }, // ug/m3
    pm10: { type: Number }, // ug/m3
    no2: { type: Number }, // ug/m3
    so2: { type: Number }, // ug/m3
    co: { type: Number }, // mg/m3
    o3: { type: Number }, // ug/m3
  },
  cpcbSubIndices: {
    pm25: { type: Number },
    pm10: { type: Number },
    no2: { type: Number },
    so2: { type: Number },
    co: { type: Number },
    o3: { type: Number },
  },
  weather: {
    temperature: { type: Number }, // Celsius
    humidity: { type: Number }, // %
    windSpeed: { type: Number }, // km/h
    windDirection: { type: Number }, // degrees
    surfacePressure: { type: Number }, // hPa
    inversionPotential: { type: String, enum: ['Low', 'Moderate', 'High', 'Extreme'], default: 'Low' },
  },
  source: {
    type: String,
    enum: ['open-meteo', 'cpcb-station', 'interpolated', 'user-sensor'],
    default: 'open-meteo',
  },
  recordedAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('AirQualityRecord', airQualityRecordSchema);
