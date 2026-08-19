const JOIN_EARLY_MINUTES = 10;

function parseLessonTime(time) {
  if (!time) {
    return null;
  }

  const value = time.trim().toUpperCase();

  const twentyFourHour = value.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFourHour) {
    return {
      hours: Number(twentyFourHour[1]),
      minutes: Number(twentyFourHour[2]),
    };
  }

  const twelveHour = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (!twelveHour) {
    return null;
  }

  let hours = Number(twelveHour[1]);

  const minutes = Number(twelveHour[2]);

  const period = twelveHour[3];

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return {
    hours,
    minutes,
  };
}

function getLessonStart(lesson) {
  if (!lesson?.date || !lesson?.time) {
    return null;
  }

  const parsedTime = parseLessonTime(lesson.time);

  if (!parsedTime) {
    return null;
  }

  const date = new Date(`${lesson.date}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);

  return date;
}

function formatCountdown(milliseconds) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / 60000));

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  if (!minutes) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

export function getLessonJoinState(lesson, now = new Date()) {
  if (!lesson || lesson.status !== "upcoming") {
    return {
      canJoin: false,
      state: "unavailable",
      message: "This classroom is not available.",
    };
  }

  if (!lesson.meetingUrl) {
    return {
      canJoin: false,
      state: "unavailable",
      message: "The meeting link is not available yet.",
    };
  }

  const startAt = getLessonStart(lesson);

  if (!startAt) {
    return {
      canJoin: false,
      state: "unavailable",
      message: "The lesson schedule is unavailable.",
    };
  }

  const duration = Number(lesson.duration) || 60;

  const opensAt = new Date(startAt.getTime() - JOIN_EARLY_MINUTES * 60 * 1000);

  const endsAt = new Date(startAt.getTime() + duration * 60 * 1000);

  if (now < opensAt) {
    return {
      canJoin: false,
      state: "waiting",
      startAt,
      opensAt,
      endsAt,

      message: `The classroom opens in ${formatCountdown(opensAt - now)}.`,
    };
  }

  if (now <= endsAt) {
    return {
      canJoin: true,
      state: "open",
      startAt,
      opensAt,
      endsAt,

      message: "Your classroom is ready.",
    };
  }

  return {
    canJoin: false,
    state: "ended",
    startAt,
    opensAt,
    endsAt,

    message: "This lesson's classroom is now closed.",
  };
}
