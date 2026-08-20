import { useMemo } from "react";
import { Download, FileSpreadsheet } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";
import { useLessons } from "../../context/LessonsContext";
import { usePayments } from "../../context/PaymentsContext";
import { usePlatformSettings } from "../../context/PlatformSettingsContext";
import { completedHours, currencyTotalsText, downloadCsv, money } from "./adminUtils";
import "./adminPages.css";

function AdminReports() {
  const { accounts } = useAuth();
  const { tutors } = useTutors();
  const { lessons } = useLessons();
  const { payments, payouts, financialSummary, getTutorFinanceByCurrency, getStudentFinanceByCurrency } = usePayments();
  const { settings } = usePlatformSettings();
  const currency = settings.defaultCurrency || "USD";

  const studentAccounts = useMemo(
    () => accounts.filter((account) => account.role === "student"),
    [accounts],
  );

  const exports = [
    {
      title: "Tutors report",
      description: "Tutor status, subjects, teaching hours, sales and earnings.",
      action: () =>
        downloadCsv(
          "etutor-tutors-report.csv",
          tutors.map((tutor) => {
            const tutorLessons = lessons.filter(
              (lesson) => Number(lesson.tutorId) === Number(tutor.id),
            );
            const finance = getTutorFinanceByCurrency(tutor.id);
            return {
              tutor_id: tutor.id,
              name: tutor.name,
              status: tutor.status,
              subject: tutor.primarySubject || tutor.subject,
              specializations: (tutor.specializations || []).join(" | "),
              country: tutor.country,
              city: tutor.city,
              university: tutor.university,
              experience_years: tutor.experienceYears,
              completed_lessons: tutorLessons.filter((lesson) => lesson.status === "completed").length,
              completed_hours: completedHours(tutorLessons),
              gross_sales: currencyTotalsText(finance, "gross"),
              refunded: currencyTotalsText(finance, "refunded"),
              tutor_earnings: currencyTotalsText(finance, "tutorEarnings"),
              platform_commission: currencyTotalsText(finance, "platformCommission"),
              available_payout: currencyTotalsText(finance, "available"),
              pending_payout: currencyTotalsText(finance, "pending"),
              paid_out: currencyTotalsText(finance, "paidOut"),
            };
          }),
        ),
    },
    {
      title: "Students report",
      description: "Student accounts, lesson usage, hours, spend and refunds.",
      action: () =>
        downloadCsv(
          "etutor-students-report.csv",
          studentAccounts.map((student) => {
            const studentLessons = lessons.filter(
              (lesson) => Number(lesson.studentId) === Number(student.id),
            );
            const studentFinance = getStudentFinanceByCurrency(student.id);
            return {
              student_id: student.id,
              name: student.fullName,
              email: student.email,
              country: student.country,
              status: student.status,
              tutors_used: new Set(studentLessons.map((lesson) => lesson.tutorId)).size,
              bookings: studentLessons.length,
              completed_lessons: studentLessons.filter((lesson) => lesson.status === "completed").length,
              completed_hours: completedHours(studentLessons),
              net_spend: currencyTotalsText(studentFinance, "netSpend"),
              refunded: currencyTotalsText(studentFinance, "refunded"),
            };
          }),
        ),
    },
    {
      title: "Lessons & bookings report",
      description: "Every booking with student, tutor, schedule, status and amount.",
      action: () =>
        downloadCsv(
          "etutor-lessons-report.csv",
          lessons.map((lesson) => ({
            lesson_id: lesson.id,
            booking_id: lesson.bookingId,
            student_id: lesson.studentId,
            tutor_id: lesson.tutorId,
            subject: lesson.subject,
            date: lesson.date,
            time: lesson.time,
            duration_minutes: lesson.duration,
            status: lesson.status,
            price: lesson.price,
            completed_at: lesson.completedAt,
            cancelled_at: lesson.cancelledAt,
            created_at: lesson.createdAt,
          })),
        ),
    },
    {
      title: "Payments report",
      description: "Payment, refund, fund release and payout status ledger.",
      action: () =>
        downloadCsv(
          "etutor-payments-report.csv",
          payments.map((payment) => ({
            payment_id: payment.id,
            booking_id: payment.bookingId,
            lesson_id: payment.lessonId,
            student_id: payment.studentId,
            tutor_id: payment.tutorId,
            currency: payment.currency,
            gross_amount: payment.grossAmount,
            refund_amount: payment.refundAmount,
            platform_fee_rate: payment.platformFeeRate,
            platform_fee_amount: payment.platformFeeAmount,
            tutor_earning_amount: payment.tutorEarningAmount,
            method: payment.method,
            payment_status: payment.paymentStatus,
            fund_status: payment.fundStatus,
            payout_status: payment.payoutStatus,
            paid_at: payment.paidAt,
            released_at: payment.releasedAt,
            created_at: payment.createdAt,
          })),
        ),
    },
    {
      title: "Payouts report",
      description: "Tutor payout batches and settlement status.",
      action: () => downloadCsv("etutor-payouts-report.csv", payouts),
    },
  ];

  return (
    <main className="admin-page">
      <div className="admin-page-head">
        <div>
          <span>REPORTING</span>
          <h1>Reports & exports</h1>
          <p>Export operational and financial data derived from the current platform records.</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <Metric label="Students" value={studentAccounts.length} />
        <Metric label="Tutors" value={tutors.length} />
        <Metric label="Completed hours" value={completedHours(lessons)} />
        <Metric label="Net collected" value={money(financialSummary.netCollected, currency)} />
        <Metric label="Platform revenue" value={money(financialSummary.platformRevenue, currency)} />
        <Metric label="Refunded" value={money(financialSummary.refunded, currency)} />
      </div>

      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <h2>CSV exports</h2>
            <p>Download the current frontend-demo records for review or analysis.</p>
          </div>
        </div>

        <div className="admin-report-grid">
          {exports.map((item) => (
            <article className="admin-report-card" key={item.title}>
              <div className="admin-report-icon"><FileSpreadsheet size={18} /></div>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
              <button className="admin-button secondary" type="button" onClick={item.action}>
                <Download size={13} /> Export CSV
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <article className="admin-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default AdminReports;
