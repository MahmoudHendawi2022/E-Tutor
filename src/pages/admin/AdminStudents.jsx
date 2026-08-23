import { useMemo, useState } from "react";
import { Link } from "react-router";

import { useAuth } from "../../context/AuthContext";
import { useLessons } from "../../context/LessonsContext";
import { usePayments } from "../../context/PaymentsContext";
import { AdminPageHeader, AdminToolbar, AdminStatusBadge } from "../../components/admin";
import { completedHours, currencyTotalsText, formatDateTime } from "./adminUtils";
import "./adminPages.css";

function AdminStudents() {
  const { accounts, setAccountStatus } = useAuth();
  const { lessons } = useLessons();
  const { getStudentFinanceByCurrency } = usePayments();
  const [search, setSearch] = useState("");

  const students = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((account) => account.role === "student" && (!q || [account.fullName, account.email, account.country].some((value) => String(value || "").toLowerCase().includes(q))));
  }, [accounts, search]);

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="STUDENT MANAGEMENT"
        title="Students"
        description="Accounts, learning activity, completed hours and total spend."
      />
      <AdminToolbar
        search={search}
        onSearch={(e) => setSearch(e.target.value)}
        placeholder="Search student name, email or country..."
      />
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Student</th><th>Status</th><th>Joined</th><th>Tutors used</th><th>Completed lessons</th><th>Completed hours</th><th>Total spent</th><th>Refunded</th><th>Action</th></tr></thead><tbody>
        {students.map((student) => {
          const studentLessons = lessons.filter((lesson) => Number(lesson.studentId) === Number(student.id));
          const finance = getStudentFinanceByCurrency(student.id);
          return <tr key={student.id}><td><Link className="admin-name-link" to={`/admin/students/${student.id}`}><strong>{student.fullName}</strong></Link><br/><span>{student.email}</span></td><td><AdminStatusBadge status={student.status || "active"} /></td><td>{formatDateTime(student.createdAt)}</td><td>{new Set(studentLessons.map((lesson) => lesson.tutorId)).size}</td><td>{studentLessons.filter((lesson) => lesson.status === "completed").length}</td><td>{completedHours(studentLessons)}</td><td>{currencyTotalsText(finance, "netSpend")}</td><td>{currencyTotalsText(finance, "refunded")}</td><td><button className={`admin-button ${student.status === "disabled" ? "success" : "danger"}`} onClick={() => setAccountStatus(student.id, student.status === "disabled" ? "active" : "disabled")}>{student.status === "disabled" ? "Enable" : "Disable"}</button></td></tr>;
        })}
      </tbody></table></div>
    </main>
  );
}

export default AdminStudents;
