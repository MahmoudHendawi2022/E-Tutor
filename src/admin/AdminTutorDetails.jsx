import { Link, useParams } from "react-router";
import { ArrowLeft, BookOpen, CircleDollarSign, GraduationCap, Languages, MapPin, ShieldCheck, Users } from "lucide-react";

import { useTutors } from "../context/TutorsContext";
import { useLessons } from "../context/LessonsContext";
import { usePayments } from "../context/PaymentsContext";
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
      <div className="admin-detail-back"><Link to="/admin/tutors"><ArrowLeft size={13}/> All tutors</Link></div>
      <div className="admin-profile-hero">
        <div className="admin-profile-avatar">{tutor.image ? <img src={tutor.image} alt={tutor.name}/> : tutor.name?.slice(0,2).toUpperCase()}</div>
        <div className="admin-profile-main"><span>TUTOR #{tutor.id}</span><h1>{tutor.name}</h1><p>{tutor.title || tutor.primarySubject || "Tutor"}</p><div className="admin-profile-badges"><span className={`admin-badge ${tutor.status}`}>{tutor.status}</span><span>{tutor.country || "—"}{tutor.city ? ` · ${tutor.city}` : ""}</span></div></div>
        <div>{tutor.status === "approved" ? <button className="admin-button danger" onClick={() => suspendTutor(tutor.id, "Suspended by admin")}>Suspend tutor</button> : tutor.status === "suspended" ? <button className="admin-button success" onClick={() => reactivateTutor(tutor.id)}>Reactivate tutor</button> : null}</div>
      </div>

      <div className="admin-stat-grid">
        <Metric label="Students" value={students}/><Metric label="Completed lessons" value={completed.length}/><Metric label="Completed hours" value={completedHours(tutorLessons)}/><Metric label="Upcoming" value={upcoming.length}/><Metric label="Cancelled" value={cancelled.length}/><Metric label="Gross sales" value={currencyTotalsText(finance, "gross")}/><Metric label="Tutor earnings" value={currencyTotalsText(finance, "tutorEarnings")}/><Metric label="Platform commission" value={currencyTotalsText(finance, "platformCommission")}/>
      </div>

      <div className="admin-detail-grid">
        <InfoSection icon={BookOpen} title="Teaching profile">
          <Pair label="Primary subject" value={tutor.primarySubject || tutor.subject}/><Pair label="Specializations" value={(tutor.specializations || []).join(", ")}/><Pair label="Teaching levels" value={(tutor.teachingLevels || []).join(", ")}/><Pair label="Experience" value={`${tutor.experienceYears || 0} years`}/><Pair label="Price" value={money(tutor.price, tutor.currency)}/><Pair label="Trial lesson" value={tutor.trialLesson ? money(tutor.trialPrice, tutor.currency) : "No"}/>
        </InfoSection>
        <InfoSection icon={GraduationCap} title="Education">
          <Pair label="University" value={tutor.university}/><Pair label="Degree" value={tutor.degree}/><Pair label="Field of study" value={tutor.fieldOfStudy}/><Pair label="Graduation year" value={tutor.graduationYear}/>
        </InfoSection>
        <InfoSection icon={MapPin} title="Location">
          <Pair label="Country" value={tutor.country}/><Pair label="City" value={tutor.city}/><Pair label="Timezone" value={tutor.timezone}/>
        </InfoSection>
        <InfoSection icon={Languages} title="Languages">
          {(tutor.languages || []).length ? tutor.languages.map((language) => <Pair key={`${language.language}-${language.level}`} label={language.language} value={language.level}/>) : <p className="admin-muted">No languages listed.</p>}
        </InfoSection>
        <InfoSection icon={ShieldCheck} title="Review & account">
          <Pair label="Application status" value={tutor.status}/><Pair label="Submitted" value={formatDateTime(tutor.submittedAt)}/><Pair label="Approved" value={formatDateTime(tutor.approvedAt)}/><Pair label="Last reviewed" value={formatDateTime(tutor.reviewedAt)}/><Pair label="Review note" value={tutor.reviewNote}/><Pair label="Rejection reason" value={tutor.rejectionReason}/><DocumentPair label="Identity document" document={tutor.identityDocument}/><DocumentPair label="Qualification proof" document={tutor.qualificationDocument}/>
        </InfoSection>
        <InfoSection icon={CircleDollarSign} title="Finance & payouts">
          <Pair label="Transactions" value={payments.length}/><Pair label="Refunded" value={currencyTotalsText(finance, "refunded")}/><Pair label="Available payout" value={currencyTotalsText(finance, "available")}/><Pair label="Pending payout" value={currencyTotalsText(finance, "pending")}/><Pair label="Paid out" value={currencyTotalsText(finance, "paidOut")}/><Pair label="Payout batches" value={tutorPayouts.length}/>
        </InfoSection>
      </div>

      <section className="admin-section"><div className="admin-section-head"><div><h2>About tutor</h2><p>Public biography currently stored for this profile.</p></div></div><p className="admin-long-text">{tutor.bio || "No bio."}</p></section>

      <section className="admin-section"><div className="admin-section-head"><div><h2>Lesson history</h2><p>Latest bookings linked to this tutor.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Booking</th><th>Student</th><th>Subject</th><th>Schedule</th><th>Duration</th><th>Status</th><th>Price</th></tr></thead><tbody>{[...tutorLessons].reverse().slice(0,20).map((lesson) => <tr key={lesson.id}><td>{lesson.bookingId || lesson.id}</td><td>#{lesson.studentId}</td><td>{lesson.subject}</td><td>{lesson.date} {lesson.time}</td><td>{lesson.duration} min</td><td><span className={`admin-badge ${lesson.status}`}>{lesson.status}</span></td><td>{money(lesson.price, tutor.currency)}</td></tr>)}</tbody></table></div></section>
    </main>
  );
}

function Metric({ label, value }) { return <article className="admin-stat-card"><span>{label}</span><strong>{value}</strong></article>; }
function InfoSection({ icon: Icon, title, children }) { return <section className="admin-info-card"><div className="admin-info-card-head"><Icon size={15}/><strong>{title}</strong></div><div>{children}</div></section>; }
function Pair({ label, value }) { return <div className="admin-pair"><span>{label}</span><strong>{value || "—"}</strong></div>; }
function DocumentPair({ label, document }) { return <div className="admin-pair"><span>{label}</span>{document?.dataUrl ? <a className="admin-document-link" href={document.dataUrl} target="_blank" rel="noreferrer">View {document.name || "document"}</a> : <strong>—</strong>}</div>; }

export default AdminTutorDetails;
