import { useMemo } from "react";

import { Link } from "react-router";

import {
  CalendarDays,
  ChevronRight,
  Clock3,
  GraduationCap,
  Search,
  Star,
  Video,
} from "lucide-react";

import { motion } from "motion/react";

import { useAuth } from "../../../context/AuthContext";

import { useLessons } from "../../../context/LessonsContext";

import { studentTutorRelations } from "../../../data/student";

import { useTutors } from "../../../context/TutorsContext";

import "./studentDashboard.css";

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

    y: 12,
  },

  visible: {
    opacity: 1,

    y: 0,

    transition: {
      type: "tween",

      duration: 0.32,

      ease: "easeOut",
    },
  },
};

/* =====================================
   DATE
===================================== */

function getLessonDate(dateString) {
  return new Date(`${dateString}T12:00:00`);
}

function formatLessonDate(dateString) {
  const date = getLessonDate(dateString);

  return {
    month: date
      .toLocaleDateString("en-US", {
        month: "short",
      })
      .toUpperCase(),

    day: date.toLocaleDateString("en-US", {
      day: "2-digit",
    }),
  };
}

/* =====================================
   LESSON DATE + TIME
===================================== */

function getLessonDateTime(lesson) {
  const date = getLessonDate(lesson.date);

  if (!lesson.time) {
    return date;
  }

  const time = lesson.time.trim().toUpperCase();

  /* 24-hour */

  const twentyFourHour = time.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFourHour) {
    date.setHours(
      Number(twentyFourHour[1]),

      Number(twentyFourHour[2]),

      0,

      0,
    );

    return date;
  }

  /* 12-hour */

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

    date.setHours(
      hours,

      minutes,

      0,

      0,
    );
  }

  return date;
}

/* =====================================
   TIME FORMAT
===================================== */

function formatLessonTime(time) {
  if (!time) {
    return "";
  }

  if (/AM|PM/i.test(time)) {
    return time;
  }

  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();

  date.setHours(
    hours,

    minutes,

    0,

    0,
  );

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",

    minute: "2-digit",
  }).format(date);
}

/* =====================================
   NEXT LESSON TEXT
===================================== */

function getNextLessonText(lesson) {
  if (!lesson) {
    return "No lessons scheduled";
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),

    now.getMonth(),

    now.getDate(),
  );

  const lessonDate = getLessonDate(lesson.date);

  const target = new Date(
    lessonDate.getFullYear(),

    lessonDate.getMonth(),

    lessonDate.getDate(),
  );

  const difference = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (difference <= 0) {
    return "Next lesson today";
  }

  if (difference === 1) {
    return "Next lesson tomorrow";
  }

  return `Next lesson in ${difference} days`;
}

/* =====================================
   ACTIVITY TIME
===================================== */

function getActivityTime(value) {
  const activityDate = new Date(value);

  if (Number.isNaN(activityDate.getTime())) {
    return "";
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),

    now.getMonth(),

    now.getDate(),
  );

  const activityDay = new Date(
    activityDate.getFullYear(),

    activityDate.getMonth(),

    activityDate.getDate(),
  );

  const difference = Math.floor((today - activityDay) / (1000 * 60 * 60 * 24));

  if (difference <= 0) {
    return "Today";
  }

  if (difference === 1) {
    return "Yesterday";
  }

  if (difference < 7) {
    return `${difference} days ago`;
  }

  return activityDate.toLocaleDateString("en-US", {
    month: "short",

    day: "numeric",
  });
}

/* =====================================
   HOURS
===================================== */

function formatHours(value) {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(1);
}

/* =====================================
   COMPONENT
===================================== */

