import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Check,
} from "lucide-react";

import { motion } from "motion/react";

import "./schedulePicker.css";

const MAX_BOOKING_DAYS = 90;

/* =====================================
   DATE HELPERS
===================================== */

const normalizeDate = (date) => {
  const copy = new Date(date);

  copy.setHours(0, 0, 0, 0);

  return copy;
};

const isSameDate = (date1, date2) => {
  if (!date1 || !date2) {
    return false;
  }

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getDateKey = (date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =====================================
   DEMO AVAILABILITY

   بعدين هنستبدل الجزء ده
   ببيانات حقيقية من API
===================================== */

const getSlotsForDate = (date) => {
  const day = date.getDay();

  const dateNumber = date.getDate();

  // Sunday unavailable
  if (day === 0) {
    return [];
  }

  // Saturday
  if (day === 6) {
    return ["10:00", "11:30", "13:00", "15:00", "17:00"];
  }

  // Friday
  if (day === 5) {
    return ["09:00", "10:30", "12:00", "14:30", "17:00", "19:00"];
  }

  // Variation between dates
  if (dateNumber % 3 === 0) {
    return ["08:30", "10:00", "11:30", "13:00", "16:00", "18:30", "20:00"];
  }

  if (dateNumber % 4 === 0) {
    return ["09:30", "11:00", "14:00", "15:30", "17:30", "19:30"];
  }

  return [
    "09:00",
    "10:00",
    "11:30",
    "13:00",
    "14:30",
    "16:00",
    "17:30",
    "19:00",
    "20:30",
  ];
};

/* =====================================
   TIME FORMAT
===================================== */

const formatTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

/* =====================================
   CALENDAR GENERATOR
===================================== */

const getCalendarDays = (viewDate) => {
  const year = viewDate.getFullYear();

  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);

  // Monday = 0
  const startOffset = (firstDay.getDay() + 6) % 7;

  const startDate = new Date(year, month, 1 - startOffset);

  return Array.from(
    {
      length: 42,
    },

    (_, index) => {
      const date = new Date(startDate);

      date.setDate(startDate.getDate() + index);

      return date;
    },
  );
};

/* =====================================
   FIND FIRST AVAILABLE DATE
===================================== */

const findNextAvailableDate = () => {
  const today = normalizeDate(new Date());

  for (let index = 0; index <= MAX_BOOKING_DAYS; index++) {
    const date = new Date(today);

    date.setDate(today.getDate() + index);

    if (getSlotsForDate(date).length > 0) {
      return date;
    }
  }

  return today;
};

/* =====================================
   COMPONENT
===================================== */

function SchedulePicker({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}) {
  const initialAvailableDate = useMemo(() => findNextAvailableDate(), []);

  const today = useMemo(() => normalizeDate(new Date()), []);

  const maxDate = useMemo(() => {
    const date = new Date(today);

    date.setDate(date.getDate() + MAX_BOOKING_DAYS);

    return date;
  }, [today]);

  const [viewDate, setViewDate] = useState(
    selectedDate || initialAvailableDate,
  );

  const [period, setPeriod] = useState("all");

  const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);

  const availableTimes = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return getSlotsForDate(selectedDate);
  }, [selectedDate]);

  const filteredTimes = useMemo(() => {
    if (period === "all") {
      return availableTimes;
    }

    return availableTimes.filter((time) => {
      const hour = Number(time.split(":")[0]);

      if (period === "morning") {
        return hour < 12;
      }

      if (period === "afternoon") {
        return hour >= 12 && hour < 17;
      }

      return hour >= 17;
    });
  }, [availableTimes, period]);

  /* =====================================
     INITIAL SELECTION
  ===================================== */

  useEffect(() => {
    if (!selectedDate) {
      const slots = getSlotsForDate(initialAvailableDate);

      setSelectedDate(initialAvailableDate);

      setSelectedTime(slots[0] || "");

      return;
    }

    const slots = getSlotsForDate(selectedDate);

    if (!selectedTime || !slots.includes(selectedTime)) {
      setSelectedTime(slots[0] || "");
    }
  }, [
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    initialAvailableDate,
  ]);

  /* =====================================
     CAN SELECT DATE
  ===================================== */

  const canSelectDate = (date) => {
    const normalized = normalizeDate(date);

    return (
      normalized >= today &&
      normalized <= maxDate &&
      getSlotsForDate(normalized).length > 0
    );
  };

  /* =====================================
     SELECT DATE
  ===================================== */

  const selectDate = (date) => {
    if (!canSelectDate(date)) {
      return;
    }

    const normalized = normalizeDate(date);

    setSelectedDate(normalized);

    const slots = getSlotsForDate(normalized);

    setSelectedTime(slots[0] || "");
  };

  /* =====================================
     MONTH NAVIGATION
  ===================================== */

  const previousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setViewDate(initialAvailableDate);

    setSelectedDate(initialAvailableDate);

    const slots = getSlotsForDate(initialAvailableDate);

    setSelectedTime(slots[0] || "");
  };

  const currentMonthStart = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1,
  );

  const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const nextMonthStart = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    1,
  );

  const previousDisabled = currentMonthStart <= todayMonthStart;

  const nextDisabled = nextMonthStart > maxDate;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="schedule-picker">
      {/* =========================
          DATE
      ========================= */}

      <section className="schedule-panel">
        <div className="schedule-panel-heading">
          <div className="schedule-heading-icon">
            <CalendarDays size={18} />
          </div>

          <div>
            <h2>Choose a date</h2>

            <p>Select one of the tutor's available days.</p>
          </div>
        </div>

        {/* Calendar Toolbar */}

        <div className="calendar-toolbar">
          <div className="calendar-navigation">
            <button
              type="button"
              onClick={previousMonth}
              disabled={previousDisabled}
              aria-label="Previous month"
            >
              <ChevronLeft size={17} />
            </button>

            <strong>
              {viewDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </strong>

            <button
              type="button"
              onClick={nextMonth}
              disabled={nextDisabled}
              aria-label="Next month"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <button type="button" className="calendar-today" onClick={goToToday}>
            Today
          </button>
        </div>

        {/* Weekdays */}

        <div className="calendar-weekdays">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        {/* Calendar */}

        <div className="calendar-grid">
          {calendarDays.map((date) => {
            const key = getDateKey(date);

            const sameMonth = date.getMonth() === viewDate.getMonth();

            const available = sameMonth && canSelectDate(date);

            const selected = isSameDate(date, selectedDate);

            const isToday = isSameDate(date, today);

            return (
              <button
                key={key}
                type="button"
                disabled={!available}
                className={[
                  "calendar-day",

                  !sameMonth ? "outside" : "",

                  selected ? "selected" : "",

                  isToday ? "today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => selectDate(date)}
              >
                {selected && (
                  <motion.span
                    className="calendar-selection"
                    layoutId="calendar-selection"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 38,
                    }}
                  />
                )}

                <span className="calendar-day-number">{date.getDate()}</span>

                {available && <span className="availability-dot" />}
              </button>
            );
          })}
        </div>

        {/* Legend */}

        <div className="calendar-legend">
          <span>
            <i className="available-legend" />
            Available
          </span>

          <span>
            <i className="selected-legend" />
            Selected
          </span>
        </div>
      </section>

      {/* =========================
          TIMES
      ========================= */}

      <section className="schedule-panel">
        <div className="schedule-time-header">
          <div className="schedule-panel-heading">
            <div className="schedule-heading-icon">
              <Clock3 size={18} />
            </div>

            <div>
              <h2>Available times</h2>

              <p>
                Times shown in <strong>{timezone}</strong>
              </p>
            </div>
          </div>

          {selectedDate && (
            <span className="schedule-date-label">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Filter */}

        <div className="time-period-filter">
          {[
            {
              value: "all",
              label: "All",
            },

            {
              value: "morning",
              label: "Morning",
            },

            {
              value: "afternoon",
              label: "Afternoon",
            },

            {
              value: "evening",
              label: "Evening",
            },
          ].map((item) => (
            <button
              type="button"
              key={item.value}
              className={period === item.value ? "active" : ""}
              onClick={() => setPeriod(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Slots */}

        {filteredTimes.length > 0 ? (
          <motion.div
            key={`${
              selectedDate ? getDateKey(selectedDate) : "none"
            }-${period}`}
            className="schedule-times"
            initial={{
              opacity: 0,
              y: 5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          >
            {filteredTimes.map((time) => {
              const selected = selectedTime === time;

              return (
                <motion.button
                  key={time}
                  type="button"
                  className={`schedule-time ${selected ? "selected" : ""}`}
                  onClick={() => setSelectedTime(time)}
                  whileTap={{
                    scale: 0.97,
                  }}
                >
                  <span>{formatTime(time)}</span>

                  {selected && <Check size={14} />}
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <div className="schedule-empty">
            No available times during this period.
          </div>
        )}
      </section>
    </div>
  );
}

export default SchedulePicker;
