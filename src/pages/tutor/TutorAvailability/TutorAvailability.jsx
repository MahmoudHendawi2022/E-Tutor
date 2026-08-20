import { useEffect } from "react";

import { Clock3, Globe2, Plus, Trash2 } from "lucide-react";

import { motion } from "motion/react";

import { useAuth } from "../../../context/AuthContext";

import {
  availabilityDays,
  useAvailability,
} from "../../../context/AvailabilityContext";

import "./tutorAvailability.css";

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

function TutorAvailability() {
  const { user } = useAuth();

  const {
    ensureTutor,

    getTutorAvailability,

    setDayEnabled,

    addRange,

    updateRange,

    removeRange,

    setTutorTimezone,
  } = useAvailability();

  const tutorId = Number(user?.tutorId);

  /* =====================================
     ENSURE RECORD
  ===================================== */

  useEffect(() => {
    if (!tutorId) {
      return;
    }

    ensureTutor(tutorId);
  }, [tutorId, ensureTutor]);

  const availability = getTutorAvailability(tutorId);

  const activeDays = availabilityDays.filter(
    (day) => availability.week[day.key]?.enabled,
  ).length;

  const totalRanges = availabilityDays.reduce(
    (total, day) => total + (availability.week[day.key]?.ranges?.length || 0),

    0,
  );

  return (
    <motion.main
      className="tutor-availability-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <motion.div
        className="tutor-availability-heading"
        variants={itemVariants}
      >
        <div>
          <span>SCHEDULE</span>

          <h1>Availability</h1>

          <p>Choose when students can book lessons with you.</p>
        </div>
      </motion.div>

      {/* =====================================
          SUMMARY
      ===================================== */}

      <motion.div
        className="tutor-availability-summary"
        variants={itemVariants}
      >
        <div>
          <Clock3 size={17} />

          <section>
            <span>Available days</span>

            <strong>{activeDays}</strong>
          </section>
        </div>

        <div>
          <Clock3 size={17} />

          <section>
            <span>Time ranges</span>

            <strong>{totalRanges}</strong>
          </section>
        </div>

        <div className="tutor-availability-timezone-card">
          <Globe2 size={17} />

          <section>
            <span>Timezone</span>

            <strong>{availability.timezone}</strong>
          </section>
        </div>
      </motion.div>

      {/* =====================================
          TIMEZONE
      ===================================== */}

      <motion.section
        className="tutor-availability-card"
        variants={itemVariants}
      >
        <div className="tutor-availability-card-heading">
          <div>
            <h2>Timezone</h2>

            <p>Your availability is displayed using this timezone.</p>
          </div>
        </div>

        <div className="tutor-timezone-field">
          <Globe2 size={15} />

          <input
            type="text"
            value={availability.timezone}
            onChange={(event) =>
              setTutorTimezone(
                tutorId,

                event.target.value,
              )
            }
          />
        </div>
      </motion.section>

      {/* =====================================
          WEEK
      ===================================== */}

      <motion.section
        className="tutor-availability-card"
        variants={itemVariants}
      >
        <div className="tutor-availability-card-heading">
          <div>
            <h2>Weekly hours</h2>

            <p>Set your recurring teaching schedule.</p>
          </div>
        </div>

        <div className="tutor-availability-week">
          {availabilityDays.map((dayDefinition) => {
            const day = availability.week[dayDefinition.key] || {
              enabled: false,
              ranges: [],
            };

            return (
              <div
                key={dayDefinition.key}
                className={`tutor-availability-day ${
                  day.enabled ? "enabled" : ""
                }`}
              >
                {/* DAY */}

                <div className="tutor-availability-day-name">
                  <button
                    type="button"
                    className={`tutor-availability-switch ${
                      day.enabled ? "active" : ""
                    }`}
                    onClick={() =>
                      setDayEnabled(
                        tutorId,

                        dayDefinition.key,

                        !day.enabled,
                      )
                    }
                    aria-label={`Toggle ${dayDefinition.label}`}
                  >
                    <span />
                  </button>

                  <strong>{dayDefinition.label}</strong>
                </div>

                {/* RANGES */}

                <div className="tutor-availability-ranges">
                  {!day.enabled ? (
                    <span className="tutor-availability-unavailable">
                      Unavailable
                    </span>
                  ) : (
                    <>
                      {day.ranges.map((range) => (
                        <div
                          key={range.id}
                          className="tutor-availability-range"
                        >
                          <input
                            type="time"
                            value={range.start}
                            onChange={(event) =>
                              updateRange(
                                tutorId,

                                dayDefinition.key,

                                range.id,

                                {
                                  start: event.target.value,
                                },
                              )
                            }
                          />

                          <span>to</span>

                          <input
                            type="time"
                            value={range.end}
                            onChange={(event) =>
                              updateRange(
                                tutorId,

                                dayDefinition.key,

                                range.id,

                                {
                                  end: event.target.value,
                                },
                              )
                            }
                          />

                          <button
                            type="button"
                            className="tutor-availability-remove"
                            onClick={() =>
                              removeRange(
                                tutorId,

                                dayDefinition.key,

                                range.id,
                              )
                            }
                            aria-label="Remove time range"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {day.ranges.length === 0 && (
                        <span className="tutor-availability-no-hours">
                          No hours added
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* ADD */}

                <div className="tutor-availability-day-action">
                  {day.enabled && (
                    <button
                      type="button"
                      onClick={() =>
                        addRange(
                          tutorId,

                          dayDefinition.key,
                        )
                      }
                    >
                      <Plus size={14} />
                      Add hours
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* =====================================
          NOTE
      ===================================== */}

      <motion.div className="tutor-availability-note" variants={itemVariants}>
        <Clock3 size={15} />

        <p>
          Changes are saved automatically. Booked lessons will remain scheduled
          even if you later change your availability.
        </p>
      </motion.div>
    </motion.main>
  );
}

export default TutorAvailability;
