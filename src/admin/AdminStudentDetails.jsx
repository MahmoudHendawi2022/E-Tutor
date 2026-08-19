import { Link, useParams } from "react-router";
import { ArrowLeft, BookOpen, CircleDollarSign, MapPin, UserRound, Users } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTutors } from "../context/TutorsContext";
import { useLessons } from "../context/LessonsContext";
import { usePayments } from "../context/PaymentsContext";
import { completedHours, currencyTotalsText, formatDateTime, money } from "./adminUtils";
import "./adminPages.css";

function AdminStudentDetails() {
  const { id } = useParams();
  const { getAccountById, setAccountStatus } = useAuth();
  const { getTutorById } = useTutors();
  const { lessons } = useLessons();
  const { getPaymentsByStudentId, getStudentFinanceByCurrency } = usePayments();
  const student = getAccountById(id);

  if (!student || student.role !== "student") return <main className="admin-page"><div className="admin-empty">Student not found.</div></main>;

  const studentLessons = lessons.filter((lesson) => Number(lesson.studentId) === Number(student.id));
  const completed = studentLessons.filter((lesson) => lesson.status === "completed");
  const upcoming = studentLessons.filter((lesson) => lesson.status === "upcoming");
  const cancelled = studentLessons.filter((lesson) => lesson.status === "cancelled");
  const payments = getPaymentsByStudentId(student.id);
  const finance = getStudentFinanceByCurrency(student.id);
  const tutorsUsed = new Set(studentLessons.map((lesson) => Number(lesson.tutorId))).size;

  return (
    <main className="admin-page">
      <div className="admin-detail-back"><Link to="/admin/students"><ArrowLeft size={13}/> All students</Link></div>
      <div className="admin-profile-hero">
        <div className="admin-profile-avatar">{student.initials || <UserRound size={22}/>}</div>
        <div className="admin-profile-main"><span>STUDENT #{student.id}</span><h1>{student.fullName}</h1><p>{student.email}</p><div className="admin-profile-badges"><span className={`admin-badge ${student.status || "active"}`}>{student.status || "active"}</span><span>{student.country || "Country not set"}</span></div></div>
        <button className={`admin-button ${student.status === "disabled" ? "success" : "danger"}`} onClick={() => setAccountStatus(student.id, student.status === "disabled" ? "active" : "disabled")}>{student.status === "disabled" ? "Enable account" : "Disable account"}</button>
      </div>

      <div className="admin-stat-grid"><Metric label="Tutors used" value={tutorsUsed}/><Metric label="Completed lessons" value={completed.length}/><Metric label="Completed hours" value={completedHours(studentLessons)}/><Metric label="Upcoming" value={upcoming.length}/><Metric label="Cancelled" value={cancelled.length}/><Metric label="Gross payments" value={currencyTotalsText(finance, "gross")}/><Metric label="Refunded" value={currencyTotalsText(finance, "refunded")}/><Metric label="Net spend" value={currencyTotalsText(finance, "netSpend")}/></div>

      <div className="admin-detail-grid">
        <InfoSection icon={UserRound} title="Account"><Pair label="Name" value={student.fullName}/><Pair label="Email" value={student.email}/><Pair label="Phone" value={student.phone}/><Pair label="Status" value={student.status || "active"}/><Pair label="Registered" value={formatDateTime(student.createdAt)}/><Pair label="Language" value={student.language}/></InfoSection>
        <InfoSection icon={MapPin} title="Location"><Pair label="Country" value={student.country}/><Pair label="Timezone" value={student.timezone}/></InfoSection>
        <InfoSection icon={BookOpen} title="Learning"><Pair label="Bookings" value={studentLessons.length}/><Pair label="Completed" value={completed.length}/><Pair label="Completed hours" value={completedHours(studentLessons)}/><Pair label="Tutors used" value={tutorsUsed}/></InfoSection>
        <InfoSection icon={CircleDollarSign} title="Finance"><Pair label="Payment records" value={payments.length}/><Pair label="Gross payments" value={currencyTotalsText(finance, "gross")}/><Pair label="Refunded" value={currencyTotalsText(finance, "refunded")}/><Pair label="Net spend" value={currencyTotalsText(finance, "netSpend")}/></InfoSection>
      </div>

      <section className="admin-section"><div className="admin-section-head"><div><h2>Lesson history</h2><p>Every lesson currently linked to this student.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Booking</th><th>Tutor</th><th>Subject</th><th>Schedule</th><th>Duration</th><th>Status</th><th>Price</th></tr></thead><tbody>{[...studentLessons].reverse().map((lesson) => { const tutor = getTutorById(lesson.tutorId); return <tr key={lesson.id}><td>{lesson.bookingId || lesson.id}</td><td>{tutor?.name || `Tutor #${lesson.tutorId}`}</td><td>{lesson.subject}</td><td>{lesson.date} {lesson.time}</td><td>{lesson.duration} min</td><td><span className={`admin-badge ${lesson.status}`}>{lesson.status}</span></td><td>{money(lesson.price, lesson.currency || getTutorById(lesson.tutorId)?.currency || "USD")}</td></tr>; })}</tbody></table></div></section>

      <section className="admin-section"><div className="admin-section-head"><div><h2>Payment history</h2><p>Payment and refund ledger for this student.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Payment</th><th>Booking</th><th>Gross</th><th>Refund</th><th>Payment status</th><th>Funds</th><th>Created</th></tr></thead><tbody>{[...payments].reverse().map((payment) => <tr key={payment.id}><td>{payment.id}</td><td>{payment.bookingId}</td><td>{money(payment.grossAmount,payment.currency)}</td><td>{money(payment.refundAmount,payment.currency)}</td><td><span className={`admin-badge ${payment.paymentStatus}`}>{payment.paymentStatus}</span></td><td>{payment.fundStatus}</td><td>{formatDateTime(payment.createdAt)}</td></tr>)}</tbody></table></div></section>
    </main>
  );
}

function Metric({ label, value }) { return <article className="admin-stat-card"><span>{label}</span><strong>{value}</strong></article>; }
function InfoSection({ icon: Icon, title, children }) { return <section className="admin-info-card"><div className="admin-info-card-head"><Icon size={15}/><strong>{title}</strong></div><div>{children}</div></section>; }
function Pair({ label, value }) { return <div className="admin-pair"><span>{label}</span><strong>{value || "—"}</strong></div>; }

export default AdminStudentDetails;
