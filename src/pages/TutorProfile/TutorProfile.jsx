import { Link, useParams } from "react-router";

import {
  ArrowLeft,
  Star,
  Heart,
  CheckCircle2,
  Clock3,
  CalendarDays,
  GraduationCap,
  Languages,
  BookOpen,
} from "lucide-react";

import { motion } from "motion/react";

import { useSavedTutors } from "../../context/SavedTutorsContext";

import { useTutors } from "../../context/TutorsContext";

import "./tutorProfile.css";

const pageVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.45,
      ease: "easeOut",
      staggerChildren: 0.07,
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
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

function TutorProfile() {
  const { id } = useParams();

  const { isTutorSaved, toggleSavedTutor } = useSavedTutors();

  const { getPublicTutorById } = useTutors();

  const tutor = getPublicTutorById(id);

  /* =========================
     NOT FOUND
  ========================= */

  if (!tutor) {
    return (
      <main className="tutor-profile-page">
        <div className="container">
          <div
            style={{
              padding: "160px 20px 100px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "24px",
                color: "#0f172a",
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

  const saved = isTutorSaved(tutor.id);

  const languageLabels = (tutor.languages || [])
    .map((language) =>
      typeof language === "string" ? language : language?.language,
    )
    .filter(Boolean)
    .join(", ");

  return (
    <main className="tutor-profile-page">
      <motion.div
        className="container"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* =========================
            BACK
        ========================= */}

        <motion.div variants={itemVariants}>
          <Link to="/tutors" className="tutor-back">
            <ArrowLeft size={16} />
            Back to tutors
          </Link>
        </motion.div>

        <div className="tutor-profile-layout">
          {/* ========================
              LEFT CONTENT
          ======================== */}

          <div className="tutor-profile-main">
            {/* =====================
                PROFILE HEADER
            ===================== */}

            <motion.section
              className="tutor-profile-card"
              variants={itemVariants}
            >
              <div className="tutor-profile-header">
                <div className="tutor-profile-image-wrapper">
                  <img
                    src={tutor.image}
                    alt={tutor.name}
                    className="tutor-profile-image"
                  />

                  {tutor.online && <span className="profile-online-dot" />}
                </div>

                <div className="tutor-profile-intro">
                  <div className="profile-name-row">
                    <div>
                      <h1>{tutor.name}</h1>

                      <p>{tutor.title}</p>
                    </div>

                    {/* Favorite */}

                    <motion.button
                      type="button"
                      className={`profile-favorite ${saved ? "active" : ""}`}
                      onClick={() => toggleSavedTutor(tutor.id)}
                      whileTap={{
                        scale: 0.9,
                      }}
                      aria-label={
                        saved
                          ? `Remove ${tutor.name} from saved tutors`
                          : `Save ${tutor.name}`
                      }
                    >
                      <Heart size={18} fill={saved ? "currentColor" : "none"} />
                    </motion.button>
                  </div>

                  {/* Rating */}

                  <div className="profile-rating">
                    <Star size={16} fill="currentColor" />

                    <strong>{tutor.rating}</strong>

                    <span>{tutor.reviews} reviews</span>

                    <span className="profile-dot">•</span>

                    <span>{tutor.lessons} lessons</span>
                  </div>

                  {/* Verified */}

                  {tutor.verified && (
                    <div className="profile-verified">
                      <CheckCircle2 size={15} />
                      Verified tutor
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

            {/* =====================
                ABOUT
            ===================== */}

            <motion.section className="profile-section" variants={itemVariants}>
              <h2>About me</h2>

              <p className="profile-about">{tutor.bio}</p>
            </motion.section>

            {/* =====================
                SUBJECTS / SKILLS
            ===================== */}

            <motion.section className="profile-section" variants={itemVariants}>
              <h2>Subjects I teach</h2>

              <div className="profile-subjects">
                <span>{tutor.subject}</span>

                {(tutor.tags || []).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </motion.section>

            {/* =====================
                DETAILS
            ===================== */}

            <motion.section className="profile-section" variants={itemVariants}>
              <h2>Tutor details</h2>

              <div className="profile-details-grid">
                {/* Experience */}

                <div className="profile-detail">
                  <div className="profile-detail-icon">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <span>Experience</span>

                    <strong>{tutor.experience}</strong>
                  </div>
                </div>

                {/* Languages */}

                <div className="profile-detail">
                  <div className="profile-detail-icon">
                    <Languages size={18} />
                  </div>

                  <div>
                    <span>Languages</span>

                    <strong>{languageLabels || "Not specified"}</strong>
                  </div>
                </div>

                {/* Education */}

                <div className="profile-detail">
                  <div className="profile-detail-icon">
                    <GraduationCap size={18} />
                  </div>

                  <div>
                    <span>Education</span>

                    <strong>{tutor.education}</strong>
                  </div>
                </div>

                {/* Lessons */}

                <div className="profile-detail">
                  <div className="profile-detail-icon">
                    <BookOpen size={18} />
                  </div>

                  <div>
                    <span>Lessons</span>

                    <strong>{tutor.lessons} completed</strong>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* =====================
                REVIEWS
            ===================== */}

            <motion.section className="profile-section" variants={itemVariants}>
              <div className="profile-section-heading">
                <h2>Student reviews</h2>

                <button type="button">View all</button>
              </div>

              <div className="review-card">
                <div className="review-card-header">
                  <div className="review-avatar">JM</div>

                  <div>
                    <strong>James Miller</strong>

                    <span>2 weeks ago</span>
                  </div>

                  <div className="review-rating">
                    <Star size={14} fill="currentColor" />
                    5.0
                  </div>
                </div>

                <p>
                  Great tutor. The lessons are clear, well structured, and easy
                  to follow. I feel much more confident now.
                </p>
              </div>
            </motion.section>
          </div>

          {/* ========================
              RIGHT BOOKING PANEL
          ======================== */}

          <motion.aside className="booking-card" variants={itemVariants}>
            {/* Price */}

            <div className="booking-price">
              <span>Lesson starts from</span>

              <div>
                <strong>${tutor.price}</strong>

                <span>/ hour</span>
              </div>
            </div>

            <div className="booking-divider" />

            {/* Info */}

            <div className="booking-info">
              <div>
                <CalendarDays size={17} />

                <span>Flexible availability</span>
              </div>

              <div>
                <Clock3 size={17} />

                <span>60-minute lessons</span>
              </div>

              {tutor.verified && (
                <div>
                  <CheckCircle2 size={17} />

                  <span>Verified tutor</span>
                </div>
              )}
            </div>

            {/* Book */}

            <Link to={`/tutors/${tutor.id}/book`} className="book-lesson-btn">
              Book a lesson
            </Link>

            {/* Message */}

            <Link
              to={`/dashboard/messages?tutor=${tutor.id}`}
              className="message-tutor-btn"
            >
              Message tutor
            </Link>

            <p className="booking-note">
              You won't be charged until your booking is confirmed.
            </p>
          </motion.aside>
        </div>
      </motion.div>
    </main>
  );
}

export default TutorProfile;
