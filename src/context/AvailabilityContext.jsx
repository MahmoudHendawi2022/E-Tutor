import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AvailabilityContext = createContext(null);

const STORAGE_KEY = "etutor_availability_v1";

/* =====================================
   DAYS
===================================== */

export const availabilityDays = [
  {
    value: 0,
    key: "sunday",
    label: "Sunday",
  },

  {
    value: 1,
    key: "monday",
    label: "Monday",
  },

  {
    value: 2,
    key: "tuesday",
    label: "Tuesday",
  },

  {
    value: 3,
    key: "wednesday",
    label: "Wednesday",
  },

  {
    value: 4,
    key: "thursday",
    label: "Thursday",
  },

  {
    value: 5,
    key: "friday",
    label: "Friday",
  },

  {
    value: 6,
    key: "saturday",
    label: "Saturday",
  },
];

/* =====================================
   DEFAULT WEEK
===================================== */

function createDefaultWeek() {
  return {
    sunday: {
      enabled: false,
      ranges: [],
    },

    monday: {
      enabled: true,

      ranges: [
        {
          id: "monday-1",
          start: "09:00",
          end: "13:00",
        },

        {
          id: "monday-2",
          start: "15:00",
          end: "18:00",
        },
      ],
    },

    tuesday: {
      enabled: true,

      ranges: [
        {
          id: "tuesday-1",
          start: "10:00",
          end: "14:00",
        },
      ],
    },

    wednesday: {
      enabled: true,

      ranges: [
        {
          id: "wednesday-1",
          start: "09:00",
          end: "13:00",
        },

        {
          id: "wednesday-2",
          start: "15:00",
          end: "18:00",
        },
      ],
    },

    thursday: {
      enabled: true,

      ranges: [
        {
          id: "thursday-1",
          start: "10:00",
          end: "16:00",
        },
      ],
    },

    friday: {
      enabled: false,
      ranges: [],
    },

    saturday: {
      enabled: true,

      ranges: [
        {
          id: "saturday-1",
          start: "10:00",
          end: "14:00",
        },
      ],
    },
  };
}

/* =====================================
   DEFAULT DATA
===================================== */

function createDefaultAvailability() {
  return {
    /*
      Sarah Johnson demo tutor.
    */

    1: {
      tutorId: 1,

      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      slotInterval: 30,

      week: createDefaultWeek(),

      updatedAt: null,
    },
  };
}

/* =====================================
   INITIAL STATE
===================================== */

function getInitialAvailability() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return createDefaultAvailability();
    }

    const parsed = JSON.parse(stored);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return createDefaultAvailability();
    }

    return parsed;
  } catch (error) {
    console.error("Could not load tutor availability:", error);

    return createDefaultAvailability();
  }
}

/* =====================================
   EMPTY TUTOR AVAILABILITY
===================================== */

function createTutorAvailability(tutorId) {
  const week = {};

  availabilityDays.forEach((day) => {
    week[day.key] = {
      enabled: false,
      ranges: [],
    };
  });

  return {
    tutorId: Number(tutorId),

    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    slotInterval: 30,

    week,

    updatedAt: null,
  };
}

/* =====================================
   DAY KEY
===================================== */

export function getAvailabilityDayKey(date) {
  if (!(date instanceof Date)) {
    return null;
  }

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return (
    availabilityDays.find((day) => day.value === date.getDay())?.key || null
  );
}

/* =====================================
   TIME -> MINUTES
===================================== */

