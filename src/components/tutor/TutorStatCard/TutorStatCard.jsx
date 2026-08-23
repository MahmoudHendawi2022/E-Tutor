/**
 * TutorStatCard
 *
 * A reusable statistics card for Tutor pages that preserves visual styling
 * and CSS selector bindings.
 */
export default function TutorStatCard({
  icon: Icon,
  label,
  value,
  className = "",
  iconClassName = "",
  iconElement: IconElement = "div",
  labelElement: LabelElement = "span",
}) {
  return (
    <div className={className}>
      {Icon && (
        IconElement === "none" ? (
          <Icon size={17} />
        ) : (
          <IconElement className={iconClassName || undefined}>
            <Icon size={17} />
          </IconElement>
        )
      )}
      <section>
        <LabelElement>{label}</LabelElement>
        <strong>{value}</strong>
      </section>
    </div>
  );
}
