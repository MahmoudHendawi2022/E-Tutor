import { useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Mail,
  Search,
  UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";

import { motion } from "motion/react";

import { useAuth } from "../../../context/AuthContext";

import { useLessons } from "../../../context/LessonsContext";
import { TutorPageHeader, TutorStatCard } from "../../../components/tutor";

import "./tutorStudents.css";

/* =====================================
   DATE
===================================== */

function getLessonDateTime(lesson) {
  if (!lesson?.date) {
    return null;
  }

  const date = new Date(`${lesson.date}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (!lesson.time) {
    return date;
  }

  const time = String(lesson.time).trim().toUpperCase();

  /* 12 hour */

  const twelveHour = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (twelveHour) {
    let hours = Number(twelveHour[1]);

    const minutes = Number(twelveHour[2]);

    const period = twelveHour[3];

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    date.setHours(hours, minutes, 0, 0);

    return date;
  }

  /* 24 hour */

  const twentyFourHour = time.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFourHour) {
    date.setHours(
      Number(twentyFourHour[1]),

      Number(twentyFourHour[2]),

      0,

      0,
    );
  }

  return date;
}

/* =====================================
   FORMAT DATE
===================================== */

function formatDate(lesson) {
  if (!lesson) {
    return "—";
  }

  const date = getLessonDateTime(lesson);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",

    day: "numeric",

    year: "numeric",
  });
}

/* =====================================
   PAGE ANIMATION
===================================== */

const pageVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.05,

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
      duration: 0.28,

      ease: "easeOut",
    },
  },
};

/* =====================================
   COMPONENT
===================================== */

function TutorStudents() {
  const { user, getAccountById } = useAuth();

  const { lessons } = useLessons();

  const [search, setSearch] = useState("");

  /* =====================================
     CURRENT TUTOR LESSONS
  ===================================== */

  const tutorLessons = useMemo(() => {
    return lessons.filter(
      (lesson) => Number(lesson.tutorId) === Number(user?.tutorId),
    );
  }, [lessons, user?.tutorId]);

  /* =====================================
     BUILD STUDENTS
  ===================================== */

  const students = useMemo(() => {
    const studentIds = [
      ...new Set(
        tutorLessons.map((lesson) => Number(lesson.studentId)).filter(Boolean),
      ),
    ];

    return studentIds
      .map((studentId) => {
        const student = getAccountById(studentId);

        if (!student) {
          return null;
        }

        const studentLessons = tutorLessons.filter(
          (lesson) => Number(lesson.studentId) === studentId,
        );

        const completedLessons = studentLessons.filter(
          (lesson) => lesson.status === "completed",
        );

        const upcomingLessons = studentLessons
          .filter((lesson) => lesson.status === "upcoming")
          .sort((a, b) => {
            const first = getLessonDateTime(a)?.getTime() ?? Infinity;

            const second = getLessonDateTime(b)?.getTime() ?? Infinity;

            return first - second;
          });

        const cancelledLessons = studentLessons.filter(
          (lesson) => lesson.status === "cancelled",
        );

        const previousLessons = studentLessons
          .filter(
            (lesson) =>
              lesson.status === "completed" || lesson.status === "cancelled",
          )
          .sort((a, b) => {
            const first = getLessonDateTime(a)?.getTime() ?? 0;

            const second = getLessonDateTime(b)?.getTime() ?? 0;

            return second - first;
          });

        return {
          student,

          lessons: studentLessons,

          totalLessons: studentLessons.length,

          completedCount: completedLessons.length,

          upcomingCount: upcomingLessons.length,

          cancelledCount: cancelledLessons.length,

          nextLesson: upcomingLessons[0] || null,

          lastLesson: previousLessons[0] || null,
        };
      })
      .filter(Boolean);
  }, [tutorLessons, getAccountById]);

  /* =====================================
     SEARCH
  ===================================== */

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter(({ student }) => {
      return (
        student.fullName?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.country?.toLowerCase().includes(query)
      );
    });
  }, [students, search]);

  /* =====================================
     TOTALS
  ===================================== */

  const activeStudents = students.filter(
    (item) => item.upcomingCount > 0,
  ).length;

  const totalCompleted = tutorLessons.filter(
    (lesson) => lesson.status === "completed",
  ).length;

  return (
    <motion.main
      className="tutor-students-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <TutorPageHeader
        eyebrow="STUDENTS"
        title="My students"
        description="View students who have booked lessons with you."
        className="tutor-students-heading"
        variants={itemVariants}
      />

      {/* =====================================
          STATS
      ===================================== */}

      <motion.div className="tutor-student-stats" variants={itemVariants}>
        <TutorStatCard
          icon={UserRound}
          label="Total students"
          value={students.length}
          iconElement="span"
          iconClassName="tutor-student-stat-icon"
          labelElement="small"
        />

        <TutorStatCard
          icon={CalendarDays}
          label="Active students"
          value={activeStudents}
          iconElement="span"
          iconClassName="tutor-student-stat-icon"
          labelElement="small"
        />

        <TutorStatCard
          icon={GraduationCap}
          label="Total lessons"
          value={tutorLessons.length}
          iconElement="span"
          iconClassName="tutor-student-stat-icon"
          labelElement="small"
        />

        <TutorStatCard
          icon={CheckCircle2}
          label="Completed"
          value={totalCompleted}
          iconElement="span"
          iconClassName="tutor-student-stat-icon"
          labelElement="small"
        />
      </motion.div>

      {/* =====================================
          SEARCH
      ===================================== */}

      <motion.div className="tutor-students-toolbar" variants={itemVariants}>
        <div>
          <Search size={15} />

          <input
            type="text"
            value={search}
            placeholder="Search students..."
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </motion.div>

      {/* =====================================
          STUDENTS
      ===================================== */}

      <motion.div className="tutor-students-list" variants={itemVariants}>
        {filteredStudents.length > 0 ? (
          filteredStudents.map(
            ({
              student,

              totalLessons,

              completedCount,

              upcomingCount,

              cancelledCount,

              nextLesson,

              lastLesson,
            }) => (
              <article key={student.id} className="tutor-student-card">
                {/* =====================================
                    STUDENT
                ===================================== */}

                <div className="tutor-student-main">
                  <div className="tutor-student-avatar">
                    {student.initials || "ST"}
                  </div>

                  <div>
                    <strong>{student.fullName}</strong>

                    <span>
                      <Mail size={11} />

                      {student.email}
                    </span>
                  </div>
                </div>

                {/* =====================================
                    STATS
                ===================================== */}

                <div className="tutor-student-card-stats">
                  <div>
                    <span>Total</span>

                    <strong>{totalLessons}</strong>
                  </div>

                  <div>
                    <span>Completed</span>

                    <strong>{completedCount}</strong>
                  </div>

                  <div>
                    <span>Upcoming</span>

                    <strong>{upcomingCount}</strong>
                  </div>

                  <div>
                    <span>Cancelled</span>

                    <strong>{cancelledCount}</strong>
                  </div>
                </div>

                {/* =====================================
                    DATES
                ===================================== */}

                <div className="tutor-student-schedule">
                  <div>
                    <Clock3 size={13} />

                    <section>
                      <span>Last lesson</span>

                      <strong>{formatDate(lastLesson)}</strong>
                    </section>
                  </div>

                  <div>
                    <CalendarDays size={13} />

                    <section>
                      <span>Next lesson</span>

                      <strong>
                        {nextLesson
                          ? `${formatDate(nextLesson)} · ${nextLesson.time}`
                          : "Not scheduled"}
                      </strong>
                    </section>
                  </div>
                </div>

                {/* =====================================
                    ACTION
                ===================================== */}

                <div className="tutor-student-action">
                  <Link to={`/tutor/lessons?student=${student.id}`}>
                    View lessons
                  </Link>
                </div>
              </article>
            ),
          )
        ) : (
          <div className="tutor-students-empty">
            <UserRound size={25} />

            <strong>No students found</strong>

            <span>
              Students will appear here after booking lessons with you.
            </span>
          </div>
        )}
      </motion.div>
    </motion.main>
  );
}

export default TutorStudents;
