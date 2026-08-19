import { useMemo, useState } from "react";

import { Link } from "react-router";

import {
  CalendarDays,
  Clock3,
  GraduationCap,
  MessageCircle,
  Search,
  Star,
} from "lucide-react";

import { motion } from "motion/react";

import { useLessons } from "../../context/LessonsContext";

import { studentTutorRelations } from "../../data/student";

import { useTutors } from "../../context/TutorsContext";

import { useAuth } from "../../context/AuthContext";

import "./myTutors.css";

const containerVariants = {
  hidden: {},

  visible: {
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
   DATE FORMAT
===================================== */

function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateString) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* =====================================
   TIME FORMAT
===================================== */

function formatTime(time) {
  if (!time) {
    return "";
  }

  /*
    Already formatted:
    10:00 AM
  */

  if (/AM|PM/i.test(time)) {
    return time;
  }

  /*
    24-hour:
    16:30
  */

  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/* =====================================
   DATE + TIME FOR SORTING
===================================== */

function getLessonDateTime(lesson) {
  const date = new Date(`${lesson.date}T12:00:00`);

  if (!lesson.time) {
    return date;
  }

  const time = lesson.time.trim().toUpperCase();

  /*
    24-hour format
  */

  const twentyFourHour = time.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFourHour) {
    date.setHours(Number(twentyFourHour[1]), Number(twentyFourHour[2]), 0, 0);

    return date;
  }

  /*
    12-hour format
  */

  const twelveHour = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (twelveHour) {
    let hours = Number(twelveHour[1]);

    const minutes = Number(twelveHour[2]);

    const period = twelveHour[3];

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    date.setHours(hours, minutes, 0, 0);
  }

  return date;
}

/* =====================================
   LATEST DATE
===================================== */

function getLatestDate(first, second) {
  if (!first) {
    return second || null;
  }

  if (!second) {
    return first;
  }

  const firstDate = new Date(`${first}T12:00:00`);

  const secondDate = new Date(`${second}T12:00:00`);

  return secondDate > firstDate ? second : first;
}

/* =====================================
   COMPONENT
===================================== */

function MyTutors() {
  const { user } = useAuth();

  const { getTutorById } = useTutors();

  const { lessons: allLessons } = useLessons();

  const lessons = useMemo(
    () =>
      allLessons.filter(
        (lesson) => Number(lesson.studentId) === Number(user?.id),
      ),
    [allLessons, user?.id],
  );

  const historicalRelations =
    Number(user?.id) === 1 ? studentTutorRelations : [];

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  /* =====================================
     BUILD TUTOR LIST
  ===================================== */

  const myTutors = useMemo(() => {
    /*
        Start with tutors from the
        student's existing relations.
      */

    const tutorIds = new Set(
      historicalRelations.map((relation) => relation.tutorId),
    );

    /*
        Also include every tutor
        that appears in LessonsContext.

        This means a newly-booked tutor
        automatically appears here.
      */

    lessons.forEach((lesson) => {
      tutorIds.add(lesson.tutorId);
    });

    return Array.from(tutorIds)
      .map((tutorId) => {
        const tutor = getTutorById(tutorId);

        if (!tutor) {
          return null;
        }

        const relation =
          historicalRelations.find((item) => item.tutorId === tutor.id) ||
          null;

        /* =====================
               TUTOR LESSONS
            ===================== */

        const tutorLessons = lessons.filter(
          (lesson) => lesson.tutorId === tutor.id,
        );

        /* =====================
               NEXT LESSON
            ===================== */

        const upcomingLessons = tutorLessons
          .filter((lesson) => lesson.status === "upcoming")
          .sort((a, b) => getLessonDateTime(a) - getLessonDateTime(b));

        const nextLesson = upcomingLessons[0] || null;

        /* =====================
               COMPLETED LESSONS
            ===================== */

        const completedLessons = tutorLessons
          .filter((lesson) => lesson.status === "completed")
          .sort((a, b) => getLessonDateTime(b) - getLessonDateTime(a));

        const latestCompletedLesson = completedLessons[0] || null;

        /*
              studentTutorRelations contains
              historical summary data.

              LessonsContext only contains
              the currently-loaded lesson
              records plus new bookings.

              So we preserve the historical
              total and add newly-created
              bookings instead of dropping
              an 8-lesson tutor down to 2.
            */

        const newlyCreatedLessons = tutorLessons.filter(
          (lesson) => lesson.createdAt && lesson.status !== "cancelled",
        ).length;

        const lessonCount = relation
          ? relation.lessonsCount + newlyCreatedLessons
          : tutorLessons.filter((lesson) => lesson.status !== "cancelled")
              .length;

        /*
              Use the relation's historical
              last lesson, but allow a newer
              completed lesson from context
              to replace it.
            */

        const lastLesson = getLatestDate(
          relation?.lastLesson,
          latestCompletedLesson?.date,
        );

        /*
              Existing relation can keep a
              tutor active even when there
              isn't currently a scheduled
              lesson.

              New tutors become active as
              soon as they have an upcoming
              lesson.
            */

        const active = Boolean(nextLesson) || Boolean(relation?.active);

        return {
          tutor,

          relation,

          tutorLessons,

          nextLesson,

          lessonCount,

          lastLesson,

          active,

          progress: relation?.progress ?? 0,
        };
      })
      .filter(Boolean);
  }, [lessons]);

  /* =====================================
     SEARCH + FILTER
  ===================================== */

  const filteredTutors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return myTutors.filter(({ tutor, active }) => {
      const matchesSearch =
        tutor.name.toLowerCase().includes(query) ||
        tutor.title.toLowerCase().includes(query) ||
        tutor.subject.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && active) ||
        (filter === "past" && !active);

      return matchesSearch && matchesFilter;
    });
  }, [myTutors, search, filter]);

  /* =====================================
     SUMMARY
  ===================================== */

  const activeTutors = myTutors.filter(({ active }) => active).length;

  const totalLessons = myTutors.reduce(
    (total, item) => total + item.lessonCount,
    0,
  );

  const totalSubjects = new Set(myTutors.map(({ tutor }) => tutor.subject))
    .size;

  return (
    <motion.main
      className="my-tutors-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* =========================
          HEADER
      ========================= */}

      <motion.div className="my-tutors-header" variants={itemVariants}>
        <div>
          <span className="my-tutors-eyebrow">LEARNING</span>

          <h1>My tutors</h1>

          <p>
            Manage the tutors you've learned with and book your next lesson.
          </p>
        </div>

        <Link to="/tutors" className="my-tutors-find">
          <Search size={15} />
          Find a tutor
        </Link>
      </motion.div>

      {/* =========================
          SUMMARY
      ========================= */}

      <motion.div className="my-tutors-summary" variants={itemVariants}>
        <div>
          <span>Tutors</span>

          <strong>{myTutors.length}</strong>
        </div>

        <div>
          <span>Active tutors</span>

          <strong>{activeTutors}</strong>
        </div>

        <div>
          <span>Total lessons</span>

          <strong>{totalLessons}</strong>
        </div>

        <div>
          <span>Subjects</span>

          <strong>{totalSubjects}</strong>
        </div>
      </motion.div>

      {/* =========================
          TOOLBAR
      ========================= */}

      <motion.div className="my-tutors-toolbar" variants={itemVariants}>
        <div className="my-tutors-search">
          <Search size={16} />

          <input
            type="text"
            value={search}
            placeholder="Search tutors or subjects..."
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="my-tutors-filters">
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            type="button"
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            Active
          </button>

          <button
            type="button"
            className={filter === "past" ? "active" : ""}
            onClick={() => setFilter("past")}
          >
            Past
          </button>
        </div>
      </motion.div>

      {/* =========================
          RESULTS
      ========================= */}

      <motion.div className="my-tutors-results" variants={itemVariants}>
        <span>
          <strong>{filteredTutors.length}</strong>{" "}
          {filteredTutors.length === 1 ? "tutor" : "tutors"}
        </span>
      </motion.div>

      {/* =========================
          GRID
      ========================= */}

      {filteredTutors.length > 0 ? (
        <motion.div className="my-tutors-grid" variants={containerVariants}>
          {filteredTutors.map(
            ({
              tutor,
              nextLesson,
              lessonCount,
              lastLesson,
              active,
              progress,
            }) => (
              <motion.article
                key={tutor.id}
                className="my-tutor-card"
                variants={itemVariants}
              >
                {/* =====================
                    TOP
                ===================== */}

                <div className="my-tutor-top">
                  <div className="my-tutor-profile">
                    <div className="my-tutor-avatar">
                      <img src={tutor.image} alt={tutor.name} />

                      {tutor.online && <span />}
                    </div>

                    <div className="my-tutor-profile-info">
                      <Link to={`/tutors/${tutor.id}`}>{tutor.name}</Link>

                      <span>{tutor.title}</span>

                      <div className="my-tutor-rating">
                        <Star size={12} fill="currentColor" />

                        <strong>{tutor.rating}</strong>

                        <span>({tutor.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`my-tutor-state ${active ? "active" : "past"}`}
                  >
                    {active ? "Active" : "Past tutor"}
                  </span>
                </div>

                {/* =====================
                    STATS
                ===================== */}

                <div className="my-tutor-stats">
                  <div>
                    <span>Subject</span>

                    <strong>{tutor.subject}</strong>
                  </div>

                  <div>
                    <span>Lessons</span>

                    <strong>{lessonCount}</strong>
                  </div>

                  <div>
                    <span>Last lesson</span>

                    <strong>{formatDate(lastLesson)}</strong>
                  </div>
                </div>

                {/* =====================
                    NEXT LESSON
                ===================== */}

                {nextLesson ? (
                  <div className="my-tutor-next">
                    <div className="my-tutor-next-heading">
                      <span>NEXT LESSON</span>

                      <span className="my-tutor-confirmed">Confirmed</span>
                    </div>

                    <div className="my-tutor-next-details">
                      <div>
                        <CalendarDays size={14} />

                        <span>{formatShortDate(nextLesson.date)}</span>
                      </div>

                      <div>
                        <Clock3 size={14} />

                        <span>
                          {formatTime(nextLesson.time)}
                          {" · "}
                          {nextLesson.duration} min
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="my-tutor-no-lesson">
                    <CalendarDays size={15} />

                    <div>
                      <strong>No upcoming lesson</strong>

                      <span>Book your next session when you're ready.</span>
                    </div>
                  </div>
                )}

                {/* =====================
                    PROGRESS
                ===================== */}

                <div className="my-tutor-progress">
                  <div className="my-tutor-progress-heading">
                    <span>Learning progress</span>

                    <strong>{progress}%</strong>
                  </div>

                  <div className="my-tutor-progress-bar">
                    <motion.span
                      initial={{
                        width: 0,
                      }}
                      whileInView={{
                        width: `${progress}%`,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 0.7,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>

                {/* =====================
                    ACTIONS
                ===================== */}

                <div className="my-tutor-actions">
                  <Link
                    to={`/tutors/${tutor.id}/book`}
                    className="my-tutor-book"
                  >
                    <CalendarDays size={14} />

                    {nextLesson ? "Book another" : "Book lesson"}
                  </Link>

                  <Link
                    to={`/dashboard/messages?tutor=${tutor.id}`}
                    className="my-tutor-message"
                  >
                    <MessageCircle size={14} />
                    Message
                  </Link>

                  <Link to={`/tutors/${tutor.id}`} className="my-tutor-view">
                    View profile
                  </Link>
                </div>
              </motion.article>
            ),
          )}
        </motion.div>
      ) : (
        <motion.div className="my-tutors-empty" variants={itemVariants}>
          <div className="my-tutors-empty-icon">
            <GraduationCap size={23} />
          </div>

          <h2>No tutors found</h2>

          <p>Try changing your search or filter.</p>

          <Link to="/tutors">Browse tutors</Link>
        </motion.div>
      )}
    </motion.main>
  );
}

export default MyTutors;
