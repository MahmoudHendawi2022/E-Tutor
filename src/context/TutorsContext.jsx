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
    setTutors((current) =>
      current.map((tutor) =>
        Number(tutor.id) === Number(tutorId)
          ? tutorsService.normalizeTutor({
              ...tutor,
              ...updates,
              id: tutor.id,
              userId: tutor.userId,
              updatedAt: new Date().toISOString(),
            })
          : tutor,
      ),
    );
  }, []);

  const saveTutorProfile = useCallback(
    ({ userId, tutorId, ...profile }) => {
      const existing = tutors.find(
        (tutor) =>
          Number(tutor.id) === Number(tutorId) || Number(tutor.userId) === Number(userId),
      );
      const now = new Date().toISOString();
      if (existing) {
        const updated = tutorsService.normalizeTutor({ ...existing, ...profile, updatedAt: now });
        setTutors((current) =>
          current.map((item) => (Number(item.id) === Number(existing.id) ? updated : item)),
        );
        return updated;
      }
      const created = tutorsService.normalizeTutor({
        ...profile,
        id: tutorsService.nextTutorId(tutors),
        userId: Number(userId),
        status: "draft",
        profileCompleted: false,
        rating: 0,
        reviews: 0,
        lessonsCompleted: 0,
        createdAt: now,
        updatedAt: now,
      });
      setTutors((current) => [...current, created]);
      return created;
    },
    [tutors],
  );

  const submitTutorApplication = useCallback(
    ({ userId, tutorId, ...profile }) => {
      const existing = tutors.find(
        (tutor) =>
          Number(tutor.id) === Number(tutorId) || Number(tutor.userId) === Number(userId),
      );
      const now = new Date().toISOString();
      const candidate = tutorsService.normalizeTutor({
        ...(existing || {}),
        ...profile,
        id: existing?.id || tutorsService.nextTutorId(tutors),
        userId: Number(userId),
        status: "pending_review",
        profileCompleted: true,
        submittedAt: now,
        reviewNote: "",
        rejectionReason: "",
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      });
      const completion = tutorsService.calculateProfileCompletion(candidate);
      if (!completion.complete) {
        return {
          success: false,
          percentage: completion.percentage,
          message: "Please complete all required profile information.",
        };
      }
      setTutors((current) => {
        const exists = current.some((item) => Number(item.id) === Number(candidate.id));
        return exists
          ? current.map((item) => (Number(item.id) === Number(candidate.id) ? candidate : item))
          : [...current, candidate];
      });
      return { success: true, tutor: candidate };
    },
    [tutors],
  );

  const approveTutor = useCallback(
    (tutorId) =>
      updateTutor(tutorId, {
        status: "approved",
        profileCompleted: true,
        approvedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
        reviewNote: "",
        rejectionReason: "",
      }),
    [updateTutor],
  );

  const requestTutorChanges = useCallback(
    (tutorId, note) =>
      updateTutor(tutorId, {
        status: "needs_changes",
        reviewNote: String(note || "").trim(),
        reviewedAt: new Date().toISOString(),
      }),
    [updateTutor],
  );

  const rejectTutor = useCallback(
    (tutorId, reason) =>
      updateTutor(tutorId, {
        status: "rejected",
        rejectionReason: String(reason || "").trim(),
        reviewedAt: new Date().toISOString(),
      }),
    [updateTutor],
  );

  const suspendTutor = useCallback(
    (tutorId, reason = "") => updateTutor(tutorId, { status: "suspended", reviewNote: reason }),
    [updateTutor],
  );

  const reactivateTutor = useCallback(
    (tutorId) => updateTutor(tutorId, { status: "approved", reviewNote: "" }),
    [updateTutor],
  );

  const submitTutorProfileChanges = useCallback(
    (tutorId, profile) => {
      const tutor = getTutorById(tutorId);
      if (!tutor) return { success: false };
      if (tutor.status === "approved") {
        updateTutor(tutorId, {
          pendingChanges: profile,
          profileUpdateStatus: "pending_review",
        });
        return { success: true, pendingReview: true };
      }
      return submitTutorApplication({ userId: tutor.userId, tutorId: tutor.id, ...profile });
    },
    [getTutorById, updateTutor, submitTutorApplication],
  );

  const approveTutorChanges = useCallback(
    (tutorId) => {
      const tutor = getTutorById(tutorId);
      if (!tutor?.pendingChanges) return false;
      updateTutor(tutorId, {
        ...tutor.pendingChanges,
        pendingChanges: null,
        profileUpdateStatus: null,
        reviewNote: "",
      });
      return true;
    },
    [getTutorById, updateTutor],
  );

  const rejectTutorChanges = useCallback(
    (tutorId, reason) =>
      updateTutor(tutorId, {
        pendingChanges: null,
        profileUpdateStatus: "rejected",
        reviewNote: reason || "",
      }),
    [updateTutor],
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
