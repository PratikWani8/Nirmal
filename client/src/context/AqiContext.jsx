import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { aqiAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AqiContext = createContext(null);

export const AqiProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState({
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    coordinates: [77.2090, 28.6139],
  });

  const [aqiData, setAqiData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync with user's saved location when user logs in
  useEffect(() => {
    if (user?.location?.coordinates?.length === 2) {
      setCurrentLocation(user.location);
    }
  }, [user]);

  const fetchAqiData = useCallback(async (locationToFetch) => {
    setLoading(true);
    setError(null);
    try {
      const loc = locationToFetch || currentLocation;
      const [lng, lat] = loc.coordinates || [77.2090, 28.6139];
      const res = await aqiAPI.getCurrent({ lat, lng, city: loc.city });

      if (res.data?.success) {
        const { location, airQuality, weather, nearbyStations: stations } = res.data.data;
        setAqiData(airQuality);
        setWeatherData(weather);
        setNearbyStations(stations || []);
        if (location?.city) {
          setCurrentLocation(prev => ({
            ...prev,
            city: location.city,
            state: location.state || prev.state,
            country: location.country || prev.country,
            coordinates: location.coordinates,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch real-time air quality:', err.message);
      setError('Unable to load live air-quality data. Showing cached readings if available.');
    } finally {
      setLoading(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchAqiData(currentLocation);
  }, [currentLocation.city, currentLocation.coordinates?.[0], currentLocation.coordinates?.[1]]);

  const changeLocation = async (queryOrCoords) => {
    if (typeof queryOrCoords === 'string') {
      try {
        const searchRes = await aqiAPI.searchLocation(queryOrCoords);
        if (searchRes.data?.data?.[0]) {
          const top = searchRes.data.data[0];
          const newLoc = {
            city: top.city,
            state: top.state,
            country: top.country,
            coordinates: [top.lng, top.lat],
          };
          setCurrentLocation(newLoc);
          return newLoc;
        }
      } catch (err) {
        console.warn('Geocoding search failed:', err.message);
      }
    } else if (Array.isArray(queryOrCoords) && queryOrCoords.length === 2) {
      const [lng, lat] = queryOrCoords;
      const newLoc = {
        city: 'Selected Point',
        coordinates: [lng, lat],
      };
      setCurrentLocation(newLoc);
      return newLoc;
    }
  };

  const refreshData = () => {
    fetchAqiData(currentLocation);
  };

  return (
    <AqiContext.Provider value={{
      currentLocation,
      aqiData,
      weatherData,
      nearbyStations,
      loading,
      error,
      changeLocation,
      refreshData,
    }}>
      {children}
    </AqiContext.Provider>
  );
};

export const useAqi = () => useContext(AqiContext);
