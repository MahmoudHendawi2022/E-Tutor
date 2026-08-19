export const lessons = [
  {
    id: 1,

    tutorId: 1,

    status: "upcoming",

    subject: "English Speaking",

    date: "2026-08-20",

    time: "10:00 AM",

    duration: 60,

    bookingId: "ET-582941",

    price: 18,

    meetingUrl: "https://meet.example.com/et-582941",

    canJoin: true,

    reviewed: false,
  },

  {
    id: 2,

    tutorId: 2,

    status: "upcoming",

    subject: "Mathematics",

    date: "2026-08-23",

    time: "04:30 PM",

    duration: 60,

    bookingId: "ET-740218",

    price: 22,

    meetingUrl: "https://meet.example.com/et-740218",

    canJoin: false,

    reviewed: false,
  },

  {
    id: 3,

    tutorId: 3,

    status: "upcoming",

    subject: "React Fundamentals",

    date: "2026-08-28",

    time: "07:00 PM",

    duration: 90,

    bookingId: "ET-185302",

    price: 36,

    meetingUrl: "https://meet.example.com/et-185302",

    canJoin: false,

    reviewed: false,
  },

  {
    id: 4,

    tutorId: 1,

    status: "completed",

    subject: "English Grammar",

    date: "2026-08-15",

    time: "11:30 AM",

    duration: 60,

    bookingId: "ET-441850",

    price: 18,

    canJoin: false,

    reviewed: false,

    notes:
      "Great progress today. Continue practicing conversational English for at least 15 minutes each day.",
  },

  {
    id: 5,

    tutorId: 2,

    status: "completed",

    subject: "Algebra",

    date: "2026-08-11",

    time: "02:30 PM",

    duration: 60,

    bookingId: "ET-308911",

    price: 22,

    canJoin: false,

    reviewed: true,

    notes:
      "Good work with algebraic equations. Continue practicing word problems before the next session.",
  },

  {
    id: 6,

    tutorId: 3,

    status: "completed",

    subject: "JavaScript Basics",

    date: "2026-08-05",

    time: "06:00 PM",

    duration: 90,

    bookingId: "ET-932610",

    price: 36,

    canJoin: false,

    reviewed: false,

    notes:
      "Good understanding of JavaScript fundamentals. Next step is practicing array methods and component logic.",
  },

  {
    id: 7,

    tutorId: 4,

    status: "cancelled",

    subject: "Physics",

    date: "2026-07-30",

    time: "03:00 PM",

    duration: 60,

    bookingId: "ET-671203",

    price: 20,

    canJoin: false,

    reviewed: false,

    cancelledBy: "You",

    cancellationReason: "Schedule conflict",
  },
];

export const getLessonById = (lessonId) => {
  return lessons.find((lesson) => lesson.id === Number(lessonId));
};

export const getLessonsByTutorId = (tutorId) => {
  return lessons.filter((lesson) => lesson.tutorId === Number(tutorId));
};

export const getUpcomingLessons = () => {
  return lessons.filter((lesson) => lesson.status === "upcoming");
};

export const getCompletedLessons = () => {
  return lessons.filter((lesson) => lesson.status === "completed");
};
