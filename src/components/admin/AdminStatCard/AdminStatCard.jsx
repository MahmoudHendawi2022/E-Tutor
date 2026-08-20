/**
 * AdminStatCard
 *
 * Unifies two repeated local component patterns:
 *
 *   1. `Stat` (AdminDashboard, AdminFinance)
 *      → article.admin-stat  with icon, label, large value, and a note line
 *
 *   2. `Metric` (AdminReports, AdminTutorDetails, AdminStudentDetails)
 *      → article.admin-stat-card  with just a label + value (compact)
 *
 * Use `variant="stat"` (default) for the icon card,
 * or  `variant="metric"` for the compact label/value card.
 */
export default function AdminStatCard({
  icon: Icon,
  label,
  value,
  note,
  variant = "stat",
}) {
  if (variant === "metric") {
    return (
      <article className="admin-stat-card">
        <span>{label}</span>
        <strong>{value}</strong>
      </article>
    );
  }

  return (
    <article className="admin-stat">
      <div className="admin-stat-top">
        <span>{label}</span>
        {Icon && <Icon size={16} />}
      </div>
      <h2>{value}</h2>
      {note && <p>{note}</p>}
    </article>
  );
}
