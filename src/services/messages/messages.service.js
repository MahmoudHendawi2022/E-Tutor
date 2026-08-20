import { storageService } from "../storage/storage.service";
import { conversations as defaultConversations } from "../../data/conversations";

const STORAGE_KEY = "etutor_conversations_v1";

function normalizeMessage(message) {
  const sender = message.sender === "tutor" ? "tutor" : "student";

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
    read: sender === "student" ? readByTutor : readByStudent,
  };
}

function normalizeConversation(conversation) {
  const messages = Array.isArray(conversation.messages)
    ? conversation.messages.map(normalizeMessage)
    : [];

  const studentId = Number(conversation.studentId ?? 1);
  const tutorId = Number(conversation.tutorId);

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
    unread: unreadStudent,
    messages,
  };
}

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

function formatMessageTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createMessageId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function createConversationId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export const messagesService = {
  getInitialConversations() {
    const stored = storageService.getItem(STORAGE_KEY, null);
    if (!stored || !Array.isArray(stored)) {
      return cloneConversations(defaultConversations);
    }
    return stored.map(normalizeConversation);
  },

  saveConversations(conversations) {
    storageService.setItem(STORAGE_KEY, conversations);
  },

  createConversation(conversations, tutorId, studentId = 1) {
    const numericTutorId = Number(tutorId);
    const numericStudentId = Number(studentId);

    if (!numericTutorId || !numericStudentId) {
      return { success: false, list: conversations };
    }

    const exists = conversations.some(
      (conversation) =>
        Number(conversation.tutorId) === numericTutorId &&
        Number(conversation.studentId) === numericStudentId,
    );

    if (exists) {
      return { success: false, list: conversations };
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

    return { success: true, list: [newConversation, ...conversations] };
  },

  markConversationRead(conversations, conversationId, viewer = "student") {
    const numericConversationId = Number(conversationId);
    const viewerRole = viewer === "tutor" ? "tutor" : "student";

    if (!numericConversationId) {
      return { changed: false, list: conversations };
    }

    let changed = false;
    const next = conversations.map((conversation) => {
      if (Number(conversation.id) !== numericConversationId) {
        return conversation;
      }

      if (viewerRole === "student") {
        const needsUpdate =
          Number(conversation.unreadStudent || conversation.unread || 0) > 0 ||
          conversation.messages.some(
            (message) => message.sender === "tutor" && !message.readByStudent,
          );

        if (!needsUpdate) {
          return conversation;
        }

        changed = true;
        return {
          ...conversation,
          unreadStudent: 0,
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
            read: true,
          };
        }),
      };
    });

    return { changed, list: changed ? next : conversations };
  },

  sendMessage(conversations, conversationId, text, sender = "student") {
    const cleanText = String(text ?? "").trim();
    if (!cleanText) {
      return { success: false, list: conversations };
    }

    const numericConversationId = Number(conversationId);
    if (!numericConversationId) {
      return { success: false, list: conversations };
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
      readByStudent: validSender === "student",
      readByTutor: validSender === "tutor",
      read: false,
    };

    const target = conversations.find(
      (conversation) => Number(conversation.id) === numericConversationId,
    );

    if (!target) {
      return { success: false, list: conversations };
    }

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
      unread: unreadStudent,
      updatedAt: createdAt,
      messages: [...target.messages, newMessage],
    };

    const list = [
      updatedConversation,
      ...conversations.filter(
        (conversation) => Number(conversation.id) !== numericConversationId,
      ),
    ];

    return { success: true, list };
  },

  receiveTutorMessage(conversations, tutorId, text, studentId = 1) {
    const numericTutorId = Number(tutorId);
    const numericStudentId = Number(studentId);
    const cleanText = String(text ?? "").trim();

    if (!numericTutorId || !numericStudentId || !cleanText) {
      return { success: false, list: conversations };
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

    const target = conversations.find(
      (conversation) =>
        Number(conversation.tutorId) === numericTutorId &&
        Number(conversation.studentId) === numericStudentId,
    );

    if (!target) {
      const updated = {
        id: createConversationId(),
        tutorId: numericTutorId,
        studentId: numericStudentId,
        unreadStudent: 1,
        unreadTutor: 0,
        unread: 1,
        createdAt,
        updatedAt: createdAt,
        messages: [newMessage],
      };
      return { success: true, list: [updated, ...conversations] };
    }

    const updated = {
      ...target,
      unreadStudent:
        Number(target.unreadStudent ?? target.unread ?? 0) + 1,
      unread: Number(target.unreadStudent ?? target.unread ?? 0) + 1,
      updatedAt: createdAt,
      messages: [...target.messages, newMessage],
    };

    const list = [
      updated,
      ...conversations.filter(
        (conversation) => Number(conversation.id) !== Number(target.id),
      ),
    ];

    return { success: true, list };
  }
};
