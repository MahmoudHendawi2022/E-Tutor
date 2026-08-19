export const notifications = [
  {
    id: 1,

    type: "message",

    title: "New message",

    text: "Sarah Johnson sent you a new message.",

    to: "/dashboard/messages?tutor=1",

    createdAt: "2026-08-18T14:25:00.000Z",

    read: false,
  },

  {
    id: 2,

    type: "lesson",

    title: "Lesson reminder",

    text: "Your English Speaking lesson is coming up soon.",

    to: "/dashboard/lessons/1",

    createdAt: "2026-08-18T12:10:00.000Z",

    read: false,
  },

  {
    id: 3,

    type: "booking",

    title: "Booking confirmed",

    text: "Your Mathematics lesson has been confirmed.",

    to: "/dashboard/lessons/2",

    createdAt: "2026-08-17T17:30:00.000Z",

    read: true,
  },

  {
    id: 4,

    type: "review",

    title: "Review submitted",

    text: "Thanks for reviewing your lesson with Sarah Johnson.",

    to: "/dashboard/lessons",

    createdAt: "2026-08-16T09:15:00.000Z",

    read: true,
  },
];
