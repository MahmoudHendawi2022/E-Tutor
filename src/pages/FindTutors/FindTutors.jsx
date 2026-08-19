import { useMemo, useState } from "react";

import { Link } from "react-router";

import {
  Search,
  SlidersHorizontal,
  Star,
  Heart,
  ChevronDown,
} from "lucide-react";

import { motion } from "motion/react";

import { useSavedTutors } from "../../context/SavedTutorsContext";

import { useTutors } from "../../context/TutorsContext";

import "./findTutors.css";

const containerVariants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      type: "tween",
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

function FindTutors() {
  const { publicTutors: tutors } = useTutors();

  const { isTutorSaved, toggleSavedTutor } = useSavedTutors();

  const [search, setSearch] = useState("");

  const [subject, setSubject] = useState("All subjects");

  const [sort, setSort] = useState("Recommended");

  /* =========================
     SUBJECTS
  ========================= */

  const subjects = useMemo(() => {
    return ["All subjects", ...new Set(tutors.map((tutor) => tutor.subject))];
  }, [tutors]);

  /* =========================
     FILTER + SORT
  ========================= */

  const filteredTutors = useMemo(() => {
    const value = search.trim().toLowerCase();

    const result = tutors.filter((tutor) => {
      const matchesSearch =
        tutor.name.toLowerCase().includes(value) ||
        tutor.subject.toLowerCase().includes(value) ||
        (tutor.tags || []).some((tag) =>
          String(tag).toLowerCase().includes(value),
        );

      const matchesSubject =
        subject === "All subjects" || tutor.subject === subject;

      return matchesSearch && matchesSubject;
    });

    return [...result].sort((a, b) => {
      if (sort === "Highest rated") {
        return b.rating - a.rating;
      }

      if (sort === "Lowest price") {
        return a.price - b.price;
      }

      if (sort === "Highest price") {
        return b.price - a.price;
      }

      /*
            Recommended
            يفضل بنفس ترتيب tutors.js
          */

      return 0;
    });
  }, [tutors, search, subject, sort]);

  return (
    <main className="tutors-page">
      <div className="container">
        {/* =========================
            HEADING
        ========================= */}

        <motion.div
          className="tutors-heading"
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
          }}
        >
          <span>FIND YOUR TUTOR</span>

          <h1>Learn from the right expert</h1>

          <p>
            Search qualified tutors and choose the one that matches your goals,
            schedule, and learning style.
          </p>
        </motion.div>

        {/* =========================
            SEARCH + FILTERS
        ========================= */}

        <motion.div
          className="tutor-tools"
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            delay: 0.1,
            ease: "easeOut",
          }}
        >
          {/* Search */}

          <div className="tutor-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search by tutor, subject or skill..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {/* Subject */}

          <div className="tutor-filter">
            <SlidersHorizontal size={16} />

            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            >
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <ChevronDown size={15} />
          </div>

          {/* Sort */}

          <div className="tutor-filter">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="Recommended">Recommended</option>

              <option value="Highest rated">Highest rated</option>

              <option value="Lowest price">Lowest price</option>

              <option value="Highest price">Highest price</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </motion.div>

        {/* =========================
            RESULTS
        ========================= */}

        <div className="tutors-results-header">
          <p>
            <strong>{filteredTutors.length}</strong>{" "}
            {filteredTutors.length === 1 ? "tutor" : "tutors"} available
          </p>
        </div>

        {/* =========================
            CARDS
        ========================= */}

        {filteredTutors.length > 0 ? (
          <motion.div
            className="tutors-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredTutors.map((tutor) => {
              const saved = isTutorSaved(tutor.id);

              return (
                <motion.article
                  key={tutor.id}
                  className="tutor-card"
                  variants={cardVariants}
                >
                  {/* =====================
                        TOP
                    ===================== */}

                  <div className="tutor-card-top">
                    <div className="tutor-image-wrapper">
                      <img
                        src={tutor.image}
                        alt={tutor.name}
                        className="tutor-image"
                      />

                      {tutor.online && <span className="online-dot" />}
                    </div>

                    {/* Favorite */}

                    <motion.button
                      type="button"
                      className={`tutor-favorite ${saved ? "active" : ""}`}
                      onClick={() => toggleSavedTutor(tutor.id)}
                      whileTap={{
                        scale: 0.88,
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

                  {/* =====================
                        INFO
                    ===================== */}

                  <div className="tutor-info">
                    <h2>{tutor.name}</h2>

                    <p className="tutor-specialty">{tutor.subject}</p>

                    {/* Rating */}

                    <div className="tutor-rating">
                      <Star size={15} fill="currentColor" />

                      <strong>{tutor.rating}</strong>

                      <span>({tutor.reviews})</span>

                      <span className="rating-divider">•</span>

                      <span>{tutor.lessons} lessons</span>
                    </div>

                    {/* Description */}

                    <p className="tutor-description">{tutor.bio}</p>

                    {/* Tags */}

                    <div className="tutor-tags">
                      {tutor.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* =====================
                        FOOTER
                    ===================== */}

                  <div className="tutor-card-footer">
                    <div className="tutor-price">
                      <span>From</span>

                      <div>
                        <strong>${tutor.price}</strong>

                        <span>/ hour</span>
                      </div>
                    </div>

                    <Link
                      to={`/tutors/${tutor.id}`}
                      className="view-profile-btn"
                    >
                      View profile
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        ) : (
          /* =========================
              EMPTY
          ========================= */

          <motion.div
            className="no-tutors"
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <h3>No tutors found</h3>

            <p>Try searching with another name, subject, or skill.</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default FindTutors;
