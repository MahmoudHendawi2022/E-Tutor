import React from "react";
import "./FormError.css";

export default function FormError({ children, className = "", ...props }) {
  if (!children) return null;

  return (
    <span className={`etutor-form-error ${className}`} {...props}>
      {children}
    </span>
  );
}
