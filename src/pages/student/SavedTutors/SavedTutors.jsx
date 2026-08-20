import { useMemo, useState } from "react";

import { Link } from "react-router";

import {
  BookOpen,
  CalendarDays,
  Heart,
  Search,
  Star,
  Users,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import { useSavedTutors } from "../../../context/SavedTutorsContext";

import { useTutors } from "../../../context/TutorsContext";

import "./SavedTutors.css";

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

function SavedTutors() {
  const { savedTutorIds, removeSavedTutor } = useSavedTutors();

  const { getPublicTutorById } = useTutors();

  const [search, setSearch] = useState("");

  const [subject, setSubject] = useState("All");

  /*
    بنجيب بيانات المدرسين
    الحقيقية من TutorsContext
    بناءً على savedTutorIds.
  */

  const savedTutors = useMemo(() => {
    return savedTutorIds
      .map((tutorId) => getPublicTutorById(tutorId))
      .filter(Boolean);
  }, [savedTutorIds, getPublicTutorById]);

  /*
    الـSubjects نفسها
    تتولد تلقائي من المدرسين
    المحفوظين.
  */

  const subjects = useMemo(() => {
    return ["All", ...new Set(savedTutors.map((tutor) => tutor.subject))];
  }, [savedTutors]);

  const filteredTutors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return savedTutors.filter((tutor) => {
      const matchesSearch =
        tutor.name.toLowerCase().includes(query) ||
        tutor.title.toLowerCase().includes(query) ||
        tutor.subject.toLowerCase().includes(query) ||
        (tutor.tags || []).some((tag) => String(tag).toLowerCase().includes(query));

      const matchesSubject = subject === "All" || tutor.subject === subject;

      return matchesSearch && matchesSubject;
    });
  }, [savedTutors, search, subject]);

  const onlineCount = savedTutors.filter((tutor) => tutor.online).length;

  const subjectsCount = new Set(savedTutors.map((tutor) => tutor.subject)).size;

  const clearFilters = () => {
    setSearch("");

    setSubject("All");
  };

  const handleRemoveTutor = (tutorId) => {
    removeSavedTutor(tutorId);

    /*
      لو المستخدم حذف آخر Tutor
      من مادة معينة،
      نرجع الفلتر لـ All.
    */

    const tutor = getPublicTutorById(tutorId);

    if (tutor && subject === tutor.subject) {
      const remaining = savedTutors.filter(
        (item) => item.id !== tutorId && item.subject === subject,
      );

      if (remaining.length === 0) {
        setSubject("All");
      }
    }
  };

  return (
    <motion.main
      className="saved-tutors-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* =========================
          HEADER
      ========================= */}

      <motion.div className="saved-tutors-header" variants={itemVariants}>
        <div>
          <span className="saved-tutors-eyebrow">FAVORITES</span>

          <h1>Saved tutors</h1>

          <p>
            Keep your favorite tutors in one place and book whenever you're
            ready.
          </p>
        </div>

        <Link to="/tutors" className="saved-tutors-browse">
          <Search size={15} />
          Browse tutors
        </Link>
      </motion.div>

      {/* =========================
          SUMMARY
      ========================= */}

      <motion.div className="saved-summary" variants={itemVariants}>
        <div className="saved-summary-icon">
          <Heart size={19} />
        </div>

        <div>
          <span>Saved tutors</span>

          <strong>{savedTutors.length}</strong>
        </div>

        <div className="saved-summary-divider" />

        <div>
          <span>Subjects</span>

          <strong>{subjectsCount}</strong>
        </div>

        <div className="saved-summary-divider" />

        <div>
          <span>Online now</span>

          <strong>{onlineCount}</strong>
        </div>
      </motion.div>

      {/* =========================
          TOOLBAR
      ========================= */}

      {savedTutors.length > 0 && (
        <motion.div className="saved-toolbar" variants={itemVariants}>
          {/* Search */}

          <div className="saved-search">
            <Search size={16} />

            <input
              type="text"
              value={search}
              placeholder="Search saved tutors..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {/* Subjects */}

          <div className="saved-subject-filter">
            {subjects.map((item) => (
              <button
                type="button"
                key={item}
                className={subject === item ? "active" : ""}
                onClick={() => setSubject(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* =========================
          RESULT COUNT
      ========================= */}

      {savedTutors.length > 0 && (
        <motion.div className="saved-results" variants={itemVariants}>
          <span>
            <strong>{filteredTutors.length}</strong>{" "}
            {filteredTutors.length === 1 ? "saved tutor" : "saved tutors"}
          </span>
        </motion.div>
      )}

      {/* =========================
          TUTOR GRID
      ========================= */}

      {filteredTutors.length > 0 ? (
        <motion.div className="saved-tutors-grid" layout>
          <AnimatePresence>
            {filteredTutors.map((tutor) => (
              <motion.article
                key={tutor.id}
                layout
                className="saved-tutor-card"
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.97,
                  y: -5,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                {/* =====================
                      IMAGE
                  ===================== */}

                <div className="saved-tutor-image">
                  <img src={tutor.image} alt={tutor.name} />

                  <motion.button
                    type="button"
                    className="saved-heart"
                    onClick={() => handleRemoveTutor(tutor.id)}
                    whileTap={{
                      scale: 0.9,
                    }}
                    aria-label={`Remove ${tutor.name} from saved tutors`}
                  >
                    <Heart size={17} fill="currentColor" />
                  </motion.button>

                  {tutor.online && (
                    <span className="saved-online">
                      <span />
                      Online
                    </span>
                  )}
                </div>

                {/* =====================
                      CONTENT
                  ===================== */}

                <div className="saved-tutor-content">
                  <span className="saved-tutor-subject">{tutor.subject}</span>

                  <Link to={`/tutors/${tutor.id}`} className="saved-tutor-name">
                    {tutor.name}
                  </Link>

                  <p className="saved-tutor-title">{tutor.title}</p>

                  {/* Rating */}

                  <div className="saved-tutor-rating">
                    <Star size={13} fill="currentColor" />

                    <strong>{tutor.rating}</strong>

                    <span>({tutor.reviews} reviews)</span>

                    <span className="saved-rating-divider">•</span>

                    <span>{tutor.lessons} lessons</span>
                  </div>

                  {/* Tags */}

                  <div className="saved-tags">
                    {tutor.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  {/* Price */}

                  <div className="saved-tutor-price">
                    <div>
                      <span>Lesson from</span>

                      <strong>
                        ${tutor.price}
                        <small>/ hour</small>
                      </strong>
                    </div>

                    <BookOpen size={17} />
                  </div>

                  {/* Actions */}

                  <div className="saved-tutor-actions">
                    <Link
                      to={`/tutors/${tutor.id}/book`}
                      className="saved-book-button"
                    >
                      <CalendarDays size={14} />
                      Book lesson
                    </Link>

                    <Link
                      to={`/tutors/${tutor.id}`}
                      className="saved-profile-button"
                    >
                      View profile
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : savedTutors.length === 0 ? (
        /*
          مفيش Saved Tutors خالص.
        */

        <motion.div
          className="saved-empty"
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <div className="saved-empty-icon">
            <Heart size={23} />
          </div>

          <h2>No saved tutors yet</h2>

          <p>Save tutors you're interested in and they'll appear here.</p>

          <Link to="/tutors" className="saved-empty-primary">
            <Users size={14} />
            Browse tutors
          </Link>
        </motion.div>
      ) : (
        /*
          فيه Saved Tutors،
          بس الفلتر أو البحث
          مش لاقي نتيجة.
        */

        <motion.div
          className="saved-empty"
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <div className="saved-empty-icon">
            <Search size={23} />
          </div>

          <h2>No tutors found</h2>

          <p>Try changing your search or subject filter.</p>

          <button
            type="button"
            className="saved-empty-primary"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </motion.div>
      )}
    </motion.main>
  );
}

export default SavedTutors;
