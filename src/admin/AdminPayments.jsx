import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useTutors } from "../context/TutorsContext";
import { usePayments } from "../context/PaymentsContext";
import { formatDateTime, money } from "./adminUtils";
import "./adminPages.css";

function AdminPayments() {
  const { getAccountById } = useAuth();
  const { getTutorById } = useTutors();
  const { payments, markPaymentPaid, refundPayment, holdPaymentPayout, unholdPaymentPayout } = usePayments();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...payments]
      .filter((payment) => status === "all" || payment.paymentStatus === status)
      .filter((payment) => {
        if (!q) return true;
        const tutor = getTutorById(payment.tutorId);
        const student = getAccountById(payment.studentId);
        return [payment.id, payment.bookingId, tutor?.name, student?.fullName].some((value) => String(value || "").toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [payments, search, status, getTutorById, getAccountById]);

  const refund = (payment) => {
    if (["pending", "paid"].includes(payment.payoutStatus)) {
      window.alert("This payment is already inside a payout batch. Handle/reverse the payout before refunding it.");
      return;
    }
    const remaining = Number(payment.grossAmount) - Number(payment.refundAmount || 0);
    const value = window.prompt(`Refund amount. Maximum ${remaining} ${payment.currency}:`, String(remaining));
    if (value === null) return;
    refundPayment(payment.id, Number(value));
  };

  return (
    <main className="admin-page">
      <div className="admin-page-head"><div><span>TRANSACTIONS</span><h1>Payments</h1><p>Payment state, held funds, refunds, commission snapshots and tutor payout eligibility.</p></div></div>
      <div className="admin-toolbar">
        <div className="admin-search"><Search size={14}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payment, booking, student or tutor..." /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All payment statuses</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="partially_refunded">Partially refunded</option><option value="refunded">Refunded</option></select>
      </div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Payment</th><th>Booking</th><th>Student</th><th>Tutor</th><th>Gross</th><th>Refund</th><th>Platform fee</th><th>Tutor earning</th><th>Payment</th><th>Funds</th><th>Payout</th><th>Created</th><th>Actions</th></tr></thead><tbody>
        {rows.map((payment) => {
          const tutor = getTutorById(payment.tutorId);
          const student = getAccountById(payment.studentId);
          return <tr key={payment.id}>
            <td><strong>{payment.id}</strong></td><td>{payment.bookingId}</td><td>{student?.fullName || payment.studentId}</td><td>{tutor?.name || payment.tutorId}</td>
            <td>{money(payment.grossAmount, payment.currency)}</td><td>{money(payment.refundAmount, payment.currency)}</td><td>{money(payment.platformFeeAmount, payment.currency)} ({payment.platformFeeRate}%)</td><td>{money(payment.tutorEarningAmount, payment.currency)}</td>
            <td><span className={`admin-badge ${payment.paymentStatus}`}>{payment.paymentStatus}</span></td><td><span className={`admin-badge ${payment.fundStatus}`}>{payment.fundStatus}</span></td><td><span className={`admin-badge ${payment.payoutStatus}`}>{payment.payoutStatus}</span></td><td>{formatDateTime(payment.createdAt)}</td>
            <td><div style={{display:"flex",gap:4}}>{payment.paymentStatus === "pending" && <button className="admin-button success" onClick={() => markPaymentPaid(payment.id)}>Mark paid</button>}{["paid","partially_refunded"].includes(payment.paymentStatus) && <button className="admin-button danger" onClick={() => refund(payment)}>Refund</button>}{payment.payoutStatus === "available" && <button className="admin-button warning" onClick={() => holdPaymentPayout(payment.id)}>Hold payout</button>}{payment.payoutStatus === "held" && <button className="admin-button success" onClick={() => unholdPaymentPayout(payment.id)}>Release hold</button>}</div></td>
          </tr>;
        })}
      </tbody></table></div>
    </main>
  );
}

export default AdminPayments;
