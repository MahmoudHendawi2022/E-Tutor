/**
 * TutorEmptyState
 *
 * A reusable empty state wrapper for Tutor pages that preserves markup
 * structure and existing stylesheet bindings.
 */
export default function TutorEmptyState({
  icon: Icon,
  title,
  description,
  className = "",
  iconSize = 24,
}) {
  return (
    <div className={className}>
      {Icon && <Icon size={iconSize} />}
      {title && <strong>{title}</strong>}
      {description && <span>{description}</span>}
    </div>
  );
}
