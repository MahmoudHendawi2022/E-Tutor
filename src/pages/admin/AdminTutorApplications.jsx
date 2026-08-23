import { useMemo, useState } from "react";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";
import { AdminPageHeader, AdminToolbar, AdminStatusBadge } from "../../components/admin";
import { formatDateTime } from "./adminUtils";
import "./adminPages.css";

function AdminTutorApplications() {
  const { updateAccount, getAccountById } = useAuth();
  const {
    tutorApplications,
    pendingProfileChanges,
    approveTutor,
    requestTutorChanges,
    rejectTutor,
    approveTutorChanges,
    rejectTutorChanges,
  } = useTutors();

  const [mode, setMode] = useState("applications");
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  const source = mode === "changes" ? pendingProfileChanges : tutorApplications;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return source.filter((tutor) => !q || [tutor.name, tutor.primarySubject, getAccountById(tutor.userId)?.email, tutor.country, tutor.university].some((value) => String(value || "").toLowerCase().includes(q)));
  }, [source, search, getAccountById]);
  const selected = source.find((tutor) => Number(tutor.id) === Number(selectedId)) || filtered[0] || null;
  const details = selected?.pendingChanges && mode === "changes" ? { ...selected, ...selected.pendingChanges } : selected;
  const account = selected?.userId ? getAccountById(selected.userId) : null;

  const approveApplication = () => {
    if (!selected) return;
    approveTutor(selected.id);
    if (selected.userId) updateAccount(selected.userId, { approvalStatus: "approved", profileCompleted: true, tutorId: selected.id });
    setReviewNote("");
  };

  const requestChanges = () => {
    if (!selected || !reviewNote.trim()) return;
    requestTutorChanges(selected.id, reviewNote.trim());
    if (selected.userId) updateAccount(selected.userId, { approvalStatus: "needs_changes" });
    setReviewNote("");
  };

  const rejectApplication = () => {
    if (!selected || !reviewNote.trim()) return;
    rejectTutor(selected.id, reviewNote.trim());
    if (selected.userId) updateAccount(selected.userId, { approvalStatus: "rejected" });
    setReviewNote("");
  };

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="TUTOR QUALITY CONTROL"
        title="Tutor review center"
        description="Every new tutor and sensitive profile update stays private until admin approval."
      />

      <div className="admin-master-tabs">
        <button className={mode === "applications" ? "active" : ""} onClick={() => { setMode("applications"); setSelectedId(null); }}>Applications ({tutorApplications.length})</button>
        <button className={mode === "changes" ? "active" : ""} onClick={() => { setMode("changes"); setSelectedId(null); }}>Profile changes ({pendingProfileChanges.length})</button>
      </div>

      <AdminToolbar
        search={search}
        onSearch={(e) => setSearch(e.target.value)}
        placeholder="Search name, subject, country or university..."
      />

      {!details ? <div className="admin-empty">No tutor applications in this queue.</div> : (
        <div className="admin-detail">
          <aside className="admin-profile-card">
            <div className="admin-profile-image">{details.image && <img src={details.image} alt={details.name} />}</div>
            <h2>{details.name}</h2><p>{details.title}</p><p>{details.headline}</p>
            <div style={{ marginTop: 10 }}>
              <AdminStatusBadge
                status={selected.status}
                label={mode === "changes" ? selected.profileUpdateStatus : selected.status}
              />
            </div>
            <div className="admin-list" style={{ marginTop: 12 }}>
              {filtered.map((item) => (
                <button key={item.id} className="admin-button" style={{ justifyContent: "flex-start", marginBottom: 5 }} onClick={() => setSelectedId(item.id)}>{item.name}</button>
              ))}
            </div>
          </aside>

          <div>
            <DetailSection title="Application identity">
              <Item label="Tutor ID" value={selected.id} /><Item label="User ID" value={selected.userId || "—"} />
              <Item label="Email" value={account?.email || "—"} /><Item label="Phone" value={account?.phone || "—"} />
              <Item label="Submitted" value={formatDateTime(selected.submittedAt || selected.updatedAt)} /><Item label="Status" value={selected.status} />
            </DetailSection>
            <DetailSection title="Teaching profile">
              <Item label="Main subject" value={details.primarySubject || details.subject} /><Item label="Experience" value={`${details.experienceYears || 0} years`} />
              <Item label="Price" value={`${details.price || 0} ${details.currency || "USD"}/hour`} /><Item label="Trial lesson" value={details.trialLesson ? `Yes · ${details.trialPrice} ${details.currency}` : "No"} />
              <Wide label="Specializations"><Tags values={details.specializations} /></Wide>
              <Wide label="Student levels"><Tags values={details.teachingLevels} /></Wide>
            </DetailSection>
            <DetailSection title="Education & location">
              <Item label="Country" value={details.country} /><Item label="City" value={details.city} />
              <Item label="University" value={details.university} /><Item label="Degree" value={details.degree} />
              <Item label="Field of study" value={details.fieldOfStudy || "—"} /><Item label="Graduation year" value={details.graduationYear || "—"} />
              <Wide label="Languages"><Tags values={(details.languages || []).map((item) => `${item.language} · ${item.level}`)} /></Wide>
            </DetailSection>
            <DetailSection title="Private verification documents">
              <DocumentItem label="Identity document" document={details.identityDocument} />
              <DocumentItem label="Degree / qualification proof" document={details.qualificationDocument} />
            </DetailSection>
            <section className="admin-detail-section"><h3>About the tutor</h3><p style={{ margin: 0, color: "#475569", fontSize: 8, lineHeight: 1.8 }}>{details.bio || "No bio."}</p></section>

            <div className="admin-review-box">
              <div className="admin-field"><label>Admin review note / rejection reason</label><textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Required when requesting changes or rejecting..." /></div>
              <div className="admin-review-actions">
                {mode === "applications" ? (
                  <>
                    <button className="admin-button success" onClick={approveApplication}><CheckCircle2 size={14} />Approve tutor</button>
                    <button className="admin-button warning" disabled={!reviewNote.trim()} onClick={requestChanges}><ShieldAlert size={14} />Request changes</button>
                    <button className="admin-button danger" disabled={!reviewNote.trim()} onClick={rejectApplication}><XCircle size={14} />Reject</button>
                  </>
                ) : (
                  <>
                    <button className="admin-button success" onClick={() => approveTutorChanges(selected.id)}><CheckCircle2 size={14} />Approve profile changes</button>
                    <button className="admin-button danger" disabled={!reviewNote.trim()} onClick={() => rejectTutorChanges(selected.id, reviewNote.trim())}><XCircle size={14} />Reject changes</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function DetailSection({ title, children }) { return <section className="admin-detail-section"><h3>{title}</h3><div className="admin-detail-grid">{children}</div></section>; }
function Item({ label, value }) { return <div className="admin-detail-item"><span>{label}</span><strong>{value || "—"}</strong></div>; }
function Wide({ label, children }) { return <div className="admin-detail-item" style={{ gridColumn: "1 / -1" }}><span>{label}</span>{children}</div>; }
function Tags({ values = [] }) { return <div className="admin-tags">{values.length ? values.map((value) => <span key={String(value)}>{value}</span>) : <span>None</span>}</div>; }
function DocumentItem({ label, document }) { return <div className="admin-detail-item"><span>{label}</span>{document?.dataUrl ? <a className="admin-document-link" href={document.dataUrl} target="_blank" rel="noreferrer">View {document.name || "document"}</a> : <strong>Not uploaded</strong>}</div>; }

export default AdminTutorApplications;
