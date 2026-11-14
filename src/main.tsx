import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { RemoteConfigProvider } from './context/RemoteConfigContext';
import { initMonitoring } from './lib/monitoring';
import { isPerfMeterEnabled, startPerfMeter } from './lib/perfMeter';
import { syncLowEndDeviceClass } from './lib/deviceTier';
import './index.css';

syncLowEndDeviceClass();
if (isPerfMeterEnabled()) {
  startPerfMeter();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <RemoteConfigProvider>
            <App />
          </RemoteConfigProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
);

// Defer Sentry SDK initialization until after first paint so it does not compete with initial render
if (typeof window !== 'undefined') {
  const scheduleMonitoringInit = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => {
        initMonitoring();
      }, { timeout: 2000 });
    } else {
      window.setTimeout(() => {
        initMonitoring();
      }, 50);
    }
  };

  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => {
      scheduleMonitoringInit();
    });
  } else {
    scheduleMonitoringInit();
  }
}
