import { useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";
import { useLessons } from "../../context/LessonsContext";
import { usePayments } from "../../context/PaymentsContext";
import { AdminPageHeader, AdminToolbar, AdminStatusBadge } from "../../components/admin";
import { formatLessonDate, money } from "./adminUtils";
import "./adminPages.css";

function AdminLessons() {
  const { getAccountById } = useAuth();
  const { getTutorById } = useTutors();
  const { lessons } = useLessons();
  const { getPaymentByLessonId } = usePayments();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (status !== "all" && lesson.status !== status) return false;
      if (!q) return true;
      const tutor = getTutorById(lesson.tutorId);
      const student = getAccountById(lesson.studentId);
      return [lesson.bookingId, lesson.subject, tutor?.name, student?.fullName]
        .some((value) => String(value || "").toLowerCase().includes(q));
    });
  }, [lessons, status, search, getTutorById, getAccountById]);

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="OPERATIONS"
        title="Lessons & bookings"
        description="Every booking, student, tutor, schedule, duration, status and payment in one view."
      />
      <AdminToolbar
        search={search}
        onSearch={(e) => setSearch(e.target.value)}
        placeholder="Search booking, student, tutor or subject..."
      >
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All lesson statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </AdminToolbar>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Booking</th><th>Student</th><th>Tutor</th><th>Subject</th><th>Schedule</th><th>Duration</th><th>Lesson</th><th>Price</th><th>Payment</th><th>Funds</th></tr></thead><tbody>
        {rows.map((lesson) => {
          const tutor = getTutorById(lesson.tutorId);
          const student = getAccountById(lesson.studentId);
          const payment = getPaymentByLessonId(lesson.id);
          return <tr key={lesson.id}>
            <td><strong>{lesson.bookingId || `Lesson #${lesson.id}`}</strong></td>
            <td>{student?.fullName || `Student #${lesson.studentId || "—"}`}</td>
            <td>{tutor?.name || `Tutor #${lesson.tutorId}`}</td>
            <td>{lesson.subject}</td><td>{formatLessonDate(lesson)}</td><td>{lesson.duration} min</td>
            <td><AdminStatusBadge status={lesson.status} /></td>
            <td>{money(lesson.price || payment?.grossAmount || 0, payment?.currency || tutor?.currency || "USD")}</td>
            <td>{payment ? <AdminStatusBadge status={payment.paymentStatus} /> : "No payment"}</td>
            <td>{payment ? <AdminStatusBadge status={payment.fundStatus} /> : "—"}</td>
          </tr>;
        })}
      </tbody></table></div>
    </main>
  );
}

export default AdminLessons;
