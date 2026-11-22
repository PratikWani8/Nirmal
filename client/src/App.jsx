import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { AqiProvider } from './context/AqiContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import PlannerPage from './pages/PlannerPage';
import ForecastPage from './pages/ForecastPage';
import IndoorCoachPage from './pages/IndoorCoachPage';
import RoutesPage from './pages/RoutesPage';
import SimulatorPage from './pages/SimulatorPage';
import CommunityPage from './pages/CommunityPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AssistantPage from './pages/AssistantPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AqiProvider>
            <BrowserRouter>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />

                {/* Dashboard & Workspace Shell - Opens Directly */}
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/planner" element={<PlannerPage />} />
                  <Route path="/forecast" element={<ForecastPage />} />
                  <Route path="/indoor" element={<IndoorCoachPage />} />
                  <Route path="/routes" element={<RoutesPage />} />
                  <Route path="/simulator" element={<SimulatorPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/assistant" element={<AssistantPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </AqiProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
