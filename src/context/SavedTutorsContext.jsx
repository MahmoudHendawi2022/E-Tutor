import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { useTutors } from "./TutorsContext";
import { studentsService } from "../services/students/students.service";

const SavedTutorsContext = createContext(null);

export function SavedTutorsProvider({ children }) {
  const { user } = useAuth();
  const { getPublicTutorById } = useTutors();

  const studentId = user?.role === "student" ? Number(user.id) : null;

  const [savedTutorIds, setSavedTutorIds] = useState(() =>
    studentsService.loadSavedTutorIds(studentId),
  );

  /* Switch saved state when a different student signs in. */
  useEffect(() => {
    setSavedTutorIds(studentsService.loadSavedTutorIds(studentId));
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
    if (!studentId) return;
    studentsService.saveSavedTutorIds(studentId, savedTutorIds);
  }, [studentId, savedTutorIds]);

  const isTutorSaved = useCallback(
    (tutorId) => savedTutorIds.includes(Number(tutorId)),
    [savedTutorIds],
  );

  const saveTutor = useCallback(
    (tutorId) => {
      const id = Number(tutorId);
      const isPublicTutor = Boolean(getPublicTutorById(id));
      setSavedTutorIds((current) => studentsService.saveTutor(current, tutorId, studentId, isPublicTutor));
    },
    [studentId, getPublicTutorById],
  );

  const removeSavedTutor = useCallback((tutorId) => {
    setSavedTutorIds((current) => studentsService.removeSavedTutor(current, tutorId));
  }, []);

  const toggleSavedTutor = useCallback(
    (tutorId) => {
      const id = Number(tutorId);
      const isPublicTutor = Boolean(getPublicTutorById(id));
      setSavedTutorIds((current) => studentsService.toggleSavedTutor(current, tutorId, studentId, isPublicTutor));
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
