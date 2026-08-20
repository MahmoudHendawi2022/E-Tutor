import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { conversations as defaultConversations } from "../data/conversations";
import { storageService } from "../services/storage/storage.service";

const MessagesContext = createContext(null);

const STORAGE_KEY = "etutor_conversations_v1";

/* =====================================
   NORMALIZE MESSAGE
===================================== */

function normalizeMessage(message) {
  const sender = message.sender === "tutor" ? "tutor" : "student";

  /*
    Legacy `read` is converted
    to two-sided read state.
  */

  const readByStudent =
    sender === "student"
      ? true
      : Boolean(message.readByStudent ?? message.read ?? false);

  const readByTutor =
    sender === "tutor"
      ? true
      : Boolean(message.readByTutor ?? message.read ?? false);

  return {
    ...message,

    sender,

    readByStudent,

    readByTutor,

    /*
      Keep legacy property because
      Student Messages.jsx already
      uses chatMessage.read.

      `read` always means:
      has the recipient read it?
    */

    read: sender === "student" ? readByTutor : readByStudent,
  };
}

/* =====================================
   NORMALIZE CONVERSATION
===================================== */

function normalizeConversation(conversation) {
  const messages = Array.isArray(conversation.messages)
    ? conversation.messages.map(normalizeMessage)
    : [];

  /*
    Old conversations belonged
    to demo student #1.
  */

  const studentId = Number(conversation.studentId ?? 1);

  const tutorId = Number(conversation.tutorId);

  /*
    Legacy unread represented
    unread messages for student.
  */

  const unreadStudent = Number(
    conversation.unreadStudent ?? conversation.unread ?? 0,
  );

  const unreadTutor = Number(conversation.unreadTutor ?? 0);

  return {
    ...conversation,

    studentId,

    tutorId,

    unreadStudent,

    unreadTutor,

    /*
      Backwards compatibility
      with Student Messages.jsx
      and StudentLayout.
    */

    unread: unreadStudent,

    messages,
  };
}

/* =====================================
   CLONE
===================================== */

function cloneConversations(source) {
  return source.map((conversation) =>
    normalizeConversation({
      ...conversation,

      messages:
        conversation.messages?.map((message) => ({
          ...message,
        })) || [],
    }),
  );
}

/* =====================================
   INITIAL DATA
===================================== */

function getInitialConversations() {
  const stored = storageService.getItem(STORAGE_KEY, null);

  if (!stored || !Array.isArray(stored)) {
    return cloneConversations(defaultConversations);
  }

  return stored.map(normalizeConversation);
}

/* =====================================
   MESSAGE TIME
===================================== */

function formatMessageTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",

    minute: "2-digit",
  });
}

/* =====================================
   IDS
===================================== */

function createMessageId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function createConversationId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/* =====================================
   PROVIDER
===================================== */

