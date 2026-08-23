import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileSearch,
  GraduationCap,
  LogOut,
  MapPin,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";

import { useAuth } from "../../../context/AuthContext";
import { useTutors } from "../../../context/TutorsContext";
import "./tutorApplicationStatus.css";

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TutorApplicationStatus() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const { getTutorByUserId, getTutorById } = useTutors();

  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!user || user.role !== "tutor") {
    return <Navigate to="/signin" replace />;
  }

  const tutor = getTutorByUserId(user.id) || getTutorById(user.tutorId);

  if (!tutor) {
    return <Navigate to="/tutor/onboarding" replace />;
  }

  if (tutor.status === "draft" || !tutor.profileCompleted) {
    return <Navigate to="/tutor/onboarding" replace />;
  }

  const applicationId = `TUT-${String(tutor.id).padStart(6, "0")}`;

  const fullName =
    tutor.name ||
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "Tutor";

  const initials =
    user.initials ||
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") ||
    "TU";

  const specializations =
    Array.isArray(tutor.specializations) && tutor.specializations.length
      ? tutor.specializations
      : Array.isArray(tutor.subjects) && tutor.subjects.length > 1
        ? tutor.subjects.slice(1)
        : [];

  const languages = Array.isArray(tutor.languages)
    ? tutor.languages
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        const language = item?.language || "";
        const level = item?.level || "";

        return [language, level].filter(Boolean).join(" · ");
      })
      .filter(Boolean)
    : [];

  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <main className="tutor-application-page">
      <header className="tutor-application-topbar">
        <Link to="/home" className="tutor-application-brand">
          <span>
            <BookOpen size={18} />
          </span>

          <div>
            <strong>E-Tutor</strong>
            <small>Tutor application</small>
          </div>
        </Link>

        <div className="tutor-application-account">
          <div className="tutor-application-account-avatar">{initials}</div>

          <div className="tutor-application-account-copy">
            <strong>{fullName}</strong>
            <span>{user.email}</span>
          </div>

          <button type="button" onClick={handleLogout}>
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </header>

      <div className="tutor-application-shell">
        <motion.section
          className="tutor-application-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          {tutor.status === "pending_review" && (
            <>
              <StatusIcon type="pending">
                <Clock3 size={28} />
              </StatusIcon>

              <span className="tutor-application-eyebrow">
                APPLICATION SUBMITTED
              </span>

              <h1>Your profile is under review</h1>

              <p>
                Your tutor account has been created successfully. Our team is
                reviewing your professional and academic information before
                your teaching profile can go live.
              </p>

              <ApplicationSummary
                applicationId={applicationId}
                submittedAt={tutor.submittedAt}
                profileVisibility="Not published"
                bookingStatus="Unavailable until approval"
              />

              <div className="tutor-review-steps">
                <ReviewStep
                  icon={CheckCircle2}
                  title="Account created"
                  description="Your E-Tutor account is active."
                  complete
                />

                <ReviewStep
                  icon={CheckCircle2}
                  title="Application submitted"
                  description="Your tutor profile has been received."
                  complete
                />

                <ReviewStep
                  icon={FileSearch}
                  title="Administrative review"
                  description="The E-Tutor team is checking your application."
                  active
                />

                <ReviewStep
                  icon={ShieldCheck}
                  title="Tutor activation"
                  description="Approved profiles become visible and bookable."
                />
              </div>

              <div className="tutor-application-warning">
                <ShieldCheck size={16} />
                <span>
                  You can use your E-Tutor account and browse the public
                  website while you wait, but the teaching workspace and new
                  bookings stay locked until approval.
                </span>
              </div>
            </>
          )}

          {tutor.status === "needs_changes" && (
            <>
              <StatusIcon type="changes">
                <TriangleAlert size={28} />
              </StatusIcon>

              <span className="tutor-application-eyebrow">ACTION REQUIRED</span>

              <h1>We need some changes</h1>

              <p>
                Your application was reviewed, but some information needs to be
                updated before the review can continue.
              </p>

              <ApplicationSummary
                applicationId={applicationId}
                submittedAt={tutor.submittedAt}
                profileVisibility="Not published"
                bookingStatus="Unavailable"
              />

              {tutor.reviewNote && (
                <div className="tutor-review-message">
                  <strong>Review note</strong>
                  <p>{tutor.reviewNote}</p>
                </div>
              )}
            </>
          )}

          {tutor.status === "rejected" && (
            <>
              <StatusIcon type="rejected">
                <XCircle size={28} />
              </StatusIcon>

              <span className="tutor-application-eyebrow">
                APPLICATION REVIEWED
              </span>

              <h1>Application not approved</h1>

              <p>
                Your E-Tutor account still exists, but this tutor application
                could not be approved for teaching on the platform.
              </p>

              <ApplicationSummary
                applicationId={applicationId}
                submittedAt={tutor.submittedAt}
                profileVisibility="Not published"
                bookingStatus="Unavailable"
              />

              {tutor.rejectionReason && (
                <div className="tutor-review-message rejected">
                  <strong>Review decision</strong>
                  <p>{tutor.rejectionReason}</p>
                </div>
              )}
            </>
          )}

          {tutor.status === "suspended" && (
            <>
              <StatusIcon type="rejected">
                <XCircle size={28} />
              </StatusIcon>

              <span className="tutor-application-eyebrow">
                ACCOUNT SUSPENDED
              </span>

              <h1>Your tutor account is suspended</h1>

              <p>
                Your public tutor profile and teaching workspace are currently
                unavailable. Please review the admin note below.
              </p>

              {tutor.reviewNote && (
                <div className="tutor-review-message rejected">
                  <strong>Admin note</strong>
                  <p>{tutor.reviewNote}</p>
                </div>
              )}
            </>
          )}

          {tutor.status === "approved" && (
            <>
              <StatusIcon type="approved">
                <CheckCircle2 size={28} />
              </StatusIcon>

              <span className="tutor-application-eyebrow">APPROVED</span>

              <h1>Your tutor account is active</h1>

              <p>
                Your application has been approved. Your tutor profile can now
                be shown to students and your teaching workspace is available.
              </p>

              <ApplicationSummary
                applicationId={applicationId}
                submittedAt={tutor.submittedAt}
                profileVisibility="Published"
                bookingStatus="Available"
              />
            </>
          )}

          <div className="tutor-application-actions">
            {tutor.status === "approved" && (
              <button
                type="button"
                className="tutor-status-button"
                onClick={() =>
                  navigate("/tutor/dashboard", {
                    replace: true,
                  })
                }
              >
                Go to tutor dashboard
              </button>
            )}

            {tutor.status === "needs_changes" && (
              <button
                type="button"
                className="tutor-status-button"
                onClick={() => navigate("/tutor/onboarding")}
              >
                Update application
              </button>
            )}

            {["pending_review", "approved", "needs_changes"].includes(
              tutor.status,
            ) && (
                <button
                  type="button"
                  className="tutor-status-secondary"
                  onClick={() => setDetailsOpen((current) => !current)}
                >
                  <UserRound size={14} />
                  {detailsOpen ? "Hide application" : "View submitted application"}
                  <ChevronDown
                    size={14}
                    className={detailsOpen ? "rotate" : ""}
                  />
                </button>
              )}

            <Link to="/home" className="tutor-status-secondary">
              <ExternalLink size={14} />
              Browse E-Tutor
            </Link>

            <button
              type="button"
              className="tutor-status-logout"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>

          {detailsOpen && (
            <motion.div
              className="tutor-submitted-application"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="tutor-submitted-heading">
                <div>
                  <span>SUBMITTED PROFILE</span>
                  <h2>Your application details</h2>
                </div>

                <strong>{applicationId}</strong>
              </div>

              <div className="tutor-submitted-grid">
                <SubmittedItem
                  icon={UserRound}
                  label="Professional title"
                  value={tutor.title || "—"}
                />

                <SubmittedItem
                  icon={BookOpen}
                  label="Main subject"
                  value={tutor.primarySubject || tutor.subject || "—"}
                />

                <SubmittedItem
                  icon={MapPin}
                  label="Location"
                  value={[tutor.city, tutor.country].filter(Boolean).join(", ") || "—"}
                />

                <SubmittedItem
                  icon={GraduationCap}
                  label="Education"
                  value={[tutor.degree, tutor.university].filter(Boolean).join(" · ") || "—"}
                />

                <SubmittedItem
                  icon={Clock3}
                  label="Experience"
                  value={`${Number(tutor.experienceYears || 0)} ${Number(tutor.experienceYears || 0) === 1 ? "year" : "years"}`}
                />

                <SubmittedItem
                  icon={ShieldCheck}
                  label="Lesson price"
                  value={`${tutor.currency || "USD"} ${Number(tutor.price || 0).toFixed(2)}`}
                />
              </div>

              {specializations.length > 0 && (
                <SubmittedList
                  label="Specializations"
                  items={specializations}
                />
              )}

              {languages.length > 0 && (
                <SubmittedList label="Languages" items={languages} />
              )}

              {tutor.bio && (
                <div className="tutor-submitted-bio">
                  <span>ABOUT YOU</span>
                  <p>{tutor.bio}</p>
                </div>
              )}
            </motion.div>
          )}
        </motion.section>
      </div>
    </main>
  );
}

