import { useState } from "react";

import { Link, useLocation, useNavigate, useParams } from "react-router";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  Video,
} from "lucide-react";

import { motion } from "motion/react";

import { useLessons } from "../../../context/LessonsContext";

import { useAuth } from "../../../context/AuthContext";

import { useTutors } from "../../../context/TutorsContext";

import { usePayments } from "../../../context/PaymentsContext";

import { useMessages } from "../../../context/MessagesContext";

import { usePlatformSettings } from "../../../context/PlatformSettingsContext";

import "./bookingConfirmation.css";

const containerVariants = {
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
    y: 12,
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
    return "";
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
   DATE KEY
===================================== */

const formatMoney = (amount, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
};

const formatDateKey = (date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =====================================
   COMPONENT
===================================== */

function BookingConfirmation() {
  const { id } = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const { user } = useAuth();

  const { addLesson } = useLessons();

  const { getPublicTutorById } = useTutors();

  const { createPayment } = usePayments();

  const { createConversation } = useMessages();

  const { settings: platformSettings } = usePlatformSettings();

  const [paymentMethod, setPaymentMethod] = useState("card");

  const [loading, setLoading] = useState(false);

  /* =====================================
     CENTRAL TUTOR DATA
  ===================================== */

  const tutor = getPublicTutorById(id);

  const booking = location.state?.booking;

  const bookingDate = booking?.date ? new Date(booking.date) : null;

  const validDate = bookingDate && !Number.isNaN(bookingDate.getTime());

  const validBooking = Boolean(
    tutor &&
    user?.id &&
    user?.role === "student" &&
    booking &&
    Number(booking.tutor?.id) === tutor.id &&
    validDate &&
    booking.time &&
    Number(booking.duration) > 0 &&
    Number.isFinite(Number(booking.total)),
  );

  /* =====================================
     TUTOR NOT FOUND
  ===================================== */

  if (!tutor) {
    return (
      <main className="confirmation-page">
        <div className="container confirmation-container">
          <div
            style={{
              minHeight: "60vh",

              display: "flex",

              flexDirection: "column",

              alignItems: "center",

              justifyContent: "center",

              textAlign: "center",

              padding: "80px 20px",
            }}
          >
            <h1
              style={{
                margin: "0 0 8px",

                color: "#0f172a",

                fontSize: "24px",
              }}
            >
              Tutor not found
            </h1>

            <p
              style={{
                margin: "0 0 18px",

                color: "#64748b",

                fontSize: "13px",
              }}
            >
              This tutor may no longer be available.
            </p>

            <Link
              to="/tutors"
              style={{
                color: "#2563eb",

                fontSize: "12px",

                fontWeight: "600",
              }}
            >
              Browse tutors
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================
     MISSING BOOKING DATA
  ===================================== */

  if (!validBooking) {
    return (
      <main className="confirmation-page">
        <div className="container confirmation-container">
          <div
            style={{
              minHeight: "60vh",

              display: "flex",

              flexDirection: "column",

              alignItems: "center",

              justifyContent: "center",

              textAlign: "center",

              padding: "80px 20px",
            }}
          >
            <h1
              style={{
                margin: "0 0 8px",

                color: "#0f172a",

                fontSize: "24px",
              }}
            >
              Booking details unavailable
            </h1>

            <p
              style={{
                maxWidth: "430px",

                margin: "0 0 18px",

                color: "#64748b",

                fontSize: "13px",

                lineHeight: "1.6",
              }}
            >
              Please choose a date, time and lesson duration before continuing
              to confirmation.
            </p>

            <Link
              to={`/tutors/${tutor.id}/book`}
              style={{
                color: "#2563eb",

                fontSize: "12px",

                fontWeight: "600",
              }}
            >
              Schedule a lesson
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================
     NORMALIZED BOOKING
  ===================================== */

  const data = {
    ...booking,

    tutor: {
      id: tutor.id,

      name: tutor.name,

      title: tutor.title,

      image: tutor.image,

      price: tutor.price,

      currency: tutor.currency || "USD",
    },

    duration: Number(booking.duration),

    total: Number(booking.total),

    coordinationNote: String(booking.coordinationNote || "").trim(),
  };

  const formattedDate = bookingDate.toLocaleDateString("en-US", {
    weekday: "long",

    month: "long",

    day: "numeric",

    year: "numeric",
  });

  /* =====================================
     CONFIRM
  ===================================== */

  const handleConfirm = () => {
    if (loading || !user?.id) {
      return;
    }

    setLoading(true);

    setTimeout(
      () => {
        const bookingReference = `ET-${Date.now()
          .toString()
          .slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

        const lessonId = Date.now();

        /* =====================================
             CREATE LESSON
          ===================================== */

        const newLesson = {
          id: lessonId,

          studentId: Number(user.id),

          tutorId: tutor.id,

          status: "upcoming",

          subject: tutor.subject,

          date: formatDateKey(bookingDate),

          time: data.time,

          duration: data.duration,

          studentNote: data.coordinationNote || "",

          bookingId: bookingReference,

          price: data.total,

          currency: tutor.currency || "USD",

          meetingUrl: `https://meet.example.com/${bookingReference.toLowerCase()}`,

          canJoin: false,

          reviewed: false,

          createdAt: new Date().toISOString(),
        };

        addLesson(newLesson);

        /* =====================================
             CREATE PAYMENT LEDGER ENTRY

             Frontend demo only. A card payment
             is simulated as paid; Pay Later is
             stored as pending until admin marks
             it paid. Real payment processing
             belongs on the backend/gateway.
          ===================================== */

        const payment = createPayment({
          lessonId,
          bookingId: bookingReference,
          studentId: Number(user.id),
          tutorId: tutor.id,
          grossAmount: data.total,
          currency: tutor.currency || "USD",
          method: paymentMethod,
          paymentStatus: paymentMethod === "card" ? "paid" : "pending",
        });

        /* Keep a student ↔ tutor conversation available. */
        createConversation(Number(tutor.id), Number(user.id));

        /* =====================================
             SUCCESS PAGE
          ===================================== */

        navigate("/booking/success", {
          state: {
            booking: {
              ...data,

              studentId: Number(user.id),

              lessonId,

              bookingReference,

              paymentMethod,

              paymentId: payment.id,

              paymentStatus: payment.paymentStatus,
            },
          },
        });
      },

      700,
    );
  };

  return (
    <main className="confirmation-page">
      <motion.div
        className="container confirmation-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* =====================================
            BACK
        ===================================== */}

        <motion.div variants={itemVariants}>
          <Link to={`/tutors/${tutor.id}/book`} className="confirmation-back">
            <ArrowLeft size={16} />
            Back to schedule
          </Link>
        </motion.div>

        {/* =====================================
            HEADING
        ===================================== */}

        <motion.div className="confirmation-heading" variants={itemVariants}>
          <div>
            <span>FINAL STEP</span>

            <h1>Review your booking</h1>

            <p>Check your lesson details before confirming your booking.</p>
          </div>

          <div className="confirmation-secure">
            <ShieldCheck size={16} />
            Secure checkout
          </div>
        </motion.div>

        {/* =====================================
            PROGRESS
        ===================================== */}

        <motion.div className="confirmation-progress" variants={itemVariants}>
          <div className="confirm-step completed">
            <span>
              <Check size={14} />
            </span>

            <div>
              <strong>Schedule</strong>

              <small>Completed</small>
            </div>
          </div>

          <div className="confirm-line active" />

          <div className="confirm-step active">
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

        <div className="confirmation-layout">
          {/* =====================================
              LEFT
          ===================================== */}

          <div className="confirmation-main">
            {/* =====================================
                TUTOR
            ===================================== */}

            <motion.section
              className="confirmation-card confirm-tutor-card"
              variants={itemVariants}
            >
              <div className="confirm-tutor">
                <img src={tutor.image} alt={tutor.name} />

                <div>
                  <span>Lesson with</span>

                  <h2>{tutor.name}</h2>

                  <p>{tutor.title}</p>
                </div>
              </div>

              <Link to={`/tutors/${tutor.id}`} className="confirm-view-profile">
                View profile
              </Link>
            </motion.section>

            {/* =====================================
                LESSON DETAILS
            ===================================== */}

            <motion.section
              className="confirmation-card"
              variants={itemVariants}
            >
              <div className="confirm-section-heading">
                <h2>Lesson details</h2>

                <Link to={`/tutors/${tutor.id}/book`}>Edit</Link>
              </div>

              <div className="lesson-details-grid">
                <div className="confirm-detail">
                  <div className="confirm-detail-icon">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <span>Date</span>

                    <strong>{formattedDate}</strong>
                  </div>
                </div>

                <div className="confirm-detail">
                  <div className="confirm-detail-icon">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <span>Time</span>

                    <strong>{formatTime(data.time)}</strong>
                  </div>
                </div>

                <div className="confirm-detail">
                  <div className="confirm-detail-icon">
                    <Video size={18} />
                  </div>

                  <div>
                    <span>Lesson type</span>

                    <strong>Online video lesson</strong>
                  </div>
                </div>

                <div className="confirm-detail">
                  <div className="confirm-detail-icon">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <span>Duration</span>

                    <strong>{data.duration} minutes</strong>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* =====================================
                PAYMENT
            ===================================== */}

            <motion.section
              className="confirmation-card"
              variants={itemVariants}
            >
              <div className="confirm-section-heading payment-heading">
                <div>
                  <h2>Payment method</h2>

                  <p>Choose how you'd like to pay.</p>
                </div>
              </div>

              <div className="payment-options">
                {/* CARD */}

                <button
                  type="button"
                  className={`payment-option ${
                    paymentMethod === "card" ? "active" : ""
                  }`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <div className="payment-option-left">
                    <div className="payment-icon">
                      <CreditCard size={18} />
                    </div>

                    <div>
                      <strong>Credit or debit card</strong>

                      <span>Visa, Mastercard and more</span>
                    </div>
                  </div>

                  <div className="payment-radio">
                    {paymentMethod === "card" && (
                      <motion.span
                        initial={{
                          scale: 0,
                        }}
                        animate={{
                          scale: 1,
                        }}
                      />
                    )}
                  </div>
                </button>

                {/* PAY LATER */}

                {platformSettings.allowPayLater && (
                  <button
                    type="button"
                    className={`payment-option ${
                      paymentMethod === "later" ? "active" : ""
                    }`}
                    onClick={() => setPaymentMethod("later")}
                  >
                    <div className="payment-option-left">
                      <div className="payment-icon">
                        <Clock3 size={18} />
                      </div>

                      <div>
                        <strong>Pay later</strong>

                        <span>Reserve now and pay before the lesson starts</span>
                      </div>
                    </div>

                    <div className="payment-radio">
                      {paymentMethod === "later" && (
                        <motion.span
                          initial={{
                            scale: 0,
                          }}
                          animate={{
                            scale: 1,
                          }}
                        />
                      )}
                    </div>
                  </button>
                )}
              </div>

              {/* CARD FORM */}

              {paymentMethod === "card" && (
                <motion.div
                  className="card-form"
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                >
                  <div className="payment-field">
                    <label htmlFor="cardholder">Cardholder name</label>

                    <input
                      id="cardholder"
                      type="text"
                      placeholder="Name on card"
                    />
                  </div>

                  <div className="payment-field">
                    <label htmlFor="card-number">Card number</label>

                    <div className="card-number">
                      <input
                        id="card-number"
                        type="text"
                        inputMode="numeric"
                        placeholder="0000 0000 0000 0000"
                      />

                      <CreditCard size={17} />
                    </div>
                  </div>

                  <div className="payment-row">
                    <div className="payment-field">
                      <label htmlFor="expiry-date">Expiry date</label>

                      <input
                        id="expiry-date"
                        type="text"
                        inputMode="numeric"
                        placeholder="MM / YY"
                      />
                    </div>

                    <div className="payment-field">
                      <label htmlFor="cvv">CVV</label>

                      <input
                        id="cvv"
                        type="password"
                        inputMode="numeric"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="payment-protected">
                    <LockKeyhole size={13} />
                    Your payment information is encrypted and secure.
                  </div>
                </motion.div>
              )}
            </motion.section>
          </div>

          {/* =====================================
              SUMMARY
          ===================================== */}

          <motion.aside
            className="confirmation-summary"
            variants={itemVariants}
          >
            <h2>Order summary</h2>

            <div className="confirm-summary-tutor">
              <img src={tutor.image} alt={tutor.name} />

              <div>
                <strong>{tutor.name}</strong>

                <span>
                  {data.duration}
                  -minute lesson
                </span>
              </div>
            </div>

            <div className="confirm-summary-divider" />

            <div className="confirm-summary-items">
              <div>
                <span>Lesson</span>

                <strong>{formatMoney(data.total, data.tutor.currency)}</strong>
              </div>

              <div>
                <span>Service fee</span>

                <strong>{formatMoney(0, data.tutor.currency)}</strong>
              </div>
            </div>

            <div className="confirm-summary-divider" />

            <div className="confirm-total">
              <span>Total</span>

              <strong>{formatMoney(data.total, data.tutor.currency)}</strong>
            </div>

            <motion.button
              type="button"
              className="confirm-payment-btn"
              disabled={loading}
              onClick={handleConfirm}
              whileHover={
                loading
                  ? {}
                  : {
                      y: -1,
                    }
              }
              whileTap={
                loading
                  ? {}
                  : {
                      scale: 0.985,
                    }
              }
            >
              {loading
                ? "Processing..."
                : paymentMethod === "later"
                  ? "Confirm booking"
                  : `Confirm & pay ${formatMoney(data.total, data.tutor.currency)}`}
            </motion.button>

            <div className="confirm-security-note">
              <ShieldCheck size={14} />

              <span>Secure booking powered by E-Tutor</span>
            </div>

            <p className="confirm-policy">
              By confirming, you agree to E-Tutor&apos;s cancellation policy.
            </p>
          </motion.aside>
        </div>
      </motion.div>
    </main>
  );
}

export default BookingConfirmation;