export function MessagesProvider({ children }) {
  const [conversations, setConversations] = useState(getInitialConversations);

  /* =====================================
     SAVE
  ===================================== */

  useEffect(() => {
    storageService.setItem(STORAGE_KEY, conversations);
  }, [conversations]);

  /* =====================================
     CREATE CONVERSATION
  ===================================== */

  const createConversation = useCallback((tutorId, studentId = 1) => {
    const numericTutorId = Number(tutorId);

    const numericStudentId = Number(studentId);

    if (!numericTutorId || !numericStudentId) {
      return;
    }

    setConversations((current) => {
      /*
              Conversation is unique
              by student + tutor.
            */

      const exists = current.some(
        (conversation) =>
          Number(conversation.tutorId) === numericTutorId &&
          Number(conversation.studentId) === numericStudentId,
      );

      if (exists) {
        return current;
      }

      const createdAt = new Date().toISOString();

      const newConversation = {
        id: createConversationId(),

        tutorId: numericTutorId,

        studentId: numericStudentId,

        unreadStudent: 0,

        unreadTutor: 0,

        unread: 0,

        createdAt,

        updatedAt: createdAt,

        messages: [],
      };

      return [newConversation, ...current];
    });
  }, []);

  /* =====================================
     MARK CONVERSATION READ
  ===================================== */

  const markConversationRead = useCallback(
    (conversationId, viewer = "student") => {
      const numericConversationId = Number(conversationId);

      const viewerRole = viewer === "tutor" ? "tutor" : "student";

      if (!numericConversationId) {
        return;
      }

      setConversations((current) => {
        let changed = false;

        const next = current.map((conversation) => {
          if (Number(conversation.id) !== numericConversationId) {
            return conversation;
          }

          /* =====================================
                     STUDENT READS TUTOR MESSAGES
                  ===================================== */

          if (viewerRole === "student") {
            const needsUpdate =
              Number(conversation.unreadStudent || conversation.unread || 0) >
                0 ||
              conversation.messages.some(
                (message) =>
                  message.sender === "tutor" && !message.readByStudent,
              );

            if (!needsUpdate) {
              return conversation;
            }

            changed = true;

            return {
              ...conversation,

              unreadStudent: 0,

              /*
                        Legacy alias.
                      */

              unread: 0,

              messages: conversation.messages.map((message) => {
                if (message.sender !== "tutor") {
                  return message;
                }

                return {
                  ...message,

                  readByStudent: true,

                  read: true,
                };
              }),
            };
          }

          /* =====================================
                     TUTOR READS STUDENT MESSAGES
                  ===================================== */

          const needsUpdate =
            Number(conversation.unreadTutor || 0) > 0 ||
            conversation.messages.some(
              (message) => message.sender === "student" && !message.readByTutor,
            );

          if (!needsUpdate) {
            return conversation;
          }

          changed = true;

          return {
            ...conversation,

            unreadTutor: 0,

            messages: conversation.messages.map((message) => {
              if (message.sender !== "student") {
                return message;
              }

              return {
                ...message,

                readByTutor: true,

                /*
                              Student UI uses
                              this for ✓✓.
                            */

                read: true,
              };
            }),
          };
        });

        return changed ? next : current;
      });
    },
    [],
  );

  /* =====================================
     SEND MESSAGE
  ===================================== */

  const sendMessage = useCallback(
    (conversationId, text, sender = "student") => {
      const cleanText = String(text ?? "").trim();

      if (!cleanText) {
        return false;
      }

      const numericConversationId = Number(conversationId);

      if (!numericConversationId) {
        return false;
      }

      const validSender = sender === "tutor" ? "tutor" : "student";

      const now = new Date();

      const createdAt = now.toISOString();

      const newMessage = {
        id: createMessageId(),

        sender: validSender,

        text: cleanText,

        time: formatMessageTime(now),

        createdAt,

        /*
            Sender has seen
            their own message.
          */

        readByStudent: validSender === "student",

        readByTutor: validSender === "tutor",

        /*
            Recipient has NOT
            read it yet.
          */

        read: false,
      };

      let sent = false;

      setConversations((current) => {
        const target = current.find(
          (conversation) => Number(conversation.id) === numericConversationId,
        );

        if (!target) {
          return current;
        }

        sent = true;

        const previousUnreadStudent = Number(
          target.unreadStudent ?? target.unread ?? 0,
        );

        const previousUnreadTutor = Number(target.unreadTutor ?? 0);

        const unreadStudent =
          validSender === "tutor"
            ? previousUnreadStudent + 1
            : previousUnreadStudent;

        const unreadTutor =
          validSender === "student"
            ? previousUnreadTutor + 1
            : previousUnreadTutor;

        const updatedConversation = {
          ...target,

          unreadStudent,

          unreadTutor,

          /*
                Student-side
                backwards compatibility.
              */

          unread: unreadStudent,

          updatedAt: createdAt,

          messages: [...target.messages, newMessage],
        };

        return [
          updatedConversation,

          ...current.filter(
            (conversation) => Number(conversation.id) !== numericConversationId,
          ),
        ];
      });

      return sent;
    },
    [],
  );

  /* =====================================
     DEMO TUTOR REPLY

     Backwards-compatible helper used by
     the student Messages page. A real
     backend/WebSocket will replace this.
  ===================================== */

  const receiveTutorMessage = useCallback(
    (tutorId, text, studentId = 1) => {
      const numericTutorId = Number(tutorId);
      const numericStudentId = Number(studentId);
      const cleanText = String(text ?? "").trim();

      if (!numericTutorId || !numericStudentId || !cleanText) {
        return false;
      }

      const now = new Date();
      const createdAt = now.toISOString();

      const newMessage = {
        id: createMessageId(),
        sender: "tutor",
        text: cleanText,
        time: formatMessageTime(now),
        createdAt,
        readByStudent: false,
        readByTutor: true,
        read: false,
      };

      setConversations((current) => {
        const target = current.find(
          (conversation) =>
            Number(conversation.tutorId) === numericTutorId &&
            Number(conversation.studentId) === numericStudentId,
        );

        if (!target) {
          return [
            {
              id: createConversationId(),
              tutorId: numericTutorId,
              studentId: numericStudentId,
              unreadStudent: 1,
              unreadTutor: 0,
              unread: 1,
              createdAt,
              updatedAt: createdAt,
              messages: [newMessage],
            },
            ...current,
          ];
        }

        const updated = {
          ...target,
          unreadStudent:
            Number(target.unreadStudent ?? target.unread ?? 0) + 1,
          unread: Number(target.unreadStudent ?? target.unread ?? 0) + 1,
          updatedAt: createdAt,
          messages: [...target.messages, newMessage],
        };

        return [
          updated,
          ...current.filter(
            (conversation) => Number(conversation.id) !== Number(target.id),
          ),
        ];
      });

      return true;
    },
    [],
  );

  /* =====================================
     GET CONVERSATION BY ID
  ===================================== */

  const getConversationById = useCallback(
    (conversationId) => {
      return conversations.find(
        (conversation) => Number(conversation.id) === Number(conversationId),
      );
    },

    [conversations],
  );

  /* =====================================
     GET CONVERSATION
     STUDENT + TUTOR
  ===================================== */

  const getConversationByTutorId = useCallback(
    (tutorId, studentId = null) => {
      return conversations.find((conversation) => {
        const tutorMatches = Number(conversation.tutorId) === Number(tutorId);

        if (studentId === null || studentId === undefined) {
          return tutorMatches;
        }

        return (
          tutorMatches && Number(conversation.studentId) === Number(studentId)
        );
      });
    },

    [conversations],
  );

  /* =====================================
     CONVERSATIONS BY TUTOR
  ===================================== */

  const getConversationsByTutorId = useCallback(
    (tutorId) => {
      return conversations.filter(
        (conversation) => Number(conversation.tutorId) === Number(tutorId),
      );
    },

    [conversations],
  );

  /* =====================================
     CONVERSATIONS BY STUDENT
  ===================================== */

  const getConversationsByStudentId = useCallback(
    (studentId) => {
      return conversations.filter(
        (conversation) => Number(conversation.studentId) === Number(studentId),
      );
    },

    [conversations],
  );

  /* =====================================
     STUDENT UNREAD
  ===================================== */

  const totalUnreadStudent = useMemo(() => {
    return conversations.reduce(
      (total, conversation) =>
        total + Number(conversation.unreadStudent ?? conversation.unread ?? 0),

      0,
    );
  }, [conversations]);

  /* =====================================
     LEGACY STUDENT UNREAD

     StudentLayout already uses:
     totalUnread
  ===================================== */

  const totalUnread = totalUnreadStudent;

  /* =====================================
     UNREAD FOR STUDENT
  ===================================== */

  const getUnreadForStudent = useCallback(
    (studentId) => {
      return conversations
        .filter(
          (conversation) =>
            Number(conversation.studentId) === Number(studentId),
        )
        .reduce(
          (total, conversation) =>
            total +
            Number(conversation.unreadStudent ?? conversation.unread ?? 0),

          0,
        );
    },

    [conversations],
  );

  /* =====================================
     UNREAD FOR TUTOR
  ===================================== */

  const getUnreadForTutor = useCallback(
    (tutorId) => {
      return conversations
        .filter(
          (conversation) => Number(conversation.tutorId) === Number(tutorId),
        )
        .reduce(
          (total, conversation) =>
            total + Number(conversation.unreadTutor || 0),

          0,
        );
    },

    [conversations],
  );

  /* =====================================
     CONTEXT
  ===================================== */

  return (
    <MessagesContext.Provider
      value={{
        conversations,

        totalUnread,

        totalUnreadStudent,

        createConversation,

        markConversationRead,

        sendMessage,

        receiveTutorMessage,

        getConversationById,

        getConversationByTutorId,

        getConversationsByTutorId,

        getConversationsByStudentId,

        getUnreadForStudent,

        getUnreadForTutor,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

/* =====================================
   HOOK
===================================== */

export function useMessages() {
  const context = useContext(MessagesContext);

  if (!context) {
    throw new Error("useMessages must be used inside MessagesProvider");
  }

  return context;
}
