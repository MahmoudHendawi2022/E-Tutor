import { createContext, useContext, useEffect, useMemo, useState } from "react";

const PlatformSettingsContext = createContext(null);
const STORAGE_KEY = "etutor_platform_settings_v1";

const defaultSettings = {
  platformName: "E-Tutor",
  commissionRate: 20,
  defaultCurrency: "USD",
  minimumPayout: 50,
  allowPayLater: true,
  tutorAutoApproval: false,
};

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function PlatformSettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates) => {
    setSettings((current) => ({ ...current, ...updates }));
  };

  const resetSettings = () => setSettings(defaultSettings);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings],
  );

  return (
    <PlatformSettingsContext.Provider value={value}>
      {children}
    </PlatformSettingsContext.Provider>
  );
}

export function usePlatformSettings() {
  const context = useContext(PlatformSettingsContext);
  if (!context) {
    throw new Error("usePlatformSettings must be used inside PlatformSettingsProvider");
  }
  return context;
}
