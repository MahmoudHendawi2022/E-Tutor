import { useEffect, useMemo } from "react";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageCircle,
} from "lucide-react";

import { motion } from "motion/react";

import { useAvailability } from "../../../context/AvailabilityContext";

import { useLessons } from "../../../context/LessonsContext";

import "./availabilitySchedulePicker.css";

/* =====================================
   DATE KEY
===================================== */

function getDateKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =====================================
   BUILD NEXT DAYS
===================================== */

function createDates(amount = 14) {
  const result = [];

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  for (let index = 0; index < amount; index += 1) {
    const date = new Date(today);

    date.setDate(today.getDate() + index);

    result.push(date);
  }

  return result;
}

/* =====================================
   TIME LABEL
===================================== */

function formatTime(value) {
  if (!value) {
    return "";
  }

  const [hours, minutes] = value.split(":").map(Number);

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",

    minute: "2-digit",
  });
}

/* =====================================
   COMPONENT
===================================== */

function AvailabilitySchedulePicker({
  tutorId,

  duration,

  selectedDate,

  setSelectedDate,

  selectedTime,

  setSelectedTime,

  onMessageTutor,
}) {
  const { lessons } = useLessons();

  const { getAvailableSlots, getTutorAvailability } = useAvailability();

  /* =====================================
     NEXT 14 DAYS
  ===================================== */

  const dates = useMemo(() => createDates(14), []);

  /* =====================================
     TUTOR AVAILABILITY
  ===================================== */

  const tutorAvailability = getTutorAvailability(tutorId);

  /* =====================================
     AVAILABLE SLOTS
  ===================================== */

  const availableSlots = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return getAvailableSlots({
      tutorId,

      date: selectedDate,

      duration,

      lessons,
    });
  }, [tutorId, selectedDate, duration, lessons, getAvailableSlots]);

  /* =====================================
     RESET TIME WHEN DATE /
     DURATION CHANGES
  ===================================== */

  useEffect(() => {
    if (!selectedTime) {
      return;
    }

    if (!availableSlots.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [availableSlots, selectedTime, setSelectedTime]);

  /* =====================================
     DATE AVAILABILITY
  ===================================== */

  const dateItems = useMemo(() => {
    return dates.map((date) => {
      const slots = getAvailableSlots({
        tutorId,

        date,

        duration,

        lessons,
      });

      return {
        date,

        slots,

        available: slots.length > 0,
      };
    });
  }, [dates, tutorId, duration, lessons, getAvailableSlots]);

  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : "";

  return (
    <section className="availability-picker">
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="availability-picker-header">
        <div className="availability-picker-icon">
          <CalendarDays size={18} />
        </div>

        <div>
          <h2>Choose a date & time</h2>

          <p>Showing times made available by the tutor.</p>
        </div>
      </div>

      {/* =====================================
          TIMEZONE
      ===================================== */}

      <div className="availability-timezone">
        <Clock3 size={13} />

        <span>
          Times shown in{" "}
          <strong>
            {tutorAvailability?.timezone || "your local timezone"}
          </strong>
        </span>
      </div>

      {/* =====================================
          DATES
      ===================================== */}

      <div className="availability-date-wrapper">
        <button
          type="button"
          className="availability-date-arrow"
          disabled
          aria-label="Previous dates"
        >
          <ChevronLeft size={15} />
        </button>

        <div className="availability-dates">
          {dateItems.map(({ date, available }) => {
            const dateKey = getDateKey(date);

            const active = selectedDateKey === dateKey;

            return (
              <motion.button
                key={dateKey}
                type="button"
                disabled={!available}
                className={`availability-date ${active ? "active" : ""}`}
                onClick={() => {
                  setSelectedDate(new Date(date));

                  setSelectedTime("");
                }}
                whileTap={
                  available
                    ? {
                        scale: 0.97,
                      }
                    : {}
                }
              >
                <span>
                  {date
                    .toLocaleDateString("en-US", {
                      weekday: "short",
                    })
                    .toUpperCase()}
                </span>

                <strong>{date.getDate()}</strong>

                <small>
                  {date.toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </small>

                {available && <i />}
              </motion.button>
            );
          })}
        </div>

        <button
          type="button"
          className="availability-date-arrow"
          disabled
          aria-label="Next dates"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* =====================================
          NO DATE SELECTED
      ===================================== */}

      {!selectedDate && (
        <div className="availability-placeholder">
          <Clock3 size={19} />

          <strong>Select an available day</strong>

          <span>Available lesson times will appear here.</span>
        </div>
      )}

      {/* =====================================
          SLOTS
      ===================================== */}

      {selectedDate && (
        <div className="availability-slots-section">
          <div className="availability-slots-heading">
            <div>
              <span>AVAILABLE TIMES</span>

              <strong>
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",

                  month: "long",

                  day: "numeric",
                })}
              </strong>
            </div>

            <small>
              {availableSlots.length}{" "}
              {availableSlots.length === 1 ? "time" : "times"}
            </small>
          </div>

          {availableSlots.length > 0 ? (
            <div className="availability-slots">
              {availableSlots.map((slot) => {
                const active = selectedTime === slot;

                return (
                  <motion.button
                    key={slot}
                    type="button"
                    className={`availability-slot ${active ? "active" : ""}`}
                    onClick={() => setSelectedTime(slot)}
                    whileTap={{
                      scale: 0.98,
                    }}
                  >
                    <Clock3 size={13} />

                    {formatTime(slot)}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="availability-no-slots">
              <Clock3 size={18} />

              <div>
                <strong>No available times</strong>

                <span>
                  Try another day or contact the tutor to arrange another time.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================
          COORDINATION
      ===================================== */}

      <div className="availability-contact">
        <div>
          <MessageCircle size={17} />

          <section>
            <strong>Can't find a suitable time?</strong>

            <span>
              Message the tutor and coordinate a different lesson time.
            </span>
          </section>
        </div>

        <button type="button" onClick={onMessageTutor}>
          <MessageCircle size={13} />
          Message tutor
        </button>
      </div>
    </section>
  );
}

export default AvailabilitySchedulePicker;
