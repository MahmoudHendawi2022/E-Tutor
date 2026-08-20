export const storageService = {
  getItem(key, defaultValue = null) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error(`Error reading key ${key} from storage`, e);
      return defaultValue;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing key ${key} to storage`, e);
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing key ${key} from storage`, e);
    }
  }
};
