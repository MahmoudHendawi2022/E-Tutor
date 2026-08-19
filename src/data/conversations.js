export const conversations = [
  {
    id: 1,

    tutorId: 1,

    unread: 2,

    messages: [
      {
        id: 1,

        sender: "tutor",

        text: "Hi John! I reviewed your speaking exercises from our last lesson.",

        time: "09:42 AM",

        read: true,
      },

      {
        id: 2,

        sender: "student",

        text: "Great, thank you! Was there anything specific I should focus on?",

        time: "09:45 AM",

        read: true,
      },

      {
        id: 3,

        sender: "tutor",

        text: "Your fluency is improving. I’d focus a little more on pronunciation and speaking without pausing too often.",

        time: "09:48 AM",

        read: true,
      },

      {
        id: 4,

        sender: "tutor",

        text: "I’ll prepare a short exercise for our next lesson.",

        time: "09:49 AM",

        read: false,
      },
    ],
  },

  {
    id: 2,

    tutorId: 2,

    unread: 0,

    messages: [
      {
        id: 1,

        sender: "student",

        text: "Hi Daniel, should I complete chapter 6 before our lesson?",

        time: "Yesterday",

        read: true,
      },

      {
        id: 2,

        sender: "tutor",

        text: "Yes, if you have time. Focus especially on questions 5 through 12.",

        time: "Yesterday",

        read: true,
      },
    ],
  },

  {
    id: 3,

    tutorId: 3,

    unread: 0,

    messages: [
      {
        id: 1,

        sender: "tutor",

        text: "I sent you the React practice project we talked about.",

        time: "Mon",

        read: true,
      },

      {
        id: 2,

        sender: "student",

        text: "Perfect. I’ll start working on it tonight.",

        time: "Mon",

        read: true,
      },
    ],
  },

  {
    id: 4,

    tutorId: 4,

    unread: 0,

    messages: [
      {
        id: 1,

        sender: "tutor",

        text: "Thanks for letting me know. We can schedule another lesson whenever you're ready.",

        time: "Aug 12",

        read: true,
      },
    ],
  },
];

export const getConversationById = (conversationId) => {
  return conversations.find(
    (conversation) => conversation.id === Number(conversationId),
  );
};

export const getConversationByTutorId = (tutorId) => {
  return conversations.find(
    (conversation) => conversation.tutorId === Number(tutorId),
  );
};
