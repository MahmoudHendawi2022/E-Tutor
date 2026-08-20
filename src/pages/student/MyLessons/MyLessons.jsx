import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router";

import {
  CalendarDays,
  ChevronDown,
  Clock3,
  MessageCircle,
  MoreHorizontal,
  RotateCcw,
  Search,
  Star,
  Video,
  X,
  XCircle,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import ReviewModal from "../../../components/Lessons/ReviewModal/ReviewModal";

import { useLessons } from "../../../context/LessonsContext";

import { getLessonJoinState } from "../../../utils/lessonJoin";

import { useTutors } from "../../../context/TutorsContext";

import { useAuth } from "../../../context/AuthContext";

import "./myLessons.css";

const tabs = [
  {
    value: "upcoming",
    label: "Upcoming",
  },

  {
    value: "completed",
    label: "Completed",
  },

  {
    value: "cancelled",
    label: "Cancelled",
  },
];

const cancellationReasons = [
  "Schedule conflict",
  "Personal reasons",
  "No longer need this lesson",
  "Other",
];

const containerVariants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.055,
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
   DATE
===================================== */

function formatLessonDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return {
    month: date
      .toLocaleDateString("en-US", {
        month: "short",
      })
      .toUpperCase(),

    day: date.toLocaleDateString("en-US", {
      day: "2-digit",
    }),

    full: date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

/* =====================================
   COMPONENT
===================================== */

function MyLessons() {
  const { user } = useAuth();

  const { getTutorById } = useTutors();

  const {
    lessons: allLessons,

    cancelLesson,

    submitLessonReview,
  } = useLessons();

  const lessons = useMemo(
    () =>
      allLessons.filter(
        (lesson) => Number(lesson.studentId) === Number(user?.id),
      ),
    [allLessons, user?.id],
  );

  const [activeTab, setActiveTab] = useState("upcoming");

  const [search, setSearch] = useState("");

  const [sort, setSort] = useState("newest");

  const [openMenu, setOpenMenu] = useState(null);

  const [now, setNow] = useState(() => new Date());

  /* =====================================
     JOIN TIMER
  ===================================== */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /* =====================================
     CANCEL
  ===================================== */

  const [cancelTarget, setCancelTarget] = useState(null);

  const [cancellationReason, setCancellationReason] =
    useState("Schedule conflict");

  const [customReason, setCustomReason] = useState("");

  const cancelTutor = cancelTarget ? getTutorById(cancelTarget.tutorId) : null;

  const closeCancelModal = () => {
    setCancelTarget(null);

    setCancellationReason("Schedule conflict");

    setCustomReason("");
  };

  const openCancelModal = (lesson) => {
    if (!lesson || lesson.status !== "upcoming") {
      return;
    }

    setOpenMenu(null);

    setCancelTarget(lesson);

    setCancellationReason("Schedule conflict");

    setCustomReason("");
  };

  useEffect(() => {
    if (!cancelTarget) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeCancelModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cancelTarget]);

  const finalCancellationReason =
    cancellationReason === "Other" ? customReason.trim() : cancellationReason;

  const confirmCancellation = () => {
    if (!cancelTarget || !finalCancellationReason) {
      return;
    }

    const cancelled = cancelLesson(cancelTarget.id, finalCancellationReason);

    if (cancelled) {
      closeCancelModal();
    }
  };

  /* =====================================
     REVIEW
  ===================================== */

  const [reviewTarget, setReviewTarget] = useState(null);

  const reviewTutor = reviewTarget ? getTutorById(reviewTarget.tutorId) : null;

  const openReviewModal = (lesson) => {
    if (!lesson || lesson.status !== "completed" || lesson.reviewed) {
      return;
    }

    setReviewTarget(lesson);
  };

  const closeReviewModal = () => {
    setReviewTarget(null);
  };

  const submitReview = (reviewData) => {
    if (!reviewTarget) {
      return;
    }

    const submitted = submitLessonReview(reviewTarget.id, reviewData);

    if (submitted) {
      closeReviewModal();
    }
  };

  /* =====================================
     COUNTS
  ===================================== */

  const counts = useMemo(() => {
    return {
      upcoming: lessons.filter((lesson) => lesson.status === "upcoming").length,

      completed: lessons.filter((lesson) => lesson.status === "completed")
        .length,

      cancelled: lessons.filter((lesson) => lesson.status === "cancelled")
        .length,
    };
  }, [lessons]);

  /* =====================================
     FILTER
  ===================================== */

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = lessons.filter((lesson) => lesson.status === activeTab);

    if (query) {
      result = result.filter((lesson) => {
        const tutor = getTutorById(lesson.tutorId);

        return (
          lesson.subject.toLowerCase().includes(query) ||
          lesson.bookingId?.toLowerCase().includes(query) ||
          tutor?.name.toLowerCase().includes(query) ||
          tutor?.subject.toLowerCase().includes(query)
        );
      });
    }

    result = [...result].sort((a, b) => {
      const first = new Date(`${a.date}T12:00:00`);

      const second = new Date(`${b.date}T12:00:00`);

      if (sort === "oldest") {
        return first - second;
      }

      return second - first;
    });

    return result;
  }, [lessons, activeTab, search, sort]);

  const changeTab = (tab) => {
    setActiveTab(tab);

    setOpenMenu(null);
  };

  return (
    <>
      <motion.main
        className="lessons-page"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER */}

        <motion.div className="lessons-header" variants={itemVariants}>
          <div>
            <span className="lessons-eyebrow">LEARNING</span>

            <h1>My lessons</h1>

            <p>View and manage all your upcoming and previous lessons.</p>
          </div>

          <Link to="/tutors" className="lessons-book-button">
            <CalendarDays size={15} />
            Book a lesson
          </Link>
        </motion.div>

        {/* TABS */}

        <motion.div className="lessons-tabs-wrapper" variants={itemVariants}>
          <div className="lessons-tabs">
            {tabs.map((tab) => {
              const active = activeTab === tab.value;

              return (
                <button
                  type="button"
                  key={tab.value}
                  className={active ? "active" : ""}
                  onClick={() => changeTab(tab.value)}
                >
                  {active && (
                    <motion.span
                      className="lessons-tab-active"
                      layoutId="lesson-active-tab"
                      transition={{
                        type: "spring",

                        stiffness: 500,

                        damping: 38,
                      }}
                    />
                  )}

                  <span className="lessons-tab-text">
                    {tab.label}

                    <small>{counts[tab.value]}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* TOOLBAR */}

        <motion.div className="lessons-toolbar" variants={itemVariants}>
          <div className="lessons-search">
            <Search size={16} />

            <input
              type="text"
              value={search}
              placeholder="Search by tutor, subject or booking ID..."
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <XCircle size={15} />
              </button>
            )}
          </div>

          <div className="lessons-sort">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="newest">Newest first</option>

              <option value="oldest">Oldest first</option>
            </select>

            <ChevronDown size={14} />
          </div>
        </motion.div>

        {/* RESULTS */}

        <motion.div className="lessons-results-info" variants={itemVariants}>
          <span>
            Showing <strong>{filteredLessons.length}</strong> {activeTab}{" "}
            {filteredLessons.length === 1 ? "lesson" : "lessons"}
          </span>
        </motion.div>

        {/* LIST */}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="lessons-list"
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -4,
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          >
            {filteredLessons.length > 0 ? (
              filteredLessons.map((lesson) => {
                const tutor = getTutorById(lesson.tutorId);

                if (!tutor) {
                  return null;
                }

                const date = formatLessonDate(lesson.date);

                const joinState = getLessonJoinState(lesson, now);

                return (
                  <article key={lesson.id} className="lesson-card">
                    {/* DATE */}

                    <div className="lesson-card-date">
                      <span>{date.month}</span>

                      <strong>{date.day}</strong>
                    </div>

                    {/* TUTOR */}

                    <div className="lesson-card-tutor">
                      <img src={tutor.image} alt={tutor.name} />

                      <div>
                        <span className="lesson-subject">{lesson.subject}</span>

                        <h2>{tutor.name}</h2>

                        <span className="lesson-tutor-title">
                          {tutor.shortTitle}
                        </span>
                      </div>
                    </div>

                    {/* DETAILS */}

                    <div className="lesson-card-details">
                      <div>
                        <CalendarDays size={14} />

                        <span>{date.full}</span>
                      </div>

                      <div>
                        <Clock3 size={14} />

                        <span>
                          {lesson.time}
                          {" · "}
                          {lesson.duration} min
                        </span>
                      </div>

                      <span className="lesson-booking-id">
                        Booking <strong>{lesson.bookingId}</strong>
                      </span>

                      {lesson.status === "cancelled" &&
                        (lesson.cancellationReason || lesson.reason) && (
                          <span className="lesson-cancellation-reason">
                            Reason:{" "}
                            <strong>
                              {lesson.cancellationReason || lesson.reason}
                            </strong>
                          </span>
                        )}
                    </div>

                    {/* RIGHT */}

                    <div className="lesson-card-right">
                      <span className={`lesson-status ${lesson.status}`}>
                        {lesson.status === "upcoming" && "Confirmed"}

                        {lesson.status === "completed" && "Completed"}

                        {lesson.status === "cancelled" && "Cancelled"}
                      </span>

                      <Link
                        to={`/dashboard/lessons/${lesson.id}`}
                        className="lesson-view-details"
                      >
                        View details
                      </Link>

                      {/* UPCOMING */}

                      {lesson.status === "upcoming" && (
                        <div className="lesson-actions">
                          {joinState.canJoin && lesson.meetingUrl ? (
                            <motion.a
                              href={lesson.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="lesson-primary-action"
                              whileHover={{
                                y: -1,
                              }}
                              whileTap={{
                                scale: 0.98,
                              }}
                            >
                              <Video size={14} />
                              Join lesson
                            </motion.a>
                          ) : (
                            <Link
                              to={`/dashboard/messages?tutor=${tutor.id}`}
                              className="lesson-secondary-action"
                            >
                              <MessageCircle size={14} />
                              Message
                            </Link>
                          )}

                          <div className="lesson-more">
                            <button
                              type="button"
                              className="lesson-more-button"
                              aria-label="Lesson options"
                              onClick={() =>
                                setOpenMenu(
                                  openMenu === lesson.id ? null : lesson.id,
                                )
                              }
                            >
                              <MoreHorizontal size={17} />
                            </button>

                            <AnimatePresence>
                              {openMenu === lesson.id && (
                                <motion.div
                                  className="lesson-menu"
                                  initial={{
                                    opacity: 0,
                                    y: -5,
                                    scale: 0.98,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                  }}
                                  exit={{
                                    opacity: 0,
                                    y: -4,
                                    scale: 0.98,
                                  }}
                                  transition={{
                                    duration: 0.15,
                                  }}
                                >
                                  <button type="button">
                                    <CalendarDays size={14} />
                                    Reschedule
                                  </button>

                                  <Link
                                    to={`/dashboard/messages?tutor=${tutor.id}`}
                                  >
                                    <MessageCircle size={14} />
                                    Message tutor
                                  </Link>

                                  <button
                                    type="button"
                                    className="danger"
                                    onClick={() => openCancelModal(lesson)}
                                  >
                                    <XCircle size={14} />
                                    Cancel lesson
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {/* COMPLETED */}

                      {lesson.status === "completed" && (
                        <div className="lesson-actions">
                          {!lesson.reviewed ? (
                            <button
                              type="button"
                              className="lesson-secondary-action"
                              onClick={() => openReviewModal(lesson)}
                            >
                              <Star size={14} />
                              Leave review
                            </button>
                          ) : (
                            <span className="lesson-reviewed">
                              <Star size={12} fill="currentColor" />
                              Reviewed
                            </span>
                          )}

                          <Link
                            to={`/tutors/${tutor.id}/book`}
                            className="lesson-text-action"
                          >
                            <RotateCcw size={13} />
                            Book again
                          </Link>
                        </div>
                      )}

                      {/* CANCELLED */}

                      {lesson.status === "cancelled" && (
                        <div className="lesson-actions">
                          <Link
                            to={`/tutors/${tutor.id}/book`}
                            className="lesson-secondary-action"
                          >
                            <RotateCcw size={14} />
                            Book again
                          </Link>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="lessons-empty">
                <div className="lessons-empty-icon">
                  <CalendarDays size={22} />
                </div>

                <h2>No lessons found</h2>

                <p>
                  We couldn't find any lessons matching your current filters.
                </p>

                <Link to="/tutors">Find a tutor</Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.main>

      {/* CANCEL MODAL */}

      <AnimatePresence>
        {cancelTarget && (
          <motion.div
            className="lesson-cancel-backdrop"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.18,
            }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeCancelModal();
              }
            }}
          >
            <motion.div
              className="lesson-cancel-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cancel-lesson-title"
              initial={{
                opacity: 0,
                y: 16,
                scale: 0.985,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.99,
              }}
              transition={{
                type: "tween",
                duration: 0.22,
                ease: "easeOut",
              }}
            >
              <div className="lesson-cancel-header">
                <div className="lesson-cancel-heading">
                  <div className="lesson-cancel-icon">
                    <XCircle size={19} />
                  </div>

                  <div>
                    <h2 id="cancel-lesson-title">Cancel lesson?</h2>

                    <p>This lesson will move to your cancelled lessons.</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="lesson-cancel-close"
                  onClick={closeCancelModal}
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="lesson-cancel-summary">
                {cancelTutor && (
                  <img src={cancelTutor.image} alt={cancelTutor.name} />
                )}

                <div>
                  <span>{cancelTarget.subject}</span>

                  <strong>{cancelTutor?.name || "Tutor"}</strong>

                  <small>
                    {formatLessonDate(cancelTarget.date).full}
                    {" · "}
                    {cancelTarget.time}
                    {" · "}
                    {cancelTarget.duration} min
                  </small>
                </div>
              </div>

              <div className="lesson-cancel-section">
                <div className="lesson-cancel-section-heading">
                  <strong>Why are you cancelling?</strong>

                  <span>
                    Select the reason that best describes your situation.
                  </span>
                </div>

                <div className="lesson-cancel-reasons">
                  {cancellationReasons.map((reason) => {
                    const active = cancellationReason === reason;

                    return (
                      <button
                        type="button"
                        key={reason}
                        className={`lesson-cancel-reason ${
                          active ? "active" : ""
                        }`}
                        onClick={() => {
                          setCancellationReason(reason);

                          if (reason !== "Other") {
                            setCustomReason("");
                          }
                        }}
                      >
                        <span className="lesson-cancel-radio">
                          {active && (
                            <motion.span layoutId="cancel-reason-dot" />
                          )}
                        </span>

                        {reason}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {cancellationReason === "Other" && (
                    <motion.div
                      className="lesson-cancel-other"
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <label htmlFor="cancel-reason-other">
                        Tell us briefly
                      </label>

                      <textarea
                        id="cancel-reason-other"
                        rows="3"
                        maxLength="200"
                        value={customReason}
                        placeholder="Enter your cancellation reason..."
                        onChange={(event) =>
                          setCustomReason(event.target.value)
                        }
                      />

                      <span>
                        {customReason.length}
                        /200
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="lesson-cancel-note">
                <CalendarDays size={14} />

                <span>
                  The tutor will be notified that this lesson has been
                  cancelled.
                </span>
              </div>

              <div className="lesson-cancel-actions">
                <button
                  type="button"
                  className="lesson-cancel-keep"
                  onClick={closeCancelModal}
                >
                  Keep lesson
                </button>

                <button
                  type="button"
                  className="lesson-cancel-confirm"
                  disabled={!finalCancellationReason}
                  onClick={confirmCancellation}
                >
                  Cancel lesson
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REVIEW */}

      <ReviewModal
        open={Boolean(reviewTarget)}
        lesson={reviewTarget}
        tutor={reviewTutor}
        onClose={closeReviewModal}
        onSubmit={submitReview}
      />
    </>
  );
}

export default MyLessons;
