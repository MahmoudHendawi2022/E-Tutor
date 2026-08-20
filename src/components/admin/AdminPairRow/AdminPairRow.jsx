/**
 * AdminPairRow
 *
 * The label/value row used inside AdminInfoSection.
 * Was defined as local `Pair` / `Item` in AdminTutorDetails,
 * AdminStudentDetails, and AdminTutorApplications.
 *
 * Props:
 *   label   — the muted label text
 *   value   — the value (string, number, or ReactNode)
 *   wide    — if true, spans full grid width (gridColumn: "1 / -1")
 *
 * For document links, pass the link as `value` directly (ReactNode).
 */
export default function AdminPairRow({ label, value, wide = false }) {
  return (
    <div
      className="admin-pair"
      style={wide ? { gridColumn: "1 / -1" } : undefined}
    >
      <span>{label}</span>
      {typeof value === "object" && value !== null ? (
        value
      ) : (
        <strong>{value ?? "—"}</strong>
      )}
    </div>
  );
}