function StudentDashboard() {
  const { getTutorById } = useTutors();

  /* =====================================
     AUTH
  ===================================== */

  const { user } = useAuth();

  const firstName =
    user?.firstName || user?.fullName?.split(" ")[0] || "Student";

  /* =====================================
     LESSONS
  ===================================== */

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

  /* =====================================
     DATE + GREETING
  ===================================== */

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",

    month: "long",

    day: "numeric",
  })
    .format(new Date())
    .toUpperCase();

  const hour = new Date().getHours();

  let greeting = "Good evening";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 18) {
    greeting = "Good afternoon";
  }

  /* =====================================
     UPCOMING LESSONS
  ===================================== */

  const upcomingLessons = useMemo(() => {
    return lessons
      .filter((lesson) => lesson.status === "upcoming")
      .sort((a, b) => getLessonDateTime(a) - getLessonDateTime(b));
  }, [lessons]);

  const dashboardLessons = upcomingLessons.slice(0, 2);

  const nextLesson = upcomingLessons[0] || null;

  /* =====================================
     COMPLETED LESSONS
  ===================================== */

  const completedLessons = useMemo(() => {
    return lessons.filter((lesson) => lesson.status === "completed");
  }, [lessons]);

  const learningHours = useMemo(() => {
    const minutes = completedLessons.reduce(
      (total, lesson) => total + Number(lesson.duration || 0),

      0,
    );

    return minutes / 60;
  }, [completedLessons]);

  /* =====================================
     MY TUTORS
  ===================================== */

  const myTutors = useMemo(() => {
    /*
          Existing historical
          tutor relations.
        */

    const tutorIds = new Set(
      historicalRelations.map((relation) => relation.tutorId),
    );

    /*
          Tutors from actual lessons.

          Any newly booked tutor
          appears automatically.
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

        const tutorLessons = lessons.filter(
          (lesson) => lesson.tutorId === tutor.id,
        );

        const upcomingTutorLessons = tutorLessons
          .filter((lesson) => lesson.status === "upcoming")
          .sort((a, b) => getLessonDateTime(a) - getLessonDateTime(b));

        const nextTutorLesson = upcomingTutorLessons[0] || null;

        const newlyCreatedLessons = tutorLessons.filter(
          (lesson) => lesson.createdAt && lesson.status !== "cancelled",
        ).length;

        const lessonsCount = relation
          ? relation.lessonsCount + newlyCreatedLessons
          : tutorLessons.filter((lesson) => lesson.status !== "cancelled")
              .length;

        const active = Boolean(nextTutorLesson) || Boolean(relation?.active);

        const progress = relation?.progress ?? 0;

        const latestBookingTime = tutorLessons.reduce((latest, lesson) => {
          if (!lesson.createdAt) {
            return latest;
          }

          const value = new Date(lesson.createdAt).getTime();

          return Math.max(latest, value);
        }, 0);

        return {
          tutor,

          relation,

          lessonsCount,

          nextTutorLesson,

          active,

          progress,

          latestBookingTime,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.latestBookingTime !== a.latestBookingTime) {
          return b.latestBookingTime - a.latestBookingTime;
        }

        if (a.active !== b.active) {
          return a.active ? -1 : 1;
        }

        return a.tutor.id - b.tutor.id;
      });
  }, [lessons]);

  const activeTutors = useMemo(
    () => myTutors.filter((item) => item.active),
    [myTutors],
  );

  const progressTutors = activeTutors;

  const dashboardTutors = activeTutors;

  /* =====================================
     RECENT ACTIVITY
  ===================================== */

  const activities = useMemo(() => {
    return lessons
      .filter(
        (lesson) =>
          lesson.createdAt ||
          lesson.status === "completed" ||
          lesson.status === "cancelled",
      )
      .map((lesson) => {
        const tutor = getTutorById(lesson.tutorId);

        const activityDate =
          lesson.completedAt ||
          lesson.cancelledAt ||
          lesson.createdAt ||
          `${lesson.date}T12:00:00`;

        let title = "Lesson updated";

        let type = "lesson";

        if (lesson.status === "upcoming") {
          title = "New lesson booked";

          type = "booking";
        }

        if (lesson.status === "completed") {
          title = "Lesson completed";

          type = "lesson";
        }

        if (lesson.status === "cancelled") {
          title = "Lesson cancelled";

          type = "booking";
        }

        return {
          id: lesson.id,

          title,

          description: tutor
            ? `${lesson.subject} with ${tutor.name}`
            : lesson.subject,

          time: getActivityTime(activityDate),

          type,

          sortDate: new Date(activityDate).getTime(),
        };
      })
      .sort((a, b) => b.sortDate - a.sortDate)
      .slice(0, 3);
  }, [lessons]);

  return (
    <motion.main
      className="student-main"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* =====================================
          WELCOME
      ===================================== */}

      <motion.div className="student-welcome" variants={itemVariants}>
        <div>
          <span>{today}</span>

          <h1>
            {greeting}, {firstName}
          </h1>

          <p>Here's what's happening with your learning today.</p>
        </div>

        <Link to="/tutors" className="student-book-button">
          Book a lesson
        </Link>
      </motion.div>

      {/* =====================================
          STATS
      ===================================== */}

      <motion.div className="student-stats" variants={itemVariants}>
        {/* Upcoming */}

        <div className="student-stat-card">
          <div className="student-stat-icon">
            <CalendarDays size={18} />
          </div>

          <div>
            <span>Upcoming lessons</span>

            <strong>{upcomingLessons.length}</strong>

            <small>{getNextLessonText(nextLesson)}</small>
          </div>
        </div>

        {/* Hours */}

        <div className="student-stat-card">
          <div className="student-stat-icon">
            <Clock3 size={18} />
          </div>

          <div>
            <span>Learning hours</span>

            <strong>{formatHours(learningHours)}</strong>

            <small>From completed lessons</small>
          </div>
        </div>

        {/* Tutors */}

        <div className="student-stat-card">
          <div className="student-stat-icon">
            <GraduationCap size={18} />
          </div>

          <div>
            <span>My tutors</span>

            <strong>{myTutors.length}</strong>

            <small>{activeTutors.length} active tutors</small>
          </div>
        </div>

        {/* Completed */}

        <div className="student-stat-card">
          <div className="student-stat-icon">
            <Star size={18} />
          </div>

          <div>
            <span>Lessons completed</span>

            <strong>{completedLessons.length}</strong>

            <small>Great progress</small>
          </div>
        </div>
      </motion.div>

      {/* =====================================
          GRID
      ===================================== */}

      <div className="student-dashboard-grid">
        {/* =====================================
            LEFT
        ===================================== */}

        <div className="student-dashboard-left">
          {/* =====================================
              UPCOMING
          ===================================== */}

          <motion.section className="student-section" variants={itemVariants}>
            <div className="student-section-heading">
              <div>
                <h2>Upcoming lessons</h2>

                <p>Your next scheduled sessions.</p>
              </div>

              <Link to="/dashboard/lessons">
                View all
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="student-lessons">
              {dashboardLessons.length > 0 ? (
                dashboardLessons.map((lesson) => {
                  const tutor = getTutorById(lesson.tutorId);

                  if (!tutor) {
                    return null;
                  }

                  const date = formatLessonDate(lesson.date);

                  return (
                    <div key={lesson.id} className="student-lesson">
                      <div className="student-lesson-date">
                        <span>{date.month}</span>

                        <strong>{date.day}</strong>
                      </div>

                      <img src={tutor.image} alt={tutor.name} />

                      <div className="student-lesson-info">
                        <h3>{lesson.subject}</h3>

                        <p>with {tutor.name}</p>

                        <div className="student-lesson-meta">
                          <span>
                            <Clock3 size={12} />

                            {formatLessonTime(lesson.time)}
                          </span>

                          <span>{lesson.duration} min</span>
                        </div>
                      </div>

                      <div className="student-lesson-actions">
                        <span className="student-lesson-status">Confirmed</span>

                        {lesson.canJoin && lesson.meetingUrl && (
                          <a
                            href={lesson.meetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="student-join-lesson"
                          >
                            <Video size={14} />
                            Join
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: "24px 0",

                    color: "#64748b",

                    fontSize: "13px",
                  }}
                >
                  No upcoming lessons yet.
                </div>
              )}
            </div>
          </motion.section>

          {/* =====================================
              PROGRESS
          ===================================== */}

          <motion.section className="student-section" variants={itemVariants}>
            <div className="student-section-heading">
              <div>
                <h2>Learning progress</h2>

                <p>Your progress across active subjects.</p>
              </div>
            </div>

            <div className="student-progress-list">
              {progressTutors.map((item, index) => {
                const {
                  tutor,

                  lessonsCount,

                  progress,
                } = item;

                return (
                  <div key={tutor.id} className="student-progress-item">
                    <div className="student-progress-top">
                      <div>
                        <strong>{tutor.subject}</strong>

                        <span>{lessonsCount} lessons</span>
                      </div>

                      <strong>{progress}%</strong>
                    </div>

                    <div className="student-progress-bar">
                      <motion.span
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${progress}%`,
                        }}
                        transition={{
                          duration: 0.8,

                          delay: 0.35 + index * 0.1,

                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>

        {/* =====================================
            RIGHT
        ===================================== */}

        <div className="student-dashboard-right">
          {/* =====================================
              MY TUTORS
          ===================================== */}

          <motion.section className="student-section" variants={itemVariants}>
            <div className="student-section-heading">
              <div>
                <h2>My tutors</h2>

                <p>Tutors you're learning with.</p>
              </div>

              <Link to="/dashboard/tutors">View all</Link>
            </div>

            <div className="student-tutor-list">
              {dashboardTutors.map(({ tutor }) => (
                <Link
                  key={tutor.id}
                  to={`/tutors/${tutor.id}`}
                  className="student-tutor-item"
                >
                  <img src={tutor.image} alt={tutor.name} />

                  <div>
                    <strong>{tutor.name}</strong>

                    <span>{tutor.shortTitle}</span>
                  </div>

                  <div className="student-tutor-rating">
                    <Star size={12} fill="currentColor" />

                    {tutor.rating}
                  </div>
                </Link>
              ))}
            </div>

            <Link to="/tutors" className="student-add-tutor">
              <Search size={14} />
              Find another tutor
            </Link>
          </motion.section>

          {/* =====================================
              ACTIVITY
          ===================================== */}

          <motion.section className="student-section" variants={itemVariants}>
            <div className="student-section-heading">
              <div>
                <h2>Recent activity</h2>

                <p>Latest updates from your account.</p>
              </div>
            </div>

            <div className="student-activity-list">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="student-activity-item">
                    <div className={`student-activity-dot ${activity.type}`} />

                    <div>
                      <strong>{activity.title}</strong>

                      <p>{activity.description}</p>

                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: "12px 0",

                    color: "#64748b",

                    fontSize: "12px",
                  }}
                >
                  No recent activity.
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </motion.main>
  );
}

export default StudentDashboard;
