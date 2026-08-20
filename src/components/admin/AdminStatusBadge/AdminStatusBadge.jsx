/**
 * AdminStatusBadge
 *
 * Renders the admin-badge status pill used across all admin pages.
 * The `status` prop maps directly to the CSS modifier class.
 *
 * Supported statuses (match existing adminPages.css):
 *   approved, pending_review, needs_changes, rejected, suspended,
 *   active, disabled, upcoming, completed, cancelled,
 *   paid, pending, partially_refunded, refunded,
 *   available, held, released
 */
export default function AdminStatusBadge({ status, label, className = "" }) {
  const display = label ?? status ?? "—";
  return (
    <span className={`admin-badge ${status ?? ""} ${className}`.trim()}>
      {display}
    </span>
  );
}
