import { Navigate, useNavigate } from "react-router";
import { CheckCircle2, Clock3, FileSearch, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";
import { motion } from "motion/react";

import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";
import "./tutorApplicationStatus.css";

function TutorApplicationStatus() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTutorByUserId, getTutorById } = useTutors();

  if (!user || user.role !== "tutor") return <Navigate to="/signin" replace />;
  const tutor = getTutorByUserId(user.id) || getTutorById(user.tutorId);
  if (!tutor) return <Navigate to="/tutor/onboarding" replace />;

  return (
    <main className="tutor-application-page">
      <motion.section className="tutor-application-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {tutor.status === "pending_review" && (
          <>
            <StatusIcon type="pending"><Clock3 size={28} /></StatusIcon>
            <span className="tutor-application-eyebrow">APPLICATION SUBMITTED</span>
            <h1>Your profile is under review</h1>
            <p>Our team will review your identity, teaching profile, education, subjects, pricing and professional information before approval.</p>
            <div className="tutor-review-steps">
              <ReviewStep icon={CheckCircle2} title="Application received" description="Your tutor information has been submitted." complete />
              <ReviewStep icon={FileSearch} title="Profile review" description="The E-Tutor team is checking your application." active />
              <ReviewStep icon={ShieldCheck} title="Approval" description="Only approved tutors become visible and bookable." />
            </div>
            <div className="tutor-application-warning"><ShieldCheck size={16} /><span>You cannot access the teaching workspace or accept bookings until approval.</span></div>
          </>
        )}

        {tutor.status === "needs_changes" && (
          <>
            <StatusIcon type="changes"><TriangleAlert size={28} /></StatusIcon>
            <span className="tutor-application-eyebrow">ACTION REQUIRED</span>
            <h1>We need some changes</h1>
            <p>Some information needs to be updated before the review can continue.</p>
            {tutor.reviewNote && <div className="tutor-review-message"><strong>Review note</strong><p>{tutor.reviewNote}</p></div>}
            <button className="tutor-status-button" onClick={() => navigate("/tutor/onboarding")}>Update application</button>
          </>
        )}

        {tutor.status === "rejected" && (
          <>
            <StatusIcon type="rejected"><XCircle size={28} /></StatusIcon>
            <span className="tutor-application-eyebrow">APPLICATION REVIEWED</span>
            <h1>Application not approved</h1>
            <p>Unfortunately, this tutor application could not be approved.</p>
            {tutor.rejectionReason && <div className="tutor-review-message rejected"><strong>Review decision</strong><p>{tutor.rejectionReason}</p></div>}
          </>
        )}

        {tutor.status === "suspended" && (
          <>
            <StatusIcon type="rejected"><XCircle size={28} /></StatusIcon>
            <span className="tutor-application-eyebrow">ACCOUNT SUSPENDED</span>
            <h1>Your tutor account is suspended</h1>
            <p>Please contact the platform team if you need more information about this decision.</p>
            {tutor.reviewNote && <div className="tutor-review-message rejected"><strong>Admin note</strong><p>{tutor.reviewNote}</p></div>}
          </>
        )}

        {tutor.status === "approved" && (
          <>
            <StatusIcon type="approved"><CheckCircle2 size={28} /></StatusIcon>
            <span className="tutor-application-eyebrow">APPROVED</span>
            <h1>Welcome to E-Tutor</h1>
            <p>Your tutor profile is approved and can now be shown to students.</p>
            <button className="tutor-status-button" onClick={() => navigate("/tutor/dashboard", { replace: true })}>Go to tutor dashboard</button>
          </>
        )}
      </motion.section>
    </main>
  );
}

function StatusIcon({ type, children }) {
  return <div className={`tutor-application-icon ${type}`}>{children}</div>;
}

function ReviewStep({ icon: Icon, title, description, active, complete }) {
  return (
    <div className={`tutor-review-step ${active ? "active" : ""} ${complete ? "complete" : ""}`}>
      <div><Icon size={15} /></div>
      <section><strong>{title}</strong><span>{description}</span></section>
    </div>
  );
}

export default TutorApplicationStatus;
