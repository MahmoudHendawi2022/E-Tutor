import { storageService } from "../storage/storage.service";
import { tutors as defaultTutors } from "../../data/tutors";

const STORAGE_KEY = "etutor_tutors_v2";

const allowedStatuses = [
  "draft",
  "pending_review",
  "needs_changes",
  "approved",
  "rejected",
  "suspended",
  "active"
];

const arr = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

function normalizeStatus(status) {
  if (status === "active") return "approved";
  return allowedStatuses.includes(status) ? status : "draft";
}

function normalizeTutor(tutor) {
  const name = String(
    tutor?.name || `${tutor?.firstName || ""} ${tutor?.lastName || ""}`
  ).trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const firstName = String(tutor?.firstName || parts[0] || "").trim();
  const lastName = String(tutor?.lastName || parts.slice(1).join(" ")).trim();
  const primarySubject = String(tutor?.primarySubject || tutor?.subject || "").trim();
  const status = normalizeStatus(tutor?.status);
  const experienceYears = Number(tutor?.experienceYears || 0);
  const specializations = arr(tutor?.specializations);
  const languages = arr(tutor?.languages);
  const university = tutor?.university || "";
  const degree = tutor?.degree || "";

  return {
    ...tutor,
    id: Number(tutor?.id),
    userId: tutor?.userId ? Number(tutor.userId) : null,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim() || name || "Tutor",
    image: tutor?.image || "",
    titleId: tutor?.titleId || "",
    title: tutor?.title || "",
    shortTitle: tutor?.shortTitle || tutor?.title || "Tutor",
    headline: tutor?.headline || "",
    bio: tutor?.bio || tutor?.about || "",
    primarySubjectId: tutor?.primarySubjectId || "",
    primarySubject,
    subject: primarySubject,
    specializationIds: arr(tutor?.specializationIds),
    specializations,
    subjects: arr(tutor?.subjects).length ? arr(tutor?.subjects) : primarySubject ? [primarySubject] : [],
    teachingLevels: arr(tutor?.teachingLevels),
    price: Number(tutor?.price || 0),
    currency: tutor?.currency || "EGP",
    experienceYears,
    countryCode: tutor?.countryCode || "",
    country: tutor?.country || "",
    cityId: tutor?.cityId || "",
    city: tutor?.city || "",
    timezone: tutor?.timezone || "",
    universityId: tutor?.universityId || "",
    university,
    degree,
    fieldOfStudy: tutor?.fieldOfStudy || "",
    graduationYear: tutor?.graduationYear || "",
    languages,
    certifications: arr(tutor?.certifications),
    identityDocument: tutor?.identityDocument || null,
    qualificationDocument: tutor?.qualificationDocument || null,
    payoutMethod: tutor?.payoutMethod || "",
    payoutDestination: tutor?.payoutDestination || "",
    payoutAccountName: tutor?.payoutAccountName || "",
    introVideoKey: tutor?.introVideoKey || "",
    introVideoMeta: tutor?.introVideoMeta || null,
    trialLesson: Boolean(tutor?.trialLesson),
    trialPrice: Number(tutor?.trialPrice || 0),
    rating: Number(tutor?.rating || 0),
    reviews: Number(tutor?.reviews || 0),
    lessonsCompleted: Number(tutor?.lessonsCompleted || 0),
    lessons: Number(tutor?.lessons ?? tutor?.lessonsCompleted ?? 0),
    experience:
      tutor?.experience ||
      (experienceYears > 0 ? `${experienceYears} years` : "Experience not specified"),
    education:
      tutor?.education ||
      [degree, university].filter(Boolean).join(" · ") ||
      "Education not specified",
    tags: arr(tutor?.tags).length ? arr(tutor?.tags) : specializations,
    online: tutor?.online ?? true,
    verified: tutor?.verified ?? status === "approved",
    profileCompleted: Boolean(tutor?.profileCompleted),
    status,
    submittedAt: tutor?.submittedAt || null,
    reviewedAt: tutor?.reviewedAt || null,
    approvedAt: tutor?.approvedAt || null,
    reviewNote: tutor?.reviewNote || "",
    rejectionReason: tutor?.rejectionReason || "",
    pendingChanges: tutor?.pendingChanges || null,
    profileUpdateStatus: tutor?.profileUpdateStatus || null,
    createdAt: tutor?.createdAt || null,
    updatedAt: tutor?.updatedAt || null,
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
    })
  );
}

export const tutorsService = {
  loadTutors() {
    const stored = storageService.getItem(STORAGE_KEY, null);
    const list = Array.isArray(stored) ? stored.map(normalizeTutor) : createSeedTutors();

    const egyptDemoPrices = { 1: 450, 2: 550, 3: 600, 4: 500, 5: 475, 6: 525 };
    return list.map((tutor) => {
      const legacySeed = Number(tutor.id) <= 6 && Number(tutor.price || 0) > 0 && Number(tutor.price) < 100;
      return legacySeed
        ? normalizeTutor({ ...tutor, price: egyptDemoPrices[tutor.id] || 500, currency: "EGP" })
        : tutor;
    });
  },

  saveTutors(tutors) {
    storageService.setItem(STORAGE_KEY, tutors);
  },

  normalizeTutor,
  
  nextTutorId(tutors) {
    return tutors.reduce((max, tutor) => Math.max(max, Number(tutor.id || 0)), 0) + 1;
  },

  calculateProfileCompletion(tutor) {
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
      tutor.payoutMethod,
      tutor.payoutDestination,
    ];
    const percentage = Math.round((requirements.filter(Boolean).length / requirements.length) * 100);
    return { percentage, complete: percentage === 100 };
  }
};
