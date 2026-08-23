import { useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Check,
  MessageCircle,
  ShieldCheck,
  Star,
  Video,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import AvailabilitySchedulePicker from "../../../components/Booking/AvailabilitySchedulePicker/AvailabilitySchedulePicker";

import { useTutors } from "../../../context/TutorsContext";

import "./bookLesson.css";

/* =====================================
   DURATIONS
===================================== */

const durations = [
  {
    minutes: 30,
    label: "30 min",
    multiplier: 0.5,
  },

  {
    minutes: 60,
    label: "60 min",
    multiplier: 1,
    recommended: true,
  },

  {
    minutes: 90,
    label: "90 min",
    multiplier: 1.5,
  },
];

/* =====================================
   ANIMATION
===================================== */

const pageVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 14,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      type: "tween",
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

/* =====================================
   TIME FORMAT
===================================== */

const formatTime = (time) => {
  if (!time) {
    return "Select a time";
  }

  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

/* =====================================
   COMPONENT
===================================== */

function BookLesson() {
  const navigate = useNavigate();

  const { id } = useParams();

  const { getPublicTutorById } = useTutors();

  /* =====================================
     APPROVED PUBLIC TUTOR
  ===================================== */

  const tutor = getPublicTutorById(id);

  const [selectedDate, setSelectedDate] = useState(null);

  const [selectedTime, setSelectedTime] = useState("");

  const [selectedDuration, setSelectedDuration] = useState(durations[1]);

  const [coordinationNote, setCoordinationNote] = useState("");

  /* =====================================
     TUTOR NOT FOUND
  ===================================== */

  if (!tutor) {
    return (
      <main className="booking-page">
        <div
          className="container booking-container"
          style={{
            minHeight: "60vh",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            textAlign: "center",
          }}
        >
          <div>
            <h1>Tutor not found</h1>

            <Link to="/tutors">Browse tutors</Link>
          </div>
        </div>
      </main>
    );
  }

  const total = Number(tutor.price) * selectedDuration.multiplier;

  /* =====================================
     MESSAGE TUTOR
  ===================================== */

  const messageTutor = () => {
    navigate(`/dashboard/messages?tutor=${tutor.id}`);
  };

  /* =====================================
     BOOKING
  ===================================== */

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    navigate(`/tutors/${tutor.id}/book/confirm`, {
      state: {
        booking: {
          tutor: {
            id: tutor.id,

            name: tutor.name,

            title: tutor.title,

            image: tutor.image,
          },

          date: selectedDate.toISOString(),

          time: selectedTime,

          duration: selectedDuration.minutes,

          total,

          coordinationNote: coordinationNote.trim(),
        },
      },
    });
  };

  return (
    <main className="booking-page">
      <motion.div
        className="container booking-container"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* =====================================
            TOP
        ===================================== */}

        <motion.div variants={itemVariants} className="booking-top">
          <Link to={`/tutors/${tutor.id}`} className="booking-back">
            <ArrowLeft size={16} />
            Tutor profile
          </Link>

          <div className="booking-heading">
            <div>
              <h1>Schedule your lesson</h1>

              <p>
                Choose one of the tutor's available times or message them to
                arrange another time.
              </p>
            </div>

            <div className="booking-secure">
              <ShieldCheck size={16} />
              Secure booking
            </div>
          </div>
        </motion.div>

        {/* =====================================
            PROGRESS
        ===================================== */}

        <motion.div variants={itemVariants} className="booking-progress">
          <div className="booking-step active">
            <span>1</span>

            <div>
              <strong>Schedule</strong>

              <small>Date & time</small>
            </div>
          </div>

          <div className="booking-progress-line" />

          <div className="booking-step">
            <span>2</span>

            <div>
              <strong>Confirm</strong>

              <small>Review booking</small>
            </div>
          </div>
        </motion.div>

        {/* =====================================
            LAYOUT
        ===================================== */}

        <div className="booking-layout">
          {/* =====================================
              LEFT
          ===================================== */}

          <div className="booking-main">
            {/* =====================================
                TUTOR
            ===================================== */}

            <motion.section variants={itemVariants} className="booking-tutor">
              <img src={tutor.image} alt={tutor.name} />

              <div className="booking-tutor-details">
                <h2>{tutor.name}</h2>

                <p>{tutor.title}</p>

                <div className="booking-rating">
                  <Star size={14} fill="currentColor" />

                  <strong>{tutor.rating}</strong>

                  <span>({tutor.reviews || 0} reviews)</span>
                </div>
              </div>

              <div className="booking-hourly-rate">
                <span>Hourly rate</span>

                <strong>${tutor.price}</strong>
              </div>
            </motion.section>

            {/* =====================================
                DURATION FIRST

                Important because available slots
                depend on lesson duration.
            ===================================== */}

            <motion.section
              variants={itemVariants}
              className="booking-duration-section"
            >
              <div className="booking-section-header">
                <div className="booking-section-icon">
                  <Video size={18} />
                </div>

                <div>
                  <h2>Lesson duration</h2>

                  <p>Available times update automatically based on duration.</p>
                </div>
              </div>

              <div className="booking-duration-grid">
                {durations.map((duration) => {
                  const active = selectedDuration.minutes === duration.minutes;

                  return (
                    <motion.button
                      key={duration.minutes}
                      type="button"
                      className={`booking-duration ${active ? "active" : ""}`}
                      onClick={() => {
                        setSelectedDuration(duration);

                        setSelectedTime("");
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                    >
                      {duration.recommended && (
                        <span className="recommended-label">Most popular</span>
                      )}

                      <strong>{duration.label}</strong>

                      <span className="duration-price">
                        $
                        {(Number(tutor.price) * duration.multiplier).toFixed(2)}
                      </span>

                      {active && (
                        <motion.div
                          className="duration-check"
                          initial={{
                            scale: 0,
                          }}
                          animate={{
                            scale: 1,
                          }}
                          transition={{
                            type: "spring",

                            stiffness: 500,

                            damping: 28,
                          }}
                        >
                          <Check size={12} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>

            {/* =====================================
                REAL AVAILABILITY
            ===================================== */}

            <motion.div variants={itemVariants}>
              <AvailabilitySchedulePicker
                tutorId={tutor.id}
                duration={selectedDuration.minutes}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                onMessageTutor={messageTutor}
              />
            </motion.div>

            {/* =====================================
                NOTE TO TUTOR
            ===================================== */}

            <motion.section
              className="booking-coordination"
              variants={itemVariants}
            >
              <div className="booking-coordination-heading">
                <MessageCircle size={17} />

                <div>
                  <h2>Note for your tutor</h2>

                  <p>
                    Optional — tell the tutor what you'd like to focus on or
                    anything they should know before the lesson.
                  </p>
                </div>
              </div>

              <textarea
                rows="4"
                maxLength="300"
                value={coordinationNote}
                placeholder="Example: I'd like to focus on speaking practice and job interview vocabulary..."
                onChange={(event) => setCoordinationNote(event.target.value)}
              />

              <div className="booking-coordination-footer">
                <span>
                  {coordinationNote.length}
                  /300
                </span>

                <button type="button" onClick={messageTutor}>
                  <MessageCircle size={13} />
                  Talk to tutor first
                </button>
              </div>
            </motion.section>
          </div>

          {/* =====================================
              SUMMARY
          ===================================== */}

          <motion.aside variants={itemVariants} className="booking-summary">
            <div className="summary-heading">
              <h2>Booking summary</h2>

              <p>Review your lesson details.</p>
            </div>

            <div className="summary-tutor">
              <img src={tutor.image} alt={tutor.name} />

              <div>
                <strong>{tutor.name}</strong>

                <span>{tutor.title}</span>
              </div>
            </div>

            <div className="summary-divider" />

            <div className="summary-items">
              <div>
                <span>Date</span>

                <AnimatePresence mode="wait">
                  <motion.strong
                    key={selectedDate ? selectedDate.toISOString() : "date"}
                    initial={{
                      opacity: 0,
                      y: 3,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -3,
                    }}
                  >
                    {selectedDate
                      ? selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",

                        month: "short",

                        day: "numeric",

                        year: "numeric",
                      })
                      : "Select a date"}
                  </motion.strong>
                </AnimatePresence>
              </div>

              <div>
                <span>Time</span>

                <strong>{formatTime(selectedTime)}</strong>
              </div>

              <div>
                <span>Duration</span>

                <strong>{selectedDuration.label}</strong>
              </div>

              <div>
                <span>Lesson type</span>

                <strong className="online-lesson">
                  <Video size={13} />
                  Online
                </strong>
              </div>
            </div>

            <div className="summary-divider" />

            <div className="summary-price-row">
              <span>Lesson</span>

              <span>${total.toFixed(2)}</span>
            </div>

            <div className="summary-total">
              <strong>Total</strong>

              <strong className="summary-total-price">
                ${total.toFixed(2)}
              </strong>
            </div>

            <motion.button
              type="button"
              className="booking-confirm"
              disabled={!selectedDate || !selectedTime}
              onClick={handleBooking}
              whileHover={
                selectedDate && selectedTime
                  ? {
                    y: -1,
                  }
                  : {}
              }
              whileTap={
                selectedDate && selectedTime
                  ? {
                    scale: 0.985,
                  }
                  : {}
              }
            >
              Continue to confirmation
            </motion.button>

            {/* =====================================
                MESSAGE FALLBACK
            ===================================== */}

            <button
              type="button"
              className="booking-message-tutor"
              onClick={messageTutor}
            >
              <MessageCircle size={14} />
              Need another time? Message tutor
            </button>

            <div className="summary-security">
              <ShieldCheck size={14} />

              <span>Your booking information is secure.</span>
            </div>
          </motion.aside>
        </div>
      </motion.div>
    </main>
  );
}

export default BookLesson;
