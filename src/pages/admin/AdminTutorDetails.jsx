import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CircleDollarSign, GraduationCap, Languages, MapPin, ShieldCheck } from "lucide-react";

import { useTutors } from "../../context/TutorsContext";
import { useLessons } from "../../context/LessonsContext";
import { usePayments } from "../../context/PaymentsContext";
import { AdminStatusBadge, AdminStatCard, AdminInfoSection, AdminPairRow } from "../../components/admin";
import { completedHours, currencyTotalsText, formatDateTime, money } from "./adminUtils";
import "./adminPages.css";

function AdminTutorDetails() {
  const { id } = useParams();
  const { getTutorById, suspendTutor, reactivateTutor } = useTutors();
  const { lessons } = useLessons();
  const { getTutorFinanceByCurrency, getPaymentsByTutorId, payouts } = usePayments();
  const tutor = getTutorById(id);

  if (!tutor) return <main className="admin-page"><div className="admin-empty">Tutor not found.</div></main>;

  const tutorLessons = lessons.filter((lesson) => Number(lesson.tutorId) === Number(tutor.id));
  const completed = tutorLessons.filter((lesson) => lesson.status === "completed");
  const upcoming = tutorLessons.filter((lesson) => lesson.status === "upcoming");
  const cancelled = tutorLessons.filter((lesson) => lesson.status === "cancelled");
  const students = new Set(tutorLessons.map((lesson) => Number(lesson.studentId)).filter(Boolean)).size;
  const finance = getTutorFinanceByCurrency(tutor.id);
  const payments = getPaymentsByTutorId(tutor.id);
  const tutorPayouts = payouts.filter((payout) => Number(payout.tutorId) === Number(tutor.id));

  return (
    <main className="admin-page">
      <div className="admin-detail-back"><Link to="/admin/tutors"><ArrowLeft size={13} /> All tutors</Link></div>
      <div className="admin-profile-hero">
        <div className="admin-profile-avatar">{tutor.image ? <img src={tutor.image} alt={tutor.name} /> : tutor.name?.slice(0, 2).toUpperCase()}</div>
        <div className="admin-profile-main"><span>TUTOR #{tutor.id}</span><h1>{tutor.name}</h1><p>{tutor.title || tutor.primarySubject || "Tutor"}</p><div className="admin-profile-badges"><AdminStatusBadge status={tutor.status} /><span>{tutor.country || "—"}{tutor.city ? ` · ${tutor.city}` : ""}</span></div></div>
        <div>{tutor.status === "approved" ? <button className="admin-button danger" onClick={() => suspendTutor(tutor.id, "Suspended by admin")}>Suspend tutor</button> : tutor.status === "suspended" ? <button className="admin-button success" onClick={() => reactivateTutor(tutor.id)}>Reactivate tutor</button> : null}</div>
      </div>

      <div className="admin-stat-grid">
        <AdminStatCard variant="metric" label="Students" value={students} />
        <AdminStatCard variant="metric" label="Completed lessons" value={completed.length} />
        <AdminStatCard variant="metric" label="Completed hours" value={completedHours(tutorLessons)} />
        <AdminStatCard variant="metric" label="Upcoming" value={upcoming.length} />
        <AdminStatCard variant="metric" label="Cancelled" value={cancelled.length} />
        <AdminStatCard variant="metric" label="Gross sales" value={currencyTotalsText(finance, "gross")} />
        <AdminStatCard variant="metric" label="Tutor earnings" value={currencyTotalsText(finance, "tutorEarnings")} />
        <AdminStatCard variant="metric" label="Platform commission" value={currencyTotalsText(finance, "platformCommission")} />
      </div>

      <div className="admin-detail-grid">
        <AdminInfoSection icon={BookOpen} title="Teaching profile">
          <AdminPairRow label="Primary subject" value={tutor.primarySubject || tutor.subject} />
          <AdminPairRow label="Specializations" value={(tutor.specializations || []).join(", ")} />
          <AdminPairRow label="Teaching levels" value={(tutor.teachingLevels || []).join(", ")} />
          <AdminPairRow label="Experience" value={`${tutor.experienceYears || 0} years`} />
          <AdminPairRow label="Price" value={money(tutor.price, tutor.currency)} />
          <AdminPairRow label="Trial lesson" value={tutor.trialLesson ? money(tutor.trialPrice, tutor.currency) : "No"} />
        </AdminInfoSection>
        <AdminInfoSection icon={GraduationCap} title="Education">
          <AdminPairRow label="University" value={tutor.university} />
          <AdminPairRow label="Degree" value={tutor.degree} />
          <AdminPairRow label="Field of study" value={tutor.fieldOfStudy} />
          <AdminPairRow label="Graduation year" value={tutor.graduationYear} />
        </AdminInfoSection>
        <AdminInfoSection icon={MapPin} title="Location">
          <AdminPairRow label="Country" value={tutor.country} />
          <AdminPairRow label="City" value={tutor.city} />
          <AdminPairRow label="Timezone" value={tutor.timezone} />
        </AdminInfoSection>
        <AdminInfoSection icon={Languages} title="Languages">
          {(tutor.languages || []).length ? tutor.languages.map((language) => <AdminPairRow key={`${language.language}-${language.level}`} label={language.language} value={language.level} />) : <p className="admin-muted">No languages listed.</p>}
        </AdminInfoSection>
        <AdminInfoSection icon={ShieldCheck} title="Review & account">
          <AdminPairRow label="Application status" value={tutor.status} />
          <AdminPairRow label="Submitted" value={formatDateTime(tutor.submittedAt)} />
          <AdminPairRow label="Approved" value={formatDateTime(tutor.approvedAt)} />
          <AdminPairRow label="Last reviewed" value={formatDateTime(tutor.reviewedAt)} />
          <AdminPairRow label="Review note" value={tutor.reviewNote} />
          <AdminPairRow label="Rejection reason" value={tutor.rejectionReason} />
          <AdminPairRow
            label="Identity document"
            value={tutor.identityDocument?.dataUrl ? <a className="admin-document-link" href={tutor.identityDocument.dataUrl} target="_blank" rel="noreferrer">View {tutor.identityDocument.name || "document"}</a> : <strong>—</strong>}
          />
          <AdminPairRow
            label="Qualification proof"
            value={tutor.qualificationDocument?.dataUrl ? <a className="admin-document-link" href={tutor.qualificationDocument.dataUrl} target="_blank" rel="noreferrer">View {tutor.qualificationDocument.name || "document"}</a> : <strong>—</strong>}
          />
        </AdminInfoSection>
        <AdminInfoSection icon={CircleDollarSign} title="Finance & payouts">
          <AdminPairRow label="Transactions" value={payments.length} />
          <AdminPairRow label="Refunded" value={currencyTotalsText(finance, "refunded")} />
          <AdminPairRow label="Available payout" value={currencyTotalsText(finance, "available")} />
          <AdminPairRow label="Pending payout" value={currencyTotalsText(finance, "pending")} />
          <AdminPairRow label="Paid out" value={currencyTotalsText(finance, "paidOut")} />
          <AdminPairRow label="Payout batches" value={tutorPayouts.length} />
        </AdminInfoSection>
      </div>

      <section className="admin-section"><div className="admin-section-head"><div><h2>About tutor</h2><p>Public biography currently stored for this profile.</p></div></div><p className="admin-long-text">{tutor.bio || "No bio."}</p></section>

      <section className="admin-section"><div className="admin-section-head"><div><h2>Lesson history</h2><p>Latest bookings linked to this tutor.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Booking</th><th>Student</th><th>Subject</th><th>Schedule</th><th>Duration</th><th>Status</th><th>Price</th></tr></thead><tbody>{[...tutorLessons].reverse().slice(0, 20).map((lesson) => <tr key={lesson.id}><td>{lesson.bookingId || lesson.id}</td><td>#{lesson.studentId}</td><td>{lesson.subject}</td><td>{lesson.date} {lesson.time}</td><td>{lesson.duration} min</td><td><AdminStatusBadge status={lesson.status} /></td><td>{money(lesson.price, tutor.currency)}</td></tr>)}</tbody></table></div></section>
    </main>
  );
}

export default AdminTutorDetails;
