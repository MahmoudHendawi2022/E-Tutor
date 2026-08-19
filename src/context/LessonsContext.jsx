import { createContext, useContext, useEffect, useState } from "react";

import { lessons as defaultLessons } from "../data/lessons";

import { useTutors } from "./TutorsContext";

import { useNotifications } from "./NotificationsContext";

const LessonsContext = createContext(null);

const STORAGE_KEY = "etutor_lessons_v1";

/* =====================================
   REMINDERS
===================================== */

const UPCOMING_REMINDER_HOURS = 48;

const SOON_REMINDER_MINUTES = 10;

/* =====================================
   NORMALIZE LESSON

   Old demo lessons do not have
   studentId, so they belong to
   demo student #1.
===================================== */

function normalizeLesson(lesson) {
  return {
    ...lesson,

    studentId: Number(lesson.studentId ?? 1),

    tutorId: Number(lesson.tutorId),
  };
}

/* =====================================
   DEFAULT LESSONS
===================================== */

function cloneDefaultLessons() {
  return defaultLessons.map((lesson) => normalizeLesson(lesson));
}

/* =====================================
   INITIAL LESSONS
===================================== */

function getInitialLessons() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return cloneDefaultLessons();
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return cloneDefaultLessons();
    }

    /*
      Automatically migrate old
      localStorage lessons.
    */

    return parsed.map((lesson) => normalizeLesson(lesson));
  } catch (error) {
    console.error("Could not load lessons:", error);

    return cloneDefaultLessons();
  }
}

/* =====================================
   LESSON START
===================================== */

