/**
 * AdminPageHeader
 *
 * The standard top-of-page header used in all 12 admin pages.
 *
 * Structure:
 *   <div class="admin-page-head">
 *     <div>
 *       <span>{eyebrow}</span>
 *       <h1>{title}</h1>
 *       <p>{description}</p>
 *     </div>
 *     {children}   ← action buttons go here
 *   </div>
 */
export default function AdminPageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="admin-page-head">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
