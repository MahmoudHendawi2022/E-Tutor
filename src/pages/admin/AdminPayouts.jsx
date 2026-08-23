import { useMemo } from "react";

import { useTutors } from "../../context/TutorsContext";
import { usePayments } from "../../context/PaymentsContext";
import { AdminPageHeader, AdminStatusBadge } from "../../components/admin";
import { formatDateTime, money } from "./adminUtils";
import "./adminPages.css";

function AdminPayouts() {
  const { tutors, getTutorById } = useTutors();
  const {
    payouts,
    getTutorFinanceByCurrency,
    createTutorPayout,
    markPayoutPaid,
  } = usePayments();

  const balanceRows = useMemo(() => {
    return tutors
      .filter((tutor) => ["approved", "suspended"].includes(tutor.status))
      .flatMap((tutor) => {
        const byCurrency = getTutorFinanceByCurrency(tutor.id);
        const rows = Object.values(byCurrency);

        if (!rows.length) {
          return [
            {
              tutor,
              currency: tutor.currency || "USD",
              available: 0,
              pending: 0,
              paidOut: 0,
            },
          ];
        }

        return rows.map((finance) => ({
          tutor,
          ...finance,
        }));
      });
  }, [tutors, getTutorFinanceByCurrency]);

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="TUTOR SETTLEMENTS"
        title="Payouts"
        description="Create payouts only from released earnings after completed lessons. Each currency is settled separately."
      />

      <section className="admin-panel" style={{ marginBottom: 12 }}>
        <div className="admin-panel-head">
          <div>
            <h2>Available tutor balances</h2>
            <p>
              Payments become available only after the lesson is manually marked
              completed by the tutor.
            </p>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tutor</th>
                <th>Currency</th>
                <th>Available</th>
                <th>Pending</th>
                <th>Paid out</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {balanceRows.map((row) => (
                <tr key={`${row.tutor.id}-${row.currency}`}>
                  <td>
                    <strong>{row.tutor.name}</strong>
                  </td>

                  <td>{row.currency}</td>

                  <td>{money(row.available, row.currency)}</td>

                  <td>{money(row.pending, row.currency)}</td>

                  <td>{money(row.paidOut, row.currency)}</td>

                  <td>
                    <button
                      className="admin-button primary"
                      type="button"
                      disabled={Number(row.available || 0) <= 0}
                      onClick={() => {
                        const result = createTutorPayout(
                          row.tutor.id,
                          null,
                          row.currency,
                        );

                        if (!result.success) {
                          window.alert(result.message);
                        }
                      }}
                    >
                      Create payout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Payout history</h2>
            <p>Pending and completed tutor transfers.</p>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Payout</th>
                <th>Tutor</th>
                <th>Amount</th>
                <th>Payments</th>
                <th>Status</th>
                <th>Created</th>
                <th>Paid</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {payouts.map((payout) => {
                const tutor = getTutorById(payout.tutorId);

                return (
                  <tr key={payout.id}>
                    <td>
                      <strong>{payout.id}</strong>
                    </td>

                    <td>{tutor?.name || payout.tutorId}</td>

                    <td>{money(payout.amount, payout.currency)}</td>

                    <td>{payout.paymentIds.length}</td>

                    <td>
                      <AdminStatusBadge status={payout.status} />
                    </td>

                    <td>{formatDateTime(payout.createdAt)}</td>

                    <td>{formatDateTime(payout.paidAt)}</td>

                    <td>
                      {payout.status === "pending" ? (
                        <button
                          className="admin-button success"
                          type="button"
                          onClick={() => markPayoutPaid(payout.id)}
                        >
                          Mark paid
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default AdminPayouts;
