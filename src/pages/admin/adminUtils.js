export const money = (value, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatLessonDate = (lesson) => {
  if (!lesson?.date) return "—";
  return `${lesson.date}${lesson.time ? ` · ${lesson.time}` : ""}`;
};

export const completedHours = (lessons) =>
  Math.round(
    (lessons
      .filter((lesson) => lesson.status === "completed")
      .reduce((sum, lesson) => sum + Number(lesson.duration || 0), 0) /
      60) *
      100,
  ) / 100;

export const downloadCsv = (filename, rows) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};


export const currencyTotalsText = (byCurrency, field) => {
  const entries = Object.values(byCurrency || {}).filter(
    (item) => Number(item?.[field] || 0) !== 0,
  );

  if (!entries.length) return "—";

  return entries
    .map((item) => money(item[field], item.currency || "USD"))
    .join(" · ");
};