function timeToMinutes(value) {
  if (!value) {
    return null;
  }

  const [hours, minutes] = String(value).split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

/* =====================================
   MINUTES -> TIME
===================================== */

function minutesToTime(value) {
  const hours = Math.floor(value / 60);

  const minutes = value % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
}

/* =====================================
   LESSON START
===================================== */

function getLessonStartMinutes(lesson) {
  if (!lesson?.time) {
    return null;
  }

  const value = String(lesson.time).trim().toUpperCase();

  const twelveHour = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (twelveHour) {
    let hours = Number(twelveHour[1]);

    const minutes = Number(twelveHour[2]);

    const period = twelveHour[3];

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    return hours * 60 + minutes;
  }

  return timeToMinutes(value);
}

/* =====================================
   DATE KEY
===================================== */

function formatDateKey(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =====================================
   PROVIDER
===================================== */

export function AvailabilityProvider({ children }) {
  const [availability, setAvailability] = useState(getInitialAvailability);

  /* =====================================
     SAVE
  ===================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,

        JSON.stringify(availability),
      );
    } catch (error) {
      console.error("Could not save tutor availability:", error);
    }
  }, [availability]);

  /* =====================================
     ENSURE TUTOR
  ===================================== */

  const ensureTutor = useCallback((tutorId) => {
    const numericTutorId = Number(tutorId);

    if (!numericTutorId) {
      return;
    }

    setAvailability((current) => {
      if (current[numericTutorId]) {
        return current;
      }

      return {
        ...current,

        [numericTutorId]: createTutorAvailability(numericTutorId),
      };
    });
  }, []);

  /* =====================================
     GET TUTOR
  ===================================== */

  const getTutorAvailability = useCallback(
    (tutorId) => {
      const numericTutorId = Number(tutorId);

      return (
        availability[numericTutorId] || createTutorAvailability(numericTutorId)
      );
    },

    [availability],
  );

  /* =====================================
     TOGGLE DAY
  ===================================== */

  const setDayEnabled = useCallback((tutorId, dayKey, enabled) => {
    const numericTutorId = Number(tutorId);

    if (!numericTutorId || !dayKey) {
      return;
    }

    setAvailability((current) => {
      const tutor =
        current[numericTutorId] || createTutorAvailability(numericTutorId);

      const currentDay = tutor.week[dayKey] || {
        enabled: false,
        ranges: [],
      };

      return {
        ...current,

        [numericTutorId]: {
          ...tutor,

          updatedAt: new Date().toISOString(),

          week: {
            ...tutor.week,

            [dayKey]: {
              ...currentDay,

              enabled: Boolean(enabled),
            },
          },
        },
      };
    });
  }, []);

  /* =====================================
     ADD RANGE
  ===================================== */

  const addRange = useCallback((tutorId, dayKey) => {
    const numericTutorId = Number(tutorId);

    if (!numericTutorId || !dayKey) {
      return;
    }

    setAvailability((current) => {
      const tutor =
        current[numericTutorId] || createTutorAvailability(numericTutorId);

      const day = tutor.week[dayKey] || {
        enabled: true,
        ranges: [],
      };

      const newRange = {
        id: `${dayKey}-${Date.now()}`,

        start: "09:00",

        end: "12:00",
      };

      return {
        ...current,

        [numericTutorId]: {
          ...tutor,

          updatedAt: new Date().toISOString(),

          week: {
            ...tutor.week,

            [dayKey]: {
              ...day,

              enabled: true,

              ranges: [...day.ranges, newRange],
            },
          },
        },
      };
    });
  }, []);

  /* =====================================
     UPDATE RANGE
  ===================================== */

  const updateRange = useCallback((tutorId, dayKey, rangeId, updates) => {
    const numericTutorId = Number(tutorId);

    if (!numericTutorId || !dayKey || !rangeId) {
      return;
    }

    setAvailability((current) => {
      const tutor = current[numericTutorId];

      if (!tutor) {
        return current;
      }

      const day = tutor.week[dayKey];

      if (!day) {
        return current;
      }

      return {
        ...current,

        [numericTutorId]: {
          ...tutor,

          updatedAt: new Date().toISOString(),

          week: {
            ...tutor.week,

            [dayKey]: {
              ...day,

              ranges: day.ranges.map((range) =>
                range.id === rangeId
                  ? {
                      ...range,

                      ...updates,
                    }
                  : range,
              ),
            },
          },
        },
      };
    });
  }, []);

  /* =====================================
     REMOVE RANGE
  ===================================== */

  const removeRange = useCallback((tutorId, dayKey, rangeId) => {
    const numericTutorId = Number(tutorId);

    setAvailability((current) => {
      const tutor = current[numericTutorId];

      if (!tutor || !tutor.week[dayKey]) {
        return current;
      }

      const day = tutor.week[dayKey];

      return {
        ...current,

        [numericTutorId]: {
          ...tutor,

          updatedAt: new Date().toISOString(),

          week: {
            ...tutor.week,

            [dayKey]: {
              ...day,

              ranges: day.ranges.filter((range) => range.id !== rangeId),
            },
          },
        },
      };
    });
  }, []);

  /* =====================================
     TIMEZONE
  ===================================== */

  const setTutorTimezone = useCallback((tutorId, timezone) => {
    const numericTutorId = Number(tutorId);

    setAvailability((current) => {
      const tutor =
        current[numericTutorId] || createTutorAvailability(numericTutorId);

      return {
        ...current,

        [numericTutorId]: {
          ...tutor,

          timezone,

          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  /* =====================================
     AVAILABLE SLOTS

     lessons is passed in so already
     booked lessons are excluded.
  ===================================== */

  const getAvailableSlots = useCallback(
    ({ tutorId, date, duration = 60, lessons = [] }) => {
      const numericTutorId = Number(tutorId);

      if (
        !numericTutorId ||
        !(date instanceof Date) ||
        Number.isNaN(date.getTime())
      ) {
        return [];
      }

      const tutor = availability[numericTutorId];

      if (!tutor) {
        return [];
      }

      const dayKey = getAvailabilityDayKey(date);

      if (!dayKey) {
        return [];
      }

      const day = tutor.week[dayKey];

      if (!day?.enabled || !day.ranges?.length) {
        return [];
      }

      const interval = Number(tutor.slotInterval || 30);

      const lessonDuration = Number(duration);

      const dateKey = formatDateKey(date);

      /*
          Only bookings that still
          occupy this time.
        */

      const bookedLessons = lessons.filter(
        (lesson) =>
          Number(lesson.tutorId) === numericTutorId &&
          lesson.date === dateKey &&
          lesson.status === "upcoming",
      );

      const slots = [];

      day.ranges.forEach((range) => {
        const start = timeToMinutes(range.start);

        const end = timeToMinutes(range.end);

        if (start === null || end === null || start >= end) {
          return;
        }

        for (
          let slotStart = start;
          slotStart + lessonDuration <= end;
          slotStart += interval
        ) {
          const slotEnd = slotStart + lessonDuration;

          const hasConflict = bookedLessons.some((lesson) => {
            const bookedStart = getLessonStartMinutes(lesson);

            if (bookedStart === null) {
              return false;
            }

            const bookedEnd = bookedStart + Number(lesson.duration || 0);

            return slotStart < bookedEnd && slotEnd > bookedStart;
          });

          if (!hasConflict) {
            slots.push(minutesToTime(slotStart));
          }
        }
      });

      /*
          Prevent duplicates when
          availability ranges overlap.
        */

      return [...new Set(slots)].sort();
    },

    [availability],
  );

  /* =====================================
     VALUE
  ===================================== */

  const value = useMemo(
    () => ({
      availability,

      ensureTutor,

      getTutorAvailability,

      setDayEnabled,

      addRange,

      updateRange,

      removeRange,

      setTutorTimezone,

      getAvailableSlots,
    }),

    [
      availability,

      ensureTutor,

      getTutorAvailability,

      setDayEnabled,

      addRange,

      updateRange,

      removeRange,

      setTutorTimezone,

      getAvailableSlots,
    ],
  );

  return (
    <AvailabilityContext.Provider value={value}>
      {children}
    </AvailabilityContext.Provider>
  );
}

/* =====================================
   HOOK
===================================== */

export function useAvailability() {
  const context = useContext(AvailabilityContext);

  if (!context) {
    throw new Error("useAvailability must be used inside AvailabilityProvider");
  }

  return context;
}
