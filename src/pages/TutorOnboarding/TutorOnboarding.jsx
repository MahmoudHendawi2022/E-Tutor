import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { motion } from "motion/react";

import TutorProfileForm from "../../components/TutorProfileForm/TutorProfileForm";
import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";
import { useAvailability } from "../../context/AvailabilityContext";
import "./tutorOnboarding.css";

function TutorOnboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { getTutorByUserId, getTutorById, submitTutorApplication } = useTutors();
  const { ensureTutor } = useAvailability();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.role !== "tutor") return <Navigate to="/signin" replace />;

  const tutor = getTutorByUserId(user.id) || getTutorById(user.tutorId);

  if (tutor && ["pending_review", "approved", "rejected"].includes(tutor.status)) {
    return <Navigate to="/tutor/application-status" replace />;
  }

  const initialData = {
    ...(tutor || {}),
    firstName: tutor?.firstName || user.firstName || "",
    lastName: tutor?.lastName || user.lastName || "",
  };

  const submitApplication = (profile) => {
    setSaving(true);
    setError("");
    const result = submitTutorApplication({
      userId: user.id,
      tutorId: tutor?.id || user.tutorId,
      ...profile,
    });

    if (!result.success) {
      setSaving(false);
      setError(result.message || "Could not submit your application.");
      return;
    }

    ensureTutor(result.tutor.id);
    updateUser({
      tutorId: result.tutor.id,
      profileCompleted: true,
      approvalStatus: "pending_review",
    });
    navigate("/tutor/application-status", { replace: true });
  };

  return (
    <main className="tutor-onboarding-page">
      <motion.div className="tutor-onboarding-container" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="tutor-onboarding-header">
          <span>TUTOR APPLICATION</span>
          <h1>Apply to teach on E-Tutor</h1>
          <p>Complete your professional profile. Nothing becomes public until the platform reviews and approves your application.</p>
        </div>

        {tutor?.status === "needs_changes" && tutor.reviewNote && (
          <div className="tutor-onboarding-review-note">
            <strong>Changes requested</strong>
            <p>{tutor.reviewNote}</p>
          </div>
        )}

        {error && <div className="tutor-onboarding-submit-error">{error}</div>}

        <TutorProfileForm
          initialData={initialData}
          submitLabel="Submit application"
          saving={saving}
          onSubmit={submitApplication}
        />
      </motion.div>
    </main>
  );
}

export default TutorOnboarding;
