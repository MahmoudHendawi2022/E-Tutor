import React from "react";
import "./Badge.css";

export default function Badge({
  children,
  variant = "info",
  className = "",
  ...props
}) {
  return (
    <span className={`etutor-badge etutor-badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
}
