import { useMemo } from "react";

import { Link } from "react-router";

import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
} from "lucide-react";

import { motion } from "motion/react";

import { useAuth } from "../../context/AuthContext";

import { useLessons } from "../../context/LessonsContext";

import { useTutors } from "../../context/TutorsContext";

import "./tutorDashboard.css";

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
      duration: 0.3,

      ease: "easeOut",
    },
  },
};

function getLessonDateTime(lesson) {
  if (!lesson?.date) {
    return new Date(8640000000000000);
  }

  const date = new Date(`${lesson.date}T00:00:00`);

  const time = String(lesson.time || "")
    .trim()
    .toUpperCase();

  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);

  if (!match) {
    return date;
  }

  let hours = Number(match[1]);

  const minutes = Number(match[2]);

  const period = match[3];

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  date.setHours(hours, minutes, 0, 0);

  return date;
}

function formatDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",

    month: "short",

    day: "numeric",
  });
}

function TutorDashboard() {
  const { getTutorById } = useTutors();

  const { user } = useAuth();

  const { lessons } = useLessons();

  const tutor = getTutorById(user?.tutorId);

  const firstName = user?.firstName || tutor?.name?.split(" ")[0] || "Tutor";

  const tutorLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) => Number(lesson.tutorId) === Number(user?.tutorId),
      ),

    [lessons, user?.tutorId],
  );

  const upcoming = useMemo(
    () =>
      tutorLessons
        .filter((lesson) => lesson.status === "upcoming")
        .sort((a, b) => getLessonDateTime(a) - getLessonDateTime(b)),

    [tutorLessons],
  );

  const completed = tutorLessons.filter(
    (lesson) => lesson.status === "completed",
  );

  const cancelled = tutorLessons.filter(
    (lesson) => lesson.status === "cancelled",
  );

  const nextLessons = upcoming.slice(0, 4);

  return (
    <motion.main
      className="tutor-dashboard-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* WELCOME */}

      <motion.div className="tutor-dashboard-welcome" variants={itemVariants}>
        <div>
          <span>TUTOR DASHBOARD</span>

          <h1>Welcome back, {firstName}</h1>

          <p>Here's an overview of your teaching activity.</p>
        </div>

        <Link to="/tutor/lessons">Manage lessons</Link>
      </motion.div>

      {/* STATS */}

      <motion.div className="tutor-dashboard-stats" variants={itemVariants}>
        <div className="tutor-dashboard-stat">
          <div>
            <CalendarDays size={18} />
          </div>

          <section>
            <span>Upcoming lessons</span>

            <strong>{upcoming.length}</strong>
          </section>
        </div>

        <div className="tutor-dashboard-stat">
          <div>
            <CheckCircle2 size={18} />
          </div>

          <section>
            <span>Completed</span>

            <strong>{completed.length}</strong>
          </section>
        </div>

        <div className="tutor-dashboard-stat">
          <div>
            <GraduationCap size={18} />
          </div>

          <section>
            <span>Total lessons</span>

            <strong>{tutorLessons.length}</strong>
          </section>
        </div>

        <div className="tutor-dashboard-stat">
          <div>
            <Clock3 size={18} />
          </div>

          <section>
            <span>Cancelled</span>

            <strong>{cancelled.length}</strong>
          </section>
        </div>
      </motion.div>

      {/* UPCOMING */}

      <motion.section className="tutor-dashboard-card" variants={itemVariants}>
        <div className="tutor-dashboard-card-header">
          <div>
            <h2>Upcoming lessons</h2>

            <p>Your next scheduled sessions.</p>
          </div>

          <Link to="/tutor/lessons">
            View all
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="tutor-dashboard-lessons">
          {nextLessons.length > 0 ? (
            nextLessons.map((lesson) => (
              <div key={lesson.id} className="tutor-dashboard-lesson">
                <div className="tutor-dashboard-lesson-date">
                  <CalendarDays size={15} />
                </div>

                <div className="tutor-dashboard-lesson-info">
                  <strong>{lesson.subject}</strong>

                  <span>
                    {formatDate(lesson.date)}
                    {" · "}
                    {lesson.time}
                  </span>
                </div>

                <div className="tutor-dashboard-lesson-duration">
                  {lesson.duration} min
                </div>
              </div>
            ))
          ) : (
            <div className="tutor-dashboard-empty">
              <CalendarDays size={23} />

              <strong>No upcoming lessons</strong>

              <span>New bookings will appear here.</span>
            </div>
          )}
        </div>
      </motion.section>
    </motion.main>
  );
}

export default TutorDashboard;
