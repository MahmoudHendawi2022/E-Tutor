import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";
import { useLessons } from "../../context/LessonsContext";
import { usePayments } from "../../context/PaymentsContext";
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
      <div className="admin-page-head"><div><span>OPERATIONS</span><h1>Lessons & bookings</h1><p>Every booking, student, tutor, schedule, duration, status and payment in one view.</p></div></div>
      <div className="admin-toolbar">
        <div className="admin-search"><Search size={14}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search booking, student, tutor or subject..." /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All lesson statuses</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
      </div>
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
            <td><span className={`admin-badge ${lesson.status}`}>{lesson.status}</span></td>
            <td>{money(lesson.price || payment?.grossAmount || 0, payment?.currency || tutor?.currency || "USD")}</td>
            <td>{payment ? <span className={`admin-badge ${payment.paymentStatus}`}>{payment.paymentStatus}</span> : "No payment"}</td>
            <td>{payment ? <span className={`admin-badge ${payment.fundStatus}`}>{payment.fundStatus}</span> : "—"}</td>
          </tr>;
        })}
      </tbody></table></div>
    </main>
  );
}

export default AdminLessons;
