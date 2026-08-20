import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Mail,
  MessageCircle,
  Search,
  UserRound,
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router";

import { motion } from "motion/react";

import { useAuth } from "../../../context/AuthContext";

import { useLessons } from "../../../context/LessonsContext";

import { useMessages } from "../../../context/MessagesContext";

import "./tutorLessons.css";

/* =====================================
   TABS
===================================== */

const tabs = [
  {
    value: "upcoming",
    label: "Upcoming",
  },

  {
    value: "completed",
    label: "Completed",
  },

  {
    value: "cancelled",
    label: "Cancelled",
  },
];

/* =====================================
   DATE
===================================== */

function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* =====================================
   COMPLETION TIME
===================================== */

function formatCompletionTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* =====================================
   FALLBACK STUDENT
===================================== */

function getLessonStudent(lesson, getAccountById) {
  const student = getAccountById(lesson.studentId);

  if (student) {
    return student;
  }

  return {
    id: lesson.studentId,

    fullName: lesson.studentName || `Student #${lesson.studentId || ""}`,

    initials: "ST",

    email: lesson.studentEmail || "",
  };
}

/* =====================================
   COMPONENT
===================================== */

function TutorLessons() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const { user, getAccountById } = useAuth();

  const {
    lessons,

    getTutorCompletionState,

    markLessonCompletedByTutor,
  } = useLessons();

  const { createConversation } = useMessages();

  const [activeTab, setActiveTab] = useState("upcoming");

  const [search, setSearch] = useState("");

  const [now, setNow] = useState(() => new Date());

  /* =====================================
     STUDENT FILTER FROM URL
  ===================================== */

  const studentFilter = searchParams.get("student");

  /* =====================================
     UPDATE TIME
  ===================================== */

  useEffect(() => {
    const timer = window.setInterval(
      () => {
        setNow(new Date());
      },

      30 * 1000,
    );

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /* =====================================
     CURRENT TUTOR LESSONS
  ===================================== */

  const tutorLessons = useMemo(() => {
    if (!user?.tutorId) {
      return [];
    }

    return lessons.filter(
      (lesson) => Number(lesson.tutorId) === Number(user.tutorId),
    );
  }, [lessons, user?.tutorId]);

  /* =====================================
     COUNTS
  ===================================== */

  const counts = useMemo(() => {
    const relevantLessons = studentFilter
      ? tutorLessons.filter(
          (lesson) => Number(lesson.studentId) === Number(studentFilter),
        )
      : tutorLessons;

    return {
      upcoming: relevantLessons.filter((lesson) => lesson.status === "upcoming")
        .length,

      completed: relevantLessons.filter(
        (lesson) => lesson.status === "completed",
      ).length,

      cancelled: relevantLessons.filter(
        (lesson) => lesson.status === "cancelled",
      ).length,
    };
  }, [tutorLessons, studentFilter]);

  /* =====================================
     FILTER
  ===================================== */

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = tutorLessons.filter((lesson) => lesson.status === activeTab);

    /* =====================================
           STUDENT FILTER
        ===================================== */

    if (studentFilter) {
      result = result.filter(
        (lesson) => Number(lesson.studentId) === Number(studentFilter),
      );
    }

    /* =====================================
           SEARCH
        ===================================== */

    if (query) {
      result = result.filter((lesson) => {
        const student = getLessonStudent(lesson, getAccountById);

        return (
          lesson.subject?.toLowerCase().includes(query) ||
          lesson.bookingId?.toLowerCase().includes(query) ||
          student.fullName?.toLowerCase().includes(query) ||
          student.email?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [tutorLessons, activeTab, search, studentFilter, getAccountById]);

  /* =====================================
     FILTERED STUDENT
  ===================================== */

  const filteredStudent = studentFilter ? getAccountById(studentFilter) : null;

  /* =====================================
     CLEAR STUDENT FILTER
  ===================================== */

  const clearStudentFilter = () => {
    setSearchParams({});
  };

  /* =====================================
     MESSAGE STUDENT
  ===================================== */

  const messageStudent = (lesson) => {
    if (!user?.tutorId || !lesson?.studentId) {
      return;
    }

    /*
        Create conversation for older/demo
        lessons if it doesn't already exist.

        MessagesContext prevents duplicates.
      */

    createConversation(
      Number(user.tutorId),

      Number(lesson.studentId),
    );

    navigate(`/tutor/messages?student=${lesson.studentId}`);
  };

  /* =====================================
     COMPLETE LESSON
  ===================================== */

  const completeLesson = (lesson) => {
    if (!lesson || !user?.tutorId) {
      return;
    }

    const completionState = getTutorCompletionState(
      lesson.id,

      user.tutorId,

      new Date(),
    );

    if (!completionState?.canComplete) {
      return;
    }

    markLessonCompletedByTutor(
      lesson.id,

      user.tutorId,
    );
  };

  return (
    <motion.main
      className="tutor-lessons-page"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.25,
      }}
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="tutor-lessons-heading">
        <div>
          <span>TEACHING</span>

          <h1>My lessons</h1>

          <p>
            Manage your scheduled lessons and communicate with your students.
          </p>
        </div>
      </div>

      {/* =====================================
          STUDENT FILTER
      ===================================== */}

      {studentFilter && (
        <div className="tutor-lessons-student-filter">
          <div>
            <UserRound size={14} />

            <span>
              Showing lessons for{" "}
              <strong>
                {filteredStudent?.fullName || `Student #${studentFilter}`}
              </strong>
            </span>
          </div>

          <button type="button" onClick={clearStudentFilter}>
            Show all lessons
          </button>
        </div>
      )}

      {/* =====================================
          TABS
      ===================================== */}

      <div className="tutor-lessons-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={activeTab === tab.value ? "active" : ""}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}

            <span>{counts[tab.value]}</span>
          </button>
        ))}
      </div>

      {/* =====================================
          TOOLBAR
      ===================================== */}

      <div className="tutor-lessons-toolbar">
        <div>
          <Search size={15} />

          <input
            type="text"
            value={search}
            placeholder="Search student, subject or booking ID..."
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {/* =====================================
          LIST
      ===================================== */}

      <div className="tutor-lessons-list">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => {
            const student = getLessonStudent(lesson, getAccountById);

            const completionState =
              lesson.status === "upcoming"
                ? getTutorCompletionState(
                    lesson.id,

                    user.tutorId,

                    now,
                  )
                : null;

            return (
              <article key={lesson.id} className="tutor-lesson-row">
                {/* =====================================
                      MAIN ROW
                  ===================================== */}

                <div className="tutor-lesson-row-main">
                  {/* =====================================
                        STUDENT
                    ===================================== */}

                  <div className="tutor-lesson-student">
                    <div className="tutor-lesson-student-avatar">
                      {student.initials ? (
                        student.initials
                      ) : (
                        <UserRound size={16} />
                      )}
                    </div>

                    <div className="tutor-lesson-student-info">
                      <span className="tutor-lesson-subject">
                        {lesson.subject}
                      </span>

                      <strong>{student.fullName}</strong>

                      {student.email && (
                        <span className="tutor-lesson-student-email">
                          <Mail size={11} />

                          {student.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* =====================================
                        SCHEDULE
                    ===================================== */}

                  <div className="tutor-lesson-schedule">
                    <span>
                      <CalendarDays size={13} />

                      {formatDate(lesson.date)}
                    </span>

                    <span>
                      <Clock3 size={13} />

                      {lesson.time}
                    </span>

                    <span>{lesson.duration} min</span>
                  </div>

                  {/* =====================================
                        BOOKING
                    ===================================== */}

                  <div className="tutor-lesson-booking">
                    <span>Booking</span>

                    <strong>{lesson.bookingId || "—"}</strong>
                  </div>

                  {/* =====================================
                        STATUS / ACTION
                    ===================================== */}

                  <div className="tutor-lesson-row-actions">
                    <span className={`tutor-lesson-status ${lesson.status}`}>
                      {lesson.status === "upcoming" && "Upcoming"}

                      {lesson.status === "completed" && "Completed"}

                      {lesson.status === "cancelled" && "Cancelled"}
                    </span>

                    {/* =====================================
                          MESSAGE
                      ===================================== */}

                    <button
                      type="button"
                      className="tutor-message-student"
                      onClick={() => messageStudent(lesson)}
                    >
                      <MessageCircle size={13} />
                      Message student
                    </button>

                    {/* =====================================
                          COMPLETE
                      ===================================== */}

                    {lesson.status === "upcoming" && (
                      <div className="tutor-completion-action">
                        <button
                          type="button"
                          className="tutor-mark-completed"
                          disabled={!completionState?.canComplete}
                          onClick={() => completeLesson(lesson)}
                        >
                          {completionState?.canComplete ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <LockKeyhole size={13} />
                          )}
                          Mark as completed
                        </button>

                        {!completionState?.canComplete &&
                          completionState?.reason === "too_early" && (
                            <small className="tutor-completion-hint">
                              Available after{" "}
                              <strong>
                                {formatCompletionTime(
                                  completionState.availableAt,
                                )}
                              </strong>
                            </small>
                          )}

                        {!completionState?.canComplete &&
                          completionState?.reason === "invalid_schedule" && (
                            <small className="tutor-completion-hint error">
                              Invalid lesson schedule
                            </small>
                          )}
                      </div>
                    )}

                    {/* =====================================
                          COMPLETED
                      ===================================== */}

                    {lesson.status === "completed" && (
                      <span className="tutor-completed-text">
                        <CheckCircle2 size={13} />
                        Lesson delivered
                      </span>
                    )}
                  </div>
                </div>

                {/* =====================================
                      STUDENT NOTE
                  ===================================== */}

                {lesson.studentNote?.trim() && (
                  <div className="tutor-lesson-note">
                    <div className="tutor-lesson-note-icon">
                      <MessageCircle size={14} />
                    </div>

                    <div>
                      <span>NOTE FROM STUDENT</span>

                      <p>{lesson.studentNote}</p>
                    </div>
                  </div>
                )}

                {/* =====================================
                      CANCEL DETAILS
                  ===================================== */}

                {lesson.status === "cancelled" &&
                  (lesson.cancellationReason || lesson.reason) && (
                    <div className="tutor-lesson-cancel-reason">
                      <span>Cancellation reason:</span>

                      <strong>
                        {lesson.cancellationReason || lesson.reason}
                      </strong>
                    </div>
                  )}
              </article>
            );
          })
        ) : (
          <div className="tutor-lessons-empty">
            <CalendarDays size={25} />

            <strong>
              {studentFilter
                ? `No ${activeTab} lessons for this student`
                : `No ${activeTab} lessons`}
            </strong>

            <span>Lessons will appear here when available.</span>
          </div>
        )}
      </div>
    </motion.main>
  );
}

export default TutorLessons;
