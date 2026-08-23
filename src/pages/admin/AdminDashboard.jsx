import {
  BookOpenCheck,
  CircleDollarSign,
  Clock3,
  GraduationCap,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";
import { useLessons } from "../../context/LessonsContext";
import { usePayments } from "../../context/PaymentsContext";
import { usePlatformSettings } from "../../context/PlatformSettingsContext";
import { AdminPageHeader, AdminStatCard, AdminStatusBadge } from "../../components/admin";
import { completedHours, formatDateTime, money } from "./adminUtils";
import "./adminPages.css";

function AdminDashboard() {
  const { accounts } = useAuth();
  const { tutors, tutorApplications } = useTutors();
  const { lessons } = useLessons();
  const { payments, financialSummary } = usePayments();
  const { settings } = usePlatformSettings();
  const currency = settings.defaultCurrency || "USD";

  const students = accounts.filter((account) => account.role === "student");
  const approvedTutors = tutors.filter((tutor) => tutor.status === "approved");
  const completedLessons = lessons.filter((lesson) => lesson.status === "completed");
  const upcomingLessons = lessons.filter((lesson) => lesson.status === "upcoming");
  const hours = completedHours(lessons);
  const latestPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="PLATFORM OVERVIEW"
        title="Administration dashboard"
        description="Live operational, tutor, student, lesson and finance data from the current frontend demo."
      />

      <div className="admin-stats">
        <AdminStatCard icon={Users} label="Students" value={students.length} note="Registered student accounts" />
        <AdminStatCard icon={GraduationCap} label="Approved tutors" value={approvedTutors.length} note={`${tutorApplications.filter((item) => item.status === "pending_review").length} pending review`} />
        <AdminStatCard icon={BookOpenCheck} label="Completed lessons" value={completedLessons.length} note={`${hours} completed teaching hours`} />
        <AdminStatCard icon={Clock3} label="Upcoming lessons" value={upcomingLessons.length} note={`${lessons.length} total lesson records`} />
      </div>

      <div className="admin-stats">
        <AdminStatCard icon={CircleDollarSign} label="Gross booking value" value={money(financialSummary.grossBookings, currency)} note="Before refunds" />
        <AdminStatCard icon={CircleDollarSign} label="Net collected" value={money(financialSummary.netCollected, currency)} note={`${money(financialSummary.refunded, currency)} refunded`} />
        <AdminStatCard icon={CircleDollarSign} label="Platform revenue" value={money(financialSummary.platformRevenue, currency)} note="Commission after refunds" />
        <AdminStatCard icon={WalletCards} label="Tutor earnings" value={money(financialSummary.tutorEarnings, currency)} note={`${money(financialSummary.pendingPayouts, currency)} pending payout`} />
      </div>

      <div className="admin-grid-two">
        <section className="admin-panel">
          <div className="admin-panel-head"><div><h2>Latest payments</h2><p>Newest payment records and their fund status.</p></div></div>
          {latestPayments.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Payment</th><th>Booking</th><th>Amount</th><th>Payment</th><th>Funds</th><th>Created</th></tr></thead>
                <tbody>
                  {latestPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td><strong>{payment.id}</strong></td>
                      <td>{payment.bookingId}</td>
                      <td>{money(payment.grossAmount, payment.currency)}</td>
                      <td><AdminStatusBadge status={payment.paymentStatus} /></td>
                      <td><AdminStatusBadge status={payment.fundStatus} /></td>
                      <td>{formatDateTime(payment.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="admin-empty">No payment transactions yet.</div>}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head"><div><h2>Review queue</h2><p>Tutor applications that need admin attention.</p></div><ShieldCheck size={17} /></div>
          <div className="admin-list">
            {tutorApplications.filter((item) => item.status === "pending_review").slice(0, 8).map((tutor) => (
              <div className="admin-list-row" key={tutor.id}>
                <div><strong>{tutor.name}</strong><span>{tutor.primarySubject || "No subject"} · {tutor.country || "No country"}</span></div>
                <AdminStatusBadge status="pending_review" label="pending" />
              </div>
            ))}
            {!tutorApplications.some((item) => item.status === "pending_review") && <div className="admin-empty">No pending tutor applications.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
