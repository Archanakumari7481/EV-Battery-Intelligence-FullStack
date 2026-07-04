import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Login from './Login';
import Dashboard from './pages/Dashboard';
import BatteryHealth from './pages/BatteryHealth';
import ChargeHistory from './pages/ChargeHistory';
import RangePredictor from './pages/RangePredictor';
import FleetMap from './pages/FleetMap';
import Maintenance from './pages/Maintenance';
import Settings from './pages/Settings';

import { api, clearToken, getStoredToken } from './lib/api';
import { connectSocket, disconnectSocket } from './lib/socket';
import { mapVehicle, mapAlert, mapRecommendation, mapSettings } from './lib/transform';

const playThermalWarningSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    // Three descending beeps — subtle warning tone
    [0, 0.3, 0.6].forEach((delay, i) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880 - i * 110, audioCtx.currentTime + delay);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + delay + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + delay + 0.25);

      oscillator.start(audioCtx.currentTime + delay);
      oscillator.stop(audioCtx.currentTime + delay + 0.3);
    });
  } catch (err) {
    console.log('Audio not available:', err);
  }
};

function DashboardApp({ onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Alert Thresholds and Config Preferences state
  const [settings, setSettings] = useState({
    thermalTriggerTemp: 49.0,
    criticalSohThreshold: 35.0,
    alertRefreshInterval: 8,
    emailAlerts: true,
    soundAlerts: false,
    autoIsolate: false,
  });

  // Warning Popup and Toast States
  const [showWarning, setShowWarning] = useState(false);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [detectionTime, setDetectionTime] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  // ---- 1. Load initial data from the backend on mount ----
  const loadInitialData = useCallback(async () => {
    setLoadingData(true);
    setLoadError('');
    try {
      const [vehiclesRes, alertsRes, settingsRes, recommendationsRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/alerts?limit=7'),
        api.get('/settings'),
        api.get('/maintenance/recommendations'),
      ]);

      setVehicles(vehiclesRes.map(mapVehicle));
      setAlerts(alertsRes.map(mapAlert));
      setSettings(mapSettings(settingsRes));
      setRecommendations(recommendationsRes.map(mapRecommendation));
    } catch (err) {
      console.error('Failed to load data from backend:', err);
      setLoadError(err.message || 'Could not reach the backend API.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ---- 2. Real-time updates via Socket.io (replaces the old setInterval simulations) ----
  useEffect(() => {
    const socket = connectSocket();

    const handleVehicleUpdate = (backendVehicle) => {
      const updated = mapVehicle(backendVehicle);
      setVehicles((prev) => {
        const exists = prev.some((v) => v.id === updated.id);
        return exists ? prev.map((v) => (v.id === updated.id ? updated : v)) : [...prev, updated];
      });
    };

    const handleAlertNew = (backendAlert) => {
      const newAlert = mapAlert(backendAlert);
      setAlerts((prev) => [newAlert, ...prev].slice(0, 7));
    };

    const handleRecommendationChange = (backendRec) => {
      const updated = mapRecommendation(backendRec);
      setRecommendations((prev) => {
        const exists = prev.some((r) => r.id === updated.id);
        return exists ? prev.map((r) => (r.id === updated.id ? updated : r)) : [updated, ...prev];
      });
    };

    const handleSettingsUpdate = (backendSettings) => {
      setSettings(mapSettings(backendSettings));
    };

    socket.on('vehicle:update', handleVehicleUpdate);
    socket.on('alert:new', handleAlertNew);
    socket.on('recommendation:new', handleRecommendationChange);
    socket.on('recommendation:update', handleRecommendationChange);
    socket.on('settings:update', handleSettingsUpdate);

    return () => {
      socket.off('vehicle:update', handleVehicleUpdate);
      socket.off('alert:new', handleAlertNew);
      socket.off('recommendation:new', handleRecommendationChange);
      socket.off('recommendation:update', handleRecommendationChange);
      socket.off('settings:update', handleSettingsUpdate);
      disconnectSocket();
    };
  }, []);

  // ---- 3. Persist settings changes to the backend (debounced) ----
  useEffect(() => {
    if (loadingData) return; // don't PUT the default state before the real settings arrive
    const timer = setTimeout(() => {
      api.put('/settings', settings).catch((err) => console.error('Failed to save settings:', err));
    }, 700);
    return () => clearTimeout(timer);
  }, [settings, loadingData]);

  // Watch EV-003 telemetry for thermal warning triggers
  const ev3 = vehicles.find((v) => v.id === 'EV-003');
  const isEv3Anomaly =
    ev3 &&
    ev3.status !== 'ISOLATED' &&
    (ev3.temp > settings.thermalTriggerTemp || ev3.healthScore < settings.criticalSohThreshold);

  // If auto-isolate is on, automatically trigger isolation instead of showing popup
  useEffect(() => {
    if (isEv3Anomaly) {
      if (settings.autoIsolate) {
        handleIsolateVehicle(true);
      } else if (!isSnoozed && !showWarning) {
        setShowWarning(true);
        playThermalWarningSound();
        if (!detectionTime) {
          setDetectionTime(
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          );
        }
      }
    } else {
      setShowWarning(false);
      setDetectionTime('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEv3Anomaly, isSnoozed, settings.autoIsolate]);

  const handleDismissWarning = () => {
    setShowWarning(false);
    setIsSnoozed(true);
    // Snooze warning for 30 seconds
    setTimeout(() => {
      setIsSnoozed(false);
    }, 30000);
  };

  // Isolate the vehicle on the backend — the "vehicle:update" and "alert:new"
  // socket events it emits will update local state automatically.
  const handleIsolateVehicle = async (autoIsolated = false) => {
    setToast({
      show: true,
      message: autoIsolated ? 'Vehicle EV-003 auto-isolated successfully' : 'Vehicle EV-003 isolated successfully',
    });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
    setShowWarning(false);

    try {
      await api.patch('/vehicles/EV-003/isolate', { autoIsolated });
    } catch (err) {
      console.error('Failed to isolate vehicle:', err);
      setToast({ show: true, message: 'Could not reach backend to isolate vehicle' });
      setTimeout(() => setToast({ show: false, message: '' }), 4000);
    }
  };

  const handleAlertTechnician = async () => {
    setToast({ show: true, message: 'Technician notified via edge network' });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);

    try {
      await api.post('/alerts/notify-technician', { vehicleId: 'EV-003' });
    } catch (err) {
      console.error('Failed to notify technician:', err);
    }
  };

  // 1. Telemetry Clock Timer (Every 1 second) — purely client-side, no backend needed
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Manual "Sync Telemetry" button — asks the backend to log a fresh info alert.
  // The live "alert:new" socket event then adds it to the feed automatically.
  const handleTriggerTelemetryRefresh = async () => {
    if (!vehicles.length) return;
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)].id;
    try {
      await api.post('/alerts', {
        vehicleId: randomVehicle,
        message: 'Manual telemetry sync: all sensors balanced.',
        severity: 'info',
        type: 'nominal',
      });
    } catch (err) {
      console.error('Failed to trigger telemetry refresh:', err);
    }
  };

  // Derive dashboard statistics dynamically from live state
  const avgHealth = vehicles.length
    ? Math.round(vehicles.reduce((sum, v) => sum + v.healthScore, 0) / vehicles.length)
    : 0;
  const criticalCount = vehicles.filter(
    (v) => v.status === 'critical' || v.healthScore < settings.criticalSohThreshold
  ).length;
  const criticalAlertsCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningAlertsCount = alerts.filter((a) => a.severity === 'warning').length;

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-slate-300 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-slate-300 font-sans px-4">
        <div className="glass-card rounded-2xl p-6 max-w-sm text-center space-y-3">
          <p className="text-red-400 font-semibold">Could not connect to backend</p>
          <p className="text-xs text-slate-400">{loadError}</p>
          <p className="text-xs text-slate-500">
            Make sure the backend is running (<code className="text-emerald-400">npm run dev</code> inside{' '}
            <code className="text-emerald-400">ev-battery-backend</code>) on the URL set in your frontend{' '}
            <code className="text-emerald-400">.env</code> (<code>VITE_API_URL</code>).
          </p>
          <button
            onClick={loadInitialData}
            className="mt-2 px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <button
        onClick={onLogout}
        className="fixed bottom-4 left-4 z-[10000] text-[11px] px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-colors backdrop-blur"
        title="Logout"
      >
        Logout
      </button>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              vehicles={vehicles}
              setVehicles={setVehicles}
              alerts={alerts}
              setAlerts={setAlerts}
              toast={toast}
              setToast={setToast}
              showWarning={showWarning}
              setShowWarning={setShowWarning}
              detectionTime={detectionTime}
              setDetectionTime={setDetectionTime}
              settings={settings}
              setSettings={setSettings}
              handleTriggerTelemetryRefresh={handleTriggerTelemetryRefresh}
              currentTime={currentTime}
              avgHealth={avgHealth}
              criticalCount={criticalCount}
              criticalAlertsCount={criticalAlertsCount}
              warningAlertsCount={warningAlertsCount}
              handleIsolateVehicle={handleIsolateVehicle}
              handleAlertTechnician={handleAlertTechnician}
              handleDismissWarning={handleDismissWarning}
              recommendations={recommendations}
              setRecommendations={setRecommendations}
            />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="battery-health" element={<BatteryHealth />} />
          <Route path="charge-history" element={<ChargeHistory />} />
          <Route path="range-predictor" element={<RangePredictor />} />
          <Route path="fleet-map" element={<FleetMap />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  const [token, setToken] = useState(getStoredToken());

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    clearToken();
    disconnectSocket();
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // key={token} forces a clean remount (fresh state + socket) whenever the user logs in again
  return <DashboardApp key={token} onLogout={handleLogout} />;
}
