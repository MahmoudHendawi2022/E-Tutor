import { useState } from "react";
import { Navigate } from "react-router-dom";
import { CheckCircle2, Clock3 } from "lucide-react";
import { motion } from "motion/react";

import TutorProfileForm from "../../../components/TutorProfileForm/TutorProfileForm";
import { useAuth } from "../../../context/AuthContext";
import { useTutors } from "../../../context/TutorsContext";
import "./tutorSettings.css";

function TutorSettings() {
  const { user } = useAuth();
  const { getTutorByUserId, getTutorById, submitTutorProfileChanges } = useTutors();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user || user.role !== "tutor") return <Navigate to="/signin" replace />;

  const tutor = getTutorByUserId(user.id) || getTutorById(user.tutorId);
  if (!tutor) return <Navigate to="/tutor/onboarding" replace />;

  const formData = tutor.pendingChanges ? { ...tutor, ...tutor.pendingChanges } : tutor;

  const saveChanges = (profile) => {
    setSaving(true);
    const result = submitTutorProfileChanges(tutor.id, profile);
    setSaving(false);
    if (result?.success) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3500);
    }
  };

  return (
    <motion.main className="tutor-settings-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="tutor-settings-header"><span>PROFILE</span><h1>Tutor settings</h1><p>Manage your public tutor information.</p></div>
      {tutor.profileUpdateStatus === "pending_review" && (
        <div className="tutor-settings-review-banner"><Clock3 size={16} /><div><strong>Profile changes are under review</strong><span>Your currently approved profile remains public until the new changes are approved.</span></div></div>
      )}
      {saved && <div className="tutor-settings-saved"><CheckCircle2 size={15} />Changes submitted for review.</div>}
      <TutorProfileForm initialData={formData} submitLabel="Submit changes" saving={saving} onSubmit={saveChanges} />
    </motion.main>
  );
}

export default TutorSettings;
