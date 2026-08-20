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
  }
};
