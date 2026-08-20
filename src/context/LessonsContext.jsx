import { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  const addLesson = useCallback((newLesson) => {
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
  }, []);

  const updateLesson = useCallback((lessonId, updates) => {
    const numericLessonId = Number(lessonId);
    setLessons((current) =>
      current.map((lesson) =>
        Number(lesson.id) === numericLessonId
          ? lessonsService.normalizeLesson({ ...lesson, ...updates })
          : lesson
      )
    );
  }, []);

  const cancelLesson = useCallback((lessonId, reason) => {
    let res;
    setLessons((current) => {
      res = lessonsService.cancelLesson(current, lessonId, reason);
      return res.success ? res.list : current;
    });

    if (res && res.success) {
      removeNotificationsByKeyPrefix(`lesson-reminder-${Number(lessonId)}-`);
      const tutor = getTutorById(res.targetLesson.tutorId);
      addNotification({
        type: "lesson",
        title: "Lesson cancelled",
        text: tutor
          ? `Your ${res.targetLesson.subject} lesson with ${tutor.name} has been cancelled.`
          : `Your ${res.targetLesson.subject} lesson has been cancelled.`,
        to: `/dashboard/lessons/${Number(lessonId)}`,
      });
      return true;
    }
    return false;
  }, [getTutorById, addNotification, removeNotificationsByKeyPrefix]);

  const getTutorCompletionState = useCallback((lessonId, tutorId, now = new Date()) => {
    return lessonsService.getTutorCompletionState(lessons, lessonId, tutorId, now);
  }, [lessons]);

  const markLessonCompletedByTutor = useCallback((lessonId, tutorId) => {
    let res;
    setLessons((current) => {
      res = lessonsService.markLessonCompletedByTutor(current, lessonId, tutorId);
      return res.success ? res.list : current;
    });

    if (res && res.success) {
      removeNotificationsByKeyPrefix(`lesson-reminder-${Number(lessonId)}-`);
      const tutor = getTutorById(tutorId);
      addNotification({
        key: `lesson-completed-${Number(lessonId)}`,
        type: "lesson",
        title: "Lesson completed",
        text: tutor
          ? `Your ${res.targetLesson.subject} lesson with ${tutor.name} has been marked as completed. You can now leave a review.`
          : `Your ${res.targetLesson.subject} lesson has been marked as completed. You can now leave a review.`,
        to: `/dashboard/lessons/${Number(lessonId)}`,
      });
      return true;
    }
    return false;
  }, [getTutorById, addNotification, removeNotificationsByKeyPrefix]);

  const submitLessonReview = useCallback((lessonId, reviewData) => {
    let res;
    setLessons((current) => {
      res = lessonsService.submitLessonReview(current, lessonId, reviewData);
      return res.success ? res.list : current;
    });

    if (res && res.success) {
      const tutor = getTutorById(res.targetLesson.tutorId);
      addNotification({
        key: `lesson-review-${Number(lessonId)}`,
        type: "review",
        title: "Review submitted",
        text: tutor
          ? `Your review for your ${res.targetLesson.subject} lesson with ${tutor.name} was submitted successfully.`
          : `Your review for your ${res.targetLesson.subject} lesson was submitted successfully.`,
        to: `/dashboard/lessons/${Number(lessonId)}`,
      });
      return true;
    }
    return false;
  }, [getTutorById, addNotification]);

  const removeLesson = useCallback((lessonId) => {
    const numericLessonId = Number(lessonId);
    removeNotificationsByKeyPrefix(`lesson-reminder-${numericLessonId}-`);
    setLessons((current) => current.filter((lesson) => Number(lesson.id) !== numericLessonId));
  }, [removeNotificationsByKeyPrefix]);

  const getLessonById = useCallback((lessonId) => {
    return lessons.find((lesson) => Number(lesson.id) === Number(lessonId));
  }, [lessons]);

  const getLessonsByTutorId = useCallback((tutorId) => {
    return lessons.filter((lesson) => Number(lesson.tutorId) === Number(tutorId));
  }, [lessons]);

  const getLessonsByStudentId = useCallback((studentId) => {
    return lessons.filter((lesson) => Number(lesson.studentId) === Number(studentId));
  }, [lessons]);

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
