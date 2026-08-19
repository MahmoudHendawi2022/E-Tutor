import { useEffect, useMemo, useRef, useState } from "react";

import { useSearchParams } from "react-router";

import {
  ArrowLeft,
  CheckCheck,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  UserRound,
  Video,
} from "lucide-react";

import { motion } from "motion/react";

import { useAuth } from "../../context/AuthContext";

import { useMessages } from "../../context/MessagesContext";

/*
  Reuse the existing chat UI.
*/

import "../Messages/messages.css";

import "./tutorMessages.css";

const pageVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.06,

      delayChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      type: "tween",

      duration: 0.3,

      ease: "easeOut",
    },
  },
};

/* =====================================
   FALLBACK STUDENT
===================================== */

function getConversationStudent(conversation, getAccountById) {
  const student = getAccountById(conversation.studentId);

  if (student) {
    return student;
  }

  return {
    id: conversation.studentId,

    fullName: `Student #${conversation.studentId}`,

    initials: "ST",

    email: "",
  };
}

/* =====================================
   COMPONENT
===================================== */

function TutorMessages() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { user, getAccountById } = useAuth();

  const {
    conversations: conversationState,

    markConversationRead,

    sendMessage: sendConversationMessage,

    getUnreadForTutor,
  } = useMessages();

  const [selectedId, setSelectedId] = useState(null);

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");

  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const chatEndRef = useRef(null);

  /* =====================================
     CURRENT TUTOR
  ===================================== */

  const tutorId = Number(user?.tutorId);

  /* =====================================
     TUTOR CONVERSATIONS
  ===================================== */

  const conversations = useMemo(() => {
    return conversationState
      .filter((conversation) => Number(conversation.tutorId) === tutorId)
      .map((conversation) => ({
        ...conversation,

        student: getConversationStudent(conversation, getAccountById),
      }));
  }, [conversationState, tutorId, getAccountById]);

  /* =====================================
     TUTOR UNREAD
  ===================================== */

  const totalUnread = getUnreadForTutor(tutorId);

  /* =====================================
     STUDENT PARAM
  ===================================== */

  const studentParam = searchParams.get("student");

  /* =====================================
     OPEN STUDENT FROM URL
  ===================================== */

  useEffect(() => {
    if (!studentParam || !tutorId) {
      return;
    }

    const studentId = Number(studentParam);

    const targetConversation = conversationState.find(
      (conversation) =>
        Number(conversation.tutorId) === tutorId &&
        Number(conversation.studentId) === studentId,
    );

    if (!targetConversation) {
      return;
    }

    setSelectedId(targetConversation.id);

    setMobileChatOpen(true);

    markConversationRead(
      targetConversation.id,

      "tutor",
    );
  }, [studentParam, tutorId, conversationState, markConversationRead]);

  /* =====================================
     DEFAULT SELECTION
  ===================================== */

  useEffect(() => {
    if (studentParam) {
      return;
    }

    if (conversations.length === 0) {
      setSelectedId(null);

      return;
    }

    const selectedExists = conversations.some(
      (conversation) => Number(conversation.id) === Number(selectedId),
    );

    if (selectedExists) {
      return;
    }

    setSelectedId(conversations[0].id);
  }, [conversations, selectedId, studentParam]);

  /* =====================================
     SELECTED CONVERSATION
  ===================================== */

  const selectedConversation = conversations.find(
    (conversation) => Number(conversation.id) === Number(selectedId),
  );

  /* =====================================
     MARK OPEN CHAT READ
  ===================================== */

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const isMobile = window.innerWidth <= 650;

    if (isMobile && !mobileChatOpen) {
      return;
    }

    markConversationRead(
      selectedId,

      "tutor",
    );
  }, [selectedId, mobileChatOpen, markConversationRead]);

  /* =====================================
     SCROLL TO LAST MESSAGE
  ===================================== */

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",

      block: "end",
    });
  }, [selectedId, selectedConversation?.messages.length]);

  /* =====================================
     SEARCH
  ===================================== */

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const student = conversation.student;

      const lastMessage =
        conversation.messages[conversation.messages.length - 1];

      return (
        student.fullName?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        lastMessage?.text?.toLowerCase().includes(query)
      );
    });
  }, [conversations, search]);

  /* =====================================
     SELECT CONVERSATION
  ===================================== */

  const selectConversation = (conversation) => {
    setSelectedId(conversation.id);

    setMobileChatOpen(true);

    setSearchParams({
      student: String(conversation.studentId),
    });

    markConversationRead(
      conversation.id,

      "tutor",
    );
  };

  /* =====================================
     SEND
  ===================================== */

  const sendMessage = () => {
    const text = message.trim();

    if (!text || !selectedId) {
      return;
    }

    sendConversationMessage(
      selectedId,

      text,

      "tutor",
    );

    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    sendMessage();
  };

  return (
    <motion.main
      className="messages-page tutor-messages-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <motion.div className="messages-page-header" variants={itemVariants}>
        <div>
          <span>COMMUNICATION</span>

          <h1>Messages</h1>

          <p>
            Stay connected with your students.
            {totalUnread > 0 && (
              <>
                {" "}
                You have <strong>{totalUnread}</strong> unread{" "}
                {totalUnread === 1 ? "message" : "messages"}.
              </>
            )}
          </p>
        </div>
      </motion.div>

      {/* =====================================
          CHAT APP
      ===================================== */}

      <motion.section className="messages-shell" variants={itemVariants}>
        {/* =====================================
            CONVERSATIONS
        ===================================== */}

        <aside
          className={`messages-sidebar ${
            mobileChatOpen ? "mobile-hidden" : ""
          }`}
        >
          <div className="messages-sidebar-header">
            <div>
              <h2>Conversations</h2>

              <span>
                {conversations.length}{" "}
                {conversations.length === 1 ? "student" : "students"}
              </span>
            </div>
          </div>

          {/* SEARCH */}

          <div className="messages-search">
            <Search size={15} />

            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {/* LIST */}

          <div className="conversation-list">
            {filteredConversations.map((conversation) => {
              const student = conversation.student;

              const lastMessage =
                conversation.messages[conversation.messages.length - 1];

              const active = Number(selectedId) === Number(conversation.id);

              const unread = Number(conversation.unreadTutor || 0);

              return (
                <button
                  key={conversation.id}
                  type="button"
                  className={`conversation-item ${active ? "active" : ""}`}
                  onClick={() => selectConversation(conversation)}
                >
                  {/* AVATAR */}

                  <div className="conversation-avatar">
                    <div className="tutor-message-avatar-fill">
                      {student.initials ? (
                        student.initials
                      ) : (
                        <UserRound size={16} />
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="conversation-content">
                    <div className="conversation-top">
                      <strong>{student.fullName}</strong>

                      <span>{lastMessage?.time}</span>
                    </div>

                    <div className="conversation-bottom">
                      <p>
                        {lastMessage?.sender === "tutor" && <>You: </>}

                        {lastMessage?.text || "No messages yet"}
                      </p>

                      {unread > 0 && (
                        <span className="conversation-unread">{unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="conversation-empty">No conversations found.</div>
            )}
          </div>
        </aside>

        {/* =====================================
            CHAT
        ===================================== */}

        {selectedConversation ? (
          <div
            className={`messages-chat ${mobileChatOpen ? "mobile-open" : ""}`}
          >
            {/* =====================================
                CHAT HEADER
            ===================================== */}

            <div className="chat-header">
              <div className="chat-header-left">
                <button
                  type="button"
                  className="chat-mobile-back"
                  onClick={() => setMobileChatOpen(false)}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="chat-avatar">
                  <div className="tutor-chat-avatar-fill">
                    {selectedConversation.student.initials || (
                      <UserRound size={16} />
                    )}
                  </div>
                </div>

                <div className="chat-person">
                  <strong>{selectedConversation.student.fullName}</strong>

                  <span>{selectedConversation.student.email || "Student"}</span>
                </div>
              </div>

              <div className="chat-header-actions">
                <button type="button" aria-label="Start video call">
                  <Video size={17} />
                </button>

                <button type="button" aria-label="More options">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* =====================================
                MESSAGES
            ===================================== */}

            <div className="chat-body">
              <div className="chat-day-divider">
                <span>Conversation</span>
              </div>

              {selectedConversation.messages.map((chatMessage) => {
                const mine = chatMessage.sender === "tutor";

                return (
                  <motion.div
                    key={chatMessage.id}
                    className={`chat-message-row ${mine ? "mine" : "theirs"}`}
                    initial={{
                      opacity: 0,
                      y: 4,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                  >
                    {/* STUDENT AVATAR */}

                    {!mine && (
                      <div className="tutor-chat-message-avatar">
                        {selectedConversation.student.initials || (
                          <UserRound size={13} />
                        )}
                      </div>
                    )}

                    <div className="chat-message-content">
                      <div className="chat-bubble">{chatMessage.text}</div>

                      <div className="chat-message-meta">
                        <span>{chatMessage.time}</span>

                        {mine && chatMessage.read && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <div ref={chatEndRef} />
            </div>

            {/* =====================================
                COMPOSER
            ===================================== */}

            <form className="chat-composer" onSubmit={handleSubmit}>
              <button
                type="button"
                className="chat-attach"
                aria-label="Attach file"
              >
                <Paperclip size={18} />
              </button>

              <div className="chat-input">
                <textarea
                  rows="1"
                  placeholder={`Message ${selectedConversation.student.fullName}...`}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();

                      sendMessage();
                    }
                  }}
                />
              </div>

              <motion.button
                type="submit"
                className="chat-send"
                disabled={!message.trim()}
                whileTap={
                  message.trim()
                    ? {
                        scale: 0.94,
                      }
                    : {}
                }
                aria-label="Send message"
              >
                <Send size={16} />
              </motion.button>
            </form>
          </div>
        ) : (
          <div className="messages-no-selection">
            Select a conversation to start messaging.
          </div>
        )}
      </motion.section>
    </motion.main>
  );
}

export default TutorMessages;
