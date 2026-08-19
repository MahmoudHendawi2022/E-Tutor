/* =====================================
   CURRENT DEMO STUDENT
===================================== */

export const student = {
  id: 1,

  firstName: "John",
  lastName: "Doe",

  fullName: "John Doe",
  initials: "JD",

  role: "Student",

  email: "student@etutor.com",

  phone: "+1 555 014 8291",

  country: "United States",

  language: "English",

  headline: "Student learning English, Mathematics and Programming",

  bio: "I'm focused on improving my communication skills and building stronger technical knowledge.",

  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

/* =====================================
   STUDENTS

   Front-end demo only.

   Later these records will come
   from the backend/database.
===================================== */

export const students = [student];

/* =====================================
   GET STUDENT BY ID
===================================== */

export const getStudentById = (studentId) => {
  return students.find((item) => Number(item.id) === Number(studentId));
};

/* =====================================
   STUDENT ↔ TUTOR RELATIONS
===================================== */

export const studentTutorRelations = [
  {
    tutorId: 1,

    active: true,

    lessonsCount: 8,

    lastLesson: "2026-08-15",

    nextLessonId: 1,

    progress: 72,
  },

  {
    tutorId: 2,

    active: true,

    lessonsCount: 4,

    lastLesson: "2026-08-11",

    nextLessonId: 2,

    progress: 48,
  },

  {
    tutorId: 3,

    active: true,

    lessonsCount: 2,

    lastLesson: "2026-08-05",

    nextLessonId: 3,

    progress: 30,
  },

  {
    tutorId: 4,

    active: false,

    lessonsCount: 3,

    lastLesson: "2026-07-30",

    nextLessonId: null,

    progress: 100,
  },
];

/* =====================================
   SAVED TUTORS
===================================== */

export const savedTutorIds = [1, 2, 3, 4];