function StatusIcon({ type, children }) {
  return <div className={`tutor-application-icon ${type}`}>{children}</div>;
}

function ApplicationSummary({
  applicationId,
  submittedAt,
  profileVisibility,
  bookingStatus,
}) {
  return (
    <div className="tutor-application-summary">
      <div>
        <span>Application ID</span>
        <strong>{applicationId}</strong>
      </div>

      <div>
        <span>Submitted</span>
        <strong>{formatDate(submittedAt)}</strong>
      </div>

      <div>
        <span>Profile visibility</span>
        <strong>{profileVisibility}</strong>
      </div>

      <div>
        <span>Bookings</span>
        <strong>{bookingStatus}</strong>
      </div>
    </div>
  );
}

function ReviewStep({ icon: Icon, title, description, active, complete }) {
  return (
    <div
      className={`tutor-review-step ${active ? "active" : ""} ${complete ? "complete" : ""
        }`}
    >
      <div>
        <Icon size={15} />
      </div>

      <section>
        <strong>{title}</strong>
        <span>{description}</span>
      </section>
    </div>
  );
}

function SubmittedItem({ icon: Icon, label, value }) {
  return (
    <div className="tutor-submitted-item">
      <span>
        <Icon size={14} />
      </span>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SubmittedList({ label, items }) {
  return (
    <div className="tutor-submitted-list">
      <span>{label}</span>

      <div>
        {items.map((item) => (
          <small key={item}>{item}</small>
        ))}
      </div>
    </div>
  );
}

export default TutorApplicationStatus;
