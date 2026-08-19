import { useEffect, useMemo, useRef, useState } from "react";

import { useSearchParams } from "react-router";

import {
  ArrowLeft,
  CheckCheck,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Video,
} from "lucide-react";

import { motion } from "motion/react";

import { useMessages } from "../../context/MessagesContext";

import { useAuth } from "../../context/AuthContext";

import { useTutors } from "../../context/TutorsContext";

import "./messages.css";

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

function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useAuth();

  const { getTutorById } = useTutors();

  const {
    conversations: allConversations,

    createConversation,

    markConversationRead,

    sendMessage: sendConversationMessage,

    receiveTutorMessage,

    getUnreadForStudent,
  } = useMessages();

  const conversationState = useMemo(
    () =>
      allConversations.filter(
        (conversation) => Number(conversation.studentId) === Number(user?.id),
      ),
    [allConversations, user?.id],
  );

  const totalUnread = getUnreadForStudent(user?.id);

  const [selectedId, setSelectedId] = useState(
    conversationState[0]?.id ?? null,
  );

  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");

  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const chatEndRef = useRef(null);

  /* =====================================
     JOIN CONVERSATION + TUTOR
  ===================================== */

  const conversations = useMemo(() => {
    return conversationState
      .map((conversation) => {
        const tutor = getTutorById(conversation.tutorId);

        if (!tutor) {
          return null;
        }

        return {
          ...conversation,
          tutor,
        };
      })
      .filter(Boolean);
  }, [conversationState, getTutorById]);

  /* =====================================
     OPEN TUTOR FROM URL
  ===================================== */

  const tutorParam = searchParams.get("tutor");

  useEffect(() => {
    if (!tutorParam) {
      return;
    }

    const tutorId = Number(tutorParam);

    if (!getTutorById(tutorId)) {
      return;
    }

    const targetConversation = conversationState.find(
      (conversation) => conversation.tutorId === tutorId,
    );

    /*
      لو ضغطنا Message tutor
      والمدرس مفيش معاه محادثة،
      ننشئ Conversation جديدة.
    */

    if (!targetConversation) {
      createConversation(tutorId, user?.id);

      return;
    }

    setSelectedId(targetConversation.id);

    setMobileChatOpen(true);

    markConversationRead(targetConversation.id);
  }, [
    tutorParam,
    conversationState,
    createConversation,
    markConversationRead,
    getTutorById,
    user?.id,
  ]);

  /* =====================================
     SELECTED CONVERSATION
  ===================================== */

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId,
  );

  /*
    لو Selected Conversation اختفت
    نرجع لأول Conversation.
  */

  useEffect(() => {
    if (tutorParam) {
      return;
    }

    const selectedStillExists = conversationState.some(
      (conversation) => conversation.id === selectedId,
    );

    if (selectedStillExists) {
      return;
    }

    setSelectedId(conversationState[0]?.id ?? null);
  }, [conversationState, selectedId, tutorParam]);

  /* =====================================
     AUTO SCROLL
  ===================================== */

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [selectedId, selectedConversation?.messages.length]);

  /* =====================================
     MARK ACTIVE CHAT AS READ
  ===================================== */

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const isMobile = window.innerWidth <= 650;

    if (isMobile && !mobileChatOpen) {
      return;
    }

    markConversationRead(selectedId);
  }, [
    selectedId,

    mobileChatOpen,

    selectedConversation?.messages.length,

    selectedConversation?.unread,

    markConversationRead,
  ]);

  /* =====================================
     SEARCH
  ===================================== */

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const tutor = conversation.tutor;

      const lastMessage =
        conversation.messages[conversation.messages.length - 1];

      return (
        tutor.name.toLowerCase().includes(query) ||
        tutor.title.toLowerCase().includes(query) ||
        tutor.subject.toLowerCase().includes(query) ||
        lastMessage?.text.toLowerCase().includes(query)
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
      tutor: String(conversation.tutorId),
    });

    markConversationRead(conversation.id);
  };

  /* =====================================
     SEND MESSAGE
  ===================================== */

  const sendMessage = () => {
    const text = message.trim();

    if (!text || !selectedId || !selectedConversation) {
      return;
    }

    const tutorId = selectedConversation.tutorId;

    sendConversationMessage(selectedId, text, "student");

    setMessage("");

    /*
    DEMO ONLY

    هنشيل الجزء ده لما نربط
    Backend / WebSocket حقيقي.
  */

    window.setTimeout(() => {
      receiveTutorMessage(
        tutorId,
        "Thanks for your message! I’ve seen it and I’ll get back to you shortly.",
        user?.id,
      );
    }, 4000);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    sendMessage();
  };

  return (
    <motion.main
      className="messages-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <motion.div className="messages-page-header" variants={itemVariants}>
        <div>
          <span>COMMUNICATION</span>

          <h1>Messages</h1>

          <p>
            Stay connected with your tutors.
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
          {/* HEADER */}

          <div className="messages-sidebar-header">
            <div>
              <h2>Conversations</h2>

              <span>
                {conversations.length}{" "}
                {conversations.length === 1 ? "tutor" : "tutors"}
              </span>
            </div>
          </div>

          {/* SEARCH */}

          <div className="messages-search">
            <Search size={15} />

            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {/* LIST */}

          <div className="conversation-list">
            {filteredConversations.map((conversation) => {
              const tutor = conversation.tutor;

              const lastMessage =
                conversation.messages[conversation.messages.length - 1];

              const active = selectedId === conversation.id;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  className={`conversation-item ${active ? "active" : ""}`}
                  onClick={() => selectConversation(conversation)}
                >
                  {/* AVATAR */}

                  <div className="conversation-avatar">
                    <img src={tutor.image} alt={tutor.name} />

                    {tutor.online && <span className="conversation-online" />}
                  </div>

                  {/* CONTENT */}

                  <div className="conversation-content">
                    <div className="conversation-top">
                      <strong>{tutor.name}</strong>

                      <span>{lastMessage?.time}</span>
                    </div>

                    <div className="conversation-bottom">
                      <p>
                        {lastMessage?.sender === "student" && <>You: </>}

                        {lastMessage?.text}
                      </p>

                      {conversation.unread > 0 && (
                        <span className="conversation-unread">
                          {conversation.unread}
                        </span>
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
                {/* MOBILE BACK */}

                <button
                  type="button"
                  className="chat-mobile-back"
                  onClick={() => setMobileChatOpen(false)}
                >
                  <ArrowLeft size={18} />
                </button>

                {/* AVATAR */}

                <div className="chat-avatar">
                  <img
                    src={selectedConversation.tutor.image}
                    alt={selectedConversation.tutor.name}
                  />

                  {selectedConversation.tutor.online && <span />}
                </div>

                {/* NAME */}

                <div className="chat-person">
                  <strong>{selectedConversation.tutor.name}</strong>

                  <span>
                    {selectedConversation.tutor.online
                      ? "Online"
                      : selectedConversation.tutor.title}
                  </span>
                </div>
              </div>

              {/* HEADER ACTIONS */}

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
                const mine = chatMessage.sender === "student";

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
                    {/* TUTOR AVATAR */}

                    {!mine && (
                      <img
                        src={selectedConversation.tutor.image}
                        alt={selectedConversation.tutor.name}
                      />
                    )}

                    <div className="chat-message-content">
                      {/* BUBBLE */}

                      <div className="chat-bubble">{chatMessage.text}</div>

                      {/* META */}

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
                  placeholder={`Message ${selectedConversation.tutor.name}...`}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    /*
                      Enter = Send
                      Shift + Enter = New line
                    */

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

export default Messages;
