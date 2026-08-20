import { storageService } from "../storage/storage.service";

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

export const platformSettingsService = {
  loadSettings() {
    const stored = storageService.getItem(STORAGE_KEY, null);
    return stored ? { ...defaultSettings, ...stored, defaultCurrency: "EGP" } : defaultSettings;
  },

  saveSettings(settings) {
    storageService.setItem(STORAGE_KEY, settings);
  },

  getDefaultSettings() {
    return defaultSettings;
  }
};
