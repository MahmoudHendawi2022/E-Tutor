import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { tutors as defaultTutors } from "../data/tutors";

const TutorsContext = createContext(null);
const STORAGE_KEY = "etutor_tutors_v2";

const allowedStatuses = [
  "draft",
  "pending_review",
  "needs_changes",
  "approved",
  "rejected",
  "suspended",
];

const arr = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

function normalizeStatus(status) {
  if (status === "active") return "approved";
  return allowedStatuses.includes(status) ? status : "draft";
}

function normalizeTutor(tutor) {
  const name = String(
    tutor?.name || `${tutor?.firstName || ""} ${tutor?.lastName || ""}`,
  ).trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = String(tutor?.firstName || parts[0] || "").trim();
  const lastName = String(tutor?.lastName || parts.slice(1).join(" ")).trim();
  const primarySubject = String(tutor?.primarySubject || tutor?.subject || "").trim();
  const status = normalizeStatus(tutor.status);
  const experienceYears = Number(tutor.experienceYears || 0);
  const specializations = arr(tutor.specializations);
  const languages = arr(tutor.languages);
  const university = tutor.university || "";
  const degree = tutor.degree || "";

  return {
    ...tutor,
    id: Number(tutor.id),
    userId: tutor.userId ? Number(tutor.userId) : null,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || name || "Tutor",
    image: tutor.image || "",
    titleId: tutor.titleId || "",
    title: tutor.title || "",
    shortTitle: tutor.shortTitle || tutor.title || "Tutor",
    headline: tutor.headline || "",
    bio: tutor.bio || tutor.about || "",
    primarySubjectId: tutor.primarySubjectId || "",
    primarySubject,
    subject: primarySubject,
    specializationIds: arr(tutor.specializationIds),
    specializations,
    subjects: arr(tutor.subjects).length ? arr(tutor.subjects) : primarySubject ? [primarySubject] : [],
    teachingLevels: arr(tutor.teachingLevels),
    price: Number(tutor.price || 0),
    currency: tutor.currency || "USD",
    experienceYears,
    countryCode: tutor.countryCode || "",
    country: tutor.country || "",
    cityId: tutor.cityId || "",
    city: tutor.city || "",
    timezone: tutor.timezone || "",
    universityId: tutor.universityId || "",
    university,
    degree,
    fieldOfStudy: tutor.fieldOfStudy || "",
    graduationYear: tutor.graduationYear || "",
    languages,
    certifications: arr(tutor.certifications),
    identityDocument: tutor.identityDocument || null,
    qualificationDocument: tutor.qualificationDocument || null,
    trialLesson: Boolean(tutor.trialLesson),
    trialPrice: Number(tutor.trialPrice || 0),
    rating: Number(tutor.rating || 0),
    reviews: Number(tutor.reviews || 0),
    lessonsCompleted: Number(tutor.lessonsCompleted || 0),

    /* Legacy/public UI compatibility while the app is migrated to TutorsContext. */
    lessons: Number(tutor.lessons ?? tutor.lessonsCompleted ?? 0),
    experience:
      tutor.experience ||
      (experienceYears > 0 ? `${experienceYears} years` : "Experience not specified"),
    education:
      tutor.education ||
      [degree, university].filter(Boolean).join(" · ") ||
      "Education not specified",
    tags: arr(tutor.tags).length ? arr(tutor.tags) : specializations,
    online: tutor.online ?? true,
    verified: tutor.verified ?? status === "approved",

    profileCompleted: Boolean(tutor.profileCompleted),
    status,
    submittedAt: tutor.submittedAt || null,
    reviewedAt: tutor.reviewedAt || null,
    approvedAt: tutor.approvedAt || null,
    reviewNote: tutor.reviewNote || "",
    rejectionReason: tutor.rejectionReason || "",
    pendingChanges: tutor.pendingChanges || null,
    profileUpdateStatus: tutor.profileUpdateStatus || null,
    createdAt: tutor.createdAt || null,
    updatedAt: tutor.updatedAt || null,
  };
}

function createSeedTutors() {
  return defaultTutors.map((tutor, index) =>
    normalizeTutor({
      ...tutor,
      userId: tutor.userId || (index === 0 ? 101 : null),
      profileCompleted: true,
      status: "approved",
      approvedAt: tutor.approvedAt || "2026-07-01T09:00:00.000Z",
    }),
  );
}

function loadTutors() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) ? parsed.map(normalizeTutor) : createSeedTutors();
  } catch {
    return createSeedTutors();
  }
}

function nextTutorId(tutors) {
  return tutors.reduce((max, tutor) => Math.max(max, Number(tutor.id || 0)), 0) + 1;
}

function calculateProfileCompletion(tutor) {
  const requirements = [
    tutor.firstName,
    tutor.lastName,
    tutor.image,
    tutor.title,
    tutor.bio,
    tutor.primarySubject,
    tutor.specializations.length,
    Number(tutor.price) > 0,
    tutor.country,
    tutor.city,
    tutor.timezone,
    tutor.languages.length,
    tutor.university,
    tutor.degree,
    tutor.identityDocument,
    tutor.qualificationDocument,
  ];
  const percentage = Math.round((requirements.filter(Boolean).length / requirements.length) * 100);
  return { percentage, complete: percentage === 100 };
}

export function TutorsProvider({ children }) {
  const [tutors, setTutors] = useState(loadTutors);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tutors));
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
          ? normalizeTutor({
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
        const updated = normalizeTutor({ ...existing, ...profile, updatedAt: now });
        setTutors((current) =>
          current.map((item) => (Number(item.id) === Number(existing.id) ? updated : item)),
        );
        return updated;
      }
      const created = normalizeTutor({
        ...profile,
        id: nextTutorId(tutors),
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
      const candidate = normalizeTutor({
        ...(existing || {}),
        ...profile,
        id: existing?.id || nextTutorId(tutors),
        userId: Number(userId),
        status: "pending_review",
        profileCompleted: true,
        submittedAt: now,
        reviewNote: "",
        rejectionReason: "",
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      });
      const completion = calculateProfileCompletion(candidate);
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
        return tutor ? calculateProfileCompletion(tutor) : { complete: false, percentage: 0 };
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
