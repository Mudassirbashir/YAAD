import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { RemoteConfigProvider } from './context/RemoteConfigContext';
import { initMonitoring } from './lib/monitoring';
import { isPerfMeterEnabled, startPerfMeter } from './lib/perfMeter';
import './index.css';

// Initialize Sentry monitoring before mounting React application
initMonitoring();
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
