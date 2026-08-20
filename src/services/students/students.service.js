import { storageService } from "../storage/storage.service";
import { savedTutorIds as defaultSavedTutorIds } from "../../data/student";

const LEGACY_STORAGE_KEY = "etutor_saved_tutors";

function storageKey(studentId) {
  return studentId ? `etutor_saved_tutors_${Number(studentId)}` : null;
}

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(Number).filter((id) => Number.isFinite(id) && id > 0))];
}

export const studentsService = {
  loadSavedTutorIds(studentId) {
    if (!studentId) return [];

    const key = storageKey(studentId);
    const stored = storageService.getItem(key, null);

    if (stored) {
      return normalizeIds(stored);
    }

    if (Number(studentId) === 1) {
      const legacy = storageService.getItem(LEGACY_STORAGE_KEY, null);
      if (legacy) return normalizeIds(legacy);
      return normalizeIds(defaultSavedTutorIds);
    }

    return [];
  },

  saveSavedTutorIds(studentId, savedTutorIds) {
    const key = storageKey(studentId);
    if (!key) return;
    storageService.setItem(key, savedTutorIds);
  }
};
