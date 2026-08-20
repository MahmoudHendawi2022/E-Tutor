/**
 * AdminInfoSection
 *
 * The icon + title card used in AdminTutorDetails and AdminStudentDetails.
 * Identical code was copy-pasted as a local `InfoSection` function in both files.
 *
 * Structure:
 *   <section class="admin-info-card">
 *     <div class="admin-info-card-head">
 *       <Icon /> <strong>{title}</strong>
 *     </div>
 *     {children}
 *   </section>
 */
export default function AdminInfoSection({ icon: Icon, title, children }) {
  return (
    <section className="admin-info-card">
      <div className="admin-info-card-head">
        {Icon && <Icon size={15} />}
        <strong>{title}</strong>
      </div>
      <div>{children}</div>
    </section>
  );
}