function getLessonStart(lesson) {
  if (!lesson?.date || !lesson?.time) {
    return null;
  }

  const date = new Date(`${lesson.date}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const time = String(lesson.time).trim().toUpperCase();

  /* =====================================
     12 HOUR FORMAT
     10:00 AM
     04:30 PM
  ===================================== */

  const twelveHourMatch = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);

    const minutes = Number(twelveHourMatch[2]);

    const period = twelveHourMatch[3];

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    date.setHours(hours, minutes, 0, 0);

    return date;
  }

  /* =====================================
     24 HOUR FORMAT
     10:00
     16:30
  ===================================== */

  const twentyFourHourMatch = time.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);

    const minutes = Number(twentyFourHourMatch[2]);

    date.setHours(hours, minutes, 0, 0);

    return date;
  }

  return null;
}

/* =====================================
   LESSON END
===================================== */

function getLessonEnd(lesson) {
  const start = getLessonStart(lesson);

  if (!start) {
    return null;
  }

  const duration = Number(lesson?.duration);

  if (!Number.isFinite(duration) || duration <= 0) {
    return null;
  }

  return new Date(start.getTime() + duration * 60 * 1000);
}

/* =====================================
   REMINDER DATE
===================================== */

function formatReminderDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",

    month: "short",

    day: "numeric",
  });
}

/* =====================================
   REMINDER TIME
===================================== */

function formatReminderTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",

    minute: "2-digit",
  });
}

/* =====================================
   PROVIDER
===================================== */

export function LessonsProvider({ children }) {
  const [lessons, setLessons] = useState(getInitialLessons);

  const { getTutorById } = useTutors();

  const {
    addNotification,

    removeNotificationsByKeyPrefix,
  } = useNotifications();

  /* =====================================
     SAVE LESSONS
  ===================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,

        JSON.stringify(lessons),
      );
    } catch (error) {
      console.error("Could not save lessons:", error);
    }
  }, [lessons]);

  /* =====================================
     REMINDERS
  ===================================== */

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();

      lessons.forEach((lesson) => {
        /*
              Only upcoming lessons.

              IMPORTANT:
              This does NOT automatically
              complete the lesson.
            */

        if (lesson.status !== "upcoming") {
          return;
        }

        const start = getLessonStart(lesson);

        if (!start) {
          return;
        }

        const difference = start.getTime() - now.getTime();

        /*
              Lesson already started.

              No more reminder,
              but status remains upcoming
              until tutor confirms it.
            */

        if (difference <= 0) {
          return;
        }

        const minutesUntilLesson = difference / 1000 / 60;

        const hoursUntilLesson = minutesUntilLesson / 60;

        const tutor = getTutorById(lesson.tutorId);

        const tutorName = tutor?.name || "your tutor";

        /* =====================================
               SOON REMINDER
            ===================================== */

        if (minutesUntilLesson <= SOON_REMINDER_MINUTES) {
          addNotification({
            key: `lesson-reminder-${lesson.id}-soon`,

            type: "lesson",

            title: "Lesson starts soon",

            text: `Your ${lesson.subject} lesson with ${tutorName} starts at ${formatReminderTime(
              start,
            )}.`,

            to: `/dashboard/lessons/${lesson.id}`,
          });

          return;
        }

        /* =====================================
               UPCOMING REMINDER
            ===================================== */

        if (hoursUntilLesson <= UPCOMING_REMINDER_HOURS) {
          addNotification({
            key: `lesson-reminder-${lesson.id}-upcoming`,

            type: "lesson",

            title: "Upcoming lesson",

            text: `Your ${lesson.subject} lesson with ${tutorName} is coming up on ${formatReminderDate(
              start,
            )} at ${formatReminderTime(start)}.`,

            to: `/dashboard/lessons/${lesson.id}`,
          });
        }
      });
    };

    checkReminders();

    const timer = window.setInterval(
      checkReminders,

      60 * 1000,
    );

    return () => {
      window.clearInterval(timer);
    };
  }, [lessons, addNotification, getTutorById]);

  /* =====================================
     ADD LESSON
  ===================================== */

  const addLesson = (newLesson) => {
    const normalizedLesson = normalizeLesson(newLesson);

    setLessons((current) => {
      const exists = normalizedLesson.bookingId
        ? current.some(
            (lesson) => lesson.bookingId === normalizedLesson.bookingId,
          )
        : current.some(
            (lesson) => Number(lesson.id) === Number(normalizedLesson.id),
          );

      if (exists) {
        return current;
      }

      return [normalizedLesson, ...current];
    });
  };

  /* =====================================
     UPDATE LESSON
  ===================================== */

  const updateLesson = (lessonId, updates) => {
    const numericLessonId = Number(lessonId);

    setLessons((current) =>
      current.map((lesson) =>
        Number(lesson.id) === numericLessonId
          ? normalizeLesson({
              ...lesson,

              ...updates,
            })
          : lesson,
      ),
    );
  };

  /* =====================================
     CANCEL LESSON
  ===================================== */

  const cancelLesson = (lessonId, reason) => {
    const numericLessonId = Number(lessonId);

    const cleanReason = reason?.trim();

    if (!numericLessonId || !cleanReason) {
      return false;
    }

    const targetLesson = lessons.find(
      (lesson) => Number(lesson.id) === numericLessonId,
    );

    if (!targetLesson || targetLesson.status !== "upcoming") {
      return false;
    }

    const cancelledAt = new Date().toISOString();

    removeNotificationsByKeyPrefix(`lesson-reminder-${numericLessonId}-`);

    setLessons((current) =>
      current.map((lesson) =>
        Number(lesson.id) === numericLessonId
          ? {
              ...lesson,

              status: "cancelled",

              cancelledBy: "You",

              cancellationReason: cleanReason,

              cancelledAt,

              canJoin: false,
            }
          : lesson,
      ),
    );

    const tutor = getTutorById(targetLesson.tutorId);

    addNotification({
      type: "lesson",

      title: "Lesson cancelled",

      text: tutor
        ? `Your ${targetLesson.subject} lesson with ${tutor.name} has been cancelled.`
        : `Your ${targetLesson.subject} lesson has been cancelled.`,

      to: `/dashboard/lessons/${numericLessonId}`,
    });

    return true;
  };

  /* =====================================
     TUTOR COMPLETION STATE
  ===================================== */

  const getTutorCompletionState = (lessonId, tutorId, now = new Date()) => {
    const numericLessonId = Number(lessonId);

    const numericTutorId = Number(tutorId);

    const targetLesson = lessons.find(
      (lesson) => Number(lesson.id) === numericLessonId,
    );

    if (!targetLesson) {
      return {
        canComplete: false,

        reason: "not_found",

        availableAt: null,
      };
    }

    /*
      Tutor can only complete
      his own lesson.
    */

    if (Number(targetLesson.tutorId) !== numericTutorId) {
      return {
        canComplete: false,

        reason: "not_owner",

        availableAt: null,
      };
    }

    if (targetLesson.status === "completed") {
      return {
        canComplete: false,

        reason: "already_completed",

        availableAt: targetLesson.completedAt || null,
      };
    }

    if (targetLesson.status === "cancelled") {
      return {
        canComplete: false,

        reason: "cancelled",

        availableAt: null,
      };
    }

    if (targetLesson.status !== "upcoming") {
      return {
        canComplete: false,

        reason: "invalid_status",

        availableAt: null,
      };
    }

    const lessonEnd = getLessonEnd(targetLesson);

    if (!lessonEnd) {
      return {
        canComplete: false,

        reason: "invalid_schedule",

        availableAt: null,
      };
    }

    const currentTime = now instanceof Date ? now : new Date(now);

    if (currentTime.getTime() < lessonEnd.getTime()) {
      return {
        canComplete: false,

        reason: "too_early",

        availableAt: lessonEnd.toISOString(),
      };
    }

    return {
      canComplete: true,

      reason: "ready",

      availableAt: lessonEnd.toISOString(),
    };
  };

  /* =====================================
     MARK LESSON COMPLETED
     TUTOR ONLY
  ===================================== */

  const markLessonCompletedByTutor = (lessonId, tutorId) => {
    const numericLessonId = Number(lessonId);

    const numericTutorId = Number(tutorId);

    if (!numericLessonId || !numericTutorId) {
      return false;
    }

    const completionState = getTutorCompletionState(
      numericLessonId,

      numericTutorId,

      new Date(),
    );

    if (!completionState.canComplete) {
      return false;
    }

    const targetLesson = lessons.find(
      (lesson) => Number(lesson.id) === numericLessonId,
    );

    if (!targetLesson) {
      return false;
    }

    const completedAt = new Date().toISOString();

    removeNotificationsByKeyPrefix(`lesson-reminder-${numericLessonId}-`);

    setLessons((current) =>
      current.map((lesson) =>
        Number(lesson.id) === numericLessonId
          ? {
              ...lesson,

              status: "completed",

              completedByTutor: true,

              completedByTutorId: numericTutorId,

              completedAt,

              canJoin: false,
            }
          : lesson,
      ),
    );

    const tutor = getTutorById(numericTutorId);

    addNotification({
      key: `lesson-completed-${numericLessonId}`,

      type: "lesson",

      title: "Lesson completed",

      text: tutor
        ? `Your ${targetLesson.subject} lesson with ${tutor.name} has been marked as completed. You can now leave a review.`
        : `Your ${targetLesson.subject} lesson has been marked as completed. You can now leave a review.`,

      to: `/dashboard/lessons/${numericLessonId}`,
    });

    return true;
  };

  /* =====================================
     SUBMIT REVIEW
  ===================================== */

  const submitLessonReview = (lessonId, reviewData) => {
    const numericLessonId = Number(lessonId);

    if (!numericLessonId) {
      return false;
    }

    const targetLesson = lessons.find(
      (lesson) => Number(lesson.id) === numericLessonId,
    );

    /*
      Reviews are only available
      after tutor completion.
    */

    if (
      !targetLesson ||
      targetLesson.status !== "completed" ||
      targetLesson.reviewed
    ) {
      return false;
    }

    const rating = Number(reviewData?.rating);

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return false;
    }

    const review = reviewData?.review?.trim() || "";

    const reviewedAt = reviewData?.reviewedAt || new Date().toISOString();

    setLessons((current) =>
      current.map((lesson) =>
        Number(lesson.id) === numericLessonId
          ? {
              ...lesson,

              rating,

              review,

              reviewed: true,

              reviewedAt,
            }
          : lesson,
      ),
    );

    const tutor = getTutorById(targetLesson.tutorId);

    addNotification({
      key: `lesson-review-${numericLessonId}`,

      type: "review",

      title: "Review submitted",

      text: tutor
        ? `Your review for your ${targetLesson.subject} lesson with ${tutor.name} was submitted successfully.`
        : `Your review for your ${targetLesson.subject} lesson was submitted successfully.`,

      to: `/dashboard/lessons/${numericLessonId}`,
    });

    return true;
  };

  /* =====================================
     REMOVE LESSON
  ===================================== */

  const removeLesson = (lessonId) => {
    const numericLessonId = Number(lessonId);

    removeNotificationsByKeyPrefix(`lesson-reminder-${numericLessonId}-`);

    setLessons((current) =>
      current.filter((lesson) => Number(lesson.id) !== numericLessonId),
    );
  };

  /* =====================================
     GET LESSON
  ===================================== */

  const getLessonById = (lessonId) => {
    return lessons.find((lesson) => Number(lesson.id) === Number(lessonId));
  };

  /* =====================================
     LESSONS BY TUTOR
  ===================================== */

  const getLessonsByTutorId = (tutorId) => {
    return lessons.filter(
      (lesson) => Number(lesson.tutorId) === Number(tutorId),
    );
  };

  /* =====================================
     LESSONS BY STUDENT
  ===================================== */

  const getLessonsByStudentId = (studentId) => {
    return lessons.filter(
      (lesson) => Number(lesson.studentId) === Number(studentId),
    );
  };

  /* =====================================
     CONTEXT
  ===================================== */

  return (
    <LessonsContext.Provider
      value={{
        lessons,

        addLesson,

        updateLesson,

        cancelLesson,

        getTutorCompletionState,

        markLessonCompletedByTutor,

        submitLessonReview,

        removeLesson,

        getLessonById,

        getLessonsByTutorId,

        getLessonsByStudentId,
      }}
    >
      {children}
    </LessonsContext.Provider>
  );
}

/* =====================================
   HOOK
===================================== */

export function useLessons() {
  const context = useContext(LessonsContext);

  if (!context) {
    throw new Error("useLessons must be used inside LessonsProvider");
  }

  return context;
}
