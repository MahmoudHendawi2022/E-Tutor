import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { messagesService } from "../services/messages/messages.service";

const MessagesContext = createContext(null);

export function MessagesProvider({ children }) {
  const [conversations, setConversations] = useState(() => messagesService.getInitialConversations());

  useEffect(() => {
    messagesService.saveConversations(conversations);
  }, [conversations]);

  const createConversation = useCallback((tutorId, studentId = 1) => {
    setConversations((current) => {
      const res = messagesService.createConversation(current, tutorId, studentId);
      return res.list;
    });
  }, []);

  const markConversationRead = useCallback(
    (conversationId, viewer = "student") => {
      setConversations((current) => {
        const res = messagesService.markConversationRead(current, conversationId, viewer);
        return res.changed ? res.list : current;
      });
    },
    [],
  );

  const sendMessage = useCallback(
    (conversationId, text, sender = "student") => {
      let sent = false;
      setConversations((current) => {
        const res = messagesService.sendMessage(current, conversationId, text, sender);
        sent = res.success;
        return res.list;
      });
      return sent;
    },
    [],
  );

  const receiveTutorMessage = useCallback(
    (tutorId, text, studentId = 1) => {
      let received = false;
      setConversations((current) => {
        const res = messagesService.receiveTutorMessage(current, tutorId, text, studentId);
        received = res.success;
        return res.list;
      });
      return received;
    },
    [],
  );

  const getConversationById = useCallback(
    (conversationId) => {
      return conversations.find(
        (conversation) => Number(conversation.id) === Number(conversationId),
      );
    },
    [conversations],
  );

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

  const getConversationsByTutorId = useCallback(
    (tutorId) => {
      return conversations.filter(
        (conversation) => Number(conversation.tutorId) === Number(tutorId),
      );
    },
    [conversations],
  );

  const getConversationsByStudentId = useCallback(
    (studentId) => {
      return conversations.filter(
        (conversation) => Number(conversation.studentId) === Number(studentId),
      );
    },
    [conversations],
  );

  const totalUnreadStudent = useMemo(() => {
    return conversations.reduce(
      (total, conversation) =>
        total + Number(conversation.unreadStudent ?? conversation.unread ?? 0),
      0,
    );
  }, [conversations]);

  const totalUnread = totalUnreadStudent;

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

export function useMessages() {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used inside MessagesProvider");
  }
  return context;
}
