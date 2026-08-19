import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router";

import { useTutors } from "../context/TutorsContext";
import { useLessons } from "../context/LessonsContext";
import { usePayments } from "../context/PaymentsContext";
import { completedHours, currencyTotalsText } from "./adminUtils";
import "./adminPages.css";

function AdminTutors() {
  const { tutors, suspendTutor, reactivateTutor } = useTutors();
  const { lessons } = useLessons();
  const { getTutorFinanceByCurrency } = usePayments();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tutors.filter((tutor) =>
      (status === "all" || tutor.status === status) &&
      (!q || [tutor.name, tutor.primarySubject, tutor.country, tutor.university].some((value) => String(value || "").toLowerCase().includes(q)))
    );
  }, [tutors, search, status]);

  return (
    <main className="admin-page">
      <div className="admin-page-head"><div><span>TUTOR MANAGEMENT</span><h1>All tutors</h1><p>Profile status, lessons, teaching hours, sales, earnings and platform commission.</p></div></div>
      <div className="admin-toolbar">
        <div className="admin-search"><Search size={14} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tutors..." /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option><option value="approved">Approved</option><option value="pending_review">Pending</option><option value="needs_changes">Needs changes</option><option value="rejected">Rejected</option><option value="suspended">Suspended</option></select>
      </div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tutor</th><th>Subject</th><th>Status</th><th>Students</th><th>Completed lessons</th><th>Hours</th><th>Gross sales</th><th>Tutor earnings</th><th>Platform fee</th><th>Action</th></tr></thead><tbody>
        {rows.map((tutor) => {
          const tutorLessons = lessons.filter((lesson) => Number(lesson.tutorId) === Number(tutor.id));
          const completed = tutorLessons.filter((lesson) => lesson.status === "completed");
          const students = new Set(tutorLessons.map((lesson) => Number(lesson.studentId)).filter(Boolean)).size;
          const finance = getTutorFinanceByCurrency(tutor.id);
          return <tr key={tutor.id}><td><Link className="admin-name-link" to={`/admin/tutors/${tutor.id}`}><strong>{tutor.name}</strong></Link><br/><span>{tutor.country || "—"}</span></td><td>{tutor.primarySubject || tutor.subject || "—"}</td><td><span className={`admin-badge ${tutor.status}`}>{tutor.status}</span></td><td>{students}</td><td>{completed.length}</td><td>{completedHours(tutorLessons)}</td><td>{currencyTotalsText(finance, "gross")}</td><td>{currencyTotalsText(finance, "tutorEarnings")}</td><td>{currencyTotalsText(finance, "platformCommission")}</td><td>{tutor.status === "approved" ? <button className="admin-button danger" onClick={() => suspendTutor(tutor.id, "Suspended by admin")}>Suspend</button> : tutor.status === "suspended" ? <button className="admin-button success" onClick={() => reactivateTutor(tutor.id)}>Reactivate</button> : "—"}</td></tr>;
        })}
      </tbody></table></div>
    </main>
  );
}

export default AdminTutors;
