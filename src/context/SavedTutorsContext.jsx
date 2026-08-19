import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { savedTutorIds as defaultSavedTutorIds } from "../data/student";
import { useAuth } from "./AuthContext";
import { useTutors } from "./TutorsContext";

const SavedTutorsContext = createContext(null);

const LEGACY_STORAGE_KEY = "etutor_saved_tutors";

function storageKey(studentId) {
  return studentId ? `etutor_saved_tutors_${Number(studentId)}` : null;
}

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(Number).filter((id) => Number.isFinite(id) && id > 0))];
}

function loadSavedTutorIds(studentId) {
  if (!studentId) return [];

  try {
    const key = storageKey(studentId);
    const stored = localStorage.getItem(key);

    if (stored) {
      return normalizeIds(JSON.parse(stored));
    }

    /*
      Backwards compatibility for the original single-student demo.
      Student #1 inherits the previous global saved list once.
    */
    if (Number(studentId) === 1) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) return normalizeIds(JSON.parse(legacy));
      return normalizeIds(defaultSavedTutorIds);
    }

    return [];
  } catch (error) {
    console.error("Could not load saved tutors:", error);
    return Number(studentId) === 1 ? normalizeIds(defaultSavedTutorIds) : [];
  }
}

export function SavedTutorsProvider({ children }) {
  const { user } = useAuth();
  const { getPublicTutorById } = useTutors();

  const studentId = user?.role === "student" ? Number(user.id) : null;

  const [savedTutorIds, setSavedTutorIds] = useState(() =>
    loadSavedTutorIds(studentId),
  );

  /* Switch saved state when a different student signs in. */
  useEffect(() => {
    setSavedTutorIds(loadSavedTutorIds(studentId));
  }, [studentId]);

  /* Keep only currently public/approved tutors in the saved list. */
  useEffect(() => {
    if (!studentId) return;

    setSavedTutorIds((current) => {
      const next = current.filter((tutorId) => Boolean(getPublicTutorById(tutorId)));
      return next.length === current.length && next.every((id, index) => id === current[index])
        ? current
        : next;
    });
  }, [studentId, getPublicTutorById]);

  useEffect(() => {
    const key = storageKey(studentId);
    if (!key) return;

    try {
      localStorage.setItem(key, JSON.stringify(savedTutorIds));
    } catch (error) {
      console.error("Could not save tutors:", error);
    }
  }, [studentId, savedTutorIds]);

  const isTutorSaved = useCallback(
    (tutorId) => savedTutorIds.includes(Number(tutorId)),
    [savedTutorIds],
  );

  const saveTutor = useCallback(
    (tutorId) => {
      const id = Number(tutorId);
      if (!studentId || !getPublicTutorById(id)) return;

      setSavedTutorIds((current) =>
        current.includes(id) ? current : [...current, id],
      );
    },
    [studentId, getPublicTutorById],
  );

  const removeSavedTutor = useCallback((tutorId) => {
    const id = Number(tutorId);
    setSavedTutorIds((current) => current.filter((savedId) => savedId !== id));
  }, []);

  const toggleSavedTutor = useCallback(
    (tutorId) => {
      const id = Number(tutorId);
      if (!studentId) return;

      setSavedTutorIds((current) => {
        if (current.includes(id)) {
          return current.filter((savedId) => savedId !== id);
        }

        if (!getPublicTutorById(id)) return current;
        return [...current, id];
      });
    },
    [studentId, getPublicTutorById],
  );

  const value = useMemo(
    () => ({
      savedTutorIds,
      savedCount: savedTutorIds.length,
      isTutorSaved,
      saveTutor,
      removeSavedTutor,
      toggleSavedTutor,
    }),
    [
      savedTutorIds,
      isTutorSaved,
      saveTutor,
      removeSavedTutor,
      toggleSavedTutor,
    ],
  );

  return (
    <SavedTutorsContext.Provider value={value}>
      {children}
    </SavedTutorsContext.Provider>
  );
}

export function useSavedTutors() {
  const context = useContext(SavedTutorsContext);

  if (!context) {
    throw new Error("useSavedTutors must be used inside SavedTutorsProvider");
  }

  return context;
}
