import { motion } from "motion/react";

/**
 * TutorPageHeader
 *
 * A reusable page header for Tutor pages that preserves structure,
 * support for motion animation properties, and custom class names.
 */
export default function TutorPageHeader({
  eyebrow,
  title,
  description,
  children,
  className = "",
  ...props
}) {
  return (
    <motion.div className={className} {...props}>
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        {title && <h1>{title}</h1>}
        {description && <p>{description}</p>}
      </div>
      {children}
    </motion.div>
  );
}
