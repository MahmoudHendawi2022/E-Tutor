import { Link, useLocation } from "react-router";

import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Download,
  ShieldCheck,
  Video,
} from "lucide-react";

import { motion } from "motion/react";

import { useTutors } from "../../context/TutorsContext";

import "./bookingSuccess.css";

const containerVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
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

/* =====================================
   COMPONENT
===================================== */

function BookingSuccess() {
  const location = useLocation();

  const { getTutorById } = useTutors();

  const booking = location.state?.booking;

  /*
    Tutor ID comes from booking state,
    but the actual tutor data comes
    from the dynamic TutorsContext.
  */

  const tutor = booking?.tutor?.id ? getTutorById(booking.tutor.id) : null;

  const lessonDate = booking?.date ? new Date(booking.date) : null;

  const validDate = lessonDate && !Number.isNaN(lessonDate.getTime());

  const validBooking = Boolean(
    booking &&
    tutor &&
    validDate &&
    booking.time &&
    booking.lessonId &&
    booking.bookingReference &&
    Number(booking.duration) > 0 &&
    Number.isFinite(Number(booking.total)),
  );

  const bookingReference = booking?.bookingReference;

  /* =====================================
     INVALID / DIRECT ACCESS
  ===================================== */

  if (!validBooking) {
    return (
      <main className="success-page">
        <div className="success-container">
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
              This page is available after completing a lesson booking.
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

  /*
    Normalize values once so the UI
    doesn't depend on route-state types.
  */

  const data = {
    ...booking,

    tutor: {
      id: tutor.id,

      name: tutor.name,

      title: tutor.title,

      image: tutor.image,

      price: tutor.price,
    },

    duration: Number(booking.duration),

    total: Number(booking.total),
  };

  const formattedDate = lessonDate.toLocaleDateString("en-US", {
    weekday: "long",

    month: "long",

    day: "numeric",

    year: "numeric",
  });

  /* =====================================
     ADD TO CALENDAR
  ===================================== */

  const handleAddToCalendar = () => {
    const lessonStart = new Date(data.date);

    const [hours, minutes] = data.time.split(":").map(Number);

    lessonStart.setHours(hours, minutes, 0, 0);

    const lessonEnd = new Date(
      lessonStart.getTime() + data.duration * 60 * 1000,
    );

    const formatCalendarDate = (date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const calendarContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//E-Tutor//Lesson Booking//EN
BEGIN:VEVENT
UID:${bookingReference}@etutor
DTSTAMP:${formatCalendarDate(new Date())}
DTSTART:${formatCalendarDate(lessonStart)}
DTEND:${formatCalendarDate(lessonEnd)}
SUMMARY:E-Tutor lesson with ${tutor.name}
DESCRIPTION:Online lesson with ${tutor.name}
LOCATION:Online
END:VEVENT
END:VCALENDAR
      `.trim();

    const blob = new Blob([calendarContent], {
      type: "text/calendar;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `e-tutor-${bookingReference}.ics`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <main className="success-page">
      <motion.div
        className="success-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* =========================
            STATUS
        ========================= */}

        <motion.div className="success-status" variants={itemVariants}>
          <motion.div
            className="success-check"
            initial={{
              scale: 0.7,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 22,
              delay: 0.1,
            }}
          >
            <Check size={25} />
          </motion.div>

          <span className="success-label">BOOKING CONFIRMED</span>

          <h1>Your lesson is booked</h1>

          <p>
            Everything is ready. We've saved your lesson and its details below.
          </p>
        </motion.div>

        {/* =========================
            LESSON CARD
        ========================= */}

        <motion.section className="success-card" variants={itemVariants}>
          {/* HEADER */}

          <div className="success-card-header">
            <div className="success-tutor">
              <img src={tutor.image} alt={tutor.name} />

              <div>
                <span>Lesson with</span>

                <h2>{tutor.name}</h2>

                <p>{tutor.title}</p>
              </div>
            </div>

            <div className="success-reference">
              <span>Booking reference</span>

              <strong>{bookingReference}</strong>
            </div>
          </div>

          <div className="success-divider" />

          {/* =====================
              DETAILS
          ===================== */}

          <div className="success-details">
            {/* DATE */}

            <div className="success-detail">
              <div className="success-detail-icon">
                <CalendarDays size={18} />
              </div>

              <div>
                <span>Date</span>

                <strong>{formattedDate}</strong>
              </div>
            </div>

            {/* TIME */}

            <div className="success-detail">
              <div className="success-detail-icon">
                <Clock3 size={18} />
              </div>

              <div>
                <span>Time</span>

                <strong>{formatTime(data.time)}</strong>
              </div>
            </div>

            {/* LESSON */}

            <div className="success-detail">
              <div className="success-detail-icon">
                <Video size={18} />
              </div>

              <div>
                <span>Lesson</span>

                <strong>Online · {data.duration} min</strong>
              </div>
            </div>
          </div>

          <div className="success-divider" />

          {/* =====================
              PAYMENT
          ===================== */}

          <div className="success-payment">
            <div>
              <span>Total</span>

              <strong>{formatMoney(data.total, data.tutor?.currency || "USD")}</strong>
            </div>

            <div className="success-payment-status">
              <ShieldCheck size={14} />

              {data.paymentMethod === "later"
                ? "Booking secured"
                : "Payment secured"}
            </div>
          </div>
        </motion.section>

        {/* =========================
            ACTIONS
        ========================= */}

        <motion.div className="success-actions" variants={itemVariants}>
          <button
            type="button"
            className="calendar-button"
            onClick={handleAddToCalendar}
          >
            <Download size={16} />
            Add to calendar
          </button>

          <Link to="/dashboard" className="dashboard-button">
            Go to dashboard
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* =========================
            NEXT STEP
        ========================= */}

        <motion.div className="success-next" variants={itemVariants}>
          <strong>What's next?</strong>

          <p>
            You'll find this lesson under your upcoming lessons. The lesson link
            will be available before your scheduled session.
          </p>
        </motion.div>

        <motion.p className="success-home" variants={itemVariants}>
          Need another tutor?
          <Link to="/tutors">Browse tutors</Link>
        </motion.p>
      </motion.div>
    </main>
  );
}

export default BookingSuccess;
