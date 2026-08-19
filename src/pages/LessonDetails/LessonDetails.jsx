import { useEffect, useState } from "react";

import { Link, useParams } from "react-router";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  GraduationCap,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Star,
  Video,
  X,
  XCircle,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import { useLessons } from "../../context/LessonsContext";

import { getLessonJoinState } from "../../utils/lessonJoin";

import { useTutors } from "../../context/TutorsContext";

import { useAuth } from "../../context/AuthContext";

import ReviewModal from "../../components/Lessons/ReviewModal/ReviewModal";

import "./lessonDetails.css";

const cancellationReasons = [
  "Schedule conflict",
  "Personal reasons",
  "No longer need this lesson",
  "Other",
];

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

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function LessonDetails() {
  const { user } = useAuth();

  const { getTutorById } = useTutors();

  const { id } = useParams();

  const {
    getLessonById,

    cancelLesson,

    submitLessonReview,
  } = useLessons();

  const [copied, setCopied] = useState(false);

  const [now, setNow] = useState(() => new Date());

  const [reviewOpen, setReviewOpen] = useState(false);

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

  const [cancelOpen, setCancelOpen] = useState(false);

  const [cancellationReason, setCancellationReason] =
    useState("Schedule conflict");

  const [customReason, setCustomReason] = useState("");

  const rawLesson = getLessonById(id);

  const lesson =
    rawLesson && Number(rawLesson.studentId) === Number(user?.id)
      ? rawLesson
      : null;

  const tutor = lesson ? getTutorById(lesson.tutorId) : null;

  const joinState = getLessonJoinState(lesson, now);

  const closeCancelModal = () => {
    setCancelOpen(false);

    setCancellationReason("Schedule conflict");

    setCustomReason("");
  };

  const openCancelModal = () => {
    if (!lesson || lesson.status !== "upcoming") {
      return;
    }

    setCancellationReason("Schedule conflict");

    setCustomReason("");

    setCancelOpen(true);
  };

  useEffect(() => {
    if (!cancelOpen) {
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
  }, [cancelOpen]);

  if (!lesson || !tutor) {
    return (
      <main className="lesson-details-page">
        <Link to="/dashboard/lessons" className="lesson-details-back">
          <ArrowLeft size={15} />
          Back to lessons
        </Link>

        <div
          style={{
            padding: "70px 20px",

            background: "#ffffff",

            border: "1px solid #e7ebf0",

            borderRadius: "7px",

            textAlign: "center",
          }}
        >
          <CalendarDays size={25} color="#2563eb" />

          <h2
            style={{
              margin: "14px 0 6px",

              fontSize: "15px",

              color: "#0f172a",
            }}
          >
            Lesson not found
          </h2>

          <p
            style={{
              margin: "0 0 15px",

              fontSize: "9px",

              color: "#94a3b8",
            }}
          >
            This lesson may have been removed or the booking ID is invalid.
          </p>

          <Link
            to="/dashboard/lessons"
            style={{
              color: "#2563eb",

              fontSize: "9px",

              fontWeight: "600",
            }}
          >
            View my lessons
          </Link>
        </div>
      </main>
    );
  }

  /* =====================================
     COPY
  ===================================== */

  const copyMeetingLink = async () => {
    if (!lesson.meetingUrl || !joinState.canJoin) {
      return;
    }

    try {
      await navigator.clipboard.writeText(lesson.meetingUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (error) {
      console.error("Could not copy meeting link:", error);
    }
  };

  /* =====================================
     CANCEL
  ===================================== */

  const finalCancellationReason =
    cancellationReason === "Other" ? customReason.trim() : cancellationReason;

  const confirmCancellation = () => {
    if (!finalCancellationReason) {
      return;
    }

    const cancelled = cancelLesson(lesson.id, finalCancellationReason);

    if (cancelled) {
      closeCancelModal();
    }
  };

  /* =====================================
     REVIEW
  ===================================== */

  const openReviewModal = () => {
    if (lesson.status !== "completed" || lesson.reviewed) {
      return;
    }

    setReviewOpen(true);
  };

  const closeReviewModal = () => {
    setReviewOpen(false);
  };

  const submitReview = (reviewData) => {
    const submitted = submitLessonReview(lesson.id, reviewData);

    if (submitted) {
      closeReviewModal();
    }
  };

  return (
    <>
      <motion.main
        className="lesson-details-page"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* BACK */}

        <motion.div variants={itemVariants}>
          <Link to="/dashboard/lessons" className="lesson-details-back">
            <ArrowLeft size={15} />
            Back to lessons
          </Link>
        </motion.div>

        {/* HEADER */}

        <motion.div className="lesson-details-header" variants={itemVariants}>
          <div>
            <span className="lesson-details-eyebrow">LESSON DETAILS</span>

            <h1>{lesson.subject}</h1>

            <p>
              Booking <strong>{lesson.bookingId}</strong>
            </p>
          </div>

          <span className={`lesson-details-status ${lesson.status}`}>
            {lesson.status === "upcoming" && (
              <>
                <CheckCircle2 size={13} />
                Confirmed
              </>
            )}

            {lesson.status === "completed" && (
              <>
                <CheckCircle2 size={13} />
                Completed
              </>
            )}

            {lesson.status === "cancelled" && (
              <>
                <XCircle size={13} />
                Cancelled
              </>
            )}
          </span>
        </motion.div>

        <div className="lesson-details-layout">
          <div className="lesson-details-main">
            {/* SCHEDULE */}

            <motion.section
              className="lesson-details-card lesson-schedule-card"
              variants={itemVariants}
            >
              <div className="lesson-card-heading">
                <h2>Lesson schedule</h2>

                {lesson.status === "upcoming" && (
                  <button type="button">Reschedule</button>
                )}
              </div>

              <div className="lesson-schedule-grid">
                <div className="lesson-info-box">
                  <div className="lesson-info-icon">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <span>Date</span>

                    <strong>{formatDate(lesson.date)}</strong>
                  </div>
                </div>

                <div className="lesson-info-box">
                  <div className="lesson-info-icon">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <span>Time</span>

                    <strong>{lesson.time}</strong>
                  </div>
                </div>

                <div className="lesson-info-box">
                  <div className="lesson-info-icon">
                    <Video size={18} />
                  </div>

                  <div>
                    <span>Lesson type</span>

                    <strong>Online video</strong>
                  </div>
                </div>

                <div className="lesson-info-box">
                  <div className="lesson-info-icon">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <span>Duration</span>

                    <strong>{lesson.duration} min</strong>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* CLASSROOM */}

            {lesson.status === "upcoming" && (
              <motion.section
                className="lesson-details-card"
                variants={itemVariants}
              >
                <div className="lesson-card-heading">
                  <div>
                    <h2>Online classroom</h2>

                    <p>Use this link to join your lesson.</p>
                  </div>
                </div>

                <div className="lesson-meeting">
                  <div className="lesson-meeting-icon">
                    <Video size={20} />
                  </div>

                  <div className="lesson-meeting-info">
                    <span>Meeting link</span>

                    <strong>
                      {joinState.canJoin
                        ? lesson.meetingUrl
                        : "Available 10 minutes before the lesson"}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="lesson-copy-button"
                    disabled={!joinState.canJoin}
                    onClick={copyMeetingLink}
                  >
                    <Copy size={14} />

                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="lesson-meeting-actions">
                  <motion.a
                    href={lesson.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`lesson-join-button ${
                      !joinState.canJoin ? "disabled" : ""
                    }`}
                    whileHover={
                      joinState.canJoin
                        ? {
                            y: -1,
                          }
                        : {}
                    }
                    whileTap={
                      joinState.canJoin
                        ? {
                            scale: 0.985,
                          }
                        : {}
                    }
                    onClick={(event) => {
                      if (!joinState.canJoin) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <Video size={15} />
                    Join lesson
                    <ExternalLink size={13} />
                  </motion.a>

                  <p>{joinState.message}</p>
                </div>
              </motion.section>
            )}

            {/* COMPLETED */}

            {lesson.status === "completed" && (
              <motion.section
                className="lesson-details-card"
                variants={itemVariants}
              >
                <div className="lesson-card-heading">
                  <div>
                    <h2>Tutor notes</h2>

                    <p>Feedback from your completed lesson.</p>
                  </div>
                </div>

                <div className="lesson-notes">
                  <GraduationCap size={18} />

                  <p>
                    {lesson.notes || "No notes were added for this lesson."}
                  </p>
                </div>
              </motion.section>
            )}

            {/* CANCELLED */}

            {lesson.status === "cancelled" && (
              <motion.section
                className="lesson-details-card"
                variants={itemVariants}
              >
                <div className="lesson-card-heading">
                  <div>
                    <h2>Cancellation details</h2>

                    <p>Information about this cancelled lesson.</p>
                  </div>
                </div>

                <div className="lesson-cancellation">
                  <div>
                    <span>Cancelled by</span>

                    <strong>{lesson.cancelledBy || "Unknown"}</strong>
                  </div>

                  <div>
                    <span>Reason</span>

                    <strong>
                      {lesson.cancellationReason ||
                        lesson.reason ||
                        "No reason provided"}
                    </strong>
                  </div>
                </div>
              </motion.section>
            )}
          </div>

          {/* SIDEBAR */}

          <div className="lesson-details-sidebar">
            <motion.section
              className="lesson-details-card lesson-tutor-card"
              variants={itemVariants}
            >
              <span className="lesson-side-label">YOUR TUTOR</span>

              <div className="lesson-tutor-profile">
                <img src={tutor.image} alt={tutor.name} />

                <h2>{tutor.name}</h2>

                <p>{tutor.title}</p>

                <div className="lesson-tutor-stats">
                  <span>
                    <Star size={13} fill="currentColor" />

                    {tutor.rating}
                  </span>

                  <span className="lesson-tutor-divider">•</span>

                  <span>{tutor.lessons} lessons</span>
                </div>
              </div>

              <Link
                to={`/tutors/${tutor.id}`}
                className="lesson-profile-button"
              >
                View tutor profile
              </Link>

              <Link
                to={`/dashboard/messages?tutor=${tutor.id}`}
                className="lesson-message-button"
              >
                <MessageCircle size={14} />
                Message tutor
              </Link>
            </motion.section>

            {/* BOOKING */}

            <motion.section
              className="lesson-details-card lesson-summary-card"
              variants={itemVariants}
            >
              <h2>Booking summary</h2>

              <div className="lesson-summary-row">
                <span>Booking ID</span>

                <strong>{lesson.bookingId}</strong>
              </div>

              <div className="lesson-summary-row">
                <span>Duration</span>

                <strong>{lesson.duration} min</strong>
              </div>

              <div className="lesson-summary-row">
                <span>Lesson type</span>

                <strong>Online</strong>
              </div>

              <div className="lesson-summary-divider" />

              <div className="lesson-summary-total">
                <span>Total</span>

                <strong>${Number(lesson.price).toFixed(2)}</strong>
              </div>

              <div className="lesson-summary-secure">
                <ShieldCheck size={13} />
                Booking secured by E-Tutor
              </div>
            </motion.section>

            {/* UPCOMING */}

            {lesson.status === "upcoming" && (
              <motion.section
                className="lesson-details-card lesson-actions-card"
                variants={itemVariants}
              >
                <button type="button" className="lesson-reschedule-button">
                  <CalendarDays size={14} />
                  Reschedule lesson
                </button>

                <button
                  type="button"
                  className="lesson-cancel-button"
                  onClick={openCancelModal}
                >
                  <XCircle size={14} />
                  Cancel lesson
                </button>
              </motion.section>
            )}

            {/* COMPLETED */}

            {lesson.status === "completed" && (
              <motion.section
                className="lesson-details-card lesson-actions-card"
                variants={itemVariants}
              >
                {!lesson.reviewed && (
                  <button
                    type="button"
                    className="lesson-review-button"
                    onClick={openReviewModal}
                  >
                    <Star size={14} />
                    Leave a review
                  </button>
                )}

                {lesson.reviewed && (
                  <span className="lesson-reviewed">
                    <Star size={12} fill="currentColor" />
                    Reviewed
                  </span>
                )}

                <Link
                  to={`/tutors/${tutor.id}/book`}
                  className="lesson-reschedule-button"
                >
                  <RotateCcw size={14} />
                  Book another lesson
                </Link>
              </motion.section>
            )}

            {/* CANCELLED */}

            {lesson.status === "cancelled" && (
              <motion.section
                className="lesson-details-card lesson-actions-card"
                variants={itemVariants}
              >
                <Link
                  to={`/tutors/${tutor.id}/book`}
                  className="lesson-reschedule-button"
                >
                  <RotateCcw size={14} />
                  Book again
                </Link>
              </motion.section>
            )}
          </div>
        </div>
      </motion.main>

      {/* CANCEL MODAL */}

      <AnimatePresence>
        {cancelOpen && (
          <motion.div
            className="lesson-details-cancel-backdrop"
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
              className="lesson-details-cancel-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="lesson-details-cancel-title"
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
              <div className="lesson-details-cancel-header">
                <div className="lesson-details-cancel-heading">
                  <div className="lesson-details-cancel-icon">
                    <XCircle size={19} />
                  </div>

                  <div>
                    <h2 id="lesson-details-cancel-title">Cancel lesson?</h2>

                    <p>This lesson will move to your cancelled lessons.</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="lesson-details-cancel-close"
                  onClick={closeCancelModal}
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="lesson-details-cancel-summary">
                <img src={tutor.image} alt={tutor.name} />

                <div>
                  <span>{lesson.subject}</span>

                  <strong>{tutor.name}</strong>

                  <small>
                    {formatDate(lesson.date)}
                    {" · "}
                    {lesson.time}
                    {" · "}
                    {lesson.duration} min
                  </small>
                </div>
              </div>

              <div className="lesson-details-cancel-section">
                <div className="lesson-details-cancel-section-heading">
                  <strong>Why are you cancelling?</strong>

                  <span>
                    Select the reason that best describes your situation.
                  </span>
                </div>

                <div className="lesson-details-cancel-reasons">
                  {cancellationReasons.map((reason) => {
                    const active = cancellationReason === reason;

                    return (
                      <button
                        type="button"
                        key={reason}
                        className={`lesson-details-cancel-reason ${
                          active ? "active" : ""
                        }`}
                        onClick={() => {
                          setCancellationReason(reason);

                          if (reason !== "Other") {
                            setCustomReason("");
                          }
                        }}
                      >
                        <span className="lesson-details-cancel-radio">
                          {active && (
                            <motion.span layoutId="lesson-details-cancel-radio" />
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
                      className="lesson-details-cancel-other"
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
                      <label htmlFor="lesson-details-other-reason">
                        Tell us briefly
                      </label>

                      <textarea
                        id="lesson-details-other-reason"
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

              <div className="lesson-details-cancel-note">
                <CalendarDays size={14} />

                <span>
                  The tutor will be notified that this lesson has been
                  cancelled.
                </span>
              </div>

              <div className="lesson-details-cancel-actions">
                <button
                  type="button"
                  className="lesson-details-cancel-keep"
                  onClick={closeCancelModal}
                >
                  Keep lesson
                </button>

                <button
                  type="button"
                  className="lesson-details-cancel-confirm"
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
        open={reviewOpen}
        lesson={lesson}
        tutor={tutor}
        onClose={closeReviewModal}
        onSubmit={submitReview}
      />
    </>
  );
}

export default LessonDetails;
