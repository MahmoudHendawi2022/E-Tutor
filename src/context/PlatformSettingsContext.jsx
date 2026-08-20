import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { platformSettingsService } from "../services/settings/settings.service";

const PlatformSettingsContext = createContext(null);

export function PlatformSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => platformSettingsService.loadSettings());

  useEffect(() => {
    platformSettingsService.saveSettings(settings);
  }, [settings]);

  const updateSettings = (updates) => {
    setSettings((current) => ({ ...current, ...updates }));
  };

  const resetSettings = () => setSettings(platformSettingsService.getDefaultSettings());

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
