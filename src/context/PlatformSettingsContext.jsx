import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { storageService } from "../services/storage/storage.service";

const PlatformSettingsContext = createContext(null);
const STORAGE_KEY = "etutor_platform_settings_v2";

const defaultSettings = {
  platformName: "E-Tutor",
  market: "EG",
  commissionRate: 20,
  defaultCurrency: "EGP",
  minimumPayout: 500,
  allowPayLater: false,
  allowCardPayments: true,
  allowVodafoneCash: true,
  allowInstapay: true,
  vodafoneCashNumber: "",
  instapayHandle: "",
  tutorAutoApproval: false,
};

function loadSettings() {
  const stored = storageService.getItem(STORAGE_KEY, null);
  return stored ? { ...defaultSettings, ...stored, defaultCurrency: "EGP" } : defaultSettings;
}

export function PlatformSettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    storageService.setItem(STORAGE_KEY, settings);
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
