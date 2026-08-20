import { CircleDollarSign, RotateCcw, WalletCards } from "lucide-react";

import { useTutors } from "../../context/TutorsContext";
import { usePayments } from "../../context/PaymentsContext";
import { usePlatformSettings } from "../../context/PlatformSettingsContext";
import { currencyTotalsText, money } from "./adminUtils";
import "./adminPages.css";

function AdminFinance() {
  const { tutors } = useTutors();
  const { financialSummary, financialByCurrency, getTutorFinanceByCurrency } = usePayments();
  const { settings } = usePlatformSettings();
  const currency = settings.defaultCurrency || "USD";
  const activeTutors = tutors.filter((tutor) => ["approved", "suspended"].includes(tutor.status));

  return (
    <main className="admin-page">
      <div className="admin-page-head"><div><span>FINANCIAL CONTROL</span><h1>Finance</h1><p>Gross sales, refunds, net collections, platform commission, tutor earnings and payouts.</p></div></div>
      <div className="admin-stats">
        <Stat icon={CircleDollarSign} label="Gross bookings" value={money(financialSummary.grossBookings, currency)} note="All paid booking value before refunds" />
        <Stat icon={RotateCcw} label="Refunded" value={money(financialSummary.refunded, currency)} note="Full and partial refunds" />
        <Stat icon={CircleDollarSign} label="Net collected" value={money(financialSummary.netCollected, currency)} note="Gross minus refunds" />
        <Stat icon={CircleDollarSign} label="Platform revenue" value={money(financialSummary.platformRevenue, currency)} note="Commission after refund adjustments" />
      </div>
      <div className="admin-stats">
        <Stat icon={WalletCards} label="Tutor earnings" value={money(financialSummary.tutorEarnings, currency)} note="Net tutor entitlement" />
        <Stat icon={WalletCards} label="Pending payouts" value={money(financialSummary.pendingPayouts, currency)} note="Created but not paid" />
        <Stat icon={WalletCards} label="Paid payouts" value={money(financialSummary.paidPayouts, currency)} note="Transferred to tutors" />
        <Stat icon={CircleDollarSign} label="Platform margin" value={financialSummary.netCollected ? `${((financialSummary.platformRevenue / financialSummary.netCollected) * 100).toFixed(1)}%` : "0%"} note="Revenue / net collected" />
      </div>
      <section className="admin-panel">
        <div className="admin-panel-head"><div><h2>Currency breakdown</h2><p>Currencies are never added together without a real FX conversion service.</p></div></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Currency</th><th>Gross</th><th>Refunded</th><th>Net collected</th><th>Platform revenue</th><th>Tutor earnings</th><th>Pending payouts</th><th>Paid payouts</th></tr></thead><tbody>
          {Object.values(financialByCurrency).map((item) => <tr key={item.currency}><td><strong>{item.currency}</strong></td><td>{money(item.grossBookings, item.currency)}</td><td>{money(item.refunded, item.currency)}</td><td>{money(item.netCollected, item.currency)}</td><td>{money(item.platformRevenue, item.currency)}</td><td>{money(item.tutorEarnings, item.currency)}</td><td>{money(item.pendingPayouts, item.currency)}</td><td>{money(item.paidPayouts, item.currency)}</td></tr>)}
        </tbody></table></div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head"><div><h2>Tutor financial breakdown</h2><p>Per-tutor gross volume, earnings, commission, available balance and payouts.</p></div></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Tutor</th><th>Gross</th><th>Refunded</th><th>Tutor earnings</th><th>Platform commission</th><th>Available</th><th>Pending payout</th><th>Paid out</th></tr></thead><tbody>
          {activeTutors.map((tutor) => { const finance = getTutorFinanceByCurrency(tutor.id); return <tr key={tutor.id}><td><strong>{tutor.name}</strong></td><td>{currencyTotalsText(finance, "gross")}</td><td>{currencyTotalsText(finance, "refunded")}</td><td>{currencyTotalsText(finance, "tutorEarnings")}</td><td>{currencyTotalsText(finance, "platformCommission")}</td><td>{currencyTotalsText(finance, "available")}</td><td>{currencyTotalsText(finance, "pending")}</td><td>{currencyTotalsText(finance, "paidOut")}</td></tr>; })}
        </tbody></table></div>
      </section>
    </main>
  );
}

function Stat({ icon: Icon, label, value, note }) { return <article className="admin-stat"><div className="admin-stat-top"><span>{label}</span><Icon size={16}/></div><h2>{value}</h2><p>{note}</p></article>; }
export default AdminFinance;
