import { storageService } from "../storage/storage.service";
import { lessons as defaultLessons } from "../../data/lessons";

const STORAGE_KEY = "etutor_lessons_v1";

function normalizeLesson(lesson) {
  return {
    ...lesson,
    studentId: Number(lesson.studentId ?? 1),
    tutorId: Number(lesson.tutorId),
  };
}

function cloneDefaultLessons() {
  return defaultLessons.map((lesson) => normalizeLesson(lesson));
}

export const lessonsService = {
  loadLessons() {
    const stored = storageService.getItem(STORAGE_KEY, null);
    if (!stored || !Array.isArray(stored)) {
      return cloneDefaultLessons();
    }
    return stored.map((lesson) => normalizeLesson(lesson));
  },

  saveLessons(lessons) {
    storageService.setItem(STORAGE_KEY, lessons);
  },

  normalizeLesson,

  getLessonStart(lesson) {
    if (!lesson?.date || !lesson?.time) {
      return null;
    }
    const date = new Date(`${lesson.date}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    const time = String(lesson.time).trim().toUpperCase();

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

    const twentyFourHourMatch = time.match(/^(\d{1,2}):(\d{2})$/);
    if (twentyFourHourMatch) {
      const hours = Number(twentyFourHourMatch[1]);
      const minutes = Number(twentyFourHourMatch[2]);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }

    return null;
  },

  getLessonEnd(lesson) {
    const start = this.getLessonStart(lesson);
    if (!start) {
      return null;
    }
    const duration = Number(lesson?.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
      return null;
    }
    return new Date(start.getTime() + duration * 60 * 1000);
  },

  formatReminderDate(date) {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  },

  formatReminderTime(date) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  },

  getTutorCompletionState(lessons, lessonId, tutorId, now = new Date()) {
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

    const lessonEnd = this.getLessonEnd(targetLesson);
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
  },

  cancelLesson(lessons, lessonId, reason) {
    const numericLessonId = Number(lessonId);
    const cleanReason = reason?.trim();
    if (!numericLessonId || !cleanReason) {
      return { success: false, list: lessons };
    }

    const targetLesson = lessons.find((lesson) => Number(lesson.id) === numericLessonId);
    if (!targetLesson || targetLesson.status !== "upcoming") {
      return { success: false, list: lessons };
    }

    const cancelledAt = new Date().toISOString();
    const list = lessons.map((lesson) =>
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
    );

    return { success: true, list, targetLesson, cancelledAt };
  },

  markLessonCompletedByTutor(lessons, lessonId, tutorId) {
    const numericLessonId = Number(lessonId);
    const numericTutorId = Number(tutorId);
    if (!numericLessonId || !numericTutorId) {
      return { success: false, list: lessons };
    }

    const completionState = this.getTutorCompletionState(lessons, numericLessonId, numericTutorId, new Date());
    if (!completionState.canComplete) {
      return { success: false, list: lessons };
    }

    const targetLesson = lessons.find((lesson) => Number(lesson.id) === numericLessonId);
    if (!targetLesson) {
      return { success: false, list: lessons };
    }

    const completedAt = new Date().toISOString();
    const list = lessons.map((lesson) =>
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
    );

    return { success: true, list, targetLesson, completedAt };
  },

  submitLessonReview(lessons, lessonId, reviewData) {
    const numericLessonId = Number(lessonId);
    if (!numericLessonId) {
      return { success: false, list: lessons };
    }

    const targetLesson = lessons.find((lesson) => Number(lesson.id) === numericLessonId);
    if (!targetLesson || targetLesson.status !== "completed" || targetLesson.reviewed) {
      return { success: false, list: lessons };
    }

    const rating = Number(reviewData?.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return { success: false, list: lessons };
    }

    const review = reviewData?.review?.trim() || "";
    const reviewedAt = reviewData?.reviewedAt || new Date().toISOString();

    const list = lessons.map((lesson) =>
      Number(lesson.id) === numericLessonId
        ? { ...lesson, rating, review, reviewed: true, reviewedAt }
        : lesson
    );

    return { success: true, list, targetLesson };
  }
};
