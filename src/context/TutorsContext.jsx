import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { tutorsService } from "../services/tutors/tutors.service";

const TutorsContext = createContext(null);

export function TutorsProvider({ children }) {
  const [tutors, setTutors] = useState(() => tutorsService.loadTutors());

  useEffect(() => {
    tutorsService.saveTutors(tutors);
  }, [tutors]);

  const getTutorById = useCallback(
    (id) => tutors.find((item) => Number(item.id) === Number(id)) || null,
    [tutors],
  );

  const getTutorByUserId = useCallback(
    (id) => tutors.find((item) => Number(item.userId) === Number(id)) || null,
    [tutors],
  );

  const updateTutor = useCallback((tutorId, updates) => {
    setTutors((current) => tutorsService.updateTutor(current, tutorId, updates));
  }, []);

  const saveTutorProfile = useCallback(
    ({ userId, tutorId, ...profile }) => {
      let res;
      setTutors((current) => {
        res = tutorsService.saveTutorProfile(current, { userId, tutorId, ...profile });
        return res.list;
      });
      return res?.tutor;
    },
    [],
  );

  const submitTutorApplication = useCallback(
    ({ userId, tutorId, ...profile }) => {
      let res;
      setTutors((current) => {
        res = tutorsService.submitTutorApplication(current, { userId, tutorId, ...profile });
        return res.success ? res.list : current;
      });
      return res;
    },
    [],
  );

  const approveTutor = useCallback(
    (tutorId) => {
      setTutors((current) => tutorsService.approveTutor(current, tutorId));
    },
    [],
  );

  const requestTutorChanges = useCallback(
    (tutorId, note) => {
      setTutors((current) => tutorsService.requestTutorChanges(current, tutorId, note));
    },
    [],
  );

  const rejectTutor = useCallback(
    (tutorId, reason) => {
      setTutors((current) => tutorsService.rejectTutor(current, tutorId, reason));
    },
    [],
  );

  const suspendTutor = useCallback(
    (tutorId, reason = "") => {
      setTutors((current) => tutorsService.suspendTutor(current, tutorId, reason));
    },
    [],
  );

  const reactivateTutor = useCallback(
    (tutorId) => {
      setTutors((current) => tutorsService.reactivateTutor(current, tutorId));
    },
    [],
  );

  const submitTutorProfileChanges = useCallback(
    (tutorId, profile) => {
      let res;
      setTutors((current) => {
        res = tutorsService.submitTutorProfileChanges(current, tutorId, profile);
        return res.success ? res.list : current;
      });
      return res;
    },
    [],
  );

  const approveTutorChanges = useCallback(
    (tutorId) => {
      let res;
      setTutors((current) => {
        res = tutorsService.approveTutorChanges(current, tutorId);
        return res.success ? res.list : current;
      });
      return res ? res.success : false;
    },
    [],
  );

  const rejectTutorChanges = useCallback(
    (tutorId, reason) => {
      setTutors((current) => tutorsService.rejectTutorChanges(current, tutorId, reason));
    },
    [],
  );

  const publicTutors = useMemo(
    () => tutors.filter((tutor) => tutor.status === "approved" && tutor.profileCompleted),
    [tutors],
  );

  const getPublicTutorById = useCallback(
    (tutorId) =>
      publicTutors.find(
        (tutor) => Number(tutor.id) === Number(tutorId),
      ) || null,
    [publicTutors],
  );

  const tutorApplications = useMemo(
    () =>
      tutors.filter((tutor) =>
        ["pending_review", "needs_changes", "rejected"].includes(tutor.status),
      ),
    [tutors],
  );

  const pendingProfileChanges = useMemo(
    () => tutors.filter((tutor) => tutor.profileUpdateStatus === "pending_review"),
    [tutors],
  );

  const value = useMemo(
    () => ({
      tutors,
      publicTutors,
      getPublicTutorById,
      tutorApplications,
      pendingProfileChanges,
      getTutorById,
      getTutorByUserId,
      updateTutor,
      saveTutorProfile,
      submitTutorApplication,
      approveTutor,
      requestTutorChanges,
      rejectTutor,
      suspendTutor,
      reactivateTutor,
      submitTutorProfileChanges,
      approveTutorChanges,
      rejectTutorChanges,
      getProfileCompletion: (id) => {
        const tutor = getTutorById(id);
        return tutor ? tutorsService.calculateProfileCompletion(tutor) : { complete: false, percentage: 0 };
      },
    }),
    [
      tutors,
      publicTutors,
      getPublicTutorById,
      tutorApplications,
      pendingProfileChanges,
      getTutorById,
      getTutorByUserId,
      updateTutor,
      saveTutorProfile,
      submitTutorApplication,
      approveTutor,
      requestTutorChanges,
      rejectTutor,
      suspendTutor,
      reactivateTutor,
      submitTutorProfileChanges,
      approveTutorChanges,
      rejectTutorChanges,
    ],
  );

  return <TutorsContext.Provider value={value}>{children}</TutorsContext.Provider>;
}

export function useTutors() {
  const context = useContext(TutorsContext);
  if (!context) throw new Error("useTutors must be used inside TutorsProvider");
  return context;
}
