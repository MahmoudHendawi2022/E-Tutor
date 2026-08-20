import { createContext, useContext, useEffect, useState } from "react";
import { useTutors } from "./TutorsContext";
import { useNotifications } from "./NotificationsContext";
import { lessonsService } from "../services/lessons/lessons.service";

const LessonsContext = createContext(null);

const UPCOMING_REMINDER_HOURS = 48;
const SOON_REMINDER_MINUTES = 10;

export function LessonsProvider({ children }) {
  const [lessons, setLessons] = useState(() => lessonsService.loadLessons());
  const { getTutorById } = useTutors();
  const { addNotification, removeNotificationsByKeyPrefix } = useNotifications();

  useEffect(() => {
    lessonsService.saveLessons(lessons);
  }, [lessons]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();

      lessons.forEach((lesson) => {
        if (lesson.status !== "upcoming") {
          return;
        }

        const start = lessonsService.getLessonStart(lesson);
        if (!start) {
          return;
        }

        const difference = start.getTime() - now.getTime();
        if (difference <= 0) {
          return;
        }

        const minutesUntilLesson = difference / 1000 / 60;
        const hoursUntilLesson = minutesUntilLesson / 60;
        const tutor = getTutorById(lesson.tutorId);
        const tutorName = tutor?.name || "your tutor";

        if (minutesUntilLesson <= SOON_REMINDER_MINUTES) {
          addNotification({
            key: `lesson-reminder-${lesson.id}-soon`,
            type: "lesson",
            title: "Lesson starts soon",
            text: `Your ${lesson.subject} lesson with ${tutorName} starts at ${lessonsService.formatReminderTime(start)}.`,
            to: `/dashboard/lessons/${lesson.id}`,
          });
          return;
        }

        if (hoursUntilLesson <= UPCOMING_REMINDER_HOURS) {
          addNotification({
            key: `lesson-reminder-${lesson.id}-upcoming`,
            type: "lesson",
            title: "Upcoming lesson",
            text: `Your ${lesson.subject} lesson with ${tutorName} is coming up on ${lessonsService.formatReminderDate(start)} at ${lessonsService.formatReminderTime(start)}.`,
            to: `/dashboard/lessons/${lesson.id}`,
          });
        }
      });
    };

    checkReminders();
    const timer = window.setInterval(checkReminders, 60 * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [lessons, addNotification, getTutorById]);

  const addLesson = (newLesson) => {
    const normalizedLesson = lessonsService.normalizeLesson(newLesson);
    setLessons((current) => {
      const exists = normalizedLesson.bookingId
        ? current.some((lesson) => lesson.bookingId === normalizedLesson.bookingId)
        : current.some((lesson) => Number(lesson.id) === Number(normalizedLesson.id));

      if (exists) {
        return current;
      }
      return [normalizedLesson, ...current];
    });
  };

  const updateLesson = (lessonId, updates) => {
    const numericLessonId = Number(lessonId);
    setLessons((current) =>
      current.map((lesson) =>
        Number(lesson.id) === numericLessonId
          ? lessonsService.normalizeLesson({ ...lesson, ...updates })
          : lesson
      )
    );
  };

  const cancelLesson = (lessonId, reason) => {
    const numericLessonId = Number(lessonId);
    const cleanReason = reason?.trim();
    if (!numericLessonId || !cleanReason) {
      return false;
    }

    const targetLesson = lessons.find((lesson) => Number(lesson.id) === numericLessonId);
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
          : lesson
      )
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

  const getTutorCompletionState = (lessonId, tutorId, now = new Date()) => {
    const numericLessonId = Number(lessonId);
    const numericTutorId = Number(tutorId);
    const targetLesson = lessons.find((lesson) => Number(lesson.id) === numericLessonId);

    if (!targetLesson) {
      return { canComplete: false, reason: "not_found", availableAt: null };
    }

    if (Number(targetLesson.tutorId) !== numericTutorId) {
      return { canComplete: false, reason: "not_owner", availableAt: null };
    }

    if (targetLesson.status === "completed") {
      return {
        canComplete: false,
        reason: "already_completed",
        availableAt: targetLesson.completedAt || null,
      };
    }

    if (targetLesson.status === "cancelled") {
      return { canComplete: false, reason: "cancelled", availableAt: null };
    }

    if (targetLesson.status !== "upcoming") {
      return { canComplete: false, reason: "invalid_status", availableAt: null };
    }

    const lessonEnd = lessonsService.getLessonEnd(targetLesson);
    if (!lessonEnd) {
      return { canComplete: false, reason: "invalid_schedule", availableAt: null };
    }

    const currentTime = now instanceof Date ? now : new Date(now);
    if (currentTime.getTime() < lessonEnd.getTime()) {
      return {
        canComplete: false,
        reason: "too_early",
        availableAt: lessonEnd.toISOString(),
      };
    }

    return { canComplete: true, reason: "ready", availableAt: lessonEnd.toISOString() };
  };

  const markLessonCompletedByTutor = (lessonId, tutorId) => {
    const numericLessonId = Number(lessonId);
    const numericTutorId = Number(tutorId);
    if (!numericLessonId || !numericTutorId) {
      return false;
    }

    const completionState = getTutorCompletionState(numericLessonId, numericTutorId, new Date());
    if (!completionState.canComplete) {
      return false;
    }

    const targetLesson = lessons.find((lesson) => Number(lesson.id) === numericLessonId);
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
          : lesson
      )
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

  const submitLessonReview = (lessonId, reviewData) => {
    const numericLessonId = Number(lessonId);
    if (!numericLessonId) {
      return false;
    }

    const targetLesson = lessons.find((lesson) => Number(lesson.id) === numericLessonId);
    if (!targetLesson || targetLesson.status !== "completed" || targetLesson.reviewed) {
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
          ? { ...lesson, rating, review, reviewed: true, reviewedAt }
          : lesson
      )
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

  const removeLesson = (lessonId) => {
    const numericLessonId = Number(lessonId);
    removeNotificationsByKeyPrefix(`lesson-reminder-${numericLessonId}-`);
    setLessons((current) => current.filter((lesson) => Number(lesson.id) !== numericLessonId));
  };

  const getLessonById = (lessonId) => {
    return lessons.find((lesson) => Number(lesson.id) === Number(lessonId));
  };

  const getLessonsByTutorId = (tutorId) => {
    return lessons.filter((lesson) => Number(lesson.tutorId) === Number(tutorId));
  };

  const getLessonsByStudentId = (studentId) => {
    return lessons.filter((lesson) => Number(lesson.studentId) === Number(studentId));
  };

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

export function useLessons() {
  const context = useContext(LessonsContext);
  if (!context) {
    throw new Error("useLessons must be used inside LessonsProvider");
  }
  return context;
}
