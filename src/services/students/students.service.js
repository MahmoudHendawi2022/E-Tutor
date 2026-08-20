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
  },

  saveTutor(savedTutorIds, tutorId, studentId, isPublicTutor) {
    const id = Number(tutorId);
    if (!studentId || !isPublicTutor) return savedTutorIds;
    return savedTutorIds.includes(id) ? savedTutorIds : [...savedTutorIds, id];
  },

  removeSavedTutor(savedTutorIds, tutorId) {
    const id = Number(tutorId);
    return savedTutorIds.filter((savedId) => savedId !== id);
  },

  toggleSavedTutor(savedTutorIds, tutorId, studentId, isPublicTutor) {
    const id = Number(tutorId);
    if (!studentId) return savedTutorIds;

    if (savedTutorIds.includes(id)) {
      return savedTutorIds.filter((savedId) => savedId !== id);
    }

    if (!isPublicTutor) return savedTutorIds;
    return [...savedTutorIds, id];
  }
};
